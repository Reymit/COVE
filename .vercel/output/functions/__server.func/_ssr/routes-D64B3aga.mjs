import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as Bookmark, a as Send, c as Pencil, d as EllipsisVertical, f as CornerUpLeft, g as CheckCheck, h as Check, i as Sun, l as Moon, m as Clock, o as Search, p as Copy, r as Trash2, s as Pin, t as X, u as Monitor, v as BellOff, y as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { n as SwitchThumb, t as Switch } from "../_libs/@radix-ui/react-switch+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D64B3aga.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cx(...parts) {
	return parts.filter(Boolean).join(" ");
}
function initials(name) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
function lastActivity(chat) {
	return chat.messages.at(-1)?.createdAt ?? 0;
}
function sortChats(chats) {
	return [...chats].sort((a, b) => {
		if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
		if (a.pinned && b.pinned && a.pinRank !== b.pinRank) return a.pinRank - b.pinRank;
		return lastActivity(b) - lastActivity(a);
	});
}
function unreadCount(chat) {
	return chat.messages.reduce((n, m) => n + (m.from === "them" && m.createdAt > chat.lastReadAt ? 1 : 0), 0);
}
function formatClock(ts) {
	return new Date(ts).toLocaleTimeString(void 0, {
		hour: "numeric",
		minute: "2-digit"
	});
}
function formatListTime(ts, now = Date.now()) {
	const d = new Date(ts);
	const today = new Date(now);
	if (d.toDateString() === today.toDateString()) return formatClock(ts);
	const y = /* @__PURE__ */ new Date(now - 864e5);
	if (d.toDateString() === y.toDateString()) return "Yesterday";
	if (now - ts < 6048e5) return d.toLocaleDateString(void 0, { weekday: "short" });
	return d.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function formatDayLabel(ts, now = Date.now()) {
	const d = new Date(ts);
	const today = new Date(now);
	if (d.toDateString() === today.toDateString()) return "Today";
	const y = /* @__PURE__ */ new Date(now - 864e5);
	if (d.toDateString() === y.toDateString()) return "Yesterday";
	return d.toLocaleDateString(void 0, {
		month: "long",
		day: "numeric",
		year: d.getFullYear() === today.getFullYear() ? void 0 : "numeric"
	});
}
function formatLastSeen(ts, now = Date.now()) {
	if (new Date(ts).toDateString() === new Date(now).toDateString()) return `today at ${formatClock(ts)}`;
	return formatListTime(ts, now).toLowerCase();
}
function presenceLine(chat, showLastSeen) {
	if (chat.kind === "saved") return "Only visible to you";
	if (chat.typing) return "typing…";
	if (chat.online) return "online";
	if (!showLastSeen) return "last seen recently";
	return `last seen ${formatLastSeen(chat.lastSeen)}`;
}
function lastPreview(chat) {
	const last = chat.messages.at(-1);
	if (!last) return "No messages yet";
	return `${last.from === "me" ? "You: " : ""}${last.text}`;
}
function chatVisible(chat, folder, query) {
	if (folder === "unread" && unreadCount(chat) === 0) return false;
	if (folder === "personal" && chat.folder !== "personal") return false;
	if (folder === "work" && chat.folder !== "work") return false;
	const q = query.trim().toLowerCase();
	if (!q) return true;
	if (chat.name.toLowerCase().includes(q) || chat.username.toLowerCase().includes(q)) return true;
	return chat.messages.some((m) => m.text.toLowerCase().includes(q));
}
function searchPreview(chat, query) {
	const q = query.trim().toLowerCase();
	if (!q) return null;
	if (chat.name.toLowerCase().includes(q) || chat.username.toLowerCase().includes(q)) return null;
	return [...chat.messages].reverse().find((m) => m.text.toLowerCase().includes(q))?.text ?? null;
}
function sameDay(a, b) {
	const da = new Date(a);
	const db = new Date(b);
	return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
var PERSONAS = {
	maya: {
		greetings: ["Hey. I’m between critiques — what’s up?", "Hi. I have a few minutes if this is about the layout."],
		acks: [
			"Got it. I’ll fold that into the next pass.",
			"Thanks. I’ll keep the change small.",
			"Okay. I’ll look again after this call."
		],
		questions: [
			"I’d keep the answer simple and decide today.",
			"Not from memory. I’ll open the file and reply properly.",
			"Yes, if we don’t add another layer to it."
		],
		rules: [{
			keys: [
				"layout",
				"type",
				"font",
				"spacing",
				"color",
				"screen",
				"design",
				"avatar"
			],
			lines: [
				"The spacing note lands. I’ll try a quieter step and send a crop.",
				"If the title moves up one step, the name reads before the bio.",
				"I’ll check that on a narrow width before I call it done."
			]
		}, {
			keys: [
				"meet",
				"call",
				"tomorrow",
				"today",
				"lunch",
				"time"
			],
			lines: ["I can do a call after 3. Does that still work?", "Tomorrow morning is clear on my side."]
		}],
		fallbacks: [
			"Read it. I’ll sit with “{q}” and come back with a tighter version.",
			"Makes sense. Want me to mark “{q}” on the board?",
			"Noted. I’ll reply properly once I’m off this critique."
		]
	},
	jonah: {
		greetings: ["Hey. You caught me between errands.", "Hi. What’s the plan?"],
		acks: [
			"Perfect.",
			"Sounds good. I’ll hold the table.",
			"Cool. See you then."
		],
		questions: [
			"I’m easy either way. You pick.",
			"Seven still works if you do.",
			"Let’s not overthink it — yes."
		],
		rules: [{
			keys: [
				"saturday",
				"sunday",
				"weekend",
				"dinner",
				"movie",
				"tonight"
			],
			lines: ["Saturday still works. I’ll be outside a few minutes early.", "If dinner slips, we can walk first and eat after."]
		}, {
			keys: [
				"coffee",
				"pizza",
				"food",
				"eat",
				"hungry"
			],
			lines: ["Pizza is the right call. I’ll order once you’re close.", "I can grab coffee on the way if you want one."]
		}],
		fallbacks: [
			"Ha. “{q}” — I’m in.",
			"Okay, I hear you. I’ll text when I leave.",
			"Got it. Don’t leave me standing on Mercer."
		]
	},
	leila: {
		greetings: ["Hi. I have ten minutes before the next review.", "Hello. Send the short version."],
		acks: [
			"Received. I’ll assume that’s final.",
			"Thanks. I’ll close the thread.",
			"Noted."
		],
		questions: [
			"I need the decision, not the options. Which one are we shipping?",
			"If it’s blocking the review, say so and I’ll move the meeting.",
			"Yes. Put it in the doc so the rest of the room can see it."
		],
		rules: [{
			keys: [
				"note",
				"doc",
				"deck",
				"review",
				"deadline",
				"ship",
				"question"
			],
			lines: [
				"Add it to the doc before 4 and ping me when it’s there.",
				"Keep the status line to one sentence. I’ll read the rest in the doc.",
				"The open questions belong at the top, not the appendix."
			]
		}],
		fallbacks: [
			"Understood. “{q}” is on my list.",
			"I’ll take that into the review. Send the link if it isn’t in the doc yet.",
			"Clear. I’ll follow up if anything is still open after 4."
		]
	},
	imani: {
		greetings: ["Hello. This is the office line — how can I help?", "Hi. I have your chart open."],
		acks: [
			"Thank you. We’ll keep the time as scheduled.",
			"Noted. Message us if anything changes.",
			"All set on our side."
		],
		questions: [
			"If this is about symptoms that feel urgent, call the office directly.",
			"Thursday still stands unless you need a different time.",
			"I can answer the scheduling part here. Clinical questions are better on a call."
		],
		rules: [{
			keys: [
				"thursday",
				"appointment",
				"time",
				"reschedule",
				"office",
				"late"
			],
			lines: ["You’re on the book for Thursday at 10:20. Arrive a few minutes early.", "If you need to move it, send two times that work and we’ll confirm one."]
		}, {
			keys: [
				"pain",
				"prescription",
				"medicine",
				"symptom",
				"dose"
			],
			lines: ["I don’t want to guess on that in a message. Call the office and ask for the nurse line.", "Bring the name of anything you’re taking. We’ll review it in the room."]
		}],
		fallbacks: [
			"I saw “{q}”. If it’s scheduling, we can handle it here.",
			"Thanks for the note. We’ll see you at the visit unless you write back.",
			"Received. The front desk can confirm anything I’m missing."
		]
	}
};
function hash(value) {
	let h = 0;
	for (let i = 0; i < value.length; i += 1) h = h * 31 + value.charCodeAt(i) >>> 0;
	return h;
}
function pick(lines, salt) {
	return lines[hash(salt) % lines.length] ?? lines[0] ?? "Got it.";
}
function fill(line, snippet) {
	return line.replaceAll("{q}", snippet);
}
function craftReply(chatId, text) {
	const clean = text.replace(/\s+/g, " ").trim();
	const snippet = clean.length > 72 ? `${clean.slice(0, 69)}…` : clean;
	const lower = clean.toLowerCase();
	const persona = PERSONAS[chatId] ?? PERSONAS.maya;
	if (/^(hi|hey|hello|good morning|good evening)\b/.test(lower)) return pick(persona.greetings, clean);
	if (/^(ok|okay|sure|yes|yep|no|nope|thanks|thank you|cool|nice|perfect)\b/.test(lower)) return pick(persona.acks, clean);
	for (const rule of persona.rules) if (rule.keys.some((key) => lower.includes(key))) return fill(pick(rule.lines, clean), snippet);
	if (clean.endsWith("?")) return fill(pick(persona.questions, clean), snippet);
	return fill(pick(persona.fallbacks, clean), snippet);
}
var defaultProfile = {
	name: "Alex Rivera",
	username: "arivera",
	bio: "Building quiet tools.",
	tone: 0
};
var defaultSettings = {
	theme: "light",
	textSize: "md",
	wallpaper: "dots",
	notifications: true,
	sendWithEnter: true,
	readReceipts: true,
	showLastSeen: true,
	previewLinks: true
};
function msg(id, from, text, createdAt, status = "read") {
	return {
		id,
		from,
		text,
		createdAt,
		status
	};
}
function buildSeed(now = Date.now()) {
	const t = (mins) => now - mins * 6e4;
	const mayaRead = t(1560);
	const leilaRead = t(50);
	const jonahLast = t(1620);
	const imaniLast = t(8640);
	const savedLast = t(120);
	return [
		{
			id: "maya",
			kind: "direct",
			name: "Maya Chen",
			username: "mayachen",
			bio: "Product designer. I care about type, spacing, and quiet screens.",
			tone: 1,
			folder: "personal",
			online: true,
			lastSeen: now,
			pinned: true,
			pinRank: 0,
			muted: false,
			lastReadAt: mayaRead,
			typing: false,
			messages: [
				msg("maya-1", "them", "The settings sheet still feels dense. I mocked a looser version with the title a step larger.", t(1800)),
				msg("maya-2", "me", "Send it when you can. I want the name to read before the bio.", t(1740)),
				msg("maya-3", "them", "Uploaded. The avatar sits too close to the name on narrow widths.", t(1680)),
				msg("maya-4", "me", "I’ll pull the stack apart and check it on a phone.", mayaRead),
				msg("maya-5", "them", "Did the phone pass feel better?", t(18)),
				msg("maya-6", "them", "I left a note on the type ramp if you want a second pair of eyes.", t(12))
			]
		},
		{
			id: "saved",
			kind: "saved",
			name: "Saved messages",
			username: "saved",
			bio: "Notes only you can see. Nothing here is sent to anyone else.",
			tone: 0,
			folder: "personal",
			online: false,
			lastSeen: savedLast,
			pinned: true,
			pinRank: 1,
			muted: false,
			lastReadAt: savedLast,
			typing: false,
			messages: [msg("saved-1", "me", "Pick up the paper samples before Friday.", t(400)), msg("saved-2", "me", "Ask Maya about a quieter blue for outgoing messages.", savedLast)]
		},
		{
			id: "leila",
			kind: "direct",
			name: "Leila Ortiz",
			username: "leila",
			bio: "Studio North. Reviews, notes, and the things that have to ship.",
			tone: 2,
			folder: "work",
			online: true,
			lastSeen: now,
			pinned: false,
			pinRank: 0,
			muted: false,
			lastReadAt: leilaRead,
			typing: false,
			messages: [
				msg("leila-1", "me", "Shipping the sidebar today. I’ll flag you when the empty state is in.", t(180)),
				msg("leila-2", "them", "Good. Keep the status line to one sentence.", leilaRead),
				msg("leila-3", "them", "Review notes from this morning are in the doc. Can you add the open questions before 4?", t(40))
			]
		},
		{
			id: "jonah",
			kind: "direct",
			name: "Jonah Hale",
			username: "jonah",
			bio: "Friend. Usually late, always hungry.",
			tone: 3,
			folder: "personal",
			online: false,
			lastSeen: t(25),
			pinned: false,
			pinRank: 0,
			muted: false,
			lastReadAt: jonahLast,
			typing: false,
			messages: [
				msg("jonah-1", "them", "Saturday is still on if you are. The place on Mercer has a table at 7.", t(1680)),
				msg("jonah-2", "me", "I’ll be there by six so we can walk.", t(1650)),
				msg("jonah-3", "them", "Perfect. I’ll grab the corner.", jonahLast)
			]
		},
		{
			id: "imani",
			kind: "direct",
			name: "Dr. Imani Okonkwo",
			username: "dr.okonkwo",
			bio: "Office messages only. Call the desk for anything urgent.",
			tone: 4,
			folder: "personal",
			online: false,
			lastSeen: t(300),
			pinned: false,
			pinRank: 0,
			muted: true,
			lastReadAt: imaniLast,
			typing: false,
			messages: [
				msg("imani-1", "them", "Your follow-up is set for Thursday at 10:20. Arrive a few minutes early if you can.", t(8670)),
				msg("imani-2", "me", "Thursday works. I’ll be there.", t(8650)),
				msg("imani-3", "them", "We’ll see you then. Message the office if the time stops working.", imaniLast)
			]
		}
	];
}
var viewing = {
	chatId: null,
	visible: false
};
var typingTimers = /* @__PURE__ */ new Map();
var replyTimers = /* @__PURE__ */ new Map();
var generations = /* @__PURE__ */ new Map();
var audio = null;
function primeAudio() {
	try {
		if (!audio) audio = new AudioContext();
		if (audio.state === "suspended") audio.resume();
	} catch {
		audio = null;
	}
}
function playChime() {
	if (!audio) return;
	const ctx = audio;
	const now = ctx.currentTime;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = "sine";
	osc.frequency.setValueAtTime(740, now);
	osc.frequency.exponentialRampToValueAtTime(520, now + .12);
	gain.gain.setValueAtTime(1e-4, now);
	gain.gain.exponentialRampToValueAtTime(.035, now + .02);
	gain.gain.exponentialRampToValueAtTime(1e-4, now + .22);
	osc.connect(gain);
	gain.connect(ctx.destination);
	osc.start(now);
	osc.stop(now + .24);
}
function invalidateTimers(chatId) {
	const ids = chatId ? [chatId] : [.../* @__PURE__ */ new Set([
		...typingTimers.keys(),
		...replyTimers.keys(),
		...generations.keys()
	])];
	for (const id of ids) {
		generations.set(id, (generations.get(id) ?? 0) + 1);
		const typing = typingTimers.get(id);
		const reply = replyTimers.get(id);
		if (typing) window.clearTimeout(typing);
		if (reply) window.clearTimeout(reply);
		typingTimers.delete(id);
		replyTimers.delete(id);
	}
}
function patchStatus(chatId, messageId, status, forceRead = false) {
	useMessenger.setState((s) => ({ chats: s.chats.map((c) => c.id !== chatId ? c : {
		...c,
		messages: c.messages.map((m) => {
			if (m.id !== messageId) return m;
			const rank = {
				sending: 0,
				sent: 1,
				delivered: 2,
				read: 3
			};
			if (rank[m.status] >= rank[status]) return m;
			if (status === "read" && !forceRead && !s.settings.readReceipts) return m;
			return {
				...m,
				status
			};
		})
	}) }));
}
function deliverReply(chatId, text) {
	const reply = craftReply(chatId, text);
	const incomingId = crypto.randomUUID();
	const at = Date.now();
	const snapshot = useMessenger.getState();
	const chat = snapshot.chats.find((c) => c.id === chatId);
	if (!chat || chat.kind === "saved") return;
	const seen = viewing.visible && viewing.chatId === chatId;
	const notify = !seen && snapshot.settings.notifications && !chat.muted;
	const receipts = snapshot.settings.readReceipts;
	useMessenger.setState((s) => ({
		live: `${chat.name}. ${reply}`,
		chats: s.chats.map((c) => {
			if (c.id !== chatId) return c;
			return {
				...c,
				typing: false,
				lastReadAt: seen ? at : c.lastReadAt,
				messages: [...c.messages.map((m) => {
					if (m.from !== "me") return m;
					if (!receipts) {
						if (m.status === "sending" || m.status === "sent") return {
							...m,
							status: "delivered"
						};
						return m;
					}
					if (m.status === "sending") return m;
					return {
						...m,
						status: "read"
					};
				}), {
					id: incomingId,
					from: "them",
					text: reply,
					createdAt: at,
					status: "read"
				}]
			};
		}),
		notice: notify ? {
			id: incomingId,
			title: chat.name,
			body: reply,
			chatId
		} : s.notice
	}));
	if (notify) playChime();
}
function scheduleReply(chatId, text) {
	invalidateTimers(chatId);
	const gen = generations.get(chatId) ?? 0;
	const delay = 980 + Math.min(text.length * 28, 1500);
	typingTimers.set(chatId, window.setTimeout(() => {
		if (generations.get(chatId) !== gen) return;
		useMessenger.setState((s) => ({ chats: s.chats.map((c) => c.id === chatId ? {
			...c,
			typing: true
		} : c) }));
	}, 420));
	replyTimers.set(chatId, window.setTimeout(() => {
		if (generations.get(chatId) !== gen) return;
		deliverReply(chatId, text);
	}, delay));
}
var memoryStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
};
var useMessenger = create()(persist((set, get) => ({
	profile: defaultProfile,
	settings: defaultSettings,
	chats: buildSeed(),
	activeChatId: null,
	mobileThread: false,
	panel: "none",
	folder: "all",
	listQuery: "",
	drafts: {},
	replyTo: {},
	editingId: null,
	selectedMessageId: null,
	threadSearchOpen: false,
	threadQuery: "",
	notice: null,
	live: "",
	selectChat: (id, mobileThread = true) => set({
		activeChatId: id,
		mobileThread,
		panel: "none",
		selectedMessageId: null,
		editingId: null,
		threadSearchOpen: false,
		threadQuery: ""
	}),
	closeThread: () => set({
		mobileThread: false,
		selectedMessageId: null,
		threadSearchOpen: false,
		editingId: null
	}),
	openPanel: (panel) => set({
		panel,
		selectedMessageId: null
	}),
	setFolder: (folder) => set({ folder }),
	setListQuery: (listQuery) => set({ listQuery }),
	setDraft: (chatId, text) => set((s) => ({ drafts: {
		...s.drafts,
		[chatId]: text
	} })),
	setReplyTo: (chatId, messageId) => set((s) => ({
		replyTo: {
			...s.replyTo,
			[chatId]: messageId
		},
		editingId: null,
		selectedMessageId: null
	})),
	selectMessage: (selectedMessageId) => set({ selectedMessageId }),
	startEdit: (messageId) => set((s) => ({
		editingId: messageId,
		selectedMessageId: null,
		replyTo: s.activeChatId ? {
			...s.replyTo,
			[s.activeChatId]: null
		} : s.replyTo
	})),
	cancelEdit: () => set({ editingId: null }),
	commitEdit: (chatId, messageId, raw) => {
		const text = raw.trim();
		if (!text) return;
		set((s) => ({
			editingId: null,
			selectedMessageId: null,
			chats: s.chats.map((c) => c.id !== chatId ? c : {
				...c,
				messages: c.messages.map((m) => m.id === messageId ? {
					...m,
					text,
					edited: true
				} : m)
			})
		}));
	},
	deleteMessage: (chatId, messageId) => set((s) => ({
		selectedMessageId: s.selectedMessageId === messageId ? null : s.selectedMessageId,
		editingId: s.editingId === messageId ? null : s.editingId,
		replyTo: Object.fromEntries(Object.entries(s.replyTo).map(([key, value]) => [key, value === messageId ? null : value])),
		chats: s.chats.map((c) => c.id !== chatId ? c : {
			...c,
			messages: c.messages.filter((m) => m.id !== messageId)
		})
	})),
	sendMessage: (chatId, raw) => {
		const text = raw.trim();
		if (!text) return;
		const state = get();
		const chat = state.chats.find((c) => c.id === chatId);
		if (!chat) return;
		primeAudio();
		const id = crypto.randomUUID();
		const createdAt = Date.now();
		const replyToId = state.replyTo[chatId] ?? void 0;
		set({
			drafts: {
				...state.drafts,
				[chatId]: ""
			},
			replyTo: {
				...state.replyTo,
				[chatId]: null
			},
			editingId: null,
			selectedMessageId: null,
			chats: state.chats.map((c) => c.id !== chatId ? c : {
				...c,
				messages: [...c.messages, {
					id,
					from: "me",
					text,
					createdAt,
					status: "sending",
					replyToId: replyToId || void 0
				}]
			})
		});
		window.setTimeout(() => patchStatus(chatId, id, "sent"), 240);
		window.setTimeout(() => patchStatus(chatId, id, "delivered"), 560);
		if (chat.kind === "saved") {
			window.setTimeout(() => patchStatus(chatId, id, "read", true), 780);
			return;
		}
		scheduleReply(chatId, text);
	},
	togglePin: (chatId) => set((s) => {
		const min = Math.min(0, ...s.chats.filter((c) => c.pinned).map((c) => c.pinRank));
		return { chats: s.chats.map((c) => c.id !== chatId ? c : {
			...c,
			pinned: !c.pinned,
			pinRank: c.pinned ? c.pinRank : min - 1
		}) };
	}),
	toggleMute: (chatId) => set((s) => ({ chats: s.chats.map((c) => c.id === chatId ? {
		...c,
		muted: !c.muted
	} : c) })),
	markRead: (chatId) => set((s) => {
		let changed = false;
		const chats = s.chats.map((c) => {
			if (c.id !== chatId) return c;
			const latest = c.messages.reduce((n, m) => Math.max(n, m.createdAt), 0);
			if (c.lastReadAt >= latest) return c;
			changed = true;
			return {
				...c,
				lastReadAt: latest
			};
		});
		return changed ? { chats } : s;
	}),
	markUnread: (chatId) => set((s) => ({ chats: s.chats.map((c) => {
		if (c.id !== chatId) return c;
		const incoming = [...c.messages].reverse().find((m) => m.from === "them");
		if (!incoming) return c;
		return {
			...c,
			lastReadAt: incoming.createdAt - 1
		};
	}) })),
	clearHistory: (chatId) => {
		invalidateTimers(chatId);
		set((s) => ({
			editingId: null,
			selectedMessageId: null,
			drafts: {
				...s.drafts,
				[chatId]: ""
			},
			replyTo: {
				...s.replyTo,
				[chatId]: null
			},
			chats: s.chats.map((c) => c.id === chatId ? {
				...c,
				typing: false,
				messages: [],
				lastReadAt: Date.now()
			} : c)
		}));
	},
	setThreadSearchOpen: (threadSearchOpen) => set(threadSearchOpen ? { threadSearchOpen } : {
		threadSearchOpen,
		threadQuery: ""
	}),
	setThreadQuery: (threadQuery) => set({ threadQuery }),
	dismissNotice: () => set({ notice: null }),
	flash: (title, body) => set({ notice: {
		id: crypto.randomUUID(),
		title,
		body,
		chatId: null
	} }),
	saveProfile: (profile) => set({
		profile,
		notice: {
			id: crypto.randomUUID(),
			title: "Profile updated",
			body: `${profile.name} · @${profile.username}`,
			chatId: null
		}
	}),
	updateSettings: (patch) => set((s) => {
		const settings = {
			...s.settings,
			...patch
		};
		let chats = s.chats;
		if (patch.readReceipts === false) chats = s.chats.map((c) => ({
			...c,
			messages: c.messages.map((m) => m.from === "me" && m.status === "read" ? {
				...m,
				status: "delivered"
			} : m)
		}));
		return {
			settings,
			chats
		};
	}),
	resetDemo: () => {
		invalidateTimers();
		set({
			chats: buildSeed(),
			drafts: {},
			replyTo: {},
			activeChatId: "maya",
			editingId: null,
			selectedMessageId: null,
			threadQuery: "",
			threadSearchOpen: false,
			notice: {
				id: crypto.randomUUID(),
				title: "Chats reset",
				body: "Sample conversations are back. Your profile and settings stayed.",
				chatId: null
			}
		});
	}
}), {
	name: "cove-messenger-v1",
	storage: createJSONStorage(() => typeof window === "undefined" ? memoryStorage : localStorage),
	skipHydration: true,
	partialize: (s) => ({
		profile: s.profile,
		settings: s.settings,
		chats: s.chats.map((c) => ({
			...c,
			typing: false
		})),
		activeChatId: s.activeChatId,
		drafts: s.drafts,
		replyTo: s.replyTo,
		folder: s.folder
	}),
	onRehydrateStorage: () => (state) => {
		if (!state) return;
		useMessenger.setState({
			settings: {
				...defaultSettings,
				...state.settings
			},
			chats: (state.chats ?? buildSeed()).map((c) => ({
				...c,
				typing: false
			})),
			panel: "none",
			mobileThread: false,
			notice: null,
			live: "",
			listQuery: "",
			threadQuery: "",
			threadSearchOpen: false,
			selectedMessageId: null,
			editingId: null
		});
	}
}));
function applyTheme(mode) {
	const dark = mode === "dark" || mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches;
	document.documentElement.dataset.theme = dark ? "dark" : "light";
	document.documentElement.style.colorScheme = dark ? "dark" : "light";
	document.querySelector("meta[name=\"theme-color\"]")?.setAttribute("content", dark ? "#17212b" : "#ffffff");
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		className,
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M5 6.2A3.2 3.2 0 0 1 8.2 3h7.6A3.2 3.2 0 0 1 19 6.2v6.3a3.2 3.2 0 0 1-3.2 3.2h-3.1L8.4 19.6c-.7.55-1.7.05-1.7-.8v-3.1A3.2 3.2 0 0 1 5 12.5V6.2Z"
		})
	});
}
function Avatar({ name, tone, size, saved = false, online = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `avatar ${size}${saved ? " saved" : ""}`,
		"data-tone": tone,
		"aria-hidden": "true",
		children: [saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {}) : initials(name), online && !saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "presence" }) : null]
	});
}
function Status({ status }) {
	if (status === "sending") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
		className: "status-icon",
		"aria-hidden": "true"
	});
	if (status === "sent") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
		className: "status-icon",
		"aria-hidden": "true"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, {
		className: `status-icon${status === "read" ? " is-read" : ""}`,
		"aria-hidden": "true"
	});
}
var URL_RE = /(https?:\/\/[^\s]+)/g;
function MessageText({ text, linkify }) {
	if (!linkify) return text;
	return text.split(URL_RE).map((part, index) => {
		if (!/^https?:\/\//.test(part)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }, index);
		const url = part.replace(/[),.;!?]+$/, "");
		const trail = part.slice(url.length);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: url,
			target: "_blank",
			rel: "noreferrer noopener",
			children: url
		}), trail] }, index);
	});
}
function SettingsPanel() {
	if (useMessenger((s) => s.panel) === "profile") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileEditor, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsHome, {});
}
function SettingsHome() {
	const profile = useMessenger((s) => s.profile);
	const settings = useMessenger((s) => s.settings);
	const openPanel = useMessenger((s) => s.openPanel);
	const updateSettings = useMessenger((s) => s.updateSettings);
	const resetDemo = useMessenger((s) => s.resetDemo);
	const [confirmReset, setConfirmReset] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "panel-head",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "icon-btn",
			"aria-label": "Back to chats",
			onClick: () => openPanel("none"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Settings" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel-scroll",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "profile-hero",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					name: profile.name,
					tone: profile.tone,
					size: "lg"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: profile.name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "handle",
					children: ["@", profile.username]
				}),
				profile.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "bio",
					children: profile.bio
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "stack",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-primary",
					onClick: () => openPanel("profile"),
					children: "Edit profile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "block-label",
						children: "Notifications"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "Banners and sound",
						hint: "When a reply arrives in another chat.",
						checked: settings.notifications,
						onChange: (notifications) => updateSettings({ notifications })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "block-label",
							children: "Privacy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Read receipts",
							hint: "When off, your checks stay gray and you won’t see blue ones.",
							checked: settings.readReceipts,
							onChange: (readReceipts) => updateSettings({ readReceipts })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Show last seen",
							hint: "When off, exact times are hidden for everyone.",
							checked: settings.showLastSeen,
							onChange: (showLastSeen) => updateSettings({ showLastSeen })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "block-label",
							children: "Appearance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segment, {
							label: "Theme",
							value: settings.theme,
							onChange: (theme) => updateSettings({ theme }),
							options: [
								{
									value: "light",
									label: "Light",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {})
								},
								{
									value: "dark",
									label: "Dark",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {})
								},
								{
									value: "system",
									label: "System",
									icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, {})
								}
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segment, {
							label: "Text size",
							value: settings.textSize,
							onChange: (textSize) => updateSettings({ textSize }),
							options: [
								{
									value: "sm",
									label: "Small"
								},
								{
									value: "md",
									label: "Default"
								},
								{
									value: "lg",
									label: "Large"
								}
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segment, {
							label: "Wallpaper",
							value: settings.wallpaper,
							onChange: (wallpaper) => updateSettings({ wallpaper }),
							options: [
								{
									value: "plain",
									label: "Plain"
								},
								{
									value: "dots",
									label: "Dots"
								},
								{
									value: "grid",
									label: "Grid"
								}
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "block-label",
							children: "Messages"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Send with Enter",
							hint: "Shift+Enter always adds a new line. The button always sends.",
							checked: settings.sendWithEnter,
							onChange: (sendWithEnter) => updateSettings({ sendWithEnter })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							label: "Link previews",
							hint: "Turn web addresses in messages into links.",
							checked: settings.previewLinks,
							onChange: (previewLinks) => updateSettings({ previewLinks })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "block-label",
							children: "On this device"
						}),
						confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "setting-hint",
							children: "Reset chats? Sample conversations come back. Your profile and settings stay."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "btn-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-ghost",
								onClick: () => setConfirmReset(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "btn-primary",
								onClick: () => {
									resetDemo();
									setConfirmReset(false);
									openPanel("none");
								},
								children: "Reset chats"
							})]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "btn-danger",
							onClick: () => setConfirmReset(true),
							children: "Reset chats"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "fine",
							children: "Chats, drafts, and your profile are saved in this browser only."
						})
					]
				})
			]
		})]
	})] });
}
function ProfileEditor() {
	const profile = useMessenger((s) => s.profile);
	const openPanel = useMessenger((s) => s.openPanel);
	const saveProfile = useMessenger((s) => s.saveProfile);
	const [name, setName] = (0, import_react.useState)(profile.name);
	const [username, setUsername] = (0, import_react.useState)(profile.username);
	const [bio, setBio] = (0, import_react.useState)(profile.bio);
	const [tone, setTone] = (0, import_react.useState)(profile.tone);
	(0, import_react.useEffect)(() => {
		setName(profile.name);
		setUsername(profile.username);
		setBio(profile.bio);
		setTone(profile.tone);
	}, [profile]);
	const nameError = name.trim() ? "" : "Name is required.";
	const userError = /^[a-z0-9_]{3,20}$/.test(username) ? "" : "Use 3–20 lowercase letters, numbers, or underscores.";
	const valid = !nameError && !userError;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "panel-head",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "icon-btn",
			"aria-label": "Back to settings",
			onClick: () => openPanel("settings"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Edit profile" })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "panel-scroll",
		onSubmit: (e) => {
			e.preventDefault();
			if (!valid) return;
			saveProfile({
				name: name.trim(),
				username,
				bio: bio.trim(),
				tone
			});
			openPanel("settings");
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "profile-hero",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
				name: name || profile.name,
				tone,
				size: "lg"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "swatches",
				role: "group",
				"aria-label": "Avatar color",
				children: [
					0,
					1,
					2,
					3,
					4,
					5
				].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "swatch avatar",
					"data-tone": value,
					"aria-pressed": tone === value,
					"aria-label": `Avatar color ${value + 1}`,
					onClick: () => setTone(value),
					children: initials(name || profile.name).slice(0, 1)
				}, value))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fields",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Name" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							maxLength: 40,
							autoComplete: "name",
							onChange: (e) => setName(e.target.value)
						}),
						nameError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "field-error",
							children: nameError
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Username" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: username,
							autoCapitalize: "none",
							autoCorrect: "off",
							spellCheck: false,
							onChange: (e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))
						}),
						userError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "field-error",
							children: userError
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bio" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: bio,
							maxLength: 140,
							rows: 4,
							onChange: (e) => setBio(e.target.value.slice(0, 140))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "counter",
							children: [bio.trim().length, "/140"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "btn-primary",
					disabled: !valid,
					children: "Save profile"
				})
			]
		})]
	})] });
}
function Toggle({ label, hint, checked, onChange }) {
	const id = label.toLowerCase().replace(/[^a-z]+/g, "-");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "setting-row",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "setting-label",
			id,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "setting-hint",
			id: `${id}-hint`,
			children: hint
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			className: "switch",
			checked,
			onCheckedChange: onChange,
			"aria-labelledby": id,
			"aria-describedby": `${id}-hint`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "switch-thumb" })
		})]
	});
}
function Segment({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "setting-label",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "segment",
			role: "group",
			"aria-label": label,
			children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: `segment-btn${value === opt.value ? " is-on" : ""}`,
				"aria-pressed": value === opt.value,
				onClick: () => onChange(opt.value),
				children: [opt.icon, opt.label]
			}, opt.value))
		})]
	});
}
var FOLDERS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "unread",
		label: "Unread"
	},
	{
		id: "personal",
		label: "Personal"
	},
	{
		id: "work",
		label: "Work"
	}
];
function Sidebar() {
	if (useMessenger((s) => s.panel) !== "none") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatList, {});
}
function ChatList() {
	const profile = useMessenger((s) => s.profile);
	const chats = useMessenger((s) => s.chats);
	const folder = useMessenger((s) => s.folder);
	const listQuery = useMessenger((s) => s.listQuery);
	const drafts = useMessenger((s) => s.drafts);
	const activeChatId = useMessenger((s) => s.activeChatId);
	const openPanel = useMessenger((s) => s.openPanel);
	const setFolder = useMessenger((s) => s.setFolder);
	const setListQuery = useMessenger((s) => s.setListQuery);
	const selectChat = useMessenger((s) => s.selectChat);
	const rows = sortChats(chats).filter((chat) => chatVisible(chat, folder, listQuery));
	const pinned = rows.filter((chat) => chat.pinned);
	const rest = rows.filter((chat) => !chat.pinned);
	const showHeads = pinned.length > 0 && rest.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "side-head",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "me-btn",
				"aria-label": `${profile.name}, open settings`,
				onClick: () => openPanel("settings"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					name: profile.name,
					tone: profile.tone,
					size: "sm"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "brand",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Cove" })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "search-wrap",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { "aria-hidden": "true" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "chat-search",
					value: listQuery,
					placeholder: "Search",
					autoComplete: "off",
					onChange: (e) => setListQuery(e.target.value)
				}),
				listQuery ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": "Clear search",
					onClick: () => setListQuery(""),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "folders",
			role: "tablist",
			"aria-label": "Folders",
			children: FOLDERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				role: "tab",
				"aria-selected": folder === item.id,
				className: cx("folder-btn", folder === item.id && "is-on"),
				onClick: () => setFolder(item.id),
				children: item.label
			}, item.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "chat-scroll",
			children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-list",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: listQuery ? "No chats match" : "You’re caught up" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: listQuery ? "Try a name or a word from a message." : "Nothing unread in this folder." })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				showHeads ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-label",
					children: "Pinned"
				}) : null,
				pinned.map((chat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatRow, {
					chat,
					query: listQuery,
					draft: drafts[chat.id] ?? "",
					active: chat.id === activeChatId,
					onOpen: () => selectChat(chat.id)
				}, chat.id)),
				showHeads ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "section-label",
					children: "Chats"
				}) : null,
				rest.map((chat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatRow, {
					chat,
					query: listQuery,
					draft: drafts[chat.id] ?? "",
					active: chat.id === activeChatId,
					onOpen: () => selectChat(chat.id)
				}, chat.id))
			] })
		})
	] });
}
function ChatRow({ chat, query, draft, active, onOpen }) {
	const unread = unreadCount(chat);
	const found = searchPreview(chat, query);
	const draftText = draft.trim();
	const hot = Boolean(chat.typing || draftText && !found);
	const preview = chat.typing ? "typing…" : found ? found : draftText ? `Draft: ${draftText}` : lastPreview(chat);
	const when = lastActivity(chat);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: cx("chat-row", active && "is-active"),
		onClick: onOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
			name: chat.name,
			tone: chat.tone,
			size: "md",
			saved: chat.kind === "saved",
			online: chat.online
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "row-main",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "row-top",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "row-name",
					children: chat.name
				}), when ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "row-time",
					children: formatListTime(when)
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "row-bottom",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cx("preview", hot && "preview-hot"),
					children: preview
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "row-icons",
					children: [
						chat.pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
							className: "pin-icon",
							"aria-label": "Pinned"
						}) : null,
						chat.muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, {
							className: "mute-icon",
							"aria-label": "Muted"
						}) : null,
						unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cx("badge", chat.muted && "muted"),
							children: unread > 99 ? "99+" : unread
						}) : null
					]
				})]
			})]
		})]
	});
}
function Stage() {
	const chat = useMessenger((s) => s.chats.find((c) => c.id === s.activeChatId) ?? null);
	if (!chat) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "stage",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "empty-stage",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "brand-mark",
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 24 24",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							fill: "currentColor",
							d: "M5 6.2A3.2 3.2 0 0 1 8.2 3h7.6A3.2 3.2 0 0 1 19 6.2v6.3a3.2 3.2 0 0 1-3.2 3.2h-3.1L8.4 19.6c-.7.55-1.7.05-1.7-.8v-3.1A3.2 3.2 0 0 1 5 12.5V6.2Z"
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Your conversations" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Choose someone from the list. What you send stays on this device, and replies land in the thread." })
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thread, { chat });
}
function Thread({ chat }) {
	const profile = useMessenger((s) => s.profile);
	const settings = useMessenger((s) => s.settings);
	const draft = useMessenger((s) => s.drafts[chat.id] ?? "");
	const replyId = useMessenger((s) => s.replyTo[chat.id] ?? null);
	const editingId = useMessenger((s) => s.editingId);
	const selectedId = useMessenger((s) => s.selectedMessageId);
	const threadSearchOpen = useMessenger((s) => s.threadSearchOpen);
	const threadQuery = useMessenger((s) => s.threadQuery);
	const closeThread = useMessenger((s) => s.closeThread);
	const setDraft = useMessenger((s) => s.setDraft);
	const setReplyTo = useMessenger((s) => s.setReplyTo);
	const selectMessage = useMessenger((s) => s.selectMessage);
	const startEdit = useMessenger((s) => s.startEdit);
	const cancelEdit = useMessenger((s) => s.cancelEdit);
	const commitEdit = useMessenger((s) => s.commitEdit);
	const deleteMessage = useMessenger((s) => s.deleteMessage);
	const sendMessage = useMessenger((s) => s.sendMessage);
	const togglePin = useMessenger((s) => s.togglePin);
	const toggleMute = useMessenger((s) => s.toggleMute);
	const markUnread = useMessenger((s) => s.markUnread);
	const clearHistory = useMessenger((s) => s.clearHistory);
	const setThreadSearchOpen = useMessenger((s) => s.setThreadSearchOpen);
	const setThreadQuery = useMessenger((s) => s.setThreadQuery);
	const flash = useMessenger((s) => s.flash);
	const [menu, setMenu] = (0, import_react.useState)(false);
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [contactOpen, setContactOpen] = (0, import_react.useState)(false);
	const [editText, setEditText] = (0, import_react.useState)("");
	const [showJump, setShowJump] = (0, import_react.useState)(false);
	const menuRef = (0, import_react.useRef)(null);
	const scrollerRef = (0, import_react.useRef)(null);
	const inputRef = (0, import_react.useRef)(null);
	const stickRef = (0, import_react.useRef)(true);
	const query = threadQuery.trim().toLowerCase();
	const shown = query ? chat.messages.filter((m) => m.text.toLowerCase().includes(query)) : chat.messages;
	const selected = chat.messages.find((m) => m.id === selectedId) ?? null;
	const editing = chat.messages.find((m) => m.id === editingId) ?? null;
	const reply = chat.messages.find((m) => m.id === replyId) ?? null;
	const presence = presenceLine(chat, settings.showLastSeen);
	const live = chat.typing || chat.online && chat.kind !== "saved";
	(0, import_react.useEffect)(() => {
		setMenu(false);
		setConfirmClear(false);
		setContactOpen(false);
		stickRef.current = true;
		setShowJump(false);
	}, [chat.id]);
	(0, import_react.useEffect)(() => {
		if (!editingId) return;
		const message = useMessenger.getState().chats.flatMap((item) => item.messages).find((item) => item.id === editingId);
		if (message) setEditText(message.text);
	}, [editingId]);
	(0, import_react.useLayoutEffect)(() => {
		const el = scrollerRef.current;
		if (!el || !stickRef.current) return;
		el.scrollTop = el.scrollHeight;
	}, [
		chat.id,
		shown.length,
		chat.typing,
		editingId
	]);
	(0, import_react.useEffect)(() => {
		if (!window.matchMedia("(min-width: 880px)").matches) return;
		if (!selected && !threadSearchOpen) inputRef.current?.focus();
	}, [
		chat.id,
		selected,
		threadSearchOpen
	]);
	(0, import_react.useEffect)(() => {
		if (!menu) return;
		const onPointer = (event) => {
			if (!menuRef.current?.contains(event.target)) setMenu(false);
		};
		window.addEventListener("pointerdown", onPointer);
		return () => window.removeEventListener("pointerdown", onPointer);
	}, [menu]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key !== "Escape") return;
			if (menu || contactOpen || selectedId) {
				setMenu(false);
				setContactOpen(false);
				selectMessage(null);
				event.stopPropagation();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		menu,
		contactOpen,
		selectedId,
		selectMessage
	]);
	function resizeInput() {
		const el = inputRef.current;
		if (!el) return;
		el.style.height = "0px";
		el.style.height = `${Math.min(el.scrollHeight, 136)}px`;
	}
	(0, import_react.useLayoutEffect)(() => {
		resizeInput();
	}, [
		draft,
		editText,
		editingId,
		chat.id
	]);
	function onScroll() {
		const el = scrollerRef.current;
		if (!el) return;
		const near = el.scrollHeight - el.scrollTop - el.clientHeight < 96;
		stickRef.current = near;
		setShowJump((value) => value === !near ? value : !near);
	}
	function submit() {
		if (editing) {
			commitEdit(chat.id, editing.id, editText);
			return;
		}
		const text = draft.trim();
		if (!text) return;
		stickRef.current = true;
		sendMessage(chat.id, text);
	}
	async function copySelected() {
		if (!selected) return;
		try {
			await navigator.clipboard.writeText(selected.text);
			flash("Copied", "Message copied.");
		} catch {
			flash("Couldn’t copy", "Clipboard isn’t available in this view.");
		}
		selectMessage(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "stage thread",
		"data-size": settings.textSize,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "thread-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn back-btn",
						"aria-label": "Back to chats",
						onClick: closeThread,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "identity",
						onClick: () => setContactOpen((v) => !v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
							name: chat.name,
							tone: chat.tone,
							size: "sm",
							saved: chat.kind === "saved",
							online: chat.online
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "row-main",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: chat.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cx("sub", live && "live"),
								children: presence
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "head-actions",
						ref: menuRef,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn",
								"aria-label": "Search in chat",
								onClick: () => setThreadSearchOpen(!threadSearchOpen),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "icon-btn",
								"aria-label": "Chat actions",
								"aria-expanded": menu,
								onClick: () => {
									setConfirmClear(false);
									setMenu((v) => !v);
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, {})
							}),
							menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "menu",
								role: "menu",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "menu-item",
										role: "menuitem",
										onClick: () => {
											togglePin(chat.id);
											setMenu(false);
										},
										children: chat.pinned ? "Unpin" : "Pin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "menu-item",
										role: "menuitem",
										onClick: () => {
											toggleMute(chat.id);
											setMenu(false);
										},
										children: chat.muted ? "Unmute" : "Mute"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "menu-item",
										role: "menuitem",
										onClick: () => {
											markUnread(chat.id);
											setMenu(false);
											closeThread();
										},
										children: "Mark unread"
									}),
									confirmClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "menu-item danger",
										role: "menuitem",
										onClick: () => {
											clearHistory(chat.id);
											setMenu(false);
										},
										children: "Confirm clear"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "menu-item danger",
										role: "menuitem",
										onClick: () => setConfirmClear(true),
										children: "Clear history"
									})
								]
							}) : null
						]
					})
				]
			}),
			threadSearchOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "thread-search",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { "aria-hidden": "true" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: threadQuery,
						placeholder: "Search this chat",
						onChange: (e) => setThreadQuery(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						"aria-label": "Close search",
						onClick: () => setThreadSearchOpen(false),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cx("transcript", settings.wallpaper),
				ref: scrollerRef,
				onScroll,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "thread-col",
					onPointerDown: (event) => {
						if (event.target === event.currentTarget) selectMessage(null);
					},
					children: [
						shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "no-match",
							children: query ? "No messages match." : "No messages yet. Say hello."
						}) : null,
						shown.map((message, index) => {
							const prev = shown[index - 1];
							const showDay = !prev || !sameDay(prev.createdAt, message.createdAt);
							const grouped = Boolean(prev && !showDay && prev.from === message.from && message.createdAt - prev.createdAt < 3e5);
							const quoted = message.replyToId ? chat.messages.find((item) => item.id === message.replyToId) : void 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageRow, {
								message,
								chat,
								mineName: profile.name,
								grouped,
								showDay,
								selected: message.id === selectedId,
								linkify: settings.previewLinks,
								quoted,
								onSelect: () => selectMessage(message.id === selectedId ? null : message.id)
							}, message.id);
						}),
						chat.typing && !query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "msg-row",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bubble in typing-bubble",
								"aria-label": `${chat.name} is typing`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "dots",
									"aria-hidden": "true",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "typing-label",
									children: "typing"
								})]
							})
						}) : null
					]
				})
			}),
			showJump ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "jump",
				onClick: () => {
					stickRef.current = true;
					const el = scrollerRef.current;
					if (el) el.scrollTop = el.scrollHeight;
					setShowJump(false);
				},
				children: "Latest"
			}) : null,
			contactOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "contact-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
						name: chat.name,
						tone: chat.tone,
						size: "lg",
						saved: chat.kind === "saved",
						online: chat.online
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: chat.name }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "handle",
						children: ["@", chat.username]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "bio",
						children: chat.bio
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "btn-ghost",
						onClick: () => setContactOpen(false),
						children: "Back to messages"
					})
				]
			}) : null,
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cx("action-bar", selected.from === "me" && "four"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "action-btn",
						onClick: () => {
							setReplyTo(chat.id, selected.id);
							selectMessage(null);
							inputRef.current?.focus();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CornerUpLeft, {}), "Reply"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "action-btn",
						onClick: () => void copySelected(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {}), "Copy"]
					}),
					selected.from === "me" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "action-btn",
						onClick: () => {
							startEdit(selected.id);
							inputRef.current?.focus();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {}), "Edit"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "action-btn danger",
						onClick: () => deleteMessage(chat.id, selected.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {}), "Delete"]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "composer-wrap",
				onSubmit: (event) => {
					event.preventDefault();
					submit();
				},
				children: [
					editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "edit-bar",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "reply-copy",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "quote-name",
								children: "Edit message"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "quote-text",
								children: editing.text
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": "Cancel edit",
							onClick: cancelEdit,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
						})]
					}) : null,
					reply && !editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "reply-bar",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "reply-copy",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "quote-name",
								children: reply.from === "me" ? profile.name : chat.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "quote-text",
								children: reply.text
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": "Cancel reply",
							onClick: () => setReplyTo(chat.id, null),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "composer-shell",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							ref: inputRef,
							className: "composer-input",
							rows: 1,
							placeholder: chat.kind === "saved" ? "Write a note" : "Message",
							value: editing ? editText : draft,
							enterKeyHint: "send",
							onChange: (event) => {
								if (editing) setEditText(event.target.value);
								else setDraft(chat.id, event.target.value);
							},
							onKeyDown: (event) => {
								if (event.key !== "Enter") return;
								const command = event.metaKey || event.ctrlKey;
								if (event.shiftKey) return;
								if (settings.sendWithEnter || command) {
									event.preventDefault();
									submit();
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							className: "send-btn",
							"aria-label": editing ? "Save edit" : "Send",
							disabled: editing ? !editText.trim() : !draft.trim(),
							children: editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
						})]
					})
				]
			})
		]
	});
}
function MessageRow({ message, chat, mineName, grouped, showDay, selected, linkify, quoted, onSelect }) {
	const statusLabel = message.from === "me" ? message.status === "sending" ? "Sending" : message.status === "sent" ? "Sent" : message.status === "delivered" ? "Delivered" : "Read" : "Received";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [showDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "day-chip",
		children: formatDayLabel(message.createdAt)
	}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cx("msg-row", message.from === "me" && "mine", grouped && "grouped", selected && "is-selected"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			id: `msg-${message.id}`,
			className: cx("bubble", message.from === "me" ? "out" : "in"),
			onClick: onSelect,
			children: [
				quoted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "quote",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "quote-name",
						children: quoted.from === "me" ? mineName : chat.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "quote-text",
						children: quoted.text
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "bubble-text",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageText, {
						text: message.text,
						linkify
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "meta",
					children: [
						message.edited ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "edited",
							children: "edited"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
							dateTime: new Date(message.createdAt).toISOString(),
							children: formatClock(message.createdAt)
						}),
						message.from === "me" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, { status: message.status }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sr-only",
							children: statusLabel
						})
					]
				})
			]
		})
	})] });
}
function MessengerApp() {
	const settings = useMessenger((s) => s.settings);
	const chats = useMessenger((s) => s.chats);
	const activeChatId = useMessenger((s) => s.activeChatId);
	const mobileThread = useMessenger((s) => s.mobileThread);
	const panel = useMessenger((s) => s.panel);
	const notice = useMessenger((s) => s.notice);
	const live = useMessenger((s) => s.live);
	const markRead = useMessenger((s) => s.markRead);
	const dismissNotice = useMessenger((s) => s.dismissNotice);
	const selectChat = useMessenger((s) => s.selectChat);
	const openPanel = useMessenger((s) => s.openPanel);
	const closeThread = useMessenger((s) => s.closeThread);
	const selectMessage = useMessenger((s) => s.selectMessage);
	const setThreadSearchOpen = useMessenger((s) => s.setThreadSearchOpen);
	const lastId = chats.find((c) => c.id === activeChatId)?.messages.at(-1)?.id ?? "";
	const unread = chats.reduce((n, c) => n + (c.muted ? 0 : unreadCount(c)), 0);
	(0, import_react.useEffect)(() => {
		applyTheme(settings.theme);
		if (settings.theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [settings.theme]);
	(0, import_react.useEffect)(() => {
		document.title = unread > 0 ? `(${unread}) Cove` : "Cove";
	}, [unread]);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(min-width: 880px)");
		const sync = () => {
			const visible = Boolean(activeChatId) && (mq.matches || mobileThread && panel === "none");
			viewing.chatId = activeChatId;
			viewing.visible = visible;
			if (visible && activeChatId) markRead(activeChatId);
		};
		sync();
		mq.addEventListener("change", sync);
		return () => mq.removeEventListener("change", sync);
	}, [
		activeChatId,
		mobileThread,
		panel,
		lastId,
		markRead
	]);
	(0, import_react.useEffect)(() => {
		if (!notice) return;
		const id = notice.id;
		const timer = window.setTimeout(() => {
			if (useMessenger.getState().notice?.id === id) dismissNotice();
		}, 3800);
		return () => window.clearTimeout(timer);
	}, [notice, dismissNotice]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key !== "Escape") return;
			const state = useMessenger.getState();
			if (state.threadSearchOpen) {
				setThreadSearchOpen(false);
				return;
			}
			if (state.selectedMessageId) {
				selectMessage(null);
				return;
			}
			if (state.panel === "profile") {
				openPanel("settings");
				return;
			}
			if (state.panel !== "none") {
				openPanel("none");
				return;
			}
			if (state.mobileThread && !window.matchMedia("(min-width: 880px)").matches) closeThread();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		closeThread,
		openPanel,
		selectMessage,
		setThreadSearchOpen
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: `app${mobileThread && panel === "none" ? " is-thread" : ""}${panel !== "none" ? " is-settings" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sr-only",
				"aria-live": "polite",
				children: live
			}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "notice",
				role: "status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "notice-body",
					onClick: () => {
						if (notice.chatId) selectChat(notice.chatId);
						dismissNotice();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: notice.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: notice.body })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": "Dismiss",
					onClick: dismissNotice,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "sidebar",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, {})
		]
	});
}
function Home() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useLayoutEffect)(() => {
		let cancelled = false;
		Promise.resolve(useMessenger.persist.rehydrate()).finally(() => {
			if (cancelled) return;
			const state = useMessenger.getState();
			applyTheme(state.settings.theme);
			if (window.matchMedia("(min-width: 880px)").matches && !state.activeChatId) {
				const first = sortChats(state.chats)[0];
				if (first) state.selectChat(first.id, false);
			}
			setReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "boot",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "brand-mark",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Cove" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Messages" })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessengerApp, {});
}
//#endregion
export { Home as component };
