I recommend **cand-2 as the base**, with two grafts. Cand-1 and cand-2 both score 15/18 and cand-3 scores 14. Cand-2 wins the tie because it is the only design whose retirement works on the current `pnpm kb` with no tool change, it has the only real scenario budget, and its trial key is the hardest to game.

I changed nothing. I did not run `pnpm kb`, because `kb.mjs` has write paths (`tooling/scripts/knowledge/kb.mjs:351`, `:524`, `:532`). I checked its behaviour by reading the source.

## Scores

| Criterion | cand-1 | cand-2 | cand-3 |
|---|---|---|---|
| 1. Owner priority | **3**: the human pass is the main route, P6 goes through Bug fix, "a model assertion cannot retire cursor drift", and the agent executor is left for later. | **3**: the human passes are tick boxes, the Bug fix delta puts the test "at the scenario's `retire-at` layer or lower" under a gate that is not `manual`, and agent-run testing is a later `run` mode. | **3**: preparation only, one session per find in P6 at "the lowest adequate layer", and a later executor gets "no retirement authority". |
| 2. Repo consistency | **3**: extends `investigation`, all three quoted anchors exist (`investigation.md:7,9,10`), uses verdict's entry pattern, a round plan, a decision log and `page-lead`. | **2**: the anchors are valid, and so is the Bug fix **After** on "Verify on the same surface" (pstack `bug-fix.md:10`). But the entry becomes a three-mode front end (`round`, `prep`, `find`) with five prep sessions, and it sets no `page-lead` or `Topic:`. | **3**: **In**, **After** and **Replace** on real quotes, `page-lead`, a `Topic: human-sweep` subject page and `Playbook: sweep`, which is closest to plan-page conventions. |
| 3. Reuse, no duplication | **2**: calls the existing owners directly and adds no second law format, but it needs a `knowledge.mjs` change (new tag and K4 validation) before it works. | **2**: uses kb unchanged and keeps one unavoidable hand list (`pages.md`), but `/sweep find` wraps issue-draft with a prefill, which edges toward renaming another owner. | **3**: no tool change, no catalog, calls the owners directly, and puts one narrow, real fix inside Maintainer. |
| 4. Retirement that works | **3**: the scenario's own ID becomes a keyed tag, kb's existing gate classification (`knowledge.mjs:693-717`) decides retirement, and K4 rejects unknown IDs. It covers every scenario, published or not, once built. | **2**: works today, since `TAG` (`:59`), `byTag`, the `ISSUE_REF` key (`:1037`) and K4's plate exemption (`:1530-1543`) are all real. Hole: only `EDIT-*` or `plate#N` tags can retire a scenario. An unpublished find, or a scenario with no rule and no issue, never retires. | **1**: the plain-text ID is found only through ranked word search, and retirement needs the preparer to re-judge five conditions every round. Definitions are spread across past round plans. Nothing can be checked mechanically. |
| 5. Aim | **2**: draws on the census, its blind-spot list and the Scenario Generator, and says "smallest set". But there is no budget, and every page gets a load/render check. | **3**: ranks by census surface, sends rows a model test can see to agents, and keeps the "lying observer" classes. Caps of 5 scenarios per P1/P2 page and 3 per P3/P4 page, a round-wide minutes cap, and a `blind-spot` field per scenario. | **2**: each extra scenario must name a distinct failure, but there is no cap or budget. |
| 6. Small and trialable | **2**: small, with a fair three-arm trial and a sealed key, but the kb code change comes before any round, and the key ("independently established journeys") is vague. | **3**: no scripts and kb unchanged. Its trial runs every arm at a commit before 2026-09-28 and builds the key from fixes after that date, so no arm or lead can have seen it. Its prompt avoids Eval's banned words, and the keep rule is frozen in advance. | **2**: the fewest files, but the key ("held-out historical defects and controlled coverage changes") is vague. |
| **Total** | **15** | **15** | **14** |

## False or overstated claims

- **cand-2** says `knowledge.mjs` "reads every `docs/editor-behavior/*.md` except `current-evidence.md` as law". That is false. Law is the single `SPEC` path (`tooling/scripts/knowledge/knowledge.mjs:26`, `:759`, `:811`), and `docs/editor-behavior/**/*.md` is only a citation store (`:782`). Its conclusion, keep scenarios out of that directory, still holds.
- **cand-2** cites `b1e70bb257` as the `blind-spot` source for the forced-layout scenario. That commit is "fix(registry): read discussion cards through AuthoredPlugin changes". The forced-layout miss comes from the probe report, not from that commit.
- **cand-2** derives P1 and P3 from `'new'` alone. `getPliteExampleStatus` returns `'experimental'` before `'new'` (`plite-example-registry.ts:100`), so `pagination` gets no route. Hidden examples (`:76`, `:106`) are not handled either. cand-1 and cand-3 handle both.
- **cand-3** says the knowledge tool "already searches test titles" for `sweep-…` IDs. This is overstated. Such a token falls through to ranked word matching (`knowledge.mjs:1025-1047`, `:993`), which is a substring regex, so `…-007` also matches `…-0071`. Results are capped at 5, or 25 with `--detail`. Nothing validates the ID, and `pnpm kb gaps` (`:1278`) covers only locked `EDIT-*` rules, so it says nothing about sweep IDs.
- **cand-3** cites `knowledge.mjs:560` for "gate classification". Line 560 is `parseTests`; the gates are assigned in `testFiles` at `:693`. This is minor.
- **Checked and true:**
  - cand-2's "44 fixes changed such specs": census-a has 19 and census-b has 25 rows that touch `apps/www/tests/browser`.
  - cand-2's `EDIT-CAPTION-NAV-003` result matches two tests at `apps/www/tests/browser/media-caption.spec.ts:888` and `:993`, which kb classifies as `manual` in chromium, firefox and webkit.
  - No test in the repo carries a `[x#N]` issue tag today, as cand-2 suspected.
  - cand-3's Maintainer finding: `issue-draft.md:61-72` assumes the two videos are `main` and `next`.
  - Every investigation quote, plus `editor-proof.md:154`, `plan.md:15` and `markdown-editing-spec.md:37`, the line with the spec's scope exclusions.

## Grafts

1. **From cand-1:** a stable scenario-ID tag that kb treats as a key, such as `[SW-forced-layout-01]`, accepted by `TAG` and validated by K4. This closes cand-2's hole for unpublished finds and for scenarios with no rule or issue. Put it in cand-2's own "after round 1" slot, not before the first sweep, and keep `plate#N` and `EDIT-*` as optional extra tags.
2. **From cand-3:** fix Maintainer's two-video labelling so a Slate or other-editor reference keeps its own label instead of being forced into `main`/`next` (`issue-draft.md:61-72`). cand-2's `/sweep find … beta.mov slate.mov` hits this directly. With that fix in place, drop cand-2's `find` mode and call issue-draft directly, as cand-1 and cand-3 do.

Cand-2 should also take P3 routing for experimental and hidden examples from cand-1 or cand-3.
seat: claude-opus-5-5 @high
exit=0
