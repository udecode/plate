# Camel case plugin key migration

Objective:
Execute the accepted camelCase plugin-key migration; done when all 13 keys,
12 frozen node types, callers, docs, tests, Core/www, and Browser gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-20-camel-case-plugin-key-migration.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- All 13 production snake_case built-in plugin keys use their accepted
  camelCase identities.
- All 12 node/mark plugins explicitly preserve their accepted `NODES` value,
  while `BaseSlashPlugin` remains behavior-only.
- No old built-in tx/update/shortcut namespace or `CODE_DRAWING_KEY` export
  remains.
- Focused RED→GREEN tests, affected package typechecks/tests, `check:core`, www
  typecheck/docs parity, lint, source audits, changesets, Browser proof, review,
  and `check-complete` pass.

Verification surface:
- Source audit of every production plugin declaration and every snake_case key
  registry entry under `packages/**` and `apps/www/src/**`.
- Cross-check each affected key against resolved `plugin.node.type`,
  transaction/API namespaces, shortcut IDs, overrides, docs, and examples.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-20-camel-case-plugin-key-migration.md`.
- Focused package tests/typechecks per vertical slice, then `pnpm check:core`,
  `pnpm --filter www typecheck`, `pnpm lint:fix`, and affected standalone demo
  Browser proof.

Constraints:
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Execute all accepted slices without pausing; stop only for a real blocker or
  final verified handoff.
- Preserve all serialized node/mark values byte-for-byte and never edit
  CI-controlled `templates/**` or `apps/www/public/r/**`.

Boundaries:
- In scope: all production Plate plugin declarations in `packages/**` and
  `apps/www/src/**`; shared key registries; public plugin/API/transaction
  namespaces; the exact serialized node or mark discriminator that each renamed
  plugin must preserve; TDD migration ordering.
- Source owners: `packages/core` plugin factory/resolution/type inference,
  `packages/utils` key registries, affected feature packages, and
  `apps/www/src` registry/adoption.
- Non-goals: compatibility aliases, renaming serialized document node types or
  mark properties, and test-only fixture keys unless they prove a production
  contract.
- Direct Plite boundary owners: N/A; Plite transactions expose the extension
  surface, but Plate owns plugin keys, generated plugin transaction namespaces,
  and node-type mapping.

Output budget strategy:
- Read plugin factory/type owners first. Use bounded file lists and counts before
  matching lines. Exclude `node_modules`, generated output, templates, build
  artifacts, and tests from the production inventory; inspect focused tests
  only as contract evidence. Keep the complete inventory in this plan rather
  than streaming raw matches.

Blocked condition:
- Block only if a production plugin key cannot be resolved from local source or
  if one key is proven to be externally persisted independently of node data
  and the intended breaking boundary cannot be determined locally.

Plate Plan state:
- status: done
- phase: verified-handoff
- next: none
- handoff: verified

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Inventory every snake_case production plugin key; map frozen node types; make execution TDD-first. |
| Active goal and plan verified | yes | No active goal existed; this plan is the Plate Plan owner. |
| Current owners read | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `packages/core/src/lib/plugin/{PluginConfig,createBasePlugin,getBasePlugin}.ts`, and representative affected plugins. |
| Mode and execution boundary resolved | yes | Standard agent-led planning only; implementation requires explicit acceptance. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Slice 1 inline-equation tracer bullet reaches RED then GREEN.
- [x] Slices 2–6 migrate every remaining key/type family with focused proof.
- [x] Slice 7 semantically adopts every package, registry, app, and current-doc caller.
- [x] Slice 8 adds changesets and closes broad package, Core, www, lint, source-audit, Browser, and review gates.
- [x] Final plan evidence, reboot status, open risks, and mechanical checker are current.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Passed all focused and broad typecheck, test, lint, barrel, changeset, and Browser gates. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final exact audits return zero old plugin declarations, namespaces, or `CODE_DRAWING_KEY` uses in current source. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Current docs, registry source, ten demos, strict JSX data, relative media widths, and projection decoration rendering are verified. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Evidence is recorded in Slice 8, the proof matrix, verification evidence, and timeline. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Verified handoff below; no implementation work remains. |
| Autoreview | yes | Review implementation changes and resolve accepted findings | First review found two stale changeset namespaces; both were fixed. Final review exited clean with no actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-20-camel-case-plugin-key-migration.md` | Final checker pass recorded after this evidence update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Factory-call audit found 13 unique snake_case production keys; source owners and current key/type coupling are recorded below. | Decide |
| Decide | complete | Target key/type split, all 13 verdicts, TDD order, caller adoption, and rejected alternatives are resolved. | Prove and hand off |
| Prove and hand off | complete | Fresh source/contradiction review resolved all gates and prepared the handoff. | User review |
| Accepted-plan execution | complete | All eight slices, broad proof, Browser interaction, changesets, and clean final review completed. | Verified handoff |

Execution progress:

| Slice | Status | Evidence | Next |
| --- | --- | --- | --- |
| 1. Inline equation tracer | complete | RED isolated the snake_case identity; GREEN preserves `NODES.inlineEquation`, exposes `KEYS.inlineEquation`/`tx.inlineEquation`, passes 3 focused tests and Math/Utils typecheck (13 tasks). | Slice 2 |
| 2. Code Drawing | complete | RED isolated `code_drawing`; GREEN exposes `codeDrawing`, preserves serialized nodes, removes `CODE_DRAWING_KEY`, and passes 4 focused tests plus package/Utils typecheck (13 tasks). | Slice 3 |
| 3. Code Block family | complete | RED isolated `code_block`; GREEN splits all three identities, preserves node/mark types, and passes 89 package tests plus package/Utils typecheck (13 tasks). | Slice 4 |
| 4. Combobox identities | complete | Emoji, Mention, and Slash each completed RED→GREEN; Slash preserves a behavior-only parent and `slash_input` child, passes 1 test plus package/Utils typecheck (15 tasks). | Slice 5 |
| 5. Structural nodes | complete | Column Group and classic Todo completed RED→GREEN; Todo has 120 package tests green after semantic fixture repair and package/Utils typecheck (15 tasks). | Slice 6 |
| 6. Media and decoration leaf | complete | Media Embed and Search Highlight completed RED→GREEN; search decorations still emit `search_highlight`; 7 Find Replace tests and package/Utils typecheck (13 tasks). | Slice 7 |
| 7. Semantic adoption | complete | Static node builders/types/comparisons use `NODES`; configured lookups/actions use `KEYS`/`getType`. Markdown 238, AI 72, Core 44, Combobox 30, Link 10, Suggestion 29, registry focus 2; 17 package typechecks and www typecheck/source parity pass. | Slice 8 |
| 8. Closure | complete | Eleven package-scoped breaking changesets; `lint:fix`; `check:core`; www typecheck; 56/56 barrels; changeset status; zero-match hard-cut audits; ten standalone Browser demos; live Find Replace interaction; one accepted review fix followed by a clean review. Browser also drove owner fixes for JSX dev metadata, relative media widths, hook-safe render callbacks, and projection-backed legacy decoration data. | Verified handoff |

Decision brief:
- outcome: Every built-in Plate plugin uses a code-facing key without
  snake_case while existing documents, marks, serializers, and parsers keep
  their current discriminators.
- chosen shape: `KEYS.<name>` is the plugin/runtime identity and uses the
  existing camelCase property name; `NODES.<name>` remains the serialized
  element or mark discriminator. Each of the 12 affected node/mark plugins sets
  `node.type: NODES.<name>` explicitly. `BaseSlashPlugin` changes only its
  behavior-plugin key to `slashCommand`.
- strongest rejected alternative: Add a second `PLUGIN_KEYS` map while leaving
  affected `KEYS` values as node types. That avoids caller work by preserving
  the exact ambiguity that leaked `tx.code_block`; `NODES` already owns node
  types, so another map would be redundant.
- consequence: Plugin lookup, override, transaction, update, and shortcut
  namespaces hard-cut to camelCase. Serialized values such as
  `{ type: 'code_block' }` remain unchanged. Callers that currently use `KEYS`
  directly as node data must move to `NODES` or resolve through
  `editor.plugin(KEYS.<name>).type`.

Exhaustive production inventory:

| Current key | Target key | Plugin owner | Frozen `node.type` | Role | TDD observable |
| --- | --- | --- | --- | --- | --- |
| `action_item` | `listTodoClassic` | `BaseTodoListPlugin` in `packages/list-classic` | `NODES.listTodoClassic` = `action_item` | element + tx | `editor.update((tx) => tx.listTodoClassic.toggle())` and insert-break output retain `action_item` |
| `code_block` | `codeBlock` | `BaseCodeBlockPlugin` in `packages/code-block` | `NODES.codeBlock` = `code_block` | container element + tx + shortcuts | insert/toggle output retains `code_block`; tx/update namespace and shortcut IDs use `codeBlock` |
| `code_drawing` | `codeDrawing` | `BaseCodeDrawingPlugin` in `packages/code-drawing` | `NODES.codeDrawing` = `code_drawing` | void element + tx | insert output retains `code_drawing`; tx/update namespace uses `codeDrawing` |
| `code_line` | `codeLine` | `BaseCodeLinePlugin` in `packages/code-block` | `NODES.codeLine` = `code_line` | strict-sibling element | inserted/deserialized code-block children retain `code_line` |
| `code_syntax` | `codeSyntax` | `BaseCodeSyntaxPlugin` in `packages/code-block` | `NODES.codeSyntax` = `code_syntax` | decoration leaf | syntax ranges still carry the `code_syntax` property and render through the renamed plugin |
| `column_group` | `columnGroup` | `BaseColumnPlugin` in `packages/layout` | `NODES.columnGroup` = `column_group` | container element | insert/toggle/Markdown output retains `column_group` |
| `emoji_input` | `emojiInput` | `BaseEmojiInputPlugin` in `packages/emoji` | `NODES.emojiInput` = `emoji_input` | transient inline void | combobox builder output retains `emoji_input` and nested lookup uses `emojiInput` |
| `inline_equation` | `inlineEquation` | `BaseInlineEquationPlugin` in `packages/math` | `NODES.inlineEquation` = `inline_equation` | inline void + tx | inferred `tx.inlineEquation.insert` stores `inline_equation` |
| `media_embed` | `mediaEmbed` | `BaseMediaEmbedPlugin` in `packages/media` | `NODES.mediaEmbed` = `media_embed` | void element | HTML/Markdown/insert output retains `media_embed` |
| `mention_input` | `mentionInput` | `BaseMentionInputPlugin` in `packages/mention` | `NODES.mentionInput` = `mention_input` | transient inline void | mention builder output retains `mention_input` and nested lookup uses `mentionInput` |
| `search_highlight` | `searchHighlight` | `FindReplacePlugin` in `packages/find-replace` | `NODES.searchHighlight` = `search_highlight` | decoration leaf | generated ranges still carry/render the `search_highlight` property |
| `slash_command` | `slashCommand` | `BaseSlashPlugin` in `packages/slash-command` | N/A: behavior-only plugin, not a document node or mark | behavior/combobox owner | plugin lookup/configuration uses `slashCommand`; no fake serialized node contract is added |
| `slash_input` | `slashInput` | `BaseSlashInputPlugin` in `packages/slash-command` | `NODES.slashInput` = `slash_input` | transient inline void | slash builder output retains `slash_input` and nested lookup uses `slashInput` |

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Key/type ownership | `KEYS` spreads `NODES`, so 12 built-in plugin keys equal serialized snake_case node types | Override the 12 affected `KEYS` entries with their camelCase property names; keep all `NODES` values unchanged | `packages/utils/src/lib/plate-keys.ts` | `NODES` already owns node discriminators; code-facing property access should be normal JavaScript | Update current key docs and every affected `KEYS` use according to whether it means plugin identity or node data | Data-driven public constant tests plus focused source audit | A blind replacement can write camelCase into documents | `rename` |
| Plugin key/type divergence | `createBasePlugin` defaults `node.type` to `key`, but already accepts an explicit different type | Reuse the existing mechanism; no new Core or Plite API | `packages/core` | Core already resolves `node.type -> plugin.key`, `getType(key)`, rendering, and tx grouping independently | Reaffirm existing Core contracts; add feature-level tests where behavior is observable | Existing `createBasePlugin.spec.ts`, `pipeRenderLeaf.spec.tsx`, and `resolvePlugins.ts` plus affected package tests | An unnecessary Core abstraction would widen the change | `keep` |
| Node and mark persistence | None of the 12 affected node/mark declarations sets `node.type`; direct `KEYS` use also constructs and compares node data | Set `node.type: NODES.<name>` in every affected declaration; use `NODES` for static data/property keys and `editor.plugin(KEYS.<name>).type` for configured editor behavior | Affected feature packages, Markdown, AI, registry types and helpers | Preserves documents and configured type overrides while removing identity ambiguity | Migrate `type: KEYS.*`, `typeof KEYS.*`, direct `node.type === KEYS.*`, static schema fixtures, and `[KEYS.codeSyntax]` mark properties by meaning | Serialization snapshots, insertion/parser tests, mark-render tests, and no affected camelCase value in serialized fixtures | Missed direct uses silently corrupt data rather than producing a type error | `move` |
| Behavior-only Slash plugin | `BaseSlashPlugin` inherits meaningless `node.type = slash_command` despite declaring no node behavior | Rename key to `slashCommand`; do not invent or preserve a serialized node type | `packages/slash-command` | A behavior plugin has no document discriminator | Update `SlashConfig`, plugin lookup, docs, and nested `slashInput` ownership | Trigger/default/nested-plugin package test | Someone may have called `getType` on a non-node plugin; that accidental contract is intentionally cut | `cut` |
| Tx/update/shortcut namespaces | `extendTx` groups and shortcut IDs inherit snake_case plugin keys | `tx.codeBlock`, `tx.codeDrawing`, `tx.inlineEquation`, `tx.listTodoClassic`; `codeBlock.selectAll`, etc. | Affected feature packages + Core generated plugin runtime | Namespaces are JavaScript API, not storage | Update inferred package tests, docs API labels, and all direct property/string access | Package typecheck plus runtime command/shortcut tests | Runtime works but declared `PluginConfig` generic remains stale | `rename` |
| Code Drawing constant | Public `CODE_DRAWING_KEY` is both plugin key and node type | Delete it; use `KEYS.codeDrawing` for plugin identity and `NODES.codeDrawing` for node data | `packages/code-drawing` | Keeping the constant would be a compatibility alias and preserve ambiguity | Update tests and any imports; barrel export disappears through the existing file export | Public export audit and package typecheck | External callers receive a deliberate breaking error | `cut` |
| App action and component maps | Some registry maps use `KEYS` as plugin IDs; others use it as actual node-type/action values | Keep plugin/override maps on `KEYS`; move node-type maps, interfaces, comparisons, and values to `NODES` or resolve the installed type before comparing | `apps/www/src/registry` | The migration must not compare `codeBlock` to a stored `code_block` | Audit transforms, discussion index, `plate-types`, suggestion code, toolbar values, kits, and docx overrides by consumer contract | www typecheck, package integration tests, and standalone demo browser proof | Mixed action maps are the most likely visible regression | `move` |
| Public teaching surface | Docs teach both serialized `code_block` and `editor.update.code_block` without distinguishing them | Teach camelCase plugin/command identities and stable snake_case document JSON explicitly | `content/docs` | Users need to know which identity is code and which is data | Update current EN/CN guides and plugin pages; leave generated `apps/www/public/r/**` untouched | Docs source parity and www typecheck | Bulk textual replacement rewrites valid serialized examples | `rename` |
| Compatibility | Old plugin keys could be kept through duplicate plugins, aliases, or dual tx groups | One hard cut; no aliases, shims, duplicate groups, or dual docs | All owners | Dual identity defeats the migration and makes override behavior ambiguous | Changeset names the breaking key/API surface; current docs show only target API | Zero production plugin declaration using any inventoried snake_case key | External callers must migrate atomically | `cut` |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Tracer bullet: inline equation | `packages/utils`, `packages/math`, direct Markdown/registry/docs callers | RED: assert `KEYS.inlineEquation === 'inlineEquation'`, plugin key differs from `NODES.inlineEquation`, `tx.inlineEquation.insert` is inferred, and inserted data remains `inline_equation`; GREEN: migrate only this vertical | Existing Core key/type divergence contract reaffirmed | One complete key/type/tx/data path is green without compatibility code | Focused Utils/Math tests and typecheck |
| 2. Code Drawing | `packages/code-drawing`, registry/docs callers | RED observable insert contract; rename key, set `NODES.codeDrawing`, delete `CODE_DRAWING_KEY`, migrate tx/docs | Slice 1 proves the pattern | New namespace and old serialized output are green; public alias is gone | Code Drawing tests/typecheck + export audit |
| 3. Code Block family | `packages/code-block`, Core shortcut/input-rule tests, AI/Markdown/List/Link callers, registry/docs | Migrate `codeBlock`, `codeLine`, `codeSyntax` together because their schema/rendering contracts are nested; preserve block/line JSON and syntax mark keys | Slices 1–2 green | Insert/toggle/tab/select/normalization/HTML/Markdown/decorations all use camel plugin identities and snake data | Code Block package tests/typecheck; dependent focused tests; shortcut assertion |
| 4. Combobox identities | `packages/emoji`, `packages/mention`, `packages/slash-command`, Combobox/Suggestion callers and docs | Migrate `emojiInput`, `mentionInput`, `slashInput`, and behavior-only `slashCommand` one package at a time with RED→GREEN before the next | Common pattern green | Transient input JSON remains snake_case; nested plugin lookups are camelCase; no slash-command node fiction | Emoji, Mention, Slash Command, Combobox/Suggestion focused tests/typechecks |
| 5. Structural nodes | `packages/layout`, `packages/list-classic`, Markdown/AI/List/registry callers | Migrate `columnGroup`, then `listTodoClassic`, preserving Markdown and insert-break/toggle output | Prior node slices green | `column_group` and `action_item` remain serialized values while keys/tx are camelCase | Layout/List Classic/Markdown focused tests and typechecks |
| 6. Media and decoration leaf | `packages/media`, `packages/find-replace`, Markdown/registry/docs | Migrate `mediaEmbed`, then `searchHighlight`; prove parser/insertion output and decoration property | Prior node/mark patterns green | Stored media and decoration matching remain unchanged | Media/Find Replace tests/typechecks |
| 7. Whole-repo semantic adoption | `packages/**`, `apps/www/src/**`, `content/docs/**` | Classify every remaining affected `KEYS` use as plugin identity, configured type, or static node data; update current docs and registry types/maps; never edit generated registry output | All feature slices green | No current code/docs caller confuses the two identities | Focused source audits, `www` typecheck, docs parity, lint |
| 8. Closure | Core lane + browser demos | Add breaking changeset, run broad Core gate, then exercise affected standalone demos | Adoption audit clean | All checks pass; serialized fixture grep contains only intended old node values and no production plugin declaration retains an inventoried snake_case key | `pnpm check:core`; `pnpm --filter www typecheck`; Browser routes listed below |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Inventory is exhaustive | Bounded Babel factory-call audit covered 2,445 production TS/TSX files, resolved 131 plugin declarations, and found 13 unique snake_case keys; direct `KEYS`/constant and literal searches matched the same set | Final exact audits find zero inventoried snake_case plugin declarations, runtime namespaces, or `CODE_DRAWING_KEY` references in current package, registry, or content source | passed |
| Core already supports distinct key and node type | `createBasePlugin.ts` initializes `node.type` from `key` but explicit config overrides it; `resolvePlugins.ts` maps `plugin.node.type` back to `plugin.key`; existing Core specs cover different values and leaf rendering | Core focused contracts and `check:core` pass; Browser-driven decoration projection tests prove the existing key/type split through rendering | passed |
| Documents do not change | `NODES` contains all 12 current serialized discriminators; all 12 declarations currently inherit rather than explicitly set them | All 12 declarations explicitly set `NODES`; insertion/parser/serializer/decorate tests preserve snake_case values; strict schema demos mount without data drift | passed |
| Public JS API is camelCase | `extendTx` groups under `plugin.key`; current direct tests/docs expose `code_block`, `code_drawing`, `inline_equation`, and `action_item` | Inferred camelCase tx/update and shortcut tests compile and execute; final review caught and removed the last two stale changeset examples | passed |
| Behavior-only plugins do not invent node schema | `BaseSlashPlugin` has no `node` config; only nested `BaseSlashInputPlugin` creates a document node | Slash tests prove `slashCommand` lookup and `slash_input` builder output; `BaseSlashPlugin` remains behavior-only | passed |
| App and docs adoption is complete | Live callers include registry action/type maps, `plate-types`, docx overrides, EN/CN command docs, and plugin guides | www typecheck/docs parity passes; all ten standalone demos mount; Find Replace renders live `search_highlight` leaves after typing | passed |

Conditional evidence:
- High-risk scenarios:
  1. A direct `type: KEYS.codeBlock` or `[KEYS.codeSyntax]` follows the new
     plugin value and silently changes persisted data. Mitigation: move static
     data/property uses to `NODES`, preserve configured paths through
     `editor.getType`, and assert serialized output per slice.
  2. A plugin sets a camel key but omits the explicit old `node.type`, causing
     `node.types` reverse lookup, rendering, parsers, or overrides to miss.
     Mitigation: integration assertions cover `plugin.key`,
     `plugin.node.type`, `editor.plugin(key).type`, and observable insertion/render.
  3. Runtime and types disagree because a `PluginConfig<'snake_case'>` generic,
     shortcut string, or direct `editor.update.snake_case` caller survives.
     Mitigation: package typechecks, command tests, shortcut tests, and exact
     source audits.
  4. Registry action maps compare a camel plugin key to a snake node type.
     Mitigation: classify each map by contract and resolve the installed node
     type before same-type comparisons.
  Rollback is per vertical slice before the next slice starts; no alias or dual
  namespace is an acceptable rollback.
- External research: N/A; live Plate source and public tests fully define this
  local identity contract.
- Issue/PR provenance: N/A; user-directed architecture planning, not an
  issue-backed claim.
- Docs/registry/browser/release/behavior-law owners: current EN/CN docs and
  `apps/www/src/registry` apply. Generated `apps/www/public/r/**` is
  CI-controlled and must not be edited. Browser closure covers
  `/blocks/code-block-demo`, `/blocks/code-drawing-demo`,
  `/blocks/column-demo`, `/blocks/list-classic-demo`,
  `/blocks/emoji-demo`, `/blocks/equation-demo`, `/blocks/media-demo`,
  `/blocks/mention-demo`, `/blocks/slash-command-demo`, and
  `/blocks/find-replace-demo`. A breaking changeset applies; release execution
  itself is out of scope.

Findings:
- `packages/utils/src/lib/plate-keys.ts` already separates `NODES` from the
  larger `KEYS` map, but `KEYS` spreads `NODES`, so affected values are still
  identical.
- `packages/core/src/lib/plugin/createBasePlugin.ts` defaults
  `node.type = key`; all 12 affected node/mark plugins rely on that default.
- `packages/core/src/internal/plugin/resolvePlugins.ts` already indexes
  `plugin.node.type -> plugin.key`, and `getPluginType` already resolves the
  configured type from a plugin key. No Plite or Core API gap blocks this
  migration.
- Production factory-call audit found exactly 13 snake_case keys:
  `action_item`, `code_block`, `code_drawing`, `code_line`, `code_syntax`,
  `column_group`, `emoji_input`, `inline_equation`, `media_embed`,
  `mention_input`, `search_highlight`, `slash_command`, and `slash_input`.
- Twelve are present in `NODES` and have real element/leaf roles.
  `slash_command` is declared only in `KEYS` and belongs to a behavior plugin.
- Direct adoption is not limited to declarations. Current source uses affected
  `KEYS` values in node interfaces, constructors, parsers, Markdown rules,
  decoration properties, action maps, plugin override maps, tx namespaces,
  shortcut IDs, registry kits, and docs.
- `CODE_DRAWING_KEY` is a public exported compatibility hazard because it
  encodes the old conflated identity.

Decisions and tradeoffs:
- Reuse `NODES`; do not introduce `NODE_TYPES` or `PLUGIN_KEYS`.
- Change only snake_case built-in plugin keys in this plan. Non-snake semantic
  aliases such as `KEYS.link = 'a'` are outside the user-requested inventory.
- Do not add a runtime validation that rejects snake_case user plugin keys.
  This is a built-in API consistency migration, not a restriction on consumers.
- Keep serialized element types, transient input types, and decoration mark
  properties byte-for-byte stable.
- Treat `slash_command` as accidental `getType` behavior, not a node contract.
- Execute TDD vertically: one plugin family goes RED→GREEN before the next.
  Do not write thirteen tests first and then bulk-edit the implementation.

Review fixes:
- Accepted: a blanket “preserve every old `node.type`” rule would legitimize
  `slash_command` as document schema. Classified it as behavior-only and
  intentionally omitted a fake frozen node type.
- Accepted: changing `KEYS` values without classifying registry action maps
  would compare camel plugin identities with snake node types. Added a semantic
  caller audit and configured-type resolution gate.
- Accepted: a new `PLUGIN_KEYS` map would duplicate existing ownership. Reused
  `KEYS` for plugin identities and `NODES` for document discriminators.
- Accepted during implementation closeout: current Code Block and Code Drawing
  changesets still taught `editor.update.code_block` and
  `editor.update.code_drawing`. Repaired them to `codeBlock` and `codeDrawing`,
  swept all current changesets for the same bug class, and reran review clean.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| TypeScript 7 package no longer exposes the legacy `createSourceFile` compiler API | 2 | Use the installed Babel parser for the read-only declaration inventory | Resolved; 131 declarations analyzed |
| Babel could not parse seven TS7-syntax Plite files | 1 | Cross-check those exact files and all Plite packages for Plate plugin factories | Resolved; zero `createBasePlugin` / `createPlatePlugin` calls in those files or Plite owners |
| Initial mechanical checker run found its own evidence row unresolved | 1 | Record the final checker evidence in the generated gate, then rerun | Resolved by the final passing checker run |
| Browser strict schema rejected JSX `__self` / `__source` metadata | 1 | Strip React development-only attributes in the hyperscript owner before fixture data construction | Resolved; 35/35 Hyperscript tests and all ten demos mount |
| Media demo stored relative widths while its schema accepted only numbers | 1 | Preserve the established numeric-or-relative resize contract in Media and Utils types | Resolved; 93/93 Media tests and media demo mount |
| Find Replace changed projection segment counts and crashed React hook order | 2 | First remove hooks from Plate pipe callbacks, then isolate all Plite text render callbacks behind component boundaries | Resolved; 918/918 Plite React tests and live Browser interaction pass |
| Find Replace split text but did not render the decoration mark | 1 | Preserve inline decorated-range data in Plite projections and merge it into Plate leaves at the owner boundary | Resolved; focused Core/Plite tests and one visible Browser highlight pass |

Verification evidence:
- Source audit: 2,445 production TS/TSX files scanned; 131 resolved
  `createBasePlugin`/`createPlatePlugin` declarations; 13 unique snake_case
  keys.
- Source audit: the 13 resolved declarations match the 12 snake_case `NODES`
  values used by plugins plus `KEYS.slashCommand`.
- Source audit: existing Core tests cover explicit `key !== node.type`, leaf
  rendering by `node.type`, and tx grouping by plugin key.
- TDD: every plugin family went RED→GREEN; Browser-discovered strict-data,
  relative-width, callback-boundary, and decoration-projection regressions have
  focused tests at their owning packages.
- Focused package proof: Markdown 238, AI 72, Core caller rows 44, Combobox 30,
  Link 10, Suggestion 29, registry 2, Media 93, Plite React 918, and Plite
  Hyperscript 35 tests pass.
- Type proof: all 17 directly affected package graphs and `www` typecheck/docs
  parity pass.
- Broad proof: `pnpm check:core` passes 45 package typecheck/lint lanes, Core
  742/742, full Plite, and every reviewed package suite.
- Packaging proof: `pnpm brl` passes 56/56 and `pnpm changeset status` passes.
- Hard-cut proof: exact searches return zero old plugin declarations,
  `PluginConfig` identities, runtime namespaces, or `CODE_DRAWING_KEY`
  references in current package, registry, and content source.
- Browser proof: Code Block, Code Drawing, Column, List Classic, Emoji,
  Equation, Media, Mention, Slash Command, and Find Replace standalone demos
  each mount one editable with no error dialog. Typing `editable` in Find
  Replace renders `.bg-yellow-100` decoration leaves with no crash.
- Review proof: `.agents/skills/autoreview/scripts/autoreview --mode local`
  accepted one stale-changeset finding; after repair, the final run exited
  clean with no accepted or actionable findings.
- Command: `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-20-camel-case-plugin-key-migration.md` -> PASS after the
  final plan update.

Final handoff prepared:
- Ownership and target API: Plate owns the migration. `KEYS` supplies camelCase
  plugin identities; `NODES` supplies stable serialized discriminators.
- Public breaks and adoption: 13 plugin keys hard-cut; 12 explicit node types;
  four direct tx families and Code Block shortcut IDs rename;
  `CODE_DRAWING_KEY` is deleted; no aliases.
- Applicable runtime/package/docs/browser decisions: Core mechanism stays;
  feature packages, current docs, registry source, type declarations, and ten
  standalone demos adopt the split.
- Proof and execution risks: the dominant risk is a direct `KEYS` use that
  actually means node data; per-slice serialization tests, strict schema
  Browser mounts, and the final semantic audit close it.
- Execution result: all eight ordered TDD slices are complete. No compatibility
  alias, generated registry edit, commit, push, or release action was performed.

Timeline:
- 2026-07-20T18:19:36.328Z Plate Plan created.
- 2026-07-20 inventory resolved 13 production snake_case plugin keys and
  classified 12 node/mark owners plus one behavior-only owner.
- 2026-07-20 target `KEYS`/`NODES` split, TDD slices, adoption, risks, and proof
  matrix prepared from live source.
- 2026-07-20 fresh contradiction review resolved behavior-only Slash semantics,
  mixed registry action maps, generated registry exclusion, changeset, and
  browser closure.
- 2026-07-20 user accepted the full plan with “go all”; one-shot execution goal
  created and all eight slices reopened for implementation evidence.
- 2026-07-20 Slice 1 RED: `pnpm --filter @platejs/math test --
  BaseInlineEquationPlugin.spec.ts` failed only the new identity contract:
  expected `inlineEquation`, received `inline_equation`.
- 2026-07-20 Slices 2–6 completed package-by-package RED→GREEN. All 13
  identities are camelCase; all 12 serialized node/mark types are explicit;
  `slashCommand` remains behavior-only.
- 2026-07-20 semantic adoption repaired Markdown schema fixtures, AI node
  comparisons, registry action-to-node resolution, registry value types,
  discussion labels, tabbable exclusions, current docs, and generic Core/test
  examples.
- 2026-07-20 Browser closure exposed and drove owner fixes for JSX development
  metadata, relative media widths, hook-unsafe render callbacks, and dropped
  legacy decoration data; focused and broad proof passed after each repair.
- 2026-07-20 `check:core`, www typecheck, lint, barrels, changesets, zero-match
  hard-cut audits, ten-demo Browser proof, and final clean autoreview completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Verified handoff |
| Where am I going? | No remaining migration work |
| What is the goal? | Hard-cut all 13 built-in plugin keys to camelCase without changing any serialized node/mark discriminator. |
| What have I learned? | Exactly 13 keys are affected; 12 node types stay explicit; Slash remains behavior-only; Plate must adapt legacy decoration data at the Plite projection boundary. |
| What have I done? | All implementation, caller, release-note, broad-gate, Browser, checker, and review closure is complete. |

Open risks:
- None for the accepted scope. The deliberate breaking change still requires
  downstream consumers to rename plugin/update namespaces atomically; the
  changesets describe that contract and no compatibility aliases exist.
