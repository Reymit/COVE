import { useState } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useMessenger } from "@/lib/messenger/store";
import { Avatar } from "./ui";

export function ProfileSetup() {
  const user = useCurrentUser();
  const saveProfile = useMessenger((s) => s.saveProfile);
  const suggested = (user?.primaryEmail ?? "user")
    .split("@")[0]!
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
  const [name, setName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(suggested.length >= 3 ? suggested : "");
  const [bio, setBio] = useState("");
  const [tone, setTone] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nameError = name.trim() ? "" : "Name is required.";
  const userError = /^[a-z0-9_]{3,20}$/.test(username)
    ? ""
    : "Use 3–20 lowercase letters, numbers, or underscores.";

  return (
    <main className="auth-screen">
      <form
        className="auth-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (nameError || userError || busy) return;
          setBusy(true);
          setError("");
          void saveProfile({ name: name.trim(), username, bio: bio.trim(), tone }).then((message) => {
            setBusy(false);
            if (message) setError(message);
          });
        }}
      >
        <h1>Choose a username</h1>
        <p className="auth-lead">This is how other accounts find you and start a chat. It is public on Cove.</p>
        <div className="profile-hero">
          <Avatar name={name || "You"} tone={tone} size="lg" />
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
                {(name || "?").slice(0, 1).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span>Name</span>
          <input value={name} maxLength={40} autoComplete="name" onChange={(e) => setName(e.target.value)} />
          {nameError ? <span className="field-error">{nameError}</span> : null}
        </label>
        <label className="field">
          <span>Username</span>
          <input
            value={username}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))}
          />
          {userError ? <span className="field-error">{userError}</span> : null}
        </label>
        <label className="field">
          <span>Bio</span>
          <textarea value={bio} maxLength={140} rows={3} onChange={(e) => setBio(e.target.value.slice(0, 140))} />
        </label>
        {error ? <p className="field-error">{error}</p> : null}
        <button type="submit" className="btn-primary" disabled={busy || Boolean(nameError || userError)}>
          {busy ? "Saving…" : "Start messaging"}
        </button>
      </form>
    </main>
  );
}
