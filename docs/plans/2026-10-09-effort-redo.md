# Effort on the page, and redo

Status: executed: dotai pushed; plate-2 waits for your commit
Topic: pstack
Playbook: feature

The owner's words: "why it didnt show the effort level on his artifact ? repair /plan-page skill to show it next time.. i'd want a playbook or parameter ksill to poteto so it can redo anything worth (any subagent lane, code writing etc, plan,) the same way it cleans up a given PR (babysit ?) - like that plan was just a draft". Earlier in the same session: "i want to run again poteto on it with the higher effort, without repeating steps not needing the effort change". Then: "stop, use fast poteto".

## Brief

### What will change?

Each plan page names the model and effort of every session that wrote it, and every review seat's effort. A new redo skill reruns a past plan at your current effort, redoing only what ran lower and reusing the rest.

### What could go wrong?

The effort comes from the agent's own transcript. When the helper cannot find exactly one matching transcript, it records nothing and says so. Shipped fast, so no review panel read this.

## Teach

A plan page draws from the plan and its decision log. Nothing wrote down which model or effort made those decisions. Claude Code and Codex keep it in local transcripts, which the agent cannot see. The Opus review seat showed no effort, even when it ran at medium.

Now a shared helper finds the running session in its transcript and reads its model and effort. Each time the log gets new rows, it adds a lead row when they changed, and the page header lists each one. The seat runner reads each Claude seat's effort the same way.

The redo skill treats an old plan as a draft. It lists each part with the effort it ran at, redoes what ran lower, reuses proofs on unchanged bytes, and cleans up the old code the way Babysit cleans up a PR.

## Public API

```text before
```

```text after
redo <plan, page link or PR>
```

## Main changes

- `decisions-check.mjs append` opens each batch with a `lead` row, such as `claude-opus-5-5 @high`, whenever the session's model or effort differs from the log's last one. It reads them with the new shared helper `lead.mjs`, which matches the running command against each recent Claude Code and Codex transcript's pending tool calls.
- `cross.mjs` runs each Claude seat with its own `--session-id`, reads the effort that seat ran at, and prints `seat: <model> @<effort>` on stderr. The Panel review rule copies that into the `seats` row.
- The page header shows a Lead tag listing each lead model and effort in order, beside the review round.
- The new dotai skill `redo` follows Session pickup but redoes every unit that ran below the current level, and routes the old diff through Babysit. The block's Long runs rule points to it.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the effort lives | A lead row in the decision log, written by the append helper | A Lead line in the plan that the agent writes | lead line |
| How a seat's effort is known | Read from the seat's own transcript, so the seat still runs at its usual effort | Always pass the models sheet's default effort to the Opus seat | pin seat effort |
| Where redo lives | A shared dotai skill, so every pstack project gets it | A plate-2 project playbook | plate only |
| Which projects sync now | plate-2 only; Ellie gets it at its next sync | Sync Ellie too | sync all |
| Subject page link | The old pstack page link no longer opens, so the page moved to https://claude.ai/artifact/559ZPtXQdgX6DHwS5vacmj | Keep the old link, https://claude.ai/artifact/2rSBBJ5gSUkEtNJv91c2af | old page |
| Review | None: you asked for fast, so no architect, panel, smoke or trail review | Run them on the diff now | full |

## Steps

- [x] Shared: `lead.mjs`, the append lead row, the seat line in `cross.mjs`, the header tag, the `redo` skill, and the block and shape sentences. Proof: the two new tests fail on the old helpers and the whole suite passes on the new ones.
- [x] Runtime: `lead.mjs` and the append in this live Claude Code session, and `lead.mjs` in a live Codex session. Proof: the logs under the run directory. Done: `docs/plans/artifacts/2026-10-09-effort-redo/codex-lead-a1.log`, and this plan's log opens with a `claude-opus-5-5 @high` lead row.
- [x] Corpus: render every plate-2 plan with the old and new renderer and diff the bodies. Done: same exit codes and identical bodies, timestamps aside; no existing log has a lead row yet. Done: `docs/plans/artifacts/2026-10-09-effort-redo/corpus-a1.txt`.
- [x] Shared: build the catalog, validate, commit and push dotai. Done: udecode/dotai `61f145e` on `main`.
- [x] plate-2: apply, verify, install `redo`; commit nothing. Done: `docs/plans/artifacts/2026-10-09-effort-redo/plate-apply-a1.log`, `docs/plans/artifacts/2026-10-09-effort-redo/plate-verify-a1.log`.

## Proof

- Every proof command runs through `node .agents/pstack/proof.mjs`, which writes its command line and exit status under `docs/plans/artifacts/2026-10-09-effort-redo/`.

## Close

What landed: udecode/dotai `61f145e` adds `lead.mjs`, the append lead row, the seat line in `cross.mjs`, the page header's Lead tag and the `redo` skill. plate-2 is synced from it and has `redo` installed. Those changes wait for your commit. The commit also carries another session's uncommitted session-title work in dotai, as dotai's rules require.

Why your mate's page showed no effort: nothing recorded the lead's effort, and the Opus seat's effort was only ever on its own machine. A page made after this sync shows both.

Proof and limits: the two new tests fail on the old helpers and pass on the new ones, and the whole suite passes (156 tests). A live Claude Code append wrote `claude-opus-5-5 @high`, and a live Codex session read `gpt-6.1-sol @medium`. Every existing plate-2 page renders the same as before. Detection fails, with a printed warning, when two sessions run the same append within the same moment. Logs from before this change have no lead rows, so redo treats those stretches as below the current level. The redo skill was never run on a real draft. Shipped fast, so no architect, panel, smoke, trail review or reflect ran.

Counts for five steps: 5 done, 0 partial, 0 skipped, 0 blocked, 0 open.

## Open work

- Ellie still runs the old helpers until its next sync. owner: Ziad. stop: the next `sync-pstack sync`. Tracked here.
- Run `redo` once on a real lower-effort plan, such as the mate's HTML and Word export plan, to prove it end to end. owner: Ziad. stop: the first redo request. Tracked here.
