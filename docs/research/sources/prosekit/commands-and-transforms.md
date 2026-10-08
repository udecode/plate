# ProseKit: commands and transforms

## Selection-scoped block commands

- **Selection-scoped commands.** The command specs in `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/core/src/commands` (`insert-default-block.spec.ts`, `select-block.spec.ts`, `toggle-wrap.spec.ts`, `unset-block-type.spec.ts` and `unset-mark.spec.ts`) pin that commands scoped to the selection keep the selected content while they insert a default block, expand the selection to whole blocks, wrap or lift, reset the block type or remove marks. Plite's transaction and command laws plus Plate feature code own the operation shape; there is no ProseMirror command port (`docs/editor-test-harvester/prosekit/report.md:135`).

## Hard break

- **Hard break.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:registry/test/hard-break.test.ts` (L10) pins that the Insert Hard Break toolbar button and Shift+Enter each add one `<br>`. Plite's editing kernel maps Shift+Enter to a soft `insert-break` command (`packages/plitejs/src/react/editable/editing-kernel.ts`), backed by the `insertSoftBreak` editor command (`packages/plitejs/src/core/editor-commands.ts`), and a Plate plugin can refuse it, as `packages/platejs/src/utils/plugins/SingleLinePlugin.ts` does (`docs/editor-test-harvester/prosekit/report.md:142`).
