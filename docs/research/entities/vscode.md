---
title: VS Code
type: entity
status: partial
updated: 2026-04-15
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-overlay-architecture-cuts.md
---

# VS Code

Type: editor-platform architecture reference

VS Code matters here because it proves mature editors split visual channels and
comment systems aggressively.

## Why it matters

- decorations are channel/type based
- comments use a separate controller surface
- this is the best non-rich-text proof that one generic overlay bucket is the
  wrong shape

## Strongest local evidence

- `../vscode/src/vscode-dts/vscode.d.ts`
- `../vscode/src/vs/editor/common/services/markerDecorationsService.ts`
- `../vscode/src/vs/editor/browser/widget/codeEditor/codeEditorWidget.ts`
- `../vscode/src/vs/editor/common/viewModel/viewModelImpl.ts`

## Limits

- not a direct rich-text engine benchmark
- strongest for channel separation and service boundaries, not DOM editing
- not a reason to claim React editors are automatically faster than a dedicated
  editor/view-model stack
