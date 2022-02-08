import { GetServerSideProps } from "next";
import { stringify } from "querystring";
import { FC, useEffect, useState } from "react";
import fetch from "isomorphic-fetch";
import clsx from "clsx";

import { Logo } from "../components/Logo";
import { NotionForm } from "../components/NotionForm";
import { XataForm } from "../components/XataForm";
import { getRedirectUri } from "../util/redirectUri";
import { getProtocol } from "../util/getProtocol";
import { NotionLogo } from "../components/NotionLogo";
import { getNotionCookie } from "../util/setNotionCookie";
import { MigrateRequestBody } from "./api/migrate";
import Head from "next/head";
import { getTomorrow } from "../util/getTomorrow";

type Props = {
  notionLink: string;
  notionDbs: { id: string; name: string }[];
  isAuthenticatedWithNotion: boolean;
};

type MigrationState = "ready" | RequestState;

const Index: FC<Props> = ({
  notionLink,
  notionDbs,
  isAuthenticatedWithNotion,
}) => {
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [targetWorkspace, setTargetWorkspace] = useState("");
  const [sourceNotionDb, setSourceNotionDb] = useState<{
    id: string;
    name: string;
  }>({ id: "", name: "" });

  const [migrationState, setMigrationState] =
    useState<MigrationState>("initial");

  useEffect(() => {
    if (migrationState === "initial" && targetWorkspace && sourceNotionDb.id) {
      setMigrationState("ready");
    }
  }, [targetWorkspace, sourceNotionDb]);

  const migrate = async () => {
    setError("");
    setMigrationState("pending");

    return fetch("/api/migrate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: sourceNotionDb,
        to: { apiKey, workspaceId: targetWorkspace },
      } as MigrateRequestBody),
    })
      .then(async (r) => {
        if (!r.ok) {
          setMigrationState("error");
          const response = await r.json();
          setError(response.error.message);
          return;
        }
        setMigrationState("success");
      })
      .catch((e) => {
        setMigrationState("error");
        setError(JSON.stringify(e));
      });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        migrate();
      }}
      className="flex p-4 flex-col gap-8 items-center text-center justify-center min-h-screen max-w-screen-sm mx-auto"
    >
      <Head>
        <title>
          Notion to Xata | Seamlessly Bring Your Data from Notion to Xata
        </title>
      </Head>
      <div className="flex items-center text-6xl gap-8">
        <div
          className="animate-grow scale-0"
          style={{ animationDelay: "2.4s" }}
        >
          <NotionLogo />
        </div>
        <div className="animate-grow scale-0" style={{ animationDelay: "2s" }}>
          &rarr;
        </div>
        <Logo width={120} />
      </div>
      <p>
        We are thrilled to have you choose Xata as the home of your data. Follow
        these instructions to seamlessly port over your database(s) from Notion.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded p-4 flex-col flex">
          {isAuthenticatedWithNotion ? (
            <NotionForm
              authorizeLink={notionLink}
              dbs={notionDbs}
              onSelectDatabase={setSourceNotionDb}
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                window.location.href = notionLink;
              }}
              className="bg-white border rounded shadow px-4 py-2 my-auto"
            >
              Sign in with Notion
            </button>
          )}
        </div>
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded p-4">
          <XataForm
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            onSelectWorkspace={setTargetWorkspace}
          />
        </div>
      </div>
      {migrationState !== "initial" && (
        <div className="w-full">
          <button
            disabled={["pending", "success"].includes(migrationState)}
            type="submit"
            className={clsx(
              migrationState === "ready" && "bg-accent text-white",
              migrationState === "pending" &&
                "bg-caution cursor-wait text-white",
              migrationState === "success" && "bg-success text-black",
              migrationState === "error" && "bg-red-400 text-white",
              "px-4 py-2 rounded w-full font-bold"
            )}
          >
            {migrationState === "ready"
              ? "Migrate"
              : migrationState === "pending"
              ? "Migrating..."
              : migrationState === "success"
              ? "Migrated"
              : migrationState === "error"
              ? "Error. Try Again?"
              : ""}
          </button>
        </div>
      )}
      <div>
        {migrationState === "error" && <p className="text-red-500">{error}</p>}
        {migrationState === "success" && (
          <p>
            <strong>Excellent!</strong> Your new database is available in your{" "}
            <a
              href={`https://app.xata.io/workspaces/${targetWorkspace}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              workspace
            </a>
            .
          </p>
        )}
      </div>
      <footer className="text-xs">
        &copy;{" "}
        <a target="_blank" rel="noreferrer noopener" href="https://xata.io">
          Xata
        </a>{" "}
        {new Date().getFullYear()} ⸱{" "}
        <a target="_blank" rel="noreferrer noopener" href="https://xata.io">
          Docs
        </a>{" "}
        ⸱{" "}
        <a
          target="_blank"
          rel="noreferrer noopener"
          href="https://angel.co/company/xata-inc"
        >
          We're Hiring
        </a>
      </footer>
    </form>
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  const { nt } = req.cookies;

  let isAuthenticatedWithNotion = Boolean(nt);

  const oauthParams = {
    client_id: process.env.NOTION_CLIENT_ID,
    redirect_uri: getRedirectUri(req.headers.host),
    response_type: "code",
    owner: "user",
  };

  const notionLink =
    "https://api.notion.com/v1/oauth/authorize?" + stringify(oauthParams);

  const notionDbs = await fetch(
    `${getProtocol()}${req.headers.host}/api/notion/search?q=`,
    {
      headers: {
        "Content-Type": "application/json",
        Cookie: getNotionCookie(nt, getTomorrow()),
      },
    }
  )
    .then(async (r) => {
      const response = await r.json();
      if (response.error) {
        isAuthenticatedWithNotion = false;
      }
      return response;
    })
    .then(({ dbs }) => dbs);

  return {
    props: {
      notionLink,
      notionDbs: notionDbs || [],
      isAuthenticatedWithNotion,
    },
  };
};
