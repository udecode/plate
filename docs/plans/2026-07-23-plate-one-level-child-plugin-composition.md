# Plate plugin relationship composition

Objective:
Replace parent-owned optional plugins with required dependencies plus explicit
consumer composition. Completion requires agreement across Core, Code Block,
callers, docs, skills, release prose, type/runtime proof, and browser proof.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-plate-one-level-child-plugin-composition.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- docs
- public API
- browser

Mode:

- `standard`

Accepted target:

- Plugin descriptors have one installation relationship: `dependencies`.
- Every dependency is required and transitively installed.
- Optional capabilities are ordinary descriptors in the consumer's
  `plugins: [...]` editor, app, or registry array.
- An optional enhancement may depend on its required host. The host never
  bundles the enhancement.
- Package source exports individual capability descriptors. App and registry
  source own product presets and kit arrays.
- `override.plugins[key]` remains the weak-peer path for a package that cannot
  import a foreign descriptor or control the consumer kit. It applies only to
  an already-installed target, no-ops when absent, cannot mutate topology, and
  cannot disable a required dependency. Direct target configuration wins.
- `inject.parsers` is additive parser contribution, not plugin installation.
- No descriptor child `plugins`, `{ optional: Plugin }` wrapper, optional-child
  inference, depth rule, disabled tombstone, preset registry, or add/remove
  verb replaces the rejected model.

Code Block proving shape:

```ts
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  dependencies: [CodeLinePlugin],
});
```

```ts
export const CodeHighlightPlugin = toPlatePlugin(BaseCodeHighlightPlugin, {
  dependencies: [CodeBlockPlugin],
});
```

```ts
export const CodeBlockKit = [
  CodeBlockPlugin.withComponent(CodeBlockElement),
  CodeLinePlugin.withComponent(CodeLineElement),
  CodeHighlightPlugin.configure({
    options: { lowlight },
    render: { node: CodeSyntaxLeaf },
  }),
];
```

Plain Code Block support omits the final array entry. No disable flag or parent
configuration is required.

Completion threshold:

- Binary readiness: no live descriptor child `plugins`; Code Highlight owns
  its complete optional capability; current call sites and teaching use the
  final names and ownership; focused and broad verification pass; no accepted
  P0/P1 review finding remains; `check-complete` passes.

Verification surface:

- Core authoring types, inference, Base/React conversion, relationship
  resolution, weak-peer handling, publication, and type/runtime contracts.
- Code Block schema, normalization, decoration cache, React refresh, exports,
  tests, registry composition, integrations, EN/CN docs, and release prose.
- Bounded AST/search audits excluding historical migrations, changelogs,
  generated registry output, and templates.
- Source-first typechecks, focused Bun tests, barrels, docs checks, lint,
  Changesets, `/blocks/code-block-demo`, final API and agent-native reviews.

Constraints:

- The user accepted this dependency-only hard cut and explicitly said `go`.
- No compatibility aliases or runtime shims for `CodeSyntaxPlugin`.
- Preserve serialized syntax-mark identity where it is data format rather than
  public descriptor naming.
- Preserve `override.plugins` for weak package-to-package adaptation.
- Do not edit `templates/**`, `apps/www/public/r/**`, or generated registry
  output.
- Do not introduce package-exported kit arrays.
- Plite remains flat and unchanged.

Boundaries:

- In scope: Core descriptor relationship APIs and runtime; Code Block's
  highlighting capability; current package/app/registry consumers; current
  docs; doctrine; changesets; focused browser behavior.
- Source owners: `packages/core`, `packages/code-block`, affected registry and
  integration files, `.agents/rules/best-api.mdc`,
  `docs/vision/plate.md`, and this plan.
- Non-goals: runtime behavior profiles, arbitrary plugin graph mutation,
  behavior observability, unrelated package cleanup, file-shape refactors, and
  historical migration/changelog rewrites.
- Direct Plite boundary owners: none. Plate resolves descriptors before Plite
  receives a flat extension list.

Output budget strategy:

- Read exact owners and bounded semantic ranges; use AST/count scans for broad
  absence claims; record commands rather than streaming entire outputs.

Blocked condition:

- Block only if the live Core graph cannot express transitive required
  dependencies without reintroducing optional metadata, or if Code Highlight
  cannot be omitted while leaving a structurally valid plain Code Block.

Plate Plan state:

- status: complete
- phase: source-frozen handoff
- next: publish the exact receipt to the coordinating task
- handoff: implementation and proof complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | One installation relationship, explicit optional composition, weak-peer preservation, package kit rejection, hard cut, and full proof are recorded. |
| Active goal and plan verified | yes | Goal tool names this exact objective and plan. |
| Current owners read | yes | Core relationship owners, Code Block Base/React owners, registry kits, integrations, docs, tests, doctrine, and release prose were audited. |
| Best API target resolved | yes | Fresh Shadcn, Tiptap, Wordgard, ProseMirror, and Lexical source review favored explicit composition and dependency direction over parent-owned optional metadata. |
| Mode and execution boundary resolved | yes | The user accepted the corrected model and authorized implementation. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, and exports were grounded in live source.
- [x] Reusable public call shape has a `best-api` verdict.
- [x] Every concept-level decision has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and the absence of compatibility bridges are explicit.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional docs, browser, release, and doctrine work is resolved.
- [x] Core child `plugins` types/runtime/inference/tests are removed.
- [x] Code Highlight is an ordinary capability depending on Code Block.
- [x] Registry, app, package integrations, current docs, and release prose use
      the final ownership and naming.
- [x] Best API and Plate Vision teach dependency-only relationships.
- [x] Generated skills, barrels, broad checks, browser proof, review, and final
      source-frozen receipt pass.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Complete closure proof | Descriptor-child scan is zero; final source-first, runtime, declaration, docs, registry, and browser gates pass. |
| Fresh source evidence | yes | Recheck exact current owners and absence scans | Core graph owners, Code Block owners, registry composition, doctrine, docs, and release prose were reread after implementation. |
| Best API review | yes | Reject or repair P0/P1 findings | PASS: no P0/P1 findings; the normal path has one relationship and ordinary optional composition. |
| Conditional risk and adoption | yes | Complete docs, release, browser, type, and runtime proof | EN/CN docs, Changesets, generated skill, 19 source-first package checks, 222 tests, and the live demo pass. |
| Verification recorded | yes | Record exact final commands and browser result | Exact commands and route signals are recorded below. |
| Handoff prepared | yes | Record exact ownership, breaks, proof, and residual risk | Source-frozen ownership, hard cuts, proof, and root-lint caveat are recorded below. |
| Agent-native review | yes | Verify route, owner, mirror, and proof parity | PASS: `best-api` routes design, `.agents/rules` owns doctrine, generated skill agrees, and repeatable source/browser proof is named. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-plate-one-level-child-plugin-composition.md` | Final checker is the last ledger gate. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Core, Code Block, callers, docs, research, and doctrine audited. | Decide |
| Decide | complete | Dependency-only relationship and explicit optional composition accepted. | Execute |
| Execute | complete | Core hard cut and Code Highlight adoption applied. | Prove |
| Prove and hand off | complete | 19 source-first package checks, 222 focused tests, declaration builds, scans, docs/registry checks, Changesets, lint, and browser proof pass. | Source-frozen receipt |

Decision brief:

- outcome: one relationship model whose syntax matches its semantics.
- chosen shape: `dependencies` installs required capabilities; ordinary
  consumer arrays compose optional capabilities; optional enhancements depend
  on hosts.
- strongest rejected alternative: a descriptor `plugins` field containing
  optional children, including a heterogeneous required/optional wrapper.
- consequence: Core optional-child machinery is deleted and Code highlighting
  becomes a separately owned plugin.

Decision ledger:
| Surface | Current target | Owner | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| Descriptor relationships | `dependencies` only; required and transitive | Core plugin types and resolver | Delete child `plugins` from Base/React authoring, inference, conversion, publication, and tests | Type contracts, runtime graph tests, AST zero scan | high | accept |
| Optional capability | Ordinary consumer-array entry; enhancement depends on host | Package plus app/registry owner | Promote Code Highlight; omit it for plain code | Omission, configured highlight, replacement, cache, React refresh, browser | high | accept |
| Weak peer | `override.plugins[key]` adapts installed foreign targets only | Core resolver | Preserve existing narrow path and forbid topology/required disablement | Existing focused weak-peer contracts | medium | accept |
| Parser contribution | `inject.parsers` remains additive | Core parser model | Keep separate from graph installation | Existing parser projection contracts | low | accept |
| Package presets | No package-exported kit arrays | Registry/app | Compose Code Highlight in registry kits | Export scan and registry typecheck | medium | accept |
| Naming | `CodeHighlightPlugin`; serialized mark key remains syntax-oriented | Code Block | Hard rename public descriptors; keep `CodeSyntaxLeaf` renderer | Export/name scan, docs, changeset | medium | accept |
| Doctrine | Dependency-only law is reusable API taste | Best API and Plate Vision | Repair source rule and regenerate generated skill | Source/generated parity scan | medium | accept |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core hard cut | Core | Remove descriptor child `plugins` and optional-child-only inference/resolution/tests | Accepted target | One required transitive relationship remains | Core typecheck and focused tests |
| 2. Capability promotion | Code Block | Move schema mark, options, decoration, normalization, cache, and React refresh to Code Highlight | Core relationship final | Plain Code Block and optional highlighting are independently complete | Package typecheck and focused tests |
| 3. Adoption | Registry/apps/docs/release | Rename imports, compose optional entry, update current teaching and migration prose | Public descriptors final | No live stale name/ownership | Source scans, www checks |
| 4. Doctrine | Best API/Vision | Record reusable relationship law and regenerate skill | API accepted | Rule, Vision, and generated skill agree | `pnpm install`, parity scan |
| 5. Closure | All owners | Barrels, lint, broad type/tests, Browser, review, checker | Slices 1-4 complete | Frozen handoff with exact proof | Commands and route receipt |

Proof matrix:
| Claim | Evidence required | Current status |
| --- | --- | --- |
| Core has no descriptor child `plugins` | AST scan plus type/runtime contracts | passed: zero across 3,283 package TypeScript files |
| Required dependencies remain transitive and canonical | Core typecheck and resolver tests | passed |
| Plain Code Block is complete without highlighting | Omission test and browser behavior | omission test and live Code Block route passed |
| Code Highlight owns its full behavior | Schema/options/decorate/cache/React tests | 33/33 package tests passed |
| Optional composition is one removable registry line | Registry source and app typecheck | registry source check and app typecheck passed |
| Public naming and teaching are coherent | Current-source/doc scan, docs checker, changeset validation | passed; only historical migration/changelog mentions remain |
| Reusable doctrine is synchronized | Rule, Vision, generated skill | passed after `pnpm install` |
| No browser regression | `/blocks/code-block-demo` renders and highlights without console/plugin errors | passed: three languages, 99 highlighted tokens, zero warning/error logs |

Conditional evidence:

- High-risk scenarios: applies because public generics, graph resolution,
  schema ownership, React conversion, and package exports changed.
- External research: complete. Shadcn, Tiptap, Wordgard, ProseMirror, and
  Lexical were inspected as design evidence; Plate's source remains decisive.
- Issue/PR provenance: not applicable; this is a user-directed architecture
  hard cut in the current checkout.
- Docs/registry/browser/release/behavior-law owners: applies. Current EN/CN
  docs, registry source, changesets, doctrine generation, and the standalone
  Code Block demo are required. Historical docs and generated outputs are
  excluded.

Findings:

- A second relationship field contributed no semantics beyond “required or
  not,” then demanded depth limits, suppression, replacement, provenance, and
  type witnesses to make that ambiguity work.
- Optional capability ownership is clearer when dependency direction follows
  need: Code Highlight requires Code Block; Code Block does not know whether
  the app wants highlighting.
- Ordinary arrays already provide the clean Shadcn-like customization point:
  users add, remove, replace, and colocate complete descriptors as source.
- `override.plugins` solves a different problem: weak adaptation when a package
  intentionally does not own/import the foreign capability.
- Serialized syntax-mark identity is data compatibility, not a reason to keep
  the public descriptor name `CodeSyntaxPlugin`.

Decisions and tradeoffs:

- Reject both `dependencies` plus `plugins` and a heterogeneous single
  relationship array. One field with hidden optional markers is still two
  concepts and worse inference.
- Do not mark relationships optional. If the owner needs a capability, it is a
  dependency; otherwise the owner must not install it.
- Keep transitive dependencies; requiring consumers to flatten structural
  internals would leak package implementation and worsen upgrades.
- Keep consumer arrays flat and explicit for optional features.
- Do not add convenience flags, disable maps, optional wrappers, or a package
  preset export.
- Keep weak-peer overrides narrow and separate from installation.

Review fixes:

- Reversed the rejected parent-owned optional model after fresh framework and
  local-source review.
- Preserved `override.plugins` after distinguishing weak peer adaptation from
  app-owned typed composition.
- Reverted package-exported Basic Blocks kits; registry source owns presets.
- Preserved H1-H6 in registry Basic Blocks composition.
- Replaced `CodeSyntaxPlugin` with a capability-complete
  `CodeHighlightPlugin`, without aliasing the old public name.
- Fixed Core Base/React dependency inference at the owning generic rather than
  adding callback annotations.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial design kept descriptor `plugins` as optional defaults | 1 | Re-evaluate the need for two relationship concepts from ideal call sites | Rejected; dependency-only target accepted |
| Follow-up proposed `{ optional: Plugin }` in one array | 1 | Remove relationship optionality rather than encode it differently | Rejected; optional capabilities moved to consumer arrays |
| Doctrine multi-file patch missed live context | 1 | Read exact owner ranges and patch separately | Resolved |
| Initial Code Block large patch missed live context | 1 | Apply small owner-local patches | Resolved |
| Initial Core focused test exposed missing Base-to-React validation | 1 | Repair `toPlatePlugin` nominal validation at its boundary | Resolved; 113/113 pass |
| Code Block typecheck exposed a readonly tuple mismatch | 1 | Preserve readonly dependency inference at the owner | Resolved; package typecheck passes |
| A broad plan print exceeded useful context | 1 | Read bounded ranges, then replace the stale ledger in place | Resolved |
| TypeScript 7 package root did not expose the compiler API used by the first scan | 2 | Use the installed Babel parser with extension-aware TS/TSX modes | Resolved; bounded AST scans pass |
| A shell search used backticks inside double quotes | 1 | Rerun the exact scan with a single-quoted pattern | Resolved; only excluded historical docs match |
| Broad Turbo proof built unrelated artifact dependencies and exposed Floating declaration debt | 1 | Use the mandated source-first package lane and keep AI/Core declaration builds explicit | Resolved; all 19 scoped source-first checks and explicit declaration builds pass |
| AI declaration emit exposed private Markdown, Selection, and Plite inference names | 1 | Name the resolved Selection config and normalize AI's public descriptor option boundary | Resolved; `@platejs/ai` declaration build passes |
| List command handlers could not see a declared Indent dependency | 1 | Type extension command state from a non-recursive dependency capability editor and add Base/React contracts | Resolved; Core contracts, List, and www pass |
| AI Chat captured its own API before publication | 1 | Resolve the typed own portal by key when the emitted effect commits | Resolved; AI runtime tests pass |
| Root `pnpm lint:fix` reached unrelated Wordgard audit artifacts | 1 | Keep the task boundary and run the exact 83-file Biome gate | Scope passes; root-wide lint remains independently blocked by the Wordgard coverage manifest/scripts |

Verification evidence:

- `pnpm --filter @platejs/core typecheck` — pass.
- `pnpm --filter @platejs/core build` — pass.
- `pnpm --filter @platejs/code-block typecheck` — pass.
- `pnpm --filter @platejs/ai build` — pass; portable declaration emit.
- Source-first recursive typecheck for Core, Code Block, AI, Selection,
  Combobox, Comment, Suggestion, Table, Toggle, Docx IO, Link, Math, TOC,
  Footnote, Emoji, Mention, Slash Command, Layout, and www — 19 pass.
- Focused Core, Code Block, dependency-fixture, and AI tests — 222 pass,
  0 fail across 23 files.
- Descriptor-child AST scan — zero across 3,283 package TypeScript files.
- Non-Core `PluginConfig` stale-slot scan — zero references with more than
  nine arguments across 2,887 files.
- `pnpm --filter @platejs/code-block brl` — pass.
- `pnpm changeset status` — pass.
- Exact-scope `pnpm exec biome check ...` — 83 files, no fixes.
- `git diff --check HEAD` — pass.
- `/blocks/code-block-demo` — HTTP 200; three code blocks, JavaScript/Python/CSS
  selectors, 99 highlighted tokens, and zero browser warning/error logs.
- Agent-native review — PASS. API design routes through `best-api`; doctrine
  source and generated mirror agree; implementation and proof are repeatable
  from the plan.

Final handoff prepared:

- Ownership and target API: Core owns required transitive dependencies;
  consumers own optional composition; optional enhancements depend on hosts.
- Public breaks and adoption: descriptor child `plugins`,
  `BaseCodeSyntaxPlugin`, and `CodeSyntaxPlugin` are hard-cut; callers use
  `BaseCodeHighlightPlugin` and `CodeHighlightPlugin`.
- Applicable runtime/package/docs/browser decisions: Core and package source,
  current EN/CN docs, registry composition, doctrine, generated skill, and
  release prose agree.
- Proof and execution risks: relationship inference and Code Highlight
  lifecycle are covered by compile, runtime, declaration, app, and browser
  proof. Root-wide lint has unrelated Wordgard audit debt; the exact task
  surface is clean.
- Execution order and user attention: no API decision remains. Source is
  frozen for integration.

Timeline:

- 2026-07-23: initial one-level child-plugin plan created.
- 2026-07-23: package kit exports rejected; registry/app ownership restored.
- 2026-07-24: dependency-only hard cut, Code Highlight promotion, adoption,
  doctrine repair, and source/browser closure completed.
- 2026-07-24: user rejected both two fields and optional wrappers.
- 2026-07-24: dependency-only target accepted and implementation authorized.
- 2026-07-24: Core hard cut and Code Highlight promotion applied; focused
  tests and package typechecks passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final proof and adoption closure |
| Where am I going? | Generated doctrine, broad checks, Browser, review, checker, frozen receipt |
| What is the goal? | One required relationship plus explicit optional composition |
| What have I learned? | Optional child metadata was machinery without a distinct user job |
| What have I done? | Core and Code Block source adoption plus focused proof |

Open risks:

- Registry/app typechecking may expose an unconverted old Code Syntax import.
- Generated `best-api` skill may reveal contradictory source doctrine.
- Browser proof may expose a highlight lifecycle assumption not covered by
  package tests.
