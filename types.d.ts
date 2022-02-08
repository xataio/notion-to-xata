type NotionTokenResponse = {
  access_token: string;
  token_type: "bearer";
  bot_id: "42fc3a4d-1161-455c-aea3-4dfcfe3c736d";
  workspace_name: string;
  workspace_icon: string | null;
  workspace_id: string;
  owner: {
    type: "user";
    user: {
      object: "user";
      id: string;
    };
  };
};

type NotionType =
  | "rich_text"
  | "multi_select"
  | "title"
  | "text"
  | "created_by"
  | "select"
  | "created_time"
  | "last_edited_time"
  | "last_edited_by"
  | "people";

type NotionProperty =
  | {
      type: NotionType;
      created_by?: never;
      last_edited_by?: never;
      people?: never;
      rich_text?: never;
      multi_select?: never;
      title?: never;
      plain_text?: never;
      created_time?: never;
      select?: never;
      last_edited_time?: never;
    }
  | { type: "created_by"; created_by: { id: string } }
  | { type: "last_edited_by"; last_edited_by: { id: string } }
  | { type: "people"; people: { id: string }[] }
  | { type: "rich_text"; rich_text: { plain_text: string }[] }
  | { type: "title"; title: { plain_text: string }[] }
  | { type: "multi_select"; multi_select: { name: string }[] }
  | { type: "text"; plain_text: string }
  | { type: "created_time"; created_time: string }
  | { type: "select"; select: { name: string } }
  | { type: "last_edited_time"; last_edited_time: string };

type NotionDbResponse = {
  has_more: boolean;
  next_cursor: string;
  results: {
    properties: Record<string, NotionProperty>;
  }[];
};

type RequestState = "success" | "pending" | "error" | "initial";

type XataType =
  | "bool"
  | "int"
  | "string"
  | "text"
  | "email"
  | "multiple"
  | "link"
  | "object";
