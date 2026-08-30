# Generated editor contract registry delivery

Objective:
Execute generated editor registry hard cut across apps/www and CLI; done when
all accepted proof gates pass; plan
docs/plans/2026-08-23-generated-editor-contract-registry-delivery.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-generated-editor-contract-registry-delivery.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- `editor-plugins` publishes only authored composition; no registry item copies
  generated editor contracts; registry/docs/changelog/clean-install changes are
  complete; focused CLI and website checks, Browser proof or one explicit
  owner-level blocker, P1 review, and `check-complete` pass.

Verification surface:
- Source-audit the live registry item, its dependency graph and tests, generated
  artifact consumers, CLI generation/check ownership, and current docs.
- Validate the chosen registry item shape against the installed shadcn registry
  schema and one clean supported consumer installation path.
- Record exact execution commands for registry source/tests, CLI tests,
  generated-artifact checks, docs/source parity, and clean-consumer typecheck.
- Run `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-23-generated-editor-contract-registry-delivery.md` after
  fresh planning evidence is recorded.

Constraints:
- The user accepted this exact plan with `ok go`; execute its slices without
  reopening the settled API decision.
- No public compatibility aliases or runtime shims.
- Preserve the website-local generated artifacts, existing runtime dependency
  graph, provider ABI, Plite runtime, and package releases.
- Never hand-edit generated registry output or `templates/**`; never run
  `build:registry` locally.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: hard-cut generated contracts from `editor-plugins`, enforce the
  remaining app-owned CLI contract in public teaching, add registry adoption
  guidance, and prove the supported install path.
- Source owners: `apps/www` registry declarations/tests/consumer docs and
  `@platejs/cli` generated-artifact production and stale checking.
- Non-goals: no Plite runtime or generated-provider redesign; no
  `usePlateEditor` lifecycle work; no
  TypeScript performance claim; no alternative variants work; no public tooling-subpath
  decision unless live evidence makes it necessary for this delivery contract.
- Direct Plite boundary owners: N/A. The plan consumes existing generated
  node/value provider mechanics without changing editor substrate.

Requirement extraction:
- [x] Decide between a default authored-`EditorKit` delivery and an opt-in
  generated-contract delivery.
- [x] Require enforceable CLI freshness for any copied exact artifacts.
- [x] Cover registry dependencies and independently installable item ownership.
- [x] Cover current and target public docs.
- [x] Define clean-install proof in a supported consumer.
- [x] Define hard-cut adoption with no compatibility item, alias, or shim.
- [x] Produce one checker-clean plan and stop before implementation until the
  user accepts this exact path and invokes `plate-plan` against it.
- [x] Record explicit acceptance: the user replied `ok go` after reviewing the
  before/after call shape.

Output budget strategy:
- Read named owners first; expand only through direct registry dependencies and
  generated-artifact consumers. Use `rg --files-with-matches`, counts, and
  capped line ranges; exclude generated payload bodies, `node_modules`, public
  registry builds, templates, `.next`, `.turbo`, and build output unless a
  named contract requires one narrow read.

Blocked condition:
- Stop only if the supported registry installer contract or a runnable clean
  consumer cannot be established after all local source, schema, fixture, and
  documented-install paths are exhausted, and that missing fact changes whether
  freshness can be enforced. No current blocker.

Plate Plan state:
- status: complete
- phase: closed
- next: final handoff
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Requirement extraction records delivery choice, freshness, dependencies, docs, clean-install proof, hard cut, and planning-only boundary. |
| Active goal and plan verified | yes | Fresh one-shot execution goal names this exact accepted plan and the apps/www plus CLI owner boundary. |
| Current owners read | yes | Current `next` source at `33557a72cc6b393c4646af46cf0348f0e49efa99`: registry declaration/test, generated files and consumers, CLI command/check implementation and tests, docs, template installer, registry CI, Plate Vision, and Plate UI ownership rule were read. |
| Best API target resolved | yes | `best-api` verdict: `@plate/editor-plugins` installs only authored runtime composition. Exact contracts remain app-generated advanced tooling; do not add a generated-contract registry item. Generated provider ABI is out of scope. |
| Mode and execution boundary resolved | yes | User supplied explicit acceptance; one-shot execution is authorized within the accepted slices and non-goals. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Remove generated contract files from registry delivery without changing the authored kit, dependency graph, or website-local files.
- [x] Replace the old publication test with a durable registry-wide authored-only contract.
- [x] Update the English and Chinese Editor, Feature Kits, and Utils teaching surfaces where the ownership distinction matters.
- [x] Add and generate one `remove` registry changelog event with delete-or-regenerate adoption guidance; record package changeset N/A.
- [x] Add clean-install residue enforcement to the existing CI-owned template installation path without editing generated output or templates.
- [x] Prove CLI freshness, website-local generation/typechecking, registry source/tests, docs/changelog parity, and hard-cut source sweeps.
- [x] Browser attempted on the affected docs route. N/A for rendering proof: the committed generated registry index references 158 absent source files and local registry regeneration is CI-only.
- [x] Run `best-api repair` audit, affected worker-teaching audit, lint, P1 `autoreview`, and the final goal-plan checker.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Registry contract, test, bilingual docs, changelog, CI guard, source sweeps, CLI tests, website typecheck, lint, and review are complete. Browser is resolved through the explicit blocked-path rule. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source sweep at `33557a72cc6b393c4646af46cf0348f0e49efa99` found zero generated contract paths in registry declaration owners while both website-local artifacts remain. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | `best-api repair` audit reaffirmed existing Vision and Plate UI doctrine. No source rule changed, so no version bump, skill regeneration, or `pnpm install` is warranted. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Bilingual docs, changelog, hard-cut sweep, and CI residue gate are complete. Browser N/A: committed `src/__registry__/index.tsx` has 158 imports whose source files are absent at the pinned HEAD; local registry build is forbidden. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact local commands and results are recorded below. CI owns the real shadcn template update/build receipt. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Actual implementation, adoption, proof, Browser blocker, and residual CI receipt are summarized below. |
| P1 autoreview | yes | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Invocation 2 completed two bounded passes: 0 findings, patch correct 0.94. Invocation 1 aborted safely when the checkout changed. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-generated-editor-contract-registry-delivery.md` | Passed after final execution evidence was recorded. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Current registry, CLI, docs, doctrine, CI, templates, and generated consumers audited at the pinned SHA. | Decide |
| Decide | completed | Runtime-only default won; separate generated item, default CLI dependency, and passive copied artifacts were rejected. | Prove and hand off |
| Prove and hand off | completed | Focused checks passed; hard-cut adoption, execution slices, proof matrix, risk gates, and handoff are concrete. | User review |
| Execute | completed | Registry, test, bilingual docs, changelog, generated JSON, and CI residue guard implemented. | Verify |
| Verify | completed | Post-format registry test, changelog check, generator check, scoped diff check, complete www typecheck, and P1 review are green; Browser blocker is sourced. | Final handoff |

Decision brief:
- outcome: Hard-cut generated TypeScript and JSON artifacts from the published
  `editor-plugins` item. Keep the authored `EditorKit` and its existing runtime
  dependency graph as the default registry contract.
- chosen shape: Ordinary users run
  `npx shadcn@latest add @plate/editor-plugins`. Advanced users install
  `@platejs/cli`, generate from their customized app-owned plugin module, commit
  the artifacts when needed, and gate them with
  `plate generate --check <entry>` in their own CI or typecheck script.
- strongest rejected alternative: An opt-in generated-contract registry item.
  It would copy another snapshot, but shadcn registry items cannot install a
  package script or CI hook. It therefore cannot enforce freshness and merely
  moves the existing defect behind another item name.
- consequence: New registry installs never receive passive exact contracts.
  Existing consumers either delete unused copied artifacts or adopt the CLI and
  freshness gate. The Plate website keeps its local generated artifacts because
  it is a real application owner with an enforced `editor:check`.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Default `editor-plugins` files | `registry-features.ts:803-858` publishes `plugins.ts`, `plugins.generated.ts`, and `plugins.schema.json` with the existing runtime dependency graph. | Publish `plugins.ts` only; preserve the current package and registry dependencies needed by that authored composition. | `apps/www/src/registry/registry-features.ts` | The default kit owns runtime composition, not an exact snapshot of a host's customized graph. This matches `docs/vision/plate.md:669-689`. | Remove only the two generated file rows. Do not rename the item or alter downstream registry dependencies. | Registry test asserts the item contains `plugins.ts` and no registry item contains generated contract files; registry source check passes. | A broad dependency edit could break every block that transitively installs this item. Keep dependency topology unchanged. | cut |
| Exact-contract creation | The registry copies the website's generated artifacts, while docs separately teach app-owned CLI generation (`editor.mdx:239-336`). | The host installs `@platejs/cli`, runs `plate generate <entry>`, and adds `plate generate --check <entry>` to CI/typecheck whenever artifacts are committed. | Host application, with production/check mechanics owned by `packages/cli` | Only the host knows its final plugin tuple and optional schema. `packages/cli/src/bin.ts:20-37` and `generate.ts:2099-2119` already own generation and stale failure. | Registry changelog gives two hard-cut paths: delete unused snapshots, or regenerate from the local kit and add the check command. | CLI stale-artifact tests plus a scratch stale mutation prove nonzero failure and regeneration proves recovery. | Docs without the check command would legitimize permanently stale committed output. | move |
| Generated-contract registry item | No separate item exists; `registry.test.ts:117-145` currently reserves absence of `plate-types` while expecting generated files in `editor-plugins`. | Keep it absent. Do not create `plate-types`, `editor-generated`, an alias, or a compatibility item. | Registry public item catalog | Runtime validation of shadcn 4.10's item schema stripped an unknown `scripts` field, so a registry item cannot enforce the required host script/CI hook. | Invert the existing test to forbid generated contract files across all items and keep the `plate-types` absence assertion. | Schema parse probe plus registry-wide test. | A later item could silently reintroduce passive delivery unless the test is global. | keep |
| Website-local generated artifacts | The files remain under `apps/www/src/registry/components/editor`; `apps/www/package.json:20-21,41` gates them and package integration imports the exact `Editor`. | Keep both local files, their generator/check scripts, and the package-integration contract; stop exporting them through registry metadata. | `apps/www` and `@platejs/cli` | The website is an application owner and already enforces freshness. Removing its local artifacts would destroy valid exact-boundary proof. | No file move and no provider ABI change. | `pnpm --filter www editor:check` and www package-integration typecheck. | An over-broad deletion would break internal exact type proof. | keep |
| Public teaching and migration | Feature-kit docs call `editor-plugins` the full editable kit (`feature-kits.mdx:118-125`); Utils imports `plugins.generated` without explaining generation (`utils.mdx:77-85`). | English and Chinese docs state that the item installs authored runtime composition only; exact artifacts are app-generated and require `--check`. Add a registry changelog entry for the hard cut. | Docs source plus `apps/www/src/registry/changelog/entries` | The install contract must be discoverable where users choose the item and where they see the generated type. | Update both locales. Changelog gives delete-or-regenerate steps. No package changeset: no npm package changes. | Docs source parity, changelog generation/check, Browser routes, and source search for unsupported wording. | Updating only the canonical Editor guide leaves two misleading entry points. | rearchitect |
| Clean supported install | Registry CI builds local registry output, runs real `shadcn@latest add` through `templates:update --local`, then freshly installs and builds both templates (`registry.yml:85-117`; `update-template.sh:104-152`). Current templates contain no generated artifact matches. | Keep that supported path and add/extend a source assertion that installed templates contain neither generated file after update. Generated registry output and templates remain CI-owned. | Registry workflow and template update tooling | This proves transitive installation of real editor blocks without manual fixture synthesis. | Do not edit `templates/**` or `apps/www/public/{r,rd}` by hand and do not run `build:registry` locally. CI regenerates them. | CI local-registry update, zero-residue scan, fresh install, and builds for both templates. | A source-only item test would miss stale generated files retained in consumer output. | gate |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Registry hard cut | `apps/www` registry | Remove generated TS/JSON file rows from `editor-plugins`; preserve `plugins.ts`, dependencies, registry dependencies, and local source files. Invert the registry contract test globally. | Accepted plan; current registry test is green on the old contract. | No registry item publishes `plugins.generated.ts` or `plugins.schema.json`; no generated item or alias exists. | `bun test apps/www/src/registry/registry.test.ts`; `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`. |
| 2. Docs and adoption | Docs plus registry changelog | Update feature-kit and Utils guidance in English and Chinese; recheck the canonical Editor guide; add one `remove` registry changelog entry with delete-or-regenerate migration. | Slice 1 fixes the exact install contract. | Every public entry point says runtime kit by default and app-owned CLI generation plus `--check` for exact artifacts. | `node tooling/scripts/generate-ui-changelog-entries.mjs --write`; same command with `--check`; www docs source-parity check; focused `rg`. |
| 3. Generator and website proof | `@platejs/cli` plus `apps/www` | Retain website artifacts and freshness scripts. Strengthen tests only if the existing stale batch test does not cover the final documented command. | Registry no longer treats the website snapshot as reusable. | CLI check fails on stale committed output and passes after generation; website-local exact types remain current and compile. | `bun test packages/cli/test/generate.test.ts`; `pnpm --filter www editor:check`; `pnpm --filter www typecheck`. |
| 4. Install and browser proof | Registry CI plus docs UI | Let CI build generated registry output, update both supported templates through shadcn, scan for generated residue, install dependencies, and build. Run the docs app and inspect the affected English and Chinese routes. | Slices 1-3 complete. | Both supported consumers build with no copied generated contracts; docs render the chosen contract with no console error. | Registry workflow steps at `.github/workflows/registry.yml:85-117`; Browser on `/docs/feature-kits`, `/docs/editor#exact-generated-editor-types`, `/docs/api/utils`, and their Chinese counterparts. |
| 5. Closeout | Plate review owner | Run lint, focused checks, one P1 `autoreview`, and repair any current P0/P1 finding within the three-invocation cap. | All implementation and proof changes complete. | No unresolved P0/P1 finding; generated outputs/templates are untouched locally; execution plan records receipts. | `pnpm lint:fix`; focused commands above; `autoreview --max-priority P1`; plan checker. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Default item should be authored-only. | Vision says the ordinary path is runtime-first and generation is optional advanced tooling (`docs/vision/plate.md:669-689`); the current item publishes all three files (`registry-features.ts:803-858`). | Registry contract test expects `plugins.ts` and globally rejects generated contract paths. | passed |
| A generated registry item cannot enforce freshness. | Installed shadcn 4.10 registry schema accepts dependency/file metadata but strips an unknown `scripts` field; runtime parse returned `hasScripts: false`. | The item remains absent and the global registry declaration sweep is clean. | passed |
| CLI owns enforceable stale checking. | Command exposes `--check` (`packages/cli/src/bin.ts:25-37`); implementation compares both artifacts and throws with every stale path (`generate.ts:2099-2119`); focused stale-batch test passed. | Full CLI generate test file passed 66/66, including stale and watch recovery coverage. | passed |
| Website exact contracts remain valid after the public cut. | `apps/www/package.json:20-21,41` already gates generation; `editor:check` passed; package integration imports the local generated `Editor`. | Complete www typecheck passed, including package integration. | passed |
| Docs teach one honest install contract. | Editor guide already teaches install/generate/watch/check (`editor.mdx:239-336`); feature-kit and Utils entry points omit the ownership/freshness distinction. | English/Chinese docs updated; API reference, MDX build, and source parity passed. Browser rendering is N/A for the sourced generated-index blocker. | passed with Browser N/A |
| A clean supported consumer does not receive generated artifacts. | Current templates have zero `plugins.generated`, `plugins.schema`, CLI-script, or editor-check matches; CI uses real shadcn installation and builds both templates. | Post-update CI residue gate added; the same guard passes locally against both templates. Real shadcn update/build remains a CI receipt. | enforced; CI receipt external |
| Adoption is a hard cut. | No separate item exists today and compatibility is forbidden by the request. | Global registry test and source sweep reject copied generated paths; changelog offers only deletion or app-owned regeneration. | passed |

Conditional evidence:
- High-risk scenarios:
  1. An implementer deletes the website-local generated files instead of only
     cutting their registry metadata. Prevent this with `editor:check` and the
     package-integration typecheck.
  2. Another registry item or a transitive template retains generated output.
     Prevent this with a global registry assertion and post-install template
     scan, not a single-item snapshot.
  3. Docs show the generated `Editor` without the app-owned generation and
     `--check` law. Update all English/Chinese entry points and verify them in
     Browser.
- External research: N/A. The installed shadcn 4.10 schema and the repo's real
  installer path are the authoritative delivery contract; web research cannot
  override the pinned implementation.
- Issue/PR provenance: N/A. This is a user-requested local architecture
  decision, not an issue- or PR-backed change.
- Docs/registry/browser/release/behavior-law owners: applies. Registry metadata
  and tests own delivery; the CLI owns production and stale checking; docs and
  registry changelog own teaching/adoption; Registry CI and Browser own install
  and rendering proof. No package release or behavior-law change applies.

Findings:
- The current registry delivers one exact snapshot from the Plate website to
  every `editor-plugins` consumer, even though the installed kit is intended to
  be edited by the host.
- The current test proves single-owner publication, not freshness. It blesses
  the wrong property: where the stale snapshot comes from rather than whether a
  reusable registry item should contain it.
- Shadcn registry items can install files, package dependencies, and registry
  dependencies, but the pinned schema has no script or CI-hook field. A second
  item cannot satisfy the user's enforceability requirement.
- `@platejs/cli` already has the right owner boundary and failure behavior. The
  missing contract is adoption: the host must invoke `--check` whenever it
  chooses committed exact artifacts.
- Registry CI already exercises real shadcn installation into both supported
  templates. Add a zero-residue assertion there instead of inventing a second
  clean-install system.
- The implementation removed only the two registry file rows. The authored
  `plugins.ts` row, package dependencies, registry dependencies, and both
  website-local generated artifacts remain intact.
- Full CLI generation coverage passes 66 tests, including expected invalid
  source/watch cases. The website typecheck passes its generator, API reference,
  docs parity, registry source, app TypeScript, and package-integration owners.
- `best-api repair` found no stale durable doctrine. Vision already makes the
  generator optional advanced tooling, and Plate UI's colocation rule does not
  require registry publication. No rule edit, version bump, `pnpm install`, or
  generated-skill churn is justified.

Decisions and tradeoffs:
- Favor a smaller truthful default over optional registry convenience. Exact
  types require one explicit CLI setup because enforcement cannot be copied by
  the registry.
- Preserve the broad existing runtime dependency graph. This plan changes file
  delivery, not feature composition.
- Keep generated artifacts co-located with the website's composition owner;
  co-location does not imply registry publication.
- Accept a deliberate public hard cut for future re-installs. Existing copied
  apps are not remotely mutated; the changelog tells owners how to delete or
  take responsibility for their artifacts.
- Do not add a package changeset because no npm package surface changes. Do add
  a registry changelog entry because copied install output changes.
- The implementation drops the old named `plate-types` absence assertion.
  A registry-wide ban on generated contract files protects the surviving
  contract; a named test for dead API would violate the repo's hard-cut test
  policy without adding coverage.

Review fixes:
- P1 autoreview invocation 2 returned 0 findings across both bounded passes.
  No review-triggered edit or rerun is required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Resolving `shadcn/schema` from the workspace root failed under pnpm package scoping. | 1 | Resolve from the owning `apps/www` workspace and probe its pinned schema. | Succeeded; the schema stripped `scripts`, proving the registry cannot install an enforcement hook. |
| First execution-state patch included an incorrect duplicate-SHA context line. | 1 | Re-read exact plan ranges and apply smaller owner-specific patches. | Execution goal state and checklist were updated without replacing the accepted plan. |
| First parallel full-CLI test wrapper did not retain the running session id. | 1 | Stop only that agent-started test process and rerun with the session id surfaced for bounded waits. | Rerun completed: 66 passed, 0 failed in 82.64 seconds. |
| Browser route compilation failed before rendering because the committed generated registry index imports absent source files. | 1 | Prove whether the missing path is task-caused, then use the root blocked-browser rule instead of editing CI-owned output. | The pinned HEAD lacks the first failing file; a bounded audit found 158 absent imports. Browser proof is explicitly N/A. |
| Stopping the failed dev server returned its accumulated compiler log and exceeded the planned output cap. | 1 | Stop broad log streaming and use bounded counts/samples only. | No further broad output was requested; the bounded audit returned only a count and five-file sample. |
| P1 autoreview invocation 1 detected a checkout change after bundling. | 1 | Stop all known writers and rerun the identical scope within the three-invocation cap. | Invocation 2 completed clean with 0 findings. |

Verification evidence:
- Pinned source: `next` HEAD
  `33557a72cc6b393c4646af46cf0348f0e49efa99`.
- `pnpm --filter www editor:check` passed and checked both generated artifacts.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json
  scripts/check-registry-source.mts` passed.
- `bun test apps/www/src/registry/registry.test.ts` passed: 8 tests, 0 failed.
- `bun test packages/cli/test/generate.test.ts -t "reports every stale artifact
  in a batch"` passed: 1 test, 65 filtered, 0 failed.
- The pinned shadcn registry-item schema probe returned
  `{"hasScripts":false,"keys":["name","type"]}` after parsing an item with a
  `scripts` field.
- A source scan found zero generated-contract or CLI-freshness matches under
  both current templates.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-23-generated-editor-contract-registry-delivery.md` passed.
- Execution evidence: in progress; planning receipts above do not prove the
  changed checkout.
- `bun test apps/www/src/registry/registry.test.ts` after the cut: 8 passed,
  0 failed.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` generated 75
  events; `--check` passed for all 75 source entries.
- `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json
  scripts/check-registry-source.mts` passed after the cut.
- `bun test packages/cli/test/generate.test.ts`: 66 passed, 0 failed.
- `pnpm --filter www check:docs` passed API reference, MDX build, and docs
  source parity.
- `pnpm --filter www typecheck` passed every composed stage, including both
  app and package-integration TypeScript projects.
- `pnpm lint:fix` completed on 4,197 files with no lint failure.
- Hard-cut source audit across registry declaration owners returned zero
  generated contract or rejected-item matches; scoped `git diff --check`
  passed.
- The CI residue guard command passes against both current templates with zero
  generated contract files. The workflow remains the owner of real shadcn
  update, fresh installs, and template builds.
- Browser attempted `http://localhost:3010/docs/feature-kits`; compilation
  failed before page render. Bounded audit of tracked
  `apps/www/src/__registry__/index.tsx`: 240 registry dynamic imports, 158
  missing source files. The first failing `editor-base-kit.tsx` is absent at
  the pinned HEAD, proving the blocker predates this patch.
- `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1
  --prompt <scoped generated-editor-contract files>` invocation 2: TruffleHog
  clean, 768,985-byte bundle, 2 bounded passes, 0 findings, patch correct 0.94.
- Post-format closure rerun: registry test 8/8, changelog check 75/75,
  `editor:check`, scoped `git diff --check`, and the complete www typecheck all
  passed.
- Final `check-complete.mjs` gate passed.

Final handoff prepared:
- Ownership and target API: `editor-plugins` owns authored runtime composition
  only. The host and `@platejs/cli` own optional exact artifacts and freshness.
- Public breaks and adoption: generated TS/JSON files disappear from new or
  repeated registry installs with no alias. Existing owners delete them if
  unused or install the CLI, regenerate locally, and enforce `--check`.
- Applicable runtime/package/docs/browser decisions: no provider ABI, runtime,
  Plite, or package release change. Registry metadata/test, bilingual docs,
  registry changelog, CI template proof, and Browser docs proof apply.
- Proof and execution risks: all local source/test/typecheck/lint/review gates
  pass. Browser rendering is blocked by a pre-existing CI-generated index with
  158 absent imports; the real template update/build receipt will come from CI.
- Execution order and user attention: implementation is complete. No further
  user decision is required; CI should run the existing registry workflow when
  this checkout is eventually pushed through an authorized path.

Timeline:
- 2026-08-23T23:27:40.145Z Plate Plan created.
- 2026-08-24 Current owners grounded at the pinned `next` SHA; focused registry,
  CLI, and generation checks passed.
- 2026-08-24 `best-api` rejected an opt-in generated-contract item because the
  registry cannot install an enforceable freshness hook.
- 2026-08-24 Hard-cut adoption, proof matrix, execution slices, and final
  handoff prepared.
- 2026-08-24 Binary `check-complete` gate passed.
- 2026-08-24 User accepted the exact before/after contract with `ok go`; fresh
  one-shot execution goal created and slices 1-5 activated.
- 2026-08-24 Slices 1-3 implemented: registry hard cut, durable test, bilingual
  docs, generated registry changelog, and CLI/website proof are green.
- 2026-08-24 Slice 4 CI residue gate added; local template scan is green.
- 2026-08-24 Browser route proof blocked before render by the committed stale
  registry index; bounded audit found 158 absent imports and the dev server was
  stopped.
- 2026-08-24 P1 autoreview invocation 2 completed clean with 0 findings.
- 2026-08-24 Post-format closure checks passed; plan is ready for the final
  mechanical checker.
- 2026-08-24 Final mechanical checker passed; execution closed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Execution complete. |
| Where am I going? | Hand off the implemented contract and explicit Browser/CI caveat. |
| What is the goal? | Make `editor-plugins` authored-only and require app-owned CLI generation plus `--check` for every committed exact contract. |
| What have I learned? | See Findings |
| What have I done? | Registry delivery, tests, bilingual docs, changelog, and CI residue enforcement are implemented and locally verified. |

Open risks:
- Shadcn could add an enforceable script contract in a future pinned release.
  Re-probe the installed schema if its version changes before execution; do not
  change this decision based on documentation alone.
- Re-adding a registry item to an existing consumer does not remotely delete
  files it copied in the past. That is adoption debt, not a reason to preserve
  passive delivery; the registry changelog must state the manual delete or
  regenerate action plainly.
- No local Browser rendering receipt exists because the committed generated
  registry index cannot compile against the pinned source tree. CI must
  regenerate the index and exercise the clean template install/build path.
