# Felix regression closure for #5091, #5065, #5088, and #5064

Objective:
Close the four exact reporter contradictions at durable Plate/Plite owners with
executable regression proof and the best long-term architecture.

Flow mode:
one-shot execution

Goal plan:
docs/plans/5091-5065-5088-5064-regression-closure.md

Template:
docs/plans/templates/regression.md

Primary template:
docs/plans/templates/regression.md

Regression source:
- target corpus: live Plate issues #5091, #5065, #5088, and #5064, including
  each latest Felix contradiction or remaining-symptom comment
- cases: `font-size-selection-paint`, `table-tab-collapsed-caret`,
  `block-selection-exclusive-native-state`, and
  `homepage-heading-enter-latency`
- tested boundary: local base ref
  `1fb72c581095f23ddba3f597f41e8b10608283ef` plus per-case fingerprints
- proof host: freshly restarted source-built `apps/www` on port 3061 with
  Playwright Chromium; package tests run from current source
- public boundary: post one local-candidate comment per issue; keep every issue
  open and omit `completed` until pushed-ref replay

First checkpoint:
- Every issue, latest contradiction, exact outcome, durable-fix preference,
  verification surface, no-lint rule, no-Autoreview rule, no-git-mutation rule,
  public comment requirement, and pushed-ref boundary was recorded before the
  four cases were changed.

Completion threshold:
- Every case has an exact executable reproduction, a durable owner, focused
  package proof, final fresh-host replay, and five retry-free browser runs.
- #5091 repaints the resized expanded selection against a pixel baseline.
- #5065 leaves one collapsed caret at the destination start for Tab and
  Shift+Tab while preserving editor focus.
- #5088 selects all crossed blocks while native text selection stays empty and
  the floating text toolbar stays hidden.
- #5064 retains exact Enter correctness and passes its completed Benchmark
  current/main relative gate after removing the proven repeated DnD cost.
- Each locally completed case receives a truthful GitHub comment. Public issue
  completion remains reserved for exact replay on the final pushed ref.

Verification surface:
- focused Core, DnD, Plite React, Selection, and Table tests
- source-first typechecks for modified packages plus `www` typecheck
- Core/DnD barrel checks and source-owned changeset/changelog evidence
- one combined four-case Playwright command repeated five times on a fresh host
- Benchmark's trusted Enter runner, five final packets, isolated exact main,
  correctness oracle, and final aggregate artifact
- final ref, per-case source/test fingerprints, public-comment readback, and
  explicit local/unpushed claim width

Constraints:
- Tests own durable behavior; no sidecar issue ledger or duplicate case database.
- Fix the owning package/runtime, not a demo-only mask, wait, focus hack, or
  compatibility shim.
- Break private-beta API when the new architecture has materially better
  lasting value and preserves correctness/native behavior.
- Do not lint, run Autoreview, commit, push, create a PR, close an issue, or add
  `completed` labels in this session.

Boundaries:
- #5091: Plite native selection projection and the Plate font-size caller.
- #5065: Table navigation transaction and exact native caret proof.
- #5088: Selection gesture/runtime ownership and the copied gutter hit target.
- #5064: Benchmark-selected Core wrapper, DnD, copied UI, block-discussion
  indexing, and Plite live DOM path owners.
- Generated changelog JSON may be regenerated from its source entry;
  `templates/**` and registry build output stay untouched.
- Browser claim width is local Chromium because the in-app Browser connector
  was unavailable.

Output budget strategy:
- Use exact source/test paths, focused package commands, compact benchmark
  summaries, and bounded browser logs. Keep large performance packets under the
  named Benchmark artifact directory.

Blocked condition:
- Block only if current source cannot reach the exact case or its required
  native state. Stale hosts, runner mistakes, and local type defects are repaired
  before any blocker claim.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Requirements captured | yes | Four issues, absolute-best durable fix, exact proof, comments, and public-state limits were recorded first. |
| Regression methodology loaded | yes | Regression methodology, Patch, Benchmark, Best API, and layer-plan rules were read before execution. |
| Current source recorded | yes | Base ref and dirty-boundary fingerprint strategy are recorded. |
| Exact cases selected | yes | Four stable IDs and reporter-visible outcomes are named above. |
| Host/freshness strategy ready | yes | Fresh source-built www, current-source package tests, and isolated main benchmark host were selected. |
| Writer ownership serialized | yes | One main-thread writer handled overlapping selection and route owners sequentially. |

Work Checklist:
- [x] Capture every explicit requirement and public-state boundary before work.
- [x] Read live issue bodies and latest comments; use the contradictions as the
      actual current cases.
- [x] Record current ref, source owner, test runner, route, host, and freshness
      method for every case.
- [x] Run the smallest falsifying executable probe before scaling proof.
- [x] Record exact red evidence or an honest safe-red limitation.
- [x] Apply one normalized case at a time at its durable owner.
- [x] Run focused package proof, exact fresh-host replay, and five retry-free
      browser runs from final bytes.
- [x] Keep only fixes that preserve the exact behavior and long-term architecture.
- [x] Record one methodology decision per case and repair workflow defects.
- [x] Avoid a sidecar case registry, manifest, TSV, or behavior database.
- [x] Record local ref, final fingerprints, integration limits, and next owner.
- [x] Post and read back one truthful local-candidate comment per issue.

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Named threshold | yes | All four exact outcomes passed five final browser runs; #5064 also passed the completed Benchmark plan. |
| Current source/host | yes | Final Playwright ran after the last code edit and a full www restart. |
| Executable coverage | yes | Four named e2e tests plus focused package contracts own the regressions. |
| Red/green proof | yes | Each case records exact prior failure and final green evidence below. |
| Stability | yes | Combined fresh-host batch passed 20/20 with zero retries. |
| Durable architecture | yes | Package/runtime owners replace local masks; #5064 completed Best API and Plate/Plite plan routing. |
| Package/type/barrel proof | yes | Focused tests, package/app typechecks, and Core/DnD barrels passed. |
| Changesets/changelog | yes | Table, Selection, DnD, and Plite React release artifacts are source-owned; demand DnD registry changelog source is present. |
| Agent/source sync | no | N/A: this four-case packet did not change agent source. |
| Lint | no | N/A: user explicitly prohibited lint in this session. |
| Autoreview | no | N/A: user explicitly prohibited Autoreview in this session. |
| Public comments | yes | New local-only comments were posted to all four issues; issues remain open without `completed`. |
| Final handoff | yes | Tests, decisions, fingerprints, risks, and pushed-ref next owner are recorded. |
| Goal plan checker | yes | `check-complete.mjs` is the final structural proof. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Requirement extraction and goal setup | completed | Four exact current cases and all constraints captured. | closed |
| Source and proof-host readiness | completed | Current package source, fresh www, and isolated main were proved. | closed |
| Reproduce and classify | completed | Exact reporter failures selected durable owners. | closed |
| One-case repairs | completed | Four cases were repaired serially without broadening claims. | closed |
| Focused verification and stability | completed | Package checks and final 20/20 browser batch passed. | closed |
| Packet and methodology decisions | completed | All four kept; one methodology decision recorded per case. | closed |
| Public sync and handoff | completed | Four comments posted; local/unpushed boundary retained. | pushed-ref replay |

Selected executable cases:
| Case | Exact red | Durable owner and fix | Final proof | Status / fingerprint |
|---|---|---|---|---|
| `issue-5091:font-size-selection-paint` | Blink paint exceeded resized text by 127.70 px while the logical range looked correct. | Plite re-exports unchanged expanded selections after document commits and refreshes Blink geometry; font-size descriptors no longer target the wrong paragraph path. | Exact pixel oracle 5/5; combined batch 20/20; Plite React full 1063/1063. | locally completed, unpushed; `f324ae4ca0ecb1b59bf8ae25797caab6d37c08664cacb258cc7226d939536f82` |
| `issue-5065:table-tab-collapsed-caret` | Destination cell became an expanded range (`collapsed:false`, selected text `✅`). | Table navigation resolves the destination start point and installs one collapsed caret for Tab and Shift+Tab. | Table 35/35; exact browser 5/5; combined batch 20/20. | locally completed, unpushed; `91c5009b213ad9f7b7439a4ecc6b0698a0ee673ba3425b8cb08576a42556a4d0` |
| `issue-5088:block-selection-exclusive-native-state` | Selected block styling coexisted with native text selection and the floating text toolbar. | Structural selection owns native-selection exclusion for its full lifetime; the stable 22 px DnD gutter remains a selectable hit area. | Selection 88/88; exact browser 5/5; combined batch 20/20. | locally completed, unpushed; `f17bb481717804d70a2ae4b7e4320b3e333faa290f4e02389a5dbc8d63fd143b` |
| `issue-5064:homepage-heading-enter-latency` | Trusted Enter reproduced at 330/370 ms mean and 376/417 ms p95 mutation/paint. | Core wrapper descriptors prefilter by `renderPath`; Plate keeps stable lightweight wrappers and demand-activates DnD with one root subscription; Plite repairs live moved-node DOM paths. | Five 20-sample packets median 67/65 ms mean and 85/85 ms p95; exact DnD/edit 5/5; Benchmark validators green. | locally completed, unpushed; `f8d6e785e7dbb3b9200ec2561bf9abf1262976b031c18bc4c06841486da77735` |

Patch returns:
| Case | Architecture verdict | Changed owner | Proof return |
|---|---|---|---|
| #5091 | keep package-level native projection; reject toolbar refocus compensation | Plite React selection runtime and font-size caller | final pixel replay green |
| #5065 | keep destination-point navigation; reject cell-path range normalization | Table plugin | model and native caret proof green |
| #5088 | keep structural-selection lifetime ownership; reject clearing the editor selection after drag | Selection runtime and gutter contract | native range, focus, toolbar, and block assertions green |
| #5064 | hard-cut eager wrapper composition; keep demand activation and live path authority | Core, DnD, copied UI, Plite React | benchmark, real DnD/edit, and package proof green |

Stability:
| Case | Required runs | Result | Retries | Decision |
|---|---|---|---|---|
| #5091 | 5 | 5/5 exact pixel oracle | 0 | keep |
| #5065 | 5 | 5/5 Tab and Shift+Tab native caret oracle | 0 | keep |
| #5088 | 5 | 5/5 gutter drag/native exclusion oracle | 0 | keep |
| #5064 | 5 benchmark packets and 5 browser runs | 100/100 trusted Enter measurements valid; DnD/edit 5/5 | 0 | keep |

Packet decisions:
| Case | Decision | Claim width | Residual risk | Next owner |
|---|---|---|---|---|
| #5091 | kept | local candidate | Chromium paint only | pushed-ref replay |
| #5065 | kept | local candidate | Chromium native caret only | pushed-ref replay |
| #5088 | kept | local candidate | Chromium pointer/native selection only | pushed-ref replay |
| #5064 | kept | local candidate | local machine timing and Chromium only | integration plus pushed-ref replay |

Methodology deltas:
| Case | Decision | Durable methodology |
|---|---|---|
| #5091 | no change | Retain the pixel-level selected/unselected geometry oracle; logical DOM Range equality is insufficient. |
| #5065 | repair now | Table navigation tests must assert a resolved point and native collapsed selection, not only destination cell identity. |
| #5088 | repair now | Structural selection proof must assert native selection, focus owner, toolbar state, every crossed block, and the actual gutter hit target. |
| #5064 | repair now | Performance contradictions route to Benchmark with exact trusted action, current/main authority, causal intervention, final rerun, and correctness replay. |

Workflow slowdowns:
| Failure | Different move | Resolution |
|---|---|---|
| Incorrect `pnpm dev -- --port` syntax | Use `pnpm --filter www dev --port <port>`. | Fresh hosts started reliably. |
| #5088 model-clear experiment erased structural selection | Preserve structural state and exclude native selection for the full mode lifetime. | Exact case green. |
| DnD move left stale descendant DOM paths | Resolve by node key after render instead of caching a path. | Real move followed by edit/selection green. |
| Lightweight DnD button collapsed the gutter hit width | Preserve a stable 22 px selectable gutter. | Fresh final #5088 replay green 5/5. |
| Typecheck found an effect cleanup returning a nested cleanup | Make the ref disconnect cleanup explicitly void. | `www` typecheck and final browser replay green. |

Findings:
- The earlier comments were too optimistic because they proved neighboring
  behavior, not Felix's remaining exact symptoms. The final tests directly own
  the reported paint, native selection, focus, toolbar, and timing outcomes.
- #5064 was architectural, not a slow Plite editing primitive. Raw Plite was
  about 7 ms; eager Plate DnD composition repeated expensive work per block.
- A clean-server replay caught two integration defects that HMR-era proof had
  missed: the selectable gutter width and the effect cleanup type contract.

Decisions and tradeoffs:
- Keep exact browser tests as the behavior authority; plans only record transient
  execution and evidence.
- Keep local completion distinct from public completion. These four packets are
  locally complete but not pushed, integrated, shipped, or eligible for the
  public `completed` label.
- Preserve stable wrapper DOM for selection and drag geometry while mounting
  expensive DnD runtime/UI only when interaction begins.

Review fixes:
- Autoreview is N/A by direct user instruction. No clean-review claim is made.
- Lint is N/A by direct user instruction because another session owns the linter
  migration.

Verification evidence:
- Final fresh-host command passed 20/20: the four exact Playwright cases,
  one worker, five repeats, zero retries.
- Focused tests passed: Core 5, DnD 20, Table 35, Selection 88, and Plite React
  1063. The combined e2e proof-file fingerprint is
  `f9db907d98091890fdc4d0d7b750e0b2ccc56d0f0d9ea1909bd5688aadb30d6f`.
- Scoped package typechecks passed; `pnpm --filter www typecheck` passed after
  the explicit cleanup correction; Core and DnD barrel checks passed.
- Benchmark plan validation with `--complete` and its Autogoal check passed.
- GitHub comments:
  - #5091: https://github.com/udecode/plate/issues/5091#issuecomment-5351832703
  - #5065: https://github.com/udecode/plate/issues/5065#issuecomment-5351832902
  - #5088: https://github.com/udecode/plate/issues/5088#issuecomment-5351833076
  - #5064: https://github.com/udecode/plate/issues/5064#issuecomment-5351833259

Final handoff:
- executable cases: four exact e2e tests plus package behavior contracts
- status: all four locally completed, uncommitted, and unpushed
- public state: all four issues remain open; no `completed` label was added
- source/generated sync: package barrels and registry changelog generation pass;
  no agent source changed in this packet
- reviews: lint and Autoreview intentionally omitted by user instruction
- next owner: integrate the current checkout, then replay the exact four-case
  command against the final pushed ref before applying `completed`

Timeline:
- 2026-08-20: live contradictions selected; exact red cases reproduced.
- 2026-08-20: Table and Selection owners repaired; #5091 revalidated.
- 2026-08-20: #5064 Benchmark isolated and removed eager per-block DnD cost.
- 2026-08-20: final source restart, 20/20 browser stability, package/type/barrel
  proof, benchmark closure, fingerprints, and four comments completed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | local Regression closure complete |
| Where am I going? | pushed-ref integration and exact replay |
| What is the goal? | close the four reporter-visible regressions at durable owners |
| What have I learned? | proxy greens caused the earlier false claims; exact native/pixel/timing oracles are required |
| What have I done? | repaired all four owners, proved them together, and posted local-only updates |

Open risks:
- The checkout is broad, dirty, uncommitted, and unpushed. The issue comments are
  candidate reports only; exact pushed-ref fingerprints do not exist yet.
- Local Chromium is the browser claim boundary. No cross-browser, integration,
  release, or shipped-state claim is made.
