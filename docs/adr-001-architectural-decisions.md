# ADR-001: Architectural Decision Record for Fuel Report Management System

**Date:** December 18, 2025  
**Status:** Documented  
**Context:** Initial architecture documentation for the Fuel Report Management System

## Overview

The Fuel Report Management System is a Next.js-based web application designed for fuel transaction reporting, driver management, and administrative oversight. This ADR documents the key architectural decisions, patterns, and technologies used in the system.

## Technology Stack

### Core Framework & Runtime
- **Next.js 15.5.7** - React framework with App Router
  - **Decision:** Chosen for SSR/SSG capabilities, file-based routing, and integrated API routes
  - **Rationale:** Provides optimal performance for data-heavy reporting application
- **React 19.1.2** - UI library with concurrent features
- **TypeScript 5** - Static typing for enhanced developer experience and reliability
- **Node.js** - Runtime environment

### Database & ORM
- **PostgreSQL** - Primary database via Neon serverless
  - **Driver:** `@neondatabase/serverless` for serverless PostgreSQL connection
- **Drizzle ORM 0.44.4** - Type-safe ORM with migrations
  - **Decision:** Chosen over Prisma for better TypeScript integration and performance
  - **Rationale:** Provides excellent type safety with minimal runtime overhead
  - **Schema Organization:** Custom `dev-reports` PostgreSQL schema for multi-tenant support

### Authentication & Authorization
- **NextAuth.js 5.0.0-beta** - Authentication framework
  - **Strategy:** JWT-based sessions with 30-day expiration
  - **Provider:** Credentials provider with bcrypt password hashing
  - **Session Management:** Custom user types extending default NextAuth session
- **Role-Based Access Control (RBAC)**
  - **Roles:** ADMIN, USER with branch-based permissions
  - **Branches:** Manhattan (MHK), Denver (DEN), Des Moines (DSM)

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
  - Components: Select, Dropdown Menu, Popover, Label, Slot
- **shadcn/ui** - Pre-built component system
  - **Configuration:** New York style, RSC-enabled, with custom aliases
- **Lucide React** - Icon library
- **Custom Fonts:** Geist Sans & Geist Mono from Vercel

### Data Processing & Validation
- **Zod 4.1.5** - Runtime schema validation
  - **Usage:** Form validation, API request/response validation, CSV parsing
  - **Pattern:** Comprehensive validation schemas with custom error messages
- **React Hook Form 7.62.0** - Form state management
  - **Integration:** Zod resolver for seamless validation
- **Papa Parse 5.5.2** - CSV parsing for data imports

### Data Visualization & Export
- **TanStack Table 8.21.3** - Powerful table component with sorting/filtering
- **React PDF 4.3.0** - PDF generation for reports
- **JSZip 3.10.1** - Archive generation for bulk exports

### Development Tools
- **ESLint 9** - Code linting with Next.js configuration
- **Drizzle Kit 0.31.4** - Database migrations and introspection
- **TSX 4.20.3** - TypeScript execution for scripts

## Architectural Patterns

### 1. Server-First Architecture
- **Server Actions:** Extensive use of `"use server"` for data mutations
- **Server Components:** Default server rendering with selective client components
- **Caching:** React cache() for optimized data fetching
- **Revalidation:** Next.js revalidatePath for cache invalidation

### 2. Type-Safe Data Layer
```typescript
// Schema-first approach with Drizzle
export const drivers = dbSchema.table("drivers", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // ... additional fields
});

// Inferred types for type safety
export type SelectDriver = typeof drivers.$inferSelect;
export type InsertDriver = typeof drivers.$inferInsert;
```

### 3. Validation-First API Design
```typescript
// Request validation with Zod
const validation = TransactionUploadRequestSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
```

### 4. Component Organization
```
src/components/
├── ui/           # Base UI components (shadcn/ui)
├── tables/       # Data table components
├── csv/          # CSV handling components
└── state-manager/ # State management components
```

### 5. Data Model Architecture
- **Schema Types:** Generated from Drizzle schema for consistency
- **Query Types:** Specialized types for API responses and UI requirements
- **Enum Types:** Centralized enums with type guards and utility functions

## Database Design

### Schema Structure
- **Custom Schema:** `dev-reports` PostgreSQL schema
- **Tables:** drivers, fuel_logs, transactions, transaction_fuel_matches, users, sessions, quarter_settings
- **Relationships:** Defined via Drizzle relations for type-safe joins
- **Indexing:** Strategic indexes on frequently queried columns

### Migration Strategy
- **Drizzle Migrations:** Version-controlled SQL migrations
- **Environment-specific:** Configurable via environment variables
- **Rollback Support:** Full migration history tracking

## Security Patterns

### Authentication Flow
1. Credential validation with bcrypt
2. JWT session creation with custom user claims
3. Middleware-based route protection
4. Role-based component rendering

### Data Protection
- **SQL Injection Prevention:** Parameterized queries via Drizzle
- **XSS Protection:** React's built-in XSS protection
- **CSRF Protection:** Built into Next.js API routes
- **Input Validation:** Zod schemas on all endpoints

## State Management

### Server State
- **React Cache:** For expensive database queries
- **Next.js Caching:** Automatic static generation where appropriate
- **Revalidation:** Strategic cache invalidation on mutations

### Client State
- **React Hook Form:** Form state and validation
- **useState/useEffect:** Component-local state
- **URL State:** Search params for filters and pagination

## API Design

### RESTful Endpoints
- **File-based Routing:** Next.js 13+ App Router API structure
- **Type-safe Handlers:** TypeScript for request/response typing
- **Validation Middleware:** Zod schemas for all inputs
- **Error Handling:** Consistent error response format

### Server Actions
- **Form Handling:** Direct form submission without client-side JavaScript
- **Progressive Enhancement:** Works without JavaScript enabled
- **Optimistic Updates:** Where appropriate for better UX

## Performance Optimizations

### Database Performance
- **Connection Pooling:** Neon serverless with connection pooling
- **Query Optimization:** Selective field queries, strategic indexing
- **Batch Operations:** Bulk inserts for CSV imports

### Frontend Performance
- **Server Components:** Reduced client-side JavaScript
- **Code Splitting:** Automatic via Next.js
- **Image Optimization:** Next.js built-in image optimization
- **Font Optimization:** Preloaded custom fonts

### Caching Strategy
- **Static Generation:** Where data is relatively stable
- **Incremental Static Regeneration:** For semi-dynamic content
- **Runtime Caching:** React cache() for expensive operations

## Development Workflows

### Code Quality
- **TypeScript Strict Mode:** Maximum type safety
- **ESLint Configuration:** Next.js recommended rules
- **Consistent Formatting:** Automated code formatting
- **Import Organization:** Absolute imports with path mapping

### Database Workflows
```bash
# Development commands
npm run generate  # Generate migrations
npm run migrate   # Apply migrations
npm run studio    # Database GUI
npm run push      # Push schema changes
```

## Decision Rationale

### Why Drizzle over Prisma?
- **Better TypeScript Integration:** Direct type inference from schema
- **Performance:** Lower runtime overhead
- **SQL Control:** More direct SQL generation
- **Migration Flexibility:** Better control over migration generation

### Why Server Actions over API Routes?
- **Simplified Data Flow:** Direct server-to-database communication
- **Better Performance:** Reduced client-server roundtrips
- **Type Safety:** End-to-end TypeScript without API contracts
- **Progressive Enhancement:** Works without JavaScript

### Why TanStack Table?
- **Flexibility:** Headless design allows custom UI
- **Performance:** Virtualization support for large datasets
- **Feature Rich:** Built-in sorting, filtering, pagination
- **TypeScript Support:** Excellent type inference

### Why Zod for Validation?
- **Runtime Safety:** Type validation at runtime boundaries
- **Error Handling:** Detailed, structured error messages
- **Integration:** Seamless React Hook Form integration
- **Developer Experience:** IntelliSense support for schemas

## Future Considerations

### Scalability
- **Database Sharding:** Potential branch-based data partitioning
- **Caching Layer:** Redis for session management and frequently accessed data
- **CDN Integration:** For static assets and generated reports

### Monitoring & Observability
- **Error Tracking:** Integration with error monitoring service
- **Performance Monitoring:** Application performance monitoring
- **Database Monitoring:** Query performance and optimization

### Security Enhancements
- **Rate Limiting:** API endpoint protection
- **Audit Logging:** User action tracking
- **Data Encryption:** At-rest encryption for sensitive data

## Migration Path

For future architectural changes:
1. **Database Migrations:** Use Drizzle Kit for schema evolution
2. **Component Updates:** Gradual migration to new patterns
3. **API Versioning:** Maintain backward compatibility during transitions
4. **Feature Flags:** Controlled rollout of new functionality

---

This ADR serves as a living document and should be updated as architectural decisions evolve.