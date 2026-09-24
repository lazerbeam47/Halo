import { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";
import Permissions from "./Permissions";
type SettingsSection =
  | "general"
  | "permissions"
  | "voice"
  | "appearance"
  | "about";

export default function Settings() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("permissions");

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f4edda] font-mono text-[#171717]">
      <div className="flex h-full w-full flex-col border-2 border-[#171717] bg-[#f4edda] shadow-[6px_6px_0_#171717]">

        {/* Header */}
        <header className="relative flex h-12 shrink-0 items-center border-b-2 border-[#171717] px-4">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full border border-[#171717] bg-[#ff6257]" />
            <span className="h-3 w-3 rounded-full border border-[#171717] bg-[#ffd43b]" />
            <span className="h-3 w-3 rounded-full border border-[#171717] bg-[#58c878]" />
          </div>

          <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold">
            Halo
          </span>
        </header>

        <div className="flex min-h-0 flex-1">

          <SettingsSidebar
            activeSection={activeSection}
            onSelect={setActiveSection}
          />

          <main className="flex-1 overflow-auto p-12">

            {activeSection === "general" && (
              <SettingsPlaceholder
                title="General"
                description="General Halo settings."
              />
            )}

            {activeSection === "permissions" && (
                <Permissions />
            )}

            {activeSection === "voice" && (
              <SettingsPlaceholder
                title="Voice"
                description="Configure Halo's voice experience."
              />
            )}

            {activeSection === "appearance" && (
              <SettingsPlaceholder
                title="Appearance"
                description="Customize how Halo looks."
              />
            )}

            {activeSection === "about" && (
              <SettingsPlaceholder
                title="About"
                description="Information about Halo."
              />
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

function SettingsPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <h1 className="text-4xl font-black tracking-tight">
        {title}
      </h1>

      <p className="mt-2 text-xs opacity-60">
        {description}
      </p>

      <div className="mt-12 border-2 border-dashed border-[#171717] p-10 text-center">
        <div className="text-3xl text-[#e8b800]">
          ✦
        </div>

        <p className="mt-2 text-xs opacity-60">
          This section is coming next.
        </p>
      </div>
    </>
  );
}