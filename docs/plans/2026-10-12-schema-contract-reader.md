# Schema contract reader accepts mention voids

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/1SnBcjsoH769i2jar2ByFY
Playbook: bug-fix

`readEditorSchemaContract` refused `apps/www/src/registry/components/editor/plugins.schema.json` at `6fa1169c5e`, and it refused a freshly generated copy too. `plate migrate new` reads the committed artifact through it (`packages/cli/src/migrate.ts:107`), so the CLI refused the www editor's own artifact. The fingerprint matched; the shape check `isContractElementBehavior` refused the `mention` element, whose `voidKind` is `markable-inline`.

## Brief

### What will change?

Plate's migrate command now works on the www editor. It used to reject the saved schema file of any editor with mentions, so it quit before doing anything.

### What could go wrong?

Low risk. The file reader now accepts one more kind of element that Plate already writes, and it still rejects made-up ones. Nothing is committed yet. That part is yours.

## Main changes

- The generator was right and the reader was wrong. `CompiledSchemaElementBehavior.voidKind` is typed `SchemaElement['void'] | null`, which is `'block' | 'inline' | 'markable-inline' | null`, and the compiler accepts all three kinds. The reader's own list held only `block` and `inline`.
- `packages/plitejs/src/core/schema-compiler.ts` now keeps one void-kind table, `schemaVoidKinds`, typed as a record keyed by every member of `SchemaElement['void']`, so a missing kind fails to typecheck. `isSchemaVoidKind` backs the compiler's input check, the compiled `atom` and `void` flags, and the contract reader. It replaces three hand-written lists, the reader's stale one included.
- Every other enumerated value the reader checks matches its type: descriptor kinds, target kinds, lifecycle policies, merge, placement, role, root ownership, structure kinds and construction-plan kinds.

## Close

**Landed, uncommitted on `next`.** `packages/plitejs/src/core/schema-compiler.ts` and one test in `packages/plitejs/test/schema-contract-generation.test.ts`, `reads back the JSON copy of a contract with every void kind`. The test compiles a schema with a block void, an inline void and a mention-style void, writes it with `createEditorSchemaContract`, round-trips it through `JSON.stringify` and `JSON.parse`, and requires `readEditorSchemaContract` to return an equal contract. The comment-sicko review found no comments to judge. It noted that the compiler's `isVoid` repeated the list, so this change deletes that copy. I left out its other suggestion, a type guard on `isSchemaVoidKind`, because no caller needs the narrowing.

**Proof.** Logs are in `docs/plans/artifacts/2026-10-12-schema-contract-reader/`.

- `bisect-shape.ts` runs each private shape check on the base and current artifacts. Only `elements.byType` failed, on `mention` with `voidKind: "markable-inline"`, and the fingerprint comparison passed.
- The new test failed before the fix, with 5 pass, 1 fail and `actual: undefined` (`red-unit.log`), and passes after it (`green-unit.log`). On the final bytes, the schema-contract, compiler-contract and `compileEditor` tests pass 12 of 12 (`neighbors-2.log`).
- The reader probe accepts the base artifact as `fnv1a64:5c6b05e09589cb4f` and the current one as `fnv1a64:05afbc538cfc2fb0` (`green-probe-2.log`).
- The real CLI, `packages/cli/dist/bin.js`, ran `migrate new reader-proof --entry src/registry/components/editor/plugins.ts` from `apps/www` in a detached worktree at `6fa1169c5e`. Before the fix it exits 1 with "Committed Plate schema artifact is invalid" (`red-cli.log`). After the fix and a `plitejs` dist rebuild, it exits 0 and creates the migration, and its `from.schema.json` deep-equals the committed artifact (`green-cli-2.log`, `green-cli-migration/`).
- On the final bytes, `pnpm --filter plitejs typecheck` passes (`typecheck-plitejs-2.log`), the plitejs core partition passes 1,867 tests (`core-partition.log`), the CLI suite passes 78 of 78 (`cli-tests-3.log`), and `pnpm lint:task` is clean on both files (`lint-task-2.log`).

**Limits.** The CLI ran against this checkout's `plitejs` dist, rebuilt from the current tree, which also holds other sessions' uncommitted plitejs edits. That rebuild is a side effect left in `packages/plitejs/dist`. One CLI suite run failed 36 of 78 (`cli-tests-2.log`), because `packages/plitejs/dist` was rewritten at 19:10:15 while it ran, nine minutes after this run's last build, so its bundles could not find `plitejs`. The rerun on the same bytes passed. The migration it scaffolded lists two compatible property additions, `listId` and `listLevels`, which come from the compile step and not from the reader. `pnpm check` did not run, because the change stays inside one file's schema compile and contract read.

**No changeset.** `plitejs` has never shipped code; npm 0.0.1 is an empty placeholder. The unreleased `.changeset/generated-editor-contracts.md` already promises `plate migrate new` over serialized contracts, which this fix makes true.
