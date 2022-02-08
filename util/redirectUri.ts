import { getProtocol } from "./getProtocol";

export const getRedirectUri = (host) =>
  `${getProtocol()}${host}/api/oauth/redirect`;
