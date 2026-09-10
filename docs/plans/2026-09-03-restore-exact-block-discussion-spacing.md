# Restore exact Block Discussion presentation

Objective:
Restore the before-image Floating Discussion presentation and content without
regressing Comments, Suggestions, overlap handling, or the AI editor layout.

Completion threshold:
- The AI demo shows three compact suggestion rows with visible 1px dividers,
  followed by both complete comment threads.
- The supplied before-image values are present: `01/01/2024`, `comments`,
  `10m`, `8m`, Bob's reply, and Charlie's reply.
- The exact browser row passes five consecutive retry-free runs; the complete
  Comments browser file, unit suite, typecheck, lint, registry build/readback,
  generated payload audit, and fresh live Browser inspection pass.
- This plan passes the Autogoal completion checker.

Verification surface:
- Source owners: `comment.tsx`, `discussion.tsx`, the AI editor fixture, and
  registry metadata/generated payloads.
- Browser owners: `/blocks/discussion-demo`, `/view/editor-ai`, and every route
  and interaction in `apps/www/tests/browser/comment.spec.ts`.
- Static gates: www typecheck, scoped Ultracite, Bun channel tests, registry
  build/readback, payload content audit, and `git diff --check`.

Constraints:
- Preserve the Floating-only Discussion product direction and all existing
  comment/suggestion interactions.
- Do not add a sidebar, duplicate store, plugin-owned application entities, or
  a second Comments presentation owner.
- Do not change Plate package APIs, commit, push, or create a PR.
- Keep the dev server running on port 3000 for user inspection.

Boundaries:
- Product source: `apps/www/src/registry/components/editor/comment.tsx`,
  `discussion.tsx`, `blocks/editor-ai/components/editor/plate-editor.tsx`, and
  `registry-features.ts`.
- Proof source: `comment.spec.tsx`, `tests/browser/comment.spec.ts`, generated
  `comment.json`, `discussion.json`, and `editor-ai.json`.
- Plan-only documentation: this file. Existing registry changelog entry
  `2026-09-02-comments-ownership` remains the current behavior owner.
- No package, export, manifest, lockfile, template, agent rule, or skill change.

Blocked condition:
Block only if the exact supplied state cannot be reproduced, the before-image
contract conflicts with current Comments behavior, or the final browser/runtime
proof cannot run. None of those conditions remain.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | First PNG treated as correct, second PNG as regressed; presentation, content, timestamps, and behavior retained |
| Source and skills read | yes | Patch, Plate UI, TDD, Shadcn, Autogoal, Best API, root Vision, and Plate Vision applied |
| TDD decision | yes | Exact geometry/content/timestamp assertions were added and observed red before product repair |
| Browser decision | yes | Browser used for live DOM/visual proof; no native Chrome or OS behavior applies |
| Release decision | yes | Registry-only source and generated payloads; existing Comments registry changelog entry covers the behavior |
| Git authority | no | No commit, push, branch, worktree, or PR requested |

Work Checklist:
- [x] Reproduced the supplied after state on `/view/editor-ai`.
- [x] Traced excess whitespace and invisible dividers to the shared popover's
      inherited 10px flex gap shrinking 1px separator children to 0px.
- [x] Fixed the specialized Discussion owner with `gap-0` and the existing
      shadcn `Separator`; the reusable FloatingPopover remains unchanged.
- [x] Restored both historical replies, stable suggestion dates, exact thread
      excerpts, and before-image relative timestamps.
- [x] Kept application threads in the app-owned channel and editor interaction
      state in the plugin; no store or provider duplication was introduced.
- [x] Added one optional channel `now()` dependency and routed create, reply,
      and edit timestamps through it; the default remains real current time.
- [x] Added unit coverage for the channel clock and exact browser coverage for
      layout, separators, dates, excerpts, replies, and timestamps.
- [x] Rebuilt and audited canonical registry payloads.
- [x] Ran typecheck, scoped lint, unit tests, all browser rows, five-run exact
      stability, fresh-process replay, and fresh live Browser inspection.
- [x] Performed a manual scoped source/generated review. P1 Autoreview is N/A
      because repository instructions prohibit Autoreview on `next`.
- [x] Kept command output bounded where possible; registry generation and one
      stopped dev-server log exceeded the requested cap but were recovered and
      did not hide errors.
- [x] Left the final dev server running at `http://localhost:3000`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Named verification threshold | yes | Run all named proof | All gates below pass |
| Bug reproduced before fix | yes | Observe exact failure | Browser row received 10px gap, 0px dividers, missing replies, `0m`, and changed fixture text/date |
| Targeted behavior verification | yes | Exact visual row | 5/5 retry-free Chromium passes on final source |
| TypeScript or typed config changed | yes | www typecheck | `pnpm --filter www typecheck` passed |
| Package exports or file layout changed | no | N/A | No package export or layout change; `pnpm brl` not required |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifest, lockfile, or install-graph edit |
| Agent rules or skills changed | no | N/A | No agent source changed |
| Workspace authority proof | yes | Run from Plate repo | All commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | yes | Browser proof | Fresh `/view/editor-ai` inspection shows restored rows, dividers, content, and times |
| Browser final proof | yes | Fresh page and interaction | Fresh in-app Browser tab on final source opened `Open 5 discussion items for Block 4` successfully |
| CI-controlled template output changed | no | N/A | No template output edited |
| Package behavior or public API changed | no | N/A | Plate package API unchanged; copied registry channel only gained an optional app-owned clock dependency |
| Registry-only component work changed | yes | Registry artifact decision | Existing `2026-09-02-comments-ownership` entry owns this current behavior; no duplicate changelog row |
| Docs or content changed | no | N/A | Only the execution plan changed |
| High-risk mini gate | yes | Prove visible behavior and ownership | Exact geometry plus full behavior suite prove the local Discussion boundary; shared popover unchanged |
| Agent-native review for agent/tooling changes | no | N/A | No agent or tooling source changed |
| Local install corruption suspected | no | N/A | No hook-resolution or install-corruption signal occurred |
| P1 autoreview for non-trivial implementation changes | no | N/A | Root instructions prohibit Autoreview on `next`; manual scoped review found and fixed the edit-clock inconsistency |
| PR create or update | no | N/A | User did not request a PR |
| Task-style PR body verified | no | N/A | No PR exists |
| PR proof image hosting | no | N/A | No PR exists |
| Tracker sync-back | no | N/A | Direct local report without tracker |
| Final handoff contract | yes | Record exact outcome and caveat | Recorded below |
| Final lint | yes | Scoped Ultracite | Six owned source/test files pass formatting and lint |
| Output budget discipline | yes | Bound output | Source reads/searches were scoped; two long generated/log outputs were truncated by the tool without losing exit status |
| Timed checkpoint | no | N/A | No duration requested |
| Goal plan complete | yes | Run checker | `check-complete.mjs` is the final closeout command |
| Browser interaction proof | yes | Open Discussion | Live trigger opens five mixed items with complete content |
| Browser console/network check | yes | Runtime listener and final logs | Browser harness reported no relevant runtime errors; final fresh replay logs only 200 responses and React DevTools notice |
| Browser final proof artifact | yes | Screenshot and AX state | Final Browser capture shows compact divided rows and AX state records all five items and exact content |
| Exact case replay | yes | Final exact route | Final-source exact row passed once after fresh server and 5/5 warm runs |
| Final ref and fingerprints | yes | Record ref/hashes | Recorded in Verification evidence |
| Clean final runtime | no | N/A | Local uncommitted shared checkout, not a pushed immutable ref; fresh process and exact local fingerprints recorded |
| Retry-free stability | yes | Five warm runs | 5/5 Chromium passes with retries disabled |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source read | complete | Screenshots, source, Vision, and skills inspected | done |
| Implementation | complete | Discussion owner, fixture, and channel clock repaired | done |
| Verification | complete | Unit, lint, types, registry, 11 browser rows, 5/5 exact, fresh Browser | done |
| PR / tracker sync | N/A | Neither requested nor present | done |
| Closeout | complete | Final evidence and fingerprints recorded | final response |

Findings:
- `FloatingPopoverContent` supplies a 10px column gap. Discussion placed item
  wrappers and separators as direct children, producing 20px around each rule
  and flex-shrinking its height from 1px to 0px.
- The AI fixture also dropped two replies, changed the first excerpt, replaced
  stable suggestion dates with current dates, and recreated comments at `0m`.
- A channel clock is the smallest honest way to seed display dates. It stays in
  the existing application source and covers every channel-authored timestamp.

Decisions and tradeoffs:
- The shared popover keeps its general 10px gap; only Discussion overrides it.
- The installed shadcn Separator owns non-shrinking divider behavior.
- No new Comments plugin, store, provider, presentation mode, or package API was
  added. The fixture uses existing channel operations and one optional clock.

Error attempts:
| Error / failed attempt | Count | Resolution |
| --- | --- | --- |
| Initial exact visual row | 1 | Red proved 10px gap and collapsed 0px divider |
| Restored reply/date/excerpt rows | 3 | Each assertion was observed red before its fixture repair |
| Restored timestamp row | 1 | Red received `0m`; channel clock made it `10m`/`8m` |
| Edit clock consistency row | 1 | Red received wall-clock date; `edit` now uses the channel clock |
| First scoped lint after clock | 1 | Moved clock construction outside render and removed mutation/purity violations |
| Fresh dev startup registry alias | 1 | Transient existing compile warning recovered; fresh exact replay then returned only 200 responses |

Verification evidence:
- RED: exact row observed `gap: 10px`, separator height `0`, missing replies,
  changed date/excerpt, and `0m` thread time.
- GREEN: final exact row asserts three 123px suggestion wrappers, three 31px
  composers, four visible 1px contrasting separators, `gap: 0px`,
  `01/01/2024`, `comments`, `10m`, `8m`, and both historical replies.
- Browser: full `comment.spec.ts` passed 11/11; final exact row passed 5/5
  retry-free; fresh server and fresh Browser tab reproduced the final state.
- Unit: `comment.spec.tsx` passed 8/8 with 51 assertions.
- Static: www typecheck passed; scoped Ultracite passed; registry build/readback
  materialized 364 canonical payloads and 15 overlays; payload content audit and
  `git diff --check` passed.
- Final local base ref: `a6afd55c30e97c74fe895d1ad005ca75413110f3`.
- SHA-256 production/test/generated fingerprints:
  - `comment.tsx`: `52fa3d2ff920a0685a1e06c7ff3519b946ed684f2d20de3c42668c3883816587`
  - `comment.spec.tsx`: `789827ba099edfa89815f191acfc06f016a3d403560689979ff234c25af74910`
  - `discussion.tsx`: `fb41c341c3319a8b4e640bb03e80f2390fe30ebdbe57b6264dbcd7a8e1328a61`
  - AI `plate-editor.tsx`: `60f350a0a598444c45efb42d84c1f51cbb9935f9fe0a3057f94a3bb3ab71ba21`
  - `registry-features.ts`: `9b798d8422aacd9d67c0256166d4963d3e3606423525b2fd3c288bfd445ec083`
  - browser `comment.spec.ts`: `661f85440676cf85302611cb102b4ff84303d1a281b5e5a796e0a5bf6f4db344`
  - generated `comment.json`: `dcf2ce8310bce21f498d14754c0568d340ddb21c3b3f67347ca0faf4a92401b9`
  - generated `discussion.json`: `3b21529c23411c7e88121711d08243d117d5af5bbbbaec3126368b91c768869e`
  - generated `editor-ai.json`: `e4513ea0d40367d6433719fd003e8f9d27fe1438555bdbdc07b9e4da1ad75804`

Final handoff contract:
- PR: N/A; no PR requested.
- Issue / tracker: N/A; direct local report.
- Confidence: 99%; exact visual, interaction, unit, type, lint, generated, and
  fresh-process proof pass. The remaining 1% is the uncommitted shared checkout.
- Outcome: before-image presentation and full mixed Discussion content restored.
- Caveat: local and uncommitted; no pushed-ref or immutable-CI claim.
- Design: specialized Discussion owns layout, app channel owns data/time, Plate
  Comments plugin owns editor-local anchors and interaction state.
- Dev server: running at `http://localhost:3000`.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete local repair with final proof |
| Where am I going? | Final user handoff only |
| What is the goal? | Restore the supplied before-image Discussion state without behavior or architecture regression |
| What have I learned? | Shared popover gap collapsed separators; fixture data and time also regressed |
| What have I done? | Repaired the local owner, restored content/times, regenerated registry, and proved all behavior |

Open risks:
- None in the verified local behavior. Delivery remains local and uncommitted.
