# docs sidebar accordion

Objective:
Implement the Plate docs sidebar accordion in `apps/www`: top-level doc
sections and nested nav branches collapse/expand, active branches stay open,
multiple branches can remain open, installation children stay visible when that
branch is open, and no sidebar filter is added.

Goal plan:
docs/plans/2026-05-28-docs-sidebar-accordion.md

Task source:
- User asked to proceed after approving an accordion-style Plate docs sidebar,
  preserving nested installation items and removing the old filter direction.

Completion threshold:
- `apps/www/src/components/docs-nav.tsx` owns the accordion behavior.
- `/docs` renders with compact open starter sections and collapsed later
  sections.
- Collapsing and reopening Installation hides/shows its child pages.
- Expanding Plugins works without closing Installation.
- `/docs/installation/next` keeps Installation open and marks `Next.js` current.
- `pnpm --filter www typecheck` passes.
- Browser proof is captured against `http://localhost:3002`.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-28-docs-sidebar-accordion.md` passes.

Verification surface:
- Source: `apps/www/src/components/docs-nav.tsx`.
- Typecheck: `pnpm --filter www typecheck`.
- Browser: Codex in-app browser at `/docs` and `/docs/installation/next`.
- Dev server: existing `pnpm dev` session on `http://localhost:3002`.

Constraints:
- Do not run `build:registry`.
- Keep edits scoped to the docs nav source and the goal plan.
- Preserve the global search UI; do not add a sidebar filter.
- Preserve parent links for branch items that have hrefs.

Boundaries:
- Source of truth: user decision in this thread plus current docs nav/sidebar
  component patterns.
- Allowed edit scope: docs nav source, goal plan.
- Browser surface: desktop docs sidebar on `localhost:3002`.
- Tracker sync: N/A, no external issue.
- Non-goals: registry sync, `/create`, theme work, mobile sidebar redesign,
  strict single-open accordion.

Output budget strategy:
- Read only the docs nav, sidebar primitives, package scripts, and plan/checker
  files. One accidental broad `rg` hit generated font/json output; recovery was
  to stop broad output and use browser/source checks.

Blocked condition:
- Work would block only if the local dev server could not render `/docs` or the
  approved browser tool could not connect. Neither happened.

Task state:
- task_type: implementation
- task_complexity: small
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implemented
- confidence: high
- next owner: user
- reason: source, typecheck, and browser behavior match the requested sidebar.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal`, `task`, `frontend-design`, and Browser for browser proof. |
| Active goal checked or created | yes | Active goal and this plan created for the sidebar task. |
| Source of truth read before edits | yes | Read `apps/www/src/components/docs-nav.tsx` and sidebar/collapsible primitives. |
| Tracker comments and attachments read | no | No external tracker for this request. |
| Video transcript evidence required | no | No video or recording was provided. |
| `docs/solutions` checked for non-trivial existing-code work | no | Small local UI behavior change with source patterns in the component. |
| TDD decision before behavior change or bug fix | yes | Browser interaction proof is the right coverage; no unit seam exists for this nav state. |
| Branch decision for code-changing task | no | User did not ask for git branch or PR work in this turn. |
| Release artifact decision | yes | N/A: docs app UI source only; no package release artifact. |
| Browser tool decision for browser surface | yes | Used the Codex in-app Browser skill and current `localhost:3002` tab. |
| PR expectation decision | yes | N/A: user asked to implement locally, not PR. |
| Tracker sync expectation decision | yes | N/A: no issue or Linear target. |
| Output budget strategy recorded | yes | Recorded above, including accidental broad output recovery. |
| Browser pack selected | yes | Browser proof required for visible sidebar behavior. |
| Browser route / app surface identified | yes | `/docs` and `/docs/installation/next` on `http://localhost:3002`. |
| Browser tool decision recorded | yes | Browser plugin via Node REPL runtime. |
| Console/network caveat policy recorded | yes | Dev server terminal checked; no runtime errors shown for verified routes. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, title, acceptance criteria,
      caveats, likely files/routes/packages, browser surface, and root-cause
      layer.
- [x] Required video or screen-recording evidence is N/A: no media source.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the docs nav ownership boundary.
- [x] Release artifact requirement recorded: N/A docs app UI source only.
- [x] Final handoff shape decided: local implementation summary with typecheck,
      browser proof, and lint caveat.
- [x] Branch handling recorded: N/A, no git operation requested.
- [x] Local-env-rot retry policy recorded: N/A, typecheck/browser did not show
      install corruption.
- [x] Workspace authority recorded: verification commands ran from
      `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded: browser behavior changed; proof plan used actual
      docs routes.
- [x] Review/autoreview target selected: N/A, small single-file UI change with
      direct browser proof.
- [x] Agent-native review decision recorded: N/A, no agent files changed.
- [x] Output budget discipline recorded and followed after the broad-output
      recovery.
- [x] Browser pack route, interaction path, and expected visible outcome
      recorded.
- [x] Browser pack used the repo-approved browser tool.
- [x] Browser pack console/network caveat recorded through dev server terminal.
- [x] Browser pack screenshot and exact verification details are ready for
      handoff.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Source changed, typecheck passed, browser behavior verified. |
| Bug reproduced before fix | no | Feature refinement, not a bug repro. |
| Targeted behavior verification | yes | Browser checked collapse/reopen Installation, independent Plugins expansion, active `/docs/installation/next`. |
| TypeScript or typed config changed | yes | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | no | No package exports or file moves. |
| Package manifests, lockfile, or install graph changed | no | No manifest or lockfile edits. |
| Agent rules or skills changed | no | No agent rule or skill edits. |
| Workspace authority proof | yes | Commands ran in `/Users/zbeyens/git/plate`; app proof against `apps/www`. |
| Browser surface changed | yes | Codex in-app browser proof captured on `localhost:3002`. |
| Browser final proof | yes | Screenshot captured and browser checks recorded below. |
| CI-controlled template output changed | no | No generated template output edited. |
| Package behavior or public API changed | no | Docs app UI only; no changeset. |
| Registry-only component work changed | no | Registry not touched. |
| Docs or content changed | no | Plan file only; no user docs/content pages changed. |
| High-risk mini gate | yes | Failure mode was hidden active child or unusable nested nav; browser proof covers both. |
| Agent-native review for agent/tooling changes | no | No agent/tooling files changed. |
| Local install corruption suspected | no | No corruption-shaped failure after typecheck/browser. |
| Autoreview for non-trivial implementation changes | no | Small local UI change verified directly. |
| PR create or update | no | No PR requested. |
| Task-style PR body verified | no | No PR body. |
| PR proof image hosting | no | No PR. |
| Tracker sync-back | no | No tracker. |
| Final handoff contract | yes | Final response will list change, typecheck, browser proof, and lint caveat. |
| Final lint | yes | `pnpm --filter www exec eslint src/components/docs-nav.tsx --fix` passed; package-wide `lint:fix` still fails on existing TS parser setup. |
| Output budget discipline | yes | Broad generated-output mistake recorded; no further broad output streamed. |
| Goal plan complete | yes | This plan is ready for `check-complete`. |
| Browser interaction proof | yes | Browser exercised `/docs` and `/docs/installation/next`. |
| Browser console/network check | yes | Dev server terminal showed successful 200 responses and no runtime stack trace. |
| Browser final proof artifact | yes | Screenshot emitted from `/docs/installation/next`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Read docs nav/sidebar/collapsible source. | implementation |
| Implementation | done | Added collapsible sections and nested branches in `docs-nav.tsx`. | verification |
| Verification | done | Typecheck passed and browser proof completed. | closeout |
| PR / tracker sync | n/a | No PR/tracker requested. | final response |
| Closeout | done | Plan evidence recorded. | final response |

Findings:
- The old docs nav rendered every nested item eagerly.
- The current app already had Radix Collapsible and shadcn sidebar action
  primitives, so the durable fix belongs in `DocsNav`.

Decisions and tradeoffs:
- Top-level sections are collapsible because Plate has far more pages than
  shadcn.
- Nested item branches are also collapsible so plugin and installation-style
  groups scale.
- Multiple branches can stay open; strict one-open accordion would be annoying
  for docs scanning.
- Active branches are forced open to avoid hiding the current page.
- No sidebar filter was added.

Implementation notes:
- Added local open state per rendered nav list.
- Default-open starter groups keep `/docs` useful without showing the full tree.
- Parent links are preserved and chevrons only toggle the branch.

Review fixes:
- N/A.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter www lint:fix` parses TS as JS across existing files | 1 | Use typecheck and browser proof; record lint blocker | Typecheck/browser passed; lint caveat recorded. |
| Broad `rg` hit generated font/json output | 1 | Stop broad output and narrow verification | Recorded as output-budget caveat. |

Verification evidence:
- `pnpm --filter www exec eslint src/components/docs-nav.tsx --fix` passed.
- `pnpm --filter www typecheck` passed.
- Browser `/docs`: Installation collapsed hides `Plate UI`; reopening shows it.
- Browser `/docs`: Plugins expands independently while Installation remains
  controlled separately.
- Browser `/docs/installation/next`: URL loads, `Next.js` is the current nav
  link, Installation is open, and installation children are visible.
- Existing dev server terminal showed `GET /docs` and
  `GET /docs/installation/next` 200 responses with no runtime stack trace.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A feature refinement.
  - Verified: `pnpm --filter www typecheck`; browser proof on `/docs` and
    `/docs/installation/next`.
- Browser check: passed.
- Outcome: docs sidebar accordion implemented.
- Caveat: the changed file lints cleanly, but package-wide
  `pnpm --filter www lint:fix` is blocked by an existing ESLint parser setup
  failure across unrelated TS files.
- Design:
  - Chosen boundary: `DocsNav` source component.
  - Why not quick patch: hidden current pages and parent-link loss would be a
    bad docs UX.
  - Why not broader change: mobile/sidebar architecture and registry are out of
    scope.
- Verified: source, typecheck, browser.
- PR body verified: N/A.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: screenshot emitted from `/docs/installation/next`.
- Caveats: local `www` lint script failure recorded.

Timeline:
- 2026-05-28T15:31:23.153Z Task goal plan created.
- 2026-05-28 Implemented docs sidebar accordion.
- 2026-05-28 Typecheck and browser proof completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after implementation and verification. |
| Where am I going? | Final response to user. |
| What is the goal? | Plate docs sidebar accordion with nested branches and no filter. |
| What have I learned? | Existing shadcn sidebar/collapsible primitives fit this cleanly. |
| What have I done? | Implemented, typechecked, browser-verified, and recorded caveats. |

Open risks:
- Lint script is currently not useful for this app because it fails on existing
  TypeScript parsing before reaching the changed file.
