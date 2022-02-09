export const getValueByType = (value: NotionProperty) => {
  switch (value.type) {
    case "rich_text":
      return value.rich_text[0]?.plain_text ?? null;
    case "multi_select":
      return value.multi_select?.map((s) => s.name) ?? null;
    case "title":
      return value.title[0]?.plain_text ?? null;
    case "text":
      return value.plain_text;
    case "created_by":
      return value.created_by?.id ?? null;
    case "created_time":
      return value.created_time;
    case "select":
      return value.select?.name ?? null;
    case "last_edited_time":
      return value.last_edited_time;
    case "last_edited_by":
      return value.last_edited_by?.id ?? null;
    case "people":
      return value.people[0]?.id ?? null;
    case "relation":
      /** @todo figure out how to import relations */
      return value.relation?.[0]?.id ?? null;
    default:
      throw new Error(`Bad value: ${JSON.stringify(value, null, 2)}`);
  }
};
