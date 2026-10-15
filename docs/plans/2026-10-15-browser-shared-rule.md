---
work_kind: workflow
---

# Browser drives: share the input and frame facts with every pstack project

Status: executed: waiting on your commit
Topic: correct
Playbook: build

The owner asked: "Do this task here: “Move the browser input facts into shared pstack rules”". `docs/plans/2026-10-14-browser-drift.md` put the facts about how agent browsers type, draw frames and copy into plate-2's `verify` Drive section, and its Defaults picked a later move to the shared pstack source. This iteration is that move, through the `sync-pstack` skill's Lesson mode. The run directory is `docs/plans/artifacts/2026-10-15-browser-shared-rule/`.

## Brief

### What will change?

Every pstack project now has one shared page that says how agent browsers type, draw and copy, and each project's agent file links to it. plate-2's verify rule keeps only the editor checks.

### What could go wrong?

Agents followed it in plate-2 and ellie, but only in dry runs that change nothing. No real browser session has used it yet. plate-2's copy waits for your commit.

## Teach

pstack's shared rules live in one source, dotai, and a sync copies them into each project. Rules every project needs sit in the always-read agent file. Longer ones sit in their own file under the project's pstack rules folder, with one line in the agent file saying when to read it.

Yesterday's verdict found that agent browsers differ from a real keyboard in a few ways, and wrote them into plate-2's verify rule. Those facts hold in any project. ellie's baseline smoke showed Claude would type a mention trigger with a call that sends no key events.

So the facts move into a new shared rule file, browser.md, with a one-line pointer every project's agent file carries. plate-2's verify rule keeps only what is Plate-specific: editor checks type key by key, then read back the marks.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which projects get the rule | plate-2, ellie and plate's open pull request branch, which the other session's sync covers; the older plate-2 copies stay on their old pins | Sync every managed project | sync all | small |
| Whether a project can opt out | The rule gets its own section, so a project with no browser work can skip it | Always on in every project | always on | detail |
| Who pushes dotai and syncs | The other session, whose commit carries this rule unchanged after its review; I only trim plate-2's verify rule afterwards | I push both changes and sync today | push both now | small |
| When the last test round counts as passing | Pass it even though ellie's answers mention the test-suite fallback, since they correctly say ellie's rules forbid it (look) | Keep rewording until ellie's answers stop mentioning the fallback | keep rewording | detail |
| Who re-syncs plate's PR 5166 | The details chips session, since it owns that PR and its description | I push it myself and leave its description out of date | push plate | small |

## Main changes

- A shared rule file, `.agents/pstack/rules/browser.md`, rendered from dotai's `skills/sync-pstack/assets/pstack/rules/browser.md`, holds the typing, frame and clipboard facts for Codex's browser, Claude Code's built-in browser and Claude in Chrome. Below 30 animation frames a second, a frame claim stays open. A test in the project's own browser suite, where the project allows one, or a browser the owner brings to the front can then prove it. The block's new `browser` section carries one pointer line, and `RULE_FILES` in `sync-pstack.mjs` registers the file under that section, so `skip: ["browser"]` drops both.
- plate-2's `verify` Drive section keeps the editor rule (type key by key for autoformat, hotkeys, marks and trigger menus, then read back text and marks) and sends the per-browser operations, the frame check and the clipboard routing to the shared file.

## Steps

- [x] 1. In dotai, add `skills/sync-pstack/assets/pstack/rules/browser.md`, the block's `browser` section and pointer, the `RULE_FILES` entry and `browser` in the interview's `skip` list. Proof: dotai's build, tests and skill validation pass on a `HEAD` export with only this change, then on the live checkout once the other session's work passes.
  `docs/plans/artifacts/2026-10-15-browser-shared-rule/export-tests-a1.log` (193 of 193), `docs/plans/artifacts/2026-10-15-browser-shared-rule/export-validate-a1.log`, then `docs/plans/artifacts/2026-10-15-browser-shared-rule/dotai-tests-a2.log` (205 of 205 on the live checkout).
- [x] 2. Commit and push dotai with the other session's changes, as dotai's `AGENTS.md` asks. Proof: the pushed commit's hash.
  Deviation: the details chips session commits and pushes after its review, carrying this rule's files unchanged, as its 2026-10-15 message says. Proof becomes that commit's hash with `rules/browser.md` in it.
  dotai `bb27327` on `origin/main`; its `rules/browser.md` matches plate-2's rendered copy byte for byte, read 2026-10-15.
- [x] 3. Sync plate-2 and ellie from the pushed commit. Proof: `apply` then `check` exit 0 in each, and each has `.agents/pstack/rules/browser.md` and the pointer line.
  Deviation: that session's sync applies the commit to plate-2, ellie and plate's PR 5166 branch. This run reads `check` and the two files in plate-2 and ellie after its message.
  plate-2 `check` prints in sync; both projects hold the same `browser.md` and one Browser drives line in `AGENTS.md`; ellie `origin/next` holds the sync commits `bcd23184d` and `14d94ce57`. plate's branch rests on the other session's report.
- [x] 4. Trim plate-2's `verify` Drive section to the Plate part with a pointer to the shared file. Proof: `pnpm run prepare` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` pass, and the generated skill holds the pointer.
  `docs/plans/artifacts/2026-10-15-browser-shared-rule/prepare-a1.log`, `docs/plans/artifacts/2026-10-15-browser-shared-rule/sync-check-a1.log` and `docs/plans/artifacts/2026-10-15-browser-shared-rule/trimmed-text-a1.log`; plate-2 `check` still prints in sync.
- [x] 5. Smoke both projects in both runtimes after the change and judge each answer against `docs/plans/artifacts/2026-10-15-browser-shared-rule/intended.md`, beside the baseline smokes run before it. Proof: the smoke logs and a judgment file in the run directory.
  `docs/plans/artifacts/2026-10-15-browser-shared-rule/judgment.md` judges three rounds. Rounds 1 and 2 each found a clash in the new frame text, fixed by dotai `5abc257` and `878f50d`. Round 3, `docs/plans/artifacts/2026-10-15-browser-shared-rule/smoke-plate2-new-a3.log` and `docs/plans/artifacts/2026-10-15-browser-shared-rule/smoke-ellie-new-a3.log`, meets every intended line and passes under the "keep rewording" Defaults row.
- [x] 6. Run `verify` on plate-2 and ellie. Proof: each log exits 0.
  Deviation: the syncing session's Lesson run verifies the projects it syncs. This run reruns `check` on plate-2 after the trim, which touches no synced file.
  This run also ran `verify` on both after the trim: `docs/plans/artifacts/2026-10-15-browser-shared-rule/verify-plate2-a1.log` and `docs/plans/artifacts/2026-10-15-browser-shared-rule/verify-ellie-a1.log` print verified.
- [x] 7. Deliver: plate-2's changes stay on `next` for the owner's commit; ellie commits and pushes only the files the sync wrote. Proof: ellie's pushed commit hash.
  Deviation: the syncing session delivers ellie and plate. plate-2's sync and this trim stay uncommitted on `next` for the owner.
  Deviation: the two clash fixes landed after that sync, so this run pushed ellie's re-sync to `878f50d` itself as `4fdae141d`, and the details chips session re-synced plate PR 5166 to `e9cd1c78b6` at this run's request. `docs/plans/artifacts/2026-10-15-browser-shared-rule/verify-plate2-a2.log` and `docs/plans/artifacts/2026-10-15-browser-shared-rule/verify-ellie-a2.log` print verified after the last sync.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

- Baseline smokes, run before any edit: `docs/plans/artifacts/2026-10-15-browser-shared-rule/smoke-plate2-baseline-a1.log` and `docs/plans/artifacts/2026-10-15-browser-shared-rule/smoke-ellie-baseline-a1.log`. In plate-2 both runtimes type key by key, Claude citing the Drive section, but Claude names no frame check on the toolbar prompt. In ellie, Claude would type `@` with the built-in `type` action, and neither runtime names a frame check.
- This change alone, on an export of dotai `0d68151`: `export-tests-a1.log` passes 193 of 193 and `export-validate-a1.log` prints skills ok, in the run directory.
- The live dotai checkout fails 11 suggested-task tests in another session's uncommitted `decisions-check.mjs`, `tasks.mjs` and `chips.md` rework: `dotai-tests-a1.log` in the run directory.

## Close

Steps 2, 3, 6 and 7 moved to the details chips session, which carried this rule unchanged in its dotai commit `bb27327` and synced plate-2, ellie and plate PR 5166. The first after-change smokes then found two clashes in the frame fallback. It pointed ellie at Playwright tests that ellie bans, and it read as a wait for the owner. This run fixed both in dotai `5abc257` and `878f50d`, re-synced plate-2, pushed ellie's re-sync as `4fdae141d` and asked the details chips session to re-sync PR 5166, which it did as `e9cd1c78b6`. In round 3 both runtimes in ellie still mention the suite fallback, as ruled out by ellie's own rules. I accepted that under the "keep rewording" Defaults row instead of rewording again.

Landed:

- dotai `origin/main` holds `bb27327`, `5abc257` and `878f50d`: the shared `rules/browser.md`, the block's `browser` section with its pointer line, the `RULE_FILES` entry and `browser` in the interview's skip list.
- plate-2, uncommitted on `next`: the synced `.agents/pstack/rules/browser.md`, `.agents/pstack.json` and the `AGENTS.md` Browser drives line, plus the trimmed verify Drive section and its generated skill.
- ellie `next` holds `4fdae141d`, and plate PR 5166 holds `e9cd1c78b6`, both synced from `878f50d`.

Proof and limits:

- dotai's tests and skill validation exit 0 after each of its three commits, in `dotai-tests-a2.log` to `dotai-tests-a4.log` and `dotai-validate-a2.log` to `dotai-validate-a4.log` in the run directory.
- `sync-pstack verify` prints verified on plate-2 and ellie after the last sync, in `verify-plate2-a2.log` and `verify-ellie-a2.log`. PR 5166's `browser.md` matches plate-2's copy byte for byte, read through `gh` on 2026-10-15.
- `pnpm run prepare` and `sync-resources.mjs --check` pass after the trim.
- The smokes ran three rounds in read-only sessions with no browser tools loaded. They show what each runtime says it would do, not a real drive.

All 7 steps are done.

Open work:

- Claude in plate-2 still trusts the built-in-browser skill's line that the pane cannot open a local server Claude starts, which is wrong in a desktop session. That skill is Anthropic's, so the fix is a note in the shared browser rule. Suggested task `t_16937dc7`; owner: zbeyens; stop: started or dismissed; tracked: `docs/plans/suggested-tasks.decisions.tsv`.
