# Handoff notes for Codex / VS Code

This summarizes everything added for the mobile app + the voice-translation
feature so you can continue in your editor. All changes are on branch `main`.

> Branding: the app is now **MANAYUN BAGOBO** (renamed from EPANAW BAGOBO). The
> Expo `name`/`slug`/`scheme` and native bundle IDs are `com.manayun.mobile`, and
> the AI assistant persona is **Manayun**. The web brand shown in the UI is driven
> by the DB setting `site_name` (Super Admin -> Settings) plus the seeder; see the
> rebrand find-replace section below for the remaining string swaps.

## Voice translation (NEW — outcome #1)

Translates **English or Tagalog -> Bagobo Tagabawa**, grounded in the platform's
verified vocabulary, with native-speaker pronunciation audio.

### Backend
- `app/Http/Controllers/Api/TranslationController.php` — `POST /api/translate`
  (behind `auth:sanctum`). Validates `{ text (max 2000), source: en|tl }`.
  - Lexical match against `VocabularyWord` (+ `pronunciationRecord`) builds a
    `matches` list of relevant verified words.
  - `translateWithAi()` sends a STRICT grounded system prompt (glossary of
    matched `Bagobo = meaning` pairs; instructs the model NOT to invent words for
    this low-resource language and to reply with Bagobo only).
  - `callProvider()` supports both `wire_api=responses` (POST `$base/v1/responses`)
    and the `messages` wire format, reusing the same AI env config as the chatbot.
  - Returns `{ source, sourceLabel, target:'bagobo', targetLabel:'Bagobo Tagabawa',
    input, translation, matches:[{ id, word, meaning, pronunciation, audio, speaker }] }`.
- `routes/api.php` — added `use ...TranslationController;` + the `/translate` route.

### Mobile
- `src/screens/TranslateScreen.tsx` — EN/TL toggle, text box, mic button, Translate
  button, result card (with copy) + verified-word list with per-word audio play.
- New **Translate** bottom tab (icon `language`): `src/navigation/types.ts`
  (`TabParamList`) + `src/navigation/TabNavigator.tsx`.
- `src/api/types.ts` — `TranslationMatch`, `TranslationResult`.
- `src/api/endpoints.ts` — `api.translate({ text, source })`.
- Audio playback uses **`expo-av`** (added to `package.json`).
- Speech-to-text uses **`expo-speech-recognition`** (added to `package.json` +
  `app.json` plugin + mic/speech permissions). It is loaded via a guarded
  `require`, so the screen still works as a text translator if the module is absent.

> IMPORTANT: on-device STT (the mic) requires an **EAS development build** — it does
> NOT run in Expo Go. In Expo Go the mic button shows a friendly notice and typing
> still works. Build with `npx expo run:android` / `run:ios` or an EAS dev build to
> enable the microphone. Asset audio URLs are resolved to `${ORIGIN}/storage/...`
> where `ORIGIN` = `EXPO_PUBLIC_API_URL` with a trailing `/api` stripped.

### After pulling
```bash
cd mobile
npm install            # installs expo-av + expo-speech-recognition
npx expo start
```
Backend needs no new packages for translation (reuses the AI config).

## Rebrand: remaining EPANAW -> MANAYUN find-replace (do in VS Code)

The mobile app, `welcome.tsx`, and all mobile tab titles are already renamed.
Remaining web files are simple string swaps — do them as global find-replace:

1. **Display brand** — replace every `EPANAW BAGOBO` with `MANAYUN BAGOBO`
   across `resources/js/**` (covers `register.tsx` brand panel, `super/settings.tsx`
   placeholder, and ~35 `<Head title>` / `pageTitle` strings in
   `resources/js/pages/{super,admin,user}/*.tsx`). Also `page-stub.tsx` and the
   root `AGENTS.md` if desired.
2. **AI persona** — in these files replace the persona name `Epanaw` with `Manayun`
   (and any `EPANAW BAGOBO` -> `MANAYUN BAGOBO`):
   - `app/Http/Controllers/AiChatbotController.php` — `SYSTEM_PROMPT` persona +
     `OUT_OF_SCOPE_REPLY` brand. **Also ADD `'manayun'` to `SCOPE_KEYWORDS`**
     (keep `'epanaw'` so old links still pass the scope gate).
   - `resources/js/components/floating-ai-chat.tsx` — persona text, aria labels,
     placeholder, and the `STORAGE_KEY` (`epanaw-floating-chat-history`).
   - `resources/js/pages/user/ai-chatbot.tsx` — `"Epanaw — AI Guide"` and the
     greeting `"Kumusta! I'm Epanaw."`.
3. **Seeder** — `database/seeders/DatabaseSeeder.php`:
   `Setting::set('site_name', 'EPANAW BAGOBO')` -> `'MANAYUN BAGOBO'`, the module
   description, and announcement `'Welcome to EPANAW BAGOBO!'` / author `'EPANAW Team'`.
   Then re-seed the `site_name` setting (or edit it in Super Admin -> Settings) so
   the live UI brand updates.

> DO NOT CHANGE these (they are content, not brand):
> - The vocabulary entry `['word' => 'Epanaw', 'meaning' => 'journey']` and the
>   `Salamat=thank you, Epanaw=journey, Kasili=friend` example comment in the seeder.

## Backend (Laravel) — mobile JSON API
- `composer.json`: added `laravel/sanctum ^4.0`.
- `bootstrap/app.php`: registered `routes/api.php` in `withRouting(api: ...)`.
- `config/sanctum.php`: standard Sanctum config.
- `database/migrations/2025_07_23_000011_create_personal_access_tokens_table.php`.
- `app/Models/User.php`: added `Laravel\Sanctum\HasApiTokens` trait.
- `routes/api.php`: all mobile endpoints (public register/login; the rest behind `auth:sanctum`).
  Includes `POST /api/chatbot/attachments`, `GET /api/chatbot/attachments/{attachment}`,
  and `POST /api/translate`.
- `app/Http/Controllers/Api/`: `AuthController`, `ContentController`, `CommunityController`,
  `ChatbotController`, `TranslationController`. `POST /api/chatbot` reuses the web
  `AiChatbotController@chat` so the AI scope gate + DB grounding are identical.

## Mobile (Expo React Native + TypeScript) — in `mobile/`
- Config: `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `.gitignore`, `.env.example`.
- App shell: `App.tsx`, `src/config.ts`, `src/theme.ts`.
- API layer: `src/api/{client,endpoints,types}.ts`.
- State: `src/context/AuthContext.tsx`, `src/hooks/useAsync.ts`.
- UI kit: `src/components/ui.tsx`.
- Navigation: `src/navigation/{types,RootNavigator,AuthNavigator,AppNavigator,TabNavigator}.tsx`.
- Screens: Login, Register, Home, Learn, Explore, **Translate**, Assistant, Profile,
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
Android emulator uses `10.0.2.2`, iOS simulator uses `localhost`.

## Contract notes / gotchas
- `POST /api/chatbot` returns `{ reply, conversation_id, conversation_title }`.
  Errors: `503 { error }` (AI not configured) and `502 { error }` (provider failure).
- `POST /api/chatbot/attachments` takes multipart `file` and returns
  `{ id, name, kind, mime, size, url, readable }`. Send returned `id`s as
  `attachment_ids` (max 4, 10 MB each).
- `POST /api/translate` returns the `TranslationResult` shape above.
- Sanctum token is stored under SecureStore key `manayun_token`.
- `EXPO_PUBLIC_API_URL` is inlined at build time — restart Expo after changing `.env`.

## Security (action required)
- The AI provider key was shared in chat during setup. **Rotate it** and keep the
  new key only in `.env` (`AI_API_KEY=...`). Never commit a real key.
- AI env vars: `AI_PROVIDER=aerolink`, `AI_API_KEY=...`, `AI_BASE_URL=https://cgapi.aerolink.lat`,
  `AI_WIRE_API=responses`, `AI_MODEL=gpt-5.6-sol`, `AI_REASONING_EFFORT=high`,
  `AI_DISABLE_RESPONSE_STORAGE=true`, `AI_AUTH_METHOD=apikey`.

## Suggested next steps (not yet done)
- Audio/video playback in the Vocabulary + Media screens (reuse the `expo-av` +
  `assetUrl()` pattern now in `TranslateScreen.tsx`).
- Story/repository detail views (needs the API to return full story body).
- Push notifications for events/announcements; offline caching.
