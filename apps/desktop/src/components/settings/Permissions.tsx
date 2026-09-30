import { useEffect, useMemo, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Application = {
  name: string;
  path: string;
};

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

export default function Permissions() {
  const [search, setSearch] = useState("");

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [selectedApp, setSelectedApp] =
    useState<Application | null>(null);

  const [permissions, setPermissions] =
    useState<PermissionState>({});

  const [loading, setLoading] = useState(true);

  /*
   * Load applications and permissions
   */
  useEffect(() => {
    async function loadData() {
      try {
        const [
          applicationsResponse,
          permissionsResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/applications`),
          fetch(`${API_URL}/permissions`),
        ]);

        if (!applicationsResponse.ok) {
          throw new Error(
            `Failed to load applications: ${applicationsResponse.status}`
          );
        }

        if (!permissionsResponse.ok) {
          throw new Error(
            `Failed to load permissions: ${permissionsResponse.status}`
          );
        }

        const applicationsData: Application[] =
          await applicationsResponse.json();

        const permissionsData =
          await permissionsResponse.json();

        setApplications(applicationsData);

        setSelectedApp(
          applicationsData.length > 0
            ? applicationsData[0]
            : null
        );

        /*
         * Start with every discovered application
         * having all permissions disabled.
         */
        const initialPermissions: PermissionState =
          {};

        for (const app of applicationsData) {
          initialPermissions[app.name] = {
            launch: false,
            screen_read: false,
            mouse_control: false,
            keyboard_control: false,
            ...(permissionsData[app.name] || {}),
          };
        }

        setPermissions(initialPermissions);
      } catch (error) {
        console.error(
          "PERMISSIONS → failed to load:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /*
   * Filter applications based on search.
   */
  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter((app) =>
      app.name.toLowerCase().includes(query)
    );
  }, [search, applications]);

  /*
   * Toggle a permission for the selected application.
   */
  const togglePermission = async (
    capability: Capability
  ) => {
    if (!selectedApp) {
      return;
    }

    const appName = selectedApp.name;

    const currentlyEnabled =
      permissions[appName]?.[capability] ?? false;

    const action = currentlyEnabled
      ? "revoke"
      : "grant";

    /*
     * Optimistically update UI.
     */
    setPermissions((current) => ({
      ...current,
      [appName]: {
        ...current[appName],
        [capability]: !currentlyEnabled,
      },
    }));

    try {
      const response = await fetch(
        `${API_URL}/permissions/${encodeURIComponent(
          appName
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
        `PERMISSIONS → ${action} ${appName}.${capability}`
      );
    } catch (error) {
      console.error(
        "PERMISSIONS → failed to update:",
        error
      );

      /*
       * Roll back optimistic update
       * if backend request fails.
       */
      setPermissions((current) => ({
        ...current,
        [appName]: {
          ...current[appName],
          [capability]: currentlyEnabled,
        },
      }));
    }
  };

  const selectedPermissions = selectedApp
    ? permissions[selectedApp.name]
    : null;

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="max-w-6xl">
        <h1 className="text-4xl font-black tracking-tight">
          Permissions
        </h1>

        <p className="mt-2 text-xs opacity-60">
          Control what Halo can access on your Mac.
        </p>

        <div className="mt-10 border-2 border-dashed border-[#171717] p-10 text-center">
          <div className="text-3xl text-[#e8b800]">
            ✦
          </div>

          <p className="mt-2 text-xs opacity-60">
            Discovering applications...
          </p>
        </div>
      </div>
    );
  }

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

          <div className="max-h-[420px] overflow-y-auto p-3">
            {filteredApplications.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs opacity-50">
                No applications found.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredApplications.map(
                  (app) => {
                    const active =
                      app.path ===
                      selectedApp?.path;

                    return (
                      <button
                        key={app.path}
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
                        <span>
                          {app.name}
                        </span>

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
          {!selectedApp ||
          !selectedPermissions ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-3xl text-[#e8b800]">
                  ✦
                </div>

                <p className="mt-2 text-xs opacity-60">
                  Select an application.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Application header */}
              <div className="flex items-start justify-between border-b-2 border-[#171717] pb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] opacity-50">
                    Application Access
                  </div>

                  <h2 className="mt-2 text-3xl font-black">
                    {selectedApp.name}
                  </h2>

                  <p className="mt-2 max-w-lg truncate text-[10px] opacity-40">
                    {selectedApp.path}
                  </p>
                </div>

                <div className="-rotate-6 rounded-[50%] border-[4px] border-[#e8b800] px-5 py-2 shadow-[3px_3px_0_#171717]">
                  HALO
                </div>
              </div>

              {/* Capabilities */}
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
                            {
                              capability.description
                            }
                          </div>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          onClick={() =>
                            togglePermission(
                              capability.id
                            )
                          }
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

              {/* Footer note */}
              <div className="mt-8 rotate-[-0.4deg] border-2 border-dashed border-[#171717] p-4 text-[11px] opacity-60">
                ✎ These permissions control what Halo
                is allowed to do with{" "}
                {selectedApp.name}.
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}