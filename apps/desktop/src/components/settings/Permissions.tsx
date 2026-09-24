import { useMemo, useState, useEffect } from "react";


const API_URL = "http://127.0.0.1:8000"; // Replace with your FastAPI server URL

const applications = [
  "Spotify",
  "Google Chrome",
  "Visual Studio Code",
  "Slack",
  "Notes",
  "GarageBand",
];

type Capability =
  | "launch"
  | "screen_read"
  | "mouse_control"
  | "keyboard_control";

const capabilities: {
  id: Capability;
  label: string;
  description: string;
}[] = [
  {
    id: "launch",
    label: "Launch application",
    description: "Allow Halo to open this application.",
  },
  {
    id: "screen_read",
    label: "Read screen",
    description: "Allow Halo to see what's on screen.",
  },
  {
    id: "mouse_control",
    label: "Mouse control",
    description: "Allow Halo to control the mouse.",
  },
  {
    id: "keyboard_control",
    label: "Keyboard control",
    description: "Allow Halo to control the keyboard.",
  },
];

type PermissionState = Record<
  string,
  Record<Capability, boolean>
>;

const createDefaultPermissions = (): PermissionState => {
  return Object.fromEntries(
    applications.map((app) => [
      app,
      {
        launch: false,
        screen_read: false,
        mouse_control: false,
        keyboard_control: false,
      },
    ])
  ) as PermissionState;
};

export default function Permissions() {
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] =
    useState(applications[0]);

  const [permissions, setPermissions] =
    useState<PermissionState>(
      createDefaultPermissions()
    );

  const [loading, setLoading] = useState(true);
  useEffect(() => {
  async function loadPermissions() {
    try {
      const response = await fetch(
        `${API_URL}/permissions`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load permissions: ${response.status}`
        );
      }

      const data = await response.json();

      setPermissions((current) => {
        const merged = {
          ...current,
        };

        for (const app of applications) {
          if (data[app]) {
            merged[app] = {
              ...current[app],
              ...data[app],
            };
          }
        }

        return merged;
      });
    } catch (error) {
      console.error(
        "PERMISSIONS → failed to load:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  loadPermissions();
}, []);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter((app) =>
      app.toLowerCase().includes(query)
    );
  }, [search]);

  const togglePermission = async (
  capability: Capability
) => {
  const currentlyEnabled =
    permissions[selectedApp][capability];

  const action = currentlyEnabled
    ? "revoke"
    : "grant";

  // Optimistically update the UI.
  setPermissions((current) => ({
    ...current,
    [selectedApp]: {
      ...current[selectedApp],
      [capability]: !currentlyEnabled,
    },
  }));

  try {
    const response = await fetch(
      `${API_URL}/permissions/${encodeURIComponent(
        selectedApp
      )}/${action}?capability=${encodeURIComponent(
        capability
      )}`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Permission update failed: ${response.status}`
      );
    }

    console.log(
      `PERMISSIONS → ${action} ${selectedApp}.${capability}`
    );
  } catch (error) {
    console.error(
      "PERMISSIONS → failed to update:",
      error
    );

    // Roll back if backend update failed.
    setPermissions((current) => ({
      ...current,
      [selectedApp]: {
        ...current[selectedApp],
        [capability]: currentlyEnabled,
      },
    }));
  }
};

  const selectedPermissions =
    permissions[selectedApp];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight">
          Permissions
        </h1>

        <p className="mt-2 text-xs opacity-60">
          Control what Halo can access on your Mac.
        </p>
      </div>

      {/* Main permission panel */}
      <div className="mt-10 grid min-h-[520px] grid-cols-[280px_1fr] border-2 border-[#171717] bg-[#f4edda] shadow-[5px_5px_0_#171717]">
        {/* Applications */}
        <section className="border-r-2 border-[#171717]">
          <div className="border-b-2 border-[#171717] p-5">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Applications
            </h2>

            <div className="mt-4 flex items-center border-2 border-[#171717] bg-white px-3 py-2">
              <span className="mr-2 text-sm">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search apps..."
                className="w-full bg-transparent font-mono text-xs outline-none placeholder:opacity-40"
              />
            </div>
          </div>

          <div className="p-3">
            {filteredApplications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs opacity-50">
                No applications found.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredApplications.map(
                  (app) => {
                    const active =
                      app === selectedApp;

                    return (
                      <button
                        key={app}
                        type="button"
                        onClick={() =>
                          setSelectedApp(app)
                        }
                        className={`
                          flex w-full items-center
                          justify-between
                          border-2 px-3 py-3
                          text-left text-xs
                          ${
                            active
                              ? "border-[#171717] bg-[#ffd83d] shadow-[3px_3px_0_#171717]"
                              : "border-transparent hover:bg-[#e9dfc5]"
                          }
                        `}
                      >
                        <span>{app}</span>

                        {active && (
                          <span className="text-[10px] font-black">
                            →
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </section>

        {/* Selected application */}
        <section className="p-8">
          <div className="flex items-start justify-between border-b-2 border-[#171717] pb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-50">
                Application Access
              </div>

              <h2 className="mt-2 text-3xl font-black">
                {selectedApp}
              </h2>
            </div>

            <div className="-rotate-6 rounded-[50%] border-[4px] border-[#e8b800] px-5 py-2 shadow-[3px_3px_0_#171717]">
              HALO
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {capabilities.map(
              (capability) => {
                const enabled =
                  selectedPermissions[
                    capability.id
                  ];

                return (
                  <div
                    key={capability.id}
                    className="flex items-center justify-between border-2 border-[#171717] bg-[#f9f4e7] p-5"
                  >
                    <div className="pr-8">
                      <div className="text-sm font-black">
                        {capability.label}
                      </div>

                      <div className="mt-1 text-[11px] opacity-55">
                        {capability.description}
                      </div>
                    </div>

                    <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        onClick={() => togglePermission(capability.id)}
                        className={`
                            relative
                            h-7 w-14
                            shrink-0
                            border-2 border-[#171717]
                            ${
                            enabled
                                ? "bg-[#ffd83d] shadow-[3px_3px_0_#171717]"
                                : "bg-[#d8d0bc]"
                            }
                        `}
                        >
                        <span
                            className={`
                            absolute
                            top-1/2
                            left-1
                            h-5 w-5
                            -translate-y-1/2
                            border-2 border-[#171717]
                            bg-[#f4edda]
                            transition-all duration-150
                            ${
                                enabled
                                ? "left-[30px]"
                                : "left-1"
                            }
                            `}
                        />
                    </button>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-8 rotate-[-0.4deg] border-2 border-dashed border-[#171717] p-4 text-[11px] opacity-60">
            ✎ These permissions control what Halo is
            allowed to do with {selectedApp}.
          </div>
        </section>
      </div>
    </div>
  );
}