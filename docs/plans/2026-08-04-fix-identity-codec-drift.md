# Fix identity codec drift

Objective:
Hard-cut every accepted identity and codec drift row so plugin capability
names, persisted schema identities, codecs, migrations, generated contracts,
docs, and enforcement agree on one current API.

Completion threshold:
- Capability identity uses `plugin.name`; persisted elements and properties use
  resolved `schema.type` and `schema.key`.
- Plate-owned codecs decode and encode through the resolved schema identity.
- Legacy document tags are handled only by explicit migrations.
- Schema fingerprints include every semantic field and exclude contributor
  provenance.
- Contract diffs retain every target-specific property declaration.
- Package, app, checker, lint, review, and completion gates are green.
- Browser execution is attempted and any infrastructure-only failure is
  classified with its exact owner.

Verification surface:
- Runtime: Plite, Core, Markdown, Media, Footnote, Suggestion, Basic Nodes,
  Mention, Slash Command, Emoji, Selection, and other directly affected
  package suites.
- Types: source-first Plite/Core/feature typechecks and the full `www`
  generated-editor and TypeScript checks.
- Enforcement: schema-adoption negative fixtures, full source/docs audit,
  Plate Next doctrine registry, lint, and whitespace checks.
- UI: standalone registry routes attempted through Browser after source proof.
- Review: bounded P2 autoreview on the complete identity packet.

Constraints:
- No compatibility aliases, duplicate identity portals, or literal fallback
  tags in current feature code.
- Do not edit templates or run `build:registry`; those outputs are CI-owned.
- Preserve unrelated shared-checkout work.
- Do not stage, commit, push, or message another task.

Boundaries:
- Plite owns schema compilation, identity fingerprints, generated contracts,
  and structural contract diffs.
- Plate packages own feature capability names, persisted identities, codecs,
  and feature migrations.
- Registry source owns copied-app consumption; generated public registries and
  templates remain CI outputs.

Blocked condition:
No source blocker remains. Browser route startup is unavailable because the
CI-owned `apps/www/src/__registry__/index.tsx` still imports the deleted
`@/registry/components/editor/plate-types.ts`; repo policy forbids regenerating
that output locally.

Work Checklist:
- [x] Freeze and repair every accepted identity/codec row and its direct fallout.
- [x] Hard-cut codecs and migration behavior to resolved persisted identities.
- [x] Repair schema fingerprint semantics and generated contract validation.
- [x] Repair target-specific property diff identity and add regression proof.
- [x] Regenerate the three source-owned editor contracts.
- [x] Update current docs, changesets, checker enforcement, and Plate Next law.
- [x] Run focused and full runtime/type/app proof.
- [x] Attempt Browser proof and classify the CI-owned registry blocker.
- [x] Close accepted P2 review findings and rerun review clean.
- [x] Record the final evidence and run the completion checker.

Phase / pass table:
| Phase | Status | Evidence |
| --- | --- | --- |
| Identity and codec implementation | complete | Current packages use capability names separately from resolved persisted schema identities; legacy tags live only in migrations. |
| Schema contracts | complete | Fingerprints include root text policy and property role, exclude provenance, and property diffs use owner-free compiled IDs. |
| Consumer adoption | complete | Docs, registry source, generated editor contracts, tests, and changesets use the final identity vocabulary. |
| Enforcement | complete | Checker fixtures, complete source audit, Plate Next v65 validation, lint, and diff checks pass. |
| Review | complete | Final bounded P2 autoreview reports zero accepted or actionable findings. |

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Runtime behavior | yes | Plite 1,424/1,424; Core 700/700; Media 86/86; Footnote 28/28; Suggestion fast 83/83 and slow 31/31. Earlier affected suites also passed: Markdown 189, Basic Nodes 57, Mention 11, Slash Command 4, Emoji 24, Selection 90. |
| Type contracts | yes | `@platejs/plite`, `@platejs/core`, Footnote, Suggestion, and the full `www` typecheck passed, including editor generation checks and package integration. |
| Generated contracts | yes | `editor.generated.ts`, editor-ai `editor.generated.ts`, and `copilot-editor.generated.ts` regenerated and passed `plate generate --check`. |
| Enforcement | yes | Schema-adoption fixtures 61/61; full audit passed across 4,248 source/docs files; Plate Next v65 validates 42 active and 1 retired package rows. |
| Formatting | yes | `pnpm lint:fix` rerun with no fixes; only 15 unrelated oversized artifact warnings. `git diff --check` passed. |
| Browser | yes | Browser attempted `/blocks/markdown-to-plite-demo` and `/dev/editor-perf`; both stopped at the same stale CI-owned registry import. Local registry generation is explicitly prohibited. |
| P2 review | yes | The final bounded 350,439-byte review is clean. One accepted P1 was fixed: same-key properties on disjoint targets can no longer overwrite each other in contract diffs. |

Verification evidence:
- `bun test packages/plite/test packages/plite/src`: 1,424 pass, 0 fail.
- `bun test packages/core/src packages/core/test`: 700 pass, 0 fail.
- `bun test packages/footnote/src`: 28 pass, 0 fail.
- Suggestion fast and slow suites: 83 pass and 31 pass.
- `pnpm --filter @platejs/plite typecheck`, Core, Footnote, Suggestion, and
  `pnpm --filter www typecheck`: pass.
- `bun test tooling/scripts/check-plate-schema-adoption.test.mjs`: 61 pass.
- `node tooling/scripts/check-plate-schema-adoption.mjs`: 4,248 files pass.
- `node .agents/rules/plate-next/scripts/version.mjs validate`: v65 valid,
  42 active and 1 retired.
- `pnpm lint:fix`: no fixes on final rerun; `git diff --check`: pass.
- Final P2 autoreview: clean with confidence 0.94.
- The accepted P1 regression removes either of two same-key, disjoint-target
  properties and requires exactly one migration-producing removal; contributor
  relabeling produces no change.

Reboot status:
The task can resume from this receipt without reconstructing context. Source,
tests, generated contracts, enforcement, and review are complete; only the
CI-owned registry regeneration can make the attempted Browser routes boot.

Open risks:
CI must regenerate the stale registry output before those routes can provide a
rendered Browser receipt. No product-source defect or unreviewed P0-P2 finding
is known.
