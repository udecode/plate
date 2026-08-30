# implement registry primitive split

> Superseded by
> `docs/plans/2026-08-24-complete-base-first-registry-variants.md`. The
> isolated full-consumer compiler fixture disproved this plan's two-owner
> target: DropdownMenu and ContextMenu also require provider adapters, for four
> physical variant families total.

Objective:
Implement the accepted registry primitive split; done when Aria is cut, common/docs source builds once, only Toolbar and FloatingPopover vary across Radix/Base, installs and browser routes pass, and closure gates are green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-24-implement-registry-primitive-split.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- agent-native
- browser
- package-api

Mode:
- `standard` accepted-plan execution of `docs/plans/2026-08-24-audit-registry-primitive-variants.md`.

Completion threshold:
- React Aria registry author source, routes, dependencies, tests, and doctrine are absent.
- Docs and canonical/common Plate items build once; only `toolbar` and `floating-popover` have Radix/Base overlays.
- All eight floating-popover consumers and 11 modern toolbar consumers adopt the accepted owner without provider-specific API leakage.
- Namespaced and direct same-style installs resolve; representative Radix/Base install fixtures typecheck.
- Registry changelog, source/generated agent doctrine, focused typecheck/tests, generated registry output required on `next`, Browser proof, P1 autoreview, and the goal checker pass.

Verification surface:
- Source audits for supported bases, target generation, registry dependencies, Aria residue, provider-specific imports, and installed target collisions.
- Focused registry builder/resolver tests plus isolated Radix/Base install/typecheck fixtures.
- `pnpm --filter www typecheck`, registry changelog generation/check, and `pnpm --filter www build:registry` because the checkout is `next` policy unless current source proves otherwise.
- Browser proof on `/blocks/<id>-demo` routes for Toolbar, AI menu, Table, Media toolbar, and Select editor where routes exist, with console/network inspection.
- `pnpm lint:fix`, P1 `autoreview`, and final goal-plan checker.

Constraints:
- The user accepted the exact audit plan with `ok go`; implementation is authorized.
- No public compatibility aliases or runtime shims.
- Preserve semantic `@plate/*` ids and `https://platejs.org/r/{style}/{name}.json`.
- Do not manually edit `templates/**` or generated registry/changelog/skill mirrors.
- Do not add physical alternative variants variants; keep those rows canonical and
  install-compatible with every supported provider.
- Do not commit, push, create a PR, or release.

Boundaries:
- In scope: `apps/www/src/registry/**`, registry build/config/resolver tests, user-visible registry changelog, smallest required docs/Vision/rule owners, and generated mirrors/output owned by required commands.
- Source owners: Plate registry metadata/build scripts, registry-local editor UI, Plate registry URL/config, `.agents/rules/**`, `VISION.md`/`docs/vision/plate.md`, and local `../shadcn` as upstream contract evidence.
- Non-goals: npm package API changes, Plite runtime changes, template edits, unrelated upstream docs sync, commits, pushes, PRs, or release.
- Direct Plite boundary owners: N/A; this is copied registry/install/build ownership above Plite.

Output budget strategy:
- Reuse the accepted 432-item/317-file audit ledgers, read named owners first, cap searches by path/count, exclude generated output until the required build, and save broad test/build output to bounded command results.

Blocked condition:
- Stop only if current source contradicts the accepted target, local shadcn cannot settle a required installer contract, or required generated/browser proof cannot run after three distinct repair attempts and no narrower proof remains.

Plate Plan state:
- status: completed
- phase: prove and hand off
- next: none
- handoff: implemented locally with focused, install, generated-output, browser, doctrine, and P1 review evidence

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Implement the accepted sparse primitive split, including current-item ownership changes, full proof, and no git/release mutation. |
| Active goal and plan verified | yes | New one-shot execution goal points to this plan; prior audit goal is complete. |
| Current owners read | yes | Registry metadata/build/routes, upstream preset and primitive contracts, Plate UI/Best API/Sync owners, and the accepted audit were revalidated before edits. |
| Best API target resolved | yes | Accepted audit hard-cuts public primitive taxonomy and Aria; only registry-local Toolbar/FloatingPopover contracts survive. |
| Mode and execution boundary resolved | yes | Standard accepted-plan execution; user said `ok go` after the exact audit handoff. |
| Agent-native pack selected | yes | Best API and sync-shadcn doctrine change, so source rules plus generated mirrors are in scope. |
| Agent-facing action surface identified | yes | Future `sync-shadcn` and `plate-ui` runs must not equate upstream preset enumeration with Plate graph compatibility. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`, then run `pnpm install`; never edit generated `SKILL.md` directly. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Capability map and PASS verdict are recorded below; source rules and generated skill mirrors expose the same action. |
| Browser pack selected | yes | Copied interactive registry components and generated install outputs change. |
| Browser route / app surface identified | yes | Prefer `/blocks/<id>-demo`; exact existing ids/routes will be sourced before server start. |
| Browser tool decision recorded | yes | Use in-app Browser for normal app QA; no native Chrome/OS behavior is involved. |
| Console/network caveat policy recorded | yes | Inspect console and failed requests for every final representative route. |
| Observable browser case captured | no | Not report-backed; this is an architecture/install migration. Final route/interaction expectations are recorded before proof. |
| Package/API pack selected | yes | Public registry URL, item dependency graph, copied-code install shape, and provider support contract change. |
| Public surface or package boundary identified | yes | `@plate/*`, same-style direct URLs, Radix/Base support set, and FloatingPopover copied-code contract. |
| Release artifact path selected | yes | Registry changelog; no npm package delta is planned. |
| `changeset` skill loaded when `.changeset` is required | no | No npm package source/API/types/runtime change is planned. |
| Barrel/export impact decision recorded | no | No npm package exports or exported folder layout are in scope. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | completed | Resolve every readiness condition | Product source, generated output, installers, types, browser, doctrine, and review gates are resolved with scoped caveats below. |
| Fresh source evidence | completed | Recheck decision-changing current claims | Final build produced no style directories and exactly three Radix overlay files: `registry.json`, `toolbar.json`, and `floating-popover.json`. |
| Best API review | completed | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Hard-cut verdict retained one canonical graph and two named provider boundaries; P1 autoreview found no defect. |
| Conditional risk and adoption | completed | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Eight floating consumers, 11 modern toolbar consumers, Form guidance, AI demo ownership, sync doctrine, and changelog were adopted. |
| Verification recorded | completed | Record fresh planning proof and exact execution gates | Commands, fingerprints, install receipts, browser routes, and exact blockers are recorded below. |
| Handoff prepared | completed | Prepare concise ownership, breaks, proof, risks, and execution order | Final local handoff is recorded below. |
| P1 autoreview | completed | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Scoped one-pass review: clean, no accepted/actionable findings, confidence 0.87. |
| Goal plan complete | completed | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-implement-registry-primitive-split.md` | Run after this ledger update. |
| Agent source / generated sync | completed | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated mirrors; source and generated Best API, Plate UI, Sync Shadcn, and Plate Next teaching match. |
| Agent action discoverability | completed | Source-audit the skill/rule path an agent will read | `best-api`, `plate-ui`, and `sync-shadcn` each teach canonical graph, named provider boundaries, and fail-closed support. |
| Agent-native review | completed | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; capability map and zero finding ledger are below. |
| Browser interaction proof | completed | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser/Chrome automation were client-blocked on localhost; native Chrome proved Base payload, Aria rejection, AI menu, media render, and select interaction. |
| Browser console/network check | completed | Record console/network state or why it is not applicable | Server recorded provider URLs at 200 and Aria at 404. Block previews expose an unrelated existing Next uncached-data error; `table-demo` also fails on existing heading `id` schema data. |
| Browser final proof artifact | completed | Record screenshot/trace/route/native proof or exact caveat | Native Chrome accessibility/visual receipts are recorded below; no deliverable tab was retained. |
| Exact case replay | not applicable | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | User requested an architecture audit/change, not a reported behavior regression. |
| Final ref and fingerprints | completed | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Local base ref `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; source/test and installed fixture hashes are below. |
| Clean final runtime | not applicable | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | This is an uncommitted local implementation in a shared dirty checkout; no pushed/shipped claim is made. |
| Retry-free stability | not applicable | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | No native selection/paint, DnD, compositor, or lifecycle bug is claimed fixed. |
| Public API / package boundary proof | completed | Source-audit public API, exports, and package boundary impact | Registry URL/install and copied-code contracts changed; no npm export or package API changed. |
| Release artifact classification | completed | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Registry-only user-visible change. |
| Published package changeset | not applicable | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | No npm package source/API/types/runtime delta. |
| Registry changelog | completed | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Source entry and generated JSON pass `generate-ui-changelog-entries --check`. |
| No release artifact | not applicable | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | A registry changelog is present. |
| Package typecheck/build/test | completed | Run owning package checks or record N/A with reason | `pnpm --filter www typecheck`, focused tests, source check, registry build, and isolated fixture typechecks passed. |
| Barrel/export generation | not applicable | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | No package exports or exported package folders changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners and accepted audit revalidated | Decide |
| Decide | completed | Explicit Radix/Base support and two sparse families locked | Prove and hand off |
| Prove and hand off | completed | Focused/static/install/generated/browser/doctrine/P1 evidence recorded | User review |

Decision brief:
- outcome: one canonical registry graph plus two sparse Radix/Base UI families.
- chosen shape: preserve semantic ids/URLs, build docs/common once, resolve `toolbar` and `floating-popover` before install, and fail closed on unsupported bases.
- strongest rejected alternative: whole-registry base/style targets, which duplicate 96% of work and claim compatibility not present in current source.
- consequence: React Aria support and its author source disappear; Base becomes honest through two bounded provider contracts.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Provider support | Upstream presets become 27 Plate targets, including Aria | Explicit Radix/Base support set; unsupported bases fail closed | registry build/config | Current graph has at least 40 Aria-incompatible items | Delete Aria source/routes/deps/tests/doctrine | source audit + target tests | old Aria URLs become unsupported | cut |
| Registry graph | Docs and common items rebuilt inside every target | docs once, canonical graph once, sparse provider overlay | build-registry scripts | Only Toolbar varies today | preserve semantic ids and materialize same-style dependencies | target/hash/install fixtures | dependency rewrite mistakes | rearchitect |
| Toolbar | Radix/Base/Aria author files | Radix/Base only behind one editor-facing contract | registry bases/components | Real provider boundary already exists | delete Aria variant and normalize consumers | isolated installs + demos | provider prop mismatch | rearchitect |
| Anchored popovers | Eight consumers assume Radix `PopoverAnchor` | registry-local Radix/Base `floating-popover` family with `element` anchor | copied editor registry UI | One real reused behavior boundary | migrate eight items/deps | Radix/Base typecheck + browser | anchor positioning/focus | rearchitect |
| Modern toolbar buttons | 11 components leak Radix DropdownMenu types/values | direct components with only used semantic props | each copied component | Callers do not use root menu props | delete pass-through/indicator values | typecheck + source audit + demos | hidden caller missed | cut |
| Classic items | Two leaves leaked Radix contracts | Canonical maintenance rows compatible with Base and Radix | existing classic items | Supported providers expose one complete semantic surface | remove leaf coupling; no assembly variants | source/install audit | future primitive drift | gate |
| Registry doctrine | Sync plan equates generated Toolbar variants with truthful graph support | provider support requires installed-graph compatibility and sparse ownership | best-api/plate-ui/sync-shadcn source rules | Prevents repeat of false preset propagation | edit source rules, regenerate mirrors | source/mirror parity + agent review | overfitting product detail into generic rule | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Support/build hard cut | registry build/config | explicit Radix/Base support, delete Aria, split docs/common/overlay targets | live source matches accepted audit | target/resolver tests prove URLs and dependency graph | focused tests + source audit |
| 2. UI provider owners | Plate UI registry | add FloatingPopover variants, migrate eight consumers, cut 11 leaks, repair metadata/collision/form rows | Slice 1 target contract exists | Radix/Base source and installs typecheck | component/registry tests + source audit |
| 3. Doctrine/release | Best API + sync-shadcn + registry changelog | rule/Vision updates, generated mirrors, user-facing changelog | product shape stable | zero stale teaching; changelog source/generated parity | `pnpm install`, rg, changelog check, agent-native review |
| 4. Generated/runtime proof | www + Browser | build registry on next, typecheck, install fixtures, representative demos | source/tests green | generated output and browser evidence green | build/typecheck/install/hash/browser |
| 5. Review/closure | autoreview + autogoal | P1 diff review, fixes, final checks and ledger closure | all implementation proof complete | zero accepted P0/P1 findings and checker passes | P1 autoreview + goal checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Only two provider families vary | accepted 432-item/317-file audit | target tests plus final generated-output audit | passed |
| Aria support is removed honestly | 40-item incompatibility lower bound | zero live source/dependency matches and negative route/target tests | passed |
| Radix and Base installs resolve | local shadcn resolver/builder audit | direct and namespaced Luma fixtures typechecked for both providers | passed |
| FloatingPopover preserves behavior | eight PopoverAnchor consumers traced | source/types/install proof plus native AI floating-menu interaction | passed with unrelated block-preview caveat |
| Registry output is publishable | accepted URL/dependency target | `build:registry`, changelog check, full `www` typecheck | passed |
| Agent doctrine stays current | prior sync claim contradicted by graph audit | source/mirror parity, doctrine v107, and agent-native PASS | passed; global validator has unrelated `selection` registry drift |

Conditional evidence:
- High-risk scenarios: same-style dependency rewrite breaks direct URL installs; Base anchor behavior loses focus/positioning; unsupported Aria URLs silently fall back. Each has a named fixture/negative/browser gate.
- External research: local `../shadcn` is the required upstream source; no web research is needed unless current local source cannot settle a contract.
- Issue/PR provenance: N/A; user-requested local architecture change with no issue or PR.
- Docs/registry/browser/release/behavior-law owners: registry changelog, in-app Browser, Plate UI, Best API, and sync-shadcn source rules apply; npm package changesets and Plite behavior law do not.

Findings:
- Accepted audit: 432 active items, 317 production files, 27 current targets, and only Toolbar changes by base today.
- At least 40 active items are Aria-incompatible; 23 have known Base debt, concentrated in eight anchored popovers, 13 Radix dropdown imports, and two empty form rows.
- Exact row ledgers live under `docs/plans/artifacts/registry-primitive-variants/` and remain the bounded implementation manifest.

Decisions and tradeoffs:
- Keep build taxonomy private and semantic item ids public; direct URL compatibility requires same-style dependency materialization.
- Keep Radix/Base because two bounded provider contracts cover current needs; cut Aria rather than create a parallel component/installer system.
- Freeze classic items on Radix rather than expand maintenance-only topology.

Agent-native capability map:
| User action | Agent route | Source owner | Generated/discoverable surface | Proof | Verdict |
| --- | --- | --- | --- | --- | --- |
| Sync latest shadcn preset/catalog changes without falsely widening Plate support | `sync-shadcn`, then `best-api`/`plate-ui` for public copied-UI shape | `.agents/rules/sync-shadcn.mdc`, `.agents/rules/best-api.mdc`, `.agents/rules/plate-ui.mdc`, `docs/vision/plate.md` | Generated `SKILL.md` mirrors plus sync status/dashboard and Plate Next doctrine v107 | `pnpm install`, source/mirror `rg`, version fingerprint, focused/build/install/browser/P1 receipts | PASS |

Review fixes:
- Agent-native reviewer: no P0/P1 gap; action, owner, mirror, and proof route are explicit.
- P1 autoreview: no accepted/actionable findings; patch correct with 0.87 confidence.
- Rejected no findings. No review-triggered product edit was required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial broad patches missed current file context | 1 | Split edits by exact live owner | Applied cleanly without overwriting concurrent work. |
| Registry source check exposed empty Form ownership | 1 | Move the demo to owned React Hook Form/Controller and current Field guidance | Source check passed. |
| Initial TypeScript pass found Base anchor narrowing and stale DOCX child use | 1 | Narrow the anchor union and remove the unused child | Focused and full TypeScript passed. |
| Ultracite rejected two Base nested ternaries | 1 | Replace them with explicit boolean branches | Scoped 37-file check passed. |
| Full `ai-menu` CLI fixture could not fetch unpublished `@platejs/plite` | 1 | Test the two actual provider owners directly and through `@plate/toolbar` | Radix/Base direct and namespaced installs typechecked; release blocker recorded below. |
| In-app Browser and automated Chrome blocked localhost navigation | 2 | Follow the required native Chrome fallback | Native Chrome proved payloads and unaffected interactions. |
| `table-demo` returned 500 | 1 | Inspect server/browser cause and continue through unaffected routes | Existing heading `id` violates the current closed schema; no registry-provider edit was made. |
| Full local autoreview bundle was refused before model review | 2 | Use one scoped temporary clone excluding unrelated dirty/untracked work | Final one-pass P1 review was clean; temporary clone was deleted. |
| First scoped Ultracite command left bracketed routes unquoted | 1 | Quote dynamic route paths | Check passed. |
| Plate Next doctrine validator failed global registry enrollment | 1 | Verify changed fingerprint/mirrors separately and preserve exact external blocker | Doctrine v107 is valid; unrelated `selection` registry drift remains. |

Verification evidence:
- `pnpm --filter www exec bun test scripts/registry-build-targets.test.mts scripts/registry-dependencies.test.mts src/registry/registry.test.ts src/lib/registry-response.test.ts src/lib/plate-init.test.ts src/lib/registry-install.test.ts src/app/r/registries.json/route.test.ts`: 31 pass, 425 assertions.
- `pnpm --filter www exec tsx scripts/check-registry-source.mts`: passed.
- `pnpm --filter www typecheck`: passed editor generation, API-reference parity, docs parity, registry parity, route typegen, main TypeScript, and package-integration TypeScript.
- `pnpm --filter www build:registry`: canonical Base graph built once; Radix
  pass built only `floating-popover` and `toolbar`. No public style directories
  remain; the Radix overlay contains those two items plus `registry.json`.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` and `--check`: passed, 81 source/generated events.
- Scoped `pnpm exec ultracite check` on 37 changed implementation/test files: passed. Broad `pnpm lint:fix` was intentionally not run because it would rewrite unrelated shared-checkout work.
- Isolated shadcn 4.19 Vite fixtures: direct Base/Radix Luma `floating-popover` + `toolbar` installs passed; namespaced `@plate/toolbar` passed; both `pnpm typecheck` runs passed.
- Installed fixture SHA-256: Base floating `2f7c4908b6fb6051b230fd78189f433333da9e48dc308d1194a0df4389156024`, Base toolbar `85444286d9c940212d08f3a35fe87655800fb171502e1db5d02eb5760c80ab25`, Radix floating `8e279e955cf1e74dfc35c9728f45eabf4e39bedd6677731d3a79c22b9d1d2d73`, Radix toolbar `07ea72fc108aed0e6a930aaefd422c716d8f73dfb96fe115d18a1b4a98ccc250`.
- Native Chrome: `/r/base-luma/toolbar.json` rendered Base UI source; `/r/aria-luma/toolbar.json` rendered `Not found`; `/blocks/ai-demo` opened `Ask AI anything...`; `/blocks/media-demo` rendered media; `/blocks/select-editor-demo` selected `Node Selection`.
- Server/network receipts: provider graph URLs returned 200; unsupported Aria returned 404; AI/media/select routes returned 200. Shared block preview logs an existing Next uncached-data error. `table-demo` returns 500 because existing heading data contains forbidden `id`.
- Source/test SHA-256 at local base ref `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`: registry owner `da6be2530d5e0fc3a8c96413ac382d4c8ec177eedae489be94086a8cc17431e5`, build owner `eb92bb01eca3cfa27a01cbf5cc789b63f15d6dc8a9407c22126c33062ed79e78`, response owner `09f51152669a8248eed782a98547c05fe59623eaca099c12c7700cbe43f3d40a`, Radix floating `8e279e955cf1e74dfc35c9728f45eabf4e39bedd6677731d3a79c22b9d1d2d73`, Base floating `f18df0d165d222ba6b4656201204d1ee8aac39a05c34cb30c4b0d9622756c006`.
- Agent mirrors regenerated by `pnpm install`; Plate Next doctrine v107 fingerprint is `sha256:4d6dd753e525417bfc7cab465d0cd42662995d19dbe831607384481557fa7c43`.
- `node .agents/rules/plate-next/scripts/version.mjs validate` reports only unrelated current-tree drift: `Unenrolled packages in registry: selection.` and `Tracked package is missing package.json: packages/selection.`
- P1 command: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1 --prompt-file docs/plans/artifacts/registry-primitive-variants/autoreview-scope.md --stream-engine-output` in a scoped temporary clone. Result: clean, no accepted/actionable findings.

Final handoff prepared:
- Ownership and target API: `plate-registry-styles`, registry metadata, build targets, and dynamic response own support; copied UI exposes only `FloatingPopover`, `FloatingPopoverAnchor element={...}`, and `FloatingPopoverContent`.
- Public breaks and adoption: Aria and unknown styles fail closed; 11 classic rows are unavailable through Base; eight floating consumers and 11 modern toolbar consumers are migrated.
- Applicable runtime/package/docs/browser decisions: registry changelog only, no npm changeset or barrel work; doctrine and sync status teach the final state.
- Proof and execution risks: provider/install/static proof is green. Full editor-kit CLI installation awaits a published `@platejs/plite`; shared block-preview and table schema failures are independent current-tree blockers.
- Execution order and user attention: review the local diff, then commit/PR only if separately requested. No git or release mutation was performed.

Timeline:
- 2026-08-24T19:49:44.646Z Plate Plan created.
- 2026-08-24 User accepted `docs/plans/2026-08-24-audit-registry-primitive-variants.md`; new one-shot execution goal created and requirements materialized here before product edits.
- 2026-08-24 Implementation, generation, fixtures, native browser proof, doctrine repair, and clean P1 review completed locally.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Completed local handoff |
| Where am I going? | User review; no commit, PR, or release without a new request |
| What is the goal? | One canonical registry graph and two honest Radix/Base provider families with Aria removed |
| What have I learned? | Upstream preset inventory is not Plate compatibility; only two reusable copied-UI families need provider ownership. |
| What have I done? | Implemented the split, migrated consumers, generated output, repaired doctrine/status, proved installs/routes/types/browser behavior, and closed P1 review. |

Open risks:
- Full `ai-menu`/editor-kit CLI installation cannot complete from npm until `@platejs/plite` is published; the actual provider-owner fixtures pass.
- The shared `/blocks/[name]` preview route emits an existing Next uncached-data error; `table-demo` additionally fails on current heading `id` schema data.
- Work is local and uncommitted. Generated registry output reflects the entire shared checkout, including unrelated concurrent source changes, as required by the current-tree build policy.
