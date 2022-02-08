import fetch from "isomorphic-fetch";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const { k, w } = req.query;
  const response = await fetch(`https://${w}.xata.sh/dbs`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${k}`,
    },
  }).then((r) => {
    if (!r.ok) {
      res.status(401).end();
    }
    return r.json();
  });

  res.end(JSON.stringify(response.databases));
};

export default handler;
