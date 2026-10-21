# Review desk

Status: partial: phase 2 shipped fast and unreviewed; your trial and the page budgets still wait
Topic: review-desk
Playbook: plan

## Brief

### What will change?

A DiffsHub-style page on your machine lists every task landed on next, shows only the files you review, and remembers what you read. Phase 2 shows each landing's plan, proofs and notes, and lists open questions and chips.

### What could go wrong?

22 of 156 recent public rows hold a must-read test, skipped, env-gated or weakened without a code change. Speed budgets are unmeasured. Phase 2 shipped unreviewed before your trial. Decisions puts 889 unseen picks after the 11 questions.

## Teach

Today you review pstack's work in four places: DiffsHub links, a terminal script, plan pages and the chips board. None keeps a list that grows until you read it.

Each task lands on next as one squashed commit naming its session and, usually, its plan. The desk, a DiffsHub page on your machine, lists each landing under its session. The public view shows package source, changesets, the registry and the docs site; internal adds apps and root files. A test shows only when skipped, env-gated, or weakened with no code change.

Opening a session's plan shows each file's net change across its landings. You mark files viewed and accept, and the desk saves what you read, so new landings return as Debt. Press c to see a landing's plan, proofs and notes. A plan edit or open concern after your accept also returns it to Debt. Key 4 lists every plan's open questions, and key 5 lists the chips.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| App | A local page in DiffsHub's design, opened in your browser and served by one process per repository | An Electron window | electron | big |
| What a row is | One landed task, listed under its session; opening one of the session's plans shows each file's net change | One row per session; one per session and plan | by session | big |
| Default view | Public: package source, changesets, registry and docs site | Internal; everything | start internal | big |
| Tests | Hidden. In the public and internal views you must read a skipped or env-gated test, and a weakened test in a landing that changes only tests; that landing then gets a row. Other weakened tests show as a badge | Every weakened test must be read; tests always shown | read weakened tests | small |
| Sessions with only plans | In their own plans view; other views count them as hidden | Shown in every view | plans everywhere | small |
| A file one plan changed twice | One diff from before the plan's first change to its last, or one piece per landing when another landing touched the file in between. A landing with no plan stands alone | Net across the whole session; one piece per landing always | net by session | small |
| Desk file | Read from next. A change to it shows in every view and applies only once you accept it | Read from your checkout and apply changes at once | local desk file | detail |
| Terminal review marks | A badge only; only the desk's own record clears a row | Terminal marks clear rows too | trust terminal | small |
| Where views are set | A small desk file in each project | pstack's project settings | pstack settings | detail |
| Review record | One per GitHub repo, shared by every clone, with one app open at a time | One per clone | per clone | detail |
| Where the app is built | A local git repository in this run's folder until you say push dotai (look) | Push it to dotai now | push dotai | detail |
| Review rounds | Three panel rounds on the Electron plan. The web redesign got one design round, and the build's diff gets one panel round, whose fixes land without another round. The sign-in cut and phase 2 shipped fast with no panel. Saying full reviews them | A panel on the web plan before the build | panel | detail |
| Browser sign-in | None, on your word. The server answers only requests to its own address, and its API answers only its own page | A one-time code in the link that opens the page | sign-in | detail |
| Build sessions | On your word, phase 2 built in this session in fast mode, before your trial | Phase 2 waits for the trial and builds in its own session | after trial | detail |
| Picks in Decisions | Every look or answer pick in any plan's Defaults, after the questions and decide chips, until you press x on it. Today that is 889 picks from 185 plans (look) | Only picks of plans still open | open plans only | small |
| What x hides | Only a pick; a question stays until its plan drops it | x hides questions too | hide questions | detail |
| Starting a chip | y copies its start command for you to send to the lead; the desk starts nothing | A button that starts the session | start button | detail |
| Trial pass mark | Faster than DiffsHub and at most 72 seconds a task, so 100 tasks fit in two hours (look) | Faster than DiffsHub only | floor N | small |
| Plan page link | A new page at https://claude.ai/artifact/LmfrwLCc1YFTNhZjEFVb4w, because the old one at https://claude.ai/artifact/HLYerHCL1r65tGVNEqwUJM no longer opens | No published page, since the plan file is the record | drop page | detail |
| Comment lines | Counted with code for now | Code and comment lines split | split comments | detail |
| Tests you cut | Every scripted browser test goes, and I check the page by hand in the built-in browser. The unit tests for core, the server and stats stay | Cut the unit tests too | cut node tests | small |

## Open questions

- Push the desk to dotai? dotai is public and anyone can install skills from it, so the app stays in this run's folder until you say "push dotai". Then I move it into dotai's skills folder, run dotai's skill checks, and commit and push dotai's main branch.

## Outcome

The owner opens one browser page, picks a view, and works down a queue of tasks landed on next, grouped by session. Each row says why it needs attention. Reading a file and accepting a row are separate, explicit acts. The record of what was read survives restarts and names the exact comparison, its commits and its file versions, so new work and wider views come back as debt instead of counting as reviewed under an old accept.

## Scope

In scope:

- A local web app forked from DiffsHub at pierre `548416a7`, with install and launch scripts, laid out as a dotai global skill, `skills/review-desk/`.
- Reading first-parent commits on the project's trunk branch, the chips ledger, plans and decision logs, all as data.
- Plate's desk file, `.agents/review-desk.json`.

Out of scope:

- Reviewing open PRs, contributor branches or work in worktrees.
- Changing chips, landing work, writing any ref other than the desk's own `refs/review-desk/<trunk>`, or posting anywhere.
- Running any code from the repository under review.
- Any AI summary or reading order.
- Changes to `review.mjs`, `land.mjs` or `proof.mjs`.

## Decisions

- **Stay on trunk.** Every task already lands as one squashed commit, so the net change is what the owner reads; a PR per task would cost about 60 PRs a day for a merge gate nobody uses.
- **Base design.** The opus runner's design won the blind judge on throughput and minimalism. After the plan panel it takes two ideas from the losing designs. One row per landing comes from sol's design, and coverage per comparison, with net review kept apart, comes from sol's and astra's. For the web app, one architect round ran on the same three models, and sol's design won the blind judge 26 to 25 and 24. It takes from opus's design the pristine import, one git process per group of pieces, the port as the lock and the hot-reload dev loop. From astra's it takes the accept scope computed by core, plans sent as a key core resolves, and the Node 22.18 minimum.
- **Landing rows.** `land.mjs` squashes each task into one landing, so a landing is one task. A session can hold many unrelated tasks. `local_0835e684` landed 15 commits, among them the CLI watch removal, a test-lane change and an AI preview fix. Sessions group rows and offer a net view per plan, and never merge tasks into one row. Landings carry `Session:` since 2026-10-18. Older commits, merges and the 5 later commits without the line are rows with no session, and a merge's diff is against its first parent.
- **Views.** Public means all published package source, because a signature change deep in a package is public. Only 19 of platejs's 60 export entries match entry-file globs, and the entry files are generated barrels. Older tests named `*.slow.*` sit inside package source, so the tests class matches them and a commit that touches only them stays hidden, such as `c42d650c3b`. Over the last 300 commits at `59c69fcfcc`, public holds 153 commits and internal 187. Internal still matters inside public rows: 71 of the 153 carry 966 internal files that only the internal view shows.
- **Net per plan.** Inside a session, the landings that share a `Plan:` form a group, and a landing without one stands alone. 61 of the 117 session landings in the window carry no `Plan:`. One session's planless landings mix unrelated tasks, such as `local_0835e684`'s CLI watch removal and its slow-lane move, so netting them would merge tasks. For each file a group touched more than once, the desk diffs it from before the group's first change to its last when no other landing touched it in between, and shows one piece per landing otherwise. It also shows one piece per landing when another file in the group shares one of the file's paths, such as a file renamed away and a new file renamed onto the same path. In the last 300 commits 4 files were changed twice inside a group in the code views, one of them public, and one diff covers each. The plans view has one real fallback: `3a94e39a85` and `28a9a4baef` change `docs/plans/2026-10-19-deploy-environments.md` with the same session's planless `b54221655a` between them, so the file shows in two pieces. Tests also build the explicit pair `c99fd5c2af` and `a2eebd1d65` around another session's `a45383f3ed`. A file that nets to zero shows as reverted and still needs a view.
- **Coverage is per comparison.** A record names the comparison's commits, each file's before and after mode and blob, whether it showed as net or per landing, the desk file version in force, and the basis, files or summary. A mode change therefore never looks reverted. A landing reviewed only through its plan's net view shows as reviewed as net, never as inspected alone. The horizon narrows only the queue. To replay events and find the desk file version in force, the desk reads history back to the oldest commit any recorded event names.
- **Test weakening.** The desk diffs with rename detection and no rename limit. On `b77cba1680`'s 3,787 files that takes 0.5 s, the same as git's default, and without detection 2,025 more test files in the window would read as deleted. A test file is flagged when a landing deletes it without a rename, removes more cases or assertions than it adds, adds more `.skip`, `.only`, `.todo`, `.if`, `.skipIf` or `.runIf` calls than it removes, or moves an existing assertion under a new `if` whose condition reads `process.env`, directly or through a name the file binds from it. That last check finds 4 files in the window, all real gates in `5b951205a1` and `e300fb3265`. A looser check that counted any new `if` flagged 17, among them `c70bacbd4a`'s branch on a `mode` parameter. A flag has two levels. A skipped or env-gated test must be read. So must any flagged test in a landing that changes only tests and skipped paths, unless its only flag is one lost assertion, and that landing then enters the code views. Every other flag is a badge on the row; it opens the file, and an accept does not need it viewed. In the last 300 commits that leaves 22 of the 156 public rows with a test to read, 50 files and 14,681 lines beside 686,537 lines of public code; reading every flag would add 123,478. Hand-labelled real changes test the rule, with its misses: a raised timeout and folded assertions in `c42d650c3b`, and rewritten expected values in `1e42eb9563`.
- **The desk file.** The desk reads `.agents/review-desk.json` from the trunk, never from the checkout. The file sits in `.agents/`, which every view skips, so a landing that edits it could narrow the views and hide later work. A landing that changes it therefore shows in every view with the file's diff to read, and its version applies only once that landing, and every earlier one that changed the file, is accepted. Until then the views use the version in force, which on a record's first open is the trunk's, and the header names it. `--config` reads a local file, and the header says so.
- **API signal.** A scan of `export` lines catches an added or removed export, not a changed member; `e7c24667ee` adds `withdraw` to an exported type without touching an `export` line. Plate's generated API manifest changed in 41 of the last 300 commits, `e7c24667ee` among them, so Plate's desk file flags a change to it as an API change.
- **Terminal marks.** The judge ruled that a terminal mark never counts as coverage. The desk shows it as a badge and never writes the terminal store.
- **Trust.** One Node process per record runs the core and binds only `127.0.0.1`. It always holds a port derived from the record, and serves the page on that port or on `--port`. Only one process can hold the record's port, so it is the record's one writer, and the kernel frees the port when the process dies. The page needs no sign-in, on your word. The server answers only requests that name its own `Host`, and its API answers only requests the browser marks as coming from its own page, so other sites and other local ports get nothing. A local program can forge those headers, as it can read the record's files directly. The server sets no cookies, sends no CORS headers, and serves a page whose content policy runs only its own scripts. The desk never runs code from the repository it reviews. Every git call turns off textconv programs, external diff programs and hooks, the fetch never recurses into submodules, and phase 2's parsers ship with the app.
- **Fork.** The page keeps DiffsHub's reader, file tree, themes and workers. The fork changes about ten DiffsHub files, among them the page, the layout, the header, the sidebar, the viewer, the patch loader and its accumulator, and adds the queue, the scope sheet, the client and the keys. The reader keys each piece of a file by an id from core, never by path or blob id, because a file can show in two pieces and git prints no blob ids for a mode-only change or a pure rename. The fork deletes DiffsHub's GitHub routes, token controls, hosting files and telemetry, and drops fonts that download at runtime or lack a redistribution grant. Next only builds the page; no Next server runs when you use the desk.
- **Fetching.** The desk fetches the trunk into its own ref with an empty `--refmap=`, `--no-tags`, `--no-prune`, `--no-auto-maintenance`, `--no-recurse-submodules` and no `FETCH_HEAD`, because `land.mjs` fails a landing when its own fetch of `origin/next` fails. Without the empty refmap, git also applies `remote.origin.fetch` and moves `origin/next`. In a scratch clone the plain fetch moved it, and the full command changed none of the other 13,892 refs and added no entry to `origin/next`'s reflog.
- **Event log.** Each event is one line, synced to disk before the app acts on it. A write that stores part of the line goes on until the whole line is stored, and a failed write cuts the log back to its last whole line. When the log does not end in a newline on open, the desk moves the torn tail aside and truncates to the last whole line before it writes, so the next event never joins the torn bytes.
- **Phases earn their place.** Stats and the release range fold into phase 1, because the owner's trial needs stats and a release range is a horizon that starts at a tag. Phase 2 was to start only if the trial showed the desk beats today's tools; on your word it was built first.
- **Context and the board.** The desk reads each plan and its decision log at the trunk tip through git, and the chips ledger and run folders from the main checkout's disk, because run folders are never committed. The board loads after the desk prints its address, so start time does not grow. The server sends the page a new board only when the board's contents change. An accept records the versions of the landing's plan, rows, proof logs and images. A change to any of them, or an open concern note, sends a reviewed row back to Debt until you accept again or press "I read these changes".
- **The trial measures both halves.** The desk splits one day's public landings into two halves with about the same changed lines and hands them out one at a time, alternating halves, timed by the same start and done keys. A desk landing opens in the desk; a control landing opens its DiffsHub link with the view's files listed, so both halves read the same files. The desk passes when its minutes per landing are lower than the control's and at most 1.2, which fits 100 landings into two hours; next took 44 landings on 2026-10-18 and 53 on 2026-10-19. Files accepts made under the frozen desk file version must cover every frozen file of each timed desk landing, and each half needs at least 10 landings. A per-day figure from one day is a projection, and the report says so. The trial counts time, not problems caught.
- **Grafts from the losing designs.** A scope sheet before any accept on summary, shortcuts ignored while typing or composing, binary files counted as files, the last good board kept until a ledger snapshot validates, owed agent reviews listed apart from the owner's debt, unresolved chip commits, plans as landed beside the current version, and concern notes that keep a row in debt.

## Main changes

- A local web app reads landed commits, plans, decision logs and the chips ledger as data, and keeps the owner's review record in its own append-only log outside every repository.
- `review.mjs` stays as it is. The desk reads its marks and never writes them.
- Plate gains one file that names its views.

## Claims reversed

- Earlier I said the launcher would install the app under Plate's tooling folder with pnpm's ignore-workspace flag. The app now lives in dotai's layout and installs outside every repository.
- Earlier I said a row is one session's commits. A session can hold many unrelated tasks, so a row is now one landing.
- Earlier I said public means package entry files. Most of the public API sits below them, so public now means all published package source.
- Earlier I said coverage is per commit and path. That let one net read count as inspecting each commit, so coverage is now per comparison.
- Earlier I said dropping the net diff was safe because only 1 of 17 sessions had several public commits. Rework also happens in the internal view, so sessions now get a net diff per file.
- Earlier I said each phase pushes dotai's main. dotai is public, so the push waits for your word.
- Earlier I said 64 of 156 public commits weakened tests. That count included skipped tooling tests and missed `*.slow.*` tests, so it is 61 of 153.
- Earlier I said one diff covers 23 of 24 reworked files. That counted the public files twice. Per session it was 14 of 15, and grouped by plan it is all 7.
- Earlier I said fetching into the desk's own ref never touches shared refs. Git also moves `origin/next` through the remote's configured mapping, so the fetch now turns that mapping off.
- Earlier I said opening a session nets each file across all its landings. One session can land several plans, so the net view now covers one plan's landings.
- Earlier I said tests alone never put a landing in a view. A landing that only weakens tests now gets its own row.
- Earlier I said every weakened test must be read. That added 123,478 lines to the public view, mostly tests deleted or trimmed beside a source change, so now only skipped or env-gated tests and tests-only landings must be read, and the rest get a badge.
- Earlier I said 61 of 153 public commits weakened a test. Those were flags, not proven weakenings; 22 of 156 public rows now hold a test you must read.
- Earlier I said a session's planless landings form one group. That netted unrelated tasks, so each now stands alone, and 4 files net in the code views instead of 7.
- Earlier I said no group needs the per-landing fallback. The plans view has one real case.
- Earlier I said a landing that changes the desk file only needs to show. Its change also took effect before you read it, so it now waits for your accept.
- Earlier I said the trial times both halves at equal coverage. They ran on different clocks and file sets, so one command now times both and both read the view's files.
- Earlier I said each budget ends at the first animation frame with its target. That callback runs before layout and paint, so each budget now ends after the frame paints.
- Earlier I said the desk is an Electron app. You asked for a web app forked from DiffsHub to build faster. The desk is now a local page served by one process per record, and the built core stays.
- Earlier I said a test you must read shows in every view. The plans view shows only plans, so it now shows in the public and internal views.
- Earlier I said a scripted Chrome drive proves the page and its budgets. You asked for no end-to-end tests, so the drive is gone and I check the page by hand in the built-in browser.
- Earlier I said the page signs in with a one-time code. You asked why you should sign in at all, so the code and the per-tab token are gone, and the server's host and same-page checks keep other sites out.
- Earlier I said phase 2 starts only after your trial, in its own session. You asked for it now, in fast mode, so it is built here and the trial still waits.
- Earlier I said the record's port makes its server the one writer. A second server on another `--port` could open the same record, so every server now holds the record's port whatever `--port` says.

## Steps

Phase 1 builds in this session and ends with your trial. On your word, phase 2 built in this session too, in fast mode, before the trial.

### Phase 1. Inbox desk

- [x] 1.1 Ship the web shell in this run's folder as `skill/review-desk/`, laid out as dotai's `skills/review-desk/`. One commit imports DiffsHub from pierre `548416a7` into `app/web/` unchanged, without the Berkeley Mono font and the avatar and brand images, and the next commit forks it, with a change notice in each changed file. `SKILL.md` documents install, open, stop, dev, doctor, stats and trial. `desk.mjs open` installs or rebuilds the app under `~/.pstack-review/app` when its code hash differs, starts the record's server when none answers, and opens the page. The server binds only `127.0.0.1` on the record's port, serves the page `next build` exported, and answers only requests to its own address from its own page. Until `7d5f879` cut it, the page also signed in with a one-time code. `desk.mjs dev` runs it under `node --watch` with Next's dev server behind the same checks. Pins are exact, at least seven days old and DiffsHub's own set: next 16.3.3, react and react-dom 19.2.7, @pierre/diffs 1.5.2, @pierre/trees 1.0.0-beta.6, @pierre/theme 2.0.0, @pierre/theming 1.0.1 and @pierre/icons 0.9.0. It needs Node 22.18 or later. The skill folder is its own local git repository with one commit per step, which nothing pushes until you say "push dotai". Proof, each command through `proof.mjs`:
  - `desk.mjs install --home <fresh folder>` builds against the published packages, and the page opens in the built-in browser;
  - `node --test app/server.test.mts`, each case also run once against a planted defect and logged failing: a wrong `Host`, another port's `Origin`, `/control` without its secret or with an `Origin`, a second server on the same record, on the same or another `--port`, which exits while the first keeps serving, and a fixture repository whose textconv program would write a marker file, which never appears;
  - `lsof` lists only `127.0.0.1:<port>` for the server;
  - `doctor` flags a dependency younger than seven days on a fixture;
  - the skill repository's log shows the import, then the fork, and no commit holds the Berkeley Mono font or the avatar and brand images.
- [x] 1.2 Build core: per-commit git facts cached forever; landings grouped by session, then by plan; views and categories from `.agents/review-desk.json` at the trunk tip; the plan comparison with net and per-landing files; git-only signals (fast, beyond the ask, deleted code, export lines, test weakening and the desk file's path signals, such as Plite core and Plate's API manifest); the append-only event log at `~/.pstack-review/<owner>-<repo>/events.jsonl` with coverage per comparison; one running app per record; and the isolated fetch into `refs/review-desk/<trunk>`. The web app adds these to the core:
  - each accept event stores every file's shape and versions;
  - replay counts an event only when its comparison rebuilds under the recorded desk file version;
  - a desk file change reruns the weakening and export scans, and accepts wait until they finish;
  - rows appear before line counts;
  - a view or accept sent twice with the same id writes one event;
  - every git call turns off textconv programs, external diff programs and hooks, and fixes its path prefixes;
  - reading runs one git process per group of pieces and labels each piece with its id;
  - the accept scope comes from core.

  A test you must read shows in the public and internal views. Proof: `node --test` on fixtures recorded at `59c69fcfcc`, each case also run once against a planted defect and logged failing:
  - a hand-labelled set of paths with their view and category, including `packages/test/src`, `*.slow.*` tests inside package source, generated registry output, `skills-lock.json` and a plan file, and landings including `c42d650c3b`, hidden from every view, `5b951205a1` and `e300fb3265`, which enter public through env-gated tests, and `843939b657` and `c99fd5c2af`, whose one lost assertion is a badge that adds no row;
  - view counts equal to `tiers10-a3.log`, public 156 rows (153 plus 3 tests-only landings with a test to read) and internal 188;
  - the hand-labelled test changes give the rule's expected flags and levels, among them `c70bacbd4a`'s `mode` branch, which a rule that flags any new `if` fails, a pure rename that reads as deleted when rename detection is off, and a renamed test that loses lines;
  - `e7c24667ee` raises the API signal and its export-line signal stays clean;
  - in a fixture repository, a landing narrows the desk file while the working tree holds another copy: the rows it would hide stay in Unreviewed, its diff shows in every view, and the views narrow only after its accept; the planted defects read the checkout and apply the trunk's version before the accept;
  - commit A changes line x, commit B restores x and changes line y in the same file; a net accept covers both as net, and A alone shows as not inspected;
  - a file that nets to zero and a renamed file both appear in the plan comparison;
  - a comparison built from the members `c99fd5c2af` and `a2eebd1d65` shows `packages/platejs/turbo.json` in two pieces, each equal to that commit's own patch, and the plans view's `deploy-environments.md` group shows its file in two pieces the same way; the planted defect always takes one net diff;
  - each of `local_0835e684`'s planless landings is its own comparison;
  - a partial accept, a new landing in a reviewed session and a wider view each leave the row in Debt;
  - a torn last line replays as absent, and an accept written after it survives a restart; the planted defect appends without repairing the tail;
  - a terminal mark never changes coverage;
  - an accept whose comparison no longer rebuilds covers nothing on replay;
  - after a desk file landing is accepted, the weakening and export flags equal a fresh open under the new version, and an accept sent before the rescan ends is refused;
  - a mode-only change and a pure rename each read as their own labelled piece;
  - a view or accept repeated with the same id writes one event.
- [ ] 1.3 Build the page: the queue beside DiffsHub's tree and reader, with Unreviewed and Debt, the view switch, landings under session headers and plan subheaders, the category bar and filters, a label on each piece of a file shown in two pieces, cards for binary, reverted, mode-only and rename-only files, a switch that brings badge tests into the reader, a header link to a desk file landing that still waits for its files accept, the view and accept keys, with `v` marking one section of a piece at a time and `B` taking the cursor's session, a scope sheet filled by core for partial, summary and bulk accepts, the horizon picker with a release tag as a start, the terminal-mark badge, counts of hidden landings by reason, trunk watches pushed to the page, and a fetch every 60 seconds while the page has focus. Proof: the install's `next build` and the `node --test` cases pass. I also check the page by hand in the built-in browser, against the plate-2 main checkout with a fresh state folder, and read a screenshot for each check:
  - opening `4e16eada7d` paints a known added line;
  - I accept one landing after viewing every file, view half the files of a second, leave a third alone, then stop and reopen the desk: the first is gone, the second is in Debt with exactly its unviewed files, and the third is still in Unreviewed;
  - each viewed file shows its own lines, not the previous file's or the previous piece's;
  - in a scratch clone with `origin/next` behind, the desk's own fetch leaves every ref and reflog unchanged except `refs/review-desk/next`;
  - in a scratch clone, a commit landed with `git update-ref` while a comparison is open stays unreviewed after that comparison's accept;
  - a filter changes both the tree and the reader, and the scope sheet still names every file the accept covers;
  - typing in the search box and an open dialog ignore the desk's keys;
  - the console shows no content-policy violation;
  - each budget below, read once from the browser's performance entries.
- [x] 1.4 Add `desk.mjs stats`: per day and view, landings and commits landed against those reviewed, split by basis, active minutes and landings per active hour. An accept made in one view counts in another when it covers every path the landing shows there, as core counts it. Add `desk.mjs trial split`, `trial run` and `trial report` for step 1.7. The split deals a day's public landings into two halves by changed lines. `trial run` hands out both halves one landing at a time, alternating, opens a desk landing in the desk and a control landing's DiffsHub link with the view's files listed, and times each with the same keys. The report gives each half's minutes per landing, summary accepts on their own line, and the verdict. Proof: recorded event log and trial log fixtures give the expected numbers and verdict.
- [x] 1.5 Add Plate's `.agents/review-desk.json` with the views in the Proof section. Proof: 1.2's hand-labelled cases pass with this file, the API manifest case included.
- [x] 1.6 Review and land: `deslop` and `no-comments` on the skill repository's history, one panel round on its diff whose fixes land without another round, `unslop` on `SKILL.md`, then `land.mjs` for the Plate side. The dotai commit and push wait for your "push dotai". Proof: the panel's answers in the run directory and the Plate commit.
- [ ] 1.7 Your trial: one real day with at least 20 public landings, split by `desk.mjs trial split`. `desk.mjs trial run` hands you both halves, one landing at a time. Owner: you. Proof: `desk.mjs trial report` prints pass, meaning the desk half's minutes per landing are lower than the control's and at most 1.2, files accepts under the frozen desk file covered every frozen file of each timed desk landing, and each half has at least 10 landings. On your word, phase 2 was built before it.

### Phase 2. Context, Decisions and Chips

- [x] 2.1 Add the context drawer: the plan as landed beside its current version, its decision-log rows, the proof logs it cites with their exit status marked unbound, images from the run folder, and the chips whose `commit:` names a landing, with off-branch commits shown unresolved. Markdown renders without raw HTML, SVG shows only as an image, and only files inside the plan's run folder open. The parsers are copies shipped with the app. Proof: on five sampled plans from the last seven days, the drawer lists the same plan, rows and files as a hand count, and a decision row that cites a path outside its run folder shows as refused.
- [x] 2.2 Record artifact versions in each accept and show changes since review: a plan diff, decision rows added after the recorded count, proof logs added or whose content changed, and a changed image. Proof: in the tests' scratch repository, editing a plan after an accept moves the row to Debt, and so does a proof log that turns from running to failed after the accept.
- [x] 2.3 Add the Decisions view (open questions from every plan whatever its status, look and answer picks not marked seen, and decide chips) and the Chips view (ready chips by priority, a read-only brief, and a copy of the start command). The board changes only when a complete ledger snapshot validates. Proof: a hand-labelled list of questions, including those in `2026-10-18-restore-chips.md` and `2026-10-17-authored-root-deletion.md`, equals the view's list; a truncated or malformed ledger keeps the last board and shows the ledger as degraded; and appending a ledger row updates Chips within one second.
- [x] 2.4 Add notes, with a concern note keeping its row in Debt, plus the panel and proof signals. Proof: `node --test` cases and a hand check in the built-in browser.
- [x] 2.5 Land fast: `deslop` on the skill repository's diff, then `land.mjs` for the Plate side. The dotai commit and push wait for your "push dotai", as in 1.6. Proof: the Plate commit.
- [ ] 2.6 Review the sign-in cut and phase 2 when you say "full": a panel round on their diff, then `no-comments`. Owner: you. Proof: the panel's answers in the run directory.

## Proof

Evidence goes under `docs/plans/artifacts/2026-10-20-review-desk/` in the main checkout, and every command that counts runs through `proof.mjs`.

The budgets cover the 300-commit window. Cold start is 4 s from `desk.mjs open` with a fresh state folder and no server running, and the first rows paint within 300 ms of the page opening. Warm start is 1 s, a move between rows 16 ms, opening a landing of 50 files or fewer to its first painted diff line 150 ms, opening `4e16eada7d` to its first painted line 500 ms, and an accept to the next row painted 100 ms. Cold and warm start end when `open` prints the page's URL. The hand check reads each once in the built-in browser, from the browser's Event Timing and paint entries, so a number is one sample, not a 95th percentile. The pane must run at least 30 frames a second while it reads them. A reading over twice its budget is a finding I fix before landing.

Plate's views. Each path takes the first class that matches it:

| Class | Paths |
| --- | --- |
| plans | `docs/plans/*.md`, `docs/plans/topics/*.md` |
| skip | `.agents/**`, `.claude/**`, `.codex/**`, `docs/**`, `**/AGENTS.md`, `**/CLAUDE.md`, `tooling/**`, `benchmarks/**`, `templates/**`, `apps/www/public/r/**`, `apps/www/src/__registry__/**`, `apps/www/src/generated/**`, `skills-lock.json` |
| tests | `**/*.test.*`, `**/*.spec.*`, `**/*.slow.*`, `**/__tests__/**`, `**/__snapshots__/**`, `**/tests/**`, `packages/*/test/**`, `packages/*/type-tests/**` |
| public | `packages/*/package.json`, `packages/*/src/**`, `.changeset/**`, `apps/www/src/registry/**`, `content/docs/**` |
| internal | every other path |

The public view shows the public class, the internal view shows public and internal, and the plans view shows plans. A test you must read shows inside its landing in the public and internal views, a landing that changes only tests enters a code view when one of its tests must be read, and every other flagged test is a badge. The category bar is separate from the views: it counts every file of a landing as source, tests, config, dependencies, generated, workflow, docs, plans or unclassified, and greys out the hidden ones.

## Completion gates

| Gate | Evidence |
| --- | --- |
| `verify` loaded before the first proof gate | loaded before the core's proofs, and again after each compaction |
| Proofs of steps 1.1 to 1.5 through `proof.mjs` | done for 1.1, 1.2, 1.4 and 1.5: the final rerun on the skill repository's `a727b2a` gave 72 of 72 expected exits, and step 1.1's checks passed; 1.3 waits for its budgets |
| `pstack:thermos` per slice | skip: your request owes one panel round on the build's diff |
| oxlint before the panel | skip: the skill repository is outside Plate's lint setup; its type check runs in `next build` and `tsc` |
| Hand check of the desk in the built-in browser | partial: items 1 to 7 passed on `80c26e3`; the link to a pending desk file was not shown, and the budgets wait for a visible pane |
| Plate's hand drive, playtest, `plate-docs`, changeset, `best-api`, `blast-radius` | skip: no Plate page, package, docs page or public API changes |
| `benchmark` rerun | skip: the budgets measure the desk, not Plate or Plite; `pstack:benchmark-checklist` runs before any budget number is reported |
| `deslop`, then `no-comments` | done on the build, on the panel's fixes and on `a727b2a` |
| One panel round on the build's diff | done: astra, opus and sol raised 12 critical findings; 10 applied, C11 applied in part, and C6 and C11's other part dismissed with planted probes; the warnings applied or deferred |
| Proofs of steps 2.1 to 2.4 through `proof.mjs` | done on the skill repository's `2057e7b`: 54 of 54 node tests and both type checks pass, and five planted defects each failed their test |
| Hand check of phase 2 in the built-in browser | done: the 11 open questions, Chips, the drawer's counts on five plans, notes on a scratch record and the row badges; it found the panel badge bug, which is fixed and checked again |
| Review of the sign-in cut and phase 2 | skip: fast, so no panel and no `no-comments`; `deslop` ran on phase 2; step 2.6 waits for your "full" |
| `land.mjs` for the Plate side | the commit that carries this table |

## Open work

- Your trial in step 1.7. Owner: you. Stop: none, since phase 2 is built.
- The review of `7d5f879`, `2057e7b` and `ece9c3e` in step 2.6, all shipped fast. Owner: you, with "full". Stop: before "push dotai".
- The page budgets in step 1.3. The browser pane stayed hidden and drew 1 to 3 frames a second, and a reading needs at least 30. Owner: lead, once you show the pane with Cmd+Shift+B. Stop: before your trial.
- Whether to retire `review.mjs` or point it at the desk's record. Owner: you, through a chip. Stop: after phase 2.
- A `Review:` trailer from `land.mjs` and a commit in each proof log, so fast and proof stop showing as unknown. Owner: chip t_5f6ea908. Stop: none.
- The diff panel's deferred warnings. Each key replays the whole log, so its cost grows with the log, and this waits until the budgets are read. The record doesn't store its trunk, so a clone whose `origin/HEAD` names another branch opens the same record on that trunk. A reader opened while the scans run keeps its first file classes. After a dev server restarts, the page stops reconnecting. Opus's nits n1 to n16 and n18 wait too. Owner: lead. Stop: before your trial.
- Limits: kept bytes for reviewed images and artifacts over 1 MB, exclusion reasons, a rename across categories, a raised timeout, folded assertions or rewritten expected values not counting as weakening, an assertion gated through a helper the file imports, a weakened test beside a code change accepted unread from its badge, the API signal trusting that the manifest was regenerated, the trial counting time, not problems caught, a browser that may not bring an open desk tab to the front, budgets read once by hand rather than as a 95th percentile, no scripted browser test to catch a page regression, a program that is not a desk holding a record's port, which blocks that record until you pass another `--state`, two records hashing to one port, one chance in 2,000, each load reading the whole first-parent log while a recorded commit lies outside the horizon, a local program that forges the browser's headers, the drawer showing a plan's diff since its landing rather than both versions side by side, a proof log tied to a landing only through its plan, Decisions holding 889 unseen picks, notes and seen marks driven by hand only on a scratch record, no scripted test of the drawer, Decisions or Chips, a summary accept of a desk file landing, which leaves its version waiting, shown in the header, until a files accept, and that header link, which tests check but the hand check could not show because both desks ran with a local desk file. Owner: lead. Stop: none.

## Close

- Phase 2's changes from the plan first. On your "go directly phase 2. fast mode", phase 2 built here before your trial, with no panel, and the sign-in cut before it shipped the same way. The drawer shows a plan as it is now with its diff since the landing, not both versions side by side. Step 2.2's proof ran in the tests' scratch repository, not a clone of plate-2.
- Phase 2 landed. The skill repository's `2057e7b` adds the context drawer, Decisions, Chips, notes, and the panel and proof badges on rows. Nothing pushes it until you say "push dotai". Plate's commit updates this plan.
- Phase 2 proof. On `2057e7b`, 54 of 54 node tests and both type checks pass, and five planted defects each failed their test. By hand, Decisions listed the same 11 open questions as a hand list, the drawer matched a shell count on five plans, and a concern note and its resolve worked on a scratch record. That check found no row showing a panel badge, because the board looked for a phase pstack never writes. After the fix, 31 landings show one. Then your desk stuck on "Loading…". Opening the scratch record rebuilt the shared app, and your record's server kept serving the new page with its old code, so the browser blocked the page's script. `ece9c3e` restarts a server whose code differs from the installed app, and a replay of that case loads cleanly.
- Phase 2 limits. Decisions puts 889 unseen picks from 185 plans after the questions, and the Picks in Decisions row's word narrows them. No panel or other reviewer has read phase 2. Open work's Limits list the rest.
- Phase 2 counts. Since phase 1's close you sent 9 messages, and each was done or answered.
- Phase 1's changes from the plan. The panel's B finding changed `B` to accept the cursor's session instead of the reader's. The first run of step 1.1's checks matched too widely and exited 1, and the rerun with the exact paths passed. A log row said hand-check items 1 to 8 passed, but item 8 was not shown, and a later row corrects it.
- Landed. Plate's commit adds `.agents/review-desk.json`, this plan, its decision log and the review-desk subject file. The desk is the skill repository in this run's folder at `a727b2a`, and nothing pushes it until you say "push dotai".
- Proof. The final rerun on `a727b2a` ran the node tests, both type checks, the install with `next build`, doctor, the stats and trial report commands, the desk file diff and 63 planted defects, and all 72 runs gave their expected exit. Step 1.1's checks found the server listening only on `127.0.0.1`, the import before the fork, and no commit holding the left-out font or images. The hand check passed items 1 to 7 on `80c26e3`, each with a screenshot.
- Limits. The page budgets are unread. The label fix and the claims refactor in `a727b2a` were not driven by hand, and the final rerun covers the refactor. Open work's Limits list the rest.
- Counts. You sent 10 messages, and each was done or answered. Two items wait on you, the trial and "push dotai".
- Reflect. One Opus reviewer read the session through its tooling, judgment and divergent lenses and returned 28 findings. I applied none, because none fixed a helper that refuses a case its rule allows or reworded a rule without adding words.
  - Offered as suggested tasks, 18 findings in 10 tasks: t_f50ec41f, run-directory writes from a worktree; t_ed4a1b9a, browser and home-folder limits in delegate briefs; t_74a7cbe5, a panel seat on the premise; t_6817f303, a blind cross-judge; t_4ac98c77, page-stop republishing within a stage; t_0a64e979, four tool quirks; t_05803eea, a fresh session for the build; t_50cabf93, plan counts pinned to a commit; t_713c8f90, planted defects failing on their assertion; t_e334cf80, where to build code for a repository that waits for a push word.
  - Rejected, 10 findings. A direct question answered late, a blocker raised late and a narrowed claim left open are each already covered by a rule this run broke or followed: the Todo list rule, the Blocked rule and the Long runs rule. A dependent call batched with a Write is covered by the runtime's own rule that dependent calls wait. The panel row format is already enforced by decisions-check's message. Lighter proof for internal tools, twice, reads one owner call as a rule, and "fast" is the project's word for that. The pnpm workspace install arises only from building inside the run folder, which t_e334cf80 asks about. Reading a pasted Codex session's source would have changed nothing the run used.
