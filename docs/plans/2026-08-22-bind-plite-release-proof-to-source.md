# bind Plite release proof to source

Objective:
Bind Plite release proof to exact source and claim profiles; done when forged
proof is rejected, release wiring is claim-scoped, and package, doctrine, and
review gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-bind-plite-release-proof-to-source.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Mode:
- `standard`: the user accepted the source-backed item 3 repair and explicitly
  said to implement it. This plan is the execution ledger for that accepted
  direction, not a proposal awaiting another approval.

Completion threshold:
- A pre-fix public-API test proves receipt-free mobile and artifact-free soak
  claims are accepted. The final public surface cannot manufacture release
  evidence from caller-supplied booleans; raw receipts fail when any build
  commit differs from the required SHA; an explicit release claim profile has
  one manifest/verifier path, exact required lanes, artifact readback, and
  current-SHA validation; the artifact must come from a successful canonical
  manual Plite CI run in the same repository, commit, and run attempt; release
  tooling must download that exact artifact by API identity, verify its archive
  digest, and reject tracked or untracked publish bytes outside the declared
  commit; routine package publication remains independent of raw-device proof;
  focused, package, release-workflow, doctrine-sync,
  agent-native, P1 autoreview, and final goal checks pass with zero accepted
  actionable findings.

Verification surface:
- RED/GREEN public `@platejs/browser/core` release-proof tests.
- Focused raw-mobile receipt tests, manifest/verifier tests, release-command
  routing tests, and package public import/type smoke.
- `pnpm --filter @platejs/browser typecheck`, package tests, and relevant root
  release/workflow contract tests.
- `pnpm check:plite:dev` for the affected Plite graph.
- Source audit proving no public self-asserted release-evidence constructors,
  exact-SHA comparison, explicit package-only versus broad-claim routing, and
  source/generated doctrine parity.
- Scoped lint, `git diff --check`, agent-native review, P1 `autoreview`, and
  `check-complete`.

Constraints:
- User authorization is implementation-only in the current checkout: do not
  commit, push, publish, trigger workflows, or mutate remote release state.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Gate claims at their actual width. Routine npm package publication must not
  require raw physical-device proof; an explicit broad Plite release-readiness
  profile must fail closed without its named evidence.
- Evidence must be produced or structurally verified by the owning runner. A
  caller-provided `passed: true`, transport label, or nonempty commit is not
  release evidence.
- Preserve the existing direct-versus-proxy transport law, artifact digest
  readback, package tarball/install proof, and unrelated checkout work.

Boundaries:
- In scope: `@platejs/browser` proof types/exports/tests/docs, raw-mobile and
  persistent-soak runners, one internal release-proof manifest verifier,
  package/release command routing and workflow contract tests, the smallest
  release workflow input/wiring needed for an explicit claim profile, Plite
  Vision/claim docs, Best API source doctrine/generated mirror, one changeset,
  and this plan.
- Source owners: `packages/browser/src/core/**` owns reusable proof structures;
  `tooling/plite/donor/proof/**` owns executable device/soak evidence;
  `tooling/scripts/release-packages.mjs`, root scripts, and
  `.github/workflows/release.yml` own publication routing;
  `docs/vision/plite.md` and the absolute claim own claim width;
  `.agents/rules/best-api*` owns reusable API truthfulness.
- Non-goals: creating or claiming actual physical-device, persistent-profile,
  performance, or remote CI evidence; changing editor runtime behavior;
  making raw-device proof mandatory for every package publish; publishing any
  package; altering beta/latest branch state; adding cryptographic signing or
  a hosted evidence service; fixing unrelated release/package work.
- Direct Plate/collaboration adoption owners: N/A. This changes release proof
  infrastructure and `@platejs/browser`, not editor/Plate/Yjs runtime behavior.

Output budget strategy:
- Read named owners first; use `rg -l`/counts before bodies; exclude generated
  builds, dependency trees, test-results, `.tmp`, and historical plans unless
  a named proof requires one; cap test output and use final summaries.

Blocked condition:
- Stop only if the existing release workflow cannot express an explicit claim
  profile without a new remote credential/service or the real supported
  release policy contradicts the accepted package-only versus broad-claim
  distinction. Missing real devices is not a blocker because this task builds
  and tests the fail-closed gate without claiming device proof.

Plite Plan state:
- status: blocked
- phase: formal-review-cap
- next: wait for a user decision that changes the completion threshold or a genuinely material new implementation scope
- handoff: prepared-not-clean

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | The accepted feedback, scope, non-goals, claim-width law, proof surface, stop condition, deliverables, and final local-only handoff are copied above before implementation. |
| Active goal and plan verified | yes | No active goal existed; a new goal names this exact plan and binary threshold. |
| Current owners read | yes | Read live public proof API/tests/exports/docs, raw receipt validator/runner, soak runner, root release scripts, Plite CI/release workflows, Plite Vision, and the architecture claim. |
| Best API target resolved | yes | Best API review rejects public constructors that turn caller assertions into evidence; keep only truthful structural validators and one deep executable manifest gate. |
| Mode and execution boundary resolved | yes | Standard one-shot execution; user explicitly authorized the accepted item 3 repair; no remote mutation. |
| Docs pack selected | yes | Internal package reference, Plite claim policy, and Vision need current-state repair. |
| `docs-creator` loaded | yes | Read the source workflow, complete style reference, and Guide/System lane before changing `content/docs/(guides)/browser.mdx`. |
| Docs lane selected | yes | Guide/System for the public Browser page; package README plus internal spec/law docs retain their current owners. |
| Target docs and nearest sibling docs read | yes | Read `content/docs/(guides)/browser.mdx`, `packages/browser/README.md`, `docs/plite/absolute-architecture-release-claim.md`, `docs/plite/true-plite-rc-proof-ledger.md`, root Vision, and Plite Vision. |
| Docs style doctrine read | yes | Read `docs-creator` style-and-structure and the Guide/System lane; current-state voice, exact ownership, real imports, and source-backed claims apply. |
| Documented source owner identified | yes | Browser package owns proof API; Plite Vision/absolute claim own claim width; release scripts/workflow own publication enforcement. |
| Agent-native pack selected | yes | Best API doctrine must learn that public proof APIs verify provenance rather than manufacture evidence. |
| Agent-facing action surface identified | yes | Future Best API reviews must reject self-asserted pass flags presented as proof. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/best-api.mdc` and its smallest source reference if needed; regenerate `.agents/skills/best-api/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required at closeout after doctrine repair; load before running it. |
| Package/API pack selected | yes | Published `@platejs/browser/core` release-proof exports change. |
| Public surface or package boundary identified | yes | `@platejs/browser/core` public constructors/validator plus internal publication commands. |
| Release artifact path selected | yes | One `@platejs/browser` changeset relative to `main`; registry changelog N/A. |
| `changeset` skill loaded when `.changeset` is required | yes | Changeset skill read before implementation; user impact only, one package per file. |
| Barrel/export impact decision recorded | yes | Public exports will change; run `pnpm brl` if source export removal/addition changes generated barrels. |

Work Checklist:
- [x] First checkpoint complete: every explicit requirement from the accepted
  item 3 feedback is recorded as scope, non-goal, claim-width rule, stop
  condition, deliverable, verification gate, and final local-only handoff.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews are N/A because this repair adds
  no links, routes, anchors, demos, or preview names.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: `pnpm install` synced the generated Best API and
  release-lanes mirrors; exact source/mirror comparisons pass.
- [x] Agent-native pack: the final capability map passes with no accepted
  agent-native findings.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: the existing `@platejs/browser` changeset records the final package delta.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry source changes.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: there is a published package delta and a changeset.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: Browser package tests/typecheck, public package builds,
  affected Plite proof, and final contract proof are recorded below.
- [x] Package/API pack: `pnpm brl` passed with 57 tasks; the existing Browser
  changeset records the public hard cut.
- [ ] Completion threshold: a fresh P1 autoreview passes with zero accepted
  actionable findings. The unchanged-scope three-invocation cap is exhausted.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | FAILED: the required fresh P1 autoreview did not pass before the three-invocation cap. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Passed: final source audits, contract proof, docs proof, lint, diff, and workflow parsing use the current checkout. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Passed: the fake public proof builder is hard-cut and the remaining public validator accepts unknown input plus an exact commit. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | Passed within scope: provenance and package adoption are covered; Benchmark is N/A because no performance claim exists; browser docs rendering is explicitly unavailable due unrelated registry failures. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Passed: exact commands, counts, boundaries, and failures are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Passed: implementation is ready for a new-scope review, with no release or remote mutation claimed. |
| P1 autoreview | yes | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | FAILED: invocation 3 found two P1s. Both implementations are repaired and tested, but policy forbids invocation 4 on this unchanged scope, so this gate cannot be declared green. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-bind-plite-release-proof-to-source.md` | FAILED as designed: the checker reports the unchecked P1 completion-threshold item. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Passed: release profile, exact artifact acquisition, run-attempt binding, dirty-checkout rejection, and package-only independence match executable source. |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no link, route, anchor, demo, or preview name was added or changed. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed through `pnpm --filter www check:docs`, which includes API manifest, MDX source, and docs parity checks. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: the Browser guide is a system guide, not a plugin page. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Passed: `pnpm install` regenerated mirrors and exact source/mirror comparisons pass. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Passed: release-lanes routes both package-only and broad claims to the exact verifier contract. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Passed: maintainer selection, release-lanes routing, source doctrine, generated mirror, CLI, and tests form one reachable capability path. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Passed: stale aggregate exports are absent; raw receipt validation remains public; aggregate policy remains internal release tooling. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published `@platejs/browser` API/type behavior plus internal release tooling and doctrine. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Passed: the existing patch changeset covers only `@platejs/browser`; no forbidden package receives a minor bump. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry source changes belong to this repair. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: Browser users see a public API hard cut, covered by the existing package changeset. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Passed: Browser package tests/typecheck, public package builds/types, affected Plite proof, and final contract proof are green. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | Passed: `pnpm brl` completed 57 tasks after the public export hard cut. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live owners, `main` delta, user scope, and proof debt traced | Decide |
| Decide | completed | Best API hard-cut and claim-scoped manifest target recorded | Prove and hand off |
| Prove and hand off | blocked | Both final provenance blockers are repaired and all executable gates are green; formal P1 review remains red because the invocation cap is exhausted | User input must change the threshold, or genuinely material new implementation work must create a different review scope |

Decision brief:
- outcome: Make broad Plite release claims mechanically fail closed on stale,
  incomplete, or unreadable evidence without taxing routine package publishes.
- chosen shape: Hard-cut the branch-only self-asserted public release-artifact
  API; strengthen raw-mobile structural validation around unknown input plus an
  exact expected commit; add one internal `release-ready` manifest verifier;
  invoke it from latest and beta publication only when the explicit profile is
  selected; keep package tarball/install proof under a distinct command name.
- strongest rejected alternative: Keep `passed: true` constructors and merely
  add optional SHA fields. Optional provenance leaves the lie intact and lets
  callers manufacture green proof.
- consequence: `@platejs/browser/core` publishes a smaller truthful surface;
  broad release readiness needs a complete artifact bundle, while ordinary
  npm publication continues with package proof only.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public browser release helpers | Constructors accept caller-supplied `passed`, transport, profile, and replayability fields; validators accept receipt-free claims | Delete `release-proof.ts` and its root exports; keep transport classification and specific receipt validators | `@platejs/browser/core` | No production consumer exists and the package is absent on `main`; the surface manufactures assertions rather than verifies evidence | Update two internal proof runners, package export/docs/type/import contracts, and the existing package changeset; no compatibility layer | Pre-fix executable returns `ok: true`; final export audit and package tests | Branch tests/docs depend on stale names | cut |
| Raw mobile receipt API | Typed bundle input and any nonempty build commit qualify structurally | One object call accepts `bundle: unknown` plus mandatory 40-character `expectedCommit`; every receipt must match | `raw-mobile-proof.ts` | External JSON must be decoded honestly and cannot float across commits | Update runner and tests; public package is not on `main` | Mismatch, malformed unknown, full matrix, proxy, digest/readback tests | Decoder rewrite could weaken existing matrix checks | rearchitect |
| Broad claim manifest | No authoritative current-SHA aggregate exists | One internal schema-v1 `release-ready` manifest with an exact required-lane set, per-lane commit/time/command/environment, safe relative artifact pointers, SHA-256 readback, and expected-SHA verification | `tooling/scripts/check-plite-release-proof.mjs` | Claim aggregation is release tooling, not a public editor/test-harness primitive | Root command, workflow contract tests, package/release docs | CLI red/green fixtures for missing lanes, stale SHA, traversal, missing/tampered artifacts, and success | Generic receipts cannot prove execution without trusted workflow provenance | rearchitect |
| Package publication | `plite:release:artifacts` means packed package/install proof but sounds like behavior evidence; latest/beta never consume broad proof | Rename to `plite:release:packages`; run `plite:release:proof` after package proof and before publish; blank profile is explicitly package-only | root scripts and `release-packages.mjs` | Preserve ordinary release speed and claim width while making opt-in broad claims fail closed | Update scripts, workflow tests, agent-start docs, release workflow env/download path | Latest/beta plan tests and root release-workflow tests | Accidental global profile selection could block releases | rename |
| GitHub release workflow input | No broad claim profile or artifact acquisition | When repository release input selects `release-ready`, pass only the selected producer run ID, exact `github.sha`, and job token; the CLI resolves one unexpired `plite-release-proof` artifact from that run, downloads it by API ID, verifies its archive digest and run attempt, and rejects dirty source; otherwise skip behavioral proof | `.github/workflows/release.yml` and `tooling/scripts/check-plite-release-proof.mjs` | Centralizing acquisition in the CLI covers direct and workflow release paths; existing CI cannot create raw-device evidence, so the broad claim remains unavailable until a canonical producer exists | Workflow source, CLI, release scripts, docs, and contract tests; no remote run in this task | YAML/source contracts plus download, digest, archive-safety, run-attempt, and dirty-checkout fixtures | Misconfigured or stale producer input fails the release deliberately | gate |
| Durable API/release doctrine | Truthful API rules do not explicitly reject self-asserted evidence | Public proof APIs validate unknown provenance-bearing input; release policy separates package publication from broad claims | Best API and Plite Vision/claim docs | Prevent the same fake-proof abstraction from returning | Regenerate Best API mirrors and audit release-lanes teaching | Source/mirror parity and agent-native review | Overgeneralization beyond proof APIs | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Raw receipt truth | Browser core | New expected-commit/unknown-input call shape and hard-cut fake aggregate API | Pre-fix receipt-free claim observed green | Raw mismatch and malformed input fail; full exact matrix passes | Focused Bun core tests |
| 2. Artifact manifest | Release tooling | Internal schema, safe readback, required profile lanes, CLI | Raw owner settled | Valid complete bundle passes; stale/incomplete/tampered/traversal bundles fail | Node unit/CLI tests |
| 3. Claim-scoped publication | Release scripts/workflow | Rename package proof, invoke the optional claim gate before publish, and let one CLI resolve/download the exact cross-run artifact only when selected | Manifest CLI green | Latest/beta/package-only/release-ready routing, exact artifact identity/digest, run attempt, and clean-source contracts pass | `release-workflow.test.mjs` plus verifier tests |
| 4. Adoption and doctrine | Browser docs/tests, Plite docs, agent rules, changeset | Remove stale public names, document final paths, sync generated owners | Runtime/tooling final | Zero stale names outside historical plans; package/public proof and mirrors pass | Package tests/typecheck, `pnpm install`, source audits |
| 5. Closure | Plite graph and review | Lint, affected graph, agent-native, P1 autoreview, goal checker | All code/doc slices green | Zero actionable findings and complete ledger | Named closeout gates |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Receipt-free mobile/soak objects are not release evidence | Current public API executed both without receipt/artifact and returned `ok: true` | Remove API; exact public export/package audits | red observed before fix; final hard cut green |
| Raw device proof belongs to the reviewed commit | Raw receipt has `build.commit`, but current validator checks only nonempty | Four focused raw-mobile tests cover exact/mismatched SHA, unknown input, full matrix, proxy, duplicate, and divergence | green |
| Release-ready manifests are complete and tamper-evident | Current release path has no manifest consumer | Eight manifest CLI tests cover required lanes, exact SHA, device/profile identity, traversal/symlink escape, missing/tampered artifacts, and success | green |
| Routine npm publication does not require raw devices | Current doctrine separates publish/raw lanes | Package-only env test and 21 release-workflow contract tests | green |
| Explicit broad claim cannot publish without current proof | Current release command never consumes browser evidence | Release-ready missing/stale/failed/tampered tests plus exact artifact API identity/download/digest, run-attempt, clean-checkout, and workflow current-SHA contracts | green mechanically; no live producer artifact exists |

Conditional evidence:
- High-risk scenarios: (1) stale artifact bundle is relabeled for a new SHA;
  (2) a self-asserted mobile/soak object bypasses receipts; (3) a routine beta
  release is accidentally blocked by unavailable hardware; (4) artifact path
  traversal or symlink escape reads outside the bundle; (5) a partial browser
  matrix is called release-ready. All receive focused fail-closed proof.
- External research: N/A. Current repository policy and executable owners fully
  determine the target.
- Issue/PR provenance: N/A. Direct user request against the current checkout;
  no public issue or PR.
- Browser/Benchmark/docs/release/behavior-law owners: No browser or benchmark
  execution claim is made. Browser/device/perf lane names are manifest policy;
  package docs, Plite claim docs, release scripts/workflow, and Best API doctrine
  are active owners.

Findings:
- `@platejs/browser` and both release-proof source files are absent from `main`;
  the clean branch target has no external compatibility obligation.
- Only two executable internal runners use the fake aggregate helpers; no
  production editor/package consumer exists.
- The raw receipt owner already records artifact digests, real-device identity,
  and build commit, but validates only commit presence.
- Routine latest/beta publishing validates package tarballs/install consumers;
  no behavioral proof manifest is consumed.
- Existing doctrine explicitly keeps package publication, private-alpha
  closure, and raw-device claims separate. The new gate must preserve that law.
- A historical Plite research packet already records the persistent-soak public
  release helper as a hard-cut target, reinforcing deletion rather than repair.

Decisions and tradeoffs:
- Use one internal manifest verifier instead of a public registry/builder. No
  external consumer justifies public CI policy machinery.
- Require one exact broad `release-ready` profile. Do not add a generic profile
  DSL or infer proof width from changed files.
- Artifact hashes and exact commit binding prevent accidental reuse/tampering;
  a successful canonical GitHub Actions producer run is the provenance
  boundary. The canonical workflow does not yet emit this bundle, so broad
  approval stays unavailable rather than accepting caller-authored evidence.
  This task does not claim cryptographic attestation.
- Keep raw-mobile structural validation public because downstream device
  runners have a real job; keep filesystem readback in executable tooling.
- Cross-run GitHub artifact download is conditional external input. Blank
  profile means package-only and does not touch device proof.

Review fixes:
- Self-review found the first manifest draft verified lane hashes and commit but
  did not require the raw-device and persistent-profile identity named by the
  architecture review. The schema and fixtures now fail closed without both.
- Agent-native review found that repository variables would remain armed across
  pushes without an explicit lifecycle. `release-lanes` now requires producer
  preflight, explicit broad-claim authorization, post-run deletion, and
  readback.
- Final source review moved cross-run artifact access to the job-scoped
  `github.token` with `actions: read` and made blank explicit mobile SHA input
  fall back to `GITHUB_SHA` instead of shadowing it.
- P1 autoreview rejected the first aggregate gate because every lane result and
  SHA still came from the caller-controlled manifest. The accepted fix resolves
  the selected run through the GitHub API, requires a successful manual
  `.github/workflows/plite-ci.yml` run from the same repository and exact SHA,
  binds the manifest to that run, and records that the broad profile remains
  unavailable until this canonical workflow emits lane-owned output.
- P1 autoreview pass two found that direct `pnpm release` and beta publication
  still bypassed the workflow-only API lookup. The CLI now performs the live
  GitHub lookup itself, pins authority to `udecode/plate` and the manual Plite
  CI workflow, derives the actual checkout SHA with Git, and refuses broad mode
  without an Actions-read token. The workflow delegates the same checks to this
  CLI instead of maintaining a second preflight implementation.
- P1 autoreview invocation 3 found that a caller-local manifest could still be
  unrelated to the validated producer run. The CLI no longer accepts a
  manifest path or environment override. It resolves exactly one unexpired
  `plite-release-proof` artifact from the validated run, downloads it by API
  artifact ID, verifies GitHub's archive SHA-256 digest, rejects unsafe ZIP
  entries, and validates the extracted root manifest against the live run ID,
  commit, and run attempt.
- P1 autoreview invocation 3 also found that `HEAD` did not describe dirty
  publish bytes. Broad mode now compares the declared commit to `HEAD` and
  rejects any tracked or untracked output from
  `git status --porcelain=v1 --untracked-files=all`. Package-only publication
  remains independent.
- Final self-review bound the manifest to `run_attempt` as well as run ID. A
  successful rerun cannot authorize an artifact retained from an older attempt
  with the same run ID.
- Final agent-native review passed. Maintainer broad-release selection reaches
  release-lanes, source doctrine, its generated mirror, the central CLI, and
  focused contracts; package-only publication reaches only package proof.

P1 autoreview scope baseline:
- original request: implement the accepted item 3 repair, keeping publication
  gated on authoritative current-SHA proof artifacts.
- violated invariant: self-asserted pass/transport/source labels and historical
  or missing artifacts cannot authorize a broad release claim.
- target: current uncommitted work on branch `next`, based at
  `ea82e578400db911a882f7f6b1d685a2059af22f`.
- intended behavior: package-only publication keeps its packed-install proof;
  an explicitly selected `release-ready` claim fails closed unless every named
  lane, environment, result, artifact digest, device/profile identity, and
  source commit verifies.
- owner boundary: Browser core owns raw receipt structure; release scripts and
  workflow own aggregate policy and artifact acquisition; Plite Vision and
  release doctrine own claim width.
- sibling/public/security contracts: public Browser exports and type smoke,
  latest/beta release ordering, cross-run artifact permissions, path/symlink
  containment, source/generated doctrine parity, and package changeset.
- measured task bundle: one deleted public aggregate module/test and stale soak
  helper; one strengthened public raw validator; one internal verifier/test;
  release workflow/script/test wiring; package export/type/docs adoption; one
  changeset; doctrine source/mirrors; this plan. Other uncommitted Element,
  layout, Oxlint, registry, and barrel work is unrelated checkout drift.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| One `apply_patch` attempted delete/add of the same file in one patch | 1 | Split deletion and addition into separate patches | Resolved; no intermediate file retained. |
| Targeted Ultracite check rejected `index++` in the new verifier | 1 | Use the repository-preferred explicit increment | Resolved; focused formatting/lint check passes. |
| Docs source check found the API reference manifest stale against the current checkout | 1 | Regenerate through the owning `www api-reference` command, then rerun docs checks | Resolved; API manifest and docs source parity pass. |
| Browser dev route compiled a stale generated registry that imports dozens of absent files and client pages exporting metadata | 2 | Try the supported Turbopack path, then the supported Webpack path and inspect the Browser error surface | Unrelated checkout blocker confirmed; no registry edits made and no browser-rendered docs claim recorded. |
| A broad transplant-ledger diagnostic reported over 1,800 missing historical destinations | 1 | Revert the exploratory retirement-policy edits and keep the historical ledger outside this task | Resolved; the five probed transplant files have no retained diff. |
| YAML validation used one unavailable root Node module, then an unsupported Ruby keyword form | 2 | Use the installed Ruby parser with the runtime-compatible positional call | Resolved; `.github/workflows/release.yml` parses successfully. |
| The first final goal-check run also treated “changeset is required” as unresolved evidence | 1 | State the completed artifact result without the checker’s reserved open-state wording | Resolved; the rerun reports only the intentionally unchecked P1 threshold. |
| A plan-only Ultracite command matched no supported target files | 1 | Use `git diff --check` for the Markdown plan and retain the earlier scoped code lint result | Resolved; diff whitespace validation passes and no code changed during the blocker audit. |

Verification evidence:
- RED: the pre-fix raw-mobile mixed-commit test returned `ok: true`; expected
  false.
- RED: the release-proof CLI test failed because the verifier did not exist.
- GREEN: `bun test packages/browser/test/core/raw-mobile-proof.test.ts` — 4
  passed, 0 failed.
- GREEN: `node --test tooling/scripts/check-plite-release-proof.test.mjs` — 8
  original manifest tests passed, 0 failed.
- GREEN: combined manifest/producer and release-workflow suite — 39 passed, 0
  failed, including canonical workflow/repository/event/conclusion/SHA/run-
  attempt binding, exact artifact selection/download/digest, archive safety,
  caller-local manifest rejection, and dirty-checkout rejection.
- GREEN: `bun test packages/browser/test/core` — 105 passed, 0 failed.
- GREEN: `pnpm --filter @platejs/browser test` — 105 core and 11 DOM tests
  passed.
- GREEN: `pnpm --filter @platejs/browser typecheck`.
- GREEN: `pnpm plite:public-types` — 13 package builds and public type smoke
  passed.
- GREEN: `pnpm --filter www check:docs` — API manifest, MDX source, and docs
  parity passed after owner-generated refresh.
- GREEN: `pnpm check:plite:dev` — 54-package/app affected typecheck, package
  tests, Browser core tests, contracts, public types, and 3-row Chromium smoke
  passed in 109.756 seconds before the final tooling-only run-attempt hardening;
  the final focused and contract suites cover that hardening.
- GREEN: targeted `pnpm exec ultracite check`, `git diff --check`, and Ruby
  parse of `.github/workflows/release.yml`.
- GREEN: `pnpm check:plite:contracts` — 158 Node contracts, 74 Bun contracts,
  44 benchmark targets, and 13 public package builds passed; the new producer
  acquisition and run-attempt tests are part of this fresh durable gate.
- GREEN: `pnpm brl` — 57 tasks passed after the public export hard cut.
- GREEN: exact Best API/release-lanes source/generated mirror comparisons pass.
- GREEN: final agent-native capability-map review passed with no accepted
  findings.
- BLOCKED (unrelated): Browser `/docs/browser` cannot compile because the
  current generated registry imports absent editor/UI/hook files and client
  registry pages export server-only metadata. No route-rendering proof is
  claimed.
- FIXED AFTER REVIEW: both invocation-3 P1 findings have focused and contract
  proof: exact producer-artifact acquisition replaces caller-local input, and
  broad mode rejects tracked or untracked publish bytes.
- REVIEW NOT CLEAN: repository policy permits at most three P1 autoreview
  invocations for one unchanged scope. Invocation 3 produced those two P1s, so
  their repair cannot receive the required fresh formal review without a new
  scope or an explicit policy change.
- GOAL CHECK FAILED: `check-complete.mjs` reports the unchecked P1 completion
  threshold. This is the honest result, not a tooling defect.

Final handoff prepared:
- Ownership and target API/runtime: Browser core owns exact-commit raw receipt
  validation; release tooling owns aggregate proof and producer provenance.
- Public breaks and Plate/collaboration adoption: fake aggregate Browser exports
  are hard-cut; public raw-mobile callers pass unknown bundle plus expected SHA;
  Plate/collaboration adoption is N/A.
- Applicable browser/Benchmark/docs/provenance decisions: docs and package proof
  pass; docs Browser rendering is blocked by unrelated registry state; no real
  benchmark, raw-device, soak, or release-ready claim exists.
- Proof and execution risks: both P1 implementations are repaired; formal P1
  review remains failed because the third and final allowed invocation found
  them and no fourth invocation is permitted.
- Execution order and user attention: preserve this implementation and its
  green executable evidence, keep the goal active/not-clean, and obtain a
  permitted new-scope review or explicitly change the review requirement. Do
  not publish a broad claim until canonical Plite CI emits the bundle and a
  real run passes the gate.

Timeline:
- 2026-08-22T23:01:22.529Z Plite Plan created.
- 2026-08-23T00:38:59Z Third consecutive goal turn confirmed the same
  terminal blocker: invocation four is prohibited, renaming the unchanged scope
  is prohibited, and removing the review gate would change the requested done
  state. The goal is blocked rather than falsely completed.

Blocked audit:
- Repetition: the unchanged-scope review cap blocked the original closure turn,
  the provenance-fix continuation, and this current-state audit.
- Autonomous paths exhausted: both P1 implementations are fixed and verified;
  repository policy forbids another autoreview invocation and forbids renaming
  the same scope to reset the count.
- Unsafe alternatives rejected: removing the review gate would redefine the
  objective; adding unrelated code merely to manufacture a new scope would be
  scope expansion.
- Needed to continue: the user must explicitly change the completion threshold,
  or request genuinely material new implementation work that creates a distinct
  review scope for substantive reasons.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation and executable verification complete; goal blocked on the formal review cap |
| Where am I going? | Await a user threshold decision or genuinely material new scope; do not claim closure |
| What is the goal? | Make broad Plite release claims exact-SHA and artifact-backed without burdening package-only publication |
| What have I learned? | The public aggregate API is branch-only and unused; the real reusable owner is raw receipts plus internal release tooling |
| What have I done? | Hard-cut fake public proof builders; bound raw receipts to exact SHA; bound broad proof to one producer run, attempt, exact downloaded artifact, archive digest, and clean checkout; repaired docs/doctrine; passed executable gates |

Open risks:
- Workflow artifact production remains external to this change. The verifier
  fails closed when the selected profile cannot supply its bundle; no real
  release-ready claim is made locally.
- Exact GitHub artifact acquisition is covered by boundary mocks and the live
  API schema, not by a real canonical producer artifact because current Plite
  CI does not emit the bundle.
- Formal P1 autoreview remains red. The two findings are fixed and tested, but
  the unchanged-scope three-invocation cap forbids the review required to claim
  clean closure.
