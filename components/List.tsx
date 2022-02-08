import clsx from "clsx";
import { FC, ReactNode } from "react";

type BaseItem = {
  onClick: () => void;
  condensed?: boolean;
};

type BaseItemWithLabel = {
  label: string;
  richLabel?: ReactNode;
} & BaseItem;

type BaseItemWithRichLabel = {
  label?: string;
  richLabel: ReactNode;
} & BaseItem;

type BaseItemWithBothLabels = {
  label: string;
  richLabel: ReactNode;
} & BaseItem;

type Props = {
  items: (BaseItemWithLabel | BaseItemWithRichLabel | BaseItemWithBothLabels)[];
};

export const List: FC<Props> = ({ items }) => {
  if (!items.length) {
    return (
      <div className="border rounded flex items-center justify-center text-sm p-4">
        No Results
      </div>
    );
  }
  return (
    <ul className="grid list-inside">
      {items.map((i, index) => (
        <li key={index}>
          <span
            className={clsx(
              "text-softer-black text-left hover:text-black dark:text-softer-white dark:hover:text-white",
              i.condensed && "text-xs"
            )}
            onClick={i.onClick}
          >
            {i.richLabel || i.label}
          </span>
        </li>
      ))}
    </ul>
  );
};
