# EPANAW BAGOBO — Mobile App (Expo / React Native)

A React Native (Expo, managed workflow) mobile client for the EPANAW BAGOBO
platform. It talks to the existing Laravel app over a JSON API secured with
Laravel Sanctum bearer tokens.

## Features (v1 — learner-facing)

- Email/password **login & registration** (Sanctum token stored in Expo SecureStore)
- **Home dashboard**: greeting, stats, announcement, quick access, continue learning, upcoming events
- **Learning modules**: list, detail with lesson content, and interactive **quiz** with server-side grading
- **Explore**: vocabulary dictionary (search + categories), storytelling archive, multimedia gallery, cultural repository, events
- **AI Assistant (Epanaw AI)**: chat with the same scope-limited assistant as the web app, with **chat history** (open/delete past conversations) and English/Cebuano/Tagalog support
- **Community**: submit contributions and feedback; view your submissions
- **Progress**: track completed / in-progress modules and quiz scores
- **Profile**: view and edit your profile, sign out

> Note: attachment upload from mobile is not included in v1 (the web app keeps
> that feature). The chat endpoint accepts attachment IDs but the mobile client
> does not send them yet.

## Requirements

- Node.js 18+
- The Laravel backend running and reachable from your device/emulator
- Expo Go app (for physical devices) or an Android/iOS emulator

## 1. Configure & run the Laravel backend

The mobile API lives under `routes/api.php` and uses Sanctum. From the project
root (not the `mobile/` folder):

```bash
composer require laravel/sanctum   # or: composer install
php artisan migrate                # creates personal_access_tokens table
php artisan optimize:clear
php artisan serve --host 0.0.0.0 --port 8000
```

`--host 0.0.0.0` lets other devices on your LAN reach the server. The mobile
endpoints are:

- `POST /api/register`, `POST /api/login` (public)
- `GET /api/user`, `PUT /api/user`, `POST /api/logout`
- `GET /api/dashboard`, `/api/vocabulary`, `/api/stories`, `/api/media`, `/api/events`, `/api/repository`
- `GET /api/learning-modules`, `GET /api/learning-modules/{id}`, `POST /api/learning-modules/{id}/quiz`, `GET /api/progress`
- `GET|POST /api/contributions`, `GET|POST /api/feedback`
- `POST /api/chatbot`, `GET /api/chatbot/conversations`, `GET|DELETE /api/chatbot/conversations/{id}`

## 2. Configure & run the mobile app

```bash
cd mobile
npm install
cp .env.example .env
```

Edit `.env` and set `EXPO_PUBLIC_API_URL` so the device can reach Laravel:

| Target | Value |
| --- | --- |
| Physical device (Expo Go) | `http://<your-computer-LAN-IP>:8000/api` |
| Android emulator | `http://10.0.2.2:8000/api` |
| iOS simulator | `http://localhost:8000/api` |

`localhost` will **not** work on a physical device — use your machine's LAN IP
(e.g. `http://192.168.1.20:8000/api`).

Then start Expo:

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator.

## Project structure

```
mobile/
  App.tsx                 # SafeAreaProvider + AuthProvider + RootNavigator
  src/
    config.ts             # reads EXPO_PUBLIC_API_URL
    theme.ts              # colors, spacing, radius, fonts
    api/
      client.ts           # fetch wrapper + SecureStore token + ApiError
      endpoints.ts        # typed API calls
      types.ts            # shared response types
    context/AuthContext.tsx
    hooks/useAsync.ts     # loading/error/reload data hook
    components/ui.tsx     # Card, PrimaryButton, TextField, Pill, ProgressBar, states
    navigation/           # Root/Auth/App/Tab navigators + param types
    screens/              # Login, Register, Home, Learn, Explore, Assistant,
                          # Profile, ModuleDetail, Vocabulary, Stories, Media,
                          # Events, Repository, Community, Progress
```

## Auth flow

1. `AuthContext` reads the SecureStore token on launch and calls `GET /api/user`.
2. Valid token → authenticated stack (tabs). No/invalid token → auth stack (login/register).
3. Login/register store the returned Sanctum token; logout clears it and calls `POST /api/logout`.
