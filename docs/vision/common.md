# Common Vision

Shared doctrine for Plate, Slate, and agent workflows.

Root `VISION.md` is the mandatory first read. This file carries the fuller
common doctrine after the lane is selected.

## Taste

- Best long-term architecture beats the nearest symptom patch.
- Package/runtime ownership beats example glue when the bug is systemic.
- Examples should expose the real API and DX at the call site.
- Breaking changes are acceptable when they produce the better API, behavior,
  or performance shape.
- No fake aliases, no fake compatibility, no hidden migration story in docs.
- Public docs describe the current API only.
- Conventions are API surface: names, flags, config keys, persisted fields,
  output shapes, docs examples, and workflow keywords must be intentional,
  stable, and worth their long-term compatibility cost.
- Do not hide latency behind debounce, delayed repair, or benchmark tricks.
- Do not call browser/editor behavior correct from model-only proof.
- Do not call perf closed from rerender/locality evidence alone.
- Do not call live/external behavior fixed from screenshots, issue text, or AI
  rationale alone. Use live proof or equivalent local proof; if blocked, name
  the exact missing account, API access, credential, device, route, or command.
- Do not call release-ready when only a scoped claim is green.
- For batch automation, stack soft stopping checkpoints and ask at the final
  handoff so the user can unblock many decisions in one reply.
- Be blunt. If the current tactic is weak, pivot instead of polishing it.

## Claim Width

| Claim | Minimum proof |
| --- | --- |
| current source behavior | source read plus focused command or source audit |
| user-visible browser behavior | real browser or Playwright proof matching the interaction |
| editor selection/caret behavior | model selection plus native DOM/window selection or geometry proof |
| performance | honest metric target, baseline/latest/best, and correctness guard |
| mobile viewport behavior | Playwright/mobile semantic proof, explicitly scoped |
| raw mobile/device behavior | real device/Appium/equivalent artifacts |
| release-ready | release gate, package artifacts, docs/API proof, and scoped caveats |
| issue/PR closure | live GitHub state, duplicate/claim guard, current source proof, and authority |

## Boundary Law

- Slate packages are the raw editor substrate: model, operations, runtime,
  DOM/input, selection, history, browser proof, and unopinionated APIs.
- Plate packages are the product/editor framework layer: plugins, React
  wrappers, components, kits, opinionated UX, examples, and app-facing docs.
- Do not fix a Plate product concern by polluting Slate core.
- Do not hide a Slate primitive gap in Plate glue.
- Cross-boundary work must name both owners and prove the handoff.
- Product packaging matters, but it never gets to corrupt core/runtime layers.

## Evidence Hierarchy

1. Live source/tests/benchmarks for current behavior.
2. Real browser proof for local routes when the problem is visible.
3. Replayable Playwright or package tests for the bug class.
4. Benchmark targets with fair legacy/current comparison when perf is claimed.
5. Current docs for accepted claim width.
6. Research decisions for durable architecture context.
7. Old plans only as historical context unless they are the active plan.
8. Chat memory last.

Executable tests outrank prose docs for behavior claims. Prose docs outrank
tests for package ownership, API intent, and public teaching surfaces.

## Automation Doctrine

- Long-running automation must repair tests, metrics, skills, and docs while it
  works. A plan note without a future behavior change is archaeology.
- Public repo maintenance is a control-plane job. `$maintainer` owns
  issue/PR/security queue scans, heartbeat runs, VISION fit, duplicate/claim
  guards, owner routing, proof gates, authority boundaries, and decision-ready
  handoffs. Execution belongs to narrower owners.
- Repo-wide architecture cleanup is a source-backed cleanup job before it is an
  implementation job. `$architecture-cleanup` ranks delete, merge, inline,
  simplify, split, keep, defer, and reject decisions for shallow modules, split
  ownership, testability gaps, over-splits, and agent-navigation friction, then
  either applies a safe behavior-neutral packet or routes broader decisions to
  `major-task`, `slate-plan`, `plate-plan`, `auto`, or a package owner.
- Public issue and PR bodies are maintainer-agent input contracts. Plate/Slate
  maintenance runs through local Codex sessions in maintainer checkouts, not
  hosted API bots, crabbox, or background cloud workers. Require public repro,
  proof, risk, owner surface, current blocker, and next-action state before an
  item is called agent-ready.
- Contributor automation should improve intake quality, not create hidden
  authority. PR templates, issue forms, and security policy are part of the
  agent control plane because future local Codex runs read them first.
- Maintainer standing orders are local and narrow. A heartbeat is one local
  Codex activation: scan the smallest useful public queue slice, pick at most
  one safe item, verify live state and authority, then route, execute a safe
  local slice, or hand off a decision-ready brief. It is not a daemon, not a
  cloud worker, and not permission to mutate GitHub without explicit authority.
- Maintainer queue state should be explicit: refresh `docs/maintainer/queue.md`
  through the queue snapshot script, treat it as a ranking ledger rather than
  truth, then write `docs/maintainer/runs/*` only when the run creates state
  future Codex sessions should not rediscover.
- Versioned queue docs must redact private advisory details. Sensitive GHSA
  content belongs in live GitHub or local ignored artifacts, not committed
  ledgers.
- Standing orders should make Codex less prompt-dependent, not less
  accountable. Every autonomous maintainer action needs a scope, trigger,
  approval gate, escalation rule, verification surface, and short report.
- `$auto` is internal Plate/Slate quality supervision: behavior, visual proof,
  perf, API cleanup, benchmark/test repair, docs consolidation, and skill
  repair. It must not become the public GitHub queue brain.
- `$auto` may still be the ergonomic user-facing router. `auto PR #123`,
  `auto issue #123`, `auto all PRs/issues`, and `auto security` route to
  `$maintainer`; `auto current tree` and `auto post-merge` route to
  `$autoclosure`; `auto slate` and `auto plate packages` stay in `$auto`.
  Routing convenience is not ownership transfer.
- `$autoclosure` is post-merge/current-tree until-clean closure for already
  applied work. It loops like `autoreview`, patches safe findings, reruns proof,
  and stops only when no accepted actionable findings remain or a real boundary
  appears.
- Source-backed pure improvements may be applied autonomously when they stay
  inside root `VISION.md`. Ask only when the change alters taste, product/API
  direction, human authority, skill topology, security, release policy, or an
  irreversible side effect.
- Maintainer automation is live-state-first. Before issue/PR closure,
  duplicate calls, agent handoff, or ready-to-merge claims, read the thread,
  related items, current source, proof, and owner instructions. Titles,
  labels, matrices, and generated rows are routing hints only.
- Agent-maintainer loops must keep a duplicate guard and a claim/owner guard:
  skip existing PRs, active branches, active assignees, and recently claimed
  work unless the user explicitly asks to take over.
- Creating or updating skills from another repo is allowed only when the
  recurring local workflow is proven, the destination owner is named, and the
  first validation command does not require cloud-only infrastructure.
- Repo-local skills should be repo-specific. Generic shared workflows belong in
  global skills or the synced dotai owner; do not create wrapper skills that
  only rename an existing owner.
- Multi-step automation should be deterministic and resumable where possible.
  It must stop at explicit approval boundaries and never auto-approve payments,
  external sends/posts, credential use, destructive operations, or other
  irreversible user-authority actions.
- Agent and harness integrations must preserve the underlying harness's
  authentication, session, permission, and tool boundary. Do not reimplement
  model transport or claim stronger isolation than the harness actually
  provides.
- If a workflow exposes machine-readable output, parse the structured envelope
  and fail clearly on explicit error/approval statuses instead of scraping prose
  or guessing continuation.
- All issue/test harvests are issue-by-issue when the prompt says "all".
  Clusters and matrices are routing checkpoints, not completion.
- Every relevant issue needs a checkmark: existing local test linked and
  verified, new test written and verified, Plate-owned proof linked, or
  explicit defer owner recorded.
- External editors are pressure sources, not architecture to clone. Translate
  their lessons into local model, operation, selection, DOM, browser, and
  package-owner proof vocabulary.
- Research is a compiled agent layer, not a scrapbook: stable paths, one
  concept per file, outward claims, durable promotion only.

## User Correction Patterns

- "This is still slow" usually means the measured lane missed the visible user
  operation.
- "WTF" on editor behavior means reproduce with real mouse/keyboard/browser
  interactions before theory.
- "Only uncommitted" means do not summarize older branch history.
- "No debounce bullshit" means a faster-looking metric is rejected if the user
  can still see delayed work.
- "Long term most precise and performant" means choose architecture/API owner,
  not another local example condition.
- "Bug report" means patch/repro first unless the user explicitly asks for a
  plan.
- "Make it perfect" means stabilize behavior first, then improve perf, then
  clean API/DX, then prove readiness.
- Repeated "go next" expects one best next owner, not a menu.
- "Batch loop" means keep working through safe alternate owners and collect
  unblock questions for the end.

## Self-Grill Red Flags

Run this before answering, patching, closing a loop, or calling a lane green
when the user asks for "absolute best", "replace me", "perfect", "harsh
honest", "all next", "go next", or reports visible editor weirdness.

- Did I open the exact route, strategy, row count, browser, and interaction the
  user named?
- Did I test like a real editor user: click, double-click, drag, margin click,
  selection, Enter burst, fast typing, undo/redo, scroll away/back, copy/paste,
  and follow-up type where relevant?
- If the bug is visual, did I capture screenshot/geometry or first-party
  browser proof instead of trusting model state?
- Did I add or improve a reusable oracle for the whole class?
- Did I compare the right perf lane against legacy/current, p95/hot path
  metrics, and correctness guardrails, with no debounce theater?
- Is the fix at the package/runtime/public API owner, or am I hiding a systemic
  issue in an example?
- If browser proof needed repeated actions or assertions, did I promote them
  into the proof harness or record why not?
- If workflow missed, did I patch the owning `.agents/rules/**` file?
- Did I avoid branch, finalizer, commit, PR, or cross-repo surprises unless the
  user explicitly asked?
- If the corpus is huge, did I split into checkpoints and write artifacts
  instead of dumping output into context?

## Repair Policy

- runtime bug -> patch owner skill/package;
- missing oracle -> patch/tdd owner;
- missing or lying metric -> benchmark target/script repair;
- weak visual proof -> Browser, screenshot, Playwright geometry proof, or a
  reusable proof-harness helper when the pattern should become first-class;
- stale docs/decision memory -> update root `VISION.md` or the relevant
  `docs/vision/*.md`;
- bad API -> plan or accepted implementation;
- wrong/missing/overlapping skill -> patch `.agents/rules/**`, sync, verify;
- output-budget miss -> split the goal into smaller checkpoints.

Learning is only real when future loop behavior changes.

## Durable Intent Capture

- If code changes reveal or change how a subsystem is supposed to work, update
  the smallest durable owner: root vision, a `docs/vision/*` detail file,
  behavior spec, package docs, benchmark target, or owning skill/rule.
- Do not bury important invariants only in PR text, chat final handoffs, or
  temporary plans.
- Public docs explain current user/operator behavior. Internal "why this must
  work this way" belongs in the durable owner that future agents will read.
