# Rule: Generating a Tech Stack Documentation

> $ARGUMENTS

## Goal

To guide an AI assistant in creating a comprehensive Tech Stack Documentation in Markdown format, based on deep analysis of an existing codebase and user input. The document should provide detailed technical information about technologies, frameworks, libraries, development tools, and implementation patterns used in the project.

## Process

1. **Receive Initial Prompt:** The user requests tech stack documentation for their existing project.
2. **Deep Technical Analysis:** Thoroughly analyze the codebase to understand:
   - Package.json dependencies and their purposes
   - Framework and library versions
   - Database schema and ORM usage
   - Build tools and development workflow
   - Deployment and infrastructure setup
   - Code organization and architecture patterns
   - Testing frameworks and quality tools
   - CI/CD and development processes
3. **Ask Clarifying Questions:** Before writing the document, ask 4-6 targeted questions based on the technical analysis. Focus on deployment, hosting, development workflow, and technical decisions. Provide lettered/numbered options for easy response.
4. **Generate Documentation:** Create a comprehensive tech stack document using the structure outlined below.
5. **Save Documentation:** Save as `tech-stack.md` in the `.taskmaster/docs/` directory.

## Clarifying Questions (Examples)

Adapt these questions based on the technical analysis:

- **Hosting & Deployment:** "Where is this application deployed? (e.g., Vercel, AWS, self-hosted)" or "What deployment strategy do you use?"
- **Database & Storage:** "What database are you using and how is it hosted?" or "Do you use any external storage services?"
- **Development Workflow:** "What's your preferred development workflow? (e.g., feature branches, trunk-based development)"
- **Environment Management:** "How do you handle different environments (dev, staging, prod)?"
- **Performance & Monitoring:** "What tools do you use for monitoring, logging, or error tracking?"
- **Team Collaboration:** "What tools does your team use for collaboration and project management?"
- **Quality Assurance:** "What's your testing strategy and what tools do you use for code quality?"
- **Third-Party Services:** "What external APIs or services does your application integrate with?"

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

### **Project Structure**

- Folder organization and conventions
- Module system and imports
- Configuration files
- Environment variables
- Build artifacts and outputs

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

## Key Principles

1. **Technical Specificity:** Include exact versions, configuration details, and implementation specifics
2. **Completeness:** Cover all major technical components and dependencies
3. **Developer-Focused:** Emphasize how technologies are used and why they were chosen
4. **Actionable:** Provide enough detail for setup, development, and deployment
5. **Current:** Reflect the actual current state of the codebase

## Output

- **Format:** Markdown (`.md`)
- **Location:** `.taskmaster/docs/`
- **Filename:** `tech-stack.md`

## Final Instructions

1. Do NOT start implementing the document immediately
2. First analyze the codebase thoroughly, examining package.json, config files, and code structure
3. Ask clarifying questions with lettered/numbered options for easy selection
4. Generate a complete technical document following the structure above
5. Include specific versions, configuration examples, and technical details
6. Focus on HOW things are implemented, complementing the high-level app-design-document
7. After saving, suggest creating a complementary app-design-document if one doesn't exist
