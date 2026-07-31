# MANAYUN BAGOBO

A digital platform for preserving, promoting, and revitalizing the **Bagobo Tagabawa** dialect and cultural heritage.

Originally a static TanStack Start prototype, now rebuilt as a full-stack **Laravel 12 + Inertia.js 2 + React 19** application with real authentication, roles, and a database. The archived prototype lives in `_legacy-tanstack/`; design references are in `Refference/`.

## Stack

- **Backend:** Laravel 12 (PHP 8.4), SQLite (default), Eloquent
- **Frontend:** React 19 + TypeScript via Inertia.js 2, Vite 6
- **Styling:** Tailwind CSS v4 (OKLCH design tokens), shadcn/ui (Radix), lucide-react
- **Auth:** Session auth (Laravel starter kit) with a custom `role` field
- **AI:** Configurable provider (Aerolink/OpenAI-compatible or Anthropic) via the server-side Laravel `Http` client
- **Mobile:** Expo (React Native + TypeScript) client in `mobile/`, Sanctum bearer-token API under `routes/api.php`

## Roles & areas

| Role     | Home     | Access                              |
| -------- | -------- | ----------------------------------- |
| learner  | `/user`  | learner dashboard + tools           |
| admin    | `/admin` | admin dashboard, plus all `/user`\* |
| super    | `/super` | everything, including `/admin`      |

Role protection is enforced by the `role:` middleware (`app/Http/Middleware/EnsureUserHasRole.php`). Post-login redirect is driven by `User::homePath()`.

## Getting started

```bash
composer install
npm install
cp .env.example .env        # if .env is missing
php artisan key:generate
php artisan migrate:fresh --seed
```

Run the app (two terminals, or use `composer dev` if defined):

```bash
php artisan serve
npm run dev
```

Visit http://127.0.0.1:8000.

### AI Chatbot setup (optional)

The learner AI Chatbot ("Manayun") calls a configurable AI provider. Add a key to `.env` to enable it:

```
AI_API_KEY=...
AI_MODEL=gpt-5.6-sol   # optional; matches your provider
```

Without a key the chatbot page shows a "not configured" notice and the rest of the app works normally. Config lives in `config/services.php` (`services.ai`).

### Demo accounts (password: `password`)

| Email                | Role    |
| -------------------- | ------- |
| `juan@example.com`   | learner |
| `maria@example.com`  | admin   |
| `super@example.com`  | super   |

## Features

**Learner** (`/user`) — all data-backed:

- **Learning Modules** — lessons with content, difficulty, and an interactive quiz; server-side grading (≥60% passes), progress tracking, and **My Progress** with per-lesson status/scores.
- **Vocabulary Dictionary** — searchable, category-filtered entries with phonetic pronunciation and a verified **Pronunciation Library** (native speaker + verifier).
- **AI Chatbot** — "Manayun", an AI-powered guide scoped to Bagobo Tagabawa culture; conversations are logged and rehydrated on reload.
- **Cultural Repository, Multimedia Gallery, Storytelling Archive** — browsable content with search/type/category filters.
- **Community Contributions & Feedback** — learners submit content (queued for review) and star-rated feedback.
- **Events** — upcoming/past cultural events.

**Admin** (`/admin`) — content management:

- CRUD for learning materials (incl. **quiz authoring** — add/edit questions with dynamic options), cultural repository, multimedia, events.
- Contribution moderation (approve/reject → records a **Resource Verification**), feedback, **Reports & Analytics**, and a scoped **User Management** (activate/deactivate learners).

**Super Admin** (`/super`) — system administration:

- Live **Dashboard/Overview**, **User Management** (roles + status, with self-lockout guards), **Role & Permission Matrix**, **Content** inventory, **Reports**, **Activity Logs**, and **Settings** (site name/tagline + a **maintenance mode** that blocks learners while staff keep access).

Actions across the app write to an **Activity Log** audit trail. A few pure system-administration pages (super: database, backup, security, site, maintenance, subscription; admin: settings) remain intentional `PageStub` placeholders — they have no backing data.

## Testing

```bash
php vendor/bin/phpunit          # full suite
```

Feature tests cover RBAC enforcement, quiz grading, community/feedback submission, maintenance mode, and user-management guards (`tests/Feature/*`).

## Project layout

- `routes/web.php` — public, learner, admin, super route groups
- `routes/api.php` — Sanctum-secured mobile API
- `app/Http/Controllers/*` — `User`/`Admin`/`Super`DashboardController, `AdminCrudController`, `LearningController`, `CommunityController`, `AiChatbotController`, `Api/*`
- `app/Http/Middleware/*` — `EnsureUserHasRole`, `EnsureNotUnderMaintenance`
- `app/Models/*` — domain models (LearningModule, QuizQuestion, QuizResult, VocabularyWord, Pronunciation, MediaItem, Story, RepositoryItem, Contribution, ResourceVerification, Feedback, Event, ChatLog, ActivityLog, Setting, …)
- `database/seeders/DatabaseSeeder.php` — demo users + content
- `resources/js/pages/{user,admin,super}/*` — Inertia page components
- `resources/js/layouts/*` — dashboard chrome
- `resources/js/components/*` — brand-logo, dashboard-layout, `admin/entity-manager`, `ui/*`
- `mobile/*` — Expo React Native app
- `resources/css/app.css` — Tailwind v4 tokens
