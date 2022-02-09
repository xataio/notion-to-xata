import { NextApiHandler } from "next";
import fetch from "isomorphic-fetch";

import { getValueByType } from "../../../util/getValueByType";
import { getNotionCookie } from "../../../util/setNotionCookie";

const handler: NextApiHandler = async (req, res) => {
  const { q } = req.query;

  const response = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    body: JSON.stringify({
      query: q,
      filter: { property: "object", value: "database" },
    }),
    headers: {
      Authorization: req.headers.authorization || "Bearer " + req.cookies.nt,
      "Content-Type": "application/json",
      "Notion-Version": "2021-08-16",
    },
  }).then((r) => r.json());

  console.log(JSON.stringify(response, null, 2));

  if (response.code === "unauthorized") {
    res.setHeader("Set-Cookie", getNotionCookie("", new Date()));
    res.status(401).end(JSON.stringify({ error: "unauthorized" }));
    return;
  }

  const dbs = response.results.map((r) => {
    return {
      id: r.id,
      name: r.title[0] ? getValueByType(r.title[0]) : "No Title",
    };
  });

  res.end(JSON.stringify({ dbs }));
};

export default handler;
