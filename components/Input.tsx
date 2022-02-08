import { FC, HTMLAttributes, InputHTMLAttributes } from "react";

export const Input: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className="rounded p-1 w-full border bg-white dark:bg-neutral-600 dark:border-neutral-700 text-black dark:text-white"
  />
);
