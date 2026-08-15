# Social — современная соцсеть

MVP социальной сети в духе ВКонтакте.

## Фичи MVP

- Регистрация / вход по email + юзернейм
- Профили с аватарками
- Стена (посты + лайки + комментарии)
- Друзья / подписки
- Мессенджер (личные чаты, стикеры, реалтайм)
- Онлайн-статусы

## Стек

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind
- **Backend**: Next.js API Routes + Prisma
- **БД**: PostgreSQL
- **Реалтайм**: Socket.io (в разработке)
- **Auth**: JWT в httpOnly cookie

## Быстрый старт

1. Установи зависимости:
```bash
npm install
# или yarn
```

2. Настрой `.env`:
```bash
cp .env.example .env
# Укажи DATABASE_URL и JWT_SECRET
```

3. Примени схему БД:
```bash
npx prisma db push
npx prisma generate
```

4. Запусти:
```bash
npm run dev
```

Открой http://localhost:3000

## Структура

```
src/
  app/
    (auth)/          # login, register
    (main)/          # feed, messages, profile
    api/auth/        # auth endpoints
  lib/               # prisma, auth, utils
  components/        # UI компоненты
prisma/
  schema.prisma      # схема БД
```

## Дальше

- [ ] Создание постов (форма)
- [ ] Лайки и комментарии
- [ ] Система друзей
- [ ] Реалтайм чаты + стикеры
- [ ] Загрузка аватарок
- [ ] WebRTC звонки

---

Сделано с ❤️
