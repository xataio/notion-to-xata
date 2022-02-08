import { NextApiHandler } from "next";
import { renderToString } from "react-dom/server";
import { title as makeTitleCase } from "case";

import { OgImage } from "../../components/OgImage";
import { launchBrowser } from "../../util/launchBrowser";

const handler: NextApiHandler = async (req, res) => {
  /**
   * I can't believe I have to do this shit.
   * See https://github.com/facebook/react/issues/13838
   */
  const title = req.query.title || req.query["amp;title"] || "";
  const subtitle = req.query.subtitle || req.query["amp;subtitle"] || "";
  const content = req.query.content || req.query["amp;content"] || "";

  const browser = await launchBrowser();

  const page = await browser.newPage();
  await page.setViewport({ height: 630, width: 1200 });

  const html = renderToString(
    <OgImage
      title={makeTitleCase(String(title))}
      subtitle={String(subtitle)}
      content={content ? String(content) : undefined}
      host={`http${process.env.NODE_ENV === "production" ? "s" : ""}://${
        req.headers.host
      }`}
    />
  );

  await page.setContent(html, { waitUntil: "load" });

  const screenshot = await page.screenshot({ type: "png" });
  await browser.close();

  res.setHeader("Content-Type", "image/png");
  res.end(screenshot);
};

export default handler;
