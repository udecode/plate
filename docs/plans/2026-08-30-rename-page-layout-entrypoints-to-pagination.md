# rename page layout entrypoints to pagination

Objective:
Hard-cut the public `page-layout` entrypoints to `pagination`; done when both
distributions, all current consumers/docs/proofs, and packed artifacts expose
only `plitejs/pagination[/react]` and `platejs/pagination[/react]`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-30-rename-page-layout-entrypoints-to-pagination.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`; the public target was resolved with Best API and the user
  explicitly authorized execution with `ok lets go`.

Completion threshold:
- Zero current public/package/source/docs/test import references to
  `plitejs/page-layout[/react]` or `platejs/page-layout[/react]`.
- Both packages expose only `pagination` and `pagination/react`; focused
  typecheck/tests, barrels, registry generation, strict packed proof, P1
  review, doctrine/mirror checks, and `check-complete` pass.

Verification surface:
- Exact `rg` stale-specifier/path audits outside historical plans and
  transplant archives.
- Entrypoint DAG tests, package lint/typecheck/tests, barrels, docs registry
  generation, strict packed release proof, Browser docs-route proof, Plate Next
  doctrine validation, P1 autoreview, and plan checker.

Constraints:
- Execution is authorized by the user's accepted one-word target and `go`.
- No public compatibility aliases or runtime shims.
- Preserve page-layout runtime behavior, exported symbol identities, headless
  versus React dependency isolation, and Plate facade parity.
- Do not commit, push, open a PR, or release.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: public subpaths, physical entrypoint folders, package/build/type/DAG
  metadata, first-party consumers, tests, current docs/generated registry
  output, release proof, changesets, and exact owning doctrine.
- Source owners: `packages/plitejs` pagination substrate and `packages/platejs`
  identity-preserving facade mirrors.
- Non-goals: rename `PageLayout` domain types/functions, change pagination
  behavior, add aliases, redesign measurement/rendering, or mutate git/remotes.
- Direct Plate adoption: mirror `platejs/pagination[/react]`; collaboration has
  no direct import and is N/A unless the exact audit proves otherwise.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if the hard cut creates an unavoidable declaration/runtime identity
  failure with no repair inside the named package/export owners.

Plite Plan state:
- status: done
- phase: prove-and-handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | One-word `pagination`, both Plite and Plate public paths, execution authorized. |
| Active goal and plan verified | yes | No tool goal exists because the user did not explicitly request one; this exact durable execution plan carries the measurable contract. |
| Current owners read | yes | Live Plite implementation, React adapter, package exports, Plate proxies, docs, example, DAG, and prior distribution decision read. |
| Best API target resolved | yes | Keep the independent feature boundary; rename only its public owner to one-word `pagination`; reject vague `page`, misleading `paging`, and compatibility aliases. |
| Mode and execution boundary resolved | yes | Standard one-shot execution; no commit/push/PR/release. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Implement every rename/adoption row with no compatibility surface.
- [x] Repair current doctrine/mirrors and add per-package changesets relative to main.
- [x] Pass focused, package, docs/Browser, packed, review, and plan gates.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | complete | Resolve every readiness condition | Both packages expose only `pagination[/react]`; no alias remains. |
| Fresh source evidence | complete | Recheck decision-changing current claims | Live implementation, exports, current docs/example, DAG, and package topology read on 2026-08-30. |
| Best API review | complete | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | One-word `pagination` entrypoint accepted; symbol-family redesign explicitly out of scope. |
| Conditional risk and adoption | complete | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | Browser proved the new route and old-route 404; performance, provenance, collaboration behavior, and runtime redesign are N/A because behavior did not change. |
| Verification recorded | complete | Record fresh planning proof and exact execution gates | Focused/package/docs/packed/Browser/doctrine evidence is recorded below. |
| Handoff prepared | complete | Prepare concise ownership, breaks, proof, risks, and execution order | Exact break, preserved symbols, proof, and current-tree boundary are recorded below. |
| P1 autoreview | complete | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | N/A by repository law: the current branch is `next`, where autoreview is forbidden. Manual diff review found no in-scope issue. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-rename-page-layout-entrypoints-to-pagination.md` | `[autogoal] complete` on the final plan. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live owners and public consumers read | Execute |
| Decide | complete | Accepted hard-cut target and adoption/proof rows below | Execute |
| Execute | complete | Both physical/public owners, consumers, docs, proof metadata, changesets, and doctrine were migrated | Prove and hand off |
| Prove and hand off | complete | Focused/package/docs/packed/Browser/doctrine proof passed; wider strict-check boundary recorded | User review |

Decision brief:
- outcome: One one-word pagination subpath in each distribution, with React
  isolated beneath `/react`.
- chosen shape: `plitejs/pagination[/react]` is canonical;
  `platejs/pagination[/react]` is its identity mirror.
- strongest rejected alternative: keep `page-layout` as a compatibility alias;
  rejected because the accepted hard cut requires one canonical import path.
- consequence: breaking public import-path change for both packages; runtime
  symbols and behavior stay identical.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plite headless entrypoint | `plitejs/page-layout` | `plitejs/pagination` | Plite pagination substrate | One-word accepted feature owner | Package exports, source folder, consumers, docs, tests, build/type/DAG metadata | Packed headless import/declaration/DCE proof | Missed old path or peer leak | rename |
| Plite React entrypoint | `plitejs/page-layout/react` | `plitejs/pagination/react` | Plite pagination React adapter | Preserve explicit React isolation | Same adoption plus Browser pagination/docs route | Packed React import and Browser proof | React dependency reaches headless path | rename |
| Plate facade mirrors | `platejs/page-layout[/react]` | `platejs/pagination[/react]` | Exact Plate proxies | Plate users import Plate only | Proxy folders, exports, DAG, smoke tests, docs/API output | Packed identity and declaration parity | Facade drift | rename |
| Public symbol family | `PlitePageLayout*`, `createPliteLayout`, `PagedEditable` | unchanged | Existing Plite owner | User accepted entrypoint noun only; behavior/API-symbol redesign is separate | No symbol call-site migration | Type/runtime parity | Accidental scope expansion | keep |
| Doctrine and teaching | Current paths teach `page-layout` | Current paths teach `pagination` | Vision, Best API, Plite/Plate planners and current docs | Agents and users need one canonical path | Repair only exact affected owners, regenerate mirrors/version | Stale-name audit and doctrine validation | Historical plans mistaken for current teaching | rename |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Entrypoint owners | Plite + Plate package metadata | Rename physical/public paths and generated task metadata | Accepted target | No old exported subpath or alias | DAG tests, barrels, typecheck |
| 2. Consumer adoption | Current source/tests/examples/docs/tooling | Replace public specifiers and route/doc slugs | Slice 1 | Zero current stale specifiers | Exact `rg`, docs registry build |
| 3. Doctrine/release | Best API + Vision + package release | Repair canonical teaching and add two package changesets | Stable public paths | Mirrors current; release impact honest | `pnpm install`, version validation, changeset audit |
| 4. Closure | Package/docs/review owners | Run package, packed, Browser, P1, and plan proof | All edits complete | All named gates green | Exact commands recorded below |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Only `pagination[/react]` is public | Current package export maps and exact consumer manifest | Exact stale-path audit returned zero; package exports and all 80 packed subpaths passed | pass |
| Plate facade remains identity-equal | Direct proxy source | Packed cross-distribution runtime/declaration parity passed | pass |
| Headless path remains React-free | Current separate React subpath | Entrypoint DAG and packed React-free headless execution passed | pass |
| Current docs teach the hard cut | Current docs imported two old paths | Registry generation passed; Browser rendered the new imports and the old route's 404 page | pass |

Conditional evidence:
- High-risk scenarios: old path survives in exports/generated consumers; React
  peer leaks into headless path; Plate mirror loses runtime/type identity.
- External research: N/A; the user selected the naming constraint and live repo
  source fully defines adoption.
- Issue/PR provenance: N/A; this is not issue-backed and no public tracker claim
  is authorized.
- Browser/Benchmark/docs/release/behavior-law owners: Browser applies to the
  current docs route; Benchmark and behavior-law changes are N/A because
  runtime behavior is unchanged; docs, generated registry, strict package
  proof, and two breaking changesets apply.

Findings:
- The public owner is an independent pagination job with headless and React
  dependency boundaries, so deleting the entrypoint is not justified.
- `page` is under-specified and `paging` means record batching; `pagination` is
  the accepted one-word feature name.
- Plate owns exact facade proxies and must rename in the same atomic cut.

Decisions and tradeoffs:
- Hard-cut both distributions in one change -> one canonical import path ->
  breaking adoption cost accepted; no alias survives.
- Keep `PageLayout` domain nouns -> they still truthfully name derived physical
  layout inside the pagination feature -> avoid unapproved symbol churn.

Review fixes:
- Updated the stale Turbo contract to test the accepted Plate `history` facade
  permission instead of the removed raw `plitejs/history` permission. Its
  focused 17-test suite passes.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Ran the Plate proxy with an entrypoint-only task command | 1 | Use the generated `proxies` partition owner | `pnpm --filter platejs typecheck:partition:proxies` passed. |
| Requested an overbroad changeset listing | 1 | Bound later reads to exact package changesets | Existing one-per-package major changesets were updated without adding duplicates. |
| Pagination test formatting failed | 1 | Run the repository formatter on the moved test | Package lint passed. |
| Initial move-comparison loop relied on zsh word splitting | 1 | Feed exact old/new pairs through a read loop | All four runtime files were proven byte-identical except one JSDoc sentence; test changes were import/doc-path only. |
| An `rg` pattern left backticks visible to zsh | 1 | Quote the complete pattern with single quotes | The safe rerun proved source rules and both generated skill mirrors teach the same noun rule and Plate Next v125. No state changed. |
| Strict contracts found a stale raw-Plite Turbo assertion | 1 | Test the current Plate facade permission instead | Focused Turbo suite and the next strict contracts pass completed. |
| Strict Chromium proof invalidated on concurrent source mutation | 1 | Wait for a stable source hash and rerun | The first run passed all pagination browser batches before invalidation. |
| Stable-source strict rerun encountered unrelated React work | 1 | Preserve the scope boundary instead of editing another owner | `usePliteWidgetIds` currently breaks two React/widget tests; pagination proof is unaffected and the wider check is honestly red. |

Verification evidence:
- `pnpm entrypoint:turbo:generate`; generated package scripts, Turbo tasks, and
  entrypoint tsconfigs are current.
- `pnpm brl`; 4/4 package barrels are current.
- `pnpm install`; generated Best API and Plate Next skill mirrors are current.
- `node .agents/rules/plate-next/scripts/version.mjs validate`; Plate Next v125
  registry is valid with the new doctrine fingerprint.
- `pnpm --filter plitejs lint && pnpm --filter plitejs typecheck && pnpm --filter plitejs test`;
  8 lint, 10 typecheck, and 15 test tasks passed.
- `pnpm --filter platejs lint && pnpm --filter platejs typecheck && pnpm --filter platejs test`;
  71 lint, 79 typecheck, and 122 test tasks passed.
- `pnpm --filter plitejs test:partition:pagination`; 57/57 tests passed.
- `node --test tooling/scripts/entrypoint-dag-plugin.test.mjs`; 21/21 passed,
  including exact Plate raw-Plite bridge allowlist parity across source and tests.
- `node --test tooling/scripts/entrypoint-turbo.test.mjs`; 17/17 passed.
- `pnpm --filter www check:docs` and `pnpm --filter www typecheck`; both passed.
- `pnpm --filter www build:registry`; generated registry output contains the
  pagination route and no current layout route.
- `pnpm plite:release:packages`; 4 packed packages, 80 public subpaths, 75
  runtime entrypoints, declaration parity, exact optional-peer closures, DCE,
  React-free headless execution, and Plate/Plite identity passed.
- Exact current-source audit found zero old public specifiers or physical
  `page-layout` entrypoint paths. Intentional `PageLayout` domain symbols and
  stable `plite-layout:` runtime keys remain.
- Browser: `/docs/plite/libraries/plite-pagination` rendered `Plite Pagination`,
  `plitejs/pagination`, and `plitejs/pagination/react`; the old
  `/docs/plite/libraries/plite-layout` route rendered the 404 page.
- `pnpm check:plite` is not a green current-checkout claim: the first run passed
  type/package/contracts and every pagination Chromium batch reached before a
  concurrent `widget-store.ts` mutation invalidated proof; the stable rerun is
  red only in two unrelated React/widget tests introduced by that mutation.
- P1 autoreview is prohibited on the current `next` branch. Manual review of
  the renamed sources, package metadata, DAG, lint boundaries, docs, changesets,
  generated outputs, and doctrine found no actionable in-scope issue.
- Agent-native parity passes: the human import route, Best API source rule,
  generated Codex/Claude skill mirrors, current docs/registry, package exports,
  exact Oxlint bridge allowlist, and packed proof all teach and enforce the same
  `pagination[/react]` contract.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns `plitejs/pagination[/react]`;
  Plate mirrors it at `platejs/pagination[/react]`; existing `PageLayout`
  symbols and runtime behavior stay unchanged.
- Public breaks and Plate/collaboration adoption: both old subpaths are deleted
  with no aliases; Plate consumers use only Plate pagination proxies; no
  collaboration import existed.
- Applicable browser/Benchmark/docs/provenance decisions: docs and Browser
  apply and passed; Benchmark/provenance are N/A for a path-only hard cut.
- Proof and execution risks: no in-scope risk remains. The broader current tree
  has two unrelated React/widget test failures from concurrent work and is not
  claimed green.
- Execution order and user attention: implementation is complete; only review
  the intended hard cut. No commit, push, PR, or release was performed.

Timeline:
- 2026-08-30T20:00:59.995Z Plite Plan created.
- 2026-08-30 renamed both public owners, migrated every current consumer and
  docs route, regenerated package/registry/doctrine outputs, and updated both
  breaking changesets.
- 2026-08-30 completed focused/package/docs/packed/Browser/manual-review proof
  and recorded the unrelated current-tree strict-check boundary.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Done |
| Where am I going? | User review |
| What is the goal? | Only `pagination[/react]` remains public in Plite and Plate |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- None in the accepted rename scope. The unrelated React/widget failures above
  prevent a whole-checkout green claim but do not affect pagination ownership,
  imports, packed artifacts, or docs behavior.
