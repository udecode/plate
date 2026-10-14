# Format Details titles as headings

Status: verified locally; owner authorized a local commit. No push.
Playbook: figure-it-out

## Brief

### What will change?

Choosing Heading on a Details title will format that title while preserving its disclosure structure and body. Choosing Text will remove the heading level. The same behavior will serve menus, shortcuts and heading input rules.

### What could go wrong?

Formatting could replace the required Summary, move text into the body, reset disclosure state, or lose marks during export. The operation must retain identity and distinguish formatting from inserting a separate heading after nonempty content.

## Teach

The reported menu currently changes Summary into a Heading node. Details then repairs the missing Summary by inserting an empty one, leaving the old title in the body. This is why collapsing hides the title too.

A Summary will stay a single text block and carry an optional heading level. The existing Heading formatter will understand this title role; Plite's low-level node setters remain literal structural operations. Existing Heading choices and the separate Details control are sufficient.

## Scope

User authority: "认可，写好计划 ... 然后去执行吧" after approving preservation of disclosure structure and heading-level titles.

- Checkout: `/Users/sin/Documents/Project/PlateCompany/plate`; branch `codex/sin/fix-details-blockSelection`.
- Intake base: `dfb26fd6eb3cd161df4f91a665957abf9684d76c`.
- Four bounded units: package formatting/schema; format round trips; registry writers/rendering; docs and native proof. Expected 10–16 product/source files plus focused evidence and generated registry artifacts.
- Rigor is high for persisted shape and selection behavior, bounded to this feature. No general block-format registry or Plite rewrite. The existing atomic block setter may resolve one property patch per target, so Heading can preserve Summary without copying schema validation.
- No AGENTS.md edit, dependency upgrade or Notion edit. The owner subsequently authorized a local commit, including the disclosed Plite extension; no push. Preserve the unrelated selection performance note and the user's port3000 server.

## Definition of done

On details-demo and Playground, choosing Heading on a selected Summary changes that visible title's level without replacing Summary, changing Details keys, creating a blank title or moving title text into the body. Text removes its level. Nested and collapsed titles preserve their body and disclosure state; undo restores the prior title formatting. Shortcuts, heading input rules and an empty Summary's slash Heading use the same behavior. Heading wrap/unwrap retains level. HTML and Markdown round trips retain level, bold/link marks and nested structure. Repeat final native cases five times without retries.

## Workflow

Throughput checkpoint: reuse existing Details, basic-node and format tests plus the browser runner. Two read-only readers compared the model and surface; the lead writes the changes. Capture a red regression before product edits, then verify each unit before starting the next.

1. Review this plan and reproduce the original menu conversion against the unchanged source.
2. Implement the existing Heading owner's Summary-aware level operation and migrate its real callers. Verify collapsed/nested identity, mixed-selection set semantics, input rule and empty-title slash insertion.
3. Add optional Summary level and semantic live/static rendering, strict HTML/Markdown preservation, and heading-aware wrap/unwrap. Check the actual round trips and original caret contracts.
4. Migrate registry menu writers; document the real API and regenerate only the required outputs through the repository generator. Run focused type/lint checks, independent diff review and native replay on both routes.
5. Render the plan page, audit the decision trail and leave the verified changes uncommitted.

## Main changes

Data shape: `{ type: 'summary', level?: 1 | 2 | 3 | 4 | 5 | 6, children: Text[] }`. Existing inline content remains allowed. No extra nested text block, new Details node type, persistent identity or separate disclosure state.

The Heading plugin owns `read.level(node)` and `update.setLevel(level | null)`. A level applies to selected leaf blocks; null clears Summary's level and converts ordinary blocks to Paragraph, subject to the existing structural constraints. For Summary it only sets or removes `level`. The existing Plite `blocks.set` gains a property-resolver form alongside the unchanged object form. Resolve each patch once and preflight every selected candidate using the existing schema admission check before writing any; a refusal must not leave a partially formatted selection. Existing `toggle` delegates to this operation while retaining toggle semantics. Toolbar/context menu use set semantics, so a mixed H2 + plain selection becomes uniformly H2. No existing generated `set` primitive changes its meaning.

Heading `upsert` reuses `applyBlockInsertion` including explicit before/after targeting and its editable-empty predicate. It preserves existing insertion behavior except for an empty Summary, where it formats that required title in place. Slash Text on Summary clears its level; ordinary slash Text keeps insertion semantics. The Heading owner resolves Summary's persisted type through the existing compiled model binding. This honors type overrides without a cross-feature import cycle; public string plugin lookups are invalid in this runtime. Plite receives only per-node property patches and never depends on Details.

Details owns optional-level validation and recovering a Heading when a leveled Summary is unwrapped. Without the optional Heading plugin, unwrap retains the existing Paragraph fallback. Enter still creates plain body content. HTML uses `<summary><hN>...</hN></summary>`; the Heading decoder declines this owned title wrapper so the existing phrasing decoder retains marks. This mechanism must pass a real strict round trip, or be replaced before acceptance. Markdown uses the existing schema-derived Summary tag attributes. Renderers reuse current Heading typography without introducing another registry component family.

Rejected: disabling Heading because it omits the approved feature; nesting a Heading node under Summary because it changes every title caret path; a post-normalization repair because it cannot distinguish formatting from inserted body headings; a new generic formatting registry because only this concrete integration is needed.

## Steps

- [x] Review the plan and capture red proof. Proof: `docs/plans/artifacts/details-heading-2026-10-13/package-red-a1.log` and `docs/plans/artifacts/details-heading-2026-10-13/browser-baseline-gesture-a1.log` fail with the title converted into hidden body content.
- [x] Implement and verify the model and format unit. Proof: `docs/plans/artifacts/details-heading-2026-10-13/package-settled-a1.log`, `docs/plans/artifacts/details-heading-2026-10-13/markdown-settled-a1.log` and `docs/plans/artifacts/details-heading-2026-10-13/atomic-set-a1.log`.
- [x] Implement registry consumers and docs. Proof: `docs/plans/artifacts/details-heading-2026-10-13/browser-inputs-empty-a1.log` and `docs/plans/artifacts/details-heading-2026-10-13/registry-build-a1.log`.
- [x] Complete scoped review and native verification. Proof: `docs/plans/artifacts/details-heading-2026-10-13/review-notes.txt`, `docs/plans/artifacts/details-heading-2026-10-13/native-complete-a1.log`, `docs/plans/artifacts/details-heading-2026-10-13/browser-caret-regression-a1.log`, and `docs/plans/artifacts/details-heading-2026-10-13/lint-after-review.log`.
- [x] Audit and hand back uncommitted changes. Proof: `docs/plans/artifacts/details-heading-2026-10-13/lint-close.log`, the checked decision trail, generated local page, and the Close below.

## Evidence

Decision trail and test outputs: `docs/plans/artifacts/details-heading-2026-10-13/`.
Original native diagnosis: `docs/plans/artifacts/details-heading-diagnosis-2026-10-13/DIAGNOSIS.txt`.

## Demo

1. Open http://localhost:3000/blocks/details-demo and expand the outer Details.
2. Select the inner title, then choose Heading 2 in the Text menu. The folded title stays visible, its selection is preserved, and its body stays collapsed. ![after](artifacts/details-heading-2026-10-13/after-details-demo.png)
3. Undo, redo and continue typing without clicking the editor again. Choose Text to remove the level. Clear the title, type `/h1`, choose Heading 1 and type a new title. The heading shortcut switches its level.
4. Expand the inner Details and apply Heading 3. The original body stays visible and the caret remains in the title. Both routes pass this sequence. ![after](artifacts/details-heading-2026-10-13/expanded-details-demo.png)
5. Repeat on Playground at the nested Details. ![after](artifacts/details-heading-2026-10-13/expanded-playground.png)

## Close

Verified locally on the main checkout's existing port3000 server (PID41719, cwd `apps/www`). Its readiness endpoint reports `devSource:false`; the Next alias configuration gives source entries precedence, and the new Summary level, rendered heading and retained key observed in the native tests bind this proof to the changed implementation. No server was stopped. The owner authorized a local commit after verification. No push, AGENTS.md edit, lockfile update or Notion edit occurred. The unrelated selection performance note is preserved.

The final reporter sequence passed five times per route without retries: 10/10. It checks collapsed and expanded nested titles, unchanged body text, font size display, model and DOM selection after the menu action, undo/redo, typing without refocus, Text reset, slash Heading and keyboard switching. Inspected screenshots show the title, disclosure arrow, retained body and visible caret. The previous folded-caret and undo cases also passed 16/16. Package proof passed Details43, Heading61, Markdown302 and atomic block contracts76; isolated registry contracts passed10. Plite and affected Plate typechecks, scoped lint, registry generation/check, docs source generation/parity, package builds and API manifest generation/check are recorded under the run directory.

Review used independent same-family readers after the Claude executable ping failed. One common warning was reproduced and fixed: typing a same-level Markdown prefix in Summary must preserve the current heading behavior. A second warning strengthened native proof by removing a refocusing click. No critical finding remained. The Model the Domain principle kept title style on Summary instead of changing its structural role; the Laziness Protocol reused the block setter and existing rendering variants instead of adding a generic formatting registry.

Limits: the whole-app package-integration typecheck still reports seven list/Word test errors, reproduced verbatim at the untouched intake commit in a detached worktree. Those files were not repaired. This is local Chromium verification, not full monorepo CI, Firefox/WebKit proof, a publish or a downstream clean-app install. The isolated frozen build prepared Plite before Plate and regenerated the API manifest; the main build then passed with the same order. Main regeneration removed three bundler-only Point alias differences from the isolated manifest and its check passed. Temporary proof worktrees were removed. The broader Notion feature set and TOC behavior were not changed.


## Owner correction

The owner authorized committing this version after being told about the Plite block-setter extension. Future work stays within the assigned Details scope. Any further Plite change requires explaining its reason and scope and receiving explicit owner approval before editing.
