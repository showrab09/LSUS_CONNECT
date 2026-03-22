/**
 * LSUS Connect — Content Moderation
 * Flags content containing harmful, unsafe, or inappropriate language.
 * Categories: scams, trafficking, sexual content, drugs, weapons, violence, harassment
 */

export type FlagSeverity = "critical" | "high" | "medium";

export interface FlagResult {
  flagged: boolean;
  severity: FlagSeverity | null;
  categories: string[];
  matchedTerms: string[];
  reason: string | null;
}

// ── Keyword Lists by Category ─────────────────────────────────────────────────

const MODERATION_RULES: {
  category: string;
  severity: FlagSeverity;
  terms: string[];
}[] = [
  {
    category: "Sex Trafficking / Exploitation",
    severity: "critical",
    terms: [
      "sex work", "escort", "call girl", "call boy", "full service",
      "happy ending", "massages with extras", "pay for play",
      "sugar daddy", "sugar baby", "seeking arrangement",
      "trafficking", "smuggling people", "transport girls",
      "young girls available", "young boys available",
      "minors available", "underage", "fresh girls", "fresh meat",
      "working girls", "loverboys", "pimp", "pimping",
    ],
  },
  {
    category: "Sexual Content",
    severity: "critical",
    terms: [
      "nude", "nudes", "naked pics", "naked photos", "onlyfans",
      "xxx", "porn", "pornography", "sex tape", "sex video",
      "adult content", "explicit content", "nsfw",
      "masturbat", "orgasm", "penetrat",
    ],
  },
  {
    category: "Scam / Fraud",
    severity: "high",
    terms: [
      "wire transfer", "western union", "money order only",
      "send money first", "pay upfront", "cash only no receipt",
      "guaranteed returns", "double your money", "investment opportunity",
      "nigerian prince", "inheritance money", "unclaimed funds",
      "gift card payment", "bitcoin payment only", "crypto only",
      "too good to be true", "act now limited time",
      "send gift cards", "venmo only no returns",
      "zelle only no refund", "cashapp only",
      "i am overseas", "currently abroad", "ship to you",
    ],
  },
  {
    category: "Drugs / Controlled Substances",
    severity: "critical",
    terms: [
      "weed", "marijuana", "cannabis", "cocaine", "crack",
      "heroin", "meth", "methamphetamine", "mdma", "molly", "ecstasy",
      "lsd", "acid tabs", "shrooms", "psilocybin", "fentanyl",
      "oxycontin", "oxycodone", "percocet", "xanax bars",
      "adderall no prescription", "selling pills", "pills for sale",
      "plug", "the plug", "420 friendly", "dank", "loud",
      "smoke session", "rolls", "pressed pills",
    ],
  },
  {
    category: "Weapons",
    severity: "critical",
    terms: [
      "gun for sale", "pistol for sale", "rifle for sale",
      "no background check", "ghost gun", "untraceable gun",
      "illegal weapon", "silencer for sale", "suppressor",
      "explosives", "bomb making", "ammunition bulk",
      "sell firearms", "private sale gun",
    ],
  },
  {
    category: "Violence / Threats",
    severity: "critical",
    terms: [
      "i will kill", "gonna kill", "going to kill",
      "beat you up", "jump you", "shoot you",
      "i know where you live", "find you", "come for you",
      "threat", "threaten", "harm you", "hurt you",
      "rape", "assault", "attack you",
    ],
  },
  {
    category: "Harassment / Hate Speech",
    severity: "high",
    terms: [
      "kys", "kill yourself", "end your life",
      "retard", "faggot", "nigger", "nigga", "chink", "spic",
      "wetback", "towelhead", "tranny", "dyke",
      "white power", "nazi", "heil", "kkk",
      "go back to your country", "you don't belong here",
    ],
  },
  {
    category: "Predatory Behavior",
    severity: "critical",
    terms: [
      "meet me alone", "don't tell anyone",
      "keep this between us", "our secret",
      "you look young", "how old are you", "are you legal",
      "meet at my place", "come to my room alone",
      "send me pics", "send photos privately",
      "i can help you financially", "i'll pay you",
    ],
  },
];

// ── Core Moderation Function ───────────────────────────────────────────────────

export function moderateContent(text: string): FlagResult {
  if (!text || text.trim().length === 0) {
    return { flagged: false, severity: null, categories: [], matchedTerms: [], reason: null };
  }

  const lower = text.toLowerCase();
  const matchedCategories: string[] = [];
  const matchedTerms: string[] = [];
  let highestSeverity: FlagSeverity | null = null;

  const severityRank = { critical: 3, high: 2, medium: 1 };

  for (const rule of MODERATION_RULES) {
    for (const term of rule.terms) {
      if (lower.includes(term.toLowerCase())) {
        if (!matchedCategories.includes(rule.category)) {
          matchedCategories.push(rule.category);
        }
        if (!matchedTerms.includes(term)) {
          matchedTerms.push(term);
        }
        if (!highestSeverity || severityRank[rule.severity] > severityRank[highestSeverity]) {
          highestSeverity = rule.severity;
        }
      }
    }
  }

  if (matchedCategories.length === 0) {
    return { flagged: false, severity: null, categories: [], matchedTerms: [], reason: null };
  }

  const reason = `Content flagged for: ${matchedCategories.join(", ")}`;

  return {
    flagged: true,
    severity: highestSeverity,
    categories: matchedCategories,
    matchedTerms,
    reason,
  };
}

// ── Check multiple fields at once ─────────────────────────────────────────────

export function moderateFields(fields: Record<string, string>): FlagResult {
  const combined = Object.values(fields).join(" ");
  return moderateContent(combined);
}

// ── Severity color helpers for UI ─────────────────────────────────────────────

export function getSeverityColor(severity: FlagSeverity | null) {
  switch (severity) {
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":     return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":   return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:         return "bg-white/10 text-[#C4B0E0]";
  }
}

export function getSeverityBadge(severity: FlagSeverity | null) {
  switch (severity) {
    case "critical": return "🚨 Critical";
    case "high":     return "⚠️ High";
    case "medium":   return "🔔 Medium";
    default:         return "";
  }
}
