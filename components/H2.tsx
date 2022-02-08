import { FC, HTMLAttributes } from "react";

export const H2: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  ...props
}) => {
  return (
    <h2
      {...props}
      className="flex text-black dark:text-white items-center text-3xl font-semibold pt-4"
    >
      {children}
    </h2>
  );
};
