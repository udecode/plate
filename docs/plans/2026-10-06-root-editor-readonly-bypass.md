# Root editors ignore a read-only mount

Status: planning: waiting on your go to fix
Page: https://claude.ai/artifact/LsGbZXg9upXb8TAwbd5CGr
Playbook: bug-fix

A root editor from `useRootEditor` writes into a root that an `EditorRoot` mounts read-only. `createPliteRootEditor` (`packages/plitejs/src/react/hooks/use-plite-runtime.tsx:805-813`) builds its view with `getView({ readOnly, root })` from the runtime owner, and a new view takes its read-only flag only from that option or from its source view (`packages/plitejs/src/editor-runtime-view.ts:1306-1308`). The mounted view's read-only flag lives on that view alone (`packages/plitejs/src/react/components/plite.tsx:321`), so the root editor never sees it. `useCommand` avoids the bug only when the root has a registered view, because it dispatches through `getMountedViewEditor`. The React hook plan, `docs/plans/2026-10-06-react-review.md`, keeps `useCommand` and the `readOnly` option for this reason, and its start gate needs this plan to exist. This plan fixes nothing until the owner's go.

## Brief

### What will change?

Nothing changes yet; this plan records the bug and its cause. A fix makes a root editor follow the read-only setting of the view that shows that root.

### What could go wrong?

Two views of one root can disagree, one read-only and one editable. The fix must pick which view's setting wins, and history uses the same root editor.

## Public API

A root editor obeys the read-only mount of its root, so this toolbar write is rejected like a typed edit.

```tsx before
// docs/plans/artifacts/2026-10-06-react-review/panel/round-1/readonly-policy-probe.test.tsx
rootEditor.update((tx: any) => {
  tx.text.insert('R', { at: { path: [0, 0], offset: 0 } });
});
```

```tsx after
// docs/plans/artifacts/2026-10-06-react-review/panel/round-1/readonly-policy-probe.test.tsx
rootEditor.update((tx: any) => {
  tx.text.insert('R', { at: { path: [0, 0], offset: 0 } });
}); // throws "Cannot update a read-only editor view."
```

## Main changes

- The producer to fix is `createPliteRootEditor`, which every caller shares: `useRootEditor`, `useEditorHistory` (`packages/plitejs/src/react/hooks/use-plite-history.ts:136-145`) and `useCommand`'s fallback for a root with no registered view (`use-plite-runtime.tsx:899-905`).

## Steps

- [ ] Reproduce. Done at base by the probe: under a read-only header mount, `useRootEditor('header')` reports `isReadOnly` false and writes "R", while `useCommand` throws; under an editable mount both write. Proof: `docs/plans/artifacts/2026-10-06-react-review/panel/round-1/readonly-policy-probe.jsonl`.
- [ ] Settle which view's policy a root editor follows when two views of one root disagree, and when none is mounted, before any code. Proof: a recorded decision in this plan and its log.
- [ ] Write a public-boundary test first that fails on the probe's case, then fix the producer, then add the history and two-view cases. Proof: the tests fail at base and pass after, from `packages/plitejs` with `bun run test:react`.

## Open work

- The fix waits for the owner's go. owner: zbeyens. stop: the owner says go on this plan, or drops it.
