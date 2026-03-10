# DJ Request Board

A simple web app for live DJ song requests. Guests scan a QR code, enter a song name, pay (simulated), and the request appears on the DJ dashboard.

## Quick Start

```bash
npm run dev
```

Open `http://localhost:3000`.

## Pages

- `/request`: Audience request form.
- `/dashboard`: DJ view with live requests and QR code.

## Environment

- `NEXT_PUBLIC_REQUEST_URL` (optional): The URL embedded in the QR code. If not set, it uses the current origin + `/request`.

## API

- `GET /api/requests`: List requests.
- `POST /api/requests`: Create a request.
- `PATCH /api/requests/:id`: Update status (`paid`, `played`, `cancelled`).
- `DELETE /api/requests/:id`: Delete a request.

## Storage

Requests are stored locally in `data/requests.json`.
