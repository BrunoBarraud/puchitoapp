# Puchito App

Aplicacion fullstack de finanzas personales construida con Next.js, TypeScript, Tailwind CSS, Prisma y PostgreSQL.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Recharts
- Zod
- bcryptjs

## Variables de entorno

Crear `.env` a partir de `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/puchito_app?schema=public"
AUTH_SECRET="replace-with-a-long-random-secret"
```

## Instalacion

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`

## Que incluye

- Registro e inicio de sesión con cookie httpOnly firmada
- Dashboard mensual con métricas, resumen y últimos movimientos
- CRUD de transacciones, categorías y presupuestos
- Reportes con Recharts
- Importacion y exportacion JSON por usuario
- Rutas protegidas para usuarios autenticados

## Base de datos

1. Configurar PostgreSQL y completar `DATABASE_URL`.
2. Ejecutar `npx prisma migrate dev`.
3. Ejecutar `npx prisma generate` si hace falta regenerar el cliente.

## Deploy en Vercel

1. Crear proyecto en Vercel y conectar el repositorio.
2. Configurar `DATABASE_URL` y `AUTH_SECRET` en variables de entorno.
3. Usar una base PostgreSQL accesible desde Vercel.
4. Ejecutar migraciones sobre la base productiva antes del primer uso.

## Notas

- Las categorías por defecto se crean automáticamente al registrarse un usuario.
- La importacion reasigna siempre `userId` al usuario autenticado.
- Los datos principales viven en PostgreSQL, no en `localStorage`.
