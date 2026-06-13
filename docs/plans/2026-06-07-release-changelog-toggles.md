# release changelog toggles

Objective:
Add two controls next to RSS on `/docs/releases`: one toggles package release
notes, the other toggles Plate UI registry changes.

Completion threshold:
- Both toggles render next to RSS.
- Both toggles are enabled by default.
- Package changes can be hidden without hiding Plate UI changes.
- Plate UI changes can be hidden without hiding package changes.
- `/docs/releases` still serves and the `www` typecheck passes.

Verification surface:
- `pnpm lint:fix`
- `pnpm --filter www typecheck`
- `curl http://localhost:3000/docs/releases`
- source inspection for the two independent state branches
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-07-release-changelog-toggles.md`

Constraints:
- Keep the change scoped to the releases page and release index component.
- Do not change registry changelog data.
- Do not commit, push, or open a PR.

Boundaries:
- Edited `apps/www/src/app/(app)/docs/releases/release-page-content.tsx`.
- Edited `apps/www/src/components/release-index.tsx`.
- Browser surface: `/docs/releases`.
- Tracker sync: N/A, no tracker.
- Non-goals: no release layout redesign, no changeset, no registry data edits.

Output budget strategy:
Use focused source reads, scoped checks, and short grep/curl verification.

Blocked condition:
No blocker remains. The Browser plugin was not exposed by tool discovery, so
interaction proof used typecheck plus HTTP-rendered markup/source inspection.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal` and `task` |
| Active goal checked or created | yes | Active goal created for release toggles |
| Source of truth read before edits | yes | Read release page and release index components |
| Tracker comments and attachments read | no | N/A: no tracker source |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: small UI toggle |
| TDD decision before behavior change or bug fix | yes | N/A: no established component test harness for this page; verified by typecheck and rendered route |
| Branch decision for code-changing task | yes | N/A: user did not ask for branch or PR |
| Release artifact decision | yes | N/A: app UI only, no package/runtime release artifact |
| Browser tool decision for browser surface | yes | Browser tool searched; not exposed in this turn |
| PR expectation decision | yes | N/A: user did not ask for PR |
| Tracker sync expectation decision | no | N/A: no tracker |
| Output budget strategy recorded | yes | Focused source reads and checks |
| Browser pack selected | yes | `/docs/releases` is a browser surface |
| Browser route / app surface identified | yes | `/docs/releases` |
| Browser tool decision recorded | yes | Browser plugin unavailable via tool discovery |
| Console/network caveat policy recorded | yes | No Browser console access; HTTP route proof recorded |

Work Checklist:
- [x] Objective, threshold, verification, constraints, boundaries, and blocker are concrete.
- [x] Source classified as user request for `/docs/releases` UI.
- [x] Video evidence marked N/A.
- [x] Nearby implementation patterns read.
- [x] State is owned at release page-content level and passed to the release index.
- [x] Release artifact marked N/A.
- [x] Final handoff shape decided.
- [x] Branch handling marked N/A.
- [x] Local-env-rot policy marked N/A; no suspicious failure.
- [x] Workspace authority recorded.
- [x] High-risk note marked N/A; small app UI state change.
- [x] Autoreview marked N/A; trivial two-file UI toggle.
- [x] Agent-native review marked N/A.
- [x] Output budget discipline followed.
- [x] Browser route and expected visible outcome recorded.
- [x] Browser proof caveat recorded.
- [x] Browser final caveat ready for handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run lint, typecheck, route proof | All passed or recorded below |
| Bug reproduced before fix | no | N/A | Feature request |
| Targeted behavior verification | yes | Verify independent booleans in source and rendered buttons | Source has separate `showPackageChanges` and `showPlateUiChanges`; HTML has both pressed by default |
| TypeScript or typed config changed | yes | Run `www` typecheck | Passed |
| Package exports or file layout changed | no | N/A | No exports/layout changes |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest changes |
| Agent rules or skills changed | no | N/A | No agent files touched |
| Workspace authority proof | yes | Run checks in `/Users/zbeyens/git/plate` | Done |
| Browser surface changed | yes | Verify route | HTTP route proof; Browser plugin unavailable |
| Browser final proof | yes | Record caveat | No screenshot because Browser tool unavailable |
| CI-controlled template output changed | no | N/A | No template output touched |
| Package behavior or public API changed | no | N/A | App UI only |
| Registry-only component work changed | no | N/A | No registry data/source changed |
| Docs or content changed | no | N/A | No docs content changed |
| High-risk mini gate | no | N/A | Small local UI state change |
| Agent-native review for agent/tooling changes | no | N/A | No agent files changed |
| Local install corruption suspected | no | N/A | No suspicious failure |
| Autoreview for non-trivial implementation changes | no | N/A | Trivial two-file UI toggle |
| PR create or update | no | N/A | User did not ask |
| Task-style PR body verified | no | N/A | No PR |
| PR proof image hosting | no | N/A | No PR |
| Tracker sync-back | no | N/A | No tracker |
| Final handoff contract | yes | Summarize exact outcome and checks | Ready |
| Final lint | yes | Run `pnpm lint:fix` | Passed, no fixes |
| Output budget discipline | yes | Avoid broad output | Followed |
| Goal plan complete | yes | Run check-complete | Pending final gate |
| Browser interaction proof | yes | Exercise route or record blocker | Browser plugin unavailable; source/HTTP proof used |
| Browser console/network check | no | N/A | Browser plugin unavailable |
| Browser final proof artifact | yes | Record route proof/caveat | `curl` returned 200 and rendered default pressed buttons |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | components read | implementation complete |
| Implementation | complete | two-file patch | verification complete |
| Verification | complete | lint, typecheck, curl | closeout |
| PR / tracker sync | complete | N/A | final response |
| Closeout | complete | plan updated | final response |

Verification evidence:
- `pnpm lint:fix` passed with no fixes.
- `pnpm --filter www typecheck` passed, including docs source parity and
  registry source checks.
- `curl -sS -o /tmp/plate-releases-toggle.html -w '%{http_code} %{content_type}\n' http://localhost:3000/docs/releases`
  returned `200 text/html; charset=utf-8`.
- Rendered HTML includes `Package changes` and `Plate UI` buttons with
  `aria-pressed="true"` next to RSS.

Reboot status:
Complete. The toggles are implemented in the releases page header and wired to
the release index rendering.

Open risks:
Browser plugin was unavailable, so no click screenshot/console proof was
captured in this turn.
