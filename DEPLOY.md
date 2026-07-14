# artist-room → GitHub Pages

Публичный сайт. Разработка и админка — в monorepo `bobkov-graphic-designer`.

## Публикация

1. Обнови файлы в этом репо (`data/`, `public/uploads/`, код при необходимости).
2. `git push`
3. **Settings → Pages → Source: GitHub Actions** (один раз).
4. Сайт: `https://yeahwereTrying1.github.io/artist-room/`

## Синхронизация из monorepo

После правок в админке (локально в `bobkov-graphic-designer`):

```bash
# из monorepo — скопировать artist/ в клон artist-room и запушить
```

Или вручную: `artist/data/`, `artist/public/uploads/` → этот репозиторий.
