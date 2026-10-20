# Plite fixtures: settle the 16 legacy Slate rows that failed

Status: executed: 13 rows rewritten to Plite's behavior, 3 cut, no Plite bug found
Playbook: verdict

**None of the 16 failing legacy Slate fixtures shows a Plite bug.** Each failure is a place where Plite deliberately replaced a Slate heuristic with a rule from `docs/vision/plite.md`, so 13 rows now assert Plite's output and 3 rows are cut. The 2026-10-20 test audit had run the 60 skipped fixtures and kept these 16 as `it.failing` through `packages/plitejs/test/fixture-claim-overrides.ts`. That file and the `it.failing` branch in `test/index.spec.ts` are gone, and every fixture in the tree runs as a plain test. Suggested task t_ef9d5fcb asked the question.

## Brief

### What will change?

All the old Slate test cases in Plite now run as ordinary tests. Thirteen now expect what Plite does on purpose, and three that tested Slate-only ideas are gone. No editor behavior changes.

### What could go wrong?

A rewritten row could lock in a real Plite bug. I checked each one against Plite's written rules and tried two claims in a probe. The close names what the rows still don't prove.

## Teach

Plite inherited a folder of small Slate test cases. Each one builds a tiny document, runs one edit and compares the result to a stored answer. Sixteen of them failed, so the earlier cleanup marked them as known failures instead of deciding what they meant.

Slate guessed document structure with fixed habits, such as "a block holds either blocks or text, never both". Plite asks the document's schema instead. These test cases give every block an open schema that accepts anything, so Plite keeps blocks nested, keeps inline nodes beside blocks and never puts blocks inside a void.

So the stored answers were Slate's guesses, not Plite bugs. Thirteen now hold Plite's answer. Three are cut, because they repeat another case or start from a document Plite refuses to load.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| What the 13 rows expect | What Plite does now, which follows its written rules | Fix Plite to match Slate's old answers | slate shapes | big |
| The two duplicate mixed-paste rows | Cut them, since other rows already cover both cases | Rewrite them too | keep duplicates | small |
| The row that splits blocks inside a void | Cut it, since Plite refuses to load that document | Rewrite it to Plite's output | keep void split | small |
| The row named after removing inlines | Rename it to say it keeps them | Keep the old name | old name | detail |
| Next step | Land now, since no row needs an owner's call | Stop at the verdict | hold | detail |

## Evidence

Model: claude-opus-5-5 at high effort, read from this session's metadata.

Prior work. The 2026-10-20 plitejs test audit unskipped the 60 old skips, kept 44 and parked these 16 behind `fixture-claim-overrides.ts`. No review scope owns the legacy fixture tree, so this verdict touches no ledger scope. The decision log names the probe that printed each row's actual and expected output at the base commit.

### Requirements

- A block lands wherever the compiled schema places it, at any depth, and placement checks the target's children as they will be after the transfer (`docs/vision/plite.md`, the transfer rules).
- A void derives its canonical empty text child and cannot declare content (`packages/plitejs/src/core/schema-compiler.ts:3608-3615`). Loading a void with two block children throws "allows at most 1 children".
- Finalization keeps required inline spacers and maps selection through the change it publishes, so an update that changes nothing moves no point (`docs/vision/plite.md`, the canonical document rule).
- The fixture schema in `config/plite-test-jsx.js` gives every non-void fixture block `schema.content.open`, which admits text, inlines and blocks together.
- Every kept test fails for a named, plausible defect, and duplicates are cut (`.agents/pstack/rules/tests.md`).

### Lanes

1. **Fix Plite to match Slate's answers. Loses.** It would bring back schema-blind habits that `docs/vision/plite.md` replaced: flattening blocks out of a container whose schema accepts them, dropping inlines a schema admits, and storing elements inside voids.
2. **Rewrite each row to Plite's output where a rule decides it, and cut rows that repeat another or start from a refused document. Wins.**
3. **Strongest deletion: cut all 16. Loses.** The rewritten rows guard real failure modes, such as a paste that drops trailing text, a void that keeps element children or a no-op update that moves the caret, and nothing else in the fixture tree covers open-content mixed landing.
4. **The rule is wrong. Not a lane.** No row argues against a Plite rule; each only carries Slate's older answer.

### Rows

| Row | Outcome | Why |
| --- | --- | --- |
| `normalization/block/remove-inline` | rewritten, renamed `keep-inline` | Open content admits inlines beside blocks, so repair keeps them and pads each with spacer texts |
| `insertFragment/of-blocks/block-empty` | rewritten | An empty open-content block takes the pasted blocks as its children, as a flat block paste into it does |
| `insertFragment/of-mixed/block-empty`, `block-end`, `block-end2`, `block-middle`, `block-start`, `block-start2` | rewritten | A slice whose top level holds text lands as the caret block's content, and open content admits its blocks there |
| `insertFragment/of-mixed/block-empty2`, `block-empty3` | cut | Each repeats `block-start2` or `block-end2` on an empty target, which `block-empty` already covers |
| `insertFragment/of-tables/merge-cells-with-nested-blocks` | rewritten | The first pasted cell merges into the active cell and the rest land as sibling cells, as the row's old comment said; the old answer contradicted that comment, which the comment pass then deleted |
| `insertFragment/of-texts/inline-empty` | rewritten | Pasted text lands inside the empty inline at the caret, where typing lands too |
| `insertNodes/void/block-nested` | rewritten | An inserted void's block children flatten to its one text child |
| `setNodes/text/merge-across` | rewritten | The update changes nothing, so the selection stays where it was |
| `splitNodes/voids-true/block` | cut | Its input, a void holding two blocks, is a document Plite refuses to load |
| `wrapNodes/voids-true/block` | rewritten | A wrap cannot give a void an element child, so the document stays as it was |

## Close

The run reversed no pick and found no Plite bug. It changed only test files under `packages/plitejs/test` and this plan.

Thirteen fixtures now assert Plite's output, `normalization/block/remove-inline.tsx` is renamed `keep-inline.tsx`, and `of-mixed/block-empty2.tsx`, `of-mixed/block-empty3.tsx` and `splitNodes/voids-true/block.tsx` are deleted. `fixture-claim-overrides.ts` is deleted, and `test/index.spec.ts` runs every fixture with plain `it`.

Proof:

- `test/index.spec.ts` passes all 903 fixture tests with no `it.failing` left. Its scope is the whole fixture tree of `packages/plitejs/test` under the fixture schema.
- A probe on `createEditor` with the fixture schema found that typing into an empty inline lands inside it, and that loading a void with two block children throws.

Limits. The rows prove Plite's model behavior under an open-content schema only. They say nothing about a paste through the browser or about Plate's text-block schemas, where blocks cannot nest in a paragraph. The `of-mixed` rows pin which of several valid placements the fitter picks in open content, so a deliberate fitter change would need to rewrite them.

This plan leaves no open work.
