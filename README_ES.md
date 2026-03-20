# BookSwap — Plataforma de Intercambio de Libros

Aplicación web full-stack para comprar, vender e intercambiar libros de segunda mano entre usuarios. Desarrollada con React, Node.js/Express, PostgreSQL y Docker.

> **Proyecto de portfolio** — muestra una API REST completa, autenticación JWT, mensajería en tiempo real, almacenamiento de datos cifrado y un despliegue totalmente contenedorizado.

---

## Capturas de pantalla

> Añade tus propias capturas reemplazando las rutas de abajo. Recomendadas: Home, Anuncios, Detalle de libro, Transacciones, Mensajes.

| Home | Anuncios | Detalle de libro |
|------|----------|------------------|
| ![Home](docs/screenshots/home.png) | ![Anuncios](docs/screenshots/listings.png) | ![Detalle](docs/screenshots/book-detail.png) |

| Transacciones | Mensajes | Mi cuenta |
|---------------|----------|-----------|
| ![Transacciones](docs/screenshots/transactions.png) | ![Mensajes](docs/screenshots/messages.png) | ![Cuenta](docs/screenshots/account.png) |

> **Cómo añadir capturas:** Crea la carpeta `docs/screenshots/` en la raíz del repositorio, haz capturas de cada página y guárdalas con los nombres indicados.

---

## Tabla de contenidos

- [Funcionalidades](#funcionalidades)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Esquema de base de datos](#esquema-de-base-de-datos)
- [Referencia de la API](#referencia-de-la-api)
- [Cómo empezar](#cómo-empezar)
- [Variables de entorno](#variables-de-entorno)
- [Testing](#testing)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Funcionalidades

### Libros
- Búsqueda de libros a través de la **API de Google Books** (título, autor, ISBN)
- Vista detallada con portadas en alta resolución
- Creación manual de libros no disponibles en el catálogo de Google
- Sistema de categorías jerárquico

### Intercambio y venta
- **Anuncios de venta** — publica libros a precio fijo
- **Anuncios de intercambio** — solicita libros específicos, acepta alternativas
- Ciclo de vida completo de la transacción: `pendiente → aceptada/rechazada → completada/cancelada`
- Confirmación independiente de ambas partes antes de completar la transacción
- Seguimiento de envío opcional por transacción

### Mensajería
- Conversaciones directas 1 a 1 entre usuarios
- Contenido de mensajes cifrado con **AES-256-CBC**
- Badge de mensajes no leídos con actualización periódica
- Contexto de transacción opcional por conversación

### Notificaciones
- Sistema de notificaciones en la aplicación (intercambio solicitado, transacción actualizada, libro disponible)
- Estado leído/no leído por notificación
- Contador en el header actualizado cada 10 segundos

### Cuentas de usuario
- Autenticación basada en JWT con hashing de contraseñas bcrypt
- Contraseña segura obligatoria (mayúsculas, minúsculas, números, caracteres especiales)
- Gestión de perfil (nombre, dirección, ciudad, teléfono)
- Lista de favoritos con referencias externas de libros (ISBN o ID de Google Books)
- Historial completo de transacciones y anuncios

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19 | Framework de UI |
| Vite | 7 | Herramienta de build y servidor dev |
| React Router DOM | 7 | Enrutamiento en cliente |
| Material UI (MUI) | 7 | Biblioteca de componentes |
| Axios | 1.13 | Cliente HTTP |
| Font Awesome | 7 | Iconos |
| Vitest | 4 | Tests unitarios |
| React Testing Library | — | Tests de componentes |

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | 18 | Entorno de ejecución |
| Express | 5 | Framework web |
| Prisma | 6 | ORM y migraciones |
| PostgreSQL | 16 | Base de datos |
| JSON Web Token | 9 | Autenticación |
| bcrypt | 6 | Hashing de contraseñas |
| Axios | 1.13 | Cliente de la API de Google Books |
| Vitest | 4 | Tests unitarios e integración |
| Supertest | 7 | Tests de endpoints HTTP |

### Infraestructura
| Tecnología | Uso |
|-----------|-----|
| Docker | Contenedorización |
| Docker Compose | Orquestación de múltiples servicios |
| Nginx | Servicio de frontend estático en producción |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Docker Compose                    │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌───────────────┐  │
│  │ Frontend │───▶│ Backend  │───▶│  PostgreSQL   │  │
│  │  Nginx   │    │ Express  │    │   (Prisma)    │  │
│  │  :5173   │    │  :4000   │    │    :5432      │  │
│  └──────────┘    └──────────┘    └───────────────┘  │
│                       │                             │
│                       ▼                             │
│               Google Books API                      │
└─────────────────────────────────────────────────────┘
```

### Capas del backend

```
Petición HTTP
    │
    ▼
Routes          (src/routes/)        — Routers de Express
    │
    ▼
Middlewares     (src/middlewares/)   — Auth (JWT), Validación, Manejo de errores
    │
    ▼
Controllers     (src/controllers/)   — Lógica de negocio
    │
    ▼
Repositories    (src/repositories/)  — Acceso a datos (queries Prisma)
    │
    ▼
Base de datos   (PostgreSQL 16)
```

### Capas del frontend

```
Páginas (src/pages/)
    │
    ├── Componentes (src/components/)  — UI reutilizable
    ├── Servicios   (src/services/)    — Llamadas a la API con Axios
    ├── Contexto    (src/context/)     — Estado global de autenticación
    └── Utils       (src/utils/)       — Traducciones, manejo de errores
```

---

## Esquema de base de datos

```
usuario ──────────────────────────────────────────────────────┐
  │                                                           │
  ├──< ejemplares >──< anuncio >──< intercambio_deseado       │
  │         │              │                                  │
  │         │         transacciones                           │
  │         │              │                                  │
  │         └──────────────┘                                  │
  │                    │                                      │
  │              transporte                                   │
  │                                                           │
  ├──< notificaciones                                         │
  ├──< favorito                                               │
  └──< conversacion >──< mensaje                              │
                                                              │
libros >──< libro_categoria >──< categorias ─── categorias    │
  │                                          (auto-referencia)│
  └──< ejemplares                                             │
```

**Modelos principales:**

| Modelo | Descripción |
|--------|-------------|
| `usuario` | Cuentas de usuario con perfil y roles (usuario/admin) |
| `libros` | Metadatos del libro (ISBN, título, autor, sinopsis, portada) |
| `ejemplares` | Copias físicas individuales propiedad de los usuarios |
| `anuncio` | Anuncios de venta o intercambio referenciando un ejemplar |
| `transacciones` | Transacción completa entre dos usuarios |
| `transporte` | Detalles de envío de una transacción |
| `conversacion` | Hilo de mensajería 1 a 1 (único por par de usuarios) |
| `mensaje` | Mensaje individual cifrado dentro de una conversación |
| `notificaciones` | Notificaciones en la aplicación por usuario |
| `favorito` | Libros guardados por usuario (por ISBN o ID de Google Books) |
| `categorias` | Categorías jerárquicas de libros |

---

## Referencia de la API

Todos los endpoints tienen el prefijo `/api`.

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | — | Registrar un nuevo usuario |
| `POST` | `/auth/login` | — | Login y recibir JWT |
| `GET` | `/libros/search?q=` | — | Buscar libros en Google Books |
| `GET` | `/libros/:id` | — | Detalle de libro por ISBN o ID de Google |
| `POST` | `/libros` | ✓ | Crear un libro manualmente |
| `GET` | `/categorias` | — | Listar todas las categorías |
| `GET` | `/ejemplares` | ✓ | Listar copias de libros del usuario |
| `POST` | `/ejemplares` | ✓ | Añadir una nueva copia de libro |
| `PUT` | `/ejemplares/:id` | ✓ | Actualizar una copia de libro |
| `GET` | `/anuncios` | — | Ver todos los anuncios activos |
| `GET` | `/anuncios/:id` | — | Detalle de un anuncio |
| `POST` | `/anuncios` | ✓ | Crear un anuncio |
| `PUT` | `/anuncios/:id` | ✓ | Actualizar un anuncio |
| `DELETE` | `/anuncios/:id` | ✓ | Eliminar un anuncio |
| `GET` | `/transacciones` | ✓ | Listar transacciones del usuario |
| `POST` | `/transacciones` | ✓ | Iniciar una transacción |
| `PUT` | `/transacciones/:id` | ✓ | Actualizar estado de transacción |
| `GET` | `/notificaciones` | ✓ | Obtener notificaciones del usuario |
| `GET` | `/perfil` | ✓ | Obtener perfil del usuario |
| `PUT` | `/perfil` | ✓ | Actualizar perfil del usuario |
| `GET` | `/favoritos` | ✓ | Listar libros favoritos |
| `POST` | `/favoritos` | ✓ | Añadir o quitar un favorito |
| `GET` | `/mensajes` | ✓ | Listar conversaciones |
| `GET` | `/mensajes/:id` | ✓ | Obtener mensajes de una conversación |
| `POST` | `/mensajes` | ✓ | Enviar un mensaje |
| `GET` | `/health` | — | Comprobación de salud del servidor |

---

## Cómo empezar

### Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose
- Una [clave de la API de Google Books](https://developers.google.com/books/docs/v1/using#APIKey)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/ProyectoLibro.git
cd ProyectoLibro
```

### 2. Crear el archivo de entorno

```bash
cp .env.example .env
```

Rellena tus valores (ver [Variables de entorno](#variables-de-entorno)).

### 3. Iniciar todos los servicios

```bash
docker-compose up --build
```

Esto:
1. Inicia PostgreSQL y espera a que esté listo
2. Ejecuta `prisma db push` para aplicar el esquema
3. Inicia la API Express en el puerto **4000**
4. Construye la aplicación React y la sirve mediante Nginx en el puerto **5173**

### 4. Abrir la aplicación

```
http://localhost:5173
```

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=proyectoLibro

# Prisma (dentro de Docker el host es el nombre del servicio)
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_DATABASE}

# Backend
BACKEND_PORT=4000
JWT_SECRET=tu_secreto_jwt

# Google Books
GOOGLE_API_KEY=tu_clave_api_google_books
```

---

## Testing

Los tests usan **Vitest** tanto en frontend como en backend. Los repositorios y APIs externas están mockeados, por lo que no se necesita base de datos ni conexión de red para ejecutarlos.

### Backend (16 tests)

```bash
cd backend
npm test                  # Ejecutar una vez
npm run test:watch        # Modo observación
npm run test:coverage     # Informe de cobertura
```

Cubre:
- `GET /health` — comprobación de salud del servidor
- `POST /api/auth/register` — validación de email, duplicados, fortaleza de contraseña, registro exitoso
- `POST /api/auth/login` — usuario no encontrado, contraseña incorrecta, login exitoso
- `GET /api/libros/search` — query ausente, resultados filtrados, filtros de imagen/descripción, URL con zoom, fallo de API
- `GET /api/libros/:id` — búsqueda de libro en base de datos

### Frontend (14 tests)

```bash
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

Cubre:
- `getErrorMessage()` — errores de red, mensajes del servidor, todos los códigos HTTP (400/401/403/404/500), códigos desconocidos
- `traducir()` — todas las categorías de traducción (condición, tipo, estado, estado de transacción, estado de ejemplar), casos límite

---

## Estructura del proyecto

```
ProyectoLibro/
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelos y enums de la base de datos
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Cliente Prisma
│   │   ├── controllers/           # Lógica de negocio (10 archivos)
│   │   ├── middlewares/
│   │   │   ├── auth.js            # Verificación JWT
│   │   │   ├── validator.js       # Validación de entradas
│   │   │   └── errorHandler.js    # Manejador de errores global
│   │   ├── repositories/          # Wrappers de queries Prisma (10 archivos)
│   │   ├── routes/                # Routers de Express (10 archivos)
│   │   ├── utils/
│   │   │   ├── apiGoogle.js       # Cliente de la API de Google Books
│   │   │   ├── bcrypt.js          # Helpers de contraseñas
│   │   │   ├── cifrado.js         # Cifrado AES-256-CBC
│   │   │   └── tokenGenerator.js  # Creación de JWT
│   │   └── server.js              # Configuración de Express y CORS
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── health.test.js
│   │   └── libros.test.js
│   ├── Dockerfile
│   ├── vitest.config.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # UI reutilizable (10 archivos)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Estado global de autenticación
│   │   ├── pages/                 # Páginas de rutas (18 archivos)
│   │   ├── services/              # Wrappers de Axios para la API (11 archivos)
│   │   ├── utils/
│   │   │   ├── errorHandler.js    # Mensajes de error HTTP
│   │   │   └── translations.js    # Enum de BD → texto de visualización
│   │   └── __tests__/
│   │       ├── errorHandler.test.js
│   │       ├── translations.test.js
│   │       └── setup.js
│   ├── Dockerfile                 # Multi-stage: build con Node → Nginx
│   ├── vite.config.js
│   ├── vitest.config.js
│   └── package.json
│
├── docker-compose.yml
└── .env
```

---

## Seguridad

- **Autenticación JWT** — tokens sin estado, firmados con secreto configurable
- **Hashing de contraseñas con bcrypt** — hashing adaptativo estándar del sector
- **Cifrado de mensajes AES-256-CBC** — el contenido nunca se almacena en texto plano
- **Middleware de validación** — formato de email, reglas de nombre de usuario y fortaleza de contraseña validados en el servidor
- **Rutas protegidas** — tanto en frontend (componente ProtectedRoute) como en backend (middleware de auth)
- **CORS configurado** — solo los orígenes permitidos pueden acceder a la API

---

## Licencia

Este proyecto es de carácter educativo y para portfolio.
