---
description: Plate and Plite layer law, plan format and readiness for the architecture and API adoption of one decision. The Plan and Build playbooks run it.
argument-hint: '[quick | deep | audit] <question or plan path>'
name: plate-architecture
metadata:
  skiller:
    source: .agents/rules/plate-architecture.mdc
---

# Plate Architecture

Handle $ARGUMENTS.

This skill holds the layer law, plan format and readiness for the architecture and API adoption of one Plate or Plite decision once its target call shape is clear. The Plan playbook (`.agents/playbooks/plan.md`) writes the plan and stops; the Build playbook executes it on "go". `best-api` owns what the API should look like, `research`'s audit mode owns external editor comparison and `benchmark` owns measurement. poteto-mode and `AGENTS.md` own lifecycle, authority, delivery and the close.

## Pick the layer

Read root `VISION.md`, then `docs/vision/plite.md`, `docs/vision/plate.md` or both. Their laws bind every decision row; link them instead of copying their tables into the plan.

- Plite owns the editor model, operations, reads, updates, transactions, selection primitives, DOM, input and runtime substrate, history, replay, collaboration substrate and browser proof infrastructure.
- Plate owns product plugins, feature workflows, kits, registry code, app-facing docs and examples, and opinionated UX.
- Pick the layer from the owners the question touches. Work that crosses layers starts at the owner of the first unresolved boundary and gives each layer its own rows.
- Before calling a feature flow registry-only, test whether it exposes a neutral law of one mounted Editable. If the view can derive the behavior from its runtime or DOM lifecycle, include the Plite React primitive and literal DOM protocol; Plate inherits it, while registry UI owns markers and styling. Add a controlled input only when user intent cannot be derived. Never add a view-toggle plugin or kit.

## Modes

Choose one mode from the arguments. With no mode word, run standard.

- `quick`: answer one boundary or adoption question with a source-backed recommendation, its strongest evidence, the rejected option and the next owner. No plan, and never "execution-ready". Promote to standard when the decision spans owners, public breaks or uncertain runtime behavior.
- standard (no mode word): create or continue one plan under `docs/plans/` and run the three phases in one go.
- `deep`: standard, plus only the `research`, Benchmark evidence, browser stress or red-team work the named risk justifies. Run `research audit` first when the decision needs a source-level comparison with other editors.
- `audit <scope>`: score the current architecture of one scope read-only, per Audit below. It changes no source and writes only its report.

A plan path alone does not authorize implementation. An Autonomous run may execute an accepted target only after the challenge in the Plan playbook's Architecture decisions section (`.agents/playbooks/plan.md`) has recorded the final target, its `challenge delta`, the exact packet, the proof and the plan. When a caller already holds a plan, add this skill's rows and readiness fields to it instead of starting another.

## Audit

An audit scores one scope's current architecture. Build a bounded manifest of its units first and report `expected=<n> reviewed=<n> excluded=<n> missing=<n> duplicates=<n>`; each exclusion needs a reason, and a partial lexical search is not a complete manifest. A unit is one independently scoreable package, public entrypoint, plugin family or cross-layer runtime owner; headless and React files for the same job are one unit. Score and rank each unit separately, and never publish an average across units, because averaging unrelated architecture hides blockers.

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

## Hard cut

A hard cut is the one change that removes behavior, so it runs only when the user asks to remove that feature, through the Build playbook. It deletes the feature in one wave, per `pstack:principle-migrate-callers-then-delete-legacy-apis`, never deprecated. Unlike `plate-next`, which freezes scope and defers outside callers, a hard cut reaches every caller.

- Delete the surface and its glue: exports, commands and flags, routes, UI entrypoints, feature flags, call sites, types, state, tests of the deleted behavior, docs, examples and comments about the old code.
- Leave no `Not implemented` throws, stub handlers, "feature removed" notices, compatibility aliases, shims, fallback parsing, migration bridges, dead enum or union members, permanently-false flag branches or unused config.
- Before deleting, run `pstack:blast-radius` on the removed surface to find the consumers grep misses: serialized documents, registry copies, docs, generated output and downstream apps.
- Keep cutting the dead code the removal exposes, then grep again for the removed name and its obvious aliases.
- Keep real native behavior, serialized-data and package laws intact during a hard cut.

Plate closeout for a cut:

- `pnpm brl` when package exports or exported folders changed.
- `pnpm --filter www build:registry` when registry source changed, with its generated output.
- A changeset or registry changelog entry per `changeset`.
- A removed package moves to `retiredPackages` in Plate Next's `versions.json`, leaves `reviewedPackageSlugs` in `tooling/scripts/check-core.mjs`, and records its retirement date and evidence.
- `best-api repair` when the cut changes a reusable public API that skills or Vision still teach.
- The narrowest honest verification for the surviving product.

## Rules for every row

- The current checkout wins. Source every current API, export, docs, test and benchmark claim from live owners.
- Choose the target with the Architecture decisions method in the Plan playbook (`.agents/playbooks/plan.md`). Existing plugins, operations, state models and protocols are candidates to keep, merge or replace; migration convenience never picks the target.
- Before locking a row, apply `best-api`'s maximum-value hard-cut gate to the concept and the owner above it. Breaking scope is adoption cost: no public aliases, runtime shims, dual signatures or docs for old names.
- A private bridge names its owner, non-public proof, deletion trigger and removal gate.
- A typed escape hatch stays only with a specific reason and a deletion gate.
- When a Plate API duplicates an adequate Plite primitive, Plite wins. A real substrate gap is fixed in Plite, never hidden behind Plate glue, and Plite stays free of Plate product policy.
- A scale-sensitive row (a runtime layer, cache, index, projection, store, subscription, scheduler, geometry owner, repeated-unit fan-out or other hot work) runs Benchmark's pre-acceptance probe with the performance pack (`../benchmark/templates/performance-observability.md`), decided during Ground. Without a passing current-owner versus target receipt it stays `defer` or `gate`.
- A better call shape found mid-plan gets the `best-api` lens inside the same plan.
- Planning edits only the planning, research, vision, behavior-law, benchmark-target and reference artifacts it owns; no product source before execution.
- Keep one proportional plan. Bring in a worker skill only when its surface applies.

## Three phases

1. **Ground.** Outcome, scope, non-goals and user constraints; live source and teaching surfaces; the owners involved; scale applicability.
2. **Decide.** Keep one concept-level ledger:

   | Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- |

   Verdicts are `keep`, `cut`, `rearchitect`, `rename`, `move`, `bridge`, `defer` or `gate`. Use one row per concept or runtime responsibility, not per exported symbol. A break row names callers, docs and example adoption, and proof; `defer` names the missing evidence and the next owner. Rank changes by long-term value and order execution slices by dependency.
3. **Prove and hand off.** Cut vertical slices, each with an owner, entry and exit condition and focused proof. A scale-sensitive slice carries its cohorts, budget, benchmark command, cost indicators and correctness guard into its exit condition.

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

A plan that picks an API or architecture target writes these sections for its owner's review as its delta, per `AGENTS.md`'s Plan pages: a table row it adds, changes or removes carries a `Delta` cell, and the build folds the delta into its subject file (`docs/plans/topics/<scope>.md`), which holds the current state; a ledger scope's page refuses to render while the subject file lacks `## What other editors do`. The plan page renders them right after Public API, in this order, through `pageLead` in `.agents/pstack.json`. Each appears only when it applies. The ledger stays the source for owners, verdicts and breaks; these sections show them for review.

- `## What other editors do`, always: one sentence saying what was read (repository revision or package version) and the outcome, then a table with one row per editor and one column per question the decision turns on, such as where the state lives or what a screen reader receives. Cite the sources read during Ground; `deep` adds `research audit`. Cover ProseMirror, Lexical, Slate, Tiptap and any other editor the evidence names; an editor that was read but not run says so.
- `## Document shape`, when a node type, property or serialization changes: the stored node JSON as ```` ```json before ```` and ```` ```json after ```` pairs, with one sentence above each pair naming who reads that shape.
- `## Layer and owner`, when a row moves or adds an owner: a table of `Change | Layer (Plite or Plate) | Package | Why`, taken from the ledger's Owner column and Pick the layer.
- `## Hard cuts and app migration`, when anything public is removed or breaks, whether a hard cut the user asked for or a break the target needs: what is deleted, the callers that break from `pstack:blast-radius`, and the app code and copied registry components that must change, with before and after code where it changes.
- `## Native behavior and proof`, when selection, IME, clipboard, undo or focus behavior changes: one row per behavior with what changes and the surface its proof ran on (a named browser, device, emulation or jsdom test), or `unproven`.

## Ready

A standard or deep plan is ready only when every current-state claim has live evidence, every responsibility has one owner, every row has a resolved verdict, every public break has adoption, docs and proof answers, the slices and their verification are concrete, every conditional gate is resolved or marked inapplicable with a reason, every scale-sensitive decision has its receipt, every Page section that applies is written, and no decision-changing question remains. Missing evidence is an open gate, never a confidence score.

The handoff reports the ownership and target decisions, public breaks and their adoption, the runtime, package, docs and browser decisions that apply, focused proof and open risks, and the execution order with what still needs acceptance.
