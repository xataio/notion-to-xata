import { NextApiHandler } from "next";
import fetch from "isomorphic-fetch";
import FormData from "form-data";

import { fetchFromGitHub } from "../../util/fetchFromGitHub";

export type SendFeedbackRequestBody = {
  feedback: string;
  route: string;
  screenshot: string;
};

const handler: NextApiHandler = async (req, res) => {
  const { feedback, route, screenshot }: SendFeedbackRequestBody = req.body;

  let imageUrl = "";

  if (screenshot) {
    const body = new FormData();
    body.append(
      "file",
      Buffer.from(screenshot.replace("data:image/jpeg;base64,", ""), "base64")
    );

    // c-v.sh is a secure pastebin
    imageUrl = await fetch("https://c-v.sh/?from_gui=true", {
      method: "POST",
      body: body as unknown as BodyInit,
    })
      .then((r) => r.text())
      .then((r) => r.match(/https:\/\/c-v.sh\/(.*)\.(jpg|png)/gim)?.[0] ?? "");
  }

  await fetchFromGitHub("/repos/xataio/notion-to-xata/issues", {
    method: "POST",
    headers: { Accept: "application/vnd.github.v3+json" },
    body: JSON.stringify({
      title: `Feedback form at ${route}`,
      body: `## Feedback
${feedback}${
        imageUrl
          ? `
      
## Screenshot
![image](${imageUrl})`
          : ""
      }`,
    }),
  });

  res.end();
};

export default handler;
