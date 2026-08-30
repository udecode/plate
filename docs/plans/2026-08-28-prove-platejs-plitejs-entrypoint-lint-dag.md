# Prove platejs and plitejs entrypoint lint DAGs

Objective:
Prove that Oxlint can enforce the public-entrypoint dependency DAG inside `platejs` and `plitejs` before any package consolidation.

Completion threshold:
- Every public entrypoint in both package manifests has one modeled source owner.
- Every modeled owner-to-owner direction is tested as allowed or forbidden.
- Real package sources pass the rule, package lint, and package typecheck.
- Static CommonJS and computed dynamic imports cannot bypass the policy.
- Packed artifacts still prove declarations, runtime isolation, package direction, and tree shaking.
- No package is cut, moved, renamed, merged, or republished.

Verification surface:
- The Oxlint configuration and custom entrypoint rule.
- The exhaustive direction/config tests under `tooling/scripts`.
- Both real package source trees.
- The full packed release-artifact consumer suite.
- Scoped lint, package lint, two-package typecheck, and policy audit.

Constraints:
- Preserve legitimate recursive file graphs inside one entrypoint owner.
- Do not enable broad `import/no-cycle` as a substitute for owner-level direction.
- Exclude package tests from production owner restrictions.
- Keep declaration, runtime, and bundle leakage in packed-artifact proof.
- Do not mutate unrelated checkout files, publish, commit, push, or open a PR.

Boundaries:
- Source of truth: `oxlint.config.ts`, `packages/plitejs/package.json`, `packages/platejs/package.json`, and their `src` trees.
- Edited implementation: `oxlint.config.ts`, `tooling/oxlint/entrypoint-dag-plugin.mjs`, `tooling/scripts/entrypoint-dag-plugin.test.mjs`, and `tooling/scripts/check-plite-release-artifacts.mjs`.
- Plan owner: `docs/plans/2026-08-28-prove-platejs-plitejs-entrypoint-lint-dag.md`.
- Browser, registry, public API, package exports, manifests, lockfile, and release versions are outside scope.

Blocked condition:
Stop only if installed Oxlint cannot execute a precise owner-level rule after three distinct approaches, or if closure requires changing public runtime behavior. Neither condition occurred.

Task state:
- flow: one-shot execution
- status: complete
- goal: active until the mechanical plan checker and goal update finish
- release artifact: none; implementation is internal lint and proof tooling

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured | yes | Scope includes both packages, pre-cut proof, exact DAG enforcement, and packed leakage checks. |
| Skills loaded | yes | Loaded `autogoal`, `task`, global `oxlint`, and `autoreview`. |
| Source owners read | yes | Read manifests, tsdown entries, public entry files, Oxlint config, and packed release checker. |
| Hard-cut counterfactual | yes | Package boundaries are not retained merely for import direction because Oxlint now owns that law. |
| Browser decision | no | Static lint and artifact tooling have no runnable browser surface. |
| Release artifact decision | no | No published package behavior, types, exports, or manifest changed. |
| Branch and PR decision | no | User requested local implementation only. |
| Output budget | yes | Later commands used focused paths, concise reporters, capped output, and summarized policy fields. |

Work Checklist:
- [x] Inventory every public `platejs` and `plitejs` entrypoint and its source owner.
- [x] Falsify broad `import/no-cycle` against the real source graph.
- [x] Model explicit acyclic dependencies for both entrypoint sets.
- [x] Resolve relative imports to source owners instead of matching raw path text.
- [x] Reject forbidden owner edges and relative source-root escapes.
- [x] Ban CommonJS in both ESM package source trees.
- [x] Reject computed dynamic import sources that cannot be classified.
- [x] Test all 202 modeled directions: 46 allowed and 156 forbidden.
- [x] Test manifest-to-map completeness and DAG cycle validation.
- [x] Test import, export, dynamic import, TypeScript import type, and import-equals syntax.
- [x] Prove real negative fixtures through the Oxlint CLI and remove the fixtures.
- [x] Run scoped formatting, lint, package lint, package typecheck, policy, and packed-artifact checks.
- [x] Repair the stale Plate facade artifact expectation and enable Plate-root declaration checking.
- [x] Run the permitted P1 review loop, fix every accepted finding, and stop at the three-invocation cap.
- [x] Record final evidence, risks, and handoff.

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Entrypoint coverage | yes | Test compares every non-metadata package export with the modeled owner names. |
| Acyclic map | yes | Map assertion passes and the synthetic cycle case fails. |
| Exhaustive direction proof | yes | 202 owner pairs are evaluated; all 46 allowed and 156 forbidden expectations pass. |
| Real source enforcement | yes | Both package source trees pass isolated `entrypoint-dag/no-forbidden-imports`. |
| CommonJS bypass closure | yes | Scoped `import/no-commonjs` rejects an actual bare `require` fixture. |
| Dynamic import bypass closure | yes | Computed import sources produce `dynamicImportSource`; literal dynamic imports follow the DAG. |
| Source-root escape closure | yes | Actual cross-package relative fixture and unit contract both fail. |
| Package lint | yes | `plitejs` and `platejs` package lint commands pass. |
| Package typecheck | yes | Turbo reports three successful tasks for the two package typecheck graph. |
| Packed artifact proof | yes | Four packed packages and 30 public subpaths pass NodeNext, Bundler, runtime, DCE, isolation, and direction checks. |
| Oxlint policy | yes | Exact-task fixture passes strict policy with no missing reasons, forbidden reasons, local overrides, or directive violations; the full dirty checkout separately reports unrelated existing directive violations. |
| P1 autoreview | yes | Three helper invocations were used. Four P1 findings were accepted and fixed. Direct proof passes; no fourth invocation or unsupported clean claim was made. |
| Final lint fix | yes | Scoped `ultracite fix` ran on all four implementation files, followed by a clean scoped check. |
| Browser | no | No browser-facing behavior changed. |
| Barrels and exports | no | No package export or exported source layout changed. |
| Changeset | no | Internal lint/test tooling has no published user-visible delta. |
| PR and tracker sync | no | No PR or tracker target was requested. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and source audit | completed | Entrypoints, exports, config, and artifact owners inventoried. | none |
| Enforcement implementation | completed | Owner resolver, DAG map, escape rejection, and CommonJS ban installed. | none |
| Deterministic proof | completed | Exhaustive matrix and syntax/config contracts pass. | none |
| Package and artifact verification | completed | Lint, typecheck, policy, and packed consumers pass at task scope. | none |
| Review and repair | completed | Accepted P1 findings fixed within the hard review cap. | none |
| PR and tracker sync | completed | N/A: local direct request. | none |
| Closeout | completed | Evidence and risks recorded. | final response |

Findings:
- `import/no-cycle` is the wrong abstraction here: its direct trial produced 636 lexical cycles from intentional barrels and recursive internal owners.
- Raw `no-restricted-imports` regexes cannot reliably resolve arbitrary nested relative paths to exported owners.
- An Oxlint JavaScript rule can resolve those paths precisely and enforce an explicit owner DAG without retaining package boundaries.
- `platejs/react` intentionally omits Plite's `useEditorContext` and `useOptionalEditorContext` because Plate exposes its own editor hooks; the packed facade expectation was stale.
- The Plate root packed consumer skipped typechecking, which left declaration leakage unproved; that skip is removed.

Decisions and tradeoffs:
- Keep global `import/no-cycle` disabled for internal file recursion.
- Use one canonical entrypoint map to drive classification, validation, diagnostics, and exhaustive tests.
- Treat all files not owned by a named public subpath as root-owned.
- Allow same-owner imports implicitly and only listed cross-owner dependencies explicitly.
- Reject all relative imports outside the package `src` root; shared code must use a declared package entrypoint.
- Ban CommonJS entirely in these ESM package source trees instead of duplicating every bare-import restriction for `require`.
- Keep packed consumers as the independent authority for emitted declarations, runtime imports, optional peers, and tree shaking.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|---|---:|---|---|
| Broad `import/no-cycle` trial reported 636 internal file cycles | 1 | Model public entrypoint owners | Owner DAG passes without flattening valid recursion. |
| TypeScript 7 stable export lacked the old compiler API | 2 | Use Babel for the temporary source inventory | Current owner edges were enumerated. |
| Initial generated rule matrix misclassified `page-layout/react` | 1 | Sort owner paths by specificity | Nested/file entrypoint cases pass. |
| Full packed proof expected two omitted hooks as overrides | 1 | Compare curated facade source and correct the expectation | Full packed proof passes. |
| Initial full-checkout autoreview secret scan stopped on unrelated dirty data | 1 | Review the exact four-file patch in an isolated Git fixture | Reviewer ran without exposing unrelated data. |
| P1 review found source escapes, CommonJS, and declaration-check gaps | 3 findings | Fix each owning policy | Negative and packed proofs pass. |
| P1 rerun found bare `require` bypass | 1 finding | Enable scoped `import/no-commonjs` | Actual bare require fixture fails. |
| Full dirty-checkout strict policy audit reported unrelated directives | 1 | Audit the exact task fixture with the same config and installed preset | Strict exact-scope audit exits zero. |
| Early verbose trial output exceeded the intended display budget | 3 commands | Use dot reporters, focused paths, caps, and JSON summaries | Remaining proof output stayed bounded. |

Verification evidence:
- `pnpm test tooling/scripts/entrypoint-dag-plugin.test.mjs tooling/scripts/check-plite-release-artifacts.test.mjs` — 24 passed, 0 failed.
- `pnpm exec oxlint --config oxlint.config.ts -A all -D entrypoint-dag/no-forbidden-imports packages/plitejs/src packages/platejs/src --format=unix` — exit 0.
- `pnpm --filter plitejs lint` — exit 0 across 1,653 files.
- `pnpm --filter platejs lint` — exit 0 across 386 files.
- `pnpm turbo typecheck --filter=./packages/plitejs --filter=./packages/platejs` — 3 successful tasks.
- Exact-task strict Oxlint policy audit — exit 0; preset audit complete; all reason, override, and directive violation lists empty.
- `pnpm plite:release:packages` — exit 0; four packages, 30 public subpaths, NodeNext/Bundler declarations, Node runtime, DCE, package direction, and isolated React boundaries verified.
- Scoped `ultracite fix` followed by scoped `ultracite check` — exit 0.
- CLI negative fixtures rejected root-to-React, non-root forbidden directions, source-root escape, and bare CommonJS imports; temporary fixtures were removed.
- P1 autoreview accepted four findings across the permitted loop; all four owning checks were repaired and rerun. The cap prevents a fourth helper invocation, so this plan does not label the review clean.

Final handoff contract:
- PR: N/A: no PR requested.
- Issue or tracker: N/A: direct local request.
- Confidence: high for source-level entrypoint enforcement and packed leakage proof.
- Browser: N/A: no browser surface.
- Outcome: Oxlint can enforce the entrypoint DAG; package boundaries are not required for that reason.
- Caveat: broad lexical cycle lint remains disabled, and the three-invocation review cap prevents a post-final-fix clean label.
- Design: source lint owns author-time directions; packed consumers own emitted artifact leakage.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Closeout complete. |
| Where am I going? | Mechanical plan check, goal completion, and final handoff. |
| What is the goal? | Prove Oxlint entrypoint DAG enforcement for both packages before consolidation. |
| What have I learned? | Resolved owner rules work; lexical cycle rules do not model this architecture. |
| What have I done? | Installed the rule, exhaustive tests, bypass closures, and packed proof repair. |

Open risks:
- The review helper cannot be called a fourth time, so there is no post-final-fix clean autoreview label; focused source, negative, package, type, policy, and packed checks all pass.
- Full-checkout strict policy still sees unrelated pre-existing directive violations outside this task; the exact-task policy fixture passes.
- No package consolidation was performed, so adoption risk belongs to the later cut plan rather than this proof.
