# CLAUDE.md

## Project Overview

<!-- Run /create-app-design-document to generate content for this section -->
<!-- Then replace this comment with your project description -->

- `.taskmaster/docs/app-design-document.md` - App design document
- `.taskmaster/docs/tech-stack.md` - Tech stack, architecture

## Project Status

**Current Stage**: <!-- Add stage: Example: Pre-MVP (highest velocity to ship) -->

### DO Care About (Production-Ready Foundation)

<!-- Add your stage-specific priorities here -->
<!-- Example: - **Security**: Authentication, authorization, session management -->

### DO NOT Care About (Skip for Velocity)

<!-- Add what to skip for your current stage -->
<!-- Example: - **Breaking Changes**: Not deployed yet, refactor freely -->

### Development Approach

<!-- Add your development approach based on project stage -->
<!-- Example: - **Focus**: Working implementation over perfect code -->

## Commands

### Development

- `pnpm typecheck` - Run TypeScript type checking (must pass without errors)
- `pnpm lint` - Run ESLint
- DO NOT run `pnpm dev` or `pnpm build` or `pnpm start` - these are manual commands

### Database

<!-- Run /create-tech-stack to document your database commands -->
<!-- Example: -->
<!-- - `pnpm db:generate` - Generate database schema -->
<!-- - `pnpm db:migrate` - Run database migrations -->

### Testing

<!-- Run /create-tech-stack to document your testing commands -->
<!-- Example: -->
<!-- - `pnpm test` - Run all tests -->

## Development Rules

This CLAUDE.md file references Cursor rules rather than duplicating them. This approach ensures:

- Updates to Cursor rules automatically apply to Claude Code
- Single source of truth for development patterns
- Consistent behavior between Cursor and Claude Code
- Easier maintenance of coding standards

The @.cursor/rules/ references below tell Claude Code to follow the same rules that Cursor uses.

### Core Development Guidelines

**@.cursor/rules/cursor-rules.mdc**

- Context: Creating and maintaining Cursor rules to ensure consistency and effectiveness
- Applies to: .cursor/rules/\*.mdc
- Required structure, frontmatter, formatting, and AI optimization guidelines for rule files

**@.cursor/rules/project-status.mdc**

- Context: Project stage assessment and stage-based development priorities
- Applies to: All development decisions and feature implementations
- Stage-based guidelines (Pre-MVP, MVP, Production, Enterprise) with specific DO/DON'T lists

**@.cursor/rules/self-improve.mdc**

- Context: Continuously improving rules based on emerging code patterns and best practices
- Applies to: \*_/_
- Pattern recognition, rule updates, quality checks, and documentation maintenance

### Task Management & Workflow

**`.cursor/rules/taskmaster/taskmaster.mdc`**

- Context: Comprehensive reference for Taskmaster MCP tools and CLI commands
- Applies to: All task management operations and tagged workflow implementation
- Tagged task management system with complete tool/command reference

**`.cursor/rules/taskmaster/dev-workflow.mdc`**

- Context: Using Taskmaster's tagged task management system in development workflows
- Applies to: Daily development workflow, feature planning, and task organization
- Tagged development loop, PRD-driven development, cross-tag coordination patterns

# Task Master AI - Claude Code Integration Guide

## Tagged Task Management System

Task Master uses a **tagged task management system** that organizes tasks into separate, isolated contexts called **tags**. This enables working across multiple contexts such as different features, branches, or project phases without conflicts.

### Tagged System Benefits

- **Complete Context Isolation**: Each tag maintains its own task numbering (starting from 1)
- **Parallel Development**: Multiple features can be developed simultaneously without conflicts
- **Independent Dependencies**: Task dependencies are managed within each tag context
- **Flexible Organization**: Align tags with git branches, features, or project phases
- **Team Collaboration**: Clear ownership and responsibility per tag context

## Essential Commands

### Tag Management Commands

```bash
# Tag Context Management
task-master tags                                   # List all available tags with status
task-master tags --show-metadata                  # List tags with detailed metadata
task-master add-tag <tag-name>                    # Create a new empty tag
task-master add-tag <tag-name> --description="desc" # Create tag with description
task-master add-tag --from-branch                 # Create tag from current git branch
task-master use-tag <tag-name>                    # Switch to a different tag context
task-master copy-tag <source> <target>            # Copy entire tag to create new one
task-master delete-tag <tag-name>                 # Delete tag and all its tasks
task-master rename-tag <old-name> <new-name>      # Rename an existing tag

# Tag-based Task Operations (all work within current tag context)
task-master list                                   # Show tasks in current tag
task-master next                                   # Get next task in current tag
task-master show <id>                             # View task in current tag (e.g., 1.2)
task-master add-task --prompt="description"       # Add task to current tag
```

### Core Workflow Commands

```bash
# Project Setup
task-master init                                   # Initialize Task Master with tagged system
task-master models --setup                        # Configure AI models interactively

# Tagged PRD Workflow
task-master use-tag <tag-name>                    # Switch to tag context
task-master parse-prd .taskmaster/docs/prd-<tag>.md  # Generate tasks from PRD in current tag

# Daily Development Workflow (within current tag)
task-master list                                   # Show all tasks in current tag
task-master next                                   # Get next available task in current tag
task-master show <id>                             # View detailed task information
task-master set-status --id=<id> --status=done    # Mark task complete in current tag

# Task Management (within current tag)
task-master expand --id=<id> --research --force   # Break task into subtasks
task-master update-task --id=<id> --prompt="changes"         # Update specific task
task-master update --from=<id> --prompt="changes"            # Update multiple tasks from ID onwards
task-master update-subtask --id=<id> --prompt="notes"        # Add implementation notes to subtask

# Analysis & Planning (within current tag)
task-master analyze-complexity --research          # Analyze task complexity in current tag
task-master complexity-report                      # View complexity analysis for current tag
task-master expand --all --research               # Expand all eligible tasks in current tag

# Dependencies & Organization (within current tag)
task-master add-dependency --id=<id> --depends-on=<id>       # Add task dependency
task-master move --from=<id> --to=<id>                       # Reorganize task hierarchy
task-master validate-dependencies                            # Check for dependency issues
task-master generate                                         # Update task markdown files
```

## Tagged Workflow Integration

### ⚠️ CRITICAL RULE: Never Work on Master Tag

**NEVER work directly on the `master` tag.** Always switch to a feature-specific tag before working with Task Master:

```bash
# ❌ BAD - Working on master tag
task-master use-tag master
task-master next                    # Don't do this!

# ✅ GOOD - Switch to feature tag first
task-master add-tag modal-panel-isolation --description="Modal panel isolation feature"
task-master use-tag modal-panel-isolation
task-master parse-prd .taskmaster/docs/prd-modal-panel-isolation.md
task-master next                    # Now this is correct!
```

### Setting Up Tagged Contexts

#### 1. Initialize Multiple Tag Contexts

```bash
# Create tag contexts for different features/areas
task-master add-tag user-auth --description="User authentication features"
task-master add-tag payments --description="Payment system implementation"
task-master add-tag mobile --description="Mobile app development"
task-master add-tag admin --description="Admin dashboard features"
```

#### 2. Organize Tagged PRDs

Create PRDs for different contexts:

```
.taskmaster/docs/
  prd-master.md              # Main project PRD
  prd-user-authentication.md # Authentication feature PRD
  prd-payment-system.md      # Payment system PRD
  prd-mobile-app.md          # Mobile app PRD
  prd-admin-dashboard.md     # Admin features PRD
```

#### 3. Parse PRDs into Tag Contexts

```bash
# Switch to authentication context and parse its PRD
task-master use-tag user-auth
task-master parse-prd .taskmaster/docs/prd-user-authentication.md

# Switch to payments context and parse its PRD
task-master use-tag payments
task-master parse-prd .taskmaster/docs/prd-payment-system.md

# Continue for each feature area...
```

### Daily Tagged Development Workflow

#### 1. Tag Context Management

```bash
# Check available tag contexts
task-master tags --show-metadata

# Switch to desired context (NEVER master for feature work!)
task-master use-tag user-auth

# Work within that context
task-master next                           # Find next task in current tag
task-master show <id>                     # Review task details in current tag
```

#### 2. Cross-Tag Development

```bash
# Work on authentication, then switch to mobile
task-master use-tag user-auth
task-master list                          # See auth tasks
# ... work on auth tasks ...

task-master use-tag mobile
task-master list                          # See mobile tasks
# ... work on mobile tasks ...
```

#### 3. Tag-Specific Implementation

```bash
# Within a tag context, all operations are isolated
task-master update-subtask --id=2.1 --prompt="implementation notes..."  # Updates task 2.1 in current tag only
task-master set-status --id=3 --status=done                            # Marks task 3 done in current tag only
```

### Advanced Tagged Workflows

#### Branch-Based Tag Management

```bash
# Align tag contexts with git branches
git checkout -b feature/authentication
task-master add-tag --from-branch          # Creates tag from branch name

git checkout -b feature/payments
task-master add-tag --from-branch          # Creates another tag
```

#### Tag Copying and Templates

```bash
# Create new contexts from existing ones
task-master copy-tag user-auth admin-auth --description="Admin authentication"

# Copy tasks from current tag to new context
task-master add-tag testing --copy-from-current --description="QA testing tasks"
```

#### Cross-Tag Coordination

When coordinating work across tags:

1. **Plan Integration Points**: Identify where different tag contexts need to interact
2. **Manual Coordination**: Note cross-tag dependencies in task details
3. **Tag Switching**: Use `task-master use-tag` to switch contexts as needed
4. **Documentation**: Use `task-master update-subtask` to document cross-tag decisions

## Key Files & Project Structure

### Core Files

- `.taskmaster/tasks/tasks.json` - Tagged task data file (auto-managed)
- `.taskmaster/state.json` - Current tag context and state information
- `.taskmaster/config.json` - AI model configuration (use `task-master models` to modify)
- `.taskmaster/docs/prd-<tag>.md` - Product Requirements Documents for each tag
- `.taskmaster/tasks/*.md` - Individual task files (auto-generated, tagged by context)

### Tagged Task Structure

```json
{
  "master": {
    "tasks": [
      { "id": 1, "title": "Setup API", "status": "pending", ... }
    ]
  },
  "user-auth": {
    "tasks": [
      { "id": 1, "title": "OAuth Integration", "status": "pending", ... }
    ]
  },
  "payments": {
    "tasks": [
      { "id": 1,  // Independent numbering per tag
        "title": "Setup Stripe Integration",
        "description": "Configure Stripe payment processing",
        "status": "pending",
        "priority": "high",
        "dependencies": [],
        "details": "Use Stripe API for payment processing...",
        "testStrategy": "Test payment flow with test cards"
      }
    ]
  }
}
```

### Claude Code Integration Files

- `CLAUDE.md` - Auto-loaded context for Claude Code (this file)
- `.claude/settings.json` - Claude Code tool allowlist and preferences
- `.claude/commands/` - Custom slash commands for repeated workflows
- `.mcp.json` - MCP server configuration (project-specific)

### Directory Structure

```
project/
├── .taskmaster/
│   ├── tasks/              # Tagged task files directory
│   │   ├── tasks.json      # Tagged task database
│   │   ├── task-1.md      # Individual task files (tagged)
│   │   └── task-2.md
│   ├── docs/              # Documentation directory
│   │   ├── prd-master.md           # Main PRD
│   │   ├── prd-user-authentication.md # Auth PRD
│   │   ├── prd-payment-system.md   # Payment PRD
│   │   └── prd-mobile-app.md       # Mobile PRD
│   ├── reports/           # Analysis reports directory
│   │   └── task-complexity-report.json
│   ├── templates/         # Template files
│   │   └── example_prd.md  # Example PRD template
│   ├── state.json         # Current tag context and state
│   └── config.json        # AI models & settings
├── .claude/
│   ├── settings.json      # Claude Code configuration
│   └── commands/         # Custom slash commands
├── .mcp.json            # MCP configuration
└── CLAUDE.md            # This file - auto-loaded by Claude Code
```

### Essential MCP Tools

```javascript
help; // = shows available taskmaster commands
// Tag management
list_tags; // = task-master tags
add_tag; // = task-master add-tag
use_tag; // = task-master use-tag
copy_tag; // = task-master copy-tag
delete_tag; // = task-master delete-tag

// Tagged workflow
initialize_project; // = task-master init (with tagged system)
parse_prd; // = task-master parse-prd (in current tag)

// Tag-aware operations (all work within current tag)
get_tasks; // = task-master list
next_task; // = task-master next
get_task; // = task-master show <id>
set_task_status; // = task-master set-status

// Task management
add_task; // = task-master add-task
expand_task; // = task-master expand
update_task; // = task-master update-task
update_subtask; // = task-master update-subtask
update; // = task-master update

// Analysis
analyze_project_complexity; // = task-master analyze-complexity
complexity_report; // = task-master complexity-report
```

## Claude Code Workflow Integration

### Tagged Project Initialization

```bash
# Initialize Task Master with tagged system
task-master init

# Set up multiple tag contexts
task-master add-tag user-auth --description="Authentication features"
task-master add-tag payments --description="Payment system"
task-master add-tag mobile --description="Mobile app"

# Parse PRDs into respective contexts
task-master use-tag user-auth
task-master parse-prd .taskmaster/docs/prd-user-authentication.md

task-master use-tag payments
task-master parse-prd .taskmaster/docs/prd-payment-system.md

# Analyze and expand within each context
task-master use-tag user-auth
task-master analyze-complexity --research
task-master expand --all --research
```

### Multi-Context Development Loop

```bash
# Morning: Check all contexts
task-master tags --show-metadata              # Overview of all tag contexts

# Work on authentication
task-master use-tag user-auth
task-master next                              # Find next auth task
task-master show <id>                        # Review auth task details

# Afternoon: Switch to payments
task-master use-tag payments
task-master next                              # Find next payment task
task-master show <id>                        # Review payment task details

# Log progress in current context
task-master update-subtask --id=<id> --prompt="implementation progress..."
```

### Multi-Claude Tagged Workflows

For complex projects with multiple tag contexts:

```bash
# Terminal 1: Authentication development
cd project && claude
# > task-master use-tag user-auth

# Terminal 2: Payment system development
cd project-payment-worktree && claude
# > task-master use-tag payments

# Terminal 3: Mobile app development
cd project-mobile-worktree && claude
# > task-master use-tag mobile
```

## Tagged Task Structure & IDs

### Tag-Specific Task IDs

- **Independent Numbering**: Each tag maintains its own task sequence starting from 1
- **Main tasks**: `1`, `2`, `3`, etc. (within each tag)
- **Subtasks**: `1.1`, `1.2`, `2.1`, etc. (within each tag)
- **Sub-subtasks**: `1.1.1`, `1.1.2`, etc. (within each tag)

### Tagged Task Context

```json
{
  "user-auth": {
    "tasks": [
      {
        "id": 1,
        "title": "Setup OAuth Provider",
        "description": "Configure GitHub OAuth integration",
        "status": "pending",
        "priority": "high",
        "dependencies": [],
        "details": "Use GitHub OAuth client ID/secret...",
        "testStrategy": "Test OAuth flow with GitHub account",
        "subtasks": [
          {
            "id": 1,
            "title": "Register OAuth App",
            "status": "pending",
            "dependencies": []
          }
        ]
      }
    ]
  },
  "payments": {
    "tasks": [
      {
        "id": 1, // Independent numbering per tag
        "title": "Setup Stripe Integration",
        "description": "Configure Stripe payment processing",
        "status": "pending",
        "priority": "high",
        "dependencies": [],
        "details": "Use Stripe API for payment processing...",
        "testStrategy": "Test payment flow with test cards"
      }
    ]
  }
}
```

## Claude Code Best Practices with Tagged System

### Tag Context Awareness

- Always know your current tag context: `task-master tags` shows current context
- Use `/clear` between different tag contexts to maintain focus
- Use `task-master show <id>` to pull specific task context when needed
- Remember: Task IDs are independent per tag (each tag has its own task 1, 2, 3...)

### Tagged Implementation Strategy

1. **Context Setup**: `task-master use-tag <target-tag>` - Switch to appropriate context
2. **Task Discovery**: `task-master show <id>` - Understand requirements within tag
3. **Planning**: `task-master update-subtask --id=<id> --prompt="detailed plan"` - Log plan in context
4. **Status Management**: `task-master set-status --id=<id> --status=in-progress` - Start work in context
5. **Implementation**: Implement code following logged plan
6. **Progress Logging**: `task-master update-subtask --id=<id> --prompt="progress notes"` - Log within context
7. **Completion**: `task-master set-status --id=<id> --status=done` - Complete within context

### Cross-Tag Development Patterns

#### Feature Integration Workflow

```bash
# 1. Implement core feature in its tag
task-master use-tag user-auth
task-master show 2                           # Review auth API task
# ... implement auth APIs ...
task-master set-status --id=2 --status=done

# 2. Switch to consuming feature's tag
task-master use-tag mobile
task-master show 3                           # Review mobile integration task
task-master update-subtask --id=3.1 --prompt="Auth APIs completed in user-auth tag, ready for integration"
# ... implement integration ...
```

#### Cross-Tag Documentation

```bash
# Document cross-tag dependencies
task-master use-tag mobile
task-master update-subtask --id=3.2 --prompt="Depends on user-auth tag task 2 (OAuth setup) being completed"

# Document integration decisions
task-master update-subtask --id=3.3 --prompt="Using JWT tokens from auth service, implemented in user-auth tag"
```

### Complex Tagged Workflows

#### Multi-Feature Migration

1. **Create Migration PRD**: `touch .taskmaster/docs/prd-migration.md`
2. **Create Migration Tag**: `task-master add-tag migration --description="System migration tasks"`
3. **Parse Migration**: `task-master use-tag migration && task-master parse-prd .taskmaster/docs/prd-migration.md`
4. **Cross-Reference**: Document which existing tags are affected in migration tasks
5. **Coordinate**: Use `task-master update-subtask` to log progress across affected tags

#### Tag Lifecycle Management

```bash
# Development lifecycle
task-master add-tag feature-x --description="New feature development"    # Create
task-master use-tag feature-x                                           # Develop
task-master copy-tag feature-x testing-x --description="Feature testing" # Test
task-master delete-tag feature-x                                        # Cleanup
```

### Git Integration with Tagged System

Tagged Task Master works excellently with git workflows:

```bash
# Align tags with branches
git checkout -b feature/user-authentication
task-master add-tag --from-branch

# Work within tag context
task-master use-tag feature-user-authentication
task-master next

# Commit with tag context
git commit -m "feat: implement OAuth setup (user-auth tag, task 1.2)"

# Create PR with tag context
gh pr create --title "Complete user-auth tag: OAuth integration" --body "Implements all user authentication tasks from user-auth tag context"
```

### Parallel Development with Tagged Worktrees

```bash
# Create worktrees for different tag contexts
git worktree add ../project-auth feature/auth-system
git worktree add ../project-payment feature/payment-system
git worktree add ../project-mobile feature/mobile-app

# Run Claude Code in each worktree with different tag contexts
cd ../project-auth && claude       # Terminal 1: user-auth tag
cd ../project-payment && claude    # Terminal 2: payments tag
cd ../project-mobile && claude     # Terminal 3: mobile tag
```

## Troubleshooting Tagged System

### Tag Context Issues

```bash
# Check current tag context
task-master tags                              # Shows current tag (marked with *)

# Switch if needed
task-master use-tag <correct-tag>

# List tasks in current context
task-master list
```

### Cross-Tag Dependencies

- **Note**: Task dependencies only work within the same tag context
- **Workaround**: Document cross-tag dependencies in task details using `update-subtask`
- **Coordination**: Use clear naming and documentation for cross-tag integration points

### Task File Sync Issues

```bash
# Regenerate task files for current tag
task-master generate

# Fix dependencies within current tag
task-master fix-dependencies
```

## Important Tagged System Notes

### Tag Context Isolation

- **Task IDs are independent per tag** - each tag has its own sequence starting from 1
- **Dependencies only work within tags** - cannot create dependencies across tags
- **Status and progress are tag-specific** - marking task 1 done in tag A doesn't affect task 1 in tag B
- **Current tag context affects all operations** - always verify you're in the correct tag

### AI-Powered Operations (within current tag)

These commands work within the current tag context and may take up to a minute:

- `parse_prd` / `task-master parse-prd` - Generates tasks in current tag
- `analyze_project_complexity` / `task-master analyze-complexity` - Analyzes current tag's tasks
- `expand_task` / `task-master expand` - Expands tasks in current tag
- `add_task` / `task-master add-task` - Adds to current tag
- `update` / `task-master update` - Updates tasks in current tag

### File Management with Tagged System

- Never manually edit `tasks.json` - contains all tag contexts, use commands instead
- Current tag context is stored in `.taskmaster/state.json`
- Task markdown files are generated with tag context information
- Use `task-master generate` after any manual changes

### Claude Code Session Management with Tags

- Use `/clear` when switching between tag contexts to maintain focus
- Start sessions by checking tag context: `task-master tags`
- Use `task-master use-tag <name>` to switch contexts within session
- Headless mode with tag context: `claude -p "task-master use-tag auth && task-master next"`

The tagged system ensures your task management scales with project complexity while maintaining clear organization and preventing conflicts across different feature areas or development contexts.
