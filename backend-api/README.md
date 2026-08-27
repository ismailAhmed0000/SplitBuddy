# SplitBuddy — Backend API

The Laravel API behind SplitBuddy. Serves the website (`../frontend`) and the mobile app (`../mobile-app`) from one codebase.

## Stack

- **Laravel 13** on **PHP 8.4**
- **MySQL** — `DB_CONNECTION=mysql`
- **Laravel Sanctum** — token-based API auth (bearer tokens, no cookies/sessions for API clients). `POST /login` / `POST /register` issue a token; every other route sits behind `auth:sanctum`.
- **Anthropic SDK** (`anthropic-ai/sdk`) — powers receipt OCR/parsing in `BillExtractionService`: an uploaded receipt image is sent to Claude, which returns structured merchant/items/totals data.
- **Pint** — code style (`vendor/bin/pint`)
- **PHPUnit** — test suite (`php artisan test`)

No queue workers or scheduled jobs are in use — bill extraction runs synchronously inside the request that uploads the image (`QUEUE_CONNECTION=database` is Laravel's default, but nothing is actually dispatched to it). Mail is not sent anywhere real (`MAIL_MAILER=log`).

## Domain model

- **Users** — `bank_name` / `bank_account_number` are informational only (shown to buddies so they know where to send money) — there's no payment gateway integration anywhere in this app.
- **Groups** → **GroupMembers** — a group's roster; a member can be a real `User` (`user_id` set) or a name-only buddy who isn't on the app yet. `groups.payer_id` optionally designates one member as the group's "collector" — everyone else's balance is understood to be owed to that person.
- **Bills** → **BillItems** → **Assignments** — a bill has line items, each item is split across one or more group members via an `Assignment` (`equal` / `percentage` / `exact_amount`). `bill_participants` is a separate pivot for "who's included in this bill" independent of item-level assignment.
- **Settlements** — a record of one member paying another (`paid_by` → `paid_to` → `amount`). Settlements are self-reported and immediate — there is no pending/confirmation state.
- **Buddies** — a lightweight friend list, separate from group membership.

## Balances — computed, not stored

`app/Services/BalanceService.php` is the source of truth for "who owes what." Nothing is persisted as a running balance:

- `forGroup(Group $group)` walks every `confirmed` bill's item assignments plus the group's settlements to produce a **net** balance per member (negative = they owe the group, positive = they're owed). It also returns a **gross** balance (`gross_balance`) — the same calculation *before* settlements are applied — so clients can show a fixed "amount owed" that doesn't reset to zero the moment something is marked paid; `status` (`pending`/`paid`) and `is_payer` are derived from the net figure.
- `forUser(User $user)` aggregates `forGroup()` across every group the user belongs to, for a dashboard-style "you're owed / you owe" total.
- `billsForMember()` breaks down a single member's share bill-by-bill (used for the member detail view).

If you change how a balance is calculated, change it here — there is exactly one code path clients read from (`GET /groups/{id}/balances`, `GET /users/{id}/balances`).

## Storage

Receipt images go to the `public` disk (`storage/app/public`, served via the `public/storage` symlink). Two things that will silently break this in a new environment:

1. **`APP_URL` must be the API's own real public domain** — `image_url` is built from it at upload time and baked into the DB row, not recomputed on read. A placeholder/wrong `APP_URL` means every receipt image 404s forever, even after fixing it (existing rows keep the stale URL).
2. **`php artisan storage:link` must run on deploy.** It's not currently wired into any deploy hook — if your platform's filesystem isn't persistent across deploys (e.g. Railway without an attached Volume), uploaded files vanish on the next deploy even though the symlink itself survives (it's part of the built image).

## API conventions

- Flat REST under `routes/api.php`, everything except `/register` `/login` `/forgot-password` `/reset-password` sits behind `auth:sanctum`.
- Every response wraps its payload as `{ data: ... }` via Laravel API Resources (`app/Http/Resources/`).
- Validation lives in `FormRequest` classes (`app/Http/Requests/`); 422s return Laravel's standard `{ message, errors: { field: [...] } }` shape, which both frontend clients know how to parse.
- Authorization is inline (`abort_unless`/`abort_if` in controllers), not Policies — e.g. group rename/delete/payer-change is creator-only, checked directly in `GroupController`.

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# set DB_* to a real MySQL database, APP_URL to this API's own public URL,
# and ANTHROPIC_API_KEY if you want bill OCR to work
php artisan migrate
php artisan storage:link
php artisan serve
```

## Testing

```bash
php artisan test
```
