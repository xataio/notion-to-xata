export const redirectUri =
  (process.env.NODE_ENV === "production"
    ? "https://notion-xata.vercel.app"
    : "http://localhost:3000") + "/api/oauth/redirect";
