type SettingsSection =
  | "general"
  | "permissions"
  | "voice"
  | "appearance"
  | "about";

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}

const items: {
  label: string;
  icon: string;
  section: SettingsSection;
}[] = [
  {
    label: "General",
    icon: "⚙",
    section: "general",
  },
  {
    label: "Permissions",
    icon: "▣",
    section: "permissions",
  },
  {
    label: "Voice",
    icon: "♩",
    section: "voice",
  },
  {
    label: "Appearance",
    icon: "◌",
    section: "appearance",
  },
  {
    label: "About",
    icon: "ⓘ",
    section: "about",
  },
];

export default function SettingsSidebar({
  activeSection,
  onSelect,
}: SettingsSidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r-2 border-[#171717] p-4">

      <div className="mb-8 flex items-center gap-3 px-2">
        <div
          className="
            flex h-6 w-11
            -rotate-6
            rounded-[50%]
            border-[3px] border-[#e8b800]
            shadow-[2px_2px_0_#171717]
          "
        />

        <div>
          <div className="text-xl font-black">
            Halo
          </div>

          <div className="text-[10px] opacity-50">
            your little assistant
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const active =
            item.section === activeSection;

          return (
            <button
              key={item.section}
              type="button"
              onClick={() =>
                onSelect(item.section)
              }
              className={`
                flex w-full items-center gap-3
                px-3 py-2.5
                text-left text-sm
                transition-none
                ${
                  active
                    ? "border-2 border-[#171717] bg-[#ffd83d] shadow-[3px_3px_0_#171717]"
                    : "border-2 border-transparent hover:bg-[#e9dfc5]"
                }
              `}
            >
              <span className="w-5 text-center">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rotate-[-2deg] px-2 text-[11px] leading-7 opacity-60">
        <div>✎ A small assistant</div>
        <div>for your Mac.</div>
      </div>

    </aside>
  );
}