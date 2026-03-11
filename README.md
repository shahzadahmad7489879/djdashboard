# Nightclub Song Requests (IPS)

A minimal mobile-first song request flow for nightclub guests, with IPS payment confirmation and a real-time DJ dashboard.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Pages

- `/request`: Guest request form (QR code target).
- `/dashboard`: DJ dashboard with live paid requests.

## Required Assets

- Place the club logo at `public/logo.png`.

## Environment

Copy `.env.example` to `.env` and set:

- `IPS_RECIPIENT_NAME`: Merchant/club name shown in the bank app.
- `IPS_RECIPIENT_ACCOUNT`: 18-digit recipient account.
- `IPS_RECIPIENT_CITY`: Optional city line.
- `IPS_PAYMENT_CODE`: IPS payment code (default `289`).
- `IPS_DEEPLINK_TEMPLATE`: Bank-provided deep link template. Must include `{payload}`.
- `PAYMENT_WEBHOOK_SECRET`: Shared secret for payment confirmation webhook.
- `NEXT_PUBLIC_REQUEST_URL`: Optional URL used in the QR code (if you add one externally).

Example deep link template:

```
ips://scan?data={payload}
```

## Flow

1. Guest opens `/request` from the club QR code.
2. Guest enters song + artist and selects 500 / 1000 / 2000 RSD.
3. `POST /api/requests` creates a payment intent and returns an IPS deep link.
4. The browser opens the bank app via the IPS deep link.
5. Bank confirms payment by calling `POST /api/payments/confirm`.
6. Only after confirmation is a request stored and visible on `/dashboard`.

## API

- `GET /api/requests` -> list paid requests only.
- `POST /api/requests` -> create payment intent and receive `{ paymentUrl }`.
- `POST /api/payments/confirm` -> mark payment as paid and create request.

### Webhook payload

```json
{
  "intentId": "<uuid>",
  "status": "paid",
  "bankReference": "<optional>"
}
```

Send header `x-webhook-secret: <PAYMENT_WEBHOOK_SECRET>`.

Example:

```bash
curl -X POST http://localhost:3000/api/payments/confirm \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: change-me" \
  -d '{"intentId":"<uuid>","status":"paid"}'
```

## Storage (Mock)

This MVP uses an in-memory mock store. Data resets on server restart.

## Notes

- The IPS payload follows NBS IPS QR data format (K/V/C/R/N/I/SF/S fields).
- The deep link format is bank-specific. Use the template provided by your bank.
- Payment descriptions are trimmed to the 35-character IPS limit.
- Only confirmed payments are stored and shown on the DJ dashboard.
