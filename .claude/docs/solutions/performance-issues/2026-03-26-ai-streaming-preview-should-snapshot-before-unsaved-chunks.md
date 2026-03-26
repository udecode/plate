---
module: AI
date: 2026-03-26
problem_type: performance_issue
component: assistant
symptoms:
  - "Long insert-mode AI streams make `tf.ai.undo()` slower as chunk count grows"
  - "Accepting streamed AI output also gets slower after long responses"
  - "The last AI undo batch contains one history entry but still stores a large number of underlying operations"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - ai
  - streaming
  - undo
  - history
  - withAIBatch
  - streamInsertChunk
  - performance
---

# AI streaming preview should snapshot before unsaved chunks

## Problem

Insert-mode AI streaming was wrapping every `streamInsertChunk` call in `withAIBatch`.

That looked reasonable because it kept the whole preview in one undo batch, but the batch still accumulated every streamed operation. Undo cost therefore scaled with chunk count instead of the final accepted content.

## Symptoms

- `tf.ai.undo()` became progressively slower after long streamed responses.
- Accepting insert-mode AI output also slowed down after long streams.
- History looked compact at a glance because there was only one undo batch, but that batch still held a large operations array.

## What Didn't Work

Reading `withAIBatch` in isolation was misleading. It only does two things:

1. merge into the current history batch
2. tag the batch as AI-generated

It does not compact prior operations.

Chasing `streamInsertChunk` alone was also the wrong level. The real problem was not the transform logic itself. The problem was treating streamed preview updates as normal history writes.

## Solution

Capture the editor state once before insert-mode streaming starts, stream preview chunks with `withoutSaving`, and only write history when the user accepts the final result.

The implementation had three parts:

### 1. Capture a pre-stream snapshot

```ts
captureAIStreamSnapshot(editor);

editor.tf.withoutSaving(() => {
  editor.tf.insertNodes({
    children: [{ text: '' }],
    type: getPluginType(editor, KEYS.aiChat),
  });
});
```

### 2. Keep streamed preview out of history

```ts
editor.tf.withoutSaving(() => {
  if (!getOption('streaming')) return;

  editor.tf.withScrolling(() => {
    streamInsertChunk(editor, chunk, {
      textProps: {
        [getPluginType(editor, KEYS.ai)]: true,
      },
    });
  });
});
```

### 3. Accept by restoring the snapshot, then committing the final value once

```ts
if (!commitAIStreamValue(editor, getAcceptedInsertValue(editor))) {
  withAIBatch(editor, () => {
    tf.ai.removeMarks();
    editor.getTransforms(AIChatPlugin).aiChat.removeAnchor();
  });
}
```

`tf.ai.undo()` also gained a snapshot restore fallback. If there is no AI-tagged history batch but AI preview content still exists, it restores the captured pre-stream state instead of trying to replay chunk history.

## Why This Works

Preview streaming and accepted editor history have different jobs:

- preview streaming needs responsive incremental rendering
- accepted editor history needs one sane undo step

Using one mechanism for both creates the slowdown. A merged history batch is still a transcript of every chunk. Restoring a snapshot avoids that transcript entirely.

The accept path then turns the preview into one fresh history entry whose cost scales with the final document diff, not with how many network chunks arrived on the way there.

## Prevention

- Do not use `withAIBatch` for insert-mode preview streaming. Use it for saved AI edits, not for chunk-by-chunk preview rendering.
- If streamed content is disposable preview state, snapshot first and stream with `withoutSaving`.
- When accept should remain undoable, restore the snapshot and commit the final accepted value in one new batch.
- Test both sides of the flow:
  - preview streaming should leave history empty before accept
  - accept should create one compact undoable batch
  - `tf.ai.undo()` should restore the original pre-stream value when preview is still present
