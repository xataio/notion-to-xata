import puppeteer from "puppeteer-core";
import chrome from "chrome-aws-lambda";

const exePath =
  process.platform === "win32"
    ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    : process.platform === "linux"
    ? "/usr/bin/google-chrome"
    : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const isDev = process.env.NODE_ENV !== "production";

export const launchBrowser = async () =>
  await puppeteer.launch({
    headless: true,
    executablePath: isDev ? exePath : await chrome.executablePath,
    args: isDev ? [] : chrome.args,
  });
