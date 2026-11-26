# BookSwap — Plataforma de intercambio de libros

**Español** · [English](README_EN.md)

![CI](https://github.com/EntyumDAW/proyecto-libro/actions/workflows/ci.yml/badge.svg)

**[Demo](https://proyecto-libro-frontend.onrender.com)** · **[API](https://proyecto-libro-backend.onrender.com/health)**

> El backend está en el plan gratuito de Render y puede tardar unos 30 segundos en arrancar la primera vez.

Aplicación web full stack para comprar, vender e intercambiar libros de segunda mano entre usuarios. Desarrollada con React, Node.js/Express, PostgreSQL y Docker.

## Capturas

| Inicio | Anuncios | Detalle del libro | Notificaciones |
|------|----------|-------------|---------------|
| ![Inicio](docs/screenshots/page-home.png) | ![Anuncios](docs/screenshots/listings.png) | ![Detalle](docs/screenshots/book-detail.png) | ![Notificaciones](docs/screenshots/notifications.png) |

| Transacciones | Mensajes | Mi cuenta |
|--------------|----------|------------|
| ![Transacciones](docs/screenshots/transactions.png) | ![Mensajes](docs/screenshots/messages.png) | ![Cuenta](docs/screenshots/account.png) |

## Qué incluye

- **API REST de 38 endpoints** con arquitectura por capas (rutas → middlewares → controladores → repositorios) y **13 modelos** en PostgreSQL con Prisma.
- **Compraventa e intercambio** con ciclo completo de transacción (`pendiente → aceptada/rechazada → completada/cancelada`) y confirmación de ambas partes.
- **Mensajería entre usuarios** con el contenido **cifrado con AES-256-CBC**.
- **Autenticación JWT**, contraseñas con **bcrypt**, validación en servidor y rutas protegidas en frontend y backend.
- Notificaciones, favoritos y búsqueda de libros con la **API de Google Books**.
- **31 tests** (Vitest y Supertest) ejecutados en cada push con **GitHub Actions**.
- Despliegue con **Docker Compose** y **Nginx**.

## Stack

**Frontend:** React 19, Vite, React Router, Material UI, Axios
**Backend:** Node.js, Express 5, Prisma 6, PostgreSQL 16, JWT, bcrypt
**Testing y CI:** Vitest, Supertest, React Testing Library, GitHub Actions
**Infraestructura:** Docker, Docker Compose, Nginx, Render

## Arquitectura

```
Frontend (React + Nginx) ──▶ Backend (Express) ──▶ PostgreSQL (Prisma)
                                   │
                                   ▼
                           Google Books API
```

<details>
<summary><b>Endpoints de la API</b></summary>

Todos llevan el prefijo `/api`, salvo `/health`.

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Registrar un usuario |
| `POST` | `/auth/login` | — | Iniciar sesión y obtener el JWT |
| `GET` | `/libros/search?q=` | — | Buscar libros en Google Books |
| `GET` | `/libros/:id` | — | Detalle de un libro por ISBN o ID de Google |
| `POST` | `/libros/nuevo-libro` | ✓ | Crear un libro manualmente |
| `GET` | `/categorias` | — | Listar categorías |
| `POST` | `/categorias/nueva` | ✓ | Crear una categoría |
| `GET` | `/ejemplares/mis-ejemplares` | ✓ | Ejemplares del usuario |
| `GET` | `/ejemplares/:libro_id` | — | Ejemplares de un libro |
| `POST` | `/ejemplares/crear-ejemplar` | ✓ | Añadir un ejemplar |
| `PUT` | `/ejemplares/actualizar-ejemplar/:id` | ✓ | Editar un ejemplar |
| `DELETE` | `/ejemplares/borrar-ejemplar/:id` | ✓ | Borrar un ejemplar |
| `GET` | `/anuncios` | — | Ver anuncios activos |
| `GET` | `/anuncios/mis-anuncios` | ✓ | Anuncios del usuario |
| `GET` | `/anuncios/:id` | — | Detalle de un anuncio |
| `POST` | `/anuncios/crear-anuncio` | ✓ | Crear un anuncio |
| `PUT` | `/anuncios/actualizar-anuncio/:id` | ✓ | Editar un anuncio |
| `DELETE` | `/anuncios/borrar-anuncio/:id` | ✓ | Borrar un anuncio |
| `POST` | `/transacciones` | ✓ | Iniciar una transacción |
| `GET` | `/transacciones/mis-transacciones` | ✓ | Transacciones del usuario |
| `PUT` | `/transacciones/:id/aceptar` | ✓ | Aceptar una transacción |
| `PUT` | `/transacciones/:id/cancelar` | ✓ | Cancelar una transacción |
| `PUT` | `/transacciones/:id/completar` | ✓ | Confirmar que se ha completado |
| `GET` | `/notificaciones` | ✓ | Notificaciones del usuario |
| `GET` | `/notificaciones/no-leidas` | ✓ | Número de notificaciones sin leer |
| `PUT` | `/notificaciones/:id/leida` | ✓ | Marcar una como leída |
| `PUT` | `/notificaciones/todas-leidas` | ✓ | Marcar todas como leídas |
| `GET` | `/perfil` | ✓ | Ver perfil |
| `PUT` | `/perfil/actualizar-perfil` | ✓ | Editar perfil |
| `PUT` | `/perfil/cambiar-password` | ✓ | Cambiar contraseña |
| `GET` | `/favoritos` | ✓ | Listar favoritos |
| `POST` | `/favoritos/toggle` | ✓ | Añadir o quitar un favorito |
| `GET` | `/favoritos/:libroRef` | ✓ | Comprobar si un libro es favorito |
| `GET` | `/mensajes/no-leidos` | ✓ | Número de mensajes sin leer |
| `GET` | `/mensajes/conversaciones` | ✓ | Listar conversaciones |
| `POST` | `/mensajes/conversaciones` | ✓ | Iniciar una conversación |
| `GET` | `/mensajes/conversaciones/:id` | ✓ | Mensajes de una conversación |
| `POST` | `/mensajes/conversaciones/:id/mensajes` | ✓ | Enviar un mensaje |
| `GET` | `/health` | — | Estado del servidor y la base de datos |

</details>

<details>
<summary><b>Modelo de datos</b></summary>

| Modelo | Descripción |
|-------|-------------|
| `usuario` | Cuentas de usuario con perfil y rol (usuario/admin) |
| `libros` | Datos del libro (ISBN, título, autor, sinopsis, portada) |
| `ejemplares` | Copias físicas de cada usuario |
| `anuncio` | Anuncios de venta o intercambio de un ejemplar |
| `intercambio_deseado` | Libros que se aceptan a cambio en un anuncio |
| `transacciones` | Transacción entre dos usuarios |
| `transporte` | Datos de envío de una transacción |
| `conversacion` | Conversación 1 a 1 (única por pareja de usuarios) |
| `mensaje` | Mensaje cifrado dentro de una conversación |
| `notificaciones` | Notificaciones de cada usuario |
| `favorito` | Libros guardados por usuario |
| `categorias` | Categorías jerárquicas |
| `libro_categoria` | Relación entre libros y categorías |

</details>

## Ejecutar en local

```bash
git clone https://github.com/EntyumDAW/proyecto-libro
cd proyecto-libro
# Configura las variables de entorno (ver backend/.env.example)
docker compose up --build
```

La app queda en `http://localhost:5173` y la API en `http://localhost:4000`.

## Tests

```bash
cd backend && npm test    # 17 tests: health, auth, búsqueda y detalle de libros
cd frontend && npm test   # 14 tests: gestión de errores y traducciones
```

Los repositorios y las APIs externas están mockeados, así que no hace falta base de datos ni conexión a internet.

## Licencia

Copyright (c) 2025 Antonio Armero Muñoz. Todos los derechos reservados. El código es público solo con fines de portfolio y educativos.
