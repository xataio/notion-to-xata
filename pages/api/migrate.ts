import { NextApiHandler } from "next";
import fetch from "isomorphic-fetch";
import { kebab } from "case";

import { getProtocol } from "../../util/getProtocol";

export type MigrateRequestBody = {
  from: { id: string; name: string };
  to: { workspaceId: string; apiKey: string };
};

const region = "us-west-2"; // TODO add dropdown to choose the region

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    res.end("No.");
    return;
  }

  try {
    const { from, to }: MigrateRequestBody = req.body;

    console.info("Starting migration...");
    console.info("Getting Notion DB with ID...", from.id);
    const { users, columns, rows } = await fetch(
      `${getProtocol()}${req.headers.host}/api/notion/get-db?id=${from.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie,
        },
      }
    ).then(async (r) => {
      if (!r.ok) {
        throw await r.json();
      }
      return r.json();
    });

    let xataUsers = users;

    const targetDbName = kebab(from.name);

    console.info(
      `Checking if there's an identically named database (${targetDbName}) in Xata...`
    );
    // Get same name database in Xata
    const doesXataDatabaseWithSameNameExist = await fetch(
      `https://api.xata.io/workspaces/${to.workspaceId}/dbs/${targetDbName}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${to.apiKey}`,
        },
      }
    ).then((r) => {
      return r.status !== 404;
    });

    console.info(
      !doesXataDatabaseWithSameNameExist
        ? "No name collisions."
        : "Existing name found. Suffixed."
    );

    const adjustedDbName = (
      doesXataDatabaseWithSameNameExist
        ? `${targetDbName}-${Date.now()}`
        : targetDbName
    ).replace("’", "");

    console.info(`Creating database ${adjustedDbName} in Xata...`);

    // Create a database in Xata
    const { databaseName } = await fetch(
      `https://api.xata.io/workspaces/${to.workspaceId}/dbs/${adjustedDbName}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${to.apiKey}`,
        },
        body: JSON.stringify({
          region,
          branchName: "main",
        }),
      }
    ).then(async (r) => {
      if (!r.ok) {
        throw await r.json();
      }
      return r.json();
    });

    console.info("Created", databaseName);
    console.info("Checking for users...");

    // Do we have users?
    if (users.length) {
      console.info("We've got users. Inserting...");

      // Create a users table
      await fetch(
        `https://${to.workspaceId}.${region}.xata.sh/db/${databaseName}:main/tables/users`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${to.apiKey}`,
          },
        }
      ).then(async (r) => {
        if (!r.ok) {
          throw await r.json();
        }
        return r.text();
      });

      // Add a schema to it
      await fetch(
        `https://${to.workspaceId}.${region}.xata.sh/db/${databaseName}:main/tables/users/schema`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${to.apiKey}`,
          },
          body: JSON.stringify({
            columns: [
              { name: "name", type: "string" },
              { name: "email", type: "string" },
              { name: "avatar_url", type: "string" },
              { name: "notion_id", type: "string" },
            ],
          }),
        }
      ).then(async (r) => {
        if (!r.ok) {
          throw await r.json();
        }
        return r.text();
      });

      // Insert users
      await fetch(
        `https://${to.workspaceId}.${region}.xata.sh/db/${databaseName}:main/tables/users/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${to.apiKey}`,
          },
          body: JSON.stringify({
            records: users.map((u) => ({
              name: u.name,
              email: u.person?.email,
              avatar_url: u.avatar_url,
              notion_id: u.id,
            })),
          }),
        }
      )
        .then(async (r) => {
          if (!r.ok) {
            throw await r.json();
          }
          return r.json();
        })
        .then((result) => {
          xataUsers = xataUsers.map((u, i) => ({
            ...u,
            notion_id: u.id,
            id: result.recordsIDs?.[i] ?? null,
          }));
        });
    }

    // Add a table
    const tableName = kebab(from.name).replace("’", "");
    console.info(`Creating table with name ${tableName}...`);
    await fetch(
      `https://${to.workspaceId}.${region}.xata.sh/db/${databaseName}:main/tables/${tableName}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${to.apiKey}`,
        },
      }
    ).then(async (r) => {
      if (!r.ok) {
        throw await r.json();
      }
      return r.text();
    });

    console.info("Created. Setting schema...");

    // Update the schema
    await fetch(
      `https://${to.workspaceId}.${region}.xata.sh/db/${databaseName}:main/tables/${tableName}/schema`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${to.apiKey}`,
        },
        body: JSON.stringify({
          columns,
        }),
      }
    ).then(async (r) => {
      if (!r.ok) {
        throw await r.json();
      }
      return r.text();
    });

    // Replace Notion user IDs with Xata IDs
    const replaceRowUsers = (rows: any[]) => {
      const result = rows.map((r) => {
        return Object.fromEntries(
          Object.entries(r).map(([k, v]) => {
            const equivalentUser = xataUsers.find((u) => u.notion_id === v);
            return [k, equivalentUser ? equivalentUser.id : v];
          })
        );
      });

      return result;
    };

    const records = replaceRowUsers(rows);

    console.info("Set. Inserting rows...");

    // Batch Import to Xata
    await fetch(
      `https://${to.workspaceId}.${region}.xata.sh/db/${databaseName}:main/tables/${tableName}/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${to.apiKey}`,
        },
        body: JSON.stringify({
          records,
        }),
      }
    ).then(async (r) => {
      if (!r.ok) {
        throw await r.json();
      }
      return r.text();
    });

    console.info("Done.");
    res.status(201).end(JSON.stringify({ status: "ok" }));
    return;
  } catch (error) {
    console.error(error);
    res.status(500).end(JSON.stringify({ status: "error", error }));
  }
};

export default handler;
