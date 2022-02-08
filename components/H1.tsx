import { FC, HTMLAttributes } from "react";

export const H1: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h1 {...props} className="text-5xl font-bold">
      {children}
    </h1>
  );
};
