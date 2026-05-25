---
date: 2026-04-02
topic: slate-v2-triage-close-queue
pilot: false
pilot_scope: 682 open issues
repo: ianstormtaylor/slate
---

# Slate v2 Triage Close Queue

## Purpose

This is the first safe bulk-triage queue for open Slate issues.

It is now also a historical execution record.

It is intentionally conservative.

It does **not** include:

- stale-only closures
- medium or low confidence closures
- direct-v2 issues, even if they smell duplicate or invalid

## Execution Status

Batch A was executed by Dylan after this queue was prepared.

Verified post-run status:

- Batch A queue size: `54`
- Batch A issues still open: `0`
- live repo open-issue count after Batch A: `628`

That means the `682`-issue research snapshot is still the analysis baseline, but this queue is no longer a pending first-run artifact.

Do **not** rerun Batch A blindly.

## Confidence Review

### Action Matrix

| Action | Count | Shape |
|---|---:|---|
| `close-invalid` | 63 | `37` invalid, `26` likely-invalid |
| `close-stale` | 57 | `56` stale-candidate, `1` valid |
| `mark-duplicate` | 10 | `6` valid, `3` duplicate-candidate, `1` likely-valid |
| `close-duplicate` | 8 | `8` duplicate-candidate |

### Safe-Now Rule

Safe now means:

- `close-invalid`
  - `confidence = high`
  - `v2 relevance != direct`
- `mark-duplicate` or `close-duplicate`
  - `confidence = high`
  - explicit duplicate target exists
  - `v2 relevance != direct`

That yields:

- safe now: `54`
- manual review: `27`
- stale bucket deferred entirely: `57`

### Spot Check

Representative dossier spot-checks passed:

- `#6007`: duplicate to `#6002`
- `#5958`: upstream Chromium issue, likely not Slate-owned
- `#5748`: already answered in-thread, API expectation mismatch
- `#5655`: consumer misuse, maintainer already gave working integration shape
- `#5457`: pure CSS/support confusion
- `#4561`: old duplicate already pointed at canonical thread

## Batch A: Executed

### A1. Mark Duplicate

| Issue | Target | Why |
|---|---|---|
| `#6007` | `#6002` | release-process duplicate already identified in-thread |
| `#4929` | `#4882` | deserialize-example stack overflow duplicate |
| `#4895` | `#4914` | readonly copy duplicate |
| `#4580` | `#4573` | paste HTML crash duplicate |
| `#4561` | `#4081` | hot refresh duplicate |

### A2. Close Duplicate

| Issue | Target | Why |
|---|---|---|
| `#3710` | `#4268` | paste-html example extra-newlines duplicate |

### A3. Close Invalid

| Issue | Why |
|---|---|
| `#5958` | thread points to upstream Chromium bug |
| `#5895` | consumer/editor-behavior expectation, not a clean Slate bug |
| `#5838` | third-party slate-vue3 announcement noise |
| `#5824` | iOS style-preserving paste expectation, not current Slate-owned bug |
| `#5820` | invalid path/leaf expectation mismatch |
| `#5748` | already answered in-thread, API usage mismatch |
| `#5735` | animation request, not Slate bug |
| `#5732` | noise |
| `#5704` | popup textbox selection expectation, not Slate-owned |
| `#5692` | legacy browser support expectation |
| `#5671` | generic support complaint |
| `#5667` | invalid state wiring in consumer array mapping |
| `#5655` | consumer misuse; maintainer already showed working `dnd-kit` shape |
| `#5548` | docs/support mismatch around root path semantics |
| `#5498` | consumer styling/padding issue |
| `#5478` | old non-hooks support ask |
| `#5457` | CSS line-height/support confusion |
| `#5432` | invalid link-focus expectation |
| `#5413` | focus prerequisite/support confusion |
| `#5379` | styling flag expectation, not engine bug |
| `#5333` | “markdown editor out of the box” expectation |
| `#5280` | broad paste-format complaint without clean Slate bug seam |
| `#5250` | invalid current ticket as framed; should not stay open as bug |
| `#5174` | iOS autofocus limitation/support issue |
| `#5132` | invalid value / stale-read consumer misuse |
| `#5101` | invalid decoration/search-highlight framing |
| `#5051` | old `slate-html-serializer` ecosystem issue |
| `#5032` | broad DOM-point complaint without stable current repro |
| `#4827` | Chrome extension interference |
| `#4800` | import/setup misuse |
| `#4692` | product request, not issue |
| `#4648` | punctuation semantics expectation, weak bug claim |
| `#4513` | collapsed-selection `onCopy` expectation in old stack |
| `#4438` | LSP feature request, not bug |
| `#4322` | vague ecosystem issue, not clean core bug |
| `#4281` | Firefox shortcut expectation |
| `#4239` | chrome extension integration noise |
| `#4146` | example/integration misuse |
| `#4145` | support question |
| `#4029` | community chat noise |
| `#3954` | invalid current framing around empty non-void copy |
| `#3870` | invalid old void-boundary report as filed |
| `#3826` | vague mark-removal issue, not credible current bug |
| `#3765` | old serializer ecosystem issue |
| `#3763` | support/API usage question |
| `#3753` | old invalid framing around empty-editor insertion |
| `#3453` | support request for IDs in React component |
| `#3935` | example limitation, not core bug |

## Batch B: Manual Review Before Any Bulk Action

These are not safe for an automatic first sweep.

Reasons:

- direct-v2 relevance
- medium or low confidence
- duplicate target exists but the thread still smells like a real canonical bug family

| Issue | Proposed action | Why it stays out of batch A |
|---|---|---|
| `#6016` | `close-invalid` | direct-v2, identity/runtime signal |
| `#5912` | `close-invalid` | only medium confidence |
| `#5698` | `mark-duplicate` to `#5711` | medium confidence and direct-v2 |
| `#5686` | `close-invalid` | direct-v2 and touches real API semantics |
| `#5647` | `close-invalid` | only medium confidence |
| `#5634` | `close-invalid` | only medium confidence |
| `#5605` | `mark-duplicate` to `#6013` | direct-v2 API ergonomics |
| `#5550` | `close-invalid` | only medium confidence |
| `#5472` | `close-invalid` | low confidence |
| `#5417` | `close-invalid` | only medium confidence |
| `#3798` | `close-invalid` | only medium confidence |
| `#3723` | `close-duplicate` to `#3421` | only medium confidence |
| `#3705` | `close-duplicate` to `#3921` | medium confidence and direct-v2 history signal |
| `#3621` | `close-invalid` | only medium confidence |
| `#3466` | `close-duplicate` to `#3339` | medium confidence and direct-v2 |
| `#3433` | `close-duplicate` to `#3412` | only medium confidence |
| `#3369` | `close-duplicate` to `#3824` | direct-v2 mobile/input signal |
| `#3313` | `close-duplicate` to `#3112` | direct-v2 mobile/input signal |
| `#5066` | `mark-duplicate` to `#5762` | direct-v2 mobile/input signal |
| `#5026` | `mark-duplicate` to `#4994` | direct-v2 mobile/runtime signal |
| `#5019` | `mark-duplicate` to `#4988` | direct-v2 mobile/input signal |
| `#4971` | `close-invalid` | only medium confidence |
| `#4936` | `close-invalid` | medium confidence and indirect-v2 |
| `#4680` | `close-invalid` | medium confidence and indirect-v2 |
| `#4377` | `close-invalid` | only medium confidence |
| `#3977` | `close-invalid` | medium confidence and indirect-v2 |
| `#2597` | `close-duplicate` to `#1971` | direct-v2 sentinel/runtime issue |

## Explicitly Deferred

### Stale Queue

`57` issues are currently marked `close-stale`.

Do not bulk-close them yet.

That bucket needs one more pass because stale is where fake confidence goes to hide.

## Recommended Next Move

1. Treat Batch A as executed historical record, not an open queue.
2. Start from Batch B manual review if more triage work is needed.
3. Review stale after that, not before.
4. If another bulk script is generated later, refresh GitHub state first instead of reusing Batch A assumptions.
