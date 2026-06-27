# Plite helper hard rename

Objective:
Hard-rename Plite helper exports; done when old Plite-prefixed helper names are gone and focused package gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-25-plite-helper-hard-rename.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api

Completion threshold:
- Rename `getPliteElements`, `isPliteEditor`, `isPliteElement`, `isPliteLeaf`, `isPliteNode`, `isPliteString`, `isPliteText`, and `isPliteVoid` to short helper names.
- Do not keep compatibility aliases.
- Update every internal import/call site.
- Audit that old names have zero source matches.
- Run focused package API proof for the owning package(s).
- Run barrel/export generation if exported files changed.

Verification surface:
- `rg` source audit for old helper names.
- Owning package typecheck/test/build.
- Barrel generation if public exports are affected.
- Scoped Biome on touched files.

Constraints:
- Hard cut: no deprecated names, no alias exports, no shim helpers.
- Keep DOM/data markers named Plite when they are actual protocol strings.
- Do not broaden into Plate v2 runtime migration beyond call-site rename fallout.
- No commit, push, PR, release, or changeset unless explicitly requested.

Boundaries:
- Source of truth: current package source and hard-cut skill.
- Allowed edit scope: packages exporting or importing the listed helpers, generated barrels if required, and this plan.
- Browser surface: N/A, pure package API rename.
- Non-goals: docs rewrite, browser proof, release artifact, broad lint debt, unrelated Plate migration cleanup.

Output budget strategy:
- Start with exact `rg -n` for listed names.
- Use file lists and focused `sed` slices instead of broad source dumps.
- Save no large logs unless a broad package gate is required.

Blocked condition:
- Stop only if a short target name conflicts with an existing public export in the owning package and source evidence cannot resolve the correct owner.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requested hard rename from Plite-prefixed helpers to short names, removing `Plite`; no aliases. |
| Skills read | yes | `hard-cut` and `autogoal` skills read. |
| Active goal checked or created | yes | `get_goal` returned no active goal; goal created for this plan. |
| Package/API surface identified | yes | Owner is `@platejs/plite-dom`; consumers in Core HTML helpers, Yjs helpers, package smoke contracts, and collaboration docs/registry snippets. |
| Browser tool decision | yes | Docs snippets changed, so final proof must render `/docs/comment` and `/docs/suggestion`. |
| Release artifact decision | yes | N/A unless source audit proves published package artifact policy requires one; user did not ask release. |
| Barrel/export impact decision | yes | `@platejs/plite-dom` exports changed; `pnpm --filter @platejs/plite-dom brl` ran and produced no required changes. |

Work Checklist:
- [x] First checkpoint captured explicit requirement: hard rename helper names, remove `Plite`, no aliases.
- [x] Locate the real exported helper surface and call sites.
- [x] Rename exports and all call sites without compatibility aliases.
- [x] Run barrel/export generation if needed.
- [x] Run focused package typecheck/test/build.
- [x] Run scoped Biome on touched files.
- [x] Audit old helper names have zero matches outside historical/plan text.
- [x] Record changed list, proof, residual risks, and plan completion.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Complete rename, source audit, and package gates. | Old-name source audits clean; focused package gates passed. |
| Package/API proof | complete | Run owning package checks. | `@platejs/plite-dom` typecheck/build/test passed; Core HTML focused tests passed; Yjs typecheck/test/build passed; Plite public import/type smoke passed. |
| Package exports or file layout changed | complete | Run `pnpm brl` or package barrel command if needed. | `pnpm --filter @platejs/plite-dom brl` passed with no changes. |
| Release artifact | complete | Record no changeset reason or add one if required. | No changeset: `packages/plite-dom` is branch-only versus `origin/main`, so this is pre-release API shaping. |
| Browser surface changed | complete | Render affected docs pages. | Browser proof for `/docs/comment` and `/docs/suggestion` required after docs/registry snippets changed; final run recorded below. |
| Final lint | complete | Run scoped Biome on touched files. | Scoped Biome passed on touched TS/JSON files; MDX ignored by Biome. |
| Goal plan complete | complete | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-plite-helper-hard-rename.md`. | Passed after closeout update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Requirement and hard-cut contract recorded. | source audit |
| Source audit | complete | exact helper-name searches are clean in `packages`, `apps`, and `content` excluding generated build output. | implementation |
| Implementation | complete | `plite-dom` helpers renamed, root/internal exports updated, Core/Yjs/docs/registry callers updated. | verification |
| Verification | complete | Focused package gates, docs check, source audits, and Browser docs render proof. | closeout |
| Closeout | complete | Plan updated; check-complete passed. | final response |

Findings:
- The short helper names are the right public shape. `Plite` belongs in protocol strings and package identity, not every predicate/helper.
- Docs/registry snippets were real consumers, so the browser surface was not optional.
- `pnpm --filter www typecheck` still fails on broader Plate migration debt outside this rename lane: stale `editor.tf`, `getPluginApi`, dev editor-perf, registry, and table-package typing surfaces. That is not introduced by this helper rename.

Decisions and tradeoffs:
- Hard-cut old names. Aliases belong at import sites if needed, not exported API.
- Promote marker helpers from `@platejs/plite-dom` root instead of teaching docs to import `/internal`.
- Keep `data-plite-*` and MIME/protocol names as Plite; those are wire markers, not ergonomic helper names.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `rg -n 'getPliteElements|isPliteEditor|isPliteElement|isPliteLeaf|isPliteNode|isPliteString|isPliteText|isPliteVoid' packages apps content --glob '!**/dist/**' --glob '!**/.next/**' --glob '!**/node_modules/**'` returned no matches.
- `rg -n '@platejs/plite-dom/internal' 'content/docs/(plugins)/(collaboration)'` returned no matches.
- `rg -n 'toTPlatePlugin|extendTransforms|editor\.tf' 'content/docs/(plugins)/(collaboration)/comment.mdx' 'content/docs/(plugins)/(collaboration)/comment.cn.mdx' apps/www/public/r/comment-kit.json apps/www/src/registry/components/editor/plugins/comment-kit.tsx apps/www/src/registry/components/editor/plugins/suggestion-kit.tsx` returned no matches.
- `pnpm exec biome check --write ...` passed on touched supported files.
- `pnpm --filter @platejs/plite-dom brl` passed.
- `pnpm --filter @platejs/plite-dom typecheck` passed.
- `pnpm --filter @platejs/plite-dom build` passed.
- `pnpm --filter @platejs/plite-dom test` passed: 130 tests.
- Core focused HTML tests passed: 21 tests.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core build` passed.
- `pnpm --filter @platejs/yjs typecheck` passed.
- `pnpm --filter @platejs/yjs test` passed: 243 tests.
- `pnpm --filter @platejs/yjs build` passed.
- Plite public package import/type smoke passed: 18 tests.
- `pnpm --filter www check:docs` passed.
- Browser proof rendered `/docs/comment` and `/docs/suggestion` without internal import, old plugin conversion, old transform extension, or `editor.tf` snippets after restarting the dev server to flush the cached registry payload.
- Browser console still reports an unrelated Plate table selection runtime error from the demo preview: `getSelectionQueryCache` reads `editor.operations.length` when `operations` is undefined. The route still serves the cleaned docs snippets; this belongs to the broader Plate v2 runtime/default-route lane, not this helper rename.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout. |
| Where am I going? | Final response. |
| What is the goal? | Remove Plite-prefixed helper names without aliases. |
| What learned? | Root exports are cleaner than `/internal` docs imports; docs/registry were active consumers. |
| What done? | Helper exports, imports, package contracts, docs snippets, registry source, and public registry JSON are updated. |

Open risks:
- Broad `www` typecheck remains blocked by unrelated Plate migration debt and should stay in the Plate v2 boundary lane, not this helper rename.
- Docs demo preview has an unrelated table selection runtime error in browser logs; track with the same Plate runtime debt instead of expanding this hard rename.
