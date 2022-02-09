import { snake } from "case";

export const sanitizeColumnName = (name: string) => {
  const cleanedName = name.trim();
  const snakedName = snake(cleanedName);
  const removedUnderscorePrefix = snakedName.startsWith("_")
    ? snakedName.slice(1)
    : snakedName;
  const removedUnicodeShit = decodeURIComponent(
    encodeURIComponent(removedUnderscorePrefix).replace("%EF%BB%BF", "")
  );

  return removedUnicodeShit;
};
