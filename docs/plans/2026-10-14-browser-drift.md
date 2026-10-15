---
verdict: pursue
work_kind: workflow
review_commit: 2591fb926aa5ac5ac66169c868f7fe46735499d0
---

# Browser drift: keep the built-in browser, fix how agents type in it

Status: executed: waiting on your commit
Topic: correct
Playbook: build

**Pursue.** The owner asked: "find a solution for both - should we have a skill/guide to test with built-in browser, or should we optimize for chrome, or both, whats best for our pstack workflow and no drift from reality / agent testing like a human - because playwright already does the non human part." The two browsers already agree on every editing key the probe sent. The drift comes from how two tool actions send keys, from a missing clipboard and from one rendering gap, and plate-2's rules name none of them. Chrome would not fix that. Its agent tab ran no animation frames at all, while the built-in pane ran about two a second. So the built-in browser stays the default. There is no new skill. Verify's Drive section already says how a drive types, and it gets the typing, frame and clipboard rules. Hand drive and editor proof get two corrections. This retains the browser pick of `docs/plans/2026-10-13-verify-hand-drive.md` and reopens only its input contract and one false sentence.

## Brief

### What will change?

Agents now press one key at a time in the built-in browser, so autoformat and shortcuts fire as they do for you. They check the page isn't paused before trusting motion. Three rule files changed, uncommitted.

### What could go wrong?

The rules only tell agents. Nothing forces the new typing. Nobody measured the pane while you watch it, or Codex's browser. The proof is one probe and one replay, not a test on fresh agents.

## Teach

An agent tests a change the way you would. It opens the page in a browser and uses it. plate-2's rules use the Claude app's built-in browser by default, and your Chrome only for checks about Chrome itself. Playwright specs stay the repeatable proof.

The probe sent the same keys through both browsers on the basic editor. Backspace, Enter, arrows, undo, bold and select-all behaved the same. Three tool actions differ from a real keyboard. The built-in browser's type action drops the whole string in at once, so typing "# hi" never becomes a heading. Both browsers get Shift combos wrong. The built-in browser has no clipboard. Separately, while nobody watches, the built-in pane slows to about two screen updates a second, and Chrome's agent tab stops updating.

So verify's Drive section now says to type one key at a time, send shifted characters as themselves, and check the page is updating before trusting anything that moves.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Which browser drives by default | The built-in browser, which matched Chrome on every editing key and does not touch your Chrome profile | Your Chrome for every editor drive | chrome first | big |
| A separate guide for the built-in browser | None. The typing and screen-update rules go in the one place that already says how agents type | A new skill for the built-in browser | browser skill | small |
| Catching the old way of typing | A written rule now, and an automatic warning only if an agent repeats the mistake (look) | Add the automatic warning now | hook | small |
| Where the browser facts live | plate-2's verify rule now, and a suggested task to move them into the shared pstack rules for every project | Shared rules first | shared first | small |
| The subject page | A new page at https://claude.ai/artifact/BNu77HJFf4WXN5QYDyxjTk, because the old page at https://claude.ai/artifact/GSsqXUH1w866HTfjZfraUv no longer opens | Drop the new page and keep the subject without one | drop the new page | detail |
| Proof before the text lands | I redo the new steps myself in the built-in browser, with no test on fresh agents, because the change only fixes facts in a step agents already follow (look) | Test it on fresh agents first | run trial | detail |

## Public API

No package API changes. `verify`'s Drive section owns how every drive types and when its frames can be trusted. `references/hand-drive.md` and `references/editor-proof.md` point to it, and `references/regression-oracles.md` keeps exact Chrome for Blink, compositor and paint claims.

## Main changes

- `verify`'s Drive section names the key-by-key operation for each runtime's browser and when typing must use it. In Claude Code's built-in browser that is `key` with one token per character, such as `# space h i`, because its `type` inserts the whole string as one `insertText`. It says to send a shifted character as itself. It adds a one-second `requestAnimationFrame` count before a frame-driven claim, and sends native clipboard input to Claude in Chrome or the `'native'` clipboard spec.
- `references/hand-drive.md` drops the claim that the built-in browser keeps no sign-ins, and its loop types as verify's Drive section says.
- `references/editor-proof.md` marks its in-app Browser list as Codex's, whose browser has Playwright locators.

## Steps

- [x] 1. Rewrite the key-by-key paragraph of `.agents/rules/verify.mdc`'s Drive section and add the frame and clipboard paragraph. Proof: `pnpm run prepare` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` pass, and `.agents/skills/verify/SKILL.md` holds the new paragraphs.
  `docs/plans/artifacts/2026-10-14-browser-drift/prepare-a2.log`, `docs/plans/artifacts/2026-10-14-browser-drift/sync-check-a2.log` and `docs/plans/artifacts/2026-10-14-browser-drift/generated-text-a2.log`, run after the writing pass.
- [x] 2. In `.agents/rules/verify/references/hand-drive.md`, replace the Browser paragraph's sign-in claim and point loop step 4's typing at verify's Drive section. Proof: the same two commands pass, and `git grep -n 'saved sign-ins' -- .agents` finds nothing.
  The same logs; `docs/plans/artifacts/2026-10-14-browser-drift/base-signins-a1.log` finds the claim before the edit, and `docs/plans/artifacts/2026-10-14-browser-drift/generated-text-a2.log` finds it gone.
- [x] 3. Mark `.agents/rules/verify/references/editor-proof.md`'s in-app Browser list as Codex's. Proof: the same two commands pass.
  The same logs.
- [x] 4. Replay in the built-in browser, on the basic editor, each operation the new Drive text prescribes: key-by-key `# space h i`, a literal `*`, and the one-second frame count. Proof: a replay file in the run directory whose results match `docs/plans/artifacts/2026-10-14-browser-drift/probe.md`.
  `docs/plans/artifacts/2026-10-14-browser-drift/replay.md`: the heading formed, `*` inserted, and the hidden pane ran 1 frame a second.

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- An agent's drive must reach the editor through the same input path a person's keyboard uses for the behavior under test: per-key events for autoformat, hotkeys and trigger menus, `beforeinput` for native editing.
- The agent's browser must predict real Chrome for every claim the drive makes, or the claim moves to a proof owner that does: exact Chrome for Blink, compositor and paint claims (`regression-oracles.md`), Playwright specs for replayable behavior.
- The drive stays human-like and looks at the page; Playwright already owns the scripted, asserted part (the owner's words above).
- A repository skill holds only Plate- or Plite-specific method, and no skill exists only to rename another owner (`.agents/playbooks/references/workflow-change.md`).
- Codex keeps driving its own browser; the rules cannot assume Claude-only tools.

### Measured

Every row below comes from `docs/plans/artifacts/2026-10-14-browser-drift/probe.md`, run 2026-10-14 on `/blocks/editor-basic` served by the `plate-2-pr5165` checkout on :3527.

| Input | Built-in browser (Chromium 152.0.7977.130) | Claude in Chrome (Chrome 154) |
| --- | --- | --- |
| `type` of a string | one `beforeinput insertText` for the whole string, no key events; `# hi` stays literal | one keydown, `beforeinput` and keyup per character; `# hi` becomes an H1 |
| `key` with one token per character | per-key events; `# space h i` becomes a heading | per-key events |
| Backspace, Enter in a plain contenteditable | `beforeinput deleteContentBackward`, `insertParagraph` | the same |
| Backspace, Enter, Cmd+Z, Cmd+A in the Plate editor | keydown prevented by the editor, state changes | the same |
| Cmd+B | toggles bold | the same |
| Arrows, Shift+Arrows | native caret and selection moves | the same |
| `shift+8`, `shift+a` | nothing inserted | `8` and lowercase `a` inserted |
| Literal `*`, `A`, punctuation as `key` tokens | each inserts itself | not probed; `type` inserts them |
| Cmd+C, Cmd+V | no `copy` or `paste` event, nothing pasted | `copy`, `paste`, `insertFromPaste`, pasted |
| Focus | script focus takes keys | takes keys after one real click; the earlier run found script focus alone took none |
| Frames while nobody looks | 1 to 2 `requestAnimationFrame` callbacks a second, 0 IntersectionObserver callbacks in 600 ms, `visibilityState` `visible` while `tabs_context` said the pane was hidden | 0 frames, 0 IntersectionObserver callbacks, `visibilityState` `hidden` |

The earlier run's claim that neither browser fires `beforeinput` for Backspace or Enter was wrong. In a plain contenteditable both fire it. Plate's editor prevents both keys at keydown, so a real keyboard shows no `beforeinput` there either. Playwright 1.61 launches Chromium with background throttling switched off and carries the macOS editing commands, read in `playwright-core`'s source and not run.

### Lanes

- **Keep the rules as they are.** Fails the first requirement. The Drive rule names only Codex's `pressSequentially`, so a Claude agent reaches for `type`, which bulk-inserts. The frame gap and the clipboard gap are unwritten, and hand-drive says the built-in browser keeps no sign-ins, which its own vendor skill contradicts.
- **A new skill or guide for the built-in browser.** Fails the skill law: the facts are a few sentences about a tool every project uses, and verify's Drive section already owns how a drive types. A second owner would drift from it.
- **Chrome first for editor drives.** Its `type` is per-key and its clipboard works. But its agent tab drew no frames and ran no IntersectionObserver callbacks, worse than the built-in pane. It also needs a real click before it takes keys, brings the owner's extensions and sign-ins into the editor, and Codex cannot use it. It is worse as the default.
- **Both, split by claim (picked).** The built-in browser stays the default for every drive. Verify's Drive section owns one input contract with each runtime's key-by-key operation, literal shifted characters, a frame count before frame-driven claims, and Chrome or the native clipboard spec for clipboard input. Exact Chrome keeps Blink and paint claims.
- **Strongest deletion: drop interaction from the hand drive and let Playwright own all input.** Fails the owner's requirement that the agent tests like a person, and the 2026-10-13 plan's finding that specs check only what they assert.
- **Real OS keystrokes into a visible browser.** The most faithful input, but the computer-use tools grant browsers read-only access per their own instructions. This is inferred, not tried.

### Dependents

- None in the review ledger: browser drives are workflow, not a ledger scope. `node tooling/scripts/review-ledger.mjs lookup browser` returns no browser scope.
- Every session that loads `verify` reads the changed Drive section, and every hand drive reads `references/hand-drive.md`.

### Earlier work

- `docs/plans/2026-10-13-verify-hand-drive.md` picked the built-in browser with "chrome first" as the reversing word. This review retains that pick on new evidence and reopens its Browser paragraph's sign-in claim and the input contract it left to the Drive section.
- `docs/plans/2026-10-14-hand-drive-freshness.md` and `docs/plans/2026-10-14-hand-drive-stamp.md` changed how `check` judges a visit, which this plan does not touch.

## Completion Gates

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Writing passes | yes | One `unslop` pass over the changed rule text and this plan | `unslop` on the plan and on the rule text, `pstack:bro` on the page's brief, Teach and Defaults; the `writing` rows in the decision log |
| Hand drive | no | The changed files are agent rules, which `hand-drive.mjs scope` maps to no page | skip: `hand-drive.mjs scope` on the three rule files printed no cell |
| Last lint fix | no | No changed file is code | skip: the change holds only Markdown and `.mdc` rule files |

## Close

Landed, uncommitted on `next`: the Drive section of `.agents/rules/verify.mdc`, the Browser paragraph and loop step 4 of `.agents/rules/verify/references/hand-drive.md`, one line of `.agents/rules/verify/references/editor-proof.md`, and their regenerated copies under `.agents/skills/verify/`. The `correct` subject's page moved to https://claude.ai/artifact/BNu77HJFf4WXN5QYDyxjTk because the old link no longer opens.

Deviation: the verdict's first publish showed a before and after pair of the agent's typing call under Public API. At the fold it became the ownership flow and a Main changes sentence, because the `correct` subject has no Public API section and that call is an agent tool call, not a package API.

Correction: the earlier pasted run said neither browser fires `beforeinput` for Backspace or Enter. The probe's plain contenteditable shows both browsers fire it, and Plate's editor prevents both keys at keydown.

Proof, from the log rows' scopes:

- Both browsers, every key and frame claim the new text makes: `docs/plans/artifacts/2026-10-14-browser-drift/probe.md`, on `/blocks/editor-basic` from the `plate-2-pr5165` checkout, read 2026-10-14.
- The operations the new text prescribes, replayed on a fresh load: `docs/plans/artifacts/2026-10-14-browser-drift/replay.md`.
- The rule text and its copies: `prepare-a2.log`, `sync-check-a2.log` and `generated-text-a2.log` in the run directory, run after the writing pass; `base-signins-a1.log` holds the removed claim at base.

Limits: nobody measured the built-in pane's frame rate while it is shown, or Codex's browser. Claude in Chrome taking no keys from script focus comes from the earlier run, not this probe. Claude in Chrome's literal `key` tokens were not probed. No fresh-agent trial ran, per the `run trial` Defaults row. The "no extensions" sentence in hand-drive is carried over, not probed.

Gates: no panel ran, because no reviews row names this change and the design was not contested. No decision-trail review ran, because the run was attended, in one session, and changed no shared script or check. No reflect ran, because the owner corrected no workflow step.

Open work: none in this plan. The suggested task that moves the generic browser facts into the shared pstack rules waits for the open task "Push PR repairs to a fork's own remote", which writes the same shared folder.
