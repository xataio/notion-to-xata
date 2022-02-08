import { FC, useEffect, useRef, useState } from "react";
import { takeScreenshot, checkIfBrowserSupported } from "@xata.io/screenshot";

import { H3 } from "./H3";
import clsx from "clsx";

export const FeedbackButton: FC = () => {
  const [isGivingFeedback, setIsGivingFeedback] = useState(false);
  const [postingFeedbackState, setPostingFeedbackState] =
    useState<RequestState>("initial");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [shouldIncludeScreenshot, setShouldIncludeScreenshot] = useState(false);
  const [screenshot, setScreenshot] = useState("");
  const $textarea = useRef<HTMLTextAreaElement>(null);
  const [
    isBrowserCompatibleWithScreenshotApi,
    setIsBrowserCompatibleWithScreenshotApi,
  ] = useState(false);

  useEffect(() => {
    if (checkIfBrowserSupported()) {
      setIsBrowserCompatibleWithScreenshotApi(true);
    }
  }, []);

  const reset = () => {
    setFeedback("");
    setScreenshot("");
    setError("");
    setShouldIncludeScreenshot(false);
    setPostingFeedbackState("initial");
  };

  const close = () => {
    reset();
    setIsGivingFeedback(false);
  };

  useEffect(() => {
    if (shouldIncludeScreenshot) {
      takeScreenshot({
        soundEffectUrl: "/sounds/screenshot.mp3",
        onCaptureStart: async () => {
          setIsGivingFeedback(false);
          setError("");
        },
        onCaptureEnd: async () => {
          setIsGivingFeedback(true);
        },
      })
        .then(setScreenshot)
        .catch((e) => {
          setShouldIncludeScreenshot(false);
          setIsGivingFeedback(true);

          if (e.message === "Permission denied") {
            return;
          }
          setError(
            "Failed to capture screen. Please ensure you've given your browser the appropriate permissions and try again. If nothing else works, please reach out to us on Slack."
          );
        });
    } else {
      setScreenshot("");
    }
  }, [shouldIncludeScreenshot]);

  const sendFeedback = () => {
    if (!feedback) {
      return;
    }

    setError("");
    setPostingFeedbackState("pending");
    fetch("/api/send-feedback", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feedback,
        route: window.location.href,
        screenshot,
      }),
    })
      .then(async (r) => {
        reset();
        if (!r.ok) {
          const response = await r.text();
          throw new Error(
            `Sending feedback failed with the following output: ${response}. Please reach out to us on Slack and try again later.`
          );
        }
        reset();
        setPostingFeedbackState("success");
        $textarea.current?.focus();
      })
      .catch((e) => {
        reset();
        setPostingFeedbackState("error");
        setError(e.message);
        $textarea.current?.focus();
      });
  };

  useEffect(() => {
    window.addEventListener("keydown", (e) => e.key === "Escape" && close());
  }, []);

  return (
    <>
      <button
        onClick={() => setIsGivingFeedback(true)}
        className="fixed right-8 bottom-0 font-bold rounded-tl rounded-tr bg-accent text-white p-2 transition-all hover:pb-4"
      >
        Feedback
      </button>
      {isGivingFeedback && (
        <div
          onClick={close}
          style={{ backdropFilter: "blur(4px)" }}
          className="fixed p-4 top-0 left-0 w-screen h-screen flex items-center justify-center bg-white/90 dark:bg-black/90"
        >
          <form
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) {
                sendFeedback();
              }
            }}
            onSubmit={(e) => {
              e.preventDefault();
              sendFeedback();
            }}
            className="rounded shadow-lg border border-neutral-100 bg-white dark:bg-black dark:border-accent dark:border-2 p-4 max-w-md leading-relaxed grid gap-4"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <H3>Submit Feedback</H3>
            <span className="text-sm">
              We're constantly looking to improve the experience our users have
              on our products. Feel free to share any thoughts below about your
              experience on this website.
            </span>
            <label className="grid gap-1">
              <span className="text-xs font-bold text-neutral-400">
                Your Message
              </span>
              <textarea
                className="py-2 px-3 border border-neutral-400 rounded dark:bg-black focus:outline-accent"
                placeholder="Please add as much detail as possible, and contact information if you'd like a response."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                ref={$textarea}
              ></textarea>
            </label>
            {isBrowserCompatibleWithScreenshotApi && (
              <div className="leading-snug grid gap-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shouldIncludeScreenshot}
                    onClick={() =>
                      setShouldIncludeScreenshot(!shouldIncludeScreenshot)
                    }
                  />
                  &nbsp; Include a Screenshot?
                </label>
                <span className="text-xs text-neutral-400">
                  If sharing another tab or window, come back to this one to
                  complete your screenshot.
                </span>
              </div>
            )}
            {screenshot && (
              <figure className="rounded bg-neutral-100 border-neutral-200 border p-4">
                <img
                  alt="Your screenshot"
                  src={screenshot}
                  className="max-w-full rounded shadow"
                />
              </figure>
            )}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!feedback || postingFeedbackState === "pending"}
                className={clsx(
                  postingFeedbackState === "initial" &&
                    "bg-accent cursor-pointer hover:bg-accent-dark border-accent dark:border-accent-dark",
                  postingFeedbackState === "pending" &&
                    "bg-orange-500 border-orange-500 cursor-wait",
                  postingFeedbackState === "success" &&
                    "bg-green-500 cursor-pointer hover:bg-green-900 border-green-500 hover:border-green-900",
                  postingFeedbackState === "error" &&
                    "bg-red-500 cursor-pointer hover:bg-red-900 border-red-500 hover:border-red-900",
                  "rounded px-4 py-1 text-white font-bold border"
                )}
              >
                {postingFeedbackState === "initial"
                  ? "Send"
                  : postingFeedbackState === "error"
                  ? "Try Again"
                  : postingFeedbackState === "pending"
                  ? "Sending..."
                  : postingFeedbackState === "success"
                  ? "Send More"
                  : ""}
              </button>
              <button
                onClick={close}
                className="border text-neutral-500 dark:text-neutral-300 dark:border-neutral-400 border-neutral-500 hover:border-neutral-800 hover:text-neutral-800 dark:hover:border-neutral-100 dark:hover:text-neutral-100 rounded px-4 py-1"
              >
                Cancel
              </button>
            </div>
            {error && (
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
            {postingFeedbackState === "success" && (
              <div className="text-green-600 dark:text-green-400 text-sm">
                <strong>Thanks!</strong> We'll review this and follow up if
                needed.
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
};
