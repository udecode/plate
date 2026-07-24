# C05 HTML codec vertical

Objective:
Implement the C05 core HTML codec vertical; done when focused Core/type/lint
tests pass.

Current parent status:
C05 is complete and frozen. This file records the Core foundation checkpoint;
the product-family hard cut and final adoption proof are recorded in
`docs/plans/2026-07-24-c05-downstream-html-codec-hard-cut.md` and the parent
Wordgard plan.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-c05-html-codec-vertical.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: accepted architecture dossier plus parent execution handoff
- id / link: P-DOC-5 in docs/plans/2026-07-23-wordgard-full-architecture-audit.md
- title: C05 compiled bidirectional HTML node codec
- acceptance criteria:
  - Public inferred `.extendHtmlCodec()` self overload plus typed foreign
    descriptor overload compile with no callback parameter annotations.
  - Author-phase plumbing survives Base/Plate conversion and terminal
    configuration.
  - Private compiler publishes exactly one `plate:html` schema-owning
    `HostCodec`; generic `text/html` registration is rejected.
  - Ordering is plugin priority descending, rule priority descending, owner key
    ascending; unresolved static conflicts fail candidate compilation.
  - Encode callback/spec/patch failures abort the entire HTML value; decode
    delegation follows the compiled claim law.
  - Flat `parsers.html` whole-input hooks and HtmlPlugin API remain usable; no
    public `host` or `ingress` namespace is added.
  - Representative Bold, Paragraph, List, and property fixtures prove
    discriminated outputs and configured-target inference.
  - At this foundation checkpoint, the old node registry remains the sole live
    parser until the atomic family flip; the checkpoint must not enable dual
    node registries.
  - No classic expansion, templates, or generated registry edits.
  - Focused Core tests, typecheck, and lint pass; report exact API checkpoint
    and proof before broad family fanout.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: named pass/fail gates exist
- improvement loop: RED -> GREEN one observable behavior at a time
- final score / loop closure: N/A

Completion threshold:
- One compiler vertical is green with the public overloads, author-phase
  plumbing, private compiler/host lifecycle, conflict/abort laws, preserved flat
  hooks, HtmlPlugin integration, and four representative fixture families.
- Focused Core runtime tests, Core typecheck/type fixtures, and scoped lint pass.
- No product-family fanout beyond fixtures and no second live HTML node registry.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-c05-html-codec-vertical.md` passes.

Verification surface:
- Focused `packages/core` HTML compiler/API tests.
- `pnpm turbo typecheck --filter=./packages/core`.
- Focused package tests for any representative product fixture touched.
- `pnpm lint:fix` after GREEN.
- Source audits for one `plate:html`, generic `text/html` rejection, no
  `ingress`, no public Plate `host`, and no classic/template/registry edits.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Keep the old HTML node runtime authoritative until all product families can
  flip atomically; do not ship or test a dual-registry decision path.
- Preserve flat whole-input `query`, `transformData`, and `transformFragment`.
- No explicit callback parameter annotations; repair inference at its owner.
- No public Plate `host`/`ingress`, no classic investment, no generated
  registry/template edits.

Boundaries:
- Source of truth:
  `docs/plans/2026-07-23-wordgard-full-architecture-audit.md` P-DOC-5 plus
  current `packages/core`, representative plugin, and Plite DOM codec sources.
- Allowed edit scope: Core plugin/HTML compiler/runtime/tests/types, HtmlPlugin,
  representative Bold/Paragraph/List/property fixtures where required, one
  package changeset, and this goal plan.
- Browser surface: N/A for this unpublished compiler/type checkpoint; browser
  proof belongs to atomic family adoption.
- Browser strategy: N/A: no live route is enabled by this vertical.
- Tracker sync: N/A: no issue/Linear target supplied.
- Non-goals: full product migration, live parser flip, classic parity, registry
  work, templates, generated output, commit/push/PR.

Output budget strategy:
- Read exact source ranges and bounded `rg` file lists; exclude generated
  registry/templates/build output. Cap command output and run focused tests
  before package-wide checks.

Blocked condition:
- Stop only if current schema/HostCodec contracts make the accepted public shape
  impossible without changing Plite DOM or enabling a dual registry, after
  three distinct bounded implementation attempts.

Task state:
- task_type: public package API/compiler vertical
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:
- verdict: Core foundation and parent C05 hard cut complete
- confidence: 0.99
- next owner: N/A; parent C05 is frozen
- reason: Core runtime, types, hardening, product-family adoption, browser
  proof, and legacy-runtime deletion are green across the two C05 receipts.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-c05-html-codec-vertical.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and constraints above copy every parent requirement |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `best-api` accepted dossier plus complete `tdd` and `autogoal` reads |
| Active goal checked or created | yes | Goal created for this exact plan |
| Source of truth read before edits | yes | P-DOC-5; current BasePlugin/createBasePlugin/PlatePlugin/toPlatePlugin, compilePlateCodecs/model, HtmlPlugin/registry/runtime, representative schema sources |
| Tracker comments and attachments read | no | N/A: no tracker target or attachment |
| Video transcript evidence required | no | N/A: no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Extension-composition hard-cut and package type-contract guidance read |
| TDD decision before behavior change or bug fix | yes | TDD skill: tracer public type/runtime behavior first |
| Branch decision for code-changing task | no | N/A: parent assigned current shared checkout; no branch/PR requested |
| Release artifact decision | yes | Public `@platejs/core` API requires a package changeset before closeout |
| Browser tool decision for browser surface | no | N/A: unpublished compiler/type checkpoint has no live route |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker supplied |
| Output budget strategy recorded | yes | Exact reads, bounded searches, focused proof recorded above |
| Package/API pack selected | yes | `package-api` materialized |
| Public surface or package boundary identified | yes | `@platejs/core` BasePlugin author API and internal Plite DOM HostCodec boundary |
| Release artifact path selected | yes | `.changeset` for `@platejs/core`; exact bump follows changeset skill |
| `changeset` skill loaded when `.changeset` is required | yes | Skill loaded; existing Core patch changeset updated |
| Barrel/export impact decision recorded | yes | No package export map or exported file layout changed; `pnpm brl` N/A |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: schema-inferred HTML
      declarations compile once in Core into one private schema-owning host
      codec.
- [x] Release artifact requirement recorded: the existing
      `.changeset/auto-main-to-next-sync-platejs-core.md` Core patch changeset
      includes the final user-visible API.
- [x] Final handoff shape decided: feature/API checkpoint with exact tests,
      review result, adoption caveat, and no PR/tracker sync.
- [x] Branch handling recorded: N/A; parent assigned the shared checkout and no
      branch, commit, push, or PR was requested.
- [x] Local-env-rot retry policy recorded: N/A; no install-corruption signal
      occurred. `pnpm install` completed for the manifest update.
- [x] Workspace authority recorded: every proof command below ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: stale typed callbacks, active HTML, partial
      serialization, dual traversal, and matcher-index drift were covered by
      provenance, sanitizer, atomicity, exclusivity, and indexed-law tests.
- [x] Review/autoreview target selected: dirty local C05 Core vertical.
- [x] Agent-native review decision recorded: N/A; no agent/tooling source was
      changed.
- [x] Output budget discipline recorded and followed: reads/searches/tests were
      bounded to Core and capped.
- [x] Package/API pack: public API is existing exported BasePlugin/PlatePlugin
      types; private compiler remains internal; Core patch changeset updated.
- [x] Package/API pack: release artifact matrix applied through one existing
      `@platejs/core` patch changeset.
- [x] Package/API pack: `changeset` loaded; imperative one-line user impact,
      one package, patch bump.
- [x] Package/API pack: registry changelog N/A; no registry-only edits.
- [x] Package/API pack: no-artifact decision N/A; published Core users receive
      `.extendHtmlCodec()`.
- [x] Package/API pack: hard cut is explicit for schema mutation and generic
      `text/html`; the parent packet completed atomic product migration and
      legacy deletion after this foundation checkpoint.
- [x] Package/API pack: Core typecheck and focused package tests are green.
- [x] Package/API pack: no export map or exported file layout changed; barrels
      N/A. Existing Core changeset updated.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named focused tests, typecheck, lint, source audit | 173 tests, Core typecheck, lint, audits green |
| Bug reproduced before fix | yes | RED tracer/fuzz/reviewer hostile repros | whitespace fuzz and family-spoof repros failed before fixes |
| Targeted behavior verification | yes | Focused compiler and integration suite | 173/173 green |
| TypeScript or typed config changed | yes | Core package typecheck/contracts | green |
| Package exports or file layout changed | no | `pnpm brl` N/A | no export map or exported file layout edits |
| Package manifests, lockfile, or install graph changed | yes | `pnpm install`, package proof | install completed; Core proof green |
| Agent rules or skills changed | no | N/A | no agent rule/skill edits |
| Workspace authority proof | yes | Run in owning checkout | all commands ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | N/A | unpublished Core compiler/type checkpoint |
| Browser final proof | no | N/A | browser belongs to product adoption packet |
| CI-controlled template output changed | no | N/A | no template/generated registry edits |
| Package behavior or public API changed | yes | Core patch changeset | existing Core changeset updated |
| Registry-only component work changed | no | N/A | no registry edits |
| Docs or content changed | yes | Verify plan/source claims | this plan records exact source-backed evidence; no rendered docs surface |
| High-risk mini gate | yes | Cover realistic failures at owner boundary | provenance/security/atomicity/exclusivity/index tests green |
| Agent-native review for agent/tooling changes | no | N/A | no agent/tooling edits |
| Local install corruption suspected | no | N/A | no corruption signals |
| Autoreview for non-trivial implementation changes | yes | Run local structured review and verify findings | one P2 rejected: distinct required class tokens overlap because one element can contain both; independent Core review clean |
| PR create or update | no | N/A | no PR requested |
| Task-style PR body verified | no | N/A | no PR |
| PR proof image hosting | no | N/A | no PR/browser proof |
| Tracker sync-back | no | N/A | no tracker supplied |
| Final handoff contract | yes | Fill exact outcome/proof/caveat/design | complete below |
| Final lint | yes | `pnpm --filter @platejs/core lint:fix` | green |
| Output budget discipline | yes | Keep output bounded | bounded Core-only commands; no unbounded dump |
| Timed checkpoint | no | N/A | no duration requested |
| Goal plan complete | yes | Run completion script | final gate command follows this update |
| Public API / package boundary proof | yes | Audit inferred public API and private compiler | public methods/types in existing exported plugin modules; compiler internal |
| Release artifact classification | yes | Published Core API/runtime/types | patch changeset |
| Published package changeset | yes | One Core patch entry, no minor | `.changeset/auto-main-to-next-sync-platejs-core.md` |
| Registry changelog | no | N/A | no registry work |
| No release artifact | no | N/A | published Core delta has a changeset |
| Package typecheck/build/test | yes | Core typecheck plus focused tests | green |
| Barrel/export generation | no | N/A | no export/file-layout change |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan, dossier, Core owners read | implementation |
| Implementation | complete | inferred API, compiler, host, hardening, direct API | verification |
| Verification | complete | 173 tests, typecheck, lint, audits, reviews | closeout |
| PR / tracker sync | complete | N/A: none requested/supplied | final response |
| Closeout | complete | changeset and final evidence recorded | final response |

Findings:
- Generic product codecs already compile per-MIME host codecs in
  `compilePlateCodecs.ts`; HtmlPlugin currently claims `text/html` through that
  generic surface.
- Core always installs HtmlPlugin and BaseParagraphPlugin. A caller plugin with
  the same `p` key replaces the core Paragraph descriptor, enabling isolated
  compiled-runtime fixtures without activating two node registries.
- `prepareHtmlRegistry` owns only the flat whole-input hooks. Product node,
  mark, and property declarations compile through `.extendHtmlCodec()`; the
  legacy node-rule registry/runtime is deleted.
- `CompiledPlateModelBinding` already exposes element type, kind, property
  declarations/IDs, and model revision. Configured `targetPluginKeys` remain on
  resolved descriptors; no Paragraph-specific compiler branch is needed.
- Runtime schema APIs expose `property(...)` and `validateFragment(...)`, so
  unsupported significant claims and decoded fragment validity are observable.

Decisions and tradeoffs:
- Keep a dedicated `__htmlCodecExtensions` authoring array; generic codec
  machinery cannot express node-level composition.
- Publish one private `plate:html` host from the compiler owner. The completed
  packet has one compiled traversal and no legacy fallback.
- Test public types first, then one end-to-end compiled Paragraph path, then
  conflict/abort/List/property behavior.

Implementation notes:
- Added inferred self/foreign `.extendHtmlCodec()` declarations to Base/Plate
  plugin types and preserved author arrays through configuration/conversion.
- Locked schema ownership to plugin creation and kept descriptor schema
  immutable at runtime.
- Added private owner/target schema-family provenance so typed callbacks cannot
  be spread onto unrelated schemas.
- Compiled one `plate:html` host with indexed match/serialize dispatch, stable
  ordering/conflicts, exclusive legacy-or-compiled traversal, atomic encode,
  delegated decode, configured target resolution, and flat whole-input hooks.
- Kept direct HtmlPlugin decode tri-state internal: unavailable delegates,
  invalid compiled input returns public `null`, valid JSON `null` remains data.
- Allowed safe iframe/raster image output while rejecting active tags,
  `<base>`, handler/srcdoc attributes, unsafe/control-character URLs, and SVG
  data URLs.
- Added deterministic permutation, fuzz seed `0xc05`, and large-payload indexed
  callback proof. This foundation checkpoint performed no product-family or
  registry work; the parent packet later migrated every family without
  expanding classic, registry, or template scope.

Review fixes:
- Preserved exact case for CSS custom properties.
- Rejected document-global `<base>` on decode and encode.
- Skipped lower property/mark decoders once every applicable claim has a winner.
- Recorded and validated both owner and target schema families for every codec.
- Added self and foreign-owner hostile spread regressions.
- Structured autoreview P2 rejected: different required class tokens are not
  disjoint because `classList.contains` allows one element to satisfy both.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `bun test` over the 12 focused compiler/plugin/HtmlPlugin/legacy/model files:
  173 pass, 0 fail, 642 assertions.
- Post-fanout Core/compiler/helper/DOCX regression proof: 46 pass, 0 fail.
- Downstream style/list/DOCX/static projection proof: 55 pass, 0 fail.
- Standalone compiled HTML descriptor browser proof: 3 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck`: package, tests, and contracts green.
- `pnpm --filter @platejs/core lint:fix`: 406 files checked, no fixes/errors.
- Source audit: no `ingress`, no public `host`, no classic references in the
  C05 compiler/spec, one private `HTML_HOST_KEY = 'plate:html'`, and generic
  `text/html` registration rejects through `compilePlateCodecs`.
- Independent checkpoint review: no remaining Core P0/P1.
- Structured autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --prompt <C05 scope>`;
  one factually invalid class-overlap P2 rejected, no accepted finding.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker supplied
- Confidence line: 96%
- Flow table:
  - Reproduced: RED fuzz and hostile provenance repros; browser N/A
  - Verified: foundation 173/173, post-fanout 46/46, downstream 55/55,
    standalone browser 3/3, typecheck, lint, and review
- Browser check: compiled HTML descriptor route passes 3/3 in Chromium
- Outcome: Core foundation and the parent product-family hard cut are complete.
- Caveat: none for C05; aggregate release closure belongs to C32.
- Design:
  - Chosen boundary: schema-inferred declarations compiled privately into one
    Core host codec.
  - Why not quick patch: per-plugin parser edits cannot enforce global claims,
    provenance, atomic encode, or one traversal.
  - Why not broader foundation change: product migration, browser proof, and
    legacy deletion needed independent fanout before the atomic hard cut.
- Verified: exact commands and evidence above
- PR body verified: N/A: no PR

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A
- Issue / tracker: N/A
- Browser proof: parent compiled-descriptor Chromium proof is green
- Caveats: this file is the foundation receipt; downstream adoption has its own
  frozen receipt

Timeline:
- 2026-07-24T16:30:37.348Z Task goal plan created.
- 2026-07-24 Source audit completed; accepted boundary remains implementable.
- 2026-07-24 Core implementation, hardening, focused proof, typecheck, lint,
  changeset, source audit, and review completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Core checkpoint and parent C05 are complete |
| Where am I going? | N/A; C05 is frozen and handed to C32 aggregate closure |
| What is the goal? | Preserve one compiled HTML codec with flat whole-input hooks |
| What have I learned? | Private schema-family provenance is required for typed callback soundness |
| What have I done? | Public author API, compiler/host, product migration, hard cut, browser/type/test/lint/review |

Open risks:
- No active C05 risk. Composite patch targets, duplicate markers, conflicts,
  unsafe CSS, transparent table wrappers, family coverage, and legacy deletion
  are covered by the frozen parent receipts.
