- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.
- ALWAYS read and understand relevant files before proposing edits. Do not speculate about code you have not inspected.
- Never browse GitHub, use `gh` instead. Use `dig` skill when the user asks a question about a library, needs to understand a library's API, or when you need information about a library that you don't know about.
- Dirty workspace: Never pause to ask about unrelated local changes. Continue work and ignore unrelated diffs.
- Proactively use Skill(tdd) when it adds value; skip TDD for high-friction tests like slow React or browser flows.

## Skill Overrides

When using the following skills, override the default behavior.

`planning-with-files`:

- Do not create `task_plan.md`, `findings.md`, or `progress.md` at repo root. Merge that content into one file under `.claude/docs/plans/`. Example: `.claude/docs/plans/2026-03-11-task.md`

`agent-browser`:

- Never close agent-browser
- Use `--headed` only if you failed to test and need manual input from a human.
- Port `3000` for the main app.
- Use `agent-browser` instead of next-devtools browser evaluation.
- If `agent-browser` gets blocked or loops on the same step, stop and ask the user to unblock.

`ce-*`:

- **Git:** Never git add, commit, push, or create PR unless the user explicitly asks.
- **PR:** Before creating or updating a PR, run the local verification that actually matters here. At minimum: `bun run typecheck`, `bun run lint:fix`, and `bun run build` if the task touched app behavior or build config.
- **plan:** Include test-browser in acceptance criteria for browser features.
- **deepen-plan:** Context7 only when not covered by skills.
- **work:** UI tasks require browser verification before marking complete. Never guess.

## Commands

### Development

**CRITICAL**: Before running type checking, install dependencies and finish any required build first.

**Required sequence for app verification:**

1. `bun install` - Install dependencies and refresh the lockfile if needed.
2. `bun run build` - Run the build when the task touches app behavior, config, or anything build-sensitive.
3. Wait for the build command to finish successfully. Never run build and typecheck in parallel.
4. `bun run typecheck` - Run TypeScript type checking.
5. `bun run lint:fix` - Auto-fix linting issues.

**Common commands:**

- `bun run dev` - Start the app locally.
- `bun run build` - Production build.
- `bun run typecheck` - TypeScript check.
- `bun run lint:fix` - Auto-fix lint issues.

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
• Avoid unnecessary `bun dev`
• Use Skill(agent-browser) for browser testing instead of next-devtools browser evaluation

**Verification Checklist:**

- [ ] Typecheck (IF updated .ts files): Bash `bun run typecheck`
- [ ] Lint: Bash `bun run lint:fix`
- [ ] Build (IF updated app behavior or config): Bash `bun run build`
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
