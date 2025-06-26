# Rule: Generating an Application Design Document

> $ARGUMENTS

## Goal

To guide an AI assistant in creating a comprehensive Application Design Document in Markdown format, based on deep analysis of an existing codebase and user input. The document should provide a high-level overview of the application's architecture, core features, user experience, and business logic while remaining technology-agnostic and focused on the "what" rather than the "how".

## Process

1. **Receive Initial Prompt:** The user requests an app design document for their existing project or wants to document a new application concept.
2. **Deep Codebase Analysis:** Thoroughly analyze the existing codebase to understand:
   - Application structure and main features
   - User flows and business logic
   - Data models and relationships (conceptual, not technical)
   - Authentication and authorization patterns
   - Core functionalities and user interactions
   - Integration points and external services
3. **Ask Clarifying Questions:** Before writing the document, ask 5-8 targeted questions based on the codebase analysis. **ALWAYS start with project stage and development priorities questions first**, then focus on understanding the application's purpose, target users, and business goals. Provide lettered/numbered options for easy response.
4. **Update Project Status:** Based on the project stage answer, update the CLAUDE.md "Project Status" section to reflect current priorities and what AI should/shouldn't care about.
5. **Generate Document:** Create a comprehensive app design document using the structure outlined below.
6. **Save Document:** Save as `app-design-document.md` in the `.taskmaster/docs/` directory.

## Clarifying Questions (Examples)

**CRITICAL FIRST QUESTIONS** - Ask these first to set proper context:

- **Project Stage:** "What stage is your application currently in?"

  - a) Pre-MVP (no production deployment yet)
  - b) MVP deployed (basic version live)
  - c) Production (mature application with users)
  - d) Enterprise (large scale, multiple teams)

- **Development Priorities:** Based on the project stage, "What should AI care about vs NOT care about during development?"
  - **Pre-MVP example:** Focus on core functionality, security, validation. Skip unit testing, accessibility optimization, performance tuning. Do not care about breaking changes.
  - **MVP+ example:** Include testing strategies, accessibility, performance considerations, breaking change management.

**Additional questions** - Adapt these based on the codebase analysis:

- **Application Purpose:** "What is the primary problem this application solves?" or "Who is the target audience and what are their main goals?"
- **Core Value Proposition:** "What makes this application unique compared to existing solutions?"
- **User Types:** "What different types of users interact with this system? (e.g., end users, admins, content creators)"
- **Key User Journeys:** "Can you describe the most important user flows from sign-up to achieving their goals?"
- **Business Model:** "How does this application generate value? (e.g., SaaS, marketplace, content platform)"
- **Integration Requirements:** "What external systems or services does this application need to integrate with?"
- **Security & Privacy:** "What are the key security and privacy requirements for your users?"
- **Scalability Goals:** "What scale are you planning for? (users, data, geographic reach)"
- **Future Vision:** "What major features or capabilities do you envision adding in the future?"
- **Success Metrics:** "How do you measure success for this application?"

## Document Structure

The generated document must follow this high-level structure:

### **Introduction**

- Application overview and purpose
- Target audience and user base
- Core value proposition
- Business context and goals

### **Core Features**

- **Feature Category 1:** (e.g., User Management)
  - Purpose and user benefit
  - Key functionalities
  - User experience considerations
- **Feature Category 2:** (e.g., Content Creation)
  - Purpose and user benefit
  - Key functionalities
  - User experience considerations
- **[Additional feature categories as needed]**

### **User Experience**

- User personas and roles
- Key user journeys and flows
- Interface design principles
- Accessibility and usability considerations

### **System Architecture**

- High-level system components
- Data flow and relationships
- Integration points and external services
- Security and privacy approach

### **Business Logic**

- Core business rules and processes
- Data models and relationships (conceptual)
- Workflow and state management
- Validation and business constraints

### **Future Considerations**

- Planned enhancements and features
- Scalability considerations
- Potential integrations
- Long-term vision and roadmap

## Target Audience

The document should be accessible to:

- **Business stakeholders** who need to understand the application's purpose and capabilities
- **Product managers** planning features and roadmaps
- **Designers** creating user interfaces and experiences
- **New developers** joining the project who need a high-level understanding
- **Technical leaders** making architectural decisions

The language should be clear, business-focused, and avoid technical implementation details.

## Key Principles

1. **High-Level Focus:** Describe WHAT the application does, not HOW it's implemented
2. **User-Centric:** Emphasize user value and experience over technical capabilities
3. **Business Context:** Connect features to business goals and user needs
4. **Technology-Agnostic:** Avoid specific technology mentions (those belong in tech-stack.md)
5. **Future-Oriented:** Consider scalability and evolution of the application

## Output

- **Format:** Markdown (`.md`)
- **Location:** `.taskmaster/docs/`
- **Filename:** `app-design-document.md`

## Final Instructions

1. Do NOT start implementing the document immediately
2. First analyze the codebase deeply to understand the application's structure and purpose
3. **CRITICAL:** Ask project stage and development priorities questions FIRST with lettered/numbered options
4. Based on project stage answer, update both:
   - `CLAUDE.md` "Project Status" section with appropriate priorities
   - `.cursor/rules/project-status.mdc` with the specific DO/DON'T lists for the determined stage
5. Ask remaining clarifying questions with lettered/numbered options for easy selection
6. Generate a complete document following the structure above, tailored to the project stage
7. Focus on high-level application design, leaving technical implementation details for the tech-stack document
8. After saving, suggest creating a complementary tech-stack document if one doesn't exist
