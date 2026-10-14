# Reserve text as an element property key

Status: executed: ready for your commit
Page: https://claude.ai/artifact/BfVQD71v5ojLBUyZqfwCNK
Playbook: bug-fix

## Brief

### What will change?

If a plugin gives a block a field called text, the editor now stops at setup and says that name is taken. Before, it crashed later with a confusing error, or mistook the block for text. The tested fix waits in your working tree.

### What could go wrong?

Outside plugins that name a block field text, or claim every field starting with te, now fail at setup. Nothing in this repo does. I also went one step past the plan. Blocks and text now share one list of taken names.

## Teach

The editor tells a text leaf from a block by its fields. A leaf has a text string. A block has a type and a list of children. A schema lets plugins add their own fields to blocks and leaves, and it refuses names that would make the two look alike. A leaf can't claim children or type, and a block can't claim children or type.

The block's list left out text. So a plugin could give a block a field named text, and every block built with it then looked like a leaf too. With a default value, the editor crashed while building its first block and blamed an unknown children field. Without one, a read that asks "is this text?" said yes, so a text-only spot could seem to accept the block.

The fix adds text to the block's refused names. That made the block list match the leaf list, so the two became one list that can't drift apart again. A schema with that mistake now fails when it installs, with the reserved-name message the other names get.

## Main changes

| Owner | Before | After |
| --- | --- | --- |
| `packages/plitejs/src/core/schema-compiler.ts` reserved property keys | `RESERVED_ELEMENT_KEYS` (`__proto__`, `children`, `constructor`, `prototype`, `type`) and `RESERVED_TEXT_KEYS` (the same plus `text`), picked by placement in `validatePropertyKey` | one `RESERVED_PROPERTY_KEYS` set with all six keys for both placements, so an element property named `text`, or a key prefix that covers it (`t`, `te`, `tex`, `text`), fails with the `reserved-property-key` compile error |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Where to fix it | Refuse the field name when the schema installs | Teach the text check to skip blocks | detect | small |
| Field prefixes | A block prefix that covers text, like te, fails too | Let such prefixes through | prefixes | detail |
| API review | Treat it as a bug fix, with no API review round | Run the API review and a panel first | api review | detail |
| The earlier exit plan's open item | Leave it to that plan, and note it here | Edit that plan to close it | close it | detail |

## Steps

- [x] 1. Spec first, in `packages/plitejs/test/schema-contract.ts`: installing a schema whose element declares a property named `text` throws the reserved-key diagnostic naming `text`. Proof: the spec fails at base `79de482237` through `tooling/scripts/proof-worktree.mjs --expect-fail` and passes after step 2. Done: `docs/plans/artifacts/2026-10-14-element-text-key/red-base-a1.log` fails with `Missing expected exception` at base, and `docs/plans/artifacts/2026-10-14-element-text-key/green-selected-a1.log` passes it.
- [x] 2. `packages/plitejs/src/core/schema-compiler.ts`: add `text` to `RESERVED_ELEMENT_KEYS`. Proof: the step 1 spec; the public-entry probe `docs/plans/artifacts/2026-10-14-element-text-key/repro-probe.ts` refuses at install with the reserved-key message naming `text` in both its closed and `preserve` variants; the `plitejs` schema tests, `pnpm --filter plitejs typecheck`, and the `platejs` `BaseStylePlugins.spec.ts`, which installs the `textAlign`, `textIndent` and `lineHeight` element properties. Done: the probe refuses with the reserved-key message naming `text` in both variants (`docs/plans/artifacts/2026-10-14-element-text-key/repro-fixed-a1.log`, `docs/plans/artifacts/2026-10-14-element-text-key/repro-fixed-preserve-a1.log`); `docs/plans/artifacts/2026-10-14-element-text-key/prefix-fixed-a2.log` refuses the prefixes `te` and `text` and still installs `textAlign` and the prefix `data_`; `docs/plans/artifacts/2026-10-14-element-text-key/green-selected-a1.log` passes 379 tests across the 13 `plitejs` schema files, `architecture-contracts.test.ts` and `BaseStylePlugins.spec.ts`, against 378 and the new spec failing before the edit (`docs/plans/artifacts/2026-10-14-element-text-key/baseline-pre-edit-a1.log`); `docs/plans/artifacts/2026-10-14-element-text-key/typecheck-plitejs-a1.log` runs 13 tasks, 0 cached, exit 0.
- [x] 3. Changeset for `plitejs`, decided through the `changeset` skill. Proof: the changeset file or its skip reason. skip: `plitejs` has never shipped the schema compiler; npm holds only the 3-file `0.0.1` placeholder, so users upgrading from the release baseline never saw this bug.

- [x] 4. Deviation, added during the writing pass: with `text` added, `RESERVED_ELEMENT_KEYS` equalled `RESERVED_TEXT_KEYS`, so both became one `RESERVED_PROPERTY_KEYS` set and `validatePropertyKey` lost its placement ternary. Text placement keeps the same six keys. Proof: `docs/plans/artifacts/2026-10-14-element-text-key/green-selected-a2.log` passes 379 of 379 on the final bytes, the probes `docs/plans/artifacts/2026-10-14-element-text-key/repro-fixed-a2.log`, `docs/plans/artifacts/2026-10-14-element-text-key/repro-fixed-preserve-a2.log` and `docs/plans/artifacts/2026-10-14-element-text-key/prefix-fixed-a3.log` repeat step 2's results, and `docs/plans/artifacts/2026-10-14-element-text-key/typecheck-plitejs-a2.log` runs 13 tasks, 0 cached, exit 0.

## Evidence

- Reproduced through `createEditor` on current source: a closed schema throws `Unknown text property "children" in closed editor schema.` (`docs/plans/artifacts/2026-10-14-element-text-key/repro-head-a1.log`), and the same schema with `unknown: 'preserve'` throws `Content slice node at [0] must have exactly one structural field.` (`docs/plans/artifacts/2026-10-14-element-text-key/repro-head-preserve-a1.log`). Both come from the built default `body` element, which carries `text` and `children`.
- The earlier probe `docs/plans/artifacts/2026-10-14-exit-level-read/probe-astra-seat-cases-a1.log` shows the silent case. With `preserve` and a non-default first block, the schema's internal `canContain` accepts the built `body` inside a block that allows only text.
- No shipped schema or Plate plugin declares an element property named `text` or a key prefix covering it. `docs/plans/artifacts/2026-10-14-element-text-key/scan-shipped-a2.log` scans 4,970 files under `packages`, `apps`, `content`, `templates` and `tooling` and finds 0 hits, and its control `scan-control-a2.log` finds the probe's declaration. The scan reads literal keys in `properties` objects, `elementProperty` calls and `key.prefix` calls; a key built at runtime is not covered.

## Close

Reversal first. Step 2 as approved added `text` to `RESERVED_ELEMENT_KEYS` only. The comment review's side finding showed the two reserved sets were then equal, so step 4 merged them into `RESERVED_PROPERTY_KEYS`. Element placement gains `text`; text placement is unchanged.

What landed, uncommitted on `next` for the owner's commit:

- `packages/plitejs/src/core/schema-compiler.ts`: one `RESERVED_PROPERTY_KEYS` set reserves `__proto__`, `children`, `constructor`, `prototype`, `text` and `type` for element and text properties alike.
- `packages/plitejs/test/schema-contract.ts`: the case "rejects an element property named text, which would read as a text node" installs a schema whose element declares `text` and expects the reserved-key error naming `text`.

Proof and its limits:

- Red before the fix. The new case fails at base `79de482237` in a detached worktree with `Missing expected exception` (`docs/plans/artifacts/2026-10-14-element-text-key/red-base-a1.log`).
- Green after. On the final bytes, whose hashes are in `docs/plans/artifacts/2026-10-14-element-text-key/final-bytes.sha256`, `bun test` over the 13 `plitejs` schema test files, `architecture-contracts.test.ts` and `BaseStylePlugins.spec.ts` passes 379 of 379 (`docs/plans/artifacts/2026-10-14-element-text-key/green-selected-a2.log`), against 378 passing and only the new case failing before the edit.
- Public entry. `createEditor` from `plitejs` source with the probe schema now throws `Schema element property at elements.body.properties.text cannot claim reserved key "text".` in its closed and `preserve` variants, where it threw a text-node error before. Element prefixes `te` and `text` refuse, and the exact key `textAlign` and the prefix `data_` still install. The probes ran from source, not `dist`.
- `pnpm --filter plitejs typecheck` passes with 0 of 13 tasks cached, and `pnpm lint:task` on both files reports 0 warnings and 0 errors (`docs/plans/artifacts/2026-10-14-element-text-key/lint-task-a1.log`).
- Hand drive. `hand-drive.mjs check` passes (`docs/plans/artifacts/2026-10-14-element-text-key/hand-drive-check-a1.log`) after `route --none`, because the change renders on no page.
- Limits. The shipped-code scan reads literal keys only, so a key a plugin builds at runtime is not covered. A document that arrives with an element carrying `text` is still judged by the existing one-structural-field and unknown-property checks, which this fix does not change. No full `pnpm check` ran.

Skipped. There is no changeset, because `plitejs` never shipped the schema compiler. No panel, because no review row applies to a bug fix left on `next`; the Defaults row "API review" holds that call.

Flagged, not edited. `docs/plans/2026-10-14-exit-level-read.md` keeps the open item "An element with a property named `text` reads as text", whose stop is this task landing. It belongs to that plan's session and closes once the owner commits this fix.

## Open work

- Tick the exit-level-read plan's text-property item once this fix is committed on `next`; it is tracked in that plan's Open work. owner: zbeyens. stop: the owner commits this fix, or dismisses that item.
