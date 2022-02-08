export const getProtocol = () =>
  `http${process.env.NODE_ENV === "production" ? "s" : ""}://`;
