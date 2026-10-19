# Common Vision

Shared Plate and Plite doctrine: the redesign method, API taste, claim width and boundary law.

Root `VISION.md` is the mandatory first read. This file carries the fuller
common doctrine after the lane is selected.

## Redesign from First Principles

This is the governing principle of the `next` beta redesign. Apply the full
shared method (`pstack:principle-redesign-from-first-principles`)
when choosing or reviewing an API or architecture, including during initial
planning. The current design does not need to fail first.

1. Name the current user job and hard correctness, security, serialized-data,
   native-behavior and runtime laws, plus explicit user constraints.
2. Sketch what we would build if those requirements had been present from the
   start, before preserving names, layers, state models or package boundaries.
   Check prior art first: existing Plite primitives, Plate components and the
   reference editors cloned beside the repository. Invent only when the new
   design clearly beats them.
3. Compare the strongest relevant delete, merge, inline, reuse and replacement
   alternatives. Existing Plite primitives and newly proposed abstractions
   face the same test: a current job or hard law must justify their ownership.
4. Choose the simplest target that delivers material lasting value. A target
   with more concepts, layers or states than the current design names the job
   or law that pays for each addition. Compatibility, sunk effort and
   implementation difficulty affect adoption order during beta; they do not
   make a weaker target better. Keeping the current design is a valid win.
5. Carry an authorized change through its types, consumers, docs, examples,
   rationale and proof. Design the whole result and deliver it incrementally.

Reuse an accepted comparison while its requirements and evidence remain valid.
Reopen it when a material new requirement or contradiction changes the choice.
Ordinary edits do not require a rewrite, a review does not grant implementation
authority, and a promising direction does not prove its runtime design.

A cut that removes a verification step or safeguard shows that the step catches
nothing, or names the independent check that covers the same failure. A cut
justified only by "no production caller" first checks whether Vision names a
job for the API; a named job keeps the API in the comparison.

## Taste

- Examples should expose the real API and DX at the call site.
- Conventions are API surface: names, flags, config keys, persisted fields,
  output shapes, docs examples, and workflow keywords must be intentional,
  stable, and worth their long-term compatibility cost.
- Commit intentional generated outputs. Keep tool-private scratch, locks,
  journals, staging, and recovery data out of tracked source without requiring
  product-specific ignore rules; use OS temp storage for disposable compiler
  work and the project's deterministic `node_modules/.cache` for durable state.
- Generated-artifact writers stage replacements on the artifact's filesystem,
  so atomic rename, crash rollback, cross-process locking and last-good output
  stay real. Tools fail clearly when the `node_modules/.cache` root is
  unavailable, and never choose a coordination root from process-local
  environment or transient writability.
- Public API design starts from ideal call sites. Current implementation,
  compatibility, machinery, ecosystem precedent, and accepted plans inform
  adoption; they do not define the target. Quality does not mean maximum
  capability, abstraction, generality, symmetry, or rubric score. `best-api`
  owns the smallest materially justified concrete design/review step before
  layer planning.
- Optimize a public API surface in this order: correct ownership and truthful
  semantics, one obvious common path, discoverable inference, JSDoc and
  examples, progressive disclosure, stable composition points, locality, then
  ecosystem fit. Prefer the Slate and Plate idiom when two designs are equally
  good, and depart from it when another shape is materially cleaner or more
  scalable.
- Public interfaces are deep: callers learn a small stable surface while the
  owner holds the honest complexity. Examples, tests or normal customization
  that must reach into internals mark a wrong boundary. An API scales when
  future capability can be added without every caller learning it, not because
  it exposes every mechanism.
- A public API offers one way to perform each common operation: no parallel
  paths, no public verb per internal implementation fragment or compiler
  destination, and no debug or profiling concern inside ordinary authoring
  calls. Prefer the single inference-preserving authoring shape with the fewest
  learned concepts. The same convenience name is never exported from both a
  package and its registry or app owner.
- Any supported variant, provider or backend is one complete public surface:
  never advertise it while filtering public nouns it cannot implement, and
  compatibility age, maintenance-only status or effort never excuse a partial
  surface.
- A default implementation and a caller-supplied implementation of the same
  job share one public constructor and lifecycle, with the implementation as an
  optional input.
- The high-frequency read gets the shortest unqualified name, without vague
  singular projections such as `primary`, `current` or `resolved`. A
  projection stays only with a distinct current job: a hook that always returns
  its input, the common read or a constant is deleted, and an exact carrier
  stays public only for a proven job that needs its complete payload.
- Robustness claims must match the owner's end-to-end supported input domain.
  A reviewer finding does not create a product requirement. Do not make one
  helper support an extremal input that adjacent validation, construction,
  serialization, storage, or callers cannot carry; prefer the simpler normal
  path and remove tests that imply the isolated guarantee.
- Performance pressure alone earns no public hook, provider, profiling, config,
  toggle or diagnostics surface; measurement stays internal. A relative
  benchmark percentage does not outweigh a negligible absolute cost or
  permanent machinery.
- Do not call release-ready when only a scoped claim is green.
- A historical claim, scoreboard or passing run certifies only the source it ran on; reuse it as current proof only when that source is unchanged, and otherwise rerun its check on the current checkout.
- For batch automation, stack soft stopping checkpoints and ask at the final
  handoff so the user can unblock many decisions in one reply.

## Claim Width

| Claim | Minimum proof |
| --- | --- |
| current source behavior | source read plus focused command or source audit |
| user-visible browser behavior | real browser or Playwright proof matching the interaction |
| editor selection/caret behavior | model selection plus native DOM/window selection or geometry proof |
| performance | honest metric target, baseline/latest/best, and correctness guard |
| mobile viewport behavior | Playwright/mobile semantic proof, explicitly scoped |
| Android Chrome soft-keyboard behavior | the local device lane on an emulator: real Gboard touches, guarded DevTools and a passing witness, five warm runs; scoped to that emulator and keyboard |
| raw mobile/device behavior | real device/Appium/equivalent artifacts |
| release-ready | release gate, package artifacts, docs/API proof, and scoped caveats |
| issue/PR closure | live GitHub state, duplicate/claim guard, current source proof, and authority |
| collaboration behavior | two-client, provider, awareness, offline and history proof |
| algebra and transaction laws | package tests and property vectors |

## Boundary Law

- An input gesture, view, query, policy or payload never becomes a parallel
  authority for state the editor or runtime already owns; its adapter stays
  private and writes through that authority.
- A private bridge is a small internal adapter with an owner, a deletion gate
  and proof, and never collects product or plugin behavior from several
  owners.
- Product packaging matters, but it never gets to corrupt core/runtime layers.
- Package roots expose only code backed by required dependencies. Optional
  framework or runtime peers stay behind explicit subpaths whose packed runtime
  and declarations prove entrypoint-specific dependency closure.
- Package and entrypoint select the editor layer. The common public vocabulary
  is `createEditor`, `Editor`, and `CreateEditorOptions`. Branded editor
  variants do not survive, and no public entrypoint publishes internals to
  authors; the one first-party bridge is the one root `VISION.md` defines.
