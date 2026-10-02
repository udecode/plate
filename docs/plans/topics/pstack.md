# Plate on pstack

Page: https://claude.ai/artifact/P2PqUfp91Yani3Jy8tDPFD

plate-2's agent workflow before pstack (git `HEAD` before 2026-09-30) and now. Every plan below is one iteration of this subject.

## Public API

What to type today for each job, one line per command it replaced, in the order Hard cuts and app migration lists them, so a line can repeat and `retired` marks a command with no replacement. Plain words go to the matching playbook through poteto-mode's session hook.

The v2 loop: next item, review, plan and build.

```text
next
review <scope>, then again or interrogate
the verdict leads with today's and the proposed call site
plan <goal>
$plate-architecture [quick | deep | audit] <question>
$plate-architecture [quick | deep | audit] <question>
go
plan <goal>, then go; a long run uses /loop or /goal
describe the goal
```

Bugs, pull requests and cleanup.

```text
the report, screenshot or recording
diagnose <report>
the report, screenshot or recording
clean up PR <number>, or finish the current tree
clean up PR <number>
clean up <surface>
remove <feature>: Build with plate-architecture's Hard cut
```

Features, plugins, UI, docs and proof.

```text
plan <feature>, then go (plate-plugins feature delivery)
$plate-plugins <plugin>
$plate-ui <component>
$plate-docs <page>
$verify <surface>
$verify testing audit <scope>
```

Research and performance.

```text
$research full <area>
$research maintain <area>
$research <question>
$research audit <repo>
$research audit sync
$research harvest <repo>
$research harvest plan <lane> <report>
$benchmark <scope>, or describe the slowness (Perf issue playbook)
ask about Plite Autoresearch (benchmark's Autoresearch reference)
```

Public queue, releases and sync.

```text
$maintainer <scope>
$maintainer issue-draft <video or text>
$issue-harvester slate <update>
$issue-harvester <repo>
$changeset
$changeset (registry changelog reference)
$release-lanes
$plate-next <package>
$plate-architecture audit <scope>
$sync-shadcn parity <surface>
$sync-shadcn
$sync-plate-ui
$sync-vision
retired
```

Method skills. pstack's were vendored into `.agents/skills/`; they now come from the pinned pstack plugin, and shared workflow skills install globally from dotai.

```text
pstack:poteto-mode, also loaded by its session hook
pstack:how, pstack:why, pstack:teach, pstack:recall
pstack:interrogate, pstack:arena, pstack:architect, pstack:swarm
pstack:figure-it-out, pstack's Orchestrate playbook
pstack's Autonomous run: /loop in Claude Code, /goal in Codex
retired
pstack:tdd, pstack:no-comments, pstack:blast-radius
pstack:technical-writing, pstack:typescript-best-practices
pstack:show-me-your-work, pstack:reflect, pstack:setup-pstack
pstack:create-verification-skill, pstack:maintain-verification-skill
pstack:principle-* (23 skills, two of them new)
$grill-me (global)
retired
$gpt-pro (global)
$agent-native-reviewer (global)
the sync-pstack skill in dotai
pstack:thermo-nuclear-code-quality-review, pstack:unslop, pstack:deslop, $cross-review (global)
```

Unchanged: `best-api`, `benchmark`, `changeset`, `issue-harvester`, `maintainer`, `plate-docs`, `plate-next`, `plate-ui`, `release-lanes`, `sync-plate-ui`, `sync-shadcn`, `sync-vision`, `autoreview`, `optimise-github-actions`, `shadcn`, `tanstack-virtual`, `typescript-advanced-types`, `vercel-composition-patterns`, `vercel-react-best-practices`, `video-transcripts` and `walkthrough`.

Later iterations: the regression corpus, the prototype cut, model-invocable skills, plan pages and panel reviews.

```text
$verify corpus <surface or cases>
"prototype <idea>" in plain words (pstack's Prototype playbook)
typed, or loaded by the playbook that routes to them
node .agents/pstack/plan-page.mjs <plan>    (one page per subject: Topic: <slug>, or the first review_scopes entry in plate-2)
(nothing to type: big work runs /pstack:interrogate, then asks Build now / Another round / Hold)
(nothing to type: a Pursue verdict's record gets the same panel)
/pstack:interrogate on one commit in a detached worktree    (high-risk diffs)
interrogate reviewers: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
arena runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
decision-trail reviewer: a codex:gpt-6.1-sol @xhigh seat
node .agents/pstack/cross.mjs --to codex --model gpt-6-astra --effort high --timeout 1800 --prompt-file <file>    (one Codex seat)
$cross-review <plan>    (typed only)
```

## Hard cuts and app migration

Every command typed before pstack, each on the same line as what replaces it today.

The v2 loop: next item, review, plan and build.

```text before
$best-api-review            pick the next item
$best-api-review <scope>    judge an API
$wait-what                  before/after snippets
$task plan <goal>
$plate-plan <question>
$plite-plan <question>
$task execute <plan>
$task full <goal>
$task <goal>
```

```text after
next
review <scope>, then again or interrogate
the verdict leads with today's and the proposed call site
plan <goal>
$plate-architecture [quick | deep | audit] <question>
$plate-architecture [quick | deep | audit] <question>
go
plan <goal>, then go; a long run uses /loop or /goal
describe the goal
```

Bugs, pull requests and cleanup.

```text before
$patch <report>
$patch diagnose <report>
$diagnosing-bugs <report>
$autoclosure <PR or current tree>
$resolve-pr-feedback <PR>
$architecture-cleanup <surface>
$hard-cut <feature>
```

```text after
the report, screenshot or recording
diagnose <report>
the report, screenshot or recording
clean up PR <number>, or finish the current tree
clean up PR <number>
clean up <surface>
remove <feature>: Build with plate-architecture's Hard cut
```

Features, plugins, UI, docs and proof.

```text before
$plate-feature <feature>
$plate-plugin-creator <plugin>
$plate-ui <component>
$plate-docs <page>
$verify-plate <surface>
$testing audit <scope>
```

```text after
plan <feature>, then go (plate-plugins feature delivery)
$plate-plugins <plugin>
$plate-ui <component>
$plate-docs <page>
$verify <surface>
$verify testing audit <scope>
```

Research and performance.

```text before
$research-wiki full <area>
$research-wiki maintain <area>
$plite-research <question>
$editor-audit <repo>
$editor-audit sync
$editor-test-harvester <repo>
$editor-test-harvester plan <lane> <report>
$benchmark <scope>
$slate-ar
```

```text after
$research full <area>
$research maintain <area>
$research <question>
$research audit <repo>
$research audit sync
$research harvest <repo>
$research harvest plan <lane> <report>
$benchmark <scope>, or describe the slowness (Perf issue playbook)
ask about Plite Autoresearch (benchmark's Autoresearch reference)
```

Public queue, releases and sync.

```text before
$maintainer <scope>
$github-issue-reporter <video or text>
$clawsweeper <update>
$issue-harvester <repo>
$changeset
$registry-changelog
$release-lanes
$plate-next <package>
$plate-review <package>
$shadcn-parity <surface>
$sync-shadcn
$sync-plate-ui
$sync-vision
$slate-migration
```

```text after
$maintainer <scope>
$maintainer issue-draft <video or text>
$issue-harvester slate <update>
$issue-harvester <repo>
$changeset
$changeset (registry changelog reference)
$release-lanes
$plate-next <package>
$plate-architecture audit <scope>
$sync-shadcn parity <surface>
$sync-shadcn
$sync-plate-ui
$sync-vision
retired
```

Method skills. pstack's were vendored into `.agents/skills/`; they now come from the pinned pstack plugin, and shared workflow skills install globally from dotai.

```text before
$poteto-mode
$how, $why, $teach, $recall
$interrogate, $arena, $architect, $swarm
$figure-it-out, $orchestrator
$autogoal
$improve
$tdd, $no-comments, $blast-radius
$technical-writing, $typescript-best-practices
$show-me-your-work, $reflect, $setup-pstack
$create-verification-skill, $maintain-verification-skill
$principle-* (21 skills)
$grill-me
$grill-with-docs
$gpt-pro
$agent-native-reviewer
$maintain-workflow
(none)
```

```text after
pstack:poteto-mode, also loaded by its session hook
pstack:how, pstack:why, pstack:teach, pstack:recall
pstack:interrogate, pstack:arena, pstack:architect, pstack:swarm
pstack:figure-it-out, pstack's Orchestrate playbook
pstack's Autonomous run: /loop in Claude Code, /goal in Codex
retired
pstack:tdd, pstack:no-comments, pstack:blast-radius
pstack:technical-writing, pstack:typescript-best-practices
pstack:show-me-your-work, pstack:reflect, pstack:setup-pstack
pstack:create-verification-skill, pstack:maintain-verification-skill
pstack:principle-* (23 skills, two of them new)
$grill-me (global)
retired
$gpt-pro (global)
$agent-native-reviewer (global)
the sync-pstack skill in dotai
pstack:thermo-nuclear-code-quality-review, pstack:unslop, pstack:deslop, $cross-review (global)
```

Unchanged: `best-api`, `benchmark`, `changeset`, `issue-harvester`, `maintainer`, `plate-docs`, `plate-next`, `plate-ui`, `release-lanes`, `sync-plate-ui`, `sync-shadcn`, `sync-vision`, `autoreview`, `optimise-github-actions`, `shadcn`, `tanstack-virtual`, `typescript-advanced-types`, `vercel-composition-patterns`, `vercel-react-best-practices`, `video-transcripts` and `walkthrough`.

Later iterations: the regression corpus, the prototype cut, model-invocable skills, plan pages and panel reviews.

```text before
$patch corpus <surface or cases>
$prototype <idea>
maintainer, sync-vision, issue-harvester: only when typed
(no plan pages)
$cross-review <plan>    (every plan and execution, from either runtime)
(no hand-off for a verdict)
$autoreview    (high-risk diffs)
$interrogate    (vendored)
$arena    (vendored)
$show-me-your-work    (same-family trail review)
(no Codex seat)
$cross-review <plan>
```

```text after
$verify corpus <surface or cases>
"prototype <idea>" in plain words (pstack's Prototype playbook)
typed, or loaded by the playbook that routes to them
node .agents/pstack/plan-page.mjs <plan>    (one page per subject: Topic: <slug>, or the first review_scopes entry in plate-2)
(nothing to type: big work runs /pstack:interrogate, then asks Build now / Another round / Hold)
(nothing to type: a Pursue verdict's record gets the same panel)
/pstack:interrogate on one commit in a detached worktree    (high-risk diffs)
interrogate reviewers: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
arena runners: opus, codex:gpt-6-astra @high, codex:gpt-6.1-sol @xhigh
decision-trail reviewer: a codex:gpt-6.1-sol @xhigh seat
node .agents/pstack/cross.mjs --to codex --model gpt-6-astra --effort high --timeout 1800 --prompt-file <file>    (one Codex seat)
$cross-review <plan>    (typed only)
```

## Main changes

- **pstack runs the method.** poteto-mode, its playbooks and the pstack block in `AGENTS.md` own lifecycle, tests, review, plans and delivery; Plate skills keep only Plate knowledge. Claude Code runs Opus and Codex runs gpt-6.1-sol, and pstack's own panels bring in the other family.
- **Plate's lifecycle is project playbooks on pstack's.** Plan, Build, Bug fix, Refactoring, Perf issue, Babysit and API review extend pstack playbooks with anchored changes; a pstack upgrade that rewords an anchored step fails loudly, and a step that contradicts the block is replaced, not added to.
- **Fewer skills, each with one owner.** `research` absorbed editor audits and test harvests, `maintainer` issue drafting, `plate-plugins` feature delivery, `plate-architecture` the hard cut, the registry law and Plate Review's audit; failed-fix recovery lives only in the Bug fix playbook.
- **Every pre-pstack code-quality law the audits found is back** in the file an agent loads for that job, except the doctrine fingerprint rows and the P1 autoreview gate, which the block's Review rule replaces.
- **Gates block in code.** `plan-open.mjs` fails a Done plan on an unresolved gate row or an open box in a numbered step; `validate-benchmark-plan.mjs --complete` refuses missing or pending verification evidence.
- **pstack's panels get their model diversity back.** `interrogate` and `arena` seat Opus, gpt-6-astra at high and gpt-6.1-sol at xhigh instead of three Opus runs, so the adversarial signal comes from different models, as pstack designs it.
- **A Codex seat runs through `cross.mjs`, read-only.** `node .agents/pstack/cross.mjs --to codex --model <model> --effort <effort>` runs `codex exec --sandbox read-only` with hooks off on the filled prompt file, in both runtimes, and exits non-zero when the seat gives no answer, so the seat shows as missing.
- **Big work reviews itself and then asks you.** Public API or architecture changes, high-risk work, long or unattended runs, each project's `bigWork` and a best-api-review Pursue verdict's record get a panel round before the user is asked; a round with an applied critical finding earns one more, two at most. A plan then asks Build now, Another round or Hold; a small plan asks Build now or Hold.
- **cross-review and autoreview stop being stages.** High-risk code gets the panel on one commit in a detached worktree. Both skills stay installed for when you type them, and bare `cross-review` lists the latest finished sessions.
- **The page shows the review.** Each `seats` row in the decision log opens a panel round; the header tags the round count and the latest seats, and a review history at the bottom lists each round's findings by severity with what was applied and dismissed. `decisions-check.mjs` refuses a panel finding without a severity, before a `seats` row or without an applied or dismissed reason.
- **One page per subject, shared with Ellie.** `plan-page.mjs` is a sync-pstack helper; a plan joins its subject through `Topic:` or, in plate-2, its first review scope, and plate-architecture plans add the editor comparison, document shape, layer and owner, hard cuts and native proof sections.
- **A subject page shows the open plan's delta, then the result.** A plan carries its delta, `Delta`-marked rows and before and after pairs, under the subject's section titles; the subject file keeps the current state. The newest open iteration leads the page, and once every iteration is executed or Done the page shows the current state alone with the iterations as history. The renderer refuses a subject file with a pair in a paired section and a just-finished plan whose rows or calls the subject file does not show.
- **One status vocabulary, and no silent rollback.** `.agents/pstack/status.mjs` reads the first word of a `Status:` line for the page mode, the pill and plan-open's `--done` sweep, which checks every landed word. A sync from committed shared source refuses to overwrite a project last synced from uncommitted shared edits.
