const DESCRIPTION_MAX = 35;
const NAME_MAX = 70;

function sanitizeIpsText(value: string, maxLength: number, allowNewlines = false) {
  const cleaned = value
    .replace(/[|:]/g, " ")
    .replace(allowNewlines ? /[\r]+/g : /[\r\n]+/g, " ")
    .trim();

  const chars = Array.from(cleaned);
  if (chars.length <= maxLength) {
    return cleaned;
  }
  return chars.slice(0, maxLength).join("");
}

function formatAmount(amountRsd: number) {
  const safeAmount = Math.max(0, Math.round(amountRsd));
  return `RSD${safeAmount},00`;
}

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not configured`);
  }
  return value;
}

export function buildPaymentDescription(song: string, artist?: string) {
  const trimmedSong = song.trim();
  const trimmedArtist = artist?.trim();
  const base = trimmedArtist
    ? `Song Request: ${trimmedSong} - ${trimmedArtist}`
    : `Song Request: ${trimmedSong}`;
  return sanitizeIpsText(base, DESCRIPTION_MAX);
}

export function buildIpsPayload(options: {
  amountRsd: number;
  description: string;
}) {
  const accountRaw = requireEnv("IPS_RECIPIENT_ACCOUNT");
  const account = accountRaw.replace(/\D/g, "");
  if (account.length !== 18) {
    throw new Error("IPS_RECIPIENT_ACCOUNT must have 18 digits");
  }

  const recipientName = sanitizeIpsText(
    requireEnv("IPS_RECIPIENT_NAME"),
    NAME_MAX,
    true
  );
  const recipientCity = process.env.IPS_RECIPIENT_CITY
    ? sanitizeIpsText(process.env.IPS_RECIPIENT_CITY, NAME_MAX, true)
    : "";
  const recipient = recipientCity
    ? `${recipientName}\n${recipientCity}`
    : recipientName;

  const paymentCode = sanitizeIpsText(
    process.env.IPS_PAYMENT_CODE || "289",
    3
  );

  const description = sanitizeIpsText(options.description, DESCRIPTION_MAX);
  const amount = formatAmount(options.amountRsd);

  return [
    "K:PR",
    "V:01",
    "C:1",
    `R:${account}`,
    `N:${recipient}`,
    `I:${amount}`,
    `SF:${paymentCode}`,
    `S:${description}`,
  ].join("|");
}

export function buildIpsDeepLink(payload: string) {
  const template = requireEnv("IPS_DEEPLINK_TEMPLATE");
  if (!template.includes("{payload}")) {
    throw new Error("IPS_DEEPLINK_TEMPLATE must include {payload}");
  }
  return template.replace("{payload}", encodeURIComponent(payload));
}
