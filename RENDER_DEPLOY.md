# Deploying on Render (free)

This repository includes a Render Blueprint in `render.yaml`. It creates a
free Docker web service in Singapore and connects it to an external MySQL
database.

## Deploy the Laravel web app and API

1. Commit and push these changes to a GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com/), select **New > Blueprint** and connect that repository.
3. Render will ask for `APP_KEY` and the external MySQL values: `DB_HOST`,
   `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`. Generate the app key locally with:

   ```powershell
   php artisan key:generate --show
   ```

4. Enter an AI key only if the AI chatbot should be enabled. Use `AI_API_KEY`
   for the configured provider, or `ANTHROPIC_API_KEY` for the legacy fallback.
5. Create the Blueprint and wait for the `/up` health check to pass. Copy the
   resulting URL, such as `https://manayun-bagobo.onrender.com`.

The mobile client must use `https://manayun-bagobo.onrender.com/api` as
`EXPO_PUBLIC_API_URL` in the EAS **production** environment, then be rebuilt
with `npx eas-cli@latest build --platform android --profile production`.

## Important free-tier limits

- The web service sleeps after 15 idle minutes, so the first mobile request
  after inactivity can take about a minute.
- Render does not offer managed MySQL. Running MySQL on Render requires a paid
  persistent disk, so use an external MySQL provider if the web service must
  remain free. Its firewall must allow Render's outbound connections.
- Render's local filesystem is temporary. Chat attachments currently use the
  local disk and will be lost after a restart or redeploy. Configure S3/R2
  storage before relying on file attachments in production.
