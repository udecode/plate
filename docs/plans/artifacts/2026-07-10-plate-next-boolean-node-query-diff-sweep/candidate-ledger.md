# Boolean node-query current-diff ledger

Scope:
- `git diff HEAD --name-only --diff-filter=ACMRT -- packages`
- 136 changed tracked TypeScript files
- one untracked package TypeScript file, reviewed separately below

Query class:
- entry-producing reads: `above`, `block`, `entries`, `find`, `get`, `next`,
  `parent`, `previous`, and `toArray`
- accepted boolean read: `editor.read.nodes.some`

Summary:
| Classification | Calls | Decision |
|----------------|------:|----------|
| reviewed boolean call sites | 5 old calls -> 4 current calls | one `nodes.some`; three current-block `nodes.block` checks, including one deduplicated pair |
| exact-path `get` with node/entry consumption | 23 | keep `get` |
| ancestor `above` with node/path consumption | 8 | keep `above` |
| boolean ancestor existence | 2 | keep `above`; `some` does not preserve ancestor traversal |
| block entry/path or traversal consumption | 12 | keep `block` |
| generator/collection consumption | 10 | keep `entries` / `toArray` |
| first matching entry consumption | 2 | keep `find` |
| relative entry consumption | 5 | keep `next` / `parent` / `previous` |
| unclassified candidates | 0 | closed |

Corrected rows:
| Owner | Old result use | Current shape | Reason |
|-------|----------------|---------------|--------|
| `packages/code-block/src/lib/BaseCodeBlockPlugin.ts` | intermediate `above` entry used only as parser-guard truthiness | `read.nodes.some({ at: selection, match })` | exact collection-existence question; restores the original `api.some` semantics under the Plite read owner |
| `packages/code-block/src/lib/withCodeBlock.ts` `resetCodeBlock` | `block` entry used only to gate the matching unwrap transform | keep `read.nodes.block({ at, match })` | the transform asks for the matching current block/ancestor, not any match in a range |
| `packages/code-block/src/lib/withInsertDataCodeBlock.ts` | two duplicate `block` reads used only to decide code-block paste handling | one hoisted boolean around `read.nodes.block({ match })` | deduplicate the lookup while preserving current-block routing for mixed selections |
| `packages/code-block/src/lib/withInsertFragmentCodeBlock.ts` | `block` entry used only to choose code-fragment handling | keep a boolean around `read.nodes.block({ at, match })` | explicit-target/current-block traversal must not become range-wide existence |

Retained rows:
| Owner | Calls | Classification | Evidence |
|-------|------:|----------------|----------|
| `packages/caption/src/lib/withCaption.ts` | `above` 1, `block` 1 | entry consumed | helpers return the matching caption entry to later logic |
| `packages/code-block/src/lib/BaseCodeBlockPlugin.spec.ts` | `get` 1 | exact node consumed | assertion reads node properties |
| `packages/code-block/src/lib/transforms/indentCodeLine.spec.tsx` | `get` 8 | exact entries consumed | fixtures pass code-block/code-line entries into the transform |
| `packages/code-block/src/lib/transforms/insertEmptyCodeBlock.ts` | `block` 1 | node consumed | checks the matched block with `nodes.isEmpty` |
| `packages/code-block/src/lib/transforms/outdentCodeLine.spec.tsx` | `get` 4 | exact entries consumed | fixtures pass entries into the transform |
| `packages/code-block/src/lib/transforms/unwrapCodeBlock.ts` | `entries` 1 | collection consumed | reverses and iterates every code-block entry |
| `packages/code-block/src/lib/withCodeBlock.spec.tsx` | `get` 3 | exact node consumed | decoration assertions use the code-line node |
| `packages/code-block/src/lib/withCodeBlock.ts` | `above` 1, `get` 1, `parent` 1, `previous` 1, `toArray` 1 | entries/collection consumed | selection, mutation, decoration, and indentation logic consume node/path data |
| `packages/code-block/src/react/CodeBlockPlugin.tsx` | `get` 1 | exact entry consumed | operation handler uses the node and path-specific state |
| `packages/core/src/lib/utils/getInjectMatch.ts` | `above` 1 | boolean ancestor existence | explicitly asks whether the current path is below an excluded ancestor |
| `packages/cursor/src/queries/getSelectionRects.spec.ts` | `get` 4 | exact nodes consumed | DOM fixture assertions use the text nodes |
| `packages/cursor/src/queries/getSelectionRects.ts` | `toArray` 1 | collection consumed | iterates every text entry to build rectangles |
| `packages/selection/src/react/hooks/useSelectionArea.ts` | `above` 2, `block` 2 | one boolean ancestor plus three consumed entries | ancestor-deduping must stay ancestor-scoped; table/block logic consumes nodes and paths |
| `packages/selection/src/react/internal/api/shiftSelection.ts` | `find` 1, `next` 1, `previous` 1 | relative/entry data consumed | selection shifting uses matched ids and paths |
| `packages/suggestion/src/lib/queries/findSuggestionNode.ts` | `find` 1 | entry returned | helper contract returns the first suggestion entry |
| `packages/suggestion/src/lib/transforms/acceptSuggestion.ts` | `toArray` 1 | collection consumed | transform processes matching merge entries |
| `packages/suggestion/src/lib/transforms/deleteSuggestion.ts` | `above` 2, `block` 3, `get` 1 | entries consumed | inline, block, adjacent, and cross-block logic use nodes/paths |
| `packages/suggestion/src/lib/transforms/rejectSuggestion.ts` | `toArray` 3 | collections consumed | transform removes/merges/updates each matching entry |
| `packages/suggestion/src/lib/transforms/setSuggestionNodes.ts` | `parent` 1, `toArray` 1 | parent/collection consumed | matcher inspects the parent node; transform iterates entries |
| `packages/suggestion/src/lib/utils/getSuggestionNodeEntries.ts` | `toArray` 1 | collection returned | helper contract returns all suggestion entries |
| `packages/suggestion/src/lib/withSuggestion.ts` | `above` 3, `block` 2, `toArray` 1 | entries/collection consumed | block paths and suggestion nodes are inspected; remove-nodes later passes the array to the transform |

Untracked/extracted source:
| Path | Bucket | Origin/main owner check | Query-class result |
|------|--------|-------------------------|--------------------|
| `packages/cursor/src/hooks/useRequestReRender.spec.tsx` | `justify-new-proof-tooling` | absent on `origin/main`; focused regression test for the existing hook | no node-query call |

Method accounting after corrections:
| Method | Retained calls | Reason |
|--------|---------------:|--------|
| `get` | 23 | exact-path nodes/entries consumed |
| `above` | 10 | eight entries consumed; two ancestor-only boolean questions |
| `block` | 12 | nine entries/paths consumed; three current-block traversal questions |
| `entries` | 1 | generator consumed |
| `find` | 2 | matching entry consumed or returned |
| `next` | 1 | relative entry consumed |
| `parent` | 2 | parent entry consumed |
| `previous` | 2 | relative entry consumed |
| `toArray` | 9 | collection consumed or returned |

No remaining call is eligible for `nodes.some` without discarding data or
changing ancestor/relative traversal semantics.
