# Build the Inertia/Vite assets separately so the runtime image contains only
# the production PHP application and its compiled frontend.
FROM node:22-bookworm-slim AS frontend

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

FROM php:8.3-cli-bookworm

WORKDIR /var/www/html

RUN apt-get update \
    && apt-get install --yes --no-install-recommends libzip-dev unzip \
    && docker-php-ext-install pdo_mysql pdo_sqlite zip \
    && rm -rf /var/lib/apt/lists/*

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

# Free Render instances do not support one-off jobs, so migrations run safely
# on container start before the health endpoint is exposed.
CMD ["sh", "-c", "php artisan migrate --force && php artisan optimize && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
