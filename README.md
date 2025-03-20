# <div align="center">Simple Backend App built with Express.js and TypeScript</div>

<div align="center">A backend application template built with Express.js and TypeScript for type safety and improved developer experience.</div>

### Planned Features

- **Database Integration**
  - SQLite/PostgreSQL/MongoDB connection with Sequelize ORM
  - Type-safe Sequelize models with TypeScript interfaces
  - Repository pattern implementation with proper typing

- **Authentication & Authorization**
  - JWT-based authentication with typed payloads
  - Google OAuth integration
  - Session management with type definitions
  - Role-based access control (RBAC) with TypeScript enums

- **Security**
  - Rate limiting
  - Input validation using Joi with TypeScript
  - Data sanitization
  - CORS configuration

- **API Documentation**
  - Swagger/OpenAPI integration with TypeScript decorators
  - API versioning
  - Type-safe request/response examples

- **Messaging**
  - Email service integration with typed templates
  - Push notifications
  - Real-time updates with typed events

- **Docker Integration**
  - Containerization
  - Docker Compose setup
  - Production-ready configuration

### Current Implementation

- Express.js with TypeScript setup
- Sequelize ORM integration with TypeScript
- DTO pattern implementation with interfaces
- Input validation using Joi with TypeScript
- Basic user routes with typed controllers

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Build for production (transpiles TypeScript to JavaScript)
npm run build 
```

<!-- 
Tutorial -> https://youtu.be/FOGiNmvNzlM
-->