# Agents read less before they work

Status: executed: dotai and ellie pushed; plate-2 waits on your commit
Topic: pstack
Playbook: build

The owner asked why card sessions cost so much and said "ok go fast" to the shrink proposed in reply. Measured over 143 card sessions in three days, a card session's median first call already held 96k tokens of context, and rereading that preamble on every call was about a third of its input reads. This iteration moves the largest always-read rules behind pointers that say when to read them, so each session loads them only when its work needs them.

## Brief

### What will change?

Sessions in plate-2 and ellie now read 6k fewer bytes of rules up front, one that touches code 28k fewer, and a card session can skip 49k of chips rules. It's live in dotai and ellie; plate-2 waits for your commit.

### What could go wrong?

An agent may skip a moved rule it needed. No trial checked that agents follow the pointers, and nothing was reviewed. The block's new size limit means the next rule added must push other text out.

## Teach

Every session starts by reading AGENTS.md, and any session that touches code also reads CODING_STANDARDS.md in full. Both are reread on every call, so each extra paragraph costs on every step of every session.

Today the block in AGENTS.md carries two long rules most sessions rarely need: how to hand work to Codex, and the one-hour time budget. CODING_STANDARDS.md carries a 22k-byte table that pairs each rule with its enforcer, which matters only when someone changes a check. Card sessions also read the whole chips rule and skill, though their brief already tells them what to log.

After this change, those parts live in their own files, and the always-read text keeps one line each that says when to open them. The card brief now prints the exact row command, so a card session skips the chips files. A size check stops the block from growing back.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which block rules move out | Codex workers and Time budget, two long rules most sessions rarely need | Also move Git and Autopilot, which most sessions do use | move more | big |
| Where the rules table goes | Its own file under development docs, read before changing a check | Keep it in the coding standards | keep table | big |
| Block size limit | A check that refuses a block over its new size, lowered as it shrinks | No limit | no limit | small |
| Where the size check runs | dotai's skill validation, the gate before every dotai commit | plate-2's full check | check here | detail |
| Worktree troubleshooting section | Left as is | Cut it, since the Git rule repeats most of it | cut troubleshooting | detail |
| Review of this change | None, since you said fast | A panel on the dotai diff and a smoke | full | detail |

## Main changes

- **Codex workers and Time budget leave the block.** Their text moves verbatim into `.agents/pstack/rules/codex.md` and `.agents/pstack/rules/time.md`, and the block keeps a short bullet for each that names when to read the file.
- **Card sessions skip the chips law.** `chips brief` prints the ledger row command with the task's stored decision shell-quoted, plus the started-row rules, so a card session reads neither `.agents/pstack/rules/chips.md` nor the chips skill unless it offers or drops another task.
- **The rules table leaves CODING_STANDARDS.md.** `docs/development/enforcement.md` holds the table that `/pstack:correct` keeps, and CODING_STANDARDS.md keeps its gates and a pointer that names when to read the table. `AGENTS.md`, `VISION.md` and `docs/development/agent-skills.md` cite the new file.
- **The block has a byte budget.** dotai's `scripts/validate-skills` refuses `assets/block.md` over 39,500 bytes and says to move a rule's detail into a rule file.

## Steps

- [x] 1. Measure what card sessions read and where the input goes. Proof: the scratch scripts' output summarized in the lead paragraph; skip: the raw transcripts stay local.
- [x] 2. Move the Codex workers and Time budget rules into rule files and register them. Proof: `docs/plans/artifacts/2026-10-17-agent-context/dotai-suite-a1.log`.
- [x] 3. Make the card brief self-contained and add the card-session exception to the chips rule and skill. Proof: `docs/plans/artifacts/2026-10-17-agent-context/dotai-suite-a1.log`.
- [x] 4. Move the rules table to `docs/development/enforcement.md` and repoint its citations. Proof: `docs/plans/artifacts/2026-10-17-agent-context/moved-check-a2.log`.
- [x] 5. Add the block budget to `validate-skills` and prove it refuses the old block. Proof: `docs/plans/artifacts/2026-10-17-agent-context/block-budget-old-a1.log` and `docs/plans/artifacts/2026-10-17-agent-context/block-budget-new-a1.log`.
- [x] 6. Run `deslop` on the helper change and `unslop` on the new prose; `no-comments` skips under fast. Proof: the writing row.
- [x] 7. Commit and push dotai, own paths first, then other sessions' edits. Proof: dotai `f26ce21` and `62ad893` on `origin/main`.
- [x] 8. Sync ellie and plate-2 from the pushed commit, reinstall the chips skill in both and run `verify`; plate waits for its own next sync. Proof: ellie `519be647e` and `58edd2eda`, `docs/plans/artifacts/2026-10-17-agent-context/verify-ellie-a1.log` and `docs/plans/artifacts/2026-10-17-agent-context/verify-plate-2-a1.log`.

## Close

Reversals and deviations first.

- The run was fast, as the owner asked: no panel on the dotai diff, no smoke trial of the moved rules and no decision-trail review. Sync-pstack's Lesson mode asks for all three before the dotai commit.
- `sync-pstack.test.mjs` carried another session's plan-page tests, so this run's commit `f26ce21` holds them too, as its body says.
- The plate-2 sync ran with `--allow-dirty`, because its only uncommitted `AGENTS.md` edit was this run's own line outside the block.
- The size check went into dotai's `validate-skills`, not plate-2's `pnpm check`, because the Tests rule puts a static invariant in a check script and the block's growth happens in dotai.

What landed:

- dotai [`f26ce21`](https://github.com/udecode/dotai/commit/f26ce216778104a6c4fecd66652181b3e7ec49d0) moves the two rules out of the block, makes the card brief self-contained and adds the block budget. [`62ad893`](https://github.com/udecode/dotai/commit/62ad893bef0a9e8e5a19d17b4687869d24fccccb) commits other sessions' plan-page, stage-message and manifest edits.
- ellie [`519be647e`](https://github.com/InformedMedical/ellie/commit/519be647e283f0b9202cd8a9e7853512a051df0d) syncs from `62ad893`, and [`58edd2eda`](https://github.com/InformedMedical/ellie/commit/58edd2eda1e19fa3b6b76c27f17859f851a83ed3) reinstalls the chips skill.
- plate-2 holds the sync, the reinstalled chips skill, the rules table move and this plan in its working tree, for the owner's commit.

Proof and its limits:

- The sync-pstack suite passes on the pushed commit, and `validate-skills` passed before the commit. The new test proves a decision holding a double quote and `$HOME` survives the brief's quoting and appends.
- The budget refuses dotai's old block at 45,430 bytes and passes the new one at 39,188.
- The moved table and the kept gate paragraphs match the before copy word for word.
- plate-2's `AGENTS.md` went from 49,649 to 43,463 bytes and `CODING_STANDARDS.md` from 30,951 to 8,865, so a code session's two always-read files lost 28,272 bytes, about 35%.
- Nothing measured a card session after the change, so the saving per session is the byte count, not a token count from a real run. No trial checked that agents open `codex.md` or `time.md` when their pointers say to.

Counts: 8 of 8 steps done.

## Open work

- plate-2's agent-context changes wait on your commit: `AGENTS.md`, `CODING_STANDARDS.md`, `VISION.md`, `docs/development/agent-skills.md`, `docs/development/enforcement.md`, `.agents/pstack.json`, `.agents/pstack/` helpers and rules, `.agents/skills/chips/SKILL.md`, `skills-lock.json`, this plan, its log and the subject fold. owner: zbeyens. stop: the owner commits them.
- plate syncs this change at its own next sync, which also opens its PR. owner: zbeyens. stop: plate's next sync.
- This change shipped fast and is owed a review until you say "full". owner: zbeyens. stop: "full" or the owner drops the review.
