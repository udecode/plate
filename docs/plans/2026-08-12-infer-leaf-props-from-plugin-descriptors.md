# Infer leaf props from plugin descriptors

Objective:
Infer live and static text/leaf renderer props from exact plugin descriptors,
adopt the API in Comment, and teach `best-api` the durable rule.

Completion threshold:
`PlateTextProps`, `PlateLeafProps`, `PliteTextProps`, and `PliteLeafProps`
infer the descriptor-local text shape and plugin context. Raw `Text` generics
remain valid. Comment uses stable owner descriptors without a configured-plugin
self-reference. Focused compile proof, lint, source/mirror sync, release prose,
agent-native review, and P2 review have no accepted finding.

Verification surface:
Core compile-only contracts cover live/static, styled/plain, descriptor/raw
text, exact plugin API, unknown-property rejection, and passing derived props to
the renderer components. Core, Comment, and www checks classify unrelated
shared-checkout failures explicitly. Browser proof is N/A because runtime and
rendered output do not change.

Constraints:
Preserve raw `Text` compatibility, avoid a runtime/API change, do not broaden
the descriptor contract beyond schema sources, and do not repair unrelated
shared checkout failures.

Boundaries:
Core owns renderer prop inference. Comment is the focused consumer. The source
rule is `.agents/rules/best-api.mdc`; `pnpm install` owns the generated skill
mirror. The existing Core major changeset owns release prose. No commit, PR,
push, tracker mutation, browser work, template output, barrel change, or
registry changelog is authorized or required.

Blocked condition:
Only an inability to infer both the descriptor-local text shape and plugin
context without widening raw `Text` callers would block this task. That
condition did not occur.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt captured | yes | User approved descriptor-bound Comment leaf props and said `go`. |
| Timed checkpoint | no | No duration was requested. |
| Skills | yes | Loaded `best-api`, `task`, `autogoal`, `changeset`, `tdd`, advanced TypeScript, agent-native reviewer, and autoreview. |
| Source owner | yes | Read live/static node props, `TextOf`, Comment base/react descriptors, and registry consumers. |
| TDD | yes | Added the compile-only contract before the Core implementation and observed descriptor inference fail. |
| Release artifact | yes | Updated the existing `@platejs/core` major changeset instead of duplicating it. |
| Browser | no | Type-only public API and annotation adoption; rendered behavior is unchanged. |

Work Checklist:
- [x] Capture every explicit requirement and non-goal before implementation.
- [x] Reproduce the missing descriptor inference with a red type contract.
- [x] Infer exact text shape and plugin context in live and static prop aliases.
- [x] Preserve raw `Text` generics and renderer-call compatibility.
- [x] Adopt stable package descriptors in live and static Comment renderers.
- [x] Avoid `typeof commentPlugin` because it installs `CommentLeaf` and would
      create a TypeScript initializer cycle.
- [x] Update the `best-api` source rule, Vision owner, generated mirror, and
      existing Core changeset.
- [x] Run focused compile proof, downstream typecheck, lint, diff check,
      agent-native review, and P2 autoreview.
- [x] Classify shared-checkout failures and reject the one false review finding
      against the live owner source.
- [x] Record final evidence and handoff.

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Named verification threshold | yes | Focused contract passed; no accepted review finding remains. |
| Bug reproduced before fix | yes | Initial Core contract run rejected all descriptor-based text/leaf aliases. |
| Targeted type proof | yes | Isolated TypeScript proof exited 0 and the official contract emit produced `leaf-props-descriptor-contracts.d.ts`. |
| Package checks | yes | Core contract, Comment, and www checks reached only existing Plite React/List/Suggestion/Table errors; no new contract, Comment, or renderer-call error remained. |
| Final lint | yes | Core and Comment `lint:fix`, scoped Biome, and scoped `git diff --check` passed. |
| Package exports or layout | no | Existing exported aliases/files changed in place; no barrel generation applies. |
| Install graph | no | No package manifest or lockfile changed. |
| Agent source and mirror | yes | `pnpm install` regenerated the skill and exact source/mirror paragraph comparison passed. |
| Release artifact | yes | Existing `.changeset/plugin-portal-scoped-api.md` describes all four descriptor-bound aliases; Core stays major. |
| Registry changelog | no | Registry edits only adopt the published Core type API and do not change registry behavior. |
| Agent-native review | yes | User action -> `best-api` -> source rule -> generated skill -> compile contract -> handoff is complete. |
| P2 autoreview | yes | Scoped review found only `api.id`; rejected because committed and live `BaseCommentPlugin` both define `id(leaf)` with comment-mark semantics. No accepted P0-P2 finding remains. |
| Browser proof | no | No runtime or visual behavior changed. |
| PR / tracker | no | User did not request public mutation. |
| Local install corruption | no | Failures are deterministic source errors in unrelated shared files, not install-corruption signals. |
| Output budget | yes | Reads and searches were scoped; long checks used bounded output. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake | complete | Owner, constraints, and red contract recorded. | None |
| Implementation | complete | Core aliases, Comment adoption, doctrine, and changeset updated. | None |
| Verification | complete | Focused compile/lint/sync/review gates closed. | None |
| Closeout | complete | Exact caveats and final handoff recorded. | None |

Findings:
- The local configured `commentPlugin` installs `CommentLeaf`; typing the
  component from that value creates a circular initializer. Imported
  `CommentPlugin` owns the same schema and plugin context without the cycle.
- Public prop aliases should accept descriptors, but generic `PlateLeaf` /
  `PlateText` callable signatures remain raw node/config generics. This lets
  already-derived props spread into renderers without demanding private
  descriptor witness fields.
- `BaseCommentPlugin.api.id(leaf)` returns the final comment-mark ID. The P2
  reviewer inferred the opposite from the old stale call site and was rejected
  after direct owner inspection.

Decisions and tradeoffs:
- Changed the whole symmetric text-renderer family, not only `PlateLeafProps`.
  Leaving Text, Styled, or static variants behind would preserve arbitrary API
  drift.
- Kept direct `Text` inputs for schema-agnostic code. This is additive type
  inference, not a hard cut.
- Reused the existing Core major changeset because this branch already groups
  the descriptor-bound element API there.

Implementation notes:
- `TextOf<TDescriptor>` supplies the descriptor-local leaf shape.
- `InternalPluginDefinitionOf<TDescriptor>` supplies the exact callback/plugin
  context.
- Comment retains scoped local store/API access through `commentPlugin`; only
  its component prop owner changes.

Review fixes:
- Restored raw node/config generics on renderer callable signatures after the
  first downstream check exposed a `suggestion-node` witness-field regression.
- Rejected the final autoreview finding with direct `BaseCommentPlugin` source:
  `id(leaf)` is the actual owner API in both committed and live source.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
|---|---:|---|---|
| Official contract/package checks stop at `plite-react/with-react.ts:178` | 3 | Isolate the new compile contract and inspect emitted declaration | New contract passed; shared failure recorded. |
| www check also reports List/Suggestion/Table shared errors | 1 | Compare errors before/after callable-signature correction | Comment and `suggestion-node` packet errors disappeared. |
| Local autoreview bundled unrelated huge untracked schema output | 1 | Review an isolated Git snapshot of packet files | Safe 23KB review bundle created. |
| Codex reviewer returned no JSON; first Claude call returned 529 | 2 | Retry the frozen bundle with Claude | Review completed. |
| Reviewer guessed `api.id` was absent | 2 | Inspect committed/live Comment owner source | `BaseCommentPlugin` defines `id(leaf)`; finding rejected. |

Verification evidence:
- `pnpm exec biome check --write <five packet files>`: pass, no fixes.
- Isolated `tsc` against the Core contract with Plite React declarations: exit 0.
- `pnpm --filter @platejs/core typecheck:contracts`: new contract emitted; only
  unrelated `packages/plite-react/src/plugin/with-react.ts:178` remains.
- `pnpm --filter www typecheck`: editor/API/docs/registry prechecks pass; no
  Comment or renderer-call error remains; unrelated List, Plite React,
  Suggestion, and Table source errors remain.
- `pnpm --filter @platejs/core lint:fix` and
  `pnpm --filter @platejs/comment lint:fix`: pass.
- `pnpm --filter @platejs/comment typecheck`: only the same unrelated Plite
  React source error remains.
- `pnpm install`: pass; generated skill mirror synced.
- Exact source/mirror paragraph comparison: pass.
- Scoped `git diff --check`: pass.
- Agent-native capability map: PASS. Human/component author action routes
  through `best-api`; rule owner, mirror, contract, and proof are discoverable.
- P2 autoreview: descriptor packet judged correct; sole finding rejected with
  direct owner evidence. No accepted actionable finding remains.

Final handoff contract:
- PR: N/A; none requested.
- Issue / tracker: N/A; direct local task.
- Confidence: high for the packet; unrelated shared source failures prevent a
  green whole-app typecheck claim.
- Browser: N/A; no runtime or visual change.
- Outcome: component authors can write
  `PlateLeafProps<typeof FooPlugin>` / static equivalents and receive exact leaf
  plus plugin context inference.
- Caveat: the checkout still contains unrelated Plite React/List/Suggestion/
  Table type errors.
- Design: Core is the inference owner; stable imported descriptors avoid
  consumer initializer cycles; raw `Text` remains for intentional erasure.
- Verified: focused compile, downstream absence audit, lint, skill sync,
  changeset audit, agent-native review, and P2 review.

Reboot status:
The descriptor-bound leaf/text prop packet is implemented and verified. No
in-scope work remains; only unrelated shared-checkout type errors remain.

Open risks:
Whole-repository typecheck is not green because active shared work has source
errors in Plite React, List, Suggestion, and Table. None originate from or mask
the focused descriptor contract or Comment adoption.
