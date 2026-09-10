# Shard 001 — Structural matching, review and native identity

Scope: 13 locally inspected repositories spanning structural matching, rich-text/JSON deltas, three-way merge and recorded identity. GitHub discovery returned 29 unique repository hits. The registry combines discovery and selected direct sources: 39 repositories, with 26 repositories screened out of deep reading because they added no distinct current lane.

## Sources and findings

| Repository | Question | Finding |
| --- | --- | --- |
| [GumTreeDiff/gumtree](https://github.com/GumTreeDiff/gumtree/blob/dc2088281765e456b3574d230881c5a25ff93481/core/src/main/java/com/github/gumtreediff/matchers/MappingStore.java) | structural-matching | Separate matching and edit-action synthesis; one-to-one node maps do not supply general span continuity. |
| [Wilfred/difftastic](https://github.com/Wilfred/difftastic/blob/274d0a8f57291477cfbfb27bace0d82395d15c97/src/diff/shortest_path.rs) | syntax-and-presentation | Bounded syntax graph and display ambiguity; moved-region issues remain distinct from structural matching. |
| [benjamine/jsondiffpatch](https://github.com/benjamine/jsondiffpatch/blob/a60db8a232f92ee4b987c14f43f77402885d1a5a/packages/jsondiffpatch/src/filters/arrays.ts) | json-moves | Object identity enables same-array move plus nested edits; index patching is not baseline validation. |
| [slab/delta](https://github.com/slab/delta/blob/dc17ca03e1d68ee729c8cd1ff790ebf96eb0fbec/src/Delta.ts) | rich-text-algebra | Rich-text attributes and atom payloads remain distinct from text sentinel alignment. |
| [ProseMirror/prosemirror-changeset](https://github.com/ProseMirror/prosemirror-changeset/blob/e215757276357b64cf74f536552f3a5ef292fa1a/src/changeset.ts) | mapped-review | Step-map tracking and display simplification are useful; batching and default mark omission forbid provenance authority. |
| [bhousel/node-diff3](https://github.com/bhousel/node-diff3/blob/8226c27e074909241d72276c21215505a931665f/src/diff3.mjs) | branch-conflicts | Conflict regions preserve alternatives; merged output erases clean branch attribution and deletion review rows. |
| [trimerge/trimerge](https://github.com/trimerge/trimerge/blob/8f5002584bc892d5dbb5b813e4241323e6593eef/src/trimerge-array.ts) | json-three-way | Keyed arrays separate values from order; duplicate keys reject and order conflicts require policy. |
| [loro-dev/loro](https://github.com/loro-dev/loro/blob/d5da57dd2a91d735656808cbbe2a3f1c755c2441/crates/loro/src/lib.rs) | native-moves | Recorded frontier diffs and native movable identity; concurrent ancestor deletion and descendant movement need explicit laws. |
| [automerge/automerge](https://github.com/automerge/automerge/blob/1618c976ca23fca8282c4a69ebbb0bb0c3f27ab1/javascript/src/implementation.ts) | recorded-snapshot-diff | History-bound diff differs from inferred updateText; missing history cannot mean proven equality. |
| [ASSERT-KTH/spork](https://github.com/ASSERT-KTH/spork/blob/c1b35d81c44d61d883da7ca91ae0088b6b8f3f2f/src/main/kotlin/se/kth/spork/base3dm/TdmMerge.kt) | structured-merge | Content and structure conflicts differ; keep all revisions until resolution. |
| [google/diff-match-patch](https://github.com/google/diff-match-patch/blob/62f2e689f498f9c92dbc588c58750addec9b1654/javascript/diff_match_patch_uncompressed.js) | text-cleanup-and-patch | Semantic cleanup and fuzzy text application are separate jobs; fuzzy success does not validate a baseline. |
| [codeberg.org/mergiraf/mergiraf](https://codeberg.org/mergiraf/mergiraf/src/commit/b9a78df83d48a89961310dde67898dd1b355690e/src/matching.rs) | three-way-structure | One-to-one matchings; schema/language semantics and post-render structural validation matter. |
| [microsoft/vscode](https://github.com/microsoft/vscode/blob/df2411cf7d8f2e0cfc79109a3bc8eaab2c69165b/src/vs/editor/common/diff/defaultLinesDiffComputer/computeMovedLines.ts) | moved-line-refinement | Move refinement has heuristic length and similarity gates; never adopt code-oriented thresholds as rich-text laws. |

## Best API Review verdict

**Pursue the revised plan.** Keep ordinary accepted JSON, immutable span correspondence and canonical native mutation/position owners. Effects compose on spans. Three-way comparison retains every branch contribution, and pure resolution derives a target without discarding that comparison. Native proposal creation owns live review import.

The strongest justified cuts are the exclusive group-kind model, merge-only review result, annotated-node mutation protocol and separate diff manager. A mandatory public CRDT graph does not earn its global reader/serializer cost from this evidence. Native move identity is a hard requirement; S0 must reopen its native owner if the completed prerequisite cannot preserve it.

| Design lane | Verdict and reason |
| --- | --- |
| Enrich annotated diff with tags/callbacks | Stop: pushes identity, combined effects and application policy into consumers. |
| Return only DocumentChange or merged text | Stop: mutation output omits ambiguity, branch contributions and review alternatives. |
| Adopt GumTree, Difftastic or jsondiffpatch wholesale | Stop: each supplies useful mechanics but a narrower correspondence/runtime contract. This is a scope verdict, not a quality ranking. |
| Require a persistent public graph/CRDT | Defer replacement: no failed public-JSON law justifies it. Strengthen native identity where required. |
| Immutable comparison, composable effects, native operations and pure resolution | Pursue: supports detached snapshots, recorded history, review and merging without another state authority. |

## Plan amendments

1. F35 retains unilateral deletions, clean branch origins, identical contributions and conflict alternatives. Pure resolveComparison preserves standalone automatic merging.
2. F36 composes move, split/join, wrapper and interior changes.
3. F37-F38 define granularity, group/effect counts, move navigation and dependency-safe filtering.
4. F39 maps all 14 structural quality scenarios to original fixtures. Reconstruction alone cannot pass.
5. F40-F43 cover wrappers, topology/render validation, concurrent moves and history/batching invariants.

The existing plan contains proposed signatures, consumer call sites and add/change/remove adoption. Those signatures remain uncompiled proposals. Next owner: Plite Plan on the existing plan, starting at S0 after native authored changes is complete.

## Evidence and stop checkpoint

Seven source-pinned executable witnesses passed. The first launch used the wrong CommonJS constructor export for diff-match-patch; its exports identified the harness correction. No product repair was made. There are 31 bounded local read slices across 13 repositories; every inspected file matched its pinned commit. Metadata dates do not imply reused clones are latest.

Nine design approaches were rejected and six duplicates merged into 11 kept leads. All 11 became plan/test/benchmark packets; scores range from 9 to 11 and rank investigation value only. Three issue discussions were read from ten candidates (nine search hits plus one code-linked issue). No PR body was read or external message sent. Existing authored-changes research supplied dedupe context; its native/provenance boundaries were rechecked.

Next shard: none. Every material lane has source support and concrete adoption/proof requirements. More broad searching would add weaker support before the production matcher and prerequisite exist. Reopen for a specific failed quality/native invariant or materially stronger implementation.

Workflow slowdowns: one truncated broad web batch, two guessed source paths corrected by inventories, one CommonJS harness export mismatch, and one report-generation variable typo corrected before writes. These caused no product change or missing evidence. No user decision/access blocks research.
