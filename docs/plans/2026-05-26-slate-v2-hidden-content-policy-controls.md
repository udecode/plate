# slate v2 hidden content policy controls

Objective:
Implement hidden-content example controls in `.tmp/slate-v2` for selecting DOM
coverage policies, complete only when `/examples/hidden-content-blocks` exposes
policy controls that cover selectionPolicy and adjacent hidden-content policies,
Playwright proves the controlled policies across Accordion/Collapsible/Tabs
including ArrowRight-at-tab-edge behavior, targeted Slate React/site typechecks
and lint pass, and `node .agents/rules/autogoal/scripts/check-complete.mjs
docs/plans/2026-05-26-slate-v2-hidden-content-policy-controls.md` passes.
Preserve the current default safe behavior: editor ArrowRight at a visible tab
edge must not switch tabs unless the example control explicitly opts into
materialization.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-05-26-slate-v2-hidden-content-policy-controls.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user prompt
- id / link: chat
- title: Add hidden-content policy controls for coverage testing
- acceptance criteria: `/examples/hidden-content-blocks` exposes controls for
  selectionPolicy and adjacent hidden-content policies; tests cover safe default
  tab-edge ArrowRight and explicit materialize opt-in.

Completion threshold:
- Example controls cover `selectionPolicy`, `copyPolicy`, and `findPolicy` with
  safe defaults.
- Playwright proves policy control behavior across shadcn Accordion,
  Collapsible, and Tabs, including that ArrowRight at the Overview tab edge
  does not switch tabs under the default policy and does switch/materialize only
  when the control is set to `materialize`.
- Targeted package/site checks pass in `.tmp/slate-v2`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs
  docs/plans/2026-05-26-slate-v2-hidden-content-policy-controls.md` passes.

Verification surface:
- `.tmp/slate-v2`: focused Playwright route test for
  `hidden-content-blocks`.
- `.tmp/slate-v2/packages/slate-react`: focused
  `keyboard-input-strategy-contract.test.ts`.
- `.tmp/slate-v2`: `bun --filter slate-react typecheck`,
  `bun typecheck:site`, and `bun lint`.
- In-app Browser route proof at `http://localhost:3100/examples/hidden-content-blocks`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Preserve safe default: tab-edge ArrowRight does not switch tabs with
  `selectionPolicy=boundary`.
- Do not create PRs, comments, commits, or pushes.

Boundaries:
- Source of truth: latest user prompt plus live `.tmp/slate-v2` route behavior.
- Allowed edit scope: `.tmp/slate-v2/site/examples/ts/hidden-content-blocks.tsx`,
  focused Playwright tests, and this goal plan.
- Browser surface: `http://localhost:3100/examples/hidden-content-blocks`.
- Tracker sync: N/A: no tracker item.
- Non-goals: raw Slate UI kit exports, broad DOM coverage API redesign, PR.

Blocked condition:
- Block only if the route cannot run locally or a required external/user
  decision prevents choosing safe default control values after three attempts.

Task state:
- task_type: browser-visible example/test coverage
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_complete

Current verdict:
- verdict: implemented
- confidence: high
- next owner: final response
- reason: route controls, tests, Browser proof, typecheck, lint, and scoped
  review are complete

Completion rule:
- `update_goal(status: complete)` is legal only after this plan passes the
  autogoal checker.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `task` + `autogoal`; Browser applies for route proof |
| Active goal checked or created | yes | `get_goal` returned no active goal; created goal for this plan |
| Source of truth read before edits | yes | latest user prompt and live hidden-content route files |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: narrow example/test change |
| TDD decision before behavior change or bug fix | yes | extended focused Playwright coverage around policy behavior |
| Branch decision for code-changing task | no | N/A: user did not ask for branch/PR; no proactive git hygiene |
| Release artifact decision | yes | no new package behavior in this slice; existing prior package changeset remains separate |
| Browser tool decision for browser surface | yes | in-app Browser plus Playwright regression |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker |
| Browser pack selected | yes | browser pack applied |
| Browser route / app surface identified | yes | `/examples/hidden-content-blocks` |
| Browser tool decision recorded | yes | in-app Browser requested by user context; Playwright for regression |
| Console/network caveat policy recorded | yes | Playwright pageerror row and Browser console error log checked |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason: controls belong in the example surface, not raw
      Slate UI kit APIs.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: concise implementation and verification
      summary.
- [x] Branch handling recorded for code-changing work: N/A: no branch/PR
      requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: rerun cleared transient site typecheck output; no reinstall signal.
- [x] Workspace authority recorded: every proof command names `.tmp/slate-v2`
      or `.tmp/slate-v2/packages/slate-react`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes: Browser
      behavior changed only in the example controls; safe default remains
      clamped, and materialization is explicit through the control.
- [x] Review/autoreview target selected from actual diff state: local checkout,
      then scoped review prompt for the hidden-content control slice.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling:
      N/A: not touched.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named checks | all commands below passed |
| Bug reproduced before fix | no | N/A | task is coverage/control feature; prior ArrowRight repro already proven in Browser |
| Targeted behavior verification | yes | Run focused test/proof | Playwright `hidden-content-blocks`, 3 passed; Browser proof recorded |
| TypeScript or typed config changed | yes | Run relevant typecheck | `.tmp/slate-v2`: `bun typecheck:site` passed; `bun --filter slate-react typecheck` passed |
| Package exports or file layout changed | no | N/A | no package exports or barrels changed |
| Package manifests, lockfile, or install graph changed | no | N/A | this slice did not change manifests/lockfile |
| Agent rules or skills changed | no | N/A | no agent rules/skills changed |
| Workspace authority proof | yes | Run checks in owning workspace | checks ran in `.tmp/slate-v2` and package subdir |
| Browser surface changed | yes | Capture Browser proof | Browser showed default boundary keeps Overview active; materialize activates Details |
| Browser final proof | yes | Record exact browser verification caveat | no screenshot requested; exact Browser state and empty error logs recorded |
| CI-controlled template output changed | no | N/A | no templates touched |
| Package behavior or public API changed | no | N/A | example controls only in this slice |
| Registry-only component work changed | no | N/A | no registry-only Plate component work |
| Docs or content changed | yes | Verify source-backed claims | this plan updated; no user docs changed |
| High-risk mini gate | yes | Record failure mode and proof plan | failure mode: policy controls accidentally make tab-edge ArrowRight switch by default; proof: Playwright + Browser |
| Agent-native review for agent/tooling changes | no | N/A | no agent/tooling files changed |
| Local install corruption suspected | no | N/A | transient typecheck output passed on rerun; no install corruption signature |
| Autoreview for non-trivial implementation changes | yes | Run helper and close accepted findings | Codex helper hung twice; Claude fallback whole-diff findings were verified/rejected as unrelated or already satisfied; scoped Claude run exited clean |
| PR create or update | no | N/A | no PR requested |
| PR proof image hosting | no | N/A | no PR |
| Tracker sync-back | no | N/A | no tracker |
| Final handoff contract | yes | Fill final handoff fields | filled below |
| Final lint | yes | Run lint | `.tmp/slate-v2`: `bun lint` passed |
| Goal plan complete | yes | Run autogoal checker | to run after this plan write |
| Browser interaction proof | yes | Exercise target route | in-app Browser proof passed |
| Browser console/network check | yes | Record console/network state | Browser `tab.dev.logs({ levels: ['error'] })` returned `[]`; Playwright pageerror row empty |
| Browser final proof artifact | yes | Record exact proof | exact Browser JSON state recorded in Timeline |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan, prompt, live files read | implementation |
| Implementation | complete | policy controls and tests added | verification |
| Verification | complete | tests/type/lint/Browser/review done | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | autogoal checker gate reached; final response next | final response |

Findings:
- The correct control surface is the example route: `selectionPolicy`,
  `copyPolicy`, and `findPolicy` are DOM coverage boundary props, not product
  block APIs.
- Safe default stays `selectionPolicy=boundary`; `materialize` is explicit.
- The Browser tool uses default `data-testid`, while this site uses
  `data-test-id`, so Browser proof used explicit selectors.

Decisions and tradeoffs:
- Use shadcn `Button` segments instead of adding Select; this keeps controls
  dense, visible, and dependency-neutral because shadcn button already exists.
- Apply policies globally across Accordion, Collapsible, and Tabs to maximize
  route coverage without turning the example into a per-node configuration UI.
- Keep `copyPolicy=include-model` and `findPolicy=not-native-until-mounted` as
  defaults because those match the hidden-model demo intent.

Implementation notes:
- `site/examples/ts/hidden-content-blocks.tsx` adds policy controls and badge
  outputs for selection, copy, and find policies.
- The boundary props now read from context for Accordion, Collapsible, and Tabs.
- `playwright/integration/examples/hidden-content-blocks.test.ts` covers copy
  policy exclude/materialize and selection policy boundary/model-backed/materialize.

Review fixes:
- Whole-local Claude autoreview raised no in-scope current-slice defect; verified
  shadcn deps are devDependencies and `site/tsconfig.json` maps `@/*` to `./*`.
- Scoped Claude autoreview for the hidden-content policy controls slice exited
  clean with no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Codex autoreview helper hung before output | 2 | kill stale helper and retry fallback engine | resolved by scoped Claude helper run |
| Browser `getByTestId` used default `data-testid` not site `data-test-id` | 1 | use explicit `[data-test-id=...]` locator | Browser proof passed |
| Initial `typecheck:site` reported stale Slate React errors | 1 | format touched file and rerun exact checks | rerun passed |

Verification evidence:
- `.tmp/slate-v2/packages/slate-react`: `bun test:vitest -- keyboard-input-strategy-contract.test.ts` passed, 10 tests.
- `.tmp/slate-v2`: `bun typecheck:site` passed.
- `.tmp/slate-v2`: `bun --filter slate-react typecheck` passed.
- `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium` passed, 3 tests.
- `.tmp/slate-v2`: `bun lint` passed.
- `.tmp/slate-v2`: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --engine claude --no-tools --no-web-search --prompt "<hidden-content policy controls slice>"` exited clean with no accepted/actionable findings.
- Browser proof at `http://localhost:3100/examples/hidden-content-blocks`:
  default `selection=boundary`, `copy=include-model`, `find=not-native-until-mounted`;
  40 ArrowRight presses kept Overview active and Details hidden; after switching
  Selection to `materialize`, 40 ArrowRight presses activated Details and hid
  Overview; console error logs were `[]`.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: prior Browser repro showed ArrowRight could switch tabs under
    materialize behavior.
  - Verified: safe default and explicit materialize opt-in covered by Browser
    and Playwright.
- Browser check: passed with empty error logs.
- Outcome: hidden-content route has controls for `selectionPolicy`,
  `copyPolicy`, and `findPolicy`.
- Caveat: Codex autoreview helper hung twice; scoped fallback review was clean.
- Design:
  - Chosen boundary: example-level shadcn Button controls over existing boundary
    props.
  - Why not quick patch: hard-coded props would not give coverage control.
  - Why not broader change: raw Slate should not ship Accordion/Tabs policy UI.
- Verified: tests/type/lint/Browser/review evidence above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: exact state recorded above.
- Caveats: Codex autoreview helper hang; fallback scoped review clean.

Timeline:
- 2026-05-26T17:37:14.646Z Task goal plan created.
- 2026-05-26 Added policy controls and route tests.
- 2026-05-26 Focused unit, site typecheck, package typecheck, Playwright, lint,
  Browser proof, and scoped review completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final response |
| Where am I going? | Close the goal and report the result |
| What is the goal? | Add hidden-content policy controls with coverage proof |
| What have I learned? | Safe default must remain `boundary`; `materialize` is valuable as an explicit test control |
| What have I done? | Added controls, tests, Browser proof, and verification |

Open risks:
- None for this execution lane.
