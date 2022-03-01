export const getXataTypeEquivalent = (
  notionType: NotionType
): { type: XataType; link?: { table: string } } => {
  switch (notionType) {
    case "multi_select":
      return { type: "multiple" };
    case "select":
      return { type: "string" };
    case "rich_text":
      return { type: "text" };
    case "text":
      return { type: "string" };
    case "title":
      return { type: "string" };
    case "created_by":
      return { type: "link", link: { table: "users" } };
    case "created_time":
      return { type: "string" };
    case "last_edited_time":
      return { type: "string" };
    case "last_edited_by":
      return { type: "link", link: { table: "users" } };
    case "people":
      return { type: "link", link: { table: "users" } };
    case "url":
    case "relation":
    case "date":
      return { type: "string" };
    case "number":
      return { type: "int" };
    case "checkbox":
      return { type: "bool" };
    default:
      throw new Error(`No Xata type equivalent for ${notionType}`);
  }
};
