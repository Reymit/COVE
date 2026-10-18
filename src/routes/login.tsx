import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mark } from "@/components/messenger/ui";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";
import { emailAndPasswordEnabled } from "@/lib/auth/email-password";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"up" | "in">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <main className="boot">
        <h1>Cove</h1>
        <p>Checking your account…</p>
      </main>
    );
  }
  if (user) return <Navigate to="/" />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result =
        mode === "up"
          ? await authClient.signUp.email({
              email: email.trim(),
              password,
              name: name.trim() || email.trim(),
              callbackURL: "/",
            })
          : await authClient.signIn.email({
              email: email.trim(),
              password,
              callbackURL: "/",
            });
      if (result.error) {
        setError(result.error.message ?? "That did not work. Check the email and password.");
        setBusy(false);
        return;
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work.");
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-card">
        <div className="brand-mark" aria-hidden="true">
          <Mark />
        </div>
        <h1>Cove</h1>
        <p className="auth-lead">
          Create an account, pick a username, and other people with accounts can message you.
        </p>
        {emailAndPasswordEnabled ? (
          <form className="stack" onSubmit={(event) => void submit(event)}>
            {mode === "up" ? (
              <label className="field">
                <span>Name</span>
                <input value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
              </label>
            ) : null}
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error ? <p className="field-error">{error}</p> : null}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Please wait…" : mode === "up" ? "Create account" : "Sign in"}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setMode(mode === "up" ? "in" : "up");
                setError("");
              }}
            >
              {mode === "up" ? "I already have an account" : "Need an account?"}
            </button>
          </form>
        ) : null}
        <div className="stack">
          {GROK_PROVIDERS.map((provider) => (
            <button
              key={provider.providerId}
              type="button"
              className="btn-ghost"
              onClick={() => void signIn(provider.providerId, { callbackURL: "/" })}
            >
              Continue with {provider.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
