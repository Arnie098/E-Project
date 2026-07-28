# AGENTS

Laravel 12 + Inertia.js 2 + React 19 (TypeScript) + Tailwind v4 + shadcn/ui. SQLite by default.

## Conventions

- Pages: `resources/js/pages/**` (Inertia components, default export). Wrap dashboard pages in the matching shell: `UserShell` / `AdminShell` / `SuperShell` from `resources/js/layouts/`.
- Navigation: use `Link` from `@inertiajs/react` with `href` (not TanStack `to`). Server routing lives in `routes/web.php`.
- Data flows controller → `Inertia::render('area/page', [...props])` → typed React props. Do not fetch in components; pass props.
- Shared UI: `components/dashboard-layout.tsx` (`WelcomeHero`, `SummaryTiles`, `PanelCard`), `components/page-stub.tsx`, `components/ui/*` (shadcn). Reuse before adding new primitives.
- Admin CRUD: reuse `components/admin/entity-manager.tsx` (config-driven table + create/edit dialog; supports an optional `rowAction` link). See `pages/admin/cultural-repository.tsx` / `multimedia.tsx`.
- Styling: Tailwind v4 tokens in `resources/css/app.css` (`bg-tile-*`, `bg-primary`, etc.). No generic AI-default layouts — match the existing EPANAW design.
- Roles: guard routes with `->middleware('role:admin,super')`. Redirect via `User::homePath()`. Learner routes also run `EnsureNotUnderMaintenance`.
- Flash: controllers `->with('status', ...)`; read on the client via shared `flash.status`. System config via `Setting::get/set`; audit actions via `ActivityLog::record(...)`.
- AI Chatbot: server-side Claude call in `AiChatbotController` (Laravel `Http`, model `claude-opus-4-8`). Needs `ANTHROPIC_API_KEY` in `.env`.

## Commands

- `php artisan migrate:fresh --seed` — reset DB + demo data
- `npm run dev` / `php artisan serve` — dev
- `npm run build` — production bundle
- `npx tsc --noEmit` — type-check · `npm run lint` — eslint · `./vendor/bin/pint` — PHP format
- `php vendor/bin/phpunit` — test suite (class-based PHPUnit; Pest binary isn't installed)

Reference mockups: `Refference/`. Archived prototype: `_legacy-tanstack/`.
