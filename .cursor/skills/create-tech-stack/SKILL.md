---
allowed-tools: Read, Glob, Grep, Write, MultiEdit, TodoWrite, Bash
description: Generate comprehensive technical stack documentation from codebase analysis
name: create-tech-stack
---

# Generate Tech Stack Documentation

**User Request:** $ARGUMENTS

## Context

- Project root: !`pwd`
- Package.json: @package.json
- Node version: !`node --version 2>/dev/null || echo "Node.js not found"`
- TypeScript config: @tsconfig.json
- Database schema: !`ls -la prisma/schema.prisma 2>/dev/null || echo "No Prisma schema found"`
- Existing docs: !`ls -la .claude/rules/*.md 2>/dev/null || echo "No docs yet"`

## Goal

Create comprehensive Tech Stack Documentation based on deep codebase analysis. Document all technologies, frameworks, libraries, development tools, deployment strategies, and implementation patterns with specific versions and configurations.

## Process

### 1. Automated Technical Discovery

- Parse package.json for all dependencies
- Analyze configuration files (tsconfig, vite.config, next.config, etc.)
- Detect database setup (Prisma, Drizzle, TypeORM, etc.)
- Identify testing frameworks and tools
- Scan for CI/CD configurations
- Check deployment configurations

### 2. Deep Code Analysis

Examine codebase for:

- **Architecture Patterns:** Monorepo structure, module organization
- **Framework Usage:** Next.js app router vs pages, API routes
- **State Management:** Zustand, Redux, Context API patterns
- **Styling Approach:** Tailwind, CSS modules, styled-components
- **Type Safety:** TypeScript strictness, validation libraries
- **API Design:** REST, GraphQL, tRPC implementation
- **Authentication:** Auth libraries and session management
- **Testing Strategy:** Unit, integration, E2E test patterns

### 3. Interactive Technical Q&A

Ask 4-6 deployment and infrastructure questions:

- Use numbered/lettered options
- Focus on non-discoverable information
- Gather hosting, monitoring, and workflow details

### 4. Generate Comprehensive Documentation

Create detailed tech stack document with:

- Specific version numbers
- Configuration examples
- Command references
- Architecture diagrams (when applicable)

### 5. Save and Organize

- Create `.claude/rules/` if needed
- Save as `2-tech-stack.mdc`

## Technical Questions Template

### 🚀 Deployment & Infrastructure

**1. Where is your application currently deployed?**

a) **Vercel** - Next.js optimized hosting  
 b) **AWS** - EC2, Lambda, or containerized  
 c) **Railway/Render** - Modern PaaS providers  
 d) **Self-hosted** - VPS or on-premise  
 e) **Other** - Please specify  
 f) **Not deployed yet** - Still in development

**2. How is your database hosted?**

a) **Managed service** (Supabase, PlanetScale, Neon, etc.)  
 b) **Cloud provider** (AWS RDS, Google Cloud SQL, etc.)  
 c) **Self-hosted** (Docker, VPS, etc.)  
 d) **Local only** - No production database yet

### 📊 Monitoring & Operations

**3. What observability tools do you use?**

a) **Error tracking:** Sentry, Rollbar, Bugsnag  
 b) **Analytics:** Vercel Analytics, Google Analytics, Plausible  
 c) **Monitoring:** Datadog, New Relic, custom solution  
 d) **Logging:** CloudWatch, LogTail, custom logs  
 e) **None yet** - Planning to add later

### 👥 Development Workflow

**4. What's your Git workflow?**

a) **Feature branches** with PR reviews  
 b) **Trunk-based** development  
 c) **GitFlow** with release branches  
 d) **Direct to main** (solo project)

**5. How do you manage environments?**

a) **Multiple deployments** (dev, staging, prod)  
 b) **Preview deployments** for PRs  
 c) **Single production** environment  
 d) **Local development** only

### 🔐 Additional Services

**6. Which external services do you integrate with?**

- [ ] Payment processing (Stripe, PayPal)
- [ ] Email service (SendGrid, Resend, AWS SES)
- [ ] File storage (S3, Cloudinary, UploadThing)
- [ ] Authentication (Auth0, Clerk, Supabase Auth)
- [ ] Search (Algolia, Elasticsearch)
- [ ] Other APIs (please specify)

## Document Structure

The generated document must follow this technical structure:

### **Overview**

- Brief description of the application's technical nature
- Technology stack summary
- Architecture approach (monolith, microservices, etc.)

### **Programming Language & Runtime**

- Primary programming language and version
- Runtime environment and version
- Type system and language features used

### **Frontend**

- UI Framework/Library and version
- Styling approach and frameworks
- Component libraries and design systems
- State management solutions
- Build tools and bundlers
- Browser support and compatibility

### **Backend**

- Backend framework and architecture
- API design (REST, GraphQL, tRPC, etc.)
- Authentication and authorization
- Middleware and security
- File handling and uploads

### **Database & Storage**

- Database type and version
- ORM/Query builder
- Schema management and migrations
- Caching solutions
- File storage solutions
- Data backup and recovery

### **Development Tools & Workflow**

- Package manager
- Code formatting and linting
- Type checking and compilation
- Testing frameworks and strategies
- Development server and hot reload
- Version control workflow

### **Deployment & Infrastructure**

- Hosting platform and services
- Build and deployment pipeline
- Environment configuration
- Domain and DNS management
- SSL/TLS and security
- Monitoring and logging

### **External Integrations**

- Third-party APIs and services
- Payment processing
- Email services
- Analytics and tracking
- Error monitoring
- Performance monitoring

### **Quality Assurance & Testing**

- Testing strategy and frameworks
- Code coverage tools
- End-to-end testing
- Performance testing
- Security testing
- Code review process

### **Schemas & Data Models**

- Database schema (if applicable)
- API schemas and validation
- Type definitions and interfaces
- Data relationships and constraints

## Target Audience

The document should serve:

- **Developers** joining the project who need technical onboarding
- **DevOps engineers** setting up infrastructure and deployment
- **Technical architects** evaluating or improving the tech stack
- **Security teams** understanding the technical landscape
- **Future maintainers** who need to understand technical decisions

The language should be technical, precise, and include specific version numbers and configuration details.

## Documentation Principles

### DO Include:

- **Exact Versions:** Lock file versions, not just ranges
- **Configuration Examples:** Actual config snippets from the project
- **Command Reference:** All npm scripts and their purposes
- **Setup Instructions:** Step-by-step for new developers
- **Architecture Decisions:** Why specific technologies were chosen
- **Integration Details:** How services connect and communicate

### DON'T Include:

- **Generic Descriptions:** Avoid Wikipedia-style explanations
- **Outdated Information:** Only document what's actually used
- **Wishful Thinking:** Document current state, not future plans
- **Sensitive Data:** No API keys, secrets, or credentials
- **Redundant Info:** Link to official docs instead of copying

## Output

- **Format:** Markdown (`.mdc`)
- **Location:** `.claude/rules/`
- **Filename:** `2-tech-stack.mdc`

## Execution Steps

### 1. Automated Analysis Phase

```bash
# Extract key technical information
- Read package.json and lock files
- Scan for configuration files
- Detect framework patterns
- Identify database setup
- Find test configurations
```

### 2. Manual Discovery Phase

- Read key source files to understand architecture
- Check for API route patterns
- Analyze authentication implementation
- Review deployment configurations

### 3. Interactive Q&A

- Present deployment and infrastructure questions
- Use checkboxes for multi-select options
- Wait for user responses

### 4. Document Generation

- Start with discovered information
- Incorporate user responses
- Add specific configuration examples
- Include all npm scripts with descriptions

### 5. Save and Update

```bash
# Create directory and save
mkdir -p .claude/docs
# Save to .claude/rules/2-tech-stack.mdc
```

### 6. Next Steps

- Recommend: "Should I create an app design document to complement this technical documentation?"

## Example Usage

```bash
# Basic usage
/project:create-tech-stack

# With specific focus
/project:create-tech-stack Focus on deployment and CI/CD setup
```

## Sample Output Structure

```markdown
# Tech Stack Documentation

## Overview

- **Framework:** Next.js 14.2.5 (App Router)
- **Language:** TypeScript 5.5.3
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Vercel with preview deployments

## Commands Reference

### Development

- `pnpm dev` - Start Next.js dev server on port 3000
- `pnpm build` - Build production bundle
- `pnpm typecheck` - Run tsc --noEmit

### Database

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema changes to database

# ... continue with full documentation
```
