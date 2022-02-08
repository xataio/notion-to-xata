import { FC } from "react";
import { HiArrowSmRight } from "react-icons/hi";

import { NotionLogo } from "./NotionLogo";

type Props = {
  title: string;
  subtitle: string;
  content?: string;
  host: string;
};

export const OgImage: FC<Props> = ({ title, subtitle, content, host }) => {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body{font-family: 'Inter', sans-serif; margin:0; padding:0;}`,
          }}
        />
      </head>
      <body>
        <div
          style={{
            width: 1200,
            height: 630,
            background: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingRight: 32,
            overflow: "hidden",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 32,
              width: "100%",
            }}
          >
            <div>
              <NotionLogo size={300} />
            </div>
            <div style={{ fontSize: 300 }}>
              <HiArrowSmRight />
            </div>
            <div>
              <img alt="logo" src={host + "/img/logo.png"} width={300} />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};
