# Plate Tech Stack Documentation

## Overview

Plate is a modern, extensible rich-text editor framework for React built as a sophisticated monorepo. The technical stack emphasizes cutting-edge frontend technologies, excellent developer experience, and a plugin-based architecture that allows developers to compose custom editing experiences. The project follows an "open code" philosophy where components are distributed via a registry system similar to shadcn/ui.

**Technology Stack Summary:**

- **Frontend**: React 19.1.0, Next.js 15.3.3, TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.1.8, Radix UI, shadcn/ui patterns
- **Build**: Yarn workspaces, Turbo, tsup
- **Testing**: Jest, Playwright, Testing Library
- **Deployment**: Vercel with automatic deployments
- **Distribution**: npm packages under @platejs scope

**Architecture Approach**: Monorepo with plugin-based extensibility, no traditional backend

## Programming Language & Runtime

### TypeScript Configuration

- **Version**: 5.8.3 with strict mode enabled
- **Target**: ES2022 for modern JavaScript features
- **Module**: ESNext with moduleResolution: bundler
- **Features Used**:
  - Strict null checks
  - Strict property initialization
  - No implicit any
  - Exact optional property types
  - Path aliases for clean imports

### Node.js Runtime

- **Required Version**: >= 18.12.0
- **Package Manager**: Yarn 4.6.0 (using Plug'n'Play with node-modules linker)
- **Engine Enforcement**: Strict engine checking enabled

### Language Features

- Modern ES2022+ syntax
- Async/await throughout
- Optional chaining and nullish coalescing
- Template literals for string composition
- Destructuring and spread operators

## Frontend

### UI Framework

- **React**: 19.1.0 (latest version with new features)
- **Next.js**: 15.3.3 using App Router
  ```json
  {
    "experimental": {
      "reactCompiler": false,
      "typedRoutes": true
    }
  }
  ```

### Styling Approach

- **Tailwind CSS**: 4.1.8 (v4 - latest major version)
  - Custom configuration with extended theme
  - Dark mode support via class strategy
  - Custom utilities and components
- **CSS Architecture**:
  - Utility-first with Tailwind
  - CSS Modules for component-specific styles
  - CSS Variables for theming

### Component Libraries

- **Radix UI**: Complete set of unstyled, accessible primitives
  - Dialog, Dropdown, Popover, Tooltip
  - Form controls, Navigation components
  - All components are fully accessible
- **shadcn/ui Pattern**: Components copied into codebase
  - Full control over component code
  - Consistent styling patterns
  - Easy customization

### State Management

- **Jotai**: 2.8.4 for atomic state management
  ```typescript
  // Example atom usage
  export const editorAtom = atom<PlateEditor | null>(null);
  ```
- **React Hook Form**: 7.57.0 for complex form handling
- **Zustand** (in some packages): For plugin-specific state

### Build Tools

- **Bundler**: Next.js built-in webpack configuration
- **Transpilation**: SWC for fast builds
- **Module Format**: Dual ESM/CJS output for packages
- **Development**: Fast refresh with Next.js

### Browser Support

- Modern browsers only (Chrome, Firefox, Safari, Edge)
- No IE11 support
- ES2022 features used without transpilation
- WebAssembly support for some features

## Backend

### API Architecture

- **Approach**: Frontend-first, no traditional backend
- **API Routes**: Next.js API routes for AI integration only
- **Pattern**: Server actions for AI streaming

### AI Integration Backend

```typescript
// Example AI route structure
export async function POST(req: Request) {
  const { prompt, model } = await req.json();
  // Stream AI responses using Vercel AI SDK
}
```

### Authentication

- No built-in authentication system
- Designed to integrate with any auth provider
- Examples use client-side auth patterns

### File Handling

- **Uploadthing**: 7.7.2 for file uploads
- Client-side image optimization
- Drag-and-drop file handling
- No server-side file storage

## Database & Storage

### Data Persistence

- **No Traditional Database**: Pure frontend solution
- **Local Storage**: For user preferences and drafts
- **State Management**: In-memory state with Jotai/Zustand

### Content Storage Patterns

- Editor content stored in application state
- Serialization to JSON/HTML/Markdown
- Designed to integrate with any backend storage

### Caching Strategy

- Turbo build caching for development
- Next.js caching for static assets
- No server-side data caching needed

## Development Tools & Workflow

### Package Manager

```yaml
# .yarnrc.yml configuration
nodeLinker: node-modules
enableGlobalCache: false
enableTelemetry: false
```

### Code Quality Tools

#### ESLint Configuration

- **Version**: 9.28.0 with flat config
- Custom rules for React, TypeScript
- Import sorting and organization
- Accessibility checks

#### Prettier Setup

- **Version**: 3.5.3

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 80
}
```

### Type Checking

```bash
# Type checking commands
yarn typecheck        # Check all packages
```

### Testing Strategy

#### Unit Testing

- **Framework**: Jest 29.7.0 with SWC
- **Configuration**:
  ```javascript
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  }
  ```

#### E2E Testing

- **Framework**: Playwright
- **Target**: Chrome, Firefox, Safari
- **Location**: apps/e2e-examples

### Development Workflow

```bash
# Common development commands
yarn dev              # Start development server.
yarn build            # Build all packages
yarn test             # Run tests
yarn lint             # Run ESLint
yarn typecheck        # Type checking
```

These are root commands, but if you modified just a few packages, it's more efficient to run those commands in the modified packages.

### Version Control

- **Git Workflow**: Feature branches with PR reviews
- **Branch Protection**: Required reviews, CI checks
- **Commit Convention**: Conventional commits encouraged

## Deployment & Infrastructure

### Hosting Platform

- **Primary**: Vercel
  - Automatic deployment on push to main
  - Preview deployments for PRs
  - Custom domain: platejs.org
  - Edge functions for AI routes

### Build Pipeline

```yaml
# Automated via GitHub Actions
- Install dependencies
- Run type checking
- Run linting
- Run tests
- Build packages
- Deploy to Vercel
```

### Environment Configuration

```bash
# Required environment variables
OPENAI_API_KEY=sk-...        # For AI features
UPLOADTHING_TOKEN=...         # For file uploads
```

### Domain Management

- **Primary Domain**: platejs.org
- **DNS**: Managed through Vercel
- **SSL/TLS**: Automatic via Vercel

### Release Process

- **Tool**: Changesets for version management
- **Automation**: GitHub Actions on merge
- **Process**:
  1. Create changesets during development
  2. Bot creates version PR
  3. Merge triggers npm publish
  4. Automatic GitHub release

## External Integrations

### AI Services

- **OpenAI**: GPT integration for content generation
  ```typescript
  import { OpenAI } from 'openai';
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  ```
- **Vercel AI SDK**: 4.0.29 for streaming responses

### Package Distribution

- **npm Registry**: All packages published under @platejs
- **Package Access**: Public
- **Publishing**: Automated via changesets

### Development Services

- **GitHub**:
  - Source control
  - Issue tracking
  - Pull request reviews
  - GitHub Actions for CI/CD
  - Discussions for community

### CDN & Assets

- **Vercel CDN**: Automatic for deployed assets
- **Image Optimization**: Next.js built-in
- **Static Assets**: Served from public directory

## Quality Assurance & Testing

### Testing Frameworks

```json
{
  "jest": {
    "preset": "../../tooling/internal/jest/jest.config.base.mjs",
    "testEnvironment": "jsdom"
  }
}
```

### Testing Strategy

1. **Unit Tests**: Core functionality and utilities
2. **Integration Tests**: Plugin interactions
3. **E2E Tests**: Full editor workflows
4. **Visual Regression**: Manual via examples

### Code Coverage

- No enforced coverage targets
- Focus on critical path testing
- Manual review during PRs

### Code Review Process

1. Create feature branch
2. Make changes with tests
3. Open PR with description
4. Automated checks run
5. Peer review required
6. Merge after approval

## Project Structure

### Monorepo Organization

```
plate/
   apps/
      www/                 # Documentation website
   packages/
      core/               # Core editor packages
      ui/                 # UI component packages
      plugins/            # Feature plugins
   templates/              # Starter templates
   tooling/                # Build tools
   config/                 # Shared configs
```

### Package Conventions

- Each package has consistent structure:
  ```
  package/
     src/
        index.ts         # Public API
        lib/             # Implementation
     package.json
     tsconfig.json
  ```

### Import Patterns

```typescript
// Package imports
import { createPlugin } from '@platejs/core';

// Internal imports use path aliases
import { cn } from '@/lib/utils';
```

### Configuration Files

- `turbo.json`: Monorepo task orchestration
- `tsconfig.json`: TypeScript configuration
- `.eslintrc.js`: Linting rules
- `prettier.config.js`: Code formatting

### Build Outputs

- **Packages**: `dist/` with ESM and CJS
- **Apps**: `.next/` for Next.js output
- **Types**: `.d.ts` files alongside JS

## Schemas & Data Models

### Editor Value Schema

```typescript
interface PlateValue {
  type: string;
  children: PlateNode[];
  [key: string]: unknown;
}

interface PlateNode {
  type?: string;
  text?: string;
  children?: PlateNode[];
  [key: string]: unknown;
}
```

### Plugin Schema

```typescript
interface PlatePlugin<T = any> {
  key: string;
  type?: string;
  node?: {
    type: string;
    isElement?: boolean;
    isLeaf?: boolean;
  };
  handlers?: {
    [key: string]: Handler;
  };
  options?: T;
}
```

### Component Props Pattern

```typescript
interface ComponentProps extends HTMLAttributes<HTMLElement> {
  className?: string;
  children?: ReactNode;
  asChild?: boolean;
}
```

### Registry Schema

```typescript
interface RegistryEntry {
  name: string;
  dependencies: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  type: 'component' | 'hook' | 'lib';
}
```

This technical stack represents a modern, well-architected frontend framework that prioritizes developer experience, extensibility, and performance while maintaining simplicity in deployment and distribution.
