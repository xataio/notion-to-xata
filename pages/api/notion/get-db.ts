import { NextApiHandler } from "next";
import fetch from "isomorphic-fetch";
import { snake } from "case";

import { getValueByType } from "../../../util/getValueByType";
import { getXataTypeEquivalent } from "../../../util/getXataTypeEquivalent";

const handler: NextApiHandler = async (req, res) => {
  const { id, cursor } = req.query;

  if (Array.isArray(cursor)) {
    res.status(422).end();
    return;
  }
  if (Array.isArray(id)) {
    res.status(422).end();
    return;
  }

  console.info("Transforming results to be compatible with Xata...");
  const results: NotionDbResponse["results"] = await getEverything({
    cursor,
    id,
    token: req.cookies.nt,
    resultContainer: [],
  });

  const properties = results?.[0].properties ?? {};
  const columns = Object.keys(properties ?? []).map((c) => ({
    name: snake(c),
    ...getXataTypeEquivalent(properties[c].type),
  }));

  const users = {};

  const rows =
    results?.map((r) => {
      return Object.entries(r.properties).reduce((acc, [key, value]) => {
        // Store user stuff in `users` so we can send it later.
        if (value.type === "created_by") {
          users[value.created_by.id] = value.created_by;
        } else if (value.type === "last_edited_by") {
          users[value.last_edited_by.id] = value.last_edited_by;
        } else if (value.type === "people") {
          value.people.forEach((p) => {
            users[p.id] = p;
          });
        }

        return {
          ...acc,
          [snake(key)]: getValueByType(value),
        };
      }, {});
    }) ?? [];

  res.end(JSON.stringify({ columns, rows, users: Object.values(users) }));
};

const getEverything = async ({
  cursor,
  id,
  token,
  resultContainer,
}: {
  id: string;
  token: string;
  cursor: string;
  resultContainer: NotionDbResponse["results"];
}) => {
  console.info(`Querying database (${id}) from Notion...`);
  const response: NotionDbResponse = await fetch(
    `https://api.notion.com/v1/databases/${id}/query`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        "Notion-Version": "2021-08-16",
      },
      body: JSON.stringify({ page_size: 100, start_cursor: cursor }),
    }
  ).then((r) => r.json());

  console.info(`Got response from Notion.`);

  resultContainer.push(...response.results);

  // Let's deal with pagination.
  if (response.has_more) {
    return await getEverything({
      id,
      token,
      cursor: response.next_cursor,
      resultContainer,
    });
  } else {
    return resultContainer;
  }
};

export default handler;
