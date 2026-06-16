# Vision

This is the mandatory first read for Plate and Slate direction.

Root `VISION.md` keeps the essential doctrine every agent must see. Detailed
owner doctrine lives in `docs/vision/*.md`; read only the relevant detail file
after this root file.

The `vision` skill is only a router. Do not maintain doctrine in a skill body.
When reusable taste, architecture, proof, or automation doctrine changes,
update this file and the relevant `docs/vision/*.md` file.

## Detail Files

- `docs/vision/common.md`: shared taste, proof, automation, research,
  maintainer policy, correction patterns, repair, and consolidation.
- `docs/vision/slate.md`: Slate substrate, API/runtime/browser/perf doctrine,
  proof hierarchy, and Slate skill topology.
- `docs/vision/plate.md`: Plate framework/product doctrine, plugin/component
  policy, docs/API ownership, security, AI, setup, and non-merge lines.
- `docs/vision/sync.md`: `sync-vision`, baseline advancement, classification,
  and taste capture.

## How To Use

Read this before changing reusable architecture, public APIs, editor behavior,
automation loops, maintainer issue/PR policy, or Slate/Plate boundaries.

Use active plans for run-specific evidence. Use this file and the relevant
detail file for durable direction.

## Common Essentials

- Best long-term architecture beats the nearest symptom patch.
- Package/runtime ownership beats example glue when the bug is systemic.
- Breaking changes are acceptable when they produce the better API, behavior,
  or performance shape.
- No fake aliases, no fake compatibility, no hidden migration story in docs.
- Public docs describe the current API only.
- Names, flags, config keys, output shapes, docs examples, and workflow
  conventions are API surface. Add fewer conventions, make them clearer, and
  do not churn them casually.
- Do not hide latency behind debounce, delayed repair, or benchmark tricks.
- Do not call browser/editor behavior correct from model-only proof.
- Do not call perf closed from rerender/locality evidence alone.
- Do not call a live/external behavior fixed without live proof or an
  equivalent local proof. If proof is blocked, name the exact missing access,
  account, credential, device, route, or command.
- Be blunt. If the current tactic is weak, pivot instead of polishing it.

### Boundary Law

- Slate packages are the raw editor substrate: model, operations, runtime,
  DOM/input, selection, history, browser proof, and unopinionated APIs.
- Plate packages are the product/editor framework layer: plugins, React
  wrappers, components, kits, opinionated UX, examples, and app-facing docs.
- Do not fix a Plate product concern by polluting Slate core.
- Do not hide a Slate primitive gap in Plate glue.
- Cross-boundary work must name both owners and prove the handoff.

### Evidence Order

1. Live source/tests/benchmarks for current behavior.
2. Real browser proof for visible local routes.
3. Replayable Playwright or package tests for the bug class.
4. Benchmark targets with fair legacy/current comparison for perf claims.
5. Current docs for accepted claim width.
6. Research decisions for durable architecture context.
7. Old plans only as historical context unless they are active.
8. Chat memory last.

Executable tests outrank prose docs for behavior claims. Prose docs outrank
tests for ownership, API intent, and public teaching surfaces.

### Automation Essentials

- Long-running automation must repair tests, metrics, skills, and docs while it
  works. A plan note without a future behavior change is archaeology.
- Public repo maintenance is owned by `$maintainer`: issue/PR/security queue,
  heartbeat, VISION fit, duplicate/claim guard, owner routing, proof gates, and
  authority boundaries. `$slate-auto` stays the internal Slate quality
  supervisor.
- Public issue and PR bodies are maintainer-agent input contracts. Plate/Slate
  maintenance runs through local Codex sessions in maintainer checkouts, not a
  hosted API bot that can infer private context. Require enough public repro,
  proof, risk, and next-action state to route or stop cleanly.
- Maintainer heartbeat state should be durable and boring: queue snapshot,
  candidate matrix, selected owner, proof path, authority boundary, run note
  when useful, and next heartbeat. Chat memory is not the queue ledger.
- Private security advisory details must not leak into versioned queue docs.
  Keep public/versioned ledgers redacted and read sensitive details from live
  GitHub or local ignored artifacts.
- Source-backed pure improvements may be applied autonomously when they stay
  inside this vision. Ask only when the change alters taste, product/API
  direction, human authority, skill topology, security, release policy, or an
  irreversible side effect.
- Multi-step automation must carry resumable state and stop at real approval
  boundaries. Never auto-approve payments, external sends/posts, credential
  use, destructive operations, or other irreversible user-authority actions.
- Agent/harness integrations must preserve the harness's authentication,
  session, permission, and tool boundary. Do not reimplement model transport or
  claim stronger isolation than the underlying harness provides.
- All issue/test harvests are issue-by-issue when the prompt says "all".
  Clusters and matrices are routing checkpoints, not completion.
- Every relevant issue needs a checkmark: existing local test linked and
  verified, new test written and verified, Plate-owned proof linked, or
  explicit defer owner recorded.
- External editors are pressure sources, not architecture to clone.
- Research is a compiled agent layer, not a scrapbook.

### User Correction Patterns

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

## Slate Essentials

Slate is the raw editor substrate. It must stay unopinionated, precise, and
boring in the best way: document model, operations, runtime, input, DOM,
selection, history, browser proof, package API, and benchmarks.

- Preserve Slate's simple document model and operations as truth; do not let
  React define the core ontology.
- Public API should teach `editor.read`, `editor.update`, `state`, `tx`,
  extension groups, commit listeners, and projection sources.
- Primary-root APIs do not expose a public `main` key. The primary document is
  addressed by omission; explicit roots are for additional roots only.
- Slate stays unopinionated. Plate owns product opinion.
- Do not keep legacy APIs alive just because they are familiar.
- Behavior should be profile-driven. Capabilities expose what can happen;
  behavior profiles decide when it applies.
- Page layout is not core editor truth. Active caret, selection, and
  composition stay on the native/browser editing path.
- Browser editing claims require model, DOM, selection/caret where observable,
  focus owner, legal trace, replayability, and follow-up typing.
- Behavior before perf. Visual proof before green visible-UI claims. Keep perf
  packets only when correctness stays green.
- Degraded huge-document modes stay degraded until native behavior is proved.

Read `docs/vision/slate.md` for the full Slate doctrine.

## Plate Essentials

Plate is the editor framework that ships in apps. It owns plugins, wrappers,
components, kits, app-facing docs, product ergonomics, and opinionated UX built
on top of Slate-first primitives.

- Plate should make Slate-based editors practical to build and maintain without
  taking away schema, UI, or app ownership.
- Keep Plate core unopinionated enough for framework use. Opinionated product
  behavior belongs in packages, kits, examples, or docs.
- A behavior, API, or gate change needs an adoption story. "Cleaner" alone is
  not enough.
- Public docs must be source-backed, current-state only, and readable by humans
  and agents.
- Plugin and feature pages are headless first. UI components are render
  examples unless source proves they own behavior.
- Optional capability should usually ship as packages, plugins, registry code,
  or app-owned components, not core.
- Plate can re-export Slate surface where it improves DX, but bugs that
  reproduce in plain Slate belong to Slate.
- Security is about explicit trust boundaries and sane defaults. Do not hide
  trust decisions behind convenience abstractions.
- AI support stays optional, composable, and plugin-first.

Read `docs/vision/plate.md` for the full Plate doctrine.

## Decision Consolidation

Use the smallest durable target:

- active goal plan for run-specific findings;
- root `VISION.md` for mandatory essential taste and routing;
- `docs/vision/*.md` for owner-specific reusable doctrine;
- Slate docs for accepted Slate v2 architecture/proof/release claim width;
- Plate docs for accepted Plate behavior/API/docs decisions;
- research docs for durable architecture conclusions and vocabulary;
- benchmark target registries for metric/control-plane truth;
- `.agents/rules/**` for reusable agent workflow policy.

Write latest-state rules, accepted tradeoffs, rejected alternatives, proof
commands, and next owners. Do not write public changelog prose. Consolidate
only reusable decisions.
If code changes reveal or change durable subsystem intent, update the smallest
owning spec, vision detail, skill, or docs owner instead of burying the "why"
only in PR text or a final handoff.
