# Plate architecture reference

The Plan playbook reads this file in full for an API or architecture plan, the Build playbook reads its Hard cut, and a read-only architecture audit reads its Audit. `best-api` owns the call shape, `research audit` the source-level editor comparison and `benchmark` the measurement.

## Pick the layer

Read root `VISION.md`, then `docs/vision/plite.md`, `docs/vision/plate.md` or both. Their laws bind every decision row; link them instead of copying their tables into the plan.

- Plite owns the editor model, operations, reads, updates, transactions, selection primitives, DOM, input and runtime substrate, history, replay, collaboration substrate and browser proof infrastructure.
- Plate owns product plugins, feature workflows, kits, registry code, app-facing docs and examples, and opinionated UX.
- Pick the layer from the owners the question touches. Work that crosses layers starts at the owner of the first unresolved boundary and gives each layer its own rows.
- Before calling a feature flow registry-only, test whether it exposes a neutral law of one mounted Editable. If the view can derive the behavior from its runtime or DOM lifecycle, include the Plite React primitive and literal DOM protocol; Plate inherits it, while registry UI owns markers and styling. Add a controlled input only when user intent cannot be derived. Never add a view-toggle plugin or kit.
- When a Plate API duplicates an adequate Plite primitive, Plite wins. A real substrate gap is fixed in Plite, never hidden behind Plate glue, and Plite stays free of Plate product policy.

## Decision ledger

Keep one concept-level ledger in the plan:

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Verdicts are `keep`, `cut`, `rearchitect`, `rename`, `move`, `bridge`, `defer` or `gate`. Use one row per concept or runtime responsibility, not per exported symbol. A break row names its callers, docs and example adoption, and proof; `defer` names the missing evidence and the next owner. Rank changes by long-term value and order slices by dependency.

- A private bridge names its owner, non-public proof, deletion trigger and removal gate.
- A scale-sensitive row (a runtime layer, cache, index, projection, store, subscription, scheduler, geometry owner, repeated-unit fan-out or other hot work) runs Benchmark's pre-acceptance probe with the performance pack (`.agents/rules/benchmark/templates/performance-observability.md`). Without a passing current-owner versus target receipt it stays `defer` or `gate`. Its slice carries the cohorts, budget, benchmark command, cost indicators and correctness guard into its exit condition.

## Layer gates

Both layers:

- A high-risk change (public API, model, operations, normalization, selection, IME, DOM, React subscription, history, collaboration, browser or generated contracts) records three realistic failures, its blast radius from `pstack:blast-radius`, its rollback or hard-cut answer and focused proof.
- Issue or PR provenance belongs only in issue-backed work or a changed public claim.
- Browser and device claims follow `verify`'s claim classes; unavailable hardware never blocks a source or API handoff.

Plate:

- A mounted-view presentation row names the Plite React input, the Plate proxy, the copied-UI policy owner, the deleted plugin, store or kit surfaces, and multi-view plus native-selection non-interference proof.

Plite:

- A controlled view of canonical selection proves two Editables over one editor and two independent editors, expanded and collapsed paint, root and direction correctness, native-paint deduplication, SSR and unmounted behavior, and zero mutation of DOM selection, focus, input, history, clipboard or the internal projected-view-selection runtime.
- A fast path derives eligibility from evaluated material behavior, keeps capability declarations with the owning runtime, fails closed for unknown behavior and proves native and model parity.
- Ordinary architecture does not run `issue-harvester`'s Slate claims mode.

## Page sections

A plan that picks an API or architecture target writes these sections as its delta, each only when it applies. The plan page renders them right after Public API, in this order, because the Plan playbook's `page-lead` frontmatter names them and the plan names that playbook with a `Playbook: plan` line. The ledger stays the source for owners, verdicts and breaks.

- `## What other editors do`, always: one sentence saying what was read (repository revision or package version) and the outcome, then a table with one row per editor and one column per question the decision turns on, such as where the state lives or what a screen reader receives. Cover ProseMirror, Lexical, Slate, Tiptap and any other editor the evidence names; an editor that was read but not run says so. Run `research audit` first when the decision needs a source-level comparison.
- `## Document shape`, when a node type, property or serialization changes: the stored node JSON as ```` ```json before ```` and ```` ```json after ```` pairs, with one sentence above each pair naming who reads that shape.
- `## Layer and owner`, when a row moves or adds an owner: a table of `Change | Layer (Plite or Plate) | Package | Why`, taken from the ledger's Owner column.
- `## Hard cuts and app migration`, when anything public is removed or breaks: what is deleted, the callers that break from `pstack:blast-radius`, and the app code and copied registry components that must change, with before and after code where it changes.
- `## Native behavior and proof`, when selection, IME, clipboard, undo or focus behavior changes: one row per behavior with what changes and the surface its proof ran on (a named browser, device, emulation or jsdom test), or `unproven`.

## Ready

An architecture plan is ready only when every current-state claim has live evidence, every responsibility has one owner, every row has a resolved verdict, every public break has adoption, docs and proof answers, the slices and their verification are concrete, every conditional gate is resolved or marked inapplicable with a reason, every scale-sensitive decision has its receipt, every Page section that applies is written, and no decision-changing question remains. Missing evidence is an open gate, never a confidence score.

## Hard cut

A hard cut removes behavior, so it runs only when the user asks to remove that feature, through the Build playbook. It deletes the feature in one wave, per `pstack:principle-migrate-callers-then-delete-legacy-apis`, never deprecated. Unlike `plate-next`, which freezes scope and defers outside callers, a hard cut reaches every caller.

- Delete the surface and its glue: exports, commands and flags, routes, UI entrypoints, feature flags, call sites, types, state, tests of the deleted behavior, docs, examples and comments about the old code.
- Leave no `Not implemented` throws, stub handlers, "feature removed" notices, compatibility aliases, shims, fallback parsing, migration bridges, dead enum or union members, permanently-false flag branches or unused config.
- Before deleting, run `pstack:blast-radius` on the removed surface to find the consumers grep misses: serialized documents, registry copies, docs, generated output and downstream apps.
- Keep cutting the dead code the removal exposes, then grep again for the removed name and its obvious aliases.
- Keep real native behavior, serialized-data and package laws intact.

Plate closeout for a cut:

- `pnpm brl` when package exports or exported folders changed.
- `pnpm --filter www build:registry` when registry source changed, with its generated output.
- A changeset or registry changelog entry per `changeset`.
- A removed package moves to `retiredPackages` in Plate Next's `versions.json`, leaves `reviewedPackageSlugs` in `tooling/scripts/check-core.mjs`, and records its retirement date and evidence.
- `best-api repair` when the cut changes a reusable public API that skills or Vision still teach.
- The narrowest honest verification for the surviving product.

## Audit

An audit scores one scope's current architecture, read-only; it writes only its report. Build a bounded manifest of its units first and report `expected=<n> reviewed=<n> excluded=<n> missing=<n> duplicates=<n>`; each exclusion needs a reason, and a partial lexical search is not a complete manifest. A unit is one independently scoreable package, public entrypoint, plugin family or cross-layer runtime owner; headless and React files for the same job are one unit. Score and rank each unit separately, and never publish an average across units, because averaging unrelated architecture hides blockers.

Classify every state value before judging its API:

| Lifetime | Canonical owner |
| --- | --- |
| Durable document truth | model nodes/properties plus operations and serialization |
| Shared application or service truth | application/service domain owner outside one editor instance |
| Editor-session configuration | editor/plugin runtime configuration and scoped store |
| View-local transient state | mounted view, DOM/input lifecycle, or component owner |
| Derived read, cache, or index | private projection with explicit invalidation from its source |

Then trace all writers, readers, invalidation, serialization, collaboration, mount/unmount and reset paths. A cache is not a second truth only when callers cannot write it independently and its source owns invalidation. Wrong ownership or lifetime is structural failure; UI polish, tests and a short call site cannot average it away.

Grade each axis 0 to 4: 0 contradicted (the current design violates the axis's core law), 1 accidental (works through leaks, duplication or manual synchronization), 2 mixed (a plausible owner with parallel truths, exceptions or partial adoption), 3 coherent (bounded adoption or proof gaps remain), 4 canonical (one truthful owner, complete adoption, direct proof). Missing evidence is not grade 0; it makes the audit incomplete or provisional.

| Axis | Weight | Question |
| --- | ---: | --- |
| `owner` | 2.0 | Is there one canonical domain authority with no competing writable truth? |
| `lifetime` | 2.0 | Does every value live, persist, reset, and invalidate at the correct lifetime? |
| `boundary` | 1.0 | Do layers, packages, entrypoints, dependencies, and reachability tell the truth? |
| `api` | 1.5 | Is the common public path small, inferable, composable, and free of owner leakage? |
| `scale` | 1.5 | Is growing work local, bounded, measured when material, and owned by the right layer? |
| `correctness` | 1.0 | Are hard model, data, native, collaboration, and safety laws centrally preserved? |
| `proof` | 1.0 | Are the architecture, adoption, teaching, artifacts, and applicable runtime paths directly proved? |

The raw score out of 10 is the sum of each grade divided by 4 times its weight; compute it in the report, never by eye. Every axis row gives the grade and weighted points, at least one current source citation, the concrete reason, and the falsifier that would raise, lower or invalidate the grade. Then apply every evidenced cap and keep the lowest ceiling; a cap never raises a lower subtotal:

| Cap | Ceiling | Status | Trigger |
| --- | ---: | --- | --- |
| `wrong-owner` | 2.0 | final | The primary job belongs to another canonical authority. |
| `duplicate-truth` | 2.0 | final | Two independently writable truths represent the same domain fact. |
| `wrong-lifetime` | 3.0 | final | Durable, shared, editor-session, view-local, or derived state lives in the wrong lifetime owner. |
| `reachability-contradiction` | 5.0 | final | A public entrypoint cannot truthfully run or type through its declared dependency boundary. |
| `unmeasured-scale` | 6.0 | provisional | A scale-sensitive layer can still be kept or cut based on missing executable measurement. |
| `correctness-blocker` | 1.0 | blocker | The owner permits corruption, security failure, or violation of a hard native/model law. |
| `incomplete-manifest` | n/a | incomplete | Expected units, writers, public paths, or materially distinct consumers remain unreviewed. |

A provisional cap renders as a ceiling such as `≤6.0/10`, not a final score; an incomplete audit has no numeric score; a blocker leads the verdict with the violated hard law. Report evidence confidence separately (inventory 35, trace 30, consumers 20, runtime 15, each graded 0 to 4, out of 100); it does not change the score.

Assign priority independently of the score: `P0` for confirmed corruption, security failure, serialized-data break, hard native or model-law violation, or an unusable primary public contract; `P1` for a wrong canonical owner or lifetime, competing writable truth, or a common scale law with material ecosystem harm; `P2` for bounded reachability, API, composition, adoption or proof debt with a safe current path; `P3` for local naming, teaching or cleanup debt with no architectural harm. A low score is not automatically P0, and a high score can still hide one P0 defect.
