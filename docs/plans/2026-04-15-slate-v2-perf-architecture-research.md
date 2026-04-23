---
date: 2026-04-15
topic: slate-v2-perf-architecture-research
status: completed
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/prosemirror
  - /Users/zbeyens/git/lexical
  - /Users/zbeyens/git/vscode
---

# Goal

Run a full research-wiki pass on the editor-architecture candidate lane for the
specific question:

- can Slate v2 honestly claim same-or-better perf architecture than the serious
  candidates on theory alone?
- what does React 19.2 actually buy us?
- if we want the field-best version of the decoration stack, what reshape is
  still justified?

# Scope

- direct compare corpora:
  - local Slate v2
  - ProseMirror
  - Lexical
  - VS Code
  - React 19.2 official docs
- contextual compiled corpora from the existing landscape:
  - Tiptap
  - Premirror / Pretext
  - edix / use-editable / rich-textarea
  - TanStack DB
  - EditContext

# Loaded Skills

- `research-wiki`
- `major-task`
- `planning-with-files`
- `learnings-researcher`
- `repo-research-analyst`

# Phases

- [x] Read research layer entrypoints and full-pipeline workflow
- [x] Scope direct and contextual corpora
- [x] Read strongest direct evidence and classify each corpus
- [x] Update compiled source/system/decision pages
- [x] Update research index and log
- [x] Summarize the honest verdict and reshape pressure

# Per-Corpus Evidence Ledger

## Direct corpora

### Slate v2 local proof substrate

- compiled pages inspected:
  - `docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md`
  - `docs/research/systems/slate-v2-overlay-architecture.md`
  - `docs/research/decisions/slate-v2-overlay-superiority-vs-legacy-and-field.md`
- raw paths inspected:
  - `../slate-v2/packages/slate-react/src`
  - `../slate-v2/packages/slate-react/test`
  - `../slate-v2/docs/walkthroughs/09-performance.md`
- direct raw files read:
  - `../slate-v2/packages/slate-react/src/projection-store.ts`
  - `../slate-v2/packages/slate-react/src/hooks/use-slate-selector.tsx`
  - `../slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`
  - `../slate-v2/packages/slate-react/src/hooks/use-slate-widgets.tsx`
  - `../slate-v2/docs/walkthroughs/09-performance.md`
- official source entrypoints checked:
  - local repo source
- strongest evidence found:
  - runtime-id keyed local subscription is real
  - `useSyncExternalStore`-backed selectors and stores are real
  - current projection recompute still starts from `source(Editor.getSnapshot(editor))`
- disposition:
  - `evidenced`
- next action:
  - compile the local limit honestly: same class on UI subscription, not yet
    clearly field-best on core invalidation

### ProseMirror

- compiled pages inspected:
  - `docs/research/entities/prosemirror.md`
  - `docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md`
  - `docs/research/systems/editor-architecture-landscape.md`
- raw paths inspected:
  - `../prosemirror`
  - `../prosemirror/view/src`
  - `../prosemirror/state/src`
- direct raw files read:
  - `../prosemirror/README.md`
  - `../prosemirror/view/src/decoration.ts`
  - `../prosemirror/view/src/viewdesc.ts`
  - `../prosemirror/state/src/selection.ts`
- official source entrypoints checked:
  - `../prosemirror/README.md`
  - `https://prosemirror.net`
- strongest evidence found:
  - child-scoped mapped overlay propagation
  - durable selection bookmarks
  - incremental view/update discipline
- disposition:
  - `evidenced`
- next action:
  - update compiled source/system pages with the stronger perf-architecture read

### Lexical

- compiled pages inspected:
  - `docs/research/entities/lexical.md`
  - `docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md`
  - `docs/research/systems/editor-architecture-landscape.md`
- raw paths inspected:
  - `../lexical`
  - `../lexical/packages/lexical/src`
  - `../lexical/packages/lexical-react/src`
  - `../lexical/packages/lexical-mark/src`
  - `../lexical/packages/lexical-playground/src`
- direct raw files read:
  - `../lexical/README.md`
  - `../lexical/packages/lexical/src/LexicalUpdates.ts`
  - `../lexical/packages/lexical-react/src/useLexicalSubscription.tsx`
  - `../lexical/packages/lexical-mark/src/MarkNode.ts`
  - `../lexical/packages/lexical-playground/src/commenting/index.ts`
  - `../lexical/packages/lexical-playground/src/plugins/CommentPlugin/index.tsx`
- official source entrypoints checked:
  - `../lexical/README.md`
  - `https://lexical.dev/docs/intro`
- strongest evidence found:
  - dirty leaf/element transform heuristic
  - explicit React subscription helper
  - mark ids, comment store, and decorator UI are split
- disposition:
  - `evidenced`
- next action:
  - update compiled source/system pages with the stronger runtime verdict

### VS Code

- compiled pages inspected:
  - `docs/research/entities/vscode.md`
  - `docs/research/sources/editor-architecture/service-channels-and-live-stores.md`
  - `docs/research/systems/editor-architecture-landscape.md`
- raw paths inspected:
  - `../vscode`
  - `../vscode/src/vscode-dts`
  - `../vscode/src/vs/editor`
- direct raw files read:
  - `../vscode/README.md`
  - `../vscode/src/vscode-dts/vscode.d.ts`
  - `../vscode/src/vs/editor/common/services/markerDecorationsService.ts`
  - `../vscode/src/vs/editor/browser/widget/codeEditor/codeEditorWidget.ts`
  - `../vscode/src/vs/editor/common/viewModel/viewModelImpl.ts`
- official source entrypoints checked:
  - `../vscode/README.md`
  - `https://code.visualstudio.com`
- strongest evidence found:
  - typed decoration handles
  - independent comment controller surface
  - view-model separation from widget/editor shell
- disposition:
  - `evidenced`
- next action:
  - promote VS Code from “typed channels” only to a real perf-architecture
    reference

### React 19.2

- compiled pages inspected:
  - none; current lane has no dedicated React 19.2 compiled page
- raw paths inspected:
  - official docs only
- direct raw files read:
  - `https://react.dev/reference/react/useTransition`
  - `https://react.dev/reference/react/useDeferredValue`
  - `https://react.dev/reference/react/useSyncExternalStore`
  - `https://react.dev/reference/react/Activity`
- official source entrypoints checked:
  - `https://react.dev`
- strongest evidence found:
  - external store subscriptions are a first-class React primitive
  - transitions are non-blocking and interruptible
  - hidden `Activity` preserves state/DOM for later restore
- disposition:
  - `compile gap`
- next action:
  - create a dedicated compiled React 19.2 source page for this lane

## Context corpora

### Existing context-only candidates

- compiled pages inspected:
  - `docs/research/systems/editor-architecture-landscape.md`
  - `docs/analysis/editor-architecture-candidates.md`
- strongest evidence found:
  - Tiptap, Premirror / Pretext, TanStack DB, EditContext, and the lightweight
    surfaces still matter as context, but they do not materially change the
    direct perf-architecture verdict against the named serious compare set
- disposition:
  - `synthesis gap`
- next action:
  - keep them in the landscape/system page as context, not fake direct proof

# Progress

## 2026-04-15

- read `docs/research/README.md`, `index.md`, `log.md`, and
  `docs/research/commands/full-pipeline.md`
- inspected the current compiled editor-architecture lane
- verified direct candidate repos and revisions:
  - ProseMirror `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc`
  - Lexical `d52f66e250e031a6c6fd8836d160373b0df557c7`
  - VS Code `bd5165ae94b03646adfba2fd80095d7d26c226b1`
- updated the compiled research layer with:
  - a dedicated React 19.2 source page
  - stronger ProseMirror / Lexical / VS Code source summaries
  - a sharper landscape/system verdict
  - an explicit decision rejecting blanket theory-only superiority claims
    while naming the best next reshape
- updated `docs/research/index.md`, `docs/research/log.md`, and the editor
  architecture source README

# Errors

- there is still no normalized `../raw/<corpus>` family for these editor
  architecture candidates; the lane remains partially backed by official local
  clones under `../`
