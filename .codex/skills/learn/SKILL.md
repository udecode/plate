---
name: learn
description: |
  Continuous learning system that extracts reusable knowledge from work sessions.
  Triggers: (1) /learn command to review session learnings, (2) "save this as a skill"
  or "extract a skill from this", (3) "what did we learn?", (4) After any task involving
  non-obvious debugging, workarounds, or trial-and-error discovery. Creates new Claude Code
  skills when valuable, reusable knowledge is identified.
version: 3.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - WebSearch
  - WebFetch
  - Skill
  - AskUserQuestion
  - TodoWrite
---

# Learn

A continuous learning system that extracts reusable knowledge from work sessions and
codifies it into new Claude Code skills. This enables autonomous improvement over time.

## Core Principle: Skill Extraction

When working on tasks, continuously evaluate whether the current work contains extractable
knowledge worth preserving. Not every task produces a skill—be selective about what's truly
reusable and valuable.

## TDD Mapping for Skill Extraction

Skill extraction follows the same discipline as Test-Driven Development:

| TDD Concept         | Skill Extraction                                   |
| ------------------- | -------------------------------------------------- |
| **Test case**       | The problem/failure pattern you just encountered   |
| **Production code** | The skill document (.mdc file)                     |
| **RED**             | You hit the problem during work (already happened) |
| **GREEN**           | Write skill addressing that specific problem       |
| **REFACTOR**        | Verify skill clarity, iterate if needed            |

The key insight: When extracting from a session, the RED phase already happened—you discovered something non-obvious. Now write the skill (GREEN) and verify it (REFACTOR).

## When to Extract a Skill

Extract a skill when you encounter:

1. **Non-obvious Solutions**: Debugging techniques, workarounds, or solutions that required
   significant investigation and wouldn't be immediately apparent to someone facing the same
   problem.

2. **Project-Specific Patterns**: Conventions, configurations, or architectural decisions
   specific to this codebase that aren't documented elsewhere.

3. **Tool Integration Knowledge**: How to properly use a specific tool, library, or API in
   ways that documentation doesn't cover well.

4. **Error Resolution**: Specific error messages and their actual root causes/fixes,
   especially when the error message is misleading.

5. **Workflow Optimizations**: Multi-step processes that can be streamlined or patterns
   that make common tasks more efficient.

## Skill Types

Different skill types serve different purposes:

- **Technique**: Concrete method with steps to follow (debugging patterns, testing approaches)
- **Pattern**: Mental model for problem-solving (architectural decisions, design patterns)
- **Reference**: API docs, syntax guides, tool documentation
- **Error Resolution**: Specific error message → root cause → fix mapping

Classification helps determine verification approach (see Verification by Skill Type below).

## Skill Quality Criteria

Before extracting, verify the knowledge meets these criteria:

- **Reusable**: Will this help with future tasks? (Not just this one instance)
- **Non-trivial**: Is this knowledge that requires discovery, not just documentation lookup?
- **Specific**: Can you describe the exact trigger conditions and solution?
- **Verified**: Has this solution actually worked, not just theoretically?

## Extraction Process

### Step 1: Identify the Knowledge

Analyze what was learned:

- What was the problem or task?
- What was non-obvious about the solution?
- What would someone need to know to solve this faster next time?
- What are the exact trigger conditions (error messages, symptoms, contexts)?

### Step 2: Research Best Practices (When Appropriate)

Before creating the skill, search the web for current information when:

**Always search for:**

- Technology-specific best practices (frameworks, libraries, tools)
- Current documentation or API changes
- Common patterns or solutions for similar problems
- Known gotchas or pitfalls in the problem domain
- Alternative approaches or solutions

**When to search:**

- The topic involves specific technologies, frameworks, or tools
- You're uncertain about current best practices
- The solution might have changed after January 2025 (knowledge cutoff)
- There might be official documentation or community standards
- You want to verify your understanding is current

**When to skip searching:**

- Project-specific internal patterns unique to this codebase
- Solutions that are clearly context-specific and wouldn't be documented
- Generic programming concepts that are stable and well-understood
- Time-sensitive situations where the skill needs to be created immediately

**Search strategy:**

```
1. Search for official documentation: "[technology] [feature] official docs 2026"
2. Search for best practices: "[technology] [problem] best practices 2026"
3. Search for common issues: "[technology] [error message] solution 2026"
4. Review top results and incorporate relevant information
5. Always cite sources in a "References" section of the skill
```

**Example searches:**

- "Next.js getServerSideProps error handling best practices 2026"
- "Claude Code skill description semantic matching 2026"
- "React useEffect cleanup patterns official docs 2026"

**Integration with skill content:**

- Add a "References" section at the end of the skill with source URLs
- Incorporate best practices into the "Solution" section
- Include warnings about deprecated patterns in the "Notes" section
- Mention official recommendations where applicable

### Step 3: Structure the Skill

Save the skill to the appropriate location:
- If `.claude/skiller.toml` exists: `.claude/rules/[skill-name].mdc`
- Otherwise: `.claude/skills/[skill-name]/SKILL.md`

Use MDC frontmatter:

```markdown
---
name: skill-name-with-hyphens
description: |
  Use when [specific triggering conditions]. Triggers: (1) exact symptom,
  (2) error message, (3) scenario. [What problem this solves, written in third person.]
---

# [Skill Name]

## Problem

[Clear description of the problem this skill addresses]

## Context / Trigger Conditions

[When should this skill be used? Include exact error messages, symptoms, or scenarios]

## Solution

[Step-by-step solution or knowledge to apply]

## Verification

[How to verify the solution worked]

## Example

[Concrete example of applying this skill]

## Notes

[Any caveats, edge cases, or related considerations]

## References

[Optional: Links to official documentation, articles, or resources that informed this skill]
```

### Step 4: Write Effective Descriptions

The description field is critical for skill discovery. Include:

- **Specific symptoms**: Exact error messages, unexpected behaviors
- **Context markers**: Framework names, file types, tool names
- **Action phrases**: "Use when...", "Helps with...", "Solves..."

Example of a good description:

```
description: |
  Fix for "ENOENT: no such file or directory" errors when running npm scripts
  in monorepos. Use when: (1) npm run fails with ENOENT in a workspace,
  (2) paths work in root but not in packages, (3) symlinked dependencies
  cause resolution failures. Covers node_modules resolution in Lerna,
  Turborepo, and npm workspaces.
```

## Claude Search Optimization (CSO)

Critical for discovery—future Claude needs to FIND your skill.

### Description Field

- **Start with "Use when..."** to focus on triggering conditions
- Describe the _problem_ (race conditions, flaky tests) not language-specific symptoms
- Write in third person (injected into system prompt)
- Keep under 500 characters if possible

### Keyword Coverage

Use words Claude would search for:

- **Error messages**: "Hook timed out", "ENOTEMPTY", "race condition"
- **Symptoms**: "flaky", "hanging", "zombie", "pollution"
- **Synonyms**: "timeout/hang/freeze", "cleanup/teardown/afterEach"
- **Tools**: Actual commands, library names, file types

### Token Efficiency

Skills load into context. Be concise but complete.

- Move heavy reference (100+ lines) to separate files
- Use cross-references instead of repeating content
- Don't sacrifice clarity for brevity

### Step 5: Deploy

After creating the skill, run:

```bash
npx skiller@latest apply
```

## Retrospective Mode

When `/learn` is invoked at the end of a session:

1. **Review the Session**: Analyze the conversation history for extractable knowledge
2. **Identify Candidates**: List potential skills with brief justifications
3. **Prioritize**: Focus on the highest-value, most reusable knowledge
4. **Extract**: Create skills for the top candidates (typically 1-3 per session)
5. **Summarize**: Report what skills were created and why

## Self-Reflection Prompts

Use these prompts during work to identify extraction opportunities:

- "What did I just learn that wasn't obvious before starting?"
- "If I faced this exact problem again, what would I wish I knew?"
- "What error message or symptom led me here, and what was the actual cause?"
- "Is this pattern specific to this project, or would it help in similar projects?"
- "What would I tell a colleague who hits this same issue?"

## Memory Consolidation

When extracting skills, also consider:

1. **Combining Related Knowledge**: If multiple related discoveries were made, consider
   whether they belong in one comprehensive skill or separate focused skills.

2. **Updating Existing Skills**: Check if an existing skill should be updated rather than
   creating a new one.

3. **Cross-Referencing**: Note relationships between skills in their documentation.

## Quality Gates

Before finalizing a skill, verify:

- [ ] Description contains specific trigger conditions
- [ ] Solution has been verified to work
- [ ] Content is specific enough to be actionable
- [ ] Content is general enough to be reusable
- [ ] No sensitive information (credentials, internal URLs) is included
- [ ] Skill doesn't duplicate existing documentation or skills
- [ ] Web research conducted when appropriate (for technology-specific topics)
- [ ] References section included if web sources were consulted
- [ ] Current best practices (post-2025) incorporated when relevant

## Verification by Skill Type

Different skill types need different verification:

### Technique Skills (how-to guides)

- Apply to real scenario in current session
- Does skill guide correctly?
- Are edge cases covered?

### Pattern Skills (mental models)

- Does skill explain when pattern applies?
- Are counter-examples clear (when NOT to apply)?

### Reference Skills (documentation)

- Is information findable?
- Are common use cases covered?

### Error Resolution Skills

- Does symptom → cause → fix mapping hold?
- Are related errors mentioned?

## Anti-Patterns to Avoid

- **Over-extraction**: Not every task deserves a skill. Mundane solutions don't need preservation.
- **Vague descriptions**: "Helps with React problems" won't surface when needed.
- **Unverified solutions**: Only extract what actually worked.
- **Documentation duplication**: Don't recreate official docs; link to them and add what's missing.
- **Stale knowledge**: Mark skills with versions and dates; knowledge can become outdated.

## Skill Lifecycle

Skills should evolve:

1. **Creation**: Initial extraction with documented verification
2. **Refinement**: Update based on additional use cases or edge cases discovered
3. **Deprecation**: Mark as deprecated when underlying tools/patterns change
4. **Archival**: Remove or archive skills that are no longer relevant

## Example: Complete Extraction Flow

**Scenario**: While debugging a Next.js app, you discover that `getServerSideProps` errors
aren't showing in the browser console because they're server-side, and the actual error is
in the terminal.

**Step 1 - Identify the Knowledge**:

- Problem: Server-side errors don't appear in browser console
- Non-obvious aspect: Expected behavior for server-side code in Next.js
- Trigger: Generic error page with empty browser console

**Step 2 - Research Best Practices**:
Search: "Next.js getServerSideProps error handling best practices 2026"

- Found official docs on error handling
- Discovered recommended patterns for try-catch in data fetching
- Learned about error boundaries for server components

**Step 3-5 - Structure and Save**:

**Extraction**:

```markdown
---
description: |
  Use when debugging Next.js server-side errors. Triggers: (1) Page shows generic
  error but browser console is empty, (2) API routes return 500 with no details,
  (3) Server-side code fails silently. Check terminal/server logs instead of browser.
---

# Next.js Server-Side Error Debugging

## Problem

Server-side errors in Next.js don't appear in the browser console, making
debugging frustrating when you're looking in the wrong place.

## Context / Trigger Conditions

- Page displays "Internal Server Error" or custom error page
- Browser console shows no errors
- Using getServerSideProps, getStaticProps, or API routes
- Error only occurs on navigation/refresh, not on client-side transitions

## Solution

1. Check the terminal where `npm run dev` is running—errors appear there
2. For production, check server logs (Vercel dashboard, CloudWatch, etc.)
3. Add try-catch with console.error in server-side functions for clarity
4. Use Next.js error handling: return `{ notFound: true }` or `{ redirect: {...} }`
   instead of throwing

## Verification

After checking terminal, you should see the actual stack trace with file
and line numbers.

## Notes

- This applies to all server-side code in Next.js, not just data fetching
- In development, Next.js sometimes shows a modal with partial error info
- The `next.config.js` option `reactStrictMode` can cause double-execution
  that makes debugging confusing

## References

- [Next.js Data Fetching: getServerSideProps](https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props)
- [Next.js Error Handling](https://nextjs.org/docs/pages/building-your-application/routing/error-handling)
```

## Integration with Workflow

### Automatic Trigger Conditions

Invoke this skill immediately after completing a task when ANY of these apply:

1. **Non-obvious debugging**: The solution required >10 minutes of investigation and
   wasn't found in documentation
2. **Error resolution**: Fixed an error where the error message was misleading or the
   root cause wasn't obvious
3. **Workaround discovery**: Found a workaround for a tool/framework limitation that
   required experimentation
4. **Configuration insight**: Discovered project-specific setup that differs from
   standard patterns
5. **Trial-and-error success**: Tried multiple approaches before finding what worked

### Explicit Invocation

Also invoke when:

- User runs `/learn` to review the session
- User says "save this as a skill" or similar
- User asks "what did we learn?"

### Self-Check After Each Task

After completing any significant task, ask yourself:

- "Did I just spend meaningful time investigating something?"
- "Would future-me benefit from having this documented?"
- "Was the solution non-obvious from documentation alone?"

If yes to any, invoke this skill immediately.

Remember: The goal is continuous, autonomous improvement. Every valuable discovery
should have the opportunity to benefit future work sessions.
