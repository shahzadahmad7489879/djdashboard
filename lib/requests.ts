import crypto from "crypto";

export type PaymentStatus = "pending" | "paid" | "failed";

export type PaymentIntent = {
  id: string;
  song: string;
  artist: string;
  amount: number;
  status: PaymentStatus;
  bankReference?: string;
  createdAt: string;
  updatedAt: string;
};

export type RequestItem = {
  id: string;
  song: string;
  artist: string;
  amount: number;
  createdAt: string;
};

type Store = {
  intents: PaymentIntent[];
  requests: RequestItem[];
};

declare global {
  // eslint-disable-next-line no-var
  var __mockStore: Store | undefined;
}

function getStore(): Store {
  if (!globalThis.__mockStore) {
    globalThis.__mockStore = { intents: [], requests: [] };
  }
  return globalThis.__mockStore;
}

export async function createPaymentIntent(input: {
  song: string;
  artist: string;
  amount: number;
}): Promise<PaymentIntent> {
  const store = getStore();
  const now = new Date().toISOString();
  const intent: PaymentIntent = {
    id: crypto.randomUUID(),
    song: input.song.trim(),
    artist: input.artist.trim(),
    amount: input.amount,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  store.intents.unshift(intent);
  return intent;
}

export async function markPaymentPaid(
  intentId: string,
  bankReference?: string
): Promise<RequestItem | null> {
  const store = getStore();
  const intent = store.intents.find((item) => item.id === intentId);
  if (!intent) {
    return null;
  }

  if (intent.status !== "paid") {
    intent.status = "paid";
    intent.bankReference = bankReference;
    intent.updatedAt = new Date().toISOString();
  }

  const existing = store.requests.find((item) => item.id === intentId);
  if (existing) {
    return existing;
  }

  const request: RequestItem = {
    id: intent.id,
    song: intent.song,
    artist: intent.artist,
    amount: intent.amount,
    createdAt: new Date().toISOString(),
  };

  store.requests.unshift(request);
  return request;
}

export async function listPaidRequests(): Promise<RequestItem[]> {
  const store = getStore();
  return [...store.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPaymentIntent(intentId: string): Promise<PaymentIntent | null> {
  const store = getStore();
  return store.intents.find((item) => item.id === intentId) || null;
}
