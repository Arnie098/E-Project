# Handoff notes for Codex / VS Code

This summarizes everything added for the mobile app so you can continue in your
editor. All changes are on branch `main`.

## What was added

### Backend (Laravel) — mobile JSON API
- `composer.json`: added `laravel/sanctum ^4.0`.
- `bootstrap/app.php`: registered `routes/api.php` in `withRouting(api: ...)`.
- `config/sanctum.php`: standard Sanctum config.
- `database/migrations/2025_07_23_000011_create_personal_access_tokens_table.php`.
- `app/Models/User.php`: added `Laravel\Sanctum\HasApiTokens` trait.
- `routes/api.php`: all mobile endpoints (public register/login; the rest behind `auth:sanctum`).
- `app/Http/Controllers/Api/`:
  - `AuthController` (register/login/me/update/logout, issues `createToken('mobile')`)
  - `ContentController` (dashboard, vocabulary, stories, media, events, repository, learning modules, submitQuiz, progress)
  - `CommunityController` (contributions, feedback — list + create)
  - `ChatbotController` (conversation list/detail/delete)
  - `POST /api/chatbot` reuses the existing `AiChatbotController@chat` so the AI
    scope gate, DB grounding, and refusal logic are identical to the web app.

### Mobile (Expo React Native + TypeScript) — in `mobile/`
- Config: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `.gitignore`, `.env.example`.
- App shell: `App.tsx`, `src/config.ts`, `src/theme.ts`.
- API layer: `src/api/{client,endpoints,types}.ts` (fetch + SecureStore token + typed calls).
- State: `src/context/AuthContext.tsx`, `src/hooks/useAsync.ts`.
- UI kit: `src/components/ui.tsx`.
- Navigation: `src/navigation/{types,RootNavigator,AuthNavigator,AppNavigator,TabNavigator}.tsx`.
- Screens: Login, Register, Home, Learn, Explore, Assistant (chat + history), Profile,
  ModuleDetail (quiz), Vocabulary, Stories, Media, Events, Repository, Community, Progress.

## Run it

Backend (project root):
```bash
composer require laravel/sanctum   # or composer install
php artisan migrate
php artisan optimize:clear
php artisan serve --host 0.0.0.0 --port 8000
```

Mobile:
```bash
cd mobile
npm install
cp .env.example .env      # set EXPO_PUBLIC_API_URL to your LAN IP:8000/api
npx expo start
```

## Contract notes / gotchas
- `POST /api/chatbot` returns `{ reply, conversation_id, conversation_title }`.
  Errors: `503 { error }` (AI not configured) and `502 { error }` (provider failure).
  The mobile client reads both `message` and `error` keys.
- Sanctum token is stored under SecureStore key `epanaw_token`.
- The mobile client sends the last 20 messages as chat context; the server still
  enforces the scope gate, so off-topic questions get the same refusal reply.
- `EXPO_PUBLIC_API_URL` is inlined at build time — restart Expo after changing `.env`.

## Suggested next steps (not yet done)
- Mobile attachment upload (images/PDFs) to reuse the web chat attachment feature.
- Push notifications for events/announcements.
- Offline caching of vocabulary/stories.
- Verify each `Api\*Controller` response shape matches `mobile/src/api/types.ts`
  against your real data and adjust field mappings if needed.
