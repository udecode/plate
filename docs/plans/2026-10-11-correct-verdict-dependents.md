# Correct: a verdict names its dependents

Status: executed: waiting on your commit
Topic: correct
Playbook: plan

The owner asked, after the authored fill verdict read only Plite files: "is it not a mistake of /verdict skill to not propagate any plite item to plate? never do one without DEPENDENTS?" It was. `.agents/playbooks/verdict.md` already asked a verdict to inspect "each materially different consumer", but nothing checked it, and the ledger's hand-kept `consumers` lists were stale. `authored.json` names two files and misses `BaseSuggestionPlugin`. This iteration makes the ledger derive each scope's dependents from imports, shows them in `lookup`, and refuses a new review page that leaves one out. It also repairs the fill verdict that started this.

## Brief

### What will change?

You said never review without the dependents. Now a new review must say how its change hits every Plate feature that uses the code, or the check fails. I also fixed the fill review that skipped them.

### What could go wrong?

Someone can still write "unaffected" with a weak reason and pass. Only the trail review would catch it. Reviews of core code get long lists, up to 52 features for react.

## Teach

A verdict is the review that decides whether an idea for Plate or Plite deserves more work. The review ledger tracks each area's files and checks every verdict page.

Until now a verdict only had to read its own area's code. The playbook said to look at who uses it too, but nothing checked, and the lists of users were out of date. So the fill review read only Plite files and never looked at suggestion mode, the Plate feature it will change.

Now the ledger finds the users from the code. A user is any Plate area whose files import the reviewed one. Looking up an area shows them. A new verdict must list each one, with a file it read or a reason it is unaffected, or the check fails.

## Main changes

- `tooling/scripts/review-ledger.mjs` derives a scope's dependents from imports. A dependent is a scope that owns non-test code outside `packages/plitejs` importing a file the scope owns, through a relative path or a workspace specifier. `lookup` and `show` list them. `check` refuses a review page that the base commit (`PLATE_BASELINE_BASE`, else `HEAD`) lacks until its `### Dependents` names each one beside a `review_inputs` path from it, or beside "unaffected" and a reason. It fails on a base or `review_commit` this checkout lacks.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which reviews get checked | Only new review pages | Every review page, which turns old ones red | check old reviews | small |
| Excusing a dependent | "Unaffected" with a reason passes, and only the trail review judges the reason (look) | Every dependent needs a file the review read | require reads | small |
| What counts as a dependent | Plate and app code that imports the scope directly | Also Plite's own code, or imports through other scopes | count plite importers | small |
| The old hand-kept consumer lists | Kept, while the check builds its own list | Delete them from every scope file | drop consumer lists | detail |

## Close

Landed, uncommitted on `next`:

- `tooling/scripts/review-ledger.mjs` gains `dependentsOf` and `importEdges`, lists `dependents` in `lookup` and `show`, and adds the `### Dependents` refusal to `check`. `gitGrep` now serves `plansOf` too, and `git()` reads up to 256 MB of output.
- `tooling/scripts/review-ledger.test.mjs` gains four cases, for the refusal, the "unaffected" reason, a committed page with an unknown base, and an unknown `review_commit`.
- `.agents/playbooks/verdict.md` points the verdict step to `lookup`'s dependents and asks for the `### Dependents` list.
- `CODING_STANDARDS.md` gains one rules-table row that names the check as its enforcer and leaves the read and the reason rule-only.
- `docs/development/agent-skills.md` names dependents in its Review row.
- `docs/plans/2026-10-11-authored-fill.md` gains, in Evidence, `### Dependents` for the ten Plate scopes that import authored, and `review_inputs` gains the suggestion plugin, the suggestion demo and `/dev/authored-review`. Only that route imports `authoredTreeProof` outside plitejs, so every Plate dependent is unaffected until the parent plan's cutover.

Proof, from the decision log's `scope:` cells:

- The first three new cases fail against `HEAD`'s script. The fourth came later and is covered by its mutant.
- Five guards, reverted one at a time on frozen `8c62587d5f`, each fail exactly their own case.
- The fill page as frozen at `01cb2ee0ee` is refused for its ten dependents, and the authored-values page is refused for its own when the base predates it. The repaired fill page passes.
- At `HEAD`, the base script and the candidate both report the same seven older pages, each for git-ignored inputs, so the change adds no failure there.
- `pnpm lint:task` is clean on both script files, and `check-playbooks.mjs` passes.

The check proves a dependent is named, not that it was read, and an "unaffected" reason is judged only by the decision-trail review. It sees static imports only, so a plugin loaded by key or a registry entry reached by string stays invisible. Importers no scope owns, such as `/dev/authored-review`, are listed but not required. The verify gap the owner raised first, no Chrome run on the dependent's real route, is not covered here.

The run had one owner ask, and it is done. Nothing was reversed. One step deviated. The first candidate failed open, because Apple Git's `grep -E` rejects `(?:` and the swallowed error read as no imports; running `lookup` caught it before any proof, and the grep now throws on any exit but 1.

One open item moved to the subject. The review-ledger step is red at `HEAD` on seven older pages.

## Evidence

Run directory: `docs/plans/artifacts/2026-10-11-correct-verdict-dependents/`, git-ignored. It holds the pre-edit copies, the prototype and its counts, the base, mutant and replay logs, and the mutation specs.
