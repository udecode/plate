# Sweep agent pass

An agent pass runs a list of sweep rows with Claude Code subagents, the lanes, in Claude Code's built-in browser, several at once. It ends in one checked `results.json` with every row's result, finds and clips, and the beta builds each row saw. [The sweep](./sweep.md)'s A session says what one session covers; this file says how the lead session runs many of them. [The lane rules](./sweep-lane.md) hold what each lane does. `tooling/scripts/sweep-pass.mjs` writes the rows, the lanes and their briefs, and checks and collects the records. `tooling/scripts/sweep-clip.mjs` records a lane's find as a clip.

Only Claude Code runs lanes. Codex can read this method, but its browsers take over the owner's desktop or Chrome, so a Codex session asked for a pass names this route and hands it to Claude Code.

## When

- A round plan's agent pass over its session pages and rechecks.
- A recheck of the pages a domain's fix run touched, once beta serves the fix.
- Any list of beta pages a person asks to have tested by agents.

The built-in browser is Chromium. A row planned for Safari, Firefox or the iPhone still needs a session in that browser, and a check that needs a native clipboard, an OS input method, a native drag or a physical device stays a person's.

## Rows

A rows file is a JSON list of rows, each with a unique `id`:

- A session row is `{ "id", "kind": "session", "url", "reference"?, "budget", "context"? }`. `reference` is the page beta should match, and a row without one tests beta alone.
- A recheck row is `{ "id", "kind": "recheck", "url", "issue", "expect", "budget", "context"? }`. `issue` names the issue, such as `plate-private#94`, and `expect` says what a fixed page does.
- `budget` is the row's minutes. `context` is a list of lines the lane starts from: earlier records of the page, known issues it should not record again, and a scenario catalog in `docs/editor-behavior/scenarios/` when one covers the page.

`node tooling/scripts/sweep-pass.mjs rows --pages [--only <route prefix>] [--base <url>] --out <file>` writes a session row for each page `page-health.mjs --list` prints. A round's record can export the same shape. Put every line a lane needs into the rows' `context` before you plan; the lane rules name no person, round or record.

## Plan

```bash
node tooling/scripts/sweep-pass.mjs plan --rows <file> --dir <run dir> [--lanes <n>] [--lang en|zh]
```

The run directory is `docs/plans/artifacts/<slug>/` in the main checkout, given as an absolute path, because git ignores it and removing a worktree deletes that worktree's copy. `plan` keeps each page's rows in one lane, so a recheck runs beside its page's session. It packs the pages into lanes of about 50 minutes, none over an hour. `--lanes` asks for a set number of lanes. `--lang` names the language the lanes write their records in; pick the language of the person who reads the results. It writes `rows.json`, `lanes.json`, `queue.tsv` and one brief per lane in `lanes/`, and makes `records/` and `clips/`. It refuses a page whose rows hold more than an hour, more lanes than pages, and a run directory that already holds a plan.

## Run the lanes

1. Run `gh auth status`, because `collect` reads the Deploy workflow's runs. Run `tabs_context`. When it says the pane is hidden, ask the owner once to show it with Cmd+Shift+B and go on; until they do, each lane checks a frame claim with a headless replay.
2. Open one tab of your own on beta and read `localStorage.getItem('theme')` there. Every lane's tab shares that value, and the D key outside an editor flips it. Close the tab.
3. Start each lane with the `Agent` tool: `subagent_type: "general-purpose"`, `model: "opus"`, `effort` the level `node .agents/pstack/lead.mjs` prints and `run_in_background: true`. Its prompt names its brief, for example "You are lane L3 of a sweep agent pass over beta pages. Read `<run dir>/lanes/L3.md` in full and follow it."
4. Run at most six lanes at once, because the pane holds a limited number of tabs. Set a lane's `state` in `queue.tsv` to `running` when it starts and to `done` or `stopped` when it ends, and start the next `waiting` lane then.
5. Save each lane's final message to `<run dir>/lanes/<lane>-reply.md` when it arrives.
6. A lane stops itself after an hour. Stop a lane still running at 65 minutes with `TaskStop`. For each of its rows that has no record, write one with result `untested` and a note that the lane was stopped.

Do not drive the pane while lanes run. After the last lane, open a tab of your own on beta again. When the stored theme differs from the one you read in step 2, set it back with `javascript_tool`, or remove it when it was unset, and reload. Then close the tab.

## Collect

```bash
node tooling/scripts/sweep-pass.mjs collect --dir <run dir>
```

`collect` checks every record and writes `results.json` and `results.md` only when all of them pass. It refuses a planned row without a record, two records for one row, a result word the row's kind does not allow, a missing field, a record that ends before it starts, a find without a `.webm` or `.mp4` clip, and a clip that is outside the run directory or does not exist. It then maps each row's start and end to the Deploy workflow's successful runs and names in `builds` each beta build the row saw. Give each refusal to a fresh lane with the record and the problem, or fix the record yourself when the problem is only its shape.

`results.json` is the pass's output. A round's record imports it with its own tool, and Triage a domain reads it as the round's export. `results.md` is the same results for a person to read. A lane marks a find `replayOnly` when only a headless replay showed it, and a person confirms such a find.

## What earlier passes hit

- A lane that left out `tabId` typed into another lane's tab.
- Six lanes with two tabs each hit the pane's tab limit, and a lane waited 30 minutes for a tab.
- The D key outside an editor turned beta dark mid-pass, and the theme is stored once for every lane's tab.
- A hidden pane draws one or two frames a second, so floating toolbars and popovers failed to appear on beta and on the reference alike.
- Below 768 pixels wide the tab sends an Android user agent, and keyboard shortcuts stay broken until a reload at desktop width.
- `left_click_drag` releases at once, so drag autoscroll and dragging past an edge stay a person's check.
- Free-form reports broke the parser that read them, and nothing told the lane.
- Beta redeployed four times during one pass, so one build name per pass was wrong.
- Codex computer use took over the owner's screen, and real Safari cannot run in the background.
