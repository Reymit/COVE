import { useEffect, useState, type ReactNode } from "react";
import * as Switch from "@radix-ui/react-switch";
import { ArrowLeft, Monitor, Moon, Sun } from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { initials } from "@/lib/messenger/format";
import { useMessenger } from "@/lib/messenger/store";
import { Avatar } from "./ui";

export function SettingsPanel() {
  const panel = useMessenger((s) => s.panel);
  if (panel === "profile") return <ProfileEditor />;
  return <SettingsHome />;
}

function SettingsHome() {
  const profile = useMessenger((s) => s.profile);
  const settings = useMessenger((s) => s.settings);
  const openPanel = useMessenger((s) => s.openPanel);
  const updateSettings = useMessenger((s) => s.updateSettings);

  return (
    <>
      <header className="panel-head">
        <button type="button" className="icon-btn" aria-label="Back to chats" onClick={() => openPanel("none")}>
          <ArrowLeft />
        </button>
        <h1>Settings</h1>
      </header>
      <div className="panel-scroll">
        <div className="profile-hero">
          <Avatar name={profile.name} tone={profile.tone} size="lg" />
          <h2>{profile.name}</h2>
          <p className="handle">@{profile.username}</p>
          {profile.bio ? <p className="bio">{profile.bio}</p> : null}
        </div>
        <div className="stack">
          <button type="button" className="btn-primary" onClick={() => openPanel("profile")}>
            Edit profile
          </button>

          <section className="block">
            <h2 className="block-label">Notifications</h2>
            <Toggle
              label="Banners and sound"
              hint="When a reply arrives in another chat."
              checked={settings.notifications}
              onChange={(notifications) => updateSettings({ notifications })}
            />
          </section>

          <section className="block">
            <h2 className="block-label">Privacy</h2>
            <Toggle
              label="Read receipts"
              hint="When off, your checks stay gray and you won’t see blue ones."
              checked={settings.readReceipts}
              onChange={(readReceipts) => updateSettings({ readReceipts })}
            />
            <Toggle
              label="Show last seen"
              hint="When off, exact times are hidden for everyone."
              checked={settings.showLastSeen}
              onChange={(showLastSeen) => updateSettings({ showLastSeen })}
            />
          </section>

          <section className="block">
            <h2 className="block-label">Appearance</h2>
            <Segment
              label="Theme"
              value={settings.theme}
              onChange={(theme) => updateSettings({ theme })}
              options={[
                { value: "light" as const, label: "Light", icon: <Sun /> },
                { value: "dark" as const, label: "Dark", icon: <Moon /> },
                { value: "system" as const, label: "System", icon: <Monitor /> },
              ]}
            />
            <Segment
              label="Text size"
              value={settings.textSize}
              onChange={(textSize) => updateSettings({ textSize })}
              options={[
                { value: "sm" as const, label: "Small" },
                { value: "md" as const, label: "Default" },
                { value: "lg" as const, label: "Large" },
              ]}
            />
            <Segment
              label="Wallpaper"
              value={settings.wallpaper}
              onChange={(wallpaper) => updateSettings({ wallpaper })}
              options={[
                { value: "plain" as const, label: "Plain" },
                { value: "dots" as const, label: "Dots" },
                { value: "grid" as const, label: "Grid" },
              ]}
            />
          </section>

          <section className="block">
            <h2 className="block-label">Messages</h2>
            <Toggle
              label="Send with Enter"
              hint="Shift+Enter always adds a new line. The button always sends."
              checked={settings.sendWithEnter}
              onChange={(sendWithEnter) => updateSettings({ sendWithEnter })}
            />
            <Toggle
              label="Link previews"
              hint="Turn web addresses in messages into links."
              checked={settings.previewLinks}
              onChange={(previewLinks) => updateSettings({ previewLinks })}
            />
          </section>

          <section className="block">
            <h2 className="block-label">Your account</h2>
            <p className="setting-hint">
              Other people create an account, then search <strong>@{profile.username}</strong> to message you.
              Chats are shared between your accounts, not stored only on this device.
            </p>
            <UserButton />
          </section>
        </div>
      </div>
    </>
  );
}

function ProfileEditor() {
  const profile = useMessenger((s) => s.profile);
  const openPanel = useMessenger((s) => s.openPanel);
  const saveProfile = useMessenger((s) => s.saveProfile);
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [tone, setTone] = useState(profile.tone);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setTone(profile.tone);
  }, [profile]);

  const nameError = name.trim() ? "" : "Name is required.";
  const userError = /^[a-z0-9_]{3,20}$/.test(username)
    ? ""
    : "Use 3–20 lowercase letters, numbers, or underscores.";
  const valid = !nameError && !userError;

  return (
    <>
      <header className="panel-head">
        <button type="button" className="icon-btn" aria-label="Back to settings" onClick={() => openPanel("settings")}>
          <ArrowLeft />
        </button>
        <h1>Edit profile</h1>
      </header>
      <form
        className="panel-scroll"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid || busy) return;
          setBusy(true);
          setError("");
          void saveProfile({ name: name.trim(), username, bio: bio.trim(), tone }).then((message) => {
            setBusy(false);
            if (message) setError(message);
            else openPanel("settings");
          });
        }}
      >
        <div className="profile-hero">
          <Avatar name={name || profile.name} tone={tone} size="lg" />
          <div className="swatches" role="group" aria-label="Avatar color">
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="swatch avatar"
                data-tone={value}
                aria-pressed={tone === value}
                aria-label={`Avatar color ${value + 1}`}
                onClick={() => setTone(value)}
              >
                {initials(name || profile.name).slice(0, 1)}
              </button>
            ))}
          </div>
        </div>
        <div className="fields">
          <label className="field">
            <span>Name</span>
            <input
              value={name}
              maxLength={40}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
            />
            {nameError ? <span className="field-error">{nameError}</span> : null}
          </label>
          <label className="field">
            <span>Username</span>
            <input
              value={username}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) =>
                setUsername(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "")
                    .slice(0, 20),
                )
              }
            />
            {userError ? <span className="field-error">{userError}</span> : null}
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea
              value={bio}
              maxLength={140}
              rows={4}
              onChange={(e) => setBio(e.target.value.slice(0, 140))}
            />
            <span className="counter">{bio.trim().length}/140</span>
          </label>
          {error ? <p className="field-error">{error}</p> : null}
          <button type="submit" className="btn-primary" disabled={!valid || busy}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <div className="setting-row">
      <div>
        <p className="setting-label" id={id}>
          {label}
        </p>
        <p className="setting-hint" id={`${id}-hint`}>
          {hint}
        </p>
      </div>
      <Switch.Root
        className="switch"
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={id}
        aria-describedby={`${id}-hint`}
      >
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
    </div>
  );
}

function Segment<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="block">
      <p className="setting-label">{label}</p>
      <div className="segment" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`segment-btn${value === opt.value ? " is-on" : ""}`}
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
