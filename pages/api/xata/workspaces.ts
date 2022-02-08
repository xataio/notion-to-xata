import fetch from "isomorphic-fetch";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const { k } = req.query;
  const response = await fetch("https://api.xata.io/workspaces/", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${k}`,
    },
  }).then((r) => {
    if (!r.ok) {
      res.status(401).json({
        message: "Invalid API key.",
      });
    }
    return r.json();
  });

  res.end(JSON.stringify(response.workspaces));
};

export default handler;
