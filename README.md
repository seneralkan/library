# Library Management

Library Management Case Study — NestJS, TypeORM, PostgreSQL, Fastify

## Project Structure

```
├── dev/                          # Development environment
│   └── docker-compose.yml        # PostgreSQL (dev + test) containers
├── src/                          # Application source code
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Root module
│   ├── common/                   # Shared utilities
│   │   ├── constants/            # Default values and error constants
│   │   ├── enums/                # Environment enums
│   │   ├── exceptions/           # Custom exception classes
│   │   └── filters/              # Global exception filters
│   ├── config/                   # Application configuration
│   │   ├── configuration.ts      # Env-based config loader
│   │   ├── env-variable.schema.ts # Joi env validation schema
│   │   ├── swagger/              # Swagger setup
│   │   └── typeorm/              # TypeORM connection options
│   ├── infrastructure/           # Infrastructure concerns
│   │   └── database/             # Database module and transaction service
│   ├── models/                   # TypeORM entity definitions
│   │   ├── book.entity.ts
│   │   ├── borrowed-book.entity.ts
│   │   └── user.entity.ts
│   └── modules/                  # Feature modules
│       ├── api.module.ts         # API module aggregator
│       ├── book/                 # Book CRUD (controller, service, repository, DTOs, exceptions)
│       ├── borrowed-book/        # Borrow logic (service, repository, DTOs)
│       └── user/                 # User CRUD + borrow/return (controller, service, repository, DTOs, exceptions)
├── test/                         # Integration tests
│   └── integration/              # Test specs and setup
├── Dockerfile                    # Multi-stage production build
├── nest-cli.json                 # NestJS CLI config
├── tsconfig.json                 # Root TypeScript config
└── tsconfig.build.json           # Build-specific TypeScript config
```

## Prerequisites

- Node.js 20+
- Docker & Docker Compose

## Getting Started

```bash
# install dependencies
npm install

# start PostgreSQL (dev + test)
docker compose -f dev/docker-compose.yml up -d
```

## Running the Application

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

The API runs on `http://localhost:3000` by default. Swagger UI is available at `/documentation` when enabled.

## Running Tests

Integration tests run against the `postgres-test` container (port `55432`). Make sure Docker is running:

```bash
# start containers (if not already running)
docker compose -f dev/docker-compose.yml up -d

# run tests
npm test
```

## Docker Build

```bash
docker build -t library-management .
```