import clsx from "clsx";
import { FC, HTMLAttributes } from "react";

export const H3: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h3 {...props} className={clsx("text-xl font-semibold", props.className)}>
      {children}
    </h3>
  );
};
