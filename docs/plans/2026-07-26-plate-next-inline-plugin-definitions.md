# Plate Next inline plugin definitions

Objective:
Inline Link/Suggestion plugin-definition scaffolds and teach Plate Next to
reject them; done when zero same-class matches remain, doctrine v13 validates,
and scoped package/Core proof closes.

Completion threshold:
- `BaseLinkPlugin` and `BaseSuggestionPlugin` export complete builder chains
  directly with their real capability stages intact.
- Production source contains no private one-use plugin descriptor that only
  feeds an exported continuation.
- Plate Next v13 owns the rule, the structural checker rejects regressions, and
  generated skill mirrors expose the rule.
- Package inference, declaration emit, tests, build, formatter, doctrine
  validation, and scoped Core adoption proof are clean.

Verification surface:
- Link and Suggestion package typecheck, test, build, and emitted declarations.
- Plate schema-adoption checker contracts and production audit.
- Plate Next doctrine fingerprint/registry validation and generated mirrors.
- Exact production-source search for private plugin descriptor scaffolding.

Constraints:
- Preserve exported names, public contracts, behavior, and justified capability
  stages.
- Keep `ReactDOMPlugin`: it is an installed runtime identity, not a one-use
  continuation scaffold.
- Edit `.agents/rules/plate-next.mdc`, never the generated skill directly.
- Do not touch unrelated Basic Nodes or Layout shared work.

Boundaries:
- Code owners: `packages/link/src/lib/BaseLinkPlugin.ts` and
  `packages/suggestion/src/lib/BaseSuggestionPlugin.ts`.
- Enforcement owners: `tooling/scripts/check-plate-schema-adoption.mjs` and its
  contract test.
- Doctrine owners: `.agents/rules/plate-next.mdc`,
  `.agents/rules/plate-next/versions.json`, and generated skill mirrors.
- No browser, barrel, changeset, public API migration, package attestation, or
  all-package sync applies.

Blocked condition:
Stop only if direct chaining loses owner inference and requires an unsafe
cross-package builder change, or source doctrine cannot regenerate and validate.
Neither condition occurred.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt captured | yes | Fix every detected same-class drift, then repair Plate Next. |
| Mode | yes | Named repo-wide structural packet, not full package/Core review. |
| Skill source | yes | Full Plate Next skill read; `.agents/rules/plate-next.mdc` identified as source. |
| Agent-native review | yes | Reviewer skill loaded; source, mirror, discovery, and proof path mapped. |
| Public API | no | Export names and inferred contracts remain stable. |
| Release artifact | no | Private topology, checker, and agent-doctrine changes have no package-user delta. |

Work Checklist:
- [x] Record exact requirements and boundaries before source edits.
- [x] Audit production plugin builders and classify every candidate.
- [x] Inline the two one-use descriptor constants.
- [x] Preserve the legitimate Core runtime descriptor.
- [x] Add structural regression enforcement and focused contracts.
- [x] Bump Plate Next doctrine to v13 with a fresh fingerprint.
- [x] Regenerate skill mirrors from the source rule.
- [x] Run package, checker, doctrine, formatting, and scoped Core proof.
- [x] Review the exact packet and record shared-checkout blockers.

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Source audit | complete | Two drift rows found and fixed; `ReactDOMPlugin` classified as legitimate. |
| Runtime topology | complete | Link and Suggestion export direct chains. |
| Enforcement | complete | Checker contract passes 25/25 and audits exact stage signatures. |
| Doctrine | complete | Version 13 fingerprint and registry validate; mirrors regenerated. |
| Package proof | complete | Both packages typecheck, test, build, and emit strong declarations. |
| Review | complete | Manual scoped review clean; checkout-wide autoreview was stopped after five idle minutes on a 491,151-character shared diff. |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Same-class source sweep | yes | No `BaseLinkPluginDefinition` or `BaseSuggestionPluginDefinition`; only Core `ReactDOMPlugin` remains among private production builder descriptors. |
| Package inference | yes | Link and Suggestion typechecks exit zero; declarations emit `UnifiedExtendedBasePlugin`, not `any`. |
| Package behavior | yes | Link and Suggestion package tests and builds exit zero. |
| Structural checker | yes | `check-plate-schema-adoption.test.mjs` passes 25/25, including the new scaffold rejection. |
| Shared Core | partial | Link/Suggestion pass the adoption gate; full command exits only on unrelated Basic Nodes and Layout allowlist drift. |
| Doctrine registry | yes | Fingerprint `sha256:b8c91b98aeecb6d2beaeeef437feb3f858bf0e0ef643f743c09e0aab07145707`; v13 registry valid with 41 active and 1 retired. |
| Generated mirrors | yes | `pnpm install` regenerated Codex/Claude copies; both expose v13 and the rule and are byte-identical. |
| Formatting | yes | Biome passes all five changed code/JSON owners. |
| Browser | no | Structural package/tooling/skill work has no UI behavior. |
| Barrel | no | No export path or public file layout changed. |
| Changeset | no | No published package behavior, API, type, config, or runtime delta. |

Verification evidence:
- `pnpm --filter @platejs/link typecheck` — pass.
- `pnpm --filter @platejs/suggestion typecheck` — pass.
- `pnpm --filter @platejs/link test` and `build` — pass.
- `pnpm --filter @platejs/suggestion test` and `build` — pass.
- `node --test tooling/scripts/check-plate-schema-adoption.test.mjs` — 25/25.
- `pnpm check:core` — Link/Suggestion adoption clean; unrelated
  `BaseBlockquotePlugin` and `BaseColumnPlugin` allowlist drift remains.
- `node .agents/rules/plate-next/scripts/version.mjs doctrine-fingerprint` —
  exact v13 fingerprint recorded above.
- `node .agents/rules/plate-next/scripts/version.mjs validate` — 41 active,
  1 retired.
- `pnpm exec biome check` on changed code/JSON owners — pass.

Agent-native capability map:
| User action | Agent route | Source owner | Mirror | Proof | Status |
|---|---|---|---|---|---|
| Audit one-use plugin descriptors | `plate-next` | `.agents/rules/plate-next.mdc` | Codex/Claude `plate-next` skills | production audit plus checker contract | pass |
| Prevent recurrence | `pnpm check:core` | schema-adoption checker | N/A | focused 25/25 contract suite | pass |

Review decisions:
- Inline Link and Suggestion: the private constants had exactly one continuation
  consumer and no independent identity.
- Keep the stages: Link update consumes constructor API; Suggestion read,
  update, and extension consume accumulated capabilities.
- Keep `ReactDOMPlugin`: it is installed in the Core tuple and used as that
  tuple's descriptor type.
- Reject a changeset and barrel generation: neither public shape nor export
  topology changed.

Reboot status:
Current sources, generated mirrors, emitted declarations, checker fixtures, and
doctrine fingerprint were re-read after formatting and final proof.

Open risks:
- Shared checkout work leaves `pnpm check:core` red only for
  `packages/basic-nodes/src/lib/BaseBlockquotePlugin.ts` and
  `packages/layout/src/lib/BaseColumnPlugin.ts`; this packet neither caused nor
  modified those owners.
- Checkout-wide autoreview produced no result before manual termination after
  five idle minutes; the exact packet received a manual source/inference/proof
  review instead.
