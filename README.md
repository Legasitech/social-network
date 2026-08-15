# Social — соцсеть в духе ВКонтакте

## Фичи

- **Auth** — username + пароль + ник (без почты)
- **Профили** — аватар/обложка (загрузка файлов), статус, био
- **Лента** — посты с фото, лайки, **комментарии**, **репосты**
- **Мессенджер** — **Socket.io реалтайм**, стикеры, фото, typing indicator
- **Группы** — создание сообществ
- **Стикерпаки** — 5 паков (эмоции, жесты, сердечки, праздник, животные)
- **Друзья** — заявки

## Стек

- Next.js 15 + TypeScript + Tailwind
- Prisma + PostgreSQL
- **Custom server** (`server.js`) = Next + **Socket.io**
- JWT httpOnly cookie
- Локальная загрузка файлов → `/public/uploads`

## Быстрый старт

```bash
npm install
cp .env.example .env
# DATABASE_URL=postgresql://...
# JWT_SECRET=...

npx prisma db push
npx prisma generate
npm run db:seed

# ВАЖНО: запускай через custom server (не next dev)
npm run dev
```

Открой http://localhost:3000

## Socket.io

- Path: `/api/socket`
- События: `auth`, `join:conversation`, `message:new`, `typing:start/stop`, `user:online`
- Сервер кладёт `global.io` — API routes эмитят события

## Загрузка файлов

`POST /api/upload` (FormData: `file` + `type`: avatar|cover|post|message)

Файлы → `public/uploads/{avatars,covers,posts,messages}/`

## Обновление на GitHub

Если репозиторий уже есть:

```bash
# 1. Распакуй новый зип поверх или в новую папку
unzip social-network-v2.zip
cd social-network-main

# 2. Если у тебя уже клон репо:
cd твой-репо
# Скопируй новые/изменённые файлы из зипа, ИЛИ:
git remote -v   # проверь remote

# Полная замена содержимого (осторожно — сохрани .env):
# Скопируй всё из зипа в папку репо, потом:

git add -A
git status
git commit -m "feat: socket.io realtime, file uploads, comments, reposts, stickers"
git push origin main
# или git push origin master
```

Если нужно **форс-обновить** (перезаписать remote):

```bash
git add -A
git commit -m "feat: full realtime + uploads + comments + reposts"
git push --force origin main   # только если уверен!
```

Рекомендуемый безопасный путь:

```bash
# В папке с текущим клоном
git checkout -b feature/realtime-uploads
# Скопируй файлы из зипа (rsync / вручную)
rsync -av --exclude node_modules --exclude .next --exclude .env ../social-network-main/ ./
git add -A
git commit -m "feat: socket.io, uploads, comments UI, reposts, more stickers"
git push -u origin feature/realtime-uploads
# Потом Merge Request / Pull Request на GitHub
```

## Структура

```
server.js              # Next + Socket.io
prisma/schema.prisma
prisma/seed.ts         # 5 стикерпаков
src/
  app/(main)/feed      # лента + PostCard
  app/(main)/messages  # реалтайм чат
  app/(main)/settings  # аватар/обложка upload
  app/(main)/groups
  app/api/upload
  app/api/stickers
  app/api/comments
  app/api/posts/[id]/repost
  components/
    PostCard.tsx       # комменты + репосты
    ChatInput.tsx      # стикеры + фото + socket
    RealtimeMessages.tsx
  lib/socket.ts
public/uploads/
```

## Дальше

- [ ] WebRTC звонки
- [ ] Уведомления (socket)
- [ ] S3 вместо local uploads
- [ ] Импорт TG стикерпаков
