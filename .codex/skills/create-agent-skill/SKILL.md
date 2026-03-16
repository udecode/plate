---
name: create-agent-skill
description: Creates or edits Claude Code agent skill files (SKILL.md) with proper YAML frontmatter, structured content sections, and best-practice patterns. Accepts a skill description or requirements and delegates to the create-agent-skills sub-skill. Trigger terms: "create skill", "new skill", "edit skill", "skill template", "agent skill". Use when the user wants to scaffold, author, or refine an agent skill definition.
allowed-tools: Skill(create-agent-skills)
argument-hint: '[skill description or requirements]'
disable-model-invocation: true
---

# Create or Edit Agent Skill

## Overview

Delegates to the `create-agent-skills` sub-skill to produce a well-structured SKILL.md file.
The sub-skill handles YAML frontmatter generation, content scaffolding, and best-practice
validation.

## Workflow

1. **Receive requirements** -- the user provides a skill description or requirements via `$ARGUMENTS`.
2. **Delegate** -- invoke the `create-agent-skills` skill with the provided input.
3. **Output** -- return the generated or updated SKILL.md content.

## Invocation

Invoke the create-agent-skills skill for: $ARGUMENTS

## Example

```
/create-agent-skill "A skill that lints Markdown files and reports issues"
```
