# Transaction plugin portal hard cut

Objective:
Ship Plate descriptor-aware transaction portals without exposing a Plite
descriptor portal. The task is complete when runtime, types, production
adoption, doctrine, release artifacts, and focused proof agree on one API.

Completion threshold:
- Plate exposes `tx.plugin(Plugin).method()` inside the active transaction.
- Raw Plite retains direct named transaction groups and no `tx.extension()` or
  descriptor portal.
- Generated Plate editors retain direct `tx.pluginName.method()` groups.
- Production computed access such as `tx[plugin.name]` is absent.
- Runtime and type evidence covers atomic rollback, transaction specs,
  descriptor-family validation, missing plugins, literal names, broad editor
  inference, generated groups, and the legal plugin name `plugin`.
- Current-state docs, Vision, reusable rules, changesets, and registry release
  notes describe the same boundary.

Verification surface:
- `packages/plite` transaction materialization and public/internal exports.
- `packages/core` Plate runtime projection, public transaction types, runtime
  tests, and compile contracts.
- Migrated Media, Footnote, Selection, Comment, Link, Affinity, Override,
  Table contracts, and the registry More toolbar.
- English and Chinese plugin-method/API docs, Plate/Plite Vision, agent rules,
  Plate Next version registry, package changesets, and registry changelog.
- Focused tests, package builds, source audits, API-reference checks, docs
  parsing, formatting, diff checks, Browser attempt, and review attempt.

Constraints:
- Preserve shared WIP and do not repair unrelated schema or React generic work.
- Do not expose Plite extension vocabulary through Plate's public portal.
- Do not add aliases, casts, `any`, or callback annotations to fake inference.
- Do not nest `editor.plugin(Plugin).update` inside an active transaction.
- Do not remove generated direct transaction groups or one-shot portal APIs.
- Do not edit templates, commit, push, or create a PR.

Boundaries:
- Core owns the Plate portal and its type projection.
- Plite owns transaction construction and provides one internal host projection
  hook; its public transaction shape remains unchanged.
- Package plugins own their migrated active-transaction calls.
- `.agents/rules/**` owns doctrine; generated skill mirrors are outputs.
- External research is unnecessary because current repo types and runtime settle
  this boundary.

Blocked condition:
Stop only if three distinct owner-level attempts prove that Plate cannot project
the installed transaction groups before freeze without changing Plite's public
API or breaking atomicity. That condition did not occur.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: handoff
- goal_status: complete after the checker and goal update

Current verdict:
- Plate should expose `tx.plugin(Plugin)` because descriptors and plugin-family
  validation belong to Plate.
- Plite should keep direct named groups because extensions are its lower-level
  substrate and do not need Plate's product ergonomics.

Work Checklist:
- [x] Captured every explicit requirement, scope boundary, non-goal, proof
      surface, and final handoff condition before implementation.
- [x] Mapped transaction construction, Plate plugin bindings, generated direct
      groups, and current computed callers before choosing the owner.
- [x] Recorded alternatives, rejection reasons, blast radius, and the selected
      Plate/Plite boundary.
- [x] Kept facts, inference, and recommendation separate in this plan.
- [x] Added an internal Plite host projection hook without a raw public portal.
- [x] Added the Plate runtime and type-level `tx.plugin` portal.
- [x] Preserved exact descriptor validation, rollback, transaction specs,
      generated direct groups, and a plugin literally named `plugin`.
- [x] Preserved descriptor inference for broad registry editors and added a
      compile contract for generic mark commands.
- [x] Hard-cut every production computed plugin-name transaction lookup found by
      the owner-scoped audit.
- [x] Updated source docs, Vision, source agent rules, generated skill mirrors,
      Plate Next v68, package changesets, and the registry changelog.
- [x] Classified package/API, docs, agent-native, and Browser surfaces.
- [x] Ran focused runtime, feature, artifact, source-audit, formatting, and diff
      proof from `/Users/zbeyens/git/plate-2`.
- [x] Recorded unrelated shared-tree type/build failures rather than modifying
      their owners.
- [x] Attempted Browser and P2 autoreview, recorded their exact environmental
      failures, and completed a manual owner-level review.
- [x] Recorded final evidence, residual risk, and the no-commit handoff.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured | yes | Scope, accepted call shapes, non-goals, migration, doctrine, and proof are explicit above. |
| Timed checkpoint parsed | no | No duration or hard stop was requested. |
| Major-task and autogoal loaded | yes | Both skills were read before durable work and this plan owns the active goal. |
| API and layer owners selected | yes | Core owns Plate projection; Plite owns transaction construction. |
| Source of truth read | yes | Current transaction types/runtime, plugin bindings, Vision, and rules were inspected. |
| External research selected | no | Local source fully settles the API and ownership question. |
| Docs pack selected | yes | Plugin-method/API docs and Plate/Plite Vision are affected. |
| Docs owner and style read | yes | Docs creator rules were read; pages use current-state reference prose. |
| Agent-native pack selected | yes | Reusable behavior changed in source rules and generated skill mirrors. |
| Source versus generated boundary identified | yes | `.agents/rules/**` was edited and `pnpm install` regenerated mirrors. |
| Package/API pack selected | yes | `@platejs/core` public types/runtime and Plite internals changed. |
| Release artifacts selected | yes | Existing Core/Plite changesets were updated; registry adoption has a changelog event. |
| Browser pack selected | yes | Docs and a registry toolbar consumer changed. |
| Git publication selected | no | The user did not request a commit, push, branch, or PR. |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named verification threshold | yes | Prove API, migration, doctrine, and stale-call audit | Focused portal 3/3 and feature 188/188 pass; source audit has zero forbidden calls. |
| Current-state source audit | yes | Verify owner and public boundary | Plite exports the hook only from its internal entry; Plate installs the portal after plugin resolution. |
| Decision criteria closure | yes | Resolve every accepted criterion | Descriptor portal, direct Plite/generated groups, rollback, validation, and migrations are implemented. |
| Options and rejection record | yes | Record chosen and rejected shapes | See Decisions and tradeoffs. |
| Review pressure pass | yes | Run P2 review or record exact tool failure | Security scan passed; model scan could not ingest an unrelated oversized untracked schema file; manual owner review closed two findings. |
| Review findings closure | yes | Fix accepted findings | Legal plugin-name collision and broad-editor inference were both fixed and regression-proved. |
| External-source audit | no | Explain why no citations are needed | No external factual claim or dependency behavior drives this change. |
| Docs source-backed claim audit | yes | Match examples to runtime/types | Docs use the tested `tx.plugin` surface and retain generated direct groups only where applicable. |
| Docs links and parser | yes | Validate docs source | `www build:source`, source parity, and registry source checks pass; no new external links were added. |
| Agent source and generated sync | yes | Sync and validate rules | `pnpm install`; Plate Next v68 validates with doctrine fingerprint `sha256:40b49d25f3652139b38c8c9fe93338d94525ed08cff34ca26e0976f17bfddb1f`. |
| Agent-native review | yes | Confirm discoverability and no leaked internal API | Source rules teach `tx.plugin`; generated mirrors match; API-reference config excludes the internal Plite hook. |
| Public API and package boundary | yes | Build Core and audit Plite public exports | Core build passes; Plite public smoke list contains the hook only in the internal export contract. |
| Published package changeset | yes | Update owning release prose | `.changeset/plugin-portal-scoped-api.md` and `.changeset/plite-canonical-architecture.md` describe the final boundary. |
| Registry changelog | yes | Generate and check event | Generator check passes 53/53 with the More toolbar transaction entry. |
| Package tests | yes | Run owner-focused tests | Plite 1433/1433, portal 3/3, and migrated feature tests 188/188 pass. |
| Package type/build | yes | Run relevant builds/typechecks | Core build passes; broader checks expose only separately owned errors listed below. |
| Barrel generation | no | Explain export-layout impact | No exported file was added, removed, or moved; the existing Plite internal barrel was edited directly. |
| API reference | yes | Keep internal hook out of public docs | `pnpm --filter www api-reference:check` passes. |
| Final lint and diff | yes | Run scoped formatter and diff check | Biome checks 19 affected source/config files; scoped `git diff --check` passes. |
| Browser interaction | yes | Exercise the docs/registry app | Browser reached HTTP 500 because generated registry index imports missing `plate-types.ts`; repo policy forbids rebuilding registry output locally. |
| Browser console/network | yes | Record browser state | The same unrelated server-side missing-module error prevents route hydration and interaction. |
| Browser final artifact | yes | Record proof or exact caveat | No trustworthy screenshot exists because the route never rendered; runtime and registry compile evidence substitute for this lane. |
| Goal plan checker | yes | Run the autogoal checker | Run after this final ledger rewrite. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and source read | complete | Requirements and owners recorded | Closed |
| Current-state map | complete | Plite transaction and Plate binding paths mapped | Closed |
| Options and recommendation | complete | Plate portal plus Plite direct groups selected | Closed |
| Review and pressure | complete | Manual findings fixed; automated caveat recorded | Closed |
| Implementation | complete | Runtime, types, callers, docs, rules, and artifacts updated | Closed |
| Verification | complete | Focused tests, builds, audits, formatting, and artifact checks recorded | Closed |
| Closeout | complete | Final ledger and handoff prepared | Run checker and close goal |

Findings:
- Plite already materializes and guards every named transaction group before
  freezing the transaction view. A private host transform is sufficient.
- Plate already owns exact plugin binding and descriptor-family metadata, so it
  is the only honest owner for descriptor lookup.
- A plugin may legally use the name `plugin`; the portal must therefore be a
  callable proxy that also exposes that direct group's methods.
- Broad `PlateEditor` consumers cannot validate a closed installed tuple at
  compile time. Descriptor-local inference must supply the method type while
  runtime installation and family checks preserve safety.

Decisions and tradeoffs:
- Chosen: internal Plite transaction-view transform plus Plate
  `tx.plugin(Plugin)`. It preserves one transaction, exact runtime identity,
  descriptor inference, and the lower-layer boundary.
- Rejected: public Plite `tx.extension(Extension)`. It leaks lower-level
  vocabulary and duplicates direct named groups.
- Rejected: computed `tx[plugin.name]`. It is ugly, loses descriptor-local
  inference, and cannot validate descriptor family.
- Rejected: `editor.plugin(Plugin).update` inside a transaction. It opens a
  nested one-shot update and breaks atomic composition.
- Rejected: registering an ordinary extension named `plugin`. It conflicts with
  a legal user plugin of the same name.

Implementation notes:
- `setEditorTransactionViewTransform` runs after Plite materializes guarded
  read/update groups and before the transaction freezes.
- Plate snapshots installed plugin groups, installs a descriptor/name lookup,
  and restores the previous host transform if editor setup fails.
- Type projection combines scoped read and update capabilities. Closed editors
  reject missing literal names; broad editors infer from descriptors.
- Production computed callers were migrated to `tx.plugin(plugin)`. The More
  toolbar uses `tx.plugin(KbdPlugin).toggle()` within the same selection update.

Review fixes:
- Replaced the first ordinary `plugin` extension design with the internal host
  transform after identifying the legal-name collision.
- Added a callable proxy and runtime test proving both `tx.plugin(Plugin).run()`
  and direct `tx.plugin.run()` for a plugin named `plugin`.
- Repaired broad-editor descriptor inference after www typecheck exposed Kbd's
  generic mark `toggle` as absent; added a compile-only boolean-mark contract.

Error attempts:
| Error or failed attempt | Count | Different move | Resolution |
|---|---:|---|---|
| Bun selector omitted the leading relative path | 1 | Use `./packages/...` | Focused tests run and pass. |
| Exact doctrine patch context had changed | 1 | Read the owner range and patch current text | Source rules and generated mirrors validate. |
| Shell backticks triggered command substitution | 2 | Use single-quoted patterns | Audits reran without shell interpolation. |
| Initial Plite suite found a stale internal export contract | 1 | Update the exact internal smoke list | Plite 1433/1433 passes. |
| First broad-editor portal type lost generic mark updates | 3 | Inspect the resolved type and reuse descriptor-local update projection | Registry Kbd error is absent and compile contract is present. |
| Type introspection printed an oversized expanded conditional type | 1 | Inspect property names instead of rendering the full type | Output was capped and subsequent inspection stayed bounded. |
| Browser app failed before route render | 1 | Record exact generated-registry owner failure | No product code was changed around the unrelated missing file. |
| P2 model review rejected an oversized untracked schema file | 1 | Complete a manual owner review after the clean security scan | Two concrete findings were fixed and proved. |

Verification evidence:
- `pnpm --filter @platejs/plite test`: 1433 pass, 0 fail across 42 files.
- Focused `withPlite.slow.ts` portal pattern: 3 pass, 0 fail, 7 assertions.
- Eight migrated feature files: 188 pass, 0 fail, 400 assertions.
- `pnpm --filter @platejs/core build`: pass after final type repair.
- `pnpm --filter www api-reference:check`: pass.
- Registry changelog generator: 53 events checked.
- Plate Next registry: v68 valid, 42 active packages and 1 retired package.
- Final forbidden-call audit: zero `tx[*.name]`, `tx[name]`, or
  `tx.extension(` matches in packages, app source, or content.
- Scoped Biome: 19 files checked with no fixes; scoped diff check: pass.
- Wider www/Core typechecks are clean for this lane and report separately owned
  errors in List, Suggestion, Table, and Plite React. Full `withPlite.slow.ts`
  has one separately owned generated-schema default failure; the portal rows
  pass. Table's broad build has its separately owned numeric-property error.

Final handoff contract:
- Recommendation: keep this exact law: raw Plite uses direct named groups;
  Plate active transactions use descriptors through `tx.plugin`; generated
  closed Plate editors may use direct groups.
- Confidence: high for runtime, inference, migration, and layer ownership.
- Evidence: focused runtime/feature suites, full Plite suite, Core artifact
  build, source audits, API reference, docs parsing, rules validation, and
  release generators.
- Browser proof: unavailable because the current generated registry imports a
  missing `plate-types.ts` before any route can render.
- Review proof: security scan and manual P2 owner review complete; model scan
  could not ingest an unrelated oversized untracked schema file.
- PR or tracker: none requested; no git publication performed.
- Residual risk: app interaction should be rerun after the generated-registry
  owner restores its missing file; broad shared typechecks need their existing
  schema/React owners repaired.
- Next owner: generated registry and existing schema/React lanes, not this API.

Timeline:
- 2026-08-12: requirements, boundary, and goal captured.
- 2026-08-12: runtime/types implemented, computed callers migrated, doctrine
  versioned, docs and release artifacts updated.
- 2026-08-12: broad-editor mark inference repaired and final focused proof run.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Closeout after final verification. |
| Where am I going? | Run the plan checker, close the active goal, and hand off. |
| What is the goal? | Ship Plate `tx.plugin` while keeping Plite direct and migration-clean. |
| What have I learned? | Descriptor lookup belongs in Plate; Plite only needs a private pre-freeze projection hook. |
| What have I done? | Implemented, migrated, documented, versioned, and focused-tested the accepted API. |

Open risks:
- Browser interaction lacks rendered proof until the separately owned generated
  registry import is repaired.
- Full shared-tree typecheck remains red in existing List, Suggestion, Table,
  and Plite React schema/generic work; none cites the final portal call.
