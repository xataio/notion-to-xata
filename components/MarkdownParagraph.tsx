import { FC } from "react";

export const MarkdownParagraph: FC = ({ children }) => {
  return <p className="leading-relaxed">{children}</p>;
};
