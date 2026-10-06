# Vision

This is the mandatory first read for Plate and Plite direction.

Root `VISION.md` keeps the essential doctrine every agent must see. Detailed owner doctrine lives in `docs/vision/*.md`; read only the relevant detail file after this root file.

Durable product doctrine belongs here and in `docs/vision/*.md`; the routing in `AGENTS.md` sends work to the operational skills that apply it. When reusable taste, architecture, proof, or automation doctrine changes, update the smallest relevant owner. Record each latest-state rule with its accepted tradeoffs, rejected alternatives, proof commands and next owner, consolidate only reusable decisions, and never leave a durable rule only in PR text, a handoff or a temporary plan. Promote a rule to this file only when every agent must see it first: global taste, source order, cross-boundary law, essential Plite or Plate direction, proof standards or stop conditions. Put the rest in the smallest detail file, and keep command output, route state, branch history, raw issue text and artifact paths in plans.

## Detail Files

- `docs/vision/common.md`: the redesign method, shared API taste, claim width and boundary law.
- `docs/vision/plite.md`: Plite substrate, API/runtime/browser/perf doctrine, proof hierarchy, and Slate skill topology.
- `docs/vision/plate.md`: Plate framework/product doctrine, plugin/component policy, docs/API ownership, security, AI, setup, and non-merge lines.

## How To Use

Read this before changing reusable architecture, public APIs, editor behavior, or Plite/Plate boundaries.

Use active plans for run-specific evidence. Use this file and the relevant detail file for durable direction.

## Next beta: Redesign from First Principles

**Redesign from First Principles is the governing principle of `next`.** Start every API or architecture plan, review and feedback decision from the current user job and hard laws: what would we build if these requirements had been present from the start? Apply the full principle (`pstack:principle-redesign-from-first-principles`) and its [Plate decision method](docs/vision/common.md#redesign-from-first-principles).

Existing and proposed APIs, owners, layers and packages must earn their place. Choose the strongest materially justified target, including deletion or replacement, before planning adoption. During beta, compatibility, migration convenience and implementation difficulty affect sequencing, never the target. Preserve hard correctness, security, serialized-data, native-behavior and runtime laws, plus explicit user constraints. Reuse sound decisions while their requirements and evidence hold; prove any adopted change through its real owner.

## Invariants

No cut, plan or review drops these four laws. Each names what enforces it today; a part marked rule-only rests on review, not a script.

1. **Hard cuts over compatibility.** A breaking change or hard cut beats an alias, shim, wrapper or deprecated second name. `plate/no-second-name` enforces it for renames (`AGENTS.md`'s Rules and enforcement); the architecture reference's Hard cut, run through the Build playbook, and `best-api`'s hard-cut gate hold the rest, which is rule-only.
2. **Redesign from first principles, then KISS.** Every API or architecture target starts from the current user job and hard laws and takes the simplest target that earns its place, as Next beta above says. `best-api`, the API review playbook and the `api-plan` reviews row (`architect`, then a panel) apply it; it is rule-only.
3. **No infinite roadmap.** Every plan closes, and nothing stays later without an owner and a stop. `.agents/pstack/plan-open.mjs`, which the lead runs before marking a plan Done, refuses an unchecked box, a placeholder and a deferred or open finding without `owner:`; plan closure itself and the stop condition are rule-only.
4. **Verifiability.** Every claim names the check that proves it. `.agents/pstack/decisions-check.mjs` refuses a fixed, verified or proven decision row without `scope:`, and `AGENTS.md`'s Rules and enforcement table names each code rule's enforcer; behavior claims follow `docs/vision/common.md`'s Claim Width, and other claims are rule-only.

## Common Essentials

- Package/runtime ownership beats example glue when the bug is systemic.
- No fake aliases, no fake compatibility, no hidden migration story in docs.
- Public docs describe the current API only.
- Names, flags, config keys, output shapes, docs examples, and workflow conventions are API surface. Add fewer conventions, make them clearer, and do not churn them casually.
- Public subpaths use the shortest truthful domain noun. Prefer one established word when it completely names the user job; never shorten into ambiguity.
- Public API design starts from ideal call sites. Current code, compatibility, machinery, ecosystem precedent, and accepted plans are evidence and adoption cost, not requirements. Use `best-api` to choose or review the target before a layer plan turns it into implementation.
- Do not hide latency behind debounce, delayed repair, or benchmark tricks.
- Do not call browser/editor behavior correct from model-only proof.
- Do not call perf closed from rerender/locality evidence alone.
- Do not call a live/external behavior fixed without live proof or an equivalent local proof. If proof is blocked, name the exact missing access, account, credential, device, route, or command.
- Be blunt. If the current tactic is weak, pivot instead of polishing it.

### Boundary Law

- `plitejs` is the raw editor distribution: model, canonical document changes, runtime, explicit DOM/React/history subpaths, selection, browser proof, and unopinionated APIs.
- `platejs` is the default product/editor framework distribution: plugins, React wrappers, components, ordinary features, opinionated UX, examples, and app-facing docs. Plate applications install and import `platejs`, never `plitejs`. Dedicated raw Plite examples and proof apps import `plitejs` because their job is to verify the substrate itself.
- Inside `packages/platejs`, only exact facade, proxy, or intentional replacement leaves import `plitejs`. Every first-party plugin, feature, component, spec, type test, fixture, and other user-authorable implementation consumes the relative Plate facade or matching Plate entrypoint owner; package-wide and test-glob raw-import authority is forbidden. `platejs/testing` mirrors raw Plite test helpers for consumer tests.
- `plitejs/internal` is the one published bridge between the distributions, because two npm packages can share Plite's module state only through one channel. It exports only framework hooks and private carriers, shares no binding with a public entrypoint of either package, and has no docs or support promise. Only first-party code imports it: `platejs` source and the two packages' own tests, type tests and benchmarks. An export leaves it once no first-party code imports it.
- Plite owns neutral substrate laws. Reuse its API when it fits the current job; repair Plite when that primitive is inadequate. Remove conflicting Plate machinery instead of hiding either problem behind aliases or product glue.
- Do not fix a Plate product concern by polluting Plite core.
- Do not hide a Plite primitive gap in Plate glue.
- Cross-boundary work must name both owners and prove the handoff.
- Canonical editor state and mounted-view presentation have different owners. When an Editable can derive transient paint from its own DOM lifecycle, Plite React owns that behavior and a literal DOM protocol. Plate inherits it; copied product UI marks external focus targets and styles neutral output hooks. Add a controlled view input only when user intent cannot be derived from the mounted view or DOM. Never create editor-global plugin state or a parallel state carrier for a view-local presentation choice.

### Evidence Order

1. Live source/tests/benchmarks for current behavior.
2. Real browser proof for visible local routes.
3. Replayable Playwright or package tests for the bug class.
4. Benchmark targets with fair legacy/current comparison for perf claims.
5. Current docs for accepted claim width.
6. Research decisions for durable architecture context.
7. Old plans only as historical context unless they are active.
8. Chat memory last.

Executable tests outrank prose docs for behavior claims. Prose docs outrank tests for ownership, API intent, and public teaching surfaces.

## Plite Essentials

Plite is the raw editor substrate. It must stay unopinionated, precise, and boring in the best way: document model, canonical changes, runtime, input, DOM, selection, history, browser proof, package API, and benchmarks.

- Preserve Plite's simple document model and canonical `DocumentChange` as the sole mutation and commit truth. Transactions construct canonical changes directly; React does not define the core ontology.
- Plite stays unopinionated. Plate owns product opinion.
- Browser editing claims require model, DOM, selection/caret where observable, focus owner, legal trace, replayability, and follow-up typing.
- Behavior before perf. Visual proof before green visible-UI claims. Keep perf packets only when correctness stays green. Run measured diagnosis and optimization through `$benchmark`.

Read `docs/vision/plite.md` for the full Plite doctrine.

## Plate Essentials

Plate is the editor framework that ships in apps. It owns plugins, wrappers, components, kits, app-facing docs, product ergonomics, and opinionated UX built on top of Slate-first primitives.

- Keep Plate core unopinionated enough for framework use. Packages ship semantically neutral defaults; opinionated product behavior belongs in the consuming app and copied registry source, kits, examples and docs.
- A behavior, API, or gate change needs an adoption story. "Cleaner" alone is not enough.
- Root dependency references are shallow, non-generic identity values. `PluginTypeProvider` is the sole public value-sensitive capability bridge. Its higher-kinded encoding, normalized installed-capability carrier, and transitive dependency expansion stay private inside `plitejs`, never recursively encode exact ancestry, and never replace runtime exact-descriptor identity. Plate's author-source to canonical-lowered type split is private inside `platejs` too. Neither distribution offers authors an `internal`, `unsafe`, or generic framework escape path; the Boundary Law bridge is first-party only.
- Plate re-exports the approved Plite surface by identity, and a bug that reproduces in plain Plite belongs to Plite.
- If a Plate public API collides with Plite runtime names such as `api`, `read`, `update`, `state`, or `tx`, cut or rename the Plate API. Do not compromise Plite substrate names for Plate compatibility.

Read `docs/vision/plate.md` for the full Plate doctrine.
