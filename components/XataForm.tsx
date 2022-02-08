import { FC, useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { Input } from "./Input";
import { Label } from "./Label";
import { List } from "./List";
import { Markdown } from "./Markdown";
import { Spinner } from "./Spinner/Spinner";

type Props = {
  onSelectWorkspace: (workspaceId: string) => void;
  apiKey: string;
  onApiKeyChange: (newApiKey: string) => void;
};

export const XataForm: FC<Props> = ({
  onSelectWorkspace,
  apiKey,
  onApiKeyChange,
}) => {
  const [keyState, setKeyState] = useState<RequestState>("initial");
  const [workspaceFilter, setWorkspaceFilter] = useState("");
  const [error, setError] = useState(null);
  const debouncedKey = useDebounce(apiKey, 300);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");

  useEffect(() => {
    if (!debouncedKey) {
      return;
    }

    setKeyState("pending");
    fetch(`/api/xata/workspaces?k=${apiKey}`)
      .then(async (r) => {
        if (!r.ok) {
          const json = await r.json();
          throw json;
        }
        setIsAuthenticated(true);
        return r.json();
      })
      .then(setWorkspaces)
      .catch(setError)
      .finally(() => setKeyState("initial"));
  }, [debouncedKey]);

  useEffect(() => {
    onSelectWorkspace(activeWorkspaceId);
  }, [activeWorkspaceId]);

  return (
    <div className="text-left grid gap-3">
      <label className="grid gap-1 relative">
        <Label>Your Xata API Key</Label>
        <input
          disabled={isAuthenticated}
          className="rounded p-1 w-full border dark:border-neutral-800"
          type="text"
          placeholder="xau_iajfjawkr08j208gh"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
        {keyState === "pending" && (
          <div className="absolute right-4 top-0">
            <Spinner />
          </div>
        )}
      </label>
      {error && (
        <div className="text-sm text-red-500">
          <Markdown>{error.message}</Markdown>
        </div>
      )}
      {workspaces?.length > 0 ? (
        <>
          <div className="grid gap-2">
            <label>
              <Label>Pick a Workspace</Label>
              <Input
                placeholder="Find/filter more workspaces..."
                value={workspaceFilter}
                onChange={(e) => setWorkspaceFilter(e.target.value)}
              />
            </label>
            <List
              items={workspaces
                .filter((w) =>
                  w.name.toLowerCase().includes(workspaceFilter.toLowerCase())
                )
                .slice(0, 5)
                .map((w) => ({
                  label: w.name,
                  richLabel: (
                    <label className="cursor-pointer">
                      <input type="radio" name="workspace" /> {w.name}
                    </label>
                  ),
                  onClick: () => {
                    setActiveWorkspaceId(w.id);
                  },
                }))}
            />
          </div>
          <p className="text-sm">
            To learn more about workspaces, please visit the{" "}
            <a
              href="https://docs.xata.io/concepts/workspaces"
              rel="noreferrer noopener"
              target="_blank"
            >
              documentation
            </a>
            .
          </p>
        </>
      ) : (
        <p className="text-sm">
          To learn more about API keys, please visit the{" "}
          <a
            href="https://docs.xata.io/concepts/api-keys"
            rel="noreferrer noopener"
            target="_blank"
          >
            documentation
          </a>
          .
        </p>
      )}
    </div>
  );
};
