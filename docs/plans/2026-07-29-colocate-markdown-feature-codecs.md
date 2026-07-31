# Colocate Markdown feature codecs

Objective:
Colocate Markdown node conversion with feature plugins without creating
feature-package dependencies on `@platejs/markdown`; delete the central feature
registry and parallel plugin-state registration path, then close package, docs,
browser, type, release, and review proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-29-colocate-markdown-feature-codecs.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- browser

Mode:
- `standard` accepted-plan execution.

Completion threshold:
- Feature-owned Markdown codec declarations compile without any
  feature-package runtime dependency on `@platejs/markdown`.
- The central 48-rule `defaultRules` authority and
  `MarkdownPluginState.rules` registration path are absent.
- Current Markdown import/export behavior, operation-level filtering and any
  evidence-backed per-call override remain covered.
- Focused Core/Markdown/feature package tests and typechecks, docs parsing,
  browser proof, source audits, changesets, autoreview, and `check-complete`
  pass.

Verification surface:
- Source audits for `defaultRules`, plugin-state `rules`, feature-to-Markdown
  imports, exports, docs, and all codec declarations.
- Focused Core codec compiler/type tests, Markdown conversion tests, affected
  feature package tests/typechecks, lint, barrel generation when required, and
  package changesets.
- `pnpm --filter www build:source`, the owning Markdown docs route in Browser,
  console/network inspection, and final autoreview.

Constraints:
- User explicitly accepted execution with `ok go`.
- No public compatibility aliases or runtime shims.
- No feature package imports or runtime dependency on `@platejs/markdown`.
- Reuse root `codecs`; do not add a Markdown-specific root namespace, public
  mutable registry, `MdastKit`, or Lexical extension grammar.
- Preserve one document-scoped Markdown parser/stringifier and
  `editor.api.markdown`.
- Do not claim raw-device proof; this packet has no raw-device behavior job.

Boundaries:
- In scope: Core codec authoring/compiler types, Markdown compilation/runtime,
  every central default feature rule and its owning feature plugin/package,
  callers, exports, tests, docs, agent doctrine, and release artifacts.
- Source owners: `packages/core`, `packages/markdown`, affected feature
  packages, `content/docs/(plugins)/(serializing)`, and source rules under
  `.agents/rules`.
- Non-goals: importing Lexical APIs, changing Markdown syntax semantics,
  redesigning `editor.api.markdown`, mobile-device testing, or unrelated codec
  formats.
- Direct Plite boundary owners: N/A; this remains Plate plugin/codec
  architecture unless live compiler evidence proves a substrate gap.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if preserving feature-package independence and existing Markdown
  behavior requires an unresolved package cycle or public registry after three
  distinct compiler designs/prototypes fail, or the runnable browser/package
  environment remains unavailable after the repository recovery path.

Plate Plan state:
- status: done
- phase: complete
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted P1 plus the explicit dependency, deletion, API-shape, docs, and no-device constraints are copied above. |
| Active goal and plan verified | yes | Active goal points to this exact plan. |
| Current owners read | yes | Live Core codec compiler/types, Markdown plugin/conversion/rules/types/tests, package manifests, and accepted Lexical ledger were inspected in this turn; exact manifest follows before edits. |
| Best API target resolved | yes | `best-api` loaded; accepted target is feature-owned root `codecs` plus a private format compiler, with no new public grammar. |
| Mode and execution boundary resolved | yes | Standard one-shot execution authorized by `ok go`. |
| Docs pack selected | yes | Supporting serialization/conversion docs lane. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read completely. |
| Docs lane selected | yes | Serialization / conversion. |
| Target docs and nearest sibling docs read | yes | Markdown docs are the target; HTML serialization is the nearest lane baseline and will be re-read before writing. |
| Docs style doctrine read | yes | `docs-creator` loaded; current-state reference voice required. |
| Documented source owner identified | yes | Markdown API/runtime source plus feature plugin codec declarations. |
| Package/API pack selected | yes | Core/Markdown/feature package boundaries and public authoring types change. |
| Public surface or package boundary identified | yes | `defineCodecs`, MIME declarations, Markdown state/rules, and affected feature packages. |
| Release artifact path selected | yes | One `.changeset` per package with a user-visible delta from `main`; final list follows the actual diff. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read completely. |
| Barrel/export impact decision recorded | yes | Run `pnpm brl` if public codec types or exported files move/add; otherwise record N/A after diff. |
| Browser pack selected | yes | Package-facing Markdown docs/example behavior requires Browser proof. |
| Browser route / app surface identified | yes | Owning Markdown serialization docs route and its runnable example/demo if present. |
| Browser tool decision recorded | yes | Use Browser; no native Chrome/OS behavior is involved. |
| Console/network caveat policy recorded | yes | Inspect both; report unrelated pre-existing noise separately. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Focused suites, 20-package typechecks, strict Plite closure, and Browser proof pass. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final audits find 53 feature codec declarations, five intrinsics, zero central feature registries, and zero feature imports of `@platejs/markdown`. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Feature-owned root `codecs` plus the Core-owned Markdown authoring contract remains the accepted shape. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Multi-owner ordering, missing-feature behavior, mark composition, per-call overrides, docs, Browser, and release artifacts are covered. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | See Verification evidence. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff below is complete. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Codex autoreview accepted and fixed one P2 docs key; its later P1 was rejected by source tracing plus passing five-mark composition proof. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-29-colocate-markdown-feature-codecs.md` | Passed. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | English and Chinese Markdown docs match the exported codec contract, installed-feature behavior, and per-call options. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `/docs/markdown` renders its preview, navigation, API sections, architecture appendix, and ownership appendix. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Markdown plugin page retains kit/manual/API/example structure and documents codec authoring. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core registry and Markdown authoring exports, Markdown compiler, and feature manifests typecheck. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package types/runtime change across Core, Markdown, codec contract, and 17 feature packages. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Twenty unique patch changesets cover the 20 published packages; Core is patch and Plite/platejs are untouched. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | No registry-only product change. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Published package deltas require and have changesets. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Focused tests pass; all 20 modified packages typecheck; strict Plite package/contracts/browser suite passes. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed 56/56. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser loaded `/docs/markdown`; editing source Markdown produced the expected heading, strong mark, and link. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Route returned 200 twice and Browser reported zero warnings/errors. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser screenshot and DOM proof recorded; raw-device proof is intentionally outside scope. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Accepted ledger, live owners, doctrine, and constraints recorded | Execute |
| Decide | complete | Feature-owned root codecs plus private Markdown compiler accepted; forbidden dependency and public-registry shapes rejected | Execute |
| Execute | complete | Core collector, Markdown compiler, 53 feature declarations, hard cut, docs, doctrine, and changesets landed locally | Prove and hand off |
| Prove and hand off | complete | Focused proof, strict Plite closure, Browser, and autoreview resolved | Complete |

Decision brief:
- outcome: A feature plugin is the sole owner of its Markdown node conversion.
- chosen shape: Existing `codecs` declarations carry schema-bound
  `text/markdown` node handlers; Core stores generic MIME declarations and
  Markdown privately compiles them into one document codec.
- strongest rejected alternative: Feature packages import
  `@platejs/markdown` or register into a public mutable Markdown registry.
- consequence: Most conversion bodies move; the central authority,
  feature-switch wiring, and plugin-state registration channel disappear.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Feature Markdown conversion | 36 central rules in Markdown | Feature-owned `text/markdown` codec declarations | Feature packages/plugins | Schema and serialization evolve together | Move each rule and delete its central row | Round-trip parity and rule manifest | Package cycles or type leakage | move |
| Markdown document runtime | Parser/stringifier plus central feature registry | One document parser/stringifier compiling installed feature codecs | `@platejs/markdown` | Format orchestration remains one owner | Preserve API and operation behavior | Markdown tests and browser proof | Ordering/conflict drift | rearchitect |
| Codec authoring/compiler | Generic non-HTML declarations compile as host document codecs | MIME-specific private node-codec compiler path with inferred self/foreign targets | `@platejs/core` plus Markdown compiler registration | Avoid competing document codecs and MDAST types in Core | Add types/compiler hook without new root grammar | Positive and negative compile tests | Over-general public machinery | gate |
| Rules configuration | Central defaults plus mutable plugin-state and per-call overlays | Installed codecs are defaults; cut plugin-state registration; keep per-call override only with live consumer evidence | `@platejs/markdown` | One capability owner and one normal path | Sweep source/docs/tests before deletion | Stale-symbol audit and override tests | Removing a real advanced job | cut |
| Docs/API doctrine | `defaultRules` and `initialState.rules` taught as extension path | Feature codecs teach the extension path and current API only | Docs and source rules | Shipped ownership must be discoverable | Update EN/CN and authoring doctrine | MDX build, source audit, Browser | Docs ahead of source | rearchitect |
| Release surface | Published packages expose current rules/types | One changeset per user-visible package delta | Package owners | Honest release impact from `main` | Derive after implementation | Changeset audit | Overstating branch-only churn | gate |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Manifest and compiler prototype | Core + Markdown | Enumerate every rule/consumer/package edge; prove a private compiler without feature-to-Markdown imports | Accepted target | Inference and dependency prototype passes | Focused type tests and dependency audit |
| 2. Feature migration | Feature packages | Move all 36 conversion owners and required structural helpers | Slice 1 green | No central feature rule remains | Rule manifest and round-trip tests |
| 3. Hard cut | Markdown | Delete central registry and plugin-state path; resolve per-call override from evidence | Slice 2 green | No parallel default registration path | Stale-symbol audit and Markdown suite |
| 4. Adoption | Docs, exports, source doctrine, changesets | Update all callers/docs/tests/barrels/rules | Runtime green | Public teaching and release surfaces match source | Docs/type/build/barrel/changeset checks |
| 5. Closure | Package/browser/review owners | Focused then strict proof, Browser, autoreview, plan check | Adoption complete | Zero accepted findings and all gates closed | Recorded commands/artifacts |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| No feature-to-Markdown dependency | Current feature manifests omit `@platejs/markdown`; accepted hard gate | Manifest/source audit reports zero imports or dependencies | passed |
| Feature codecs preserve behavior | Central rule manifest and existing tests identify current breadth | Round-trip/filter/order/conflict/mark-composition suites pass | passed |
| One document host codec remains | `MarkdownPlugin` owns document-scoped MIME codecs | Compiled runtime tests and source audit pass | passed |
| Public authoring inference is intact | `defineCodecs` is the accepted inference anchor | Self/foreign positive and negative type tests plus 20-package typecheck pass | passed |
| Docs and runtime agree | Markdown docs currently teach central rules | MDX build, source-backed audit, Browser route, and live edit pass | passed |

Conditional evidence:
- High-risk scenarios: duplicate MDAST owner precedence changes output; plugin
  order changes output; a missing feature plugin silently retains central
  behavior. Each gets focused proof.
- External research: accepted Lexical audit is sufficient; no refresh is
  needed because the decision is current-local implementation architecture.
- Issue/PR provenance: N/A; user-directed local architecture execution.
- Docs/registry/browser/release/behavior-law owners: docs, Browser, package
  changesets, codec compiler tests, and Markdown behavior tests apply; registry
  changelog does not.

Findings:
- Fifty-three feature node codecs are owned by their feature plugins; five
  language intrinsics remain in Markdown.
- The Core collector stores generic product-node codec declarations while the
  Markdown package privately owns MDAST compilation and execution.
- Feature packages depend only on the type-only codec contract and have no
  runtime dependency on `@platejs/markdown`.

Decisions and tradeoffs:
- Move conversion bodies instead of pretending they disappear; value comes
  from one feature owner and deletion of central wiring.
- Core may know generic MIME compiler contracts but must not import MDAST or
  Markdown-specific types.
- Reject the packet if it cannot meet the dependency and public-complexity
  gates; do not ship architectural cosplay.

Review fixes:
- Accepted P2: changed the code-block per-operation deserialize example from
  the mdast source key to the installed feature key in both docs pages and
  added direct runtime proof.
- Rejected P1: same-source span mark codecs do not short-circuit; the compiler
  chains `mark` decoders through `decode`, and the five-style span regression
  test passes with every mark preserved.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Root `pnpm lint:fix` traversed inherited audit artifacts with 218 unrelated findings | 1 | Check the owned codec packet directly | Targeted Biome check passes over 70 owned files. |
| Full www typecheck reached unrelated current-tree extension inference failures | 1 | Use docs source build, package integration, owning package typechecks, and Browser | Docs build and packet-owned proofs pass; the unrelated checkout failures remain outside this packet. |

Verification evidence:
- `bun test packages/core/src/lib/plugin/pluginAuthoringContext.spec.ts packages/markdown/src/lib`: 186 passed.
- Focused slow Markdown suites: 32 passed.
- www Markdown feature/serialization integration: 23 passed with 10 snapshots.
- Modified-package Turbo typecheck: 56 tasks across 20 packages passed.
- `pnpm --filter www build:source`: passed.
- `pnpm brl`: 56/56 passed.
- Targeted Biome: 70 files passed.
- `pnpm check:plite`: passed in 394.5s; Chromium 698 passed, 6 skipped,
  78 bounded batches.
- Browser `/docs/markdown`: rendered ownership docs and live Markdown
  conversion; zero console warnings/errors.
- Autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --prompt-file docs/plans/2026-07-29-colocate-markdown-feature-codecs.md --stream-engine-output`.
  One P2 was accepted and fixed; the remaining P1 was rejected with direct
  source and passing regression proof.

Final handoff prepared:
- Ownership and target API: feature plugins declare `text/markdown` node codecs
  through root `codecs`; Markdown compiles installed declarations privately.
- Public breaks and adoption: `MarkdownPluginState.rules` and central feature
  registries are cut; per-operation `rules` remains; all feature owners, docs,
  tests, exports, manifests, and changesets are adopted.
- Applicable runtime/package/docs/browser decisions: all complete; no native
  Chrome/OS or raw-device job applies.
- Proof and execution risks: packet-owned proof is green; inherited root lint
  and www extension inference failures are recorded separately above.
- Execution order and user attention: implementation is complete and requires
  no API decision.

Timeline:
- 2026-07-29T19:13:56.554Z Plate Plan created.
- 2026-07-29 Accepted-plan execution goal created; requirements, owners,
  decisions, slices, and proof gates materialized before product edits.
- 2026-07-29 Feature migration, hard cut, docs, release artifacts, strict
  package/browser proof, autoreview, and final Browser recheck completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Handoff |
| What is the goal? | Feature-owned Markdown codecs with no reverse dependency or parallel registry |
| What have I learned? | Generic declaration collection plus a format-owned compiler preserves package direction and composable mark decoding |
| What have I done? | Migrated every feature rule, deleted the central authority, updated docs/doctrine/releases, and closed proof |

Open risks:
- None in scope.

Non-blocking checkout caveats:
- Root lint still reports inherited editor-audit artifact debt outside this
  packet.
- Full www typecheck still reports unrelated current-tree extension inference
  failures; packet-owned docs, package integration, typechecks, and Browser
  proof pass.
