import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useState } from "react";
import { MessengerApp } from "@/components/messenger/messenger-app";
import { ProfileSetup } from "@/components/messenger/setup";
import { Mark } from "@/components/messenger/ui";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useMessenger } from "@/lib/messenger/store";
import { applyTheme } from "@/lib/messenger/theme";

export const Route = createFileRoute("/")({ component: Home });

function Boot() {
  return (
    <main className="boot">
      <div className="brand-mark" aria-hidden="true">
        <Mark />
      </div>
      <h1>Cove</h1>
      <p>Messages</p>
    </main>
  );
}

function Home() {
  const { user, isPending } = useCurrentUserState();
  const [settingsReady, setSettingsReady] = useState(false);

  useLayoutEffect(() => {
    let cancelled = false;
    void Promise.resolve(useMessenger.persist.rehydrate()).finally(() => {
      if (cancelled) return;
      applyTheme(useMessenger.getState().settings.theme);
      setSettingsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isPending || !settingsReady) return <Boot />;
  if (!user) return <Navigate to="/login" />;
  return <LiveApp />;
}

function LiveApp() {
  const booted = useMessenger((s) => s.booted);
  const needsProfile = useMessenger((s) => s.needsProfile);

  useEffect(() => {
    void useMessenger.getState().refresh();
  }, []);

  if (!booted) return <Boot />;
  if (needsProfile) return <ProfileSetup />;
  return <MessengerApp />;
}
