import { FC, useEffect, useState } from "react";

import { useDebounce } from "../hooks/useDebounce";
import { Input } from "./Input";
import { Label } from "./Label";
import { List } from "./List";
import { Spinner } from "./Spinner/Spinner";

type Props = {
  onSelectDatabase: (db: { id: string; name: string }) => void;
  dbs: { id: string; name: string }[];
  authorizeLink: string;
};

export const NotionForm: FC<Props> = ({
  onSelectDatabase,
  dbs,
  authorizeLink,
}) => {
  const [searchState, setSearchState] = useState<RequestState>("initial");
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 300);
  const [data, setData] = useState(dbs);
  const [error, setError] = useState(null);
  const [selectedDb, setSelectedDb] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });

  useEffect(() => {
    setSearchState("pending");
    fetch(`/api/notion/search?q=${value}`, {
      headers: { "Content-Type": "application/json" },
    })
      .then(async (r) => {
        const response = await r.json();
        if (response.error) {
          throw new Error(JSON.stringify(response));
        }
        return response;
      })
      .then(({ dbs }) => {
        setSearchState("initial");
        setData(dbs);
      })
      .catch((error) => {
        setSearchState("initial");
        setError(error);
      });
  }, [debouncedValue]);

  useEffect(() => {
    if (selectedDb) {
      onSelectDatabase(selectedDb);
    }
  }, [selectedDb]);

  return (
    <div className="text-left grid gap-3">
      <label className="grid gap-1 relative w-full">
        <Label>Search Databases...</Label>
        <Input
          disabled={searchState === "pending"}
          onChange={(e) => setValue(e.target.value)}
          type="text"
          placeholder="My database..."
        />
        {searchState === "pending" && (
          <div className="absolute right-4 top-0">
            <Spinner />
          </div>
        )}
      </label>
      {error && <span className="text-sm text-red-500">{error.message}</span>}
      <List
        items={data.map((d) => ({
          label: d.name,
          richLabel: (
            <label className="cursor-pointer">
              <input type="radio" name="notion-db" />
              &nbsp;
              {d.name}
            </label>
          ),
          onClick: () => {
            setSelectedDb(d);
          },
        }))}
      />
      {data.length === 0 && (
        <span className="text-sm">
          This form displays your Notion databases only. If you're not seeing a
          database listed here even after searching, there's a chance your
          database might be a page instead. Please read the{" "}
          <a
            href="https://www.notion.so/help/intro-to-databases"
            target="_blank"
          >
            Notion docs
          </a>{" "}
          for more.
        </span>
      )}
      <hr />
      <button
        type="button"
        className="text-xs text-left"
        onClick={() => {
          window.location.href = authorizeLink;
        }}
      >
        Reauthenticate
      </button>
    </div>
  );
};
