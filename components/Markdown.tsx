import { kebab } from "case";
import { FC } from "react";
import ReactMarkdown from "react-markdown";
import { SpecialComponents } from "react-markdown/lib/ast-to-react";
import { NormalComponents } from "react-markdown/lib/complex-types";

import { H1 } from "./H1";
import { H2 } from "./H2";
import { H3 } from "./H3";
import Image from "next/image";
import { parse } from "querystring";
import { MarkdownParagraph } from "./MarkdownParagraph";

type Props = {
  children: string;
};

const components: Partial<
  Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
> = {
  a: (props) => (
    <a
      {...props}
      href={props.href}
      target={props.href.includes("http") ? "_blank" : undefined}
      rel={props.href.includes("http") ? "noopener noreferrer" : undefined}
    />
  ),
  h1: ({ children }) => <H1 id={kebab(String(children))}>{children}</H1>,
  h2: ({ children }) => {
    const slug = kebab(String(children));
    return <H2 id={slug}>{children}</H2>;
  },
  h3: ({ children }) => (
    <H3 className="pt-4" id={kebab(String(children))}>
      {children}
    </H3>
  ),
  p: MarkdownParagraph,
  ul: ({ children }) => (
    <ul className="grid gap-2 list-disc list-inside">{children}</ul>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
};

export const Markdown: FC<Props> = ({ children }) => {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};
