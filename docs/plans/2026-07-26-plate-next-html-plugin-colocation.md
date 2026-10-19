# Plate Next HtmlPlugin colocation

Objective:
Colocate the complete Core `HtmlPlugin` family. Inline or delete single-owner
helpers, retain only independently owned shared DOM algorithms, merge proof by
behavior family, and preserve inferred Core editor API/tx typing.

Completion threshold:
- All 52 original HtmlPlugin-family source/proof files have a score-100
  resolution.
- The live family has one plugin/compiler/parser owner, one shared DOM
  algorithm owner, generated barrel, and behavior-family proof files.
- No stale helper path, parser-query wrapper, manual core-plugin union, or
  widened `HtmlPlugin.deserialize()` return remains.
- Focused runtime, slow, package type, declaration, barrel, lint, source-audit,
  and review gates pass.

Verification surface:
- Core HTML API, DOM, codec, and slow tests.
- DOCX, Juice, List HTML, and Media consumer tests.
- Core/Media/DOCX/Juice/List typechecks.
- `@platejs/core` declaration build and core contract type tests.
- Barrel generation, scoped lint, stale-path audit, and `git diff --check`.
- Browser proof is N/A: this is a non-React Core codec/type owner with no
  standalone runnable UI route.

Constraints:
- Named HtmlPlugin owner packet, not a broad Core sweep.
- No line ceiling.
- Hooks stay outside plugin files; this family has no hooks.
- Public export names, barrels, and tests do not count as production reuse.
- No new function exists merely to receive `editor`, `tx`, `read`, `api`, or
  plugin context.
- Preserve unrelated shared-tree work.
- Keep `CorePluginConfig` inferred from `getCorePlugins`; never duplicate the
  descriptor list as a manual union.

Boundaries:
- Runtime owner: `packages/core/src/lib/plugins/html/**`.
- Direct consumers/exports: Core internal compiler, Core public/internal
  barrels, Media parser query, DOCX/Juice/List focused proof.
- DOCX-only cleanup behavior belongs in `cleanDocx.ts`.
- Shared DOM algorithms remain in `htmlDom.ts` because Core, DOCX, List, and
  basic-node plugins consume them independently.
- No docs or registry UI work.

Blocked condition:
Block only if the same in-scope type/runtime/declaration failure survives three
distinct repairs, or a public API decision cannot be resolved from source and
the user's explicit colocation doctrine.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | HtmlPlugin correction, no line ceiling, inline single-owner behavior, keep hooks separate, and regression concern recorded |
| Skills read | yes | `plate-next`, `autogoal`, `architecture-cleanup`, `best-api`, `changeset`, and `plate-plugin-creator` applied |
| Mode | yes | Named Core owner packet; broad Core sweep explicitly excluded |
| Source owner | yes | 43 folder files plus 9 hidden compiler/parser/context files inventoried |
| Public API decision | yes | Keep strict `HtmlPlugin.deserialize(): Descendant[] \| null`; retain inferred `CorePluginConfig` |
| Release artifact | yes | Core major changeset records public constants hard cut and `someHtmlElement` fix |
| Barrel impact | yes | Core barrel generation required and run |
| Browser routing | no | No standalone non-React codec/type browser surface |

Work Checklist:
- [x] Capture exact owner scope, constraints, proof, and stop condition.
- [x] Inventory every visible and hidden HtmlPlugin-family file.
- [x] Inline the compiled HTML codec, parser registry, transform pipelines, and
      direct deserialize API into `HtmlPlugin.ts`.
- [x] Merge cross-package DOM algorithms into `htmlDom.ts`.
- [x] Move DOCX-only cleanup behavior and proof into the DOCX owner.
- [x] Delete helper taxonomy, parser-query wrappers, stale barrels, and
      duplicate proof files.
- [x] Keep React hooks outside plugin files; no hooks were found.
- [x] Inline the one-use Media parser query at its plugin builder context.
- [x] Preserve strict deserialize return typing and inferred core-plugin config.
- [x] Regenerate barrels and add the required changeset.
- [x] Run focused, slow, consumer, type, declaration, lint, and source proof.
- [x] Run final review and record all original/current topology rows.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Original manifest | yes | 52/52 original files classified at score 100 |
| Current manifest | yes | 8 live files; 8/8 justified |
| Helper topology | yes | Plugin/compiler/parser behavior in `HtmlPlugin.ts`; only shared DOM algorithm file survives |
| API regression | yes | `deserialize()` is `Descendant[] \| null`; Core contract typecheck passes |
| Core config regression | yes | Emitted declaration preserves `InferConfig<ReturnType<typeof getCorePlugins>[number]>` |
| Runtime proof | yes | Core HTML 88/88; codec slow 4/4; DOCX 49/49 and slow 5/5; Media 81/81 |
| Consumer proof | yes | DOCX/Juice 6/6 and List HtmlPlugin family 22/22 |
| Package types | yes | Core, Media, DOCX, Juice, and List typechecks pass |
| Build/declarations | yes | `@platejs/core` build and contract declaration typecheck pass |
| Lint/barrels | yes | Scoped lint passes and `pnpm --filter @platejs/core brl` ran |
| Source audit | yes | No stale helper/compiler/parser-context paths or removed constants remain |
| Browser | no | No runnable standalone UI surface for this owner |
| Review | yes | Two structured findings were rejected from current source; final retry hit the shared-tree 1 MB bundle ceiling, with no accepted finding left |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Inventory | complete | 52 original files and all direct consumers mapped |
| Ownership rewrite | complete | 52 original files resolve to 8 live family files plus honest DOCX/Media owners |
| Runtime proof | complete | Fast and slow focused suites pass |
| Type/declaration proof | complete | Five-package typecheck and Core declaration build pass |
| Final audit | complete | Barrels, scoped formatting, stale-path search, diff check, and source-backed review triage complete |

Original owner rows:
| Original path | Score | Resolution |
|---------------|-------|------------|
| `packages/core/src/lib/plugins/html/HtmlPlugin.spec.ts` | 100 | Kept as focused public API proof |
| `packages/core/src/lib/plugins/html/HtmlPlugin.ts` | 100 | Owns plugin, compiler, parser registry, pipelines, and direct decode |
| `packages/core/src/lib/plugins/html/constants.ts` | 100 | Deleted; DOCX uses native literals |
| `packages/core/src/lib/plugins/html/index.ts` | 100 | Regenerated to the two live production owners |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlBrElements.ts` | 100 | Inlined in `cleanDocx.ts` |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlEmptyElements.ts` | 100 | Inlined in `cleanDocx.ts` |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.spec.ts` | 100 | Merged into `cleanDocx.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlFontElements.ts` | 100 | Inlined in `cleanDocx.ts` |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlLinkElements.spec.ts` | 100 | Merged into `cleanDocx.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlLinkElements.ts` | 100 | Inlined in `cleanDocx.ts` |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.spec.ts` | 100 | Merged into `cleanDocx.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/cleanHtmlTextNodes.ts` | 100 | Inlined in `cleanDocx.ts` |
| `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.spec.ts` | 100 | Moved into `HtmlPlugin.dom.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/collapse-white-space/collapseWhiteSpace.ts` | 100 | Inlined in `HtmlPlugin.ts` |
| `packages/core/src/lib/plugins/html/utils/collapse-white-space/index.ts` | 100 | Deleted nested barrel |
| `packages/core/src/lib/plugins/html/utils/copyBlockMarksToSpanChild.spec.ts` | 100 | Merged into `cleanDocx.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/copyBlockMarksToSpanChild.ts` | 100 | Inlined in `cleanDocx.ts` |
| `packages/core/src/lib/plugins/html/utils/deserializeHtml.ts` | 100 | Inlined in the plugin API factory |
| `packages/core/src/lib/plugins/html/utils/getHtmlComments.spec.ts` | 100 | Merged into `htmlDom.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/getHtmlComments.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/htmlBrToNewLine.spec.ts` | 100 | Moved into `HtmlPlugin.dom.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/htmlBrToNewLine.ts` | 100 | Inlined in `HtmlPlugin.ts` |
| `packages/core/src/lib/plugins/html/utils/htmlStringToDOMNode.ts` | 100 | Inlined in `HtmlPlugin.ts` |
| `packages/core/src/lib/plugins/html/utils/htmlTextNodeToString.spec.ts` | 100 | Moved into `HtmlPlugin.dom.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/htmlTextNodeToString.ts` | 100 | Inlined in `HtmlPlugin.ts` |
| `packages/core/src/lib/plugins/html/utils/index.ts` | 100 | Deleted taxonomy barrel |
| `packages/core/src/lib/plugins/html/utils/isHtmlBlockElement.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/isHtmlComment.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/isHtmlElement.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/isHtmlInlineElement.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/isHtmlText.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/parseHtmlDocument.ts` | 100 | Replaced by direct host parser use in `HtmlPlugin.ts` |
| `packages/core/src/lib/plugins/html/utils/parseHtmlElement.ts` | 100 | Deleted dead wrapper |
| `packages/core/src/lib/plugins/html/utils/postCleanHtml.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/preCleanHtml.spec.ts` | 100 | Merged into `cleanDocx.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/preCleanHtml.ts` | 100 | Inlined in `cleanDocx.ts` |
| `packages/core/src/lib/plugins/html/utils/removeHtmlNodesBetweenComments.spec.ts` | 100 | Merged into `htmlDom.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/removeHtmlNodesBetweenComments.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/replaceTagName.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/someHtmlElement.ts` | 100 | Merged into shared `htmlDom.ts`; first-match bug fixed |
| `packages/core/src/lib/plugins/html/utils/traverseHtmlElements.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.spec.ts` | 100 | Merged into `htmlDom.spec.ts` |
| `packages/core/src/lib/plugins/html/utils/traverseHtmlNode.ts` | 100 | Merged into shared `htmlDom.ts` |
| `packages/core/src/internal/plugin/compilePlateHtmlCodec.ts` | 100 | Moved into `HtmlPlugin.ts` |
| `packages/core/src/internal/plugin/compilePlateHtmlCodec.spec.ts` | 100 | Moved to `HtmlPlugin.codec.spec.ts` |
| `packages/core/src/internal/plugin/compilePlateHtmlCodec.slow.ts` | 100 | Moved to `HtmlPlugin.codec.slow.ts` |
| `packages/core/src/internal/plugin/prepareHtmlRegistry.ts` | 100 | Inlined in `HtmlPlugin.ts` |
| `packages/core/src/internal/plugin/pipeTransformData.ts` | 100 | Inlined in `HtmlPlugin.ts` |
| `packages/core/src/internal/plugin/pipeTransformData.spec.ts` | 100 | Merged into codec pipeline proof |
| `packages/core/src/internal/plugin/pipeTransformFragment.ts` | 100 | Inlined in `HtmlPlugin.ts` |
| `packages/core/src/internal/plugin/pipeTransformFragment.spec.ts` | 100 | Merged into codec pipeline proof |
| `packages/core/src/lib/utils/htmlPluginContext.ts` | 100 | Deleted; proof helper is internal to HtmlPlugin and Media query is lexical |

Current family rows:
| Current path | Score | Owner evidence |
|--------------|-------|----------------|
| `packages/core/src/lib/plugins/html/HtmlPlugin.ts` | 100 | Single coherent plugin/compiler/parser runtime owner |
| `packages/core/src/lib/plugins/html/htmlDom.ts` | 100 | Independent mutation-safe DOM algorithms with Core, DOCX, List, and basic-node consumers |
| `packages/core/src/lib/plugins/html/index.ts` | 100 | Generated two-owner barrel |
| `packages/core/src/lib/plugins/html/HtmlPlugin.spec.ts` | 100 | Public API and clipboard integration |
| `packages/core/src/lib/plugins/html/HtmlPlugin.codec.spec.ts` | 100 | Compiler, security, ordering, query, and transform pipeline behavior |
| `packages/core/src/lib/plugins/html/HtmlPlugin.codec.slow.ts` | 100 | Independent high-volume codec proof |
| `packages/core/src/lib/plugins/html/HtmlPlugin.dom.spec.ts` | 100 | DOM normalization and text/BR parsing algorithm proof |
| `packages/core/src/lib/plugins/html/htmlDom.spec.ts` | 100 | Shared traversal/comment/range proof |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternative | Reason |
|--------|-------------------|----------------------|--------|
| HtmlPlugin runtime | One large coherent plugin/compiler/parser file | Facade plus `utils/`, compiler, registry, and pipe files | Those files had one owner and made inference/navigation worse |
| Shared DOM logic | One `htmlDom.ts` | One file per predicate/transform | Algorithms are independently reused across durable owners |
| Parser query | Lexical plugin-builder composition | Public `prepareHtmlParserQuery(editor, plugin)` | Wrapper only threaded editor/plugin context |
| Core config | Infer the union from `getCorePlugins` | Manual `CorePluginConfig` union | Manual list duplicates truth and silently drifts |

Plite / Plate gap ledger:
| Gap type | Decision | Evidence |
|----------|----------|----------|
| Plite capability | none | Host codec/parser APIs support the complete owner without a bridge |
| Plate capability | none | Builder inference and internal scoped exports are sufficient |

Related scoped sweep ledger:
| Trigger | Scope | Matches | Patched | Deferred | Result |
|---------|-------|---------|---------|----------|--------|
| Hidden HtmlPlugin owners | Core compiler/parser/context paths | 9 | 9 | 0 | All merged/deleted |
| Editor/context wrappers | Core plus direct Media consumer | 3 APIs | 3 | 0 | No stale wrapper remains |
| Removed character constants | Package sources | 6 names | all production uses | 0 | Only native literals remain |
| Stale helper paths | Packages/apps/content | 0 after patch | all prior matches | 0 | Clean |
| Core config typing | Core source and emitted declarations | 2 owner declarations | 0 | 0 | Inferred alias preserved |

Changed list:
| Group | Result |
|-------|--------|
| Runtime/API | HtmlPlugin owns compiler/parser/direct decode; Media query is lexical; DOCX cleanup is local; DOM algorithms share one owner |
| Tests | Helper specs merged into API/codec/DOM/DOCX behavior families |
| Exports | Public HTML exports are explicit; proof/parser internals use `@platejs/core/internal`; barrels regenerated |
| Release | Core major changeset for removed constants and corrected `someHtmlElement` |
| Skills/docs | Goal plan only; no reusable doctrine change in this packet |

Findings:
- A hand-maintained `CorePluginConfig` union is a regression: it duplicates
  `getCorePlugins` and can omit future API, tx, state, schema, dependency, or
  enabled contributions.
- The merged API briefly widened direct decode to `undefined`; contract proof
  caught it. Missing compiled HTML state is an invariant error, while ordinary
  invalid input returns `null`.
- `someHtmlElement` previously lost an earlier match when traversal continued
  into later siblings; merged proof now locks first-match behavior.
- Global plugin priority is intentionally deleted. HTML precedence belongs to
  codec-local `priority`; restoring `pluginPriority` would regress the accepted
  hard cut.
- Different class names do not prove HTML matchers disjoint because one element
  can carry both classes. The exact two-class conflict case is covered.

Decisions and tradeoffs:
- File size is not a split criterion. `HtmlPlugin.ts` is large because it owns
  one compiler/runtime lifecycle.
- `htmlDom.ts` remains separate because it has real independent consumers.
- Codec proof remains split into fast, DOM-algorithm, and slow families because
  they are distinct proof/runtime-cost owners, not implementation taxonomy.

Error attempts:
| Error | Count | Resolution |
|-------|-------|------------|
| Cross-package tests could not resolve Core before artifact build | 1 | Built Core, then reran consumers |
| Bundler lost overloaded proof-helper value export | 1 | Replaced overloads with one inferred generic declaration |
| Parser context generic mismatch | 1 | Parameterized the prepared parser entry with `HtmlParser<C>` and `WithAnyName<C>` |
| Direct decode widened to `undefined` | 1 | Restored strict null result and invariant throw; contract typecheck passes |
| Full List test reported two unrelated keyboard expectations during shared WIP | 1 | HtmlPlugin family slice passes 22/22; package typecheck passes; no source repair made |
| Autoreview proposed restoring global plugin priority | 1 | Rejected against the explicit hard cut and codec-local priority tests |
| Autoreview treated different classes as disjoint | 1 | Rejected because DOM elements can carry both classes; exact overlap test passes |
| Final autoreview retry exceeded 1 MB input | 1 | Shared dirty-tree bundle grew to 1.29 MB; no git mutation or staging used to bypass the guard |
| Final broad Core lint saw `resolvePlugins.ts` callback-return drift | 1 | Packet files pass targeted Biome; unrelated shared owner left untouched |

Verification evidence:
- `bun test` Core HTML four-spec set: 88 pass, 0 fail.
- `bun test ./packages/core/src/lib/plugins/html/HtmlPlugin.codec.slow.ts`: 4
  pass, 0 fail.
- `bun test packages/docx/src`: 49 pass, 0 fail.
- `bun test ./packages/docx/src/lib/docx-cleaner/cleanDocx.slow.ts`: 5 pass,
  0 fail.
- `bun test packages/media/src`: 81 pass, 0 fail.
- DOCX/Juice focused plugin proof: 6 pass, 0 fail.
- List `BaseListPlugin` family slice: 22 pass, 0 fail.
- `pnpm turbo typecheck` for Core, Media, DOCX, Juice, and List: 18/18 tasks.
- `pnpm --filter @platejs/core build`: declaration build passes and emits the
  inferred `CorePluginConfig` alias plus strict Html API.
- Packet files pass targeted Biome; Media, DOCX, Juice, and List package lint
  passed. A later broad Core lint rerun was blocked only by unrelated
  `resolvePlugins.ts:859`.
- Core barrel generation passes.
- Stale-path/removed-constant source audits return no production matches.
- Autoreview findings were source-checked and rejected: global priority is
  intentionally cut; distinct classes may coexist. The clean retry could not
  run after unrelated shared changes pushed the local bundle over 1 MB.

Final handoff contract:
- Mode: completed named Core HtmlPlugin owner packet.
- Coverage: 52/52 original owner files and 8/8 current family files at 100.
- Public API: strict direct decode preserved; manual core-plugin union rejected.
- Gaps/blockers: no product blocker; clean autoreview retry is unavailable on
  the oversized shared dirty-tree bundle.
- Browser: N/A, no standalone non-React codec/type route.
- Next owner: Plate Next may select the next Core/Utils plugin package.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final HtmlPlugin closure |
| Where am I going? | Mechanical checker, final diff proof, and goal completion |
| What is the goal? | One coherent HtmlPlugin owner with strict inferred APIs |
| What have I learned? | Source-derived unions and lexical plugin context prevent drift |
| What have I done? | Collocated 52 files into 8 justified family files and proved consumers |

Timeline:
- 2026-07-26: Inventoried 43 visible and 9 hidden owner files.
- 2026-07-26: Merged runtime, shared DOM, DOCX cleanup, and behavior proof.
- 2026-07-26: Restored strict deserialize typing and proved emitted core config.

Open risks:
The structured reviewer could not produce a final clean exit after unrelated
shared-tree changes grew the local bundle to 1.29 MB. Both prior findings were
verified and rejected with exact source contracts and focused tests; no
accepted in-scope finding remains.
