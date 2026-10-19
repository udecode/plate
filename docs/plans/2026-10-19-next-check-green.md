# Make the full check pass on next

Status: building, full check again after the IME bridge
Page: https://claude.ai/artifact/2cXMFmv3whUediiY6PvE29
Playbook: bug-fix

## Brief

### What will change?

You asked to fix every failing check on next first. Lint, two audits, the bridge check, two ledger laws, the AI discard pair, a footnote spec and the CLI tests pass. Lint rules get the editor to skip code blocks.

### What could go wrong?

Old lint rules still work. IME typing still skips insert-text handlers; the audit names it. The docs checks flag older plans another task owns. Two recording laws still fail on random seeds; waiting tasks own them.

## Teach

The full check runs every lint, audit, type and test step CI runs. CI on next has been off since October 16, and two big "v2" squashes landed with ten of its twenty-seven steps red.

Most failures were drift. A generated file was stale, a file was unformatted, and a test listed renamed exports. Three needed a real owner. Lint rules compared a block's type to a plugin name, which the schema audit forbids, and had no editor to ask for the real type. Two public types reached a public entry through Plite's private bridge. A speedup merged neighboring removals, but the review ledger judged them apart.

Now lint rules get the editor, the two types come from the Plite root, and the ledger hides the point where two removals meet.

## Public API

An author takes back their own pending change without leaving a decision behind.

```ts before
// packages/platejs/src/ai/react/AIChatPlugin.ts
tx.plugin(AuthoredPlugin).decide({
  action: 'reject',
  changes: [previous],
});
```

```ts after
// packages/platejs/src/ai/react/AIChatPlugin.ts
tx.plugin(AuthoredPlugin).withdraw([previous]);
```


A lint rule reads the editor from its context to find the code block's type.

```ts before
// apps/www/src/registry/components/editor/lint.tsx
const isProse = (block: Element) => block.type !== PLUGINS.codeBlock;

export const commaSpacing: LintRule = {
  id: 'style/comma-spacing',
  severity: 'error',
  check: (text, { block }) =>
    isProse(block)
```

```ts after
// apps/www/src/registry/components/editor/lint.tsx
import { BaseCodeBlockPlugin, type Editor, type Element } from 'platejs';

export const isProse = (editor: Editor, block: Element) => {
  const codeBlock = editor.plugin(BaseCodeBlockPlugin);

  return !codeBlock.installed || block.type !== codeBlock.schema.type;
};

export const commaSpacing: LintRule = {
  id: 'style/comma-spacing',
  severity: 'error',
  check: (text, { block, editor }) =>
    isProse(editor, block)
```

The projection types are importable from the Plite root as well as from `plitejs/authored`.

```ts before
// packages/platejs/src/lib/editor/withPlite.ts
import {
  type AuthoredDocumentProjection,
  type AuthoredProjectionDiagnostic,
} from 'plitejs/internal';
```

```ts after
// packages/platejs/src/lib/editor/withPlite.ts
import type {
  AuthoredDocumentProjection,
  AuthoredProjectionDiagnostic,
} from 'plitejs';
```

## Main changes

- `LintRule.check` in `packages/platejs/src/features/lint/lib/BaseLintPlugin.ts` receives `editor` beside `block` and `signal`. The registry rules, the lint demo and both lint docs compare through `editor.plugin(BaseCodeBlockPlugin)` on the base `Editor`, because the rule gets a base editor, and skip nothing when the code block plugin is not installed.
- `plitejs/internal` no longer exports `AuthoredDocumentProjection` or `AuthoredProjectionDiagnostic`. The `plitejs` root exports them from their declaration, and `plitejs/authored` keeps its plain re-export. Aliases in `plitejs/authored` would satisfy the bridge check but break `no-second-name`, and the platejs core partition cannot import `plitejs/authored` (TS6307).
- `RootProjection.hides` in `packages/plitejs/src/authored/ledger/projection.ts` answers true at a run's start when that run opens with a removal and the run before it ends with one there. Since c5921381cf, `addSection` merges such removals, so the composed change hides that position and the ledger must agree. An ordered run answers first, and a previous ordered run never counts as a removal.
- `footnote.navigation.spec.tsx` mocks `focus` as an own property, because another spec's `userEvent.setup()` can leave it a prototype getter that `spyOn` rejects.
- The CLI wraps esbuild's `build` in `packages/cli/src/esbuild.ts`, which stops and retries once when esbuild's service process died, so later builds in the same process work.
- `packages/platejs/turbo.json` is regenerated, `route.test.ts` is formatted, the schema adoption baseline drops six entries the tree no longer holds, the public import smoke lists `getLineBoundaryKeyboardMove`, and `BaseColumnPlugin.spec.ts` compares the column group through its schema type.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Lint rule skip for code | Give each rule the editor (look) | Leave the two lines failing the audit | no lint editor | small |
| Projection types home | Export them from the Plite root (look) | Keep the private bridge and change the bridge check | bridge types | small |
| AI discard pair | Fix it in its own slice after this one (look) | Change both tests to expect the leftover records | AI tests to law | big |
| IME typing audit | Name the desktop composition write as a bridge in the kernel authority audit (look) | Teach the insert-text command to land a composition inside struck text | IME command | big |

## Steps

- [x] Rerun the full check on current next and split real failures from load flakes. Proof: `ci-rerun-a2.log`, `alone2-*.log` in the run directory.
- [x] Fix each real failure at its cause. Proof: per-step logs in the decision log.
- [x] Writing passes and panel round one on the diff. Proof: `panel-r1-*.md` in the run directory.
- [x] Round-one fixes, then land. Round two skipped on the owner's "fast"; the fixes and the CLI commit stay unreviewed until "full". Proof: `restore-*-a1.log` in the run directory.
- [x] Full check after batch one: 5 of 28 steps fail. `www` fails on batch one's new root types in the API reference, plite-test on the AI pair, core-audits on the IME audit, review-ledger and knowledge on older plans that task t_3ea68f2e owns. Proof: `check-after-b1-a1.log`.
- [x] AI discard slice: `update.authored.withdraw(changes)` takes back the author's own pending change with no verdict and no held member, AIChatPlugin's Discard and each streamed chunk withdraw the previous preview, and the API reference excludes the two root projection types. Proof: `ai-specs-a1.log`, `ai-authored-tests-a1.log`, `ai-types-b-a1.log`, `ai-plite-test-b-a1.log`, `ai-www-typecheck-c-a1.log`.
- [x] IME audit slice: routing the desktop composition through the insert-text command passes Chromium but fails "IME composition inside struck text splits the deletion" in Firefox and WebKit, because the command runs on the proposed view, where struck text does not exist. The direct write stays, and the audit lists it as a named bridge. Proof: `ime-chromium-a1.log`, `ime-firefox-a1.log`, `ime-webkit-a1.log`, `ime-audit-b-a1.log`.
- [ ] Full check again.
