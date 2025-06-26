# Rule: Syncing Cursor Rules to CLAUDE.md

> $ARGUMENTS

## Goal

To synchronize the "Development Rules" section in CLAUDE.md with the current Cursor rules in `.cursor/rules/` directory. This ensures Claude Code always follows the same development patterns as Cursor, maintaining consistency across AI assistants.

## Process

1. **Scan Rules Directory:** Read all `.mdc` files from `.cursor/rules/` directory
2. **Organize by Category:** Group rules by their logical categories based on content
3. **Update CLAUDE.md:** Replace the "Development Rules" section with the updated references
4. **Preserve Structure:** Maintain the existing organization and formatting style

## Rule Organization

The sync process will automatically organize rules based on:

1. **Natural grouping** from the rule descriptions and context
2. **Alphabetical or numerical ordering** within groups
3. **Logical categories** that emerge from the actual rules present

The tool should detect and create categories dynamically based on the rules found, rather than forcing a predefined structure. This ensures the sync works across different projects with different rule sets.

## Sync Strategy

### Rule Reference Format

Each rule reference should follow this format:

```markdown
**@.cursor/rules/[filename]**

- Context: [When/what this rule applies to]
- Applies to: [File patterns or scenarios]
- [Brief description of key patterns/requirements]
```

### Extraction Process

1. **Read Rule File**: Extract frontmatter and first paragraph/section
2. **Parse Metadata**:
   - `description`: Brief summary of the rule
   - `globs`: File patterns it applies to
   - `alwaysApply`: Whether it's always active
3. **Extract Context**: Find the "Context" section or derive from content
4. **Summarize Requirements**: Extract key points from Requirements section

### Update Guidelines

- **Preserve**: Existing section headers and overall structure
- **Update**: Only the content within "Development Rules" section
- **Add**: New rules discovered in `.cursor/rules/`
- **Remove**: References to deleted rule files
- **Sort**: Rules numerically within each category

## Output Example

```markdown
## Development Rules

### [Dynamic Category Based on Content]

**@.cursor/rules/cursor-rules.mdc**

- Context: Defines rule format structure for Cursor Rules
- Applies to: .cursor/rules/\*.mdc
- Guidelines for creating and organizing rules

**@.cursor/rules/self-improve.mdc**

- Context: AI self-improvement and learning patterns
- Applies to: All AI interactions
- Guidelines for continuous improvement and adaptation

[... continue with discovered categories ...]
```

## Implementation Steps

1. **List all .mdc files** in `.cursor/rules/` directory
2. **Read each file** to extract metadata and content
3. **Categorize** based on filename pattern
4. **Generate** formatted references for each rule
5. **Replace** the "Development Rules" section in CLAUDE.md
6. **Verify** all rules are included and properly formatted

## Key Principles

1. **Consistency**: Maintain the same reference format throughout
2. **Clarity**: Make it easy to understand when each rule applies
3. **Completeness**: Include all rules, even new ones
4. **Organization**: Keep logical grouping for easy navigation
5. **Automation**: This should be re-runnable as rules evolve

## Final Notes

- This sync should be run whenever new Cursor rules are added or modified
- The references in CLAUDE.md are intentionally brief - full details remain in the .mdc files
- This approach ensures single source of truth while providing Claude Code with necessary context
- Consider adding a timestamp comment to track when last synced
