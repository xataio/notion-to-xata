import { snake } from "case";

export const sanitizeColumnName = (name: string) =>
  snake(name.startsWith("_") ? name.slice(1) : name);
