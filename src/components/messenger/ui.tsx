import { Bookmark, Check, CheckCheck, Clock } from "lucide-react";
import { initials } from "@/lib/messenger/format";
import type { MessageStatus } from "@/lib/messenger/types";

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5 6.2A3.2 3.2 0 0 1 8.2 3h7.6A3.2 3.2 0 0 1 19 6.2v6.3a3.2 3.2 0 0 1-3.2 3.2h-3.1L8.4 19.6c-.7.55-1.7.05-1.7-.8v-3.1A3.2 3.2 0 0 1 5 12.5V6.2Z"
      />
    </svg>
  );
}

export function Avatar({
  name,
  tone,
  size,
  saved = false,
  online = false,
}: {
  name: string;
  tone: number;
  size: "sm" | "md" | "lg";
  saved?: boolean;
  online?: boolean;
}) {
  return (
    <span className={`avatar ${size}${saved ? " saved" : ""}`} data-tone={tone} aria-hidden="true">
      {saved ? <Bookmark /> : initials(name)}
      {online && !saved ? <i className="presence" /> : null}
    </span>
  );
}

export function Status({ status }: { status: MessageStatus }) {
  if (status === "sending") return <Clock className="status-icon" aria-hidden="true" />;
  if (status === "sent") return <Check className="status-icon" aria-hidden="true" />;
  const read = status === "read";
  return <CheckCheck className={`status-icon${read ? " is-read" : ""}`} aria-hidden="true" />;
}

const URL_RE = /(https?:\/\/[^\s]+)/g;

export function MessageText({ text, linkify }: { text: string; linkify: boolean }) {
  if (!linkify) return text;
  const parts = text.split(URL_RE);
  return parts.map((part, index) => {
    if (!/^https?:\/\//.test(part)) return <span key={index}>{part}</span>;
    const url = part.replace(/[),.;!?]+$/, "");
    const trail = part.slice(url.length);
    return (
      <span key={index}>
        <a href={url} target="_blank" rel="noreferrer noopener">
          {url}
        </a>
        {trail}
      </span>
    );
  });
}
