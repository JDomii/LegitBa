# LegitBa

*NeCCSus HackFest ’26 · Team Zero-Day*

Campus announcements are especially susceptible to fast-spreading misinformation in the form of altered suspension notices, forged exam schedules, and falsified administrative memos that propagate quickly among students. The current solutions typically employ probabilistic approaches that try to detect authenticity based on confidence values, which makes them prone to false positives, false negatives, and errors. In LegitBa, this problem is solved deterministically using SHA-256 cryptographic hashes, which provide mathematically proven provenance of documents by matching their exact records in a digital registry, rather than trying to guess manipulations.

It works by letting the relevant university department stamp an official announcement when publishing it. This process involves creating a 256-bit cryptographic hash digest (digital fingerprint) of the document, which is stored in a registry. Later, when a document is checked, its SHA-256 hash is calculated on the client side using the Web Crypto API. Because of the strict avalanche effect, SHA-256 generates a completely different 256-bit fingerprint if even one pixel or metadata byte is changed. Additionally, this deterministic approach guarantees privacy by design since only the 64-character hexadecimal fingerprint is sent to the server.

## How it works

1. **Stamp.** An official uploads a real announcement. The server computes its SHA-256 fingerprint and saves it as a verified record, with the original file stored in a private bucket.
2. **Verify.** Anyone uploads an image they found online. The browser computes the fingerprint locally and sends only that 64-character hash to the server.
3. **Result.** An exact match shows *Authentic*. Anything else shows *No official record found*. The automated system never labels an image as fake by itself.
4. **Report and review.** Unmatched images can be submitted to a community review queue. Officials move reports to *Under review*, then give a final human verdict: *Stamp as Real* (the image becomes an official record) or *Mark as Fake*.

## Features

- **Verify an image:** Upload a PNG or JPG (up to 4 MB). Hashing runs in the browser with the Web Crypto API. Matches show the record details (title, issuing office, date stamped, full fingerprint).
- **Stamp an official file:** In Official mode, staff upload a file with a title (1 to 120 characters). Duplicate files are detected by hash. A list of recent stamps is shown.
- **Community review queue:** Reports include an optional note (up to 280 characters), are de-duplicated by fingerprint, and are rejected if the file is already official. The queue can be filtered by status and has an image viewer with zoom.
- **Review verdicts:** Statuses are *Reported*, *Under review*, *Resolved*, and the final verdicts *Resolved: Real* (`stamped`) and *Resolved: Fake* (`fake`). Final verdicts can only be set from *Under review*.
- **Privacy by design:** Checking an image does not upload it. Tables have no public access, buckets are private, and report images are shown through signed links that expire after one hour.
- **Demo role toggle:** A header switch changes between Public and Official modes so both sides can be demonstrated without a login system.

## Tech stack

- **Frontend/Framework:** Next.js 16 (App Router, route handlers), React 19, TypeScript, Tailwind CSS 4
- **Validation:** Zod for request and response validation
- **Backend:** Supabase (PostgreSQL with Row Level Security, private Storage)
- **Cryptography:** Web Crypto API (browser) and Node's `crypto` module (server) for SHA-256

## Getting started

### Prerequisites

- Node.js 20.6 or newer
- A Supabase project

### 1. Install

```bash
git clone <repository-url>
cd LegitBa
npm install
```

### 2. Set up the database

In the Supabase SQL editor, run these files in order:

- `supabase/schema.sql` creates the `verified_records` and `reports` tables with Row Level Security on (no public policies) and the private `official-files` and `report-files` buckets.
- `supabase/add_report_verdicts.sql` adds the `fake` and `stamped` verdicts used by the review queue.

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

> **Note:** Both are server-side only. The browser never talks to Supabase directly, so there are no `NEXT_PUBLIC_` variables. Never commit `.env.local`.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production build, run `npm run build` and then `npm run start`.

> **Note:** Browsers only allow the Web Crypto API on HTTPS or localhost, so test on phones using the deployed HTTPS address, not a local network IP.

## Demo walkthrough

1. Switch the header toggle to **Official**, open **Stamp**, and upload an official announcement image with a title.
2. Switch to **Public**, open **Verify**, and upload the exact same image. Result: green **Authentic** banner with full record details.
3. Upload an unrecorded or edited announcement image on **Verify**. Result: amber **No official record found**. Click **Submit for community review**.
4. Open **Queue**, switch to **Official** mode, set the report to **Under review**, and then choose **Stamp as Real** (to promote it to the official registry) or **Mark as Fake**.

## API routes

- `POST /api/verify`: body `{ "sha256": "<64 hex characters>" }`, returns `match` or `no_match`
- `POST /api/stamp` (official): multipart file and title
- `GET /api/records`: newest 10 official records
- `POST /api/reports`: multipart file and optional note
- `GET /api/reports`: newest 50 reports with signed image links
- `PATCH /api/reports/[id]` (official): set a status (`reported`, `under_review`, `resolved`, `fake`)
- `POST /api/reports/[id]/stamp` (official): stamp a reported image as real

> **Note:** Errors use the shape `{ "error": { "code", "message" } }`.

## Project structure

```text
app/                 pages (/, /verify, /stamp, /queue) and API route handlers
components/          UI components and modals
lib/                 constants, shared Zod types, hashing, file validation, Supabase server client
supabase/            SQL for the database and storage buckets
public/              static assets and branding images
```

## Limitations

- **Exact matching only:** Any change to the file, including re-saving, cropping, compression by a social app, or a screenshot, produces a different fingerprint. "No official record found" means "not a registered official file," not "fake." Officials can use **Stamp as Real** in the queue to register compressed copies of genuine announcements.
- **System bounds:** Only stamped items can be verified. Images only (PNG or JPG up to 4 MB). PDFs, faces, and videos are not analyzed.
- **Demo features:** The role switch is a demo feature. It sends an `x-demo-role` header and is not real authentication. Real sign-in for officials is future work. A **Fake** verdict is recorded in the review queue only and is not yet shown on the Verify page.
- **Spam control:** Duplicate files are blocked by hash, but there is no IP rate limiting implemented in this MVP.

## Team

- **Daniel:** Backend and Database
- **Jian Karl:** Frontend
- **Amos:** Architecture Planning, QA Testing, Documentation, and Pitch

## AI Usage Declaration

AI tools were utilized strictly for assistance and to accelerate development efficiency. All core logic, architectural decisions, and final implementations are the original work of the developers.

**Tools used:**

- **Google Antigravity & v0.dev:** Utilized to generate boilerplate code and scaffold standard UI components, helping the team iterate faster.
- **Claude Sonnet 5.5 & Gemini Pro 3.1:** Used as conversational assistants for brainstorming, documentation drafting, and reviewing structural approaches.

**What the team did:**

- Conceptualized the core mechanism (cryptographic provenance over probabilistic detection), defined the scope, and established the project limits.
- Directed the AI tools, managed the integration of boilerplate code, and manually authored/refined the cryptographic pipeline and database logic.
- Conducted code review and end-to-end verification testing. Each team member takes full responsibility for the understanding and maintenance of the codebase in their respective domains.
