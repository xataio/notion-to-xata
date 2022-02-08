import { NextApiHandler } from "next";
import fetch from "isomorphic-fetch";

import { getRedirectUri } from "../../../util/redirectUri";
import { getProtocol } from "../../../util/getProtocol";
import { getNotionCookie } from "../../../util/setNotionCookie";
import { getTomorrow } from "../../../util/getTomorrow";

const handler: NextApiHandler = async (req, res) => {
  const { code } = req.query;

  if (code) {
    const authKeyPair = `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`;
    const notionResponse: NotionTokenResponse = await fetch(
      "https://api.notion.com/v1/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(authKeyPair).toString("base64")}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: getRedirectUri(req.headers.host),
        }),
      }
    ).then((r) => r.json());

    res.setHeader(
      "Set-Cookie",
      getNotionCookie(notionResponse.access_token, getTomorrow())
    );

    res.end(`<html>
    <head><meta http-equiv="refresh" content=1;url="${getProtocol()}${
      req.headers.host
    }"></head>
    <body></body>
    </html>`);
  }
};

export default handler;
