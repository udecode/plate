## Packages

- DX: Optimize for the absolute best developer experience. JSDoc must be first-class for agents. Every API surface should be intuitive for both humans and AI agents.
- Docs: NEVER write changelog-style language ("has been removed", "new feature", "previously", "now supports"). Docs are user-facing reference for the LATEST state only. Write as if no prior version exists. No migration notes, no "what changed" — just document what IS. Follow .claude/docs/solutions/style.md for writing tone/structure.
- Always use @.claude/commands/changeset.md when updating packages to write a changeset before completing
- Use tdd skill for package updates that add or change live behavior.
- Do not write TDD cases for dead code/legacy removal assertions (for example: "should not contain old API X anymore"). Remove the dead path directly and keep tests focused on current behavior.
- Prefer inline when used once; extract constants only when reused.

## General

- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- ALWAYS read and understand relevant files before proposing edits. Do not speculate about code you have not inspected.
- Internal agent docs live under `.claude/docs/`, not `docs/`. Put solution docs in `.claude/docs/solutions/` and plans in `.claude/docs/plans/`.
- Never browse GitHub, use `gh` instead. Use `dig` skill when the user asks a question about a library, needs to understand a library's API, or when you need information about a library that you don't know about.
- Dirty workspace: Never pause to ask about unrelated local changes. Continue work and ignore unrelated diffs.
- Proactively use Skill(tdd) when it adds value; skip TDD for high-friction tests (hard setup or slow React/UI flows).

## Skill Overrides

When using the following skills, override the default behavior.

`planning-with-files`:

- Do not create `task_plan.md`, `findings.md`, or `progress.md` at repo root. Merge that content into one file under `.claude/docs/plans/`. Example: `.claude/docs/plans/2026-02-07-fix-schema.md`

`agent-browser`:

- Never close agent-browser
- Use `--headed` only you failed to test and need manual input from human.
- Port 3000 for main app
- Use `agent-browser` instead of Do NOT use next-devtools `browser_eval` (overlaps with agent-browser)
- If `agent-browser` gets blocked or loops on the same step, stop and ask the user to unblock. After the unblock works:
  - [Add browser learning]

`ce-*`:

- **Git:** Never git add, commit, push, or create PR unless the user explicitly asks.
- **PR:** Before creating or updating a PR, run `bun check`. If it fails, stop and fix it or report the blocker. Do not open a PR with failing `bun check` unless the user explicitly says to.
- **plan:** Include test-browser in acceptance criteria for browser features
- **deepen-plan:** Context7 only when not covered by skills
- **work:** UI tasks require test-browser BEFORE marking complete. Never guess.

## Commands

### Development

**CRITICAL**: Before running type checking, you must first install dependencies and build the affected packages and their dependencies.

**Required sequence for type checking modified packages:**

1. `pnpm install` - Install all dependencies and update lockfile if needed
2. `pnpm turbo build --filter=./packages/modified-package` - Build only the modified package and its dependencies
3. Wait for the build command to finish successfully. Never run build and typecheck in parallel.
4. `pnpm turbo typecheck --filter=./packages/modified-package` - Run TypeScript type checking for modified package
5. `pnpm lint:fix` - Auto-fix linting issues

**For multiple modified packages:**

```bash
# Build multiple specific packages and their dependencies
pnpm turbo build --filter=./packages/core --filter=./packages/utils

# Wait for build to finish, then typecheck the same packages
pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils

# Lint multiple packages
pnpm lint:fix
```

**Alternative approaches:**

```bash
# Build since last commit (useful for PR changes)
pnpm turbo build --filter='[HEAD^1]'

# Build all changed packages in current branch
pnpm turbo build --filter='...[origin/main]'

# For workspace-specific operations
pnpm --filter @platejs/core build
pnpm --filter @platejs/core typecheck
pnpm --filter @platejs/core lint:fix
```

**Full project commands (use only if needed, these are very slow):**

- `pnpm build` - Build all packages (only use when necessary)
- `bun run test` - Run the fast default test suite during iteration
- `bun test` - Run the full test suite only at the end of the complete task

## Prompt Hook

### Mandatory First Response

🚨 STOP - SKILL ANALYSIS IS MANDATORY

**Instructions:**
• DO NOT edit until skill analysis is complete.
• Use `TodoWrite` only if that tool is available in the current runtime.
• If `TodoWrite` is unavailable, run the same checklist inline.
• Condition NO -> mark completed -> proceed
• Condition YES -> work through steps -> mark completed -> proceed
• Skipping skill analysis = FAILED to follow instructions

**Skill Analysis Checklist:**
☐ Skill analysis (SKIP if 'quick' in message): (1) STOP rationalizing ('simple question', 'overkill', 'might be relevant') (2) List ALL available skills (3) For EACH: 'always apply' or 'Does task involve [topic]?' -> YES/MIGHT/MAYBE = ✓. Only ✗ if DEFINITELY not related (4) Skill(...) for ALL ✓ IN ONE PARALLEL CALL - do NOT load one then wait (5) Output '[Skills: X available, Y loaded: name1, name2]' CRITICAL: 'Might be relevant' = MUST load. '1% chance' = MUST load.

### Verification Checklist

🔒 VERIFICATION REQUIRED - NO COMPLETION WITHOUT FRESH EVIDENCE

**Instructions:**
• Track ALL verification items below (use `TodoWrite` if available, otherwise inline)
• Condition NO -> mark completed and skip
• Condition YES -> in_progress -> verify -> completed
• NEVER git commit unless explicitly asked
• Avoid unnecessary `bun dev` or `bun run build`
• Use Skill(agent-browser) for all browser testing instead of next-devtools browser_eval

**Verification Checklist:**

- [ ] Typecheck (IF updated .ts files): Bash `bun typecheck`
- [ ] Lint: Bash `bun lint:fix`
- [ ] PR gate (IF creating/updating a PR): Bash `bun check`
- [ ] ce-compound (SKIP if trivial): CRITICAL: After completing this request, you MUST evaluate whether it produced extractable knowledge. EVALUATION PROTOCOL (NON-NEGOTIABLE): (1) COMPLETE the user's request first (2) EVALUATE - Did this require non-obvious investigation or debugging? Was the solution something that would help in future similar situations? Did I discover something not immediately obvious from documentation? (3) IF YES to any: Skill(ce-compound) NOW after the fix is verified and follow its workflow to capture the solution in `docs/solutions/` (4) IF NO to all: Skip - no extraction needed This is NOT optional. Failing to evaluate = valuable knowledge lost.

### Post Compact Recovery

🚨 CONTEXT WIPED - MANDATORY SKILL RELOAD

**Instructions:**
• STOP. Context compaction DELETED all skills. You FORGOT everything.
• DO NOT proceed until skill reload complete
• DO NOT assume you remember skills - they are GONE
• Skipping = GUARANTEED FAILURE

**Skill Reload Checklist:**
☐ Skill reload (MANDATORY): (1) Check current task tracking (TodoWrite if available, otherwise inline) (2) List ALL available skills (3) For EACH: 'always apply' or 'Does task involve [topic]?' -> YES/MIGHT/MAYBE = ✓ (4) Skill(...) for ALL ✓ IN ONE PARALLEL CALL - do NOT load one then wait (5) ONLY after reload, resume task CRITICAL: ALL skills GONE. MUST reload. 'Might apply' = MUST load.
