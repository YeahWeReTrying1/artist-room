# artist-room → GitHub Pages

## Включить Pages (один раз)

1. **Settings → Pages**
2. **Source: Deploy from a branch**
3. **Branch: `gh-pages`** → папка **`/ (root)`** → **Save**
4. Сайт: `https://yeahweretrying1.github.io/artist-room/`

Workflow сам собирает Next.js и пушит в ветку `gh-pages`.

## Обновить сайт

Пуш в `main` → Actions → зелёный run → через 1–2 мин сайт обновится.

## Права Actions (один раз)

**Settings → Actions → General → Workflow permissions → Read and write permissions → Save**

## Разработка

Monorepo `bobkov-graphic-designer` — админка и правки локально.  
Сюда синхронизируй `data/` и `public/uploads/`.
