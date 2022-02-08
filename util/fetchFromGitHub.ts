export const fetchFromGitHub = (path: string, options: RequestInit = {}) =>
  fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github.v3.raw",
      ...options.headers,
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    },
  });
