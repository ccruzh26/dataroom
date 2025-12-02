# Dataroom - AI-Powered Document Intelligence Platform

## Overview

Dataroom is a productivity-focused document management and AI chat application that enables users to organize, search, and interact with documents using AI-powered contextual understanding. The platform combines a hierarchical document organization system with intelligent chat capabilities that provide cited responses based on document content.

The application is designed as a "dataroom" - a secure repository for managing business documents with AI-assisted information retrieval, citation tracking, and document intelligence features.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**December 2025 - Category Organization Feature**
- Added category system for organizing folders into buckets (e.g., "Legal", "Financial", "HR")
- Categories can be created, renamed, and deleted through the UI
- Each category has a customizable color (16 color options)
- Folders can be dragged and dropped between categories
- Documents panel now shows categories as collapsible sections
- "Uncategorized" section for items not assigned to a category

## System Architecture

### Application Structure

**Monorepo Architecture with Shared Types**
- Frontend: React + TypeScript + Vite (SPA)
- Backend: Express.js + TypeScript
- Shared: Common schema definitions and types used by both client and server
- Database ORM: Drizzle with Neon PostgreSQL (serverless)
- Build system: Custom esbuild + Vite configuration with selective bundling

**Rationale:** The shared schema approach ensures type safety across the full stack, reducing bugs and improving developer experience. The monorepo structure simplifies code sharing while maintaining clear separation of concerns.

### Frontend Architecture

**Component-Based UI with shadcn/ui**
- Design System: Fluent Design principles adapted for document workflows
- UI Library: Radix UI primitives with shadcn/ui styling
- State Management: TanStack Query for server state, React hooks for local state
- Styling: Tailwind CSS with custom design tokens for productivity-focused aesthetics

**Key Design Decisions:**
- Split-panel layout with resizable panels for document viewing and chat
- Hierarchical document tree with folders, categories, and file support
- Citation-first chat interface that links AI responses to source documents
- Dark/light mode support with CSS variables for theming

**Pros:** Accessible, performant UI components with minimal custom code. Strong TypeScript support.
**Cons:** Heavy dependency on third-party UI libraries.

### Backend Architecture

**RESTful API with Express**
- API Routes: Document CRUD, chat endpoints, file upload handling
- Middleware: JSON parsing, request logging, error handling
- Session Management: Uses connect-pg-simple for PostgreSQL session storage
- File Storage: Local filesystem with multer for upload handling (PDF, CSV, Excel)

**Data Flow:**
1. Client uploads document → Server processes file → Extracts content
2. Content is chunked into sections → Embeddings generated via OpenAI
3. User sends chat message → Relevant sections found via embedding similarity
4. AI generates response with citations → Client displays with document references

**Rationale:** REST API provides simplicity and broad compatibility. The separation of document storage (filesystem) from metadata (PostgreSQL) allows for flexible scaling options.

### Data Storage

**PostgreSQL with Drizzle ORM**
- Primary Database: Neon Serverless PostgreSQL
- ORM: Drizzle with type-safe schema definitions
- Connection: WebSocket-based pooling via @neondatabase/serverless

**Schema Structure:**
- `users` - Authentication (username/password)
- `categories` - Top-level organizational groups with custom colors
- `documents` - Hierarchical structure supporting folders, files, and text documents
- `document_sections` - Content chunks with embeddings for semantic search
- `chat_messages` - Conversation history with role (user/assistant) and citations

**Key Design Decisions:**
- Documents support both hierarchical folders (parent-child) and category grouping
- Sections store vector embeddings as JSONB for semantic search
- File metadata (URL, type, size) stored alongside document text
- Citations stored as JSONB arrays linking responses to source sections

**Pros:** Type-safe queries, serverless scaling, good developer experience.
**Cons:** JSONB embeddings not optimized for vector similarity (may need pgvector extension for production scale).

### AI Integration

**OpenAI API for Chat and Embeddings**
- Model: GPT-5 (configurable via environment)
- Embedding Model: text-embedding-ada-002 (or current default)
- RAG Pattern: Retrieval-Augmented Generation with citation tracking

**AI Workflow:**
1. Document sections are embedded on upload/creation
2. User query is embedded using the same model
3. Cosine similarity finds top-N relevant sections
4. Sections are passed as context to GPT with citation instructions
5. AI response includes numbered citations mapping to source documents

**Rationale:** OpenAI provides state-of-the-art language understanding with reliable API. Embedding-based retrieval ensures relevant context without full-text search complexity.

**Alternative Considered:** Local models (llama.cpp) - rejected due to complexity and resource requirements.

## External Dependencies

### Core Services
- **OpenAI API** - Language model (GPT-5) and embeddings for AI chat functionality
- **Neon Database** - Serverless PostgreSQL database for all persistent data

### Third-Party Libraries

**Frontend:**
- `@radix-ui/*` - Accessible UI primitives (dialogs, dropdowns, tooltips, etc.)
- `@tanstack/react-query` - Server state management and caching
- `react-hook-form` + `@hookform/resolvers` - Form handling with Zod validation
- `cmdk` - Command palette component
- `date-fns` - Date manipulation utilities
- `class-variance-authority` + `clsx` + `tailwind-merge` - Styling utilities

**Backend:**
- `express` - HTTP server framework
- `drizzle-orm` - TypeScript ORM
- `multer` - File upload handling
- `ws` - WebSocket support for Neon database
- `nanoid` - ID generation
- `zod` - Schema validation

**Development:**
- `vite` - Frontend build tool with HMR
- `esbuild` - Server bundling
- `tsx` - TypeScript execution
- `@replit/vite-plugin-*` - Replit integration plugins

### File Processing
- PDF support via file upload (viewing only, extraction assumed)
- CSV/Excel support with client-side parsing (papaparse or similar assumed)
- Document content stored as text with optional file references

### Authentication
- Basic username/password authentication (schema includes users table)
- Session management via `express-session` with PostgreSQL store
- No OAuth or third-party auth currently implemented
