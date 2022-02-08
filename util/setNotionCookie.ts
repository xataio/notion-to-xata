import { serialize } from "cookie";

export const getNotionCookie = (val: string, expires: Date) =>
  serialize("nt", val, {
    httpOnly: true,
    sameSite: "strict",
    expires,
    path: "/",
  });
