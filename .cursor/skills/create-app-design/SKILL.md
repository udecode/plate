---
allowed-tools: Read, Glob, Grep, Write, MultiEdit, TodoWrite
description: Generate comprehensive app design document with project stage assessment
name: create-app-design
---

# Generate Application Design Document

**User Request:** $ARGUMENTS

## Context

- Project root: !`pwd`
- Package.json: @package.json
- Existing design docs: !`ls -la .claude/rules/ 2>/dev/null || echo "No .claude/rules directory yet"`

## Goal

Create a comprehensive Application Design Document based on deep codebase analysis and user input. The document provides a high-level overview of the application's architecture, core features, user experience, and business logic while remaining technology-agnostic and focused on the "what" rather than the "how".

## Process

### 1. Initial Analysis

- Analyze project structure and existing codebase
- Review package.json for project name and dependencies
- Check for existing documentation in .claude/rules/
- Identify key application features and patterns
- **Think deeply** about the application's purpose and architecture

### 2. Codebase Deep Dive

**Think harder about the application's architecture and business logic.**

Analyze the codebase to understand:

- **Application Structure:** Main modules, features, and components
- **User Flows:** Authentication, navigation, key user journeys
- **Data Models:** Conceptual relationships and entities
- **Business Logic:** Core rules, workflows, and processes
- **Integrations:** External services and APIs
- **Security Patterns:** Authentication and authorization approaches

_Extended thinking helps identify non-obvious patterns, understand complex business rules from code, and make strategic decisions about what aspects are most important to document._

### 3. Interactive Q&A Session

**CRITICAL:** Ask project stage question FIRST, then 4-7 additional questions:

- Use lettered/numbered options for easy response
- Focus on business goals and user needs
- Gather context for proper documentation

### 4. Update Project Configuration

Based on project stage response:

- Update `.claude/rules/3-project-status.mdc` with current stage
- Set appropriate DO/DON'T priorities for the stage
- Document stage-specific development guidelines in the Cursor rule

### 5. Generate Document

Create comprehensive app design document following the standard structure

### 6. Save and Organize

- Create `.claude/rules/` directory if needed
- Save as `1-app-design-document.mdc`
- Suggest next steps (tech stack doc, PRD, etc.)

## Required Questions Template

### 🎯 CRITICAL: Project Stage Assessment (Ask First!)

**1. What stage is your application currently in?**

a) **Pre-MVP** - Building initial version, not deployed to production yet  
 b) **MVP** - Basic version deployed and live with early users  
 c) **Production** - Mature application with established user base  
 d) **Enterprise** - Large scale deployment, multiple teams involved

**2. Based on your selected stage, here are the development priorities:**

- **Pre-MVP Priorities:**

  - ✅ DO: Core functionality, security basics, input validation, working features
  - ❌ DON'T: Unit tests, performance optimization, accessibility polish, perfect code
  - 🚀 Focus: Ship fast with security, iterate based on feedback

- **MVP Priorities:**

  - ✅ DO: Critical path testing, basic monitoring, user feedback loops
  - ❌ DON'T: Comprehensive test coverage, advanced patterns, premature optimization
  - 🚀 Focus: Stability for early users, rapid iteration

- **Production Priorities:**

  - ✅ DO: Testing, monitoring, performance, accessibility, documentation
  - ❌ DON'T: Skip security reviews, ignore technical debt
  - 🚀 Focus: Reliability, scalability, user experience

- **Enterprise Priorities:**
  - ✅ DO: Comprehensive testing, security audits, team coordination, compliance
  - ❌ DON'T: Skip documentation, ignore code standards
  - 🚀 Focus: Team efficiency, maintainability, compliance

### 📋 Context-Specific Questions (Ask 4-7 based on analysis)

**3. Application Purpose & Users**

- What is the primary problem your application solves?
- Who are your target users and what are their main goals?

**4. Unique Value Proposition**

- What makes your application unique compared to existing solutions?
- What's your competitive advantage?

**5. User Roles & Permissions**

- What different types of users interact with your system?
- Examples: end users, admins, moderators, content creators, viewers

**6. Core User Journeys**

- What are the 2-3 most critical user flows?
- Example: Sign up → Create content → Share → Get feedback

**7. Business Model & Growth**

- How does this application generate value?
- Options: SaaS subscription, marketplace, freemium, advertising, one-time purchase

**8. Integration Ecosystem**

- What external services must you integrate with?
- Examples: payment processors, email services, analytics, social platforms

**9. Scale & Performance Goals**

- What scale are you planning for in the next 12 months?
- Users: dozens, hundreds, thousands, millions?
- Geographic: local, national, global?

**10. Success Metrics**

- How will you measure if your application is successful?
- Examples: user retention, revenue, engagement, conversion rates

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

## Writing Principles

### DO:

- **Business Focus:** Describe WHAT the application does, not HOW
- **User Value:** Emphasize benefits and outcomes for users
- **Clear Language:** Write for non-technical stakeholders
- **Visual Thinking:** Use diagrams and flows where helpful
- **Future Ready:** Consider growth and evolution paths

### DON'T:

- **Technical Details:** No code snippets or implementation specifics
- **Technology Stack:** Save for 2-tech-stack.mdc document
- **Database Schemas:** Keep data models conceptual
- **API Specifications:** Focus on capabilities, not endpoints
- **Performance Metrics:** Describe goals, not technical benchmarks

## Output

- **Format:** Markdown (`.mdc`)
- **Location:** `.claude/rules/`
- **Filename:** `1-app-design-document.mdc`

## Execution Steps

### 1. Start with Analysis

- Use Read, Glob, and Grep to explore the codebase
- Identify key features and patterns
- Look for existing documentation
- **Use extended thinking:** "Think deeply about this codebase's architecture, business purpose, and how different components work together to serve users"

### 2. Interactive Q&A

- **MUST ASK PROJECT STAGE FIRST**
- Present questions with numbered/lettered options
- Wait for user responses before proceeding

### 3. Update Project Status in Cursor Rule

Update `.claude/rules/3-project-status.mdc` with the project stage information:

```markdown
---
description: Project status and stage-specific development guidelines
globs:
alwaysApply: true
---

# Project Status Guidelines

## Current Project Stage: [Stage Name]

**Stage**: [Pre-MVP | MVP | Production | Enterprise]

### DO Care About (Current Stage Priorities)

[Stage-specific DO priorities from template below]

### DO NOT Care About (Skip for Velocity)

[Stage-specific DON'T priorities from template below]

### Development Approach

[Stage-specific development focus]

## Stage-Based Development Guidelines

[Keep existing stage categories and guidelines from the original file]
```

**Stage-Specific Content:**

- **Pre-MVP**:

  - ✅ DO: Core functionality, security basics, input validation, working features
  - ❌ DON'T: Unit tests, performance optimization, accessibility polish, perfect code
  - 🚀 Focus: Ship fast with security, iterate based on feedback

- **MVP**:

  - ✅ DO: Critical path testing, basic monitoring, user feedback loops
  - ❌ DON'T: Comprehensive test coverage, advanced patterns, premature optimization
  - 🚀 Focus: Stability for early users, rapid iteration

- **Production**:

  - ✅ DO: Testing, monitoring, performance, accessibility, documentation
  - ❌ DON'T: Skip security reviews, ignore technical debt
  - 🚀 Focus: Reliability, scalability, user experience

- **Enterprise**:
  - ✅ DO: Comprehensive testing, security audits, team coordination, compliance
  - ❌ DON'T: Skip documentation, ignore code standards
  - 🚀 Focus: Team efficiency, maintainability, compliance

### 4. Generate Document

- Follow the standard structure
- Tailor content to project stage
- Keep language accessible

### 5. Save and Next Steps

- Create directories: `mkdir -p .claude/docs .claude/rules`
- Save design document: `.claude/rules/1-app-design-document.mdc`
- Update Claude rule: `.claude/rules/3-project-status.mdc`
- Suggest: "Would you like me to create a technical stack document next?"
