# Деплой творческого портфолио на GitHub Pages

Публичный сайт — **статика** из папки `artist/`. Админка (`admin/`) на Pages **не выкладывается**: ты правишь контент локально и пушишь файлы в git.

## Как это работает

1. Локально запускаешь админку: из корня репо `npm run dev:admin` (порт 3001).
2. Добавляешь проекты, фото, сетку — всё пишется в:
   - `artist/data/projects.json`
   - `artist/data/about.json`
   - `artist/public/uploads/` (картинки и GIF)
3. Коммитишь и пушишь эти файлы в GitHub.
4. GitHub Actions собирает сайт и публикует на Pages.

## Первый запуск GitHub Pages

1. Создай репозиторий на GitHub (или используй существующий).
2. Залей код (весь monorepo или только `artist/` — workflow рассчитан на monorepo с папкой `artist`).
3. В репозитории: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Запушь в ветку `main` (или `master`) — сработает workflow `.github/workflows/artist-github-pages.yml`.

### URL сайта

| Тип репозитория | Адрес |
|-----------------|--------|
| `username.github.io` | `https://username.github.io/` |
| Любой другой, напр. `artist-room` | `https://username.github.io/artist-room/` |

Base path подставляется автоматически в CI.

## Локальная проверка «как на Pages»

```bash
cd artist
npm ci
npm run build
npm run preview:pages
```

Симуляция project site (если репо не `username.github.io`):

```powershell
$env:NEXT_PUBLIC_BASE_PATH="/имя-репозитория"
npm run build
npm run preview:pages
```

## Что коммитить после правок в админке

```bash
git add artist/data/projects.json artist/data/about.json artist/public/uploads/
git commit -m "Обновление портфолио"
git push
```

`.next/` и `node_modules/` в git не нужны.

## Локальная разработка сайта

```bash
npm run dev:artist
# http://127.0.0.1:3003
```

Превью сразу читает `data/` и `public/uploads/` — как после деплоя.

## Адаптив

Сетка на мобилке — одна колонка, попап с blur и фото на всю ширину экрана. Проверка: DevTools → 375px или реальный телефон.

## Если что-то не обновилось на Pages

- Убедись, что запушены `data/*.json` и новые файлы в `uploads/`.
- **Actions** → последний workflow зелёный.
- Подожди 1–2 мин после деплоя, сбрось кэш браузера.

## Админка остаётся локальной

Токен `ADMIN_TOKEN` (по умолчанию `change-me`) только для `http://127.0.0.1:3001`. На GitHub Pages API сайта нет — это нормально.
