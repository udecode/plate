# Plugin Authoring Audit

Real repo examples worth copying, plus a few patterns to treat carefully.

## Strong Patterns

### Base plugin + thin Plate wrapper

- [BaseCommentPlugin.ts](packages/comment/src/lib/BaseCommentPlugin.ts)
- [CommentPlugin.tsx](packages/comment/src/react/CommentPlugin.tsx)

Why it is good:

- semantic core lives in `src/lib`
- Plate layer is a thin wrapper
- explicit config type exists because the contract is real

### Base plugin + Plate child wiring

- [BaseCodeBlockPlugin.ts](packages/code-block/src/lib/BaseCodeBlockPlugin.ts)
- [CodeBlockPlugin.tsx](packages/code-block/src/react/CodeBlockPlugin.tsx)

Why it is good:

- base plugin owns semantic rules and transforms
- wrapper only adds Plate child plugins

### Slate-only plugin stays Slate-only

- [HtmlPlugin.ts](packages/core/src/lib/plugins/html/HtmlPlugin.ts)

Why it is good:

- no fake React layer
- semantic ownership is obvious

### Bundle plugin uses direct Plate composition

- [BasicBlocksPlugin.tsx](packages/basic-nodes/src/react/BasicBlocksPlugin.tsx)

Why it is good:

- no fake base plugin theater
- the job is composition, so `createPlatePlugin` is correct

### Real React-native Plate plugin

- [EventEditorPlugin.ts](packages/core/src/react/plugins/event-editor/EventEditorPlugin.ts)
- [PlaywrightPlugin.ts](packages/playwright/src/PlaywrightPlugin.ts)
- [CopilotPlugin.tsx](packages/ai/src/react/copilot/CopilotPlugin.tsx)

Why they are good:

- they live in the Plate/React layer for real reasons
- they are not pretending to be Slate-first semantic plugins

### React-only prop augmentation via `transformProps`

- [BlockSelectionPlugin.tsx](packages/selection/src/react/BlockSelectionPlugin.tsx)
- [NavigationFeedbackPlugin.ts](packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts)

Why they are good:

- they augment existing rendered nodes instead of replacing semantics
- they keep hook-driven logic in the Plate layer
- they avoid fake wrapper components when the real job is prop injection

## Patterns To Treat Carefully

### Shared plugin keys should usually come from `KEYS`

- [plate-keys.ts](packages/utils/src/lib/plate-keys.ts)

Why it matters:

- most shipped package/plugin code already leans on `KEYS`
- raw string keys drift across base plugins, wrappers, and tests
- hardcoded literals are usually fine only for tiny internal plugins or local
  test fixtures

### Manual `SlateEditor` callback annotations

- [BaseTextAlignPlugin.ts](packages/basic-styles/src/lib/BaseTextAlignPlugin.ts)

Why to be careful:

- it works
- it is older style
- it teaches a worse habit than letting plugin context inference do the work

Do not cargo-cult this unless inference genuinely fails and a better typed
shape is not available.

### Editor-locked helper extraction

- [BaseAIPlugin.ts](packages/ai/src/lib/BaseAIPlugin.ts)

Why to be careful:

- extracting `getAITransforms(editor: SlateEditor)` is workable
- it also encourages editor-threading patterns that the newer callback context
  APIs often make unnecessary

Prefer context-local helpers or better generic shapes before copying this.
