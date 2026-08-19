# migrate Plate monorepo to Ultracite

Objective:
Produce an implementation-ready Plate monorepo Ultracite migration plan; done when Biome/ESLint topology, package overrides, phases, risks, and proof gates are complete; plan docs/plans/2026-08-18-migrate-plate-monorepo-to-ultracite.md.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-18-migrate-plate-monorepo-to-ultracite.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: direct user request plus current Plate repository source
- id / link: `/Users/zbeyens/git/plate-2`
- title: migrate the Plate library monorepo from Biome/ESLint to Ultracite Oxlint/Oxfmt
- decision to make: define the exact hard-cut architecture, Plate-specific rule/override policy, phased execution order, and proof gates without starting implementation
- decision criteria: the plan maps every current lint/format owner and workspace class; starts from IM policy but separates reusable global rules from Plate-only conditions; preserves monorepo library, tests, generated-output, package, app, docs, CI, editor, hook, and source-first Turbo contracts; names executable verification and rollback/stop conditions

Major lane:
- lane: framework/tooling migration plan
- output type: implementation-ready repository plan
- implementation expected: no; planning only until a later explicit instruction
- affected packages / surfaces: root tooling, all workspace package classes, apps, tests, fixtures, generated outputs, docs/content, templates, CI/hooks/editor/agent instructions, TypeScript project graph, public package build/typecheck/release checks
- dominant risk: importing an application-focused config into a public library monorepo and either weakening package correctness or drowning valid package/test/generated patterns in global exceptions

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: 45/100 before the repository topology and config audit
- improvement loop: inventory owners -> classify workspace/file families -> map old rules to Ultracite/Oxlint -> design phased hard cut and gates -> pressure-test against IM/global policy and Plate source
- final score / loop closure: 92/100; every active root/package/app/template owner and workspace/file family is classified, with implementation-time diagnostics and tsgolint attachment left as explicit fresh gates

Completion threshold:
- One durable plan contains: current Biome/ESLint/formatter ownership; monorepo workspace/file-family matrix; exact target presets/dependencies/config owners; global shared-off baseline; Plate-specific conditional and path-scoped override candidates with evidence; old-owner hard-cut inventory; ordered implementation phases; diagnostic triage rules; timing, package/API, tests, generated-output, docs, CI/hook/editor, and rollback gates; explicit non-goals and open risks.
- Every current root/workspace config, package script, CI/hook/editor/agent command, suppression family, and custom ESLint plugin/rule is mapped to keep, replace, narrow override, remove, or investigate during execution.
- The plan is actionable without rereading this chat and contains exact source paths and verification commands.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-migrate-plate-monorepo-to-ultracite.md`
  passes.

Verification surface:
- Read-only migration audit from `/Users/zbeyens/.codex/skills/migrate-to-ultracite/scripts/audit-project.mjs`.
- Source inventory of root/workspace package manifests, Biome/ESLint/Prettier configs, Turbo/CI/hooks/editor/agent owners, TypeScript configs, suppression counts, and file-family counts from `/Users/zbeyens/git/plate-2`.
- Rule-policy comparison against IM and the global `migrate-to-ultracite` policy, with Plate-only differences explicitly justified.
- Mechanical plan completion check with the exact command named below.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Start from IM's proven Ultracite shape, but do not copy IM legacy/application exceptions without Plate source evidence.
- Treat Plate as a public pnpm/Turbo library monorepo with heterogeneous packages, apps, tests, fixtures, generated output, templates, docs, and release artifacts.
- Do not weaken a rule because of error volume. Classify false-positive, semantic-change, conflict, robustness, laundering, or style-only evidence.
- Do not run unsafe/dangerous bulk fixes in the future execution plan.

Boundaries:
- Source of truth: current `/Users/zbeyens/git/plate-2` configs, manifests, scripts, workspace graph, CI/hooks/editor/agent instructions, and the global `migrate-to-ultracite` policy; IM is reference evidence, not Plate authority.
- Allowed edit scope: this plan file only.
- External sources: official Ultracite/Oxlint behavior already captured by the global skill; refresh only if local installed APIs or repo evidence conflict.
- Browser surface: N/A: planning-only tooling migration; future implementation keeps browser/app gates only where changed formatter/lint ownership affects runnable app/content surfaces.
- Tracker sync: N/A: no tracker item owns this request.
- Non-goals: no dependency/config/script edits, no formatting churn, no diagnostic fixes, no package source changes, no commit/push/PR, no changeset, no template generation, no registry build.

Output budget strategy:
- Start with filenames/counts and structured manifest extraction. Exclude `node_modules`, `.git`, build output, cache trees, generated binaries, and large fixtures from broad text output. Cap source reads to exact config/manifest slices. Save any high-volume rule/suppression inventory under ignored `tmp/ultracite-plan/` and summarize counts/top owners in this plan.

Blocked condition:
- Stop only if the current checkout lacks an authoritative active lint/format owner or a required workspace command cannot be resolved from source after bounded searches. Missing implementation-time diagnostic counts do not block this planning artifact; the plan must name them as Phase 1 evidence to capture.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: user review
- goal_status: complete

Current verdict:
- verdict: use one canonical Plate Oxlint policy module, one root entry config, two nested Next app configs, one root Oxfmt config, and zero package-local configs; migrate CI-owned templates through their generator/sync owner instead of editing `templates/**`
- confidence: 92/100 for the plan; implementation-time diagnostic counts and tsgolint attachment are deliberately fresh execution gates
- next owner: user review, then the same thread executes this plan when explicitly asked
- reason: Oxlint nested configs are the only clean way to keep Next rules in `apps/www` and `apps/plite` without leaking them into 61 public library packages; a canonical policy module prevents 64-workspace drift

## Executive decision

Migrate Plate as three owned lanes:

1. **Root monorepo:** pnpm/Turbo, 61 public packages, root tooling, benchmarks,
   tests, and two apps.
2. **Next app overlays:** `apps/www` and `apps/plite` inherit the root React
   policy, then add native Next and curated Next React Doctor rules.
3. **Generated templates:** `plate-template` and `plate-playground-template`
   receive standalone Bun/Next configs from a deterministic tooling source and
   the existing CI sync path. Never hand-edit or commit `templates/**`.

Do not create package-local Oxlint configs. Sixty package manifests already
delegate linting through `plate-pkg`; the durable owners are the root command,
`packages/plate-scripts/run-with-pkg-dir.cjs`, and the shared config module.

## Facts, inference, and recommendation

### Confirmed facts

- Root lint is `biome check .` plus React Hooks ESLint
  (`package.json:75-83`). Two warm runs passed in 13.55s and 11.99s, mean
  12.77s.
- The current gate is green with noise: Biome checks 4,031 files and reports 15
  oversized internal artifact warnings; ESLint reports 19
  `react-hooks/exhaustive-deps` warnings across eight files.
- `biome.jsonc:3-301` owns formatting, Core/React/Next presets, ignores, global
  relaxations, and nine path override families.
- `eslint.config.mjs:1-80` owns only React Hooks/Compiler lint through Babel. It
  ignores tests, declarations, configs, tooling, templates, and build output.
- The ESLint comment says packages need React 18 compatibility, but 43 package
  manifests currently require React `>=19.2.0`; the blanket package Compiler
  waiver is stale.
- Plate has 64 active app/package manifests in the bounded workspace audit: 61
  public and three private. Sixty-one expose lint scripts; sixty delegate to
  `plate-pkg` and `apps/www` invokes ESLint directly.
- The repository has 144 `tsconfig*.json` files. Root TypeScript includes JS but
  excludes package source tests; type-aware assignment must be measured rather
  than assumed.
- Existing source contains 58 Biome directives across 45 files and 68 ESLint
  directives across 47 files in the bounded scan. The main ESLint groups are
  12 `rules-of-hooks`, 12 `exhaustive-deps`, ten `no-redeclare`, six
  `no-param-reassign`, four `set-state-in-effect`, three
  `class-methods-use-this`, and two `refs` directives.
- Bun module replacement is common: 193 `mock.module(...)` calls across 45
  files. Existing test runners isolate module-mocking files; Anti-Slop does not
  detect Bun module mocks.
- Fifty-eight package root index files exist, and at least 45 declare
  `Automatically generated by barrelsby`. `pnpm brl` is a required owner.
- `packages/browser` is a published first-party package. Its current Biome
  exclusion is wrong and must not survive the migration.
- `templates/**` contains two independent Bun/Next toolchains, but Plate policy
  declares the directory CI-controlled output. The source owner is the template
  update/sync tooling and workflow, not direct edits.

### Inference

- A flat Next-enabled root config would report Next rules against generic
  package JSX. Per-package configs would create 60+ drift points. Nested app
  configs over one canonical policy are the smallest correct shape.
- Plate can delete `eslint-plugin-react-hooks`: Oxlint's native
  `react/exhaustive-deps`, `react/rules-of-hooks`, and
  `react/react-compiler` cover the current owner. The Compiler rule runs React
  Compiler analysis and reports actual Rules of React violations by default;
  ordinary optimization bailouts require an explicit option and are not the
  default.
- Type-aware lint should cover every first-party production source file. Tests
  and type-contract files may remain outside a tsgolint project only when their
  exact package/typecheck owner is recorded; they still receive syntactic lint.
- The migration should reduce owner count and warnings, not merely replace
  executables. Final policy is zero warnings, zero old suppressions, and no
  legacy formatter/editor ownership.

### Recommendation

- Start from IM's pinned shape: Ultracite, Oxlint, Oxfmt,
  `oxlint-tsgolint`, selected React Doctor, Anti-Slop, type-aware TS7,
  `singleQuote: true`, eight-thread candidate scripts, and the 99 shared global
  negative-sum exceptions.
- Do not copy IM's database/provider/legacy React exceptions. Add only
  source-proved Plate rules and overrides below.
- Keep the real TypeScript 7 source-first typecheck as a separate gate. Do not
  enable Oxlint's experimental `typeCheck` or make lint depend on package
  builds unless debug evidence proves a release-artifact owner.

## Current ownership map

| Surface | Current owner | Target owner | Decision |
|---|---|---|---|
| Root lint/format | `biome.jsonc`, `eslint.config.mjs`, `package.json` | `oxlint.config.ts`, `oxfmt.config.ts`, `ultracite check/fix` | Hard cut after new lint is green |
| Shared rule policy | Biome global rules plus scattered ESLint defaults | `tooling/config/oxlint-policy.mjs` | One structured list with rule, P-tier, criterion, condition, and scope |
| Shared preset composition | Root Biome Core/React/Next | `tooling/config/oxlint-base.mjs` | Core + React + selected React Doctor + Anti-Slop; no Next |
| Next apps | Root presets, ESLint only partly covers `apps/www`; `apps/plite` lacks hooks lint | `apps/www/oxlint.config.ts`, `apps/plite/oxlint.config.ts` | Nested configs extend shared base, native Next, and Next React Doctor |
| Public packages | Sixty package scripts -> `plate-pkg` -> Biome | Root config plus `plate-pkg` -> Ultracite | No package-local configs or manifest churn |
| `apps/www` commands | Direct ESLint | App-local `ultracite check/fix`; debug via `OXC_LOG=debug` | Preserve app-local developer command |
| `apps/plite` commands | Root Biome only | Add app-local `lint`/`lint:fix` plus nested config | Makes the proof app independently checkable |
| Formatting | Biome for supported code; Prettier only as VS Code fallback | Root Oxfmt and Oxc VS Code extension | One formatter; include `content/**`, exclude internal/generated owners |
| Generated barrels | Barrelsby plus Biome formatting; assist excludes package indexes | Barrelsby plus Oxfmt with import sorting disabled for generated indexes | Prove `brl -> fix -> brl` idempotence |
| Template copies | Checked-in CI output with independent Biome/ESLint configs | Deterministic template-tooling source, then CI regeneration/sync | Never hand-edit `templates/**` |
| CI | Root command plus filters naming Biome/ESLint | Existing check commands plus Oxlint/Oxfmt config filters | No duplicated lint job |
| Hook | Root `lefthook.yml` is comments only; template hooks run Ultracite | Delete root sample-only file; keep/update generated template hooks | Do not invent a root hook |
| Editor | Biome/ESLint plus Prettier fallback | `oxc.oxc-vscode`, format on save, explicit Oxc fix | Remove stale extensions/settings |
| Agent/docs commands | Mostly neutral `pnpm lint:fix`; one patch rule and CN contribution doc name old owners | Source rule/docs updates then `pnpm install` sync | Historical receipts stay historical |

## Target configuration architecture

### `tooling/config/oxlint-policy.mjs`

Own the complete reusable rule object as structured data. Each explicit `off`
entry records:

- rule id;
- P0/P1/P2 tier;
- criterion such as false-positive, conflict, semantic-change,
  counterproductive, robustness, valid-pattern, or style-only;
- exact condition for staying off;
- global or preferred narrow scope.

Export both the policy rows and `plateRuleOverrides`. Configs consume the rule
object; a focused contract validates uniqueness, reasons, scopes, expected
counts, and Plate-specific decisions.

### `tooling/config/oxlint-base.mjs`

Compose:

- `ultracite/oxlint/core`;
- `ultracite/oxlint/react`;
- `selectJsPlugins(['react-doctor'])` only;
- `ultracite/oxlint/anti-slop`;
- shared ignore and override families;
- `plateRuleOverrides` last so explicit policy wins over preset defaults.

Use `jsPluginSettings` wherever React Doctor is active. Do not extend the full
`js-plugins` preset: that also loads GitHub and Sonar plugins and their slower
dependencies.

### Root `oxlint.config.ts`

- Extend the shared base.
- Set root-only options:
  - `typeAware: true`;
  - zero warning tolerance;
  - deny unused disable directives;
  - stop respecting legacy ESLint directives at final hard cut.
- Keep TypeScript's own source-first `pnpm typecheck`; do not set
  experimental `typeCheck`.
- Do not invoke Oxlint with `--config`. Official Oxlint behavior disables
  nested config lookup when an explicit config path is passed.

### Nested app configs

`apps/www/oxlint.config.ts` and `apps/plite/oxlint.config.ts`:

- extend shared base, then `ultracite/oxlint/next` and
  `ultracite/oxlint/next/js-plugins`;
- reapply `plateRuleOverrides` last;
- set `jsPluginSettings` and the appropriate Next app root;
- never repeat root-only type-aware/type-check options;
- add only app-local generated/test/UI overrides.

Oxlint uses the nearest config and does not merge parent configs automatically,
so explicit shared-base inheritance is mandatory.

### Root `oxfmt.config.ts`

- Extend `ultracite/oxfmt` with `singleQuote: true`.
- Keep import and package JSON sorting initially enabled.
- Configure Tailwind sorting against `apps/www/src/app/globals.css`.
- Disable import sorting for generated `packages/**/src/index.{ts,tsx}` while
  retaining normal formatting.
- Include `content/**` and validate MDX; exclude internal docs, agent trees,
  generated/template/donor/archive/output paths.
- If package manifest ordering or barrel regeneration fights Oxfmt, fix the
  generator or use the narrow Oxfmt override. Do not alternate formatters.

## Rule policy

### Shared global baseline

Materialize all 99 rules from the global `migrate-to-ultracite` policy. The
grouped inventory is:

| Family | Count | Rules |
|---|---:|---|
| Anti-Slop | 7 | `no-conditional-empty-object-spread`, `no-known-value-widening`, `no-object-parameters`, `no-runtime-typeof`, `no-shape-in-symbol-names`, `no-unknown-parameters`, `require-safety-comment-for-type-assertion` |
| ESLint core | 20 | `class-methods-use-this`, `complexity`, `default-case`, `func-style`, `max-classes-per-file`, `no-await-in-loop`, `no-bitwise`, `no-eq-null`, `no-inline-comments`, `no-negated-condition`, `no-nested-ternary`, `no-plusplus`, `no-use-before-define`, `no-void`, `prefer-destructuring`, `prefer-named-capture-group`, `require-await`, `require-unicode-regexp`, `sort-keys`, `sort-vars` |
| Import | 4 | `consistent-type-specifier-style`, `default`, `namespace`, `no-named-as-default-member` |
| Promise | 8 | `avoid-new`, `no-callback-in-promise`, `no-nesting`, `no-promise-in-callback`, `prefer-await-to-callbacks`, `prefer-await-to-then`, `prefer-catch`, `spec-only` |
| React Doctor Next | 4 | `nextjs-no-client-fetch-for-server-data`, `nextjs-no-client-side-redirect`, `nextjs-no-edge-og-runtime`, `nextjs-no-use-search-params-without-suspense` |
| React | 5 | `function-component-definition`, `hook-use-state`, `jsx-handler-names`, `jsx-no-constructed-context-values`, `no-unescaped-entities` |
| TypeScript | 19 | `consistent-generic-constructors`, `consistent-return`, `consistent-type-definitions`, `no-confusing-void-expression`, `no-dynamic-delete`, `no-extraneous-class`, `no-non-null-assertion`, `no-unnecessary-boolean-literal-compare`, `no-unnecessary-condition`, `no-unnecessary-type-conversion`, `no-unsafe-type-assertion`, `non-nullable-type-assertion-style`, `parameter-properties`, `prefer-for-of`, `prefer-nullish-coalescing`, `prefer-regexp-exec`, `promise-function-async`, `strict-boolean-expressions`, `strict-void-return` |
| Unicorn | 32 | `catch-error-name`, `consistent-existence-index-check`, `consistent-function-scoping`, `filename-case`, `import-style`, `no-array-for-each`, `no-array-method-this-argument`, `no-array-reduce`, `no-array-reverse`, `no-array-sort`, `no-await-expression-member`, `no-negated-condition`, `no-nested-ternary`, `no-object-as-default-parameter`, `no-static-only-class`, `no-useless-undefined`, `prefer-class-fields`, `prefer-default-parameters`, `prefer-dom-node-append`, `prefer-export-from`, `prefer-import-meta-properties`, `prefer-logical-operator-over-ternary`, `prefer-number-coercion`, `prefer-query-selector`, `prefer-single-call`, `prefer-spread`, `prefer-string-replace-all`, `prefer-string-starts-ends-with`, `prefer-structured-clone`, `prefer-ternary`, `prefer-type-error`, `switch-case-braces` |

The policy source keeps the full namespace on every rule and its exact reason;
this grouped table is only a review index.

### Plate-wide additions

| Rule | Verdict | Reason |
|---|---|---|
| `oxc/no-barrel-file` | Off globally | P0 conflict: generated public barrels are a release/API owner enforced by `pnpm brl`; banning them contradicts package architecture. |
| `typescript/no-empty-interface` | Off globally | P0 duplicate ownership: `typescript/no-empty-object-type` is also enabled; declaration merging gets a declaration override. |
| `unicorn/prefer-string-slice` | Off globally | P0 semantic change: Plate currently permits `substr`/`substring`; `slice` differs for reversed bounds and algorithmic callers choose locally. |

### IM exceptions not inherited

- Keep `react/exhaustive-deps`, `react/rules-of-hooks`, and
  `react/react-compiler` enabled. Fix or narrowly waive the current 19 warnings;
  never copy IM's legacy global dependency/Compiler exceptions.
- Keep `typescript/no-explicit-any`, unsafe-value rules,
  `anti-slop/no-unknown-returns`, and `anti-slop/no-unsafe-dictionary-type`
  enabled in production source. Tests/provider boundaries receive exact
  overrides only after diagnostics.
- Keep `no-shadow`, `no-empty-function`, `no-warning-comments`,
  `logical-assignment-operators`, and other IM-only global exceptions enabled
  until representative Plate diagnostics prove the global condition.
- Keep `anti-slop/no-module-mocking` enabled. It catches Jest/Vitest only; a
  manual Bun mock audit and existing isolation-runner contracts cover Plate's
  193 Bun module mocks.

### Stronger explicit options

- `eqeqeq: ['error', 'smart']`.
- `no-console` errors except `assert`, `error`, `info`, and `warn`.
- `no-unused-vars` allows rest siblings and underscore-prefixed intentional
  bindings; unmarked dead values still fail.
- `react/no-unstable-nested-components` allows components passed as props.
- `typescript/no-misused-promises` excludes correctly typed React attributes.
- `typescript/return-await` uses `error-handling-correctness-only`.
- `typescript/no-floating-promises` remains enabled with Bun
  `mock.module` in `allowForKnownSafeCalls`. Replace eight ambient mock users
  with explicit `bun:test` imports if the type-aware match requires it.

## Override matrix

| Family | Initial scope | Initial exceptions | Governing condition |
|---|---|---|---|
| Unchecked JavaScript | `**/*.{cjs,cjsx,js,jsx,mjs,mjsx}` where `checkJs` is false | type-aware unsafe argument/assignment/call/member/return, base-to-string, misused-promises | Type information is absent; do not report unresolved values as unsafe facts. |
| CJS/runtime config | exact `.cjs` package/tool scripts | `unicorn/prefer-module` and ESM-only rules only when conversion changes runtime loading | Keep CommonJS only at actual package/Node boundaries. |
| CLI/dev output | `**/scripts/**`, `tooling/scripts/**`, proof servers, benchmark CLI, `packages/udecode/depset/**` | `no-console` | Terminal output is the owned interface. |
| All tests | `**/*.{spec,test,slow}.{ts,tsx,js,jsx,mjs,cjs,mts,cts}`, `**/__tests__/**`, `**/test/**`, `**/*-value.tsx` | Begin with Bun matcher unsafe argument/assignment and literal-source template checks | Do not port Biome's blanket a11y/performance amnesty. Add only diagnostics proved to be test-boundary noise. |
| Plite/type-contract tests | `packages/plite/test/**`, package `type-tests/**`, contract fixtures | unused parameters, implicit/evolving fixture types, namespaces only where contract syntax requires them | Type-test syntax intentionally models invalid or ambient surfaces. |
| Ambient declarations | `**/*.d.ts`, exact JSX-global files | consistent type imports, empty-object type; namespace/`var` only on real augmentation files | Top-level imports and alias rewrites can destroy ambient merging. |
| Published packages | `packages/**` | `no-unused-private-class-members` only if current false positives reproduce | Do not treat package scope as a general relaxation. |
| Generated barrels | `packages/**/src/index.{ts,tsx}` | Oxfmt `sortImports: false`; global `no-barrel-file` already off | Barrelsby owns export order; formatter owns whitespace only. |
| First-party browser package | `packages/browser/**` | normal package policy plus browser/Vitest test overrides | Bring it into lint; current whole-package exclusion is deleted. |
| Benchmark lab | `benchmarks/editor/**` | console, benchmark harness globals, exact static-class/parameter/unused cases only after proof | Do not port the current 28-rule blanket override. |
| Registry/editor UI | `apps/www/src/components/ui/**`, `apps/www/src/registry/components/editor/**` | exact composite-widget a11y, alert, media-caption, and HTML injection rules | Copied/headless editor primitives can own keyboard semantics that syntax rules cannot see. |
| Registry values | `apps/www/src/registry/examples/values/**` | `no-template-curly-in-string` | Values contain literal source/template syntax. |
| Serializer/renderers | exact HTML/PDF/DOCX/preview owners | `react/no-danger`, unsafe binary/code-unit rules, chained assertions only where boundary proof exists | Never disable security/unsafe rules for a whole package. |
| Donor/soak fixtures | `apps/plite/tests/**/donor/**`, `tooling/plite/donor/**`, Slate donor/transplant trees | Prefer ignore for untouched upstream fixtures; script/test overrides for locally owned harnesses | Separate copied behavior fixtures from maintained orchestration. |
| Skipped tests | exact conditional browser/compatibility matrices | test skip rule | Do not disable skipped-test detection across the test suite. |
| Generated template outputs | root `templates/**` | ignored by root Oxlint/Oxfmt | Each generated template has its own standalone config and CI proof. |

## Ignore and inclusion matrix

### Ignore in root Oxlint and Oxfmt

- dependency/build/cache: `node_modules`, `.pnpm-store`, `.turbo`, `.next*`,
  `dist`, `build`, `coverage`, `.tmp`, app tmp/test results;
- agent/internal prose: `.agents/**`, `.claude/**`, `.codex/**`, `docs/**`;
- CI-owned/generated: `templates/**`, `public/**`, `**/__registry__/**`,
  generated registry JSON/schema output, generated GraphQL/types, `next-env.d.ts`;
- untouched donor/archive/raw data: Slate donor trees,
  `docs/transplant/slate-v2/**`, issue-harvester full corpora, `*.otf.json`,
  large captured HTML/JSON artifacts;
- exact third-party fixture trees that are not maintained as Plate source.

### Include or narrow instead of ignoring

- all first-party `packages/**/src`, including `packages/browser/**`;
- package tests and type contracts for syntactic lint even when tsgolint cannot
  attach them to a project;
- `tooling/**` orchestration and checks;
- `benchmarks/editor/**` first-party benchmark code;
- `apps/www` and `apps/plite` non-generated code;
- `content/**` for Oxfmt/MDX ownership;
- `tooling/config/global.d.ts` through an ambient declaration override;
- generated barrels through the formatter override and `pnpm brl` contract.

Delete stale `packages/slate*` ignores because those paths no longer exist.

## Command and dependency hard cut

| Owner | Migration |
|---|---|
| Root dependencies | Upgrade/pin current `ultracite`; add exact `oxlint`, `oxfmt`, `oxlint-tsgolint`, `oxlint-plugin-react-doctor`; remove lint-only `@babel/eslint-parser`, `@biomejs/biome`, `eslint`, `eslint-plugin-react-hooks`. Keep Babel compiler/parser dependencies used outside lint. |
| Root scripts | `lint -> ultracite check`, `lint:fix -> ultracite fix`; add temporary `lint:ox` only during implementation, then delete it. Benchmark default versus `--threads=8` before choosing the final flag. |
| Package scripts | Keep all sixty manifest delegates. Change `packages/plate-scripts/run-with-pkg-dir.cjs` and root `p:lint*` from Biome to Ultracite while preserving cwd and forwarded arguments. |
| `apps/www` | Replace lint/fix/debug scripts with Ultracite and `OXC_LOG=debug`; no ESLint command remains. |
| `apps/plite` | Add lint/fix scripts using its nested config. |
| CI filters | Replace `biome.jsonc`/`eslint*` paths with root/base/app Oxlint configs, Oxfmt config, policy, and lint-owner contract. Add equivalent Plite CI watch rows and assertions. |
| VS Code | Remove Biome/ESLint/Prettier ownership; recommend `oxc.oxc-vscode`, use it for supported languages, enable format on save and explicit Oxc fixes, retain TS7 workspace settings. |
| Root Lefthook | Delete the sample-only `lefthook.yml`; do not invent a hook the repo does not currently own. |
| Agent/current docs | Update `.agents/rules/patch.mdc` and `tooling/cn/CONTRIBUTING.md`; run `pnpm install` to regenerate agent mirrors. Leave historical plans, solutions, research receipts, benchmark fixture manifests, and generated public JSON unchanged. |
| Legacy configs | Delete root `biome.jsonc` and `eslint.config.mjs` only after new owner is green and suppression conversion is complete. |

No package changeset is required for tooling/format-only changes. If a lint fix
changes runtime behavior, remove it from this migration or route it through the
owning package with tests and a changeset.

## Generated template lane

Root policy forbids manual `templates/**` edits. Implement template migration
through source inputs:

1. Add a deterministic template-tooling source under `tooling/` containing the
   standalone Next Oxlint/Oxfmt config and exact dependency/script/editor/CI
   transformations.
2. Invoke it from `tooling/scripts/update-template.sh` after registry material
   is installed and before template lint/typecheck.
3. Remove both templates' bulk `--unsafe` fix behavior. Template lint/fix uses
   safe Ultracite only.
4. Update source tests to prove generated manifests/configs/hooks/editor/CI and
   agent rule inputs contain Ultracite/Oxc and no active Biome/ESLint/Prettier.
5. Let the existing CI refresh/sync workflow regenerate `templates/**`, build
   both templates, run lint/typecheck/build, commit generated output, and sync
   the external `plate-template` and `plate-playground-template` repositories.
6. Read back the generated commit and downstream CI. Local generation may be
   used for proof only if all generated template changes are restored before
   handoff.

Root migration can merge before downstream template regeneration only if the
plan and handoff say **root complete, template propagation outstanding**. The full
three-lane objective closes only after CI-generated template copies and both
downstream checks are green.

## Suppression migration

1. Capture the exact pre-migration directive ledger.
2. Run new lint before translating any directive.
3. Delete directives for rules disabled by the shared/Plate policy.
4. Fix beneficial diagnostics.
5. Convert only remaining valid exceptions to `oxlint-disable-next-line` or a
   narrower config override with the same concrete reason.
6. Replace ambient Bun `mock` globals with explicit imports where required for
   the safe-call match.
7. Set `respectEslintDisableDirectives: false` and deny unused directives.
8. Require zero `biome-ignore`, `eslint-disable`, and active Prettier directives
   outside ignored historical/generated trees.

Do not mechanically rename suppressions. The old and new rule semantics are not
one-to-one.

## Implementation phases

### Phase 0 — Baseline and owner lock

- Create the execution branch from `next` only when execution/PR is authorized.
- Save the owner inventory and two warm old lint timings.
- Run baseline `pnpm lint`, `pnpm typecheck`, `pnpm check`, package/app checks,
  and template checks that are currently runnable.
- Record current red owners separately; do not hide them in migration fixes.
- Exit: every active owner and generated/downstream boundary is classified.

### Phase 1 — Dependency and generated-config scaffold

- Verify current CLI flags and package versions.
- Run controlled Ultracite initialization after the owner ledger is saved;
  inspect the generated diff, then reshape it into the Plate architecture.
- Pin exact root dependencies and install once.
- Add policy, base, root, nested app, and Oxfmt configs.
- Add temporary `lint:ox`/`fix:ox` commands while root `lint` still proves the
  old baseline.
- Exit: configs load; `ultracite doctor` passes; no old owner is deleted yet.

### Phase 2 — Type-aware and framework attachment

- Run `OXC_LOG=debug` against representative Core, React, Next app, Plite,
  browser, test, type-test, CJS, and tooling files.
- Require every first-party production `src/**` file to attach to a real TS
  project.
- Classify unmatched tests/type contracts by exact owning typecheck; repair TS
  project ownership when a production source is unmatched.
- Verify nested app configs with `oxlint --print-config` on one file per app and
  one public package file. Do not use `--config` for real lint.
- Exit: no unmatched production source and no Next rules on generic packages.

### Phase 3 — Formatter cut

- Run safe Oxfmt/Ultracite fix only; no unsafe fixer.
- Keep formatter-only changes separate from semantic lint repairs.
- Prove Tailwind sorting against the app stylesheet, MDX parsing, package JSON
  manifest contracts, and barrel idempotence.
- Exit: second safe fix is idempotent; `pnpm brl -> fix -> pnpm brl` has no
  drift; content source build passes.

### Phase 4 — Global correctness diagnostics

- Count diagnostics by rule and owner.
- Apply the 99-rule baseline plus three Plate-wide additions.
- Fix all remaining root/tooling/config production diagnostics in rule batches.
- Inspect at least three representative errors before any conditional global
  disable.
- Exit: root/tooling/config production source is clean without new global debt.

### Phase 5 — Public package source

- Process package source in dependency order: Plite primitives, Core, shared
  Udecode utilities, feature packages, Browser, umbrella package.
- Keep React Compiler, Hooks, unsafe-value, and public API correctness rules on.
- Bring `packages/browser` under lint.
- Run source-first package typecheck and focused tests after each batch.
- Exit: `pnpm g:lint` and package typechecks pass; no package-local configs.

### Phase 6 — Tests, fixtures, and benchmarks

- Apply the test/declaration/donor/benchmark matrix.
- Migrate old suppressions by evidence; preserve test runner isolation for Bun
  module mocks.
- Start benchmark code strict and add narrow exceptions only for actual harness
  contracts.
- Exit: test/type-test/benchmark syntactic lint is clean; every typed exclusion
  has an owning test/typecheck command.

### Phase 7 — Next apps and registry/content

- Run `apps/www` and `apps/plite` nested configs.
- Fix current 19 Hooks warnings; do not downgrade them to warnings or disable
  exhaustive dependencies globally.
- Scope copied/editor UI accessibility and HTML/image exceptions to real owners.
- Validate www content/registry source and both app typechecks.
- Exit: both app-local lint commands pass with zero warnings and correct Next
  config readback.

### Phase 8 — Hard cut and command propagation

- Switch root/package/app scripts and package runner.
- Remove old dependencies/configs and every active old suppression.
- Update CI filters, editor ownership, current agent/docs commands, and lint
  owner contract tests.
- Run `pnpm install` for lockfile and generated agent mirrors.
- Delete temporary dual-owner scripts.
- Exit: one active root lint/format owner and no legacy active command.

### Phase 9 — Template generation and downstream sync

- Land deterministic template generator inputs and workflow tests.
- Let CI regenerate the two template trees; never hand-edit them.
- Prove generated template lint/typecheck/build/hooks and external sync CI.
- Exit: root and both downstream template repos use Ultracite/Oxlint/Oxfmt.

### Phase 10 — Full proof and closeout

- Run the complete verification matrix below.
- Record two warm new lint timings and component timing for native Oxlint,
  tsgolint, React Doctor, and Oxfmt.
- Run agent-native audit for command/source/generated ownership.
- Exit: zero errors/warnings, no stale owner, all generated/downstream proof
  green, and no unowned formatter or config drift.

## Verification matrix

| Claim | Command / evidence | Required result |
|---|---|---|
| Setup | `pnpm exec ultracite doctor` | No conflict, missing package, or editor/config owner |
| Safe/idempotent fix | `pnpm lint:fix` twice | Second run changes nothing; no unsafe mode |
| Root lint | `pnpm lint` | Zero errors and warnings |
| Package lint routing | `pnpm g:lint`; representative `pnpm --filter @platejs/core lint`; `pnpm --filter @platejs/browser lint` | All use Ultracite and nested/root discovery correctly |
| App lint | `pnpm --filter www lint`; `pnpm --filter plite lint` | Zero warnings; Next app config active |
| Type-aware assignment | `OXC_LOG=debug pnpm lint` saved to bounded artifact | Zero unmatched first-party production source; every other unmatched family has exact owner |
| Config selection | `oxlint --print-config` for Core, www, and plite representative files | Shared policy everywhere; Next/Next React Doctor only in apps |
| Typecheck | `pnpm typecheck`; app-local typechecks | Existing TS7/source-first graph passes without adding build to lint |
| Unit/integration | `pnpm test:all`; `pnpm test:slowest` | Existing suite and budget pass |
| Plite tooling | `pnpm check:plite:contracts`; `pnpm check:plite:packages` | Runner/config/source contracts pass; browser matrix N/A unless runtime files changed |
| Full root gate | `CI=1 pnpm check` | Full owning check passes |
| Barrels | `pnpm brl`, fix, `pnpm brl` again | No second-pass barrel drift |
| Docs/content | `pnpm --filter www build:source`; `pnpm --filter www check:docs` when source parity changed | MDX and source parity pass |
| Manifest/package order | `pnpm test:manifests` | Package metadata contracts pass after Oxfmt sorting |
| Templates | CI-generated copies: lint, typecheck, build, forced template hook; `pnpm templates:check` after regeneration | Both standalone Next templates green without unsafe fixes |
| Hard-cut audit | Global migration audit plus bounded tracked-tree search | No active old config, dependency, command, suppression, editor, CI, hook, or agent owner outside documented historical/generated exclusions |
| Rule policy | Repo policy contract plus global policy comparison | Exactly 99 shared rules plus approved Plate additions; every extra has condition/scope |
| Timing | Two warm `pnpm lint` runs | Aspirational mean <=10.2s; hard no-regression ceiling <=15.3s (20% above 12.77s baseline). A slower result requires profiling/decision, never silent rule removal. |
| Diff hygiene | `git diff --check` and exact changed/generated-owner audit | No whitespace errors, manual template edits, generated cache output, or unrelated runtime change |

Browser proof is N/A for the tooling migration itself. Run browser checks only
if a diagnostic fix changes app/package runtime code; then use the owning
focused package/app route, not ceremony for config-only changes.

## Stop and rollback rules

- Keep the old owner until the candidate config loads and its diagnostic ledger
  is captured. The final tree is a hard cut; temporary dual commands do not
  survive.
- Commit phase boundaries during execution so dependency/config, formatter,
  diagnostics, hard cut, and generated template propagation can be reverted
  independently.
- Stop and repair config/tsconfig ownership if any production source is
  unmatched by tsgolint. Do not ignore it or prepend a full build by default.
- Stop a formatter batch if Oxfmt and Barrelsby/template/registry generation
  oscillate. Fix the owner or narrow the formatter override before proceeding.
- Stop a rule batch if the proposed fix changes public runtime/API semantics.
  Route that change to its package owner with tests and a changeset, or leave it
  out of this migration.
- Stop full closure if CI-generated templates or downstream template CI remain
  on legacy tooling. Report root versus template status separately.

## Agent-native capability map

| User action | Agent route | Source owner | Proof | Status |
|---|---|---|---|---|
| Migrate root lint/format | `$migrate-to-ultracite` plus this plan | root/base/policy/Oxfmt configs | doctor, lint, policy/hard-cut audit | planned |
| Lint one package | package `lint` -> `plate-pkg` | `packages/plate-scripts/run-with-pkg-dir.cjs` | representative package lint plus contract test | planned |
| Lint one app | app-local lint script | nested app config | app lint and print-config readback | planned |
| Regenerate templates | template update workflow | deterministic tooling source, not `templates/**` | CI-generated diff and downstream checks | planned |
| Verify full migration | root check plus audit scripts | package scripts/CI/config policy | verification matrix | planned |

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-migrate-plate-monorepo-to-ultracite.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requires a full plan in `../plate-2`, starting from IM, after analyzing Plate Biome/ESLint and adapting for library-monorepo package/test boundaries; captured above and in checklist rows |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | Read global major-task skill before repository audit |
| Active goal checked or created | yes | Goal created for this exact plan path and completion threshold |
| Source of truth read before analysis | yes | Read Plate `.agents/AGENTS.md`, generated root instructions, global migration skill/playbook, and current plan shell; detailed config audit is the next phase |
| Major lane selected | yes | Framework/tooling migration plan |
| Decision criteria stated | yes | Major source and completion threshold above |
| Existing repo patterns / prior decisions checked | yes | Read TypeScript 7 migration, React migration CI repair, prior CI lint repair, source-first package runner/tests, Biome/ESLint config, generated-template rules, and current command topology |
| Helper stack selected | yes | `migrate-to-ultracite`, `major-task`, `autogoal`; docs and agent-native packs from the materialized template; no browser or review swarm |
| External research decision recorded | yes | Local source and installed global policy first; official docs only on unresolved current-tool behavior |
| Implementation expectation recorded | yes | Planning only; no migration execution |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` on current `next` branch |
| Branch / PR expectation decided | no | N/A: planning-only current-tree artifact; user did not request commit, push, or PR |
| Output budget strategy recorded | yes | See bounded inventory strategy above |
| Docs pack selected | yes | Materialized docs pack in this major-task plan |
| `docs-creator` loaded | yes | Read Plate `docs-creator` and `style-and-structure` doctrine before substantive plan prose |
| Docs lane selected | yes | Internal migration implementation plan/spec |
| Target docs and nearest sibling docs read | yes | Target plan plus TS7 migration, React CI migration, and lint CI repair plans |
| Docs style doctrine read | yes | Read `.agents/skills/docs-creator/rules/style-and-structure.md` |
| Documented source owner identified | yes | This plan owns execution decisions; current repo configs/manifests/scripts are factual sources; future config policy lives under `tooling/config` |
| Agent-native pack selected | yes | Materialized agent-native pack because lint/package/template commands are agent-facing actions |
| Agent-facing action surface identified | yes | Root, package, app, template generation, audit, and verification commands mapped in the capability table |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` owns generated agent mirrors; deterministic tooling/workflows own `templates/**`; neither generated output is edited directly |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded Plate agent-native reviewer and applied its action/source/proof map |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration; confidence target recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Map every active Biome, ESLint, Prettier/formatter, package script, CI, hook, editor, agent instruction, suppression, and custom plugin/rule owner.
- [x] Classify every workspace and file family that needs an inherited global policy, a framework preset, a test/declaration/generated override, or full exclusion.
- [x] Compare Plate against IM/global rule policy and separate baseline global disables, conditional Plate-wide disables, and narrow overrides with concrete reasons.
- [x] Define the ordered no-unsafe hard-cut implementation phases, exact commands, stop/rollback conditions, and measurable before/after timing gates.
- [x] Preserve pnpm/Turbo source-first typecheck, package build/test/API/release, generated/template ownership, and docs/app validation boundaries.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. Official Oxlint nested config,
      type-aware, print-config, and React Compiler docs settled current tool behavior.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: planning only;
      execution plan itself includes package/API and agent-native gates.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context, except one recorded overbroad suppression/manifest output that
      was replaced by count-only queries.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason. N/A: no repo page routes/previews; external links are official tool references.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. N/A for current plan-only edit; future phase explicitly edits `.agents/rules/patch.mdc` then regenerates.
- [x] Agent-native pack: the changed agent action is discoverable from the global migration skill and this exact repo plan.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. N/A: current task does not change agent rules.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Owner audit, two warm lint baselines, rule/suppression/workspace counts, official-tool audit, and agent-native map completed |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Root/app/package/template configs, manifests, scripts, TS graph, CI, editor, hook, suppressions, and generated owners mapped above |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Every required plan surface is explicit; fresh implementation diagnostics remain gates, not missing planning work |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | See Decisions and tradeoffs plus target architecture |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Independent read-only topology audit plus docs and agent-native source review; no autoreview because no PR/user review request |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Stale React 18 waiver rejected, Browser package restored to scope, template output moved to generator/CI owner, nested config gap closed |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Official Oxlint nested config, config reference, type-aware, React Compiler, and ignore docs used only for current behavior |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: plan-only task; no migration implementation performed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Completed below |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: `docs/plans/**` is ignored by current and target formatters; use `git diff --check` plus plan checker |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One overbroad result recorded below; all later inventory used counts, exact files, capped output, or ignored tmp logs |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-18-migrate-plate-monorepo-to-ultracite.md` | Passed after final source, review, phase, risk, and evidence closure |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Claims cite current config/manifests/scripts and official current tool docs |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: internal plan has no app route, docs nav, or component preview |
| Docs MDX/content parser | no | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | N/A: only Markdown plan under `docs/plans`; no content/MDX change |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: migration plan, not plugin documentation |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no agent source changed in this planning task |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Global `$migrate-to-ultracite`, this plan, current Plate command owners, and future source/generated boundaries are explicit |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Capability map complete; template direct-edit gap and package/app command routes repaired in the plan |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills, repo instructions, source configs, manifests, scripts, sibling plans, and docs doctrine read | current-state map |
| Current-state map | complete | Automated audit plus bounded manual topology/rule/suppression/timing inventory | options |
| Options and recommendation | complete | Shared base + nested apps + CI-owned template lane selected | review |
| Review / pressure pass | complete | Independent topology audit, official tool behavior, docs and agent-native pressure applied | plan artifact |
| Implementation or plan artifact | complete | Ten-phase implementation-ready plan, policy and override matrices, stop/rollback and proof gates | verification |
| Verification | complete | Source claims, command paths, official behavior, baseline timing, and capability map verified | closeout |
| Closeout | complete | Source-backed plan audit complete; mechanical plan and whitespace checks recorded in verification | final response |

Findings:
- Root automation undercounted Next because the dependency lives in both apps, not root; manual manifest audit corrected framework topology.
- The existing package-wide React Compiler waiver is stale against React `>=19.2.0` package peers and current native Oxlint Compiler behavior.
- `packages/browser` is first-party published source despite a whole-package Biome ignore.
- Root configs do not own generated templates; deterministic tooling and CI regeneration do.
- Current lint spends most wall time in ESLint and still allows 19 warnings; Biome also scans ignored internal docs artifacts and emits 15 warnings.
- Type-aware project attachment and Oxfmt/generator idempotence are the two highest-risk implementation unknowns.

Decisions and tradeoffs:
- Chosen: one canonical policy/base, one root entry, and two nested app configs. Rejected one flat Next root because it leaks app rules into libraries; rejected 60+ package configs because they create drift.
- Chosen: native React Hooks/Compiler rules. Rejected keeping ESLint because Oxlint covers the same current owner and dual lint would preserve ambiguity.
- Chosen: 99 shared global exceptions plus three Plate-wide additions. Rejected copying IM-only legacy/database/provider exceptions.
- Chosen: strict production source and narrow tests/UI/benchmark exceptions. Rejected carrying Biome's broad `chill` and whole-category test/benchmark amnesties.
- Chosen: Oxfmt owns content and source, with generator-aware overrides. Rejected leaving Prettier as editor fallback or ignoring formatting conflicts.
- Chosen: CI-generated template propagation from tooling source. Rejected direct template edits because repo policy declares them generated output.
- Chosen: zero warnings and no-regression timing ceiling. Rejected treating current green-with-warnings as parity.
- Chosen: keep one canonical plan despite its length because the autogoal shell, owner matrices, phases, and gates cross-reference one another; splitting would hide execution law in companion notes.

Implementation notes:
- N/A: this task is planning only. The implementation inventory, phases, file owners, commands, and gates are specified above.

Review fixes:
- Accepted: generic audit reported no Next root -> added explicit nested Next configs for both apps.
- Accepted: package React 18 compatibility comment contradicted manifests -> rejected the blanket Compiler waiver and kept native Compiler diagnostics.
- Accepted: current Biome excludes `packages/browser` -> restored it to first-party package lint scope.
- Accepted: templates looked like direct configs -> routed them through deterministic tooling plus CI regeneration/sync.
- Accepted: root type-aware claim was too broad -> added production attachment gate and explicit test/type-contract ownership ledger.
- Rejected: copy all IM conditional global exceptions -> those encode IM legacy/database/provider facts absent from Plate.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial config read requested nonexistent `biome.json` | 1 | Read the discovered `biome.jsonc` owner | Full config audited |
| One workspace/suppression probe streamed representative fixture content and a long manifest list | 1 | Switch to counts, grouped owners, exact config slices, and tmp-backed logs | Later output stayed bounded; miss recorded for closeout |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: global migration audit identified root configs/dependencies/scripts/editor/CI and active suppression owners.
- `/Users/zbeyens/git/plate-2`: two warm `pnpm lint` runs passed in 13.55s and 11.99s; current output contains 15 Biome and 19 Hooks warnings.
- `/Users/zbeyens/git/plate-2`: structured manifest audit found 64 active manifests, 61 public packages, 61 lint scripts, and two Next apps.
- `/Users/zbeyens/git/plate-2`: bounded source audit found 144 tsconfigs, 193 call-shaped Bun module-mock matches across 45 files, and generated barrel ownership.
- Official Oxlint docs confirm nearest nested configs, no automatic parent merge, explicit `--config` disabling nested lookup, root-only type-aware options, multi-tsconfig discovery, and native React Compiler analysis.
- IM installed `oxlint --print-config <file>` invocation proved representative effective-config readback syntax.
- Independent explorer topology audit agreed on root/app/template ownership and exposed stale React/Browser assumptions.
- `/Users/zbeyens/git/plate-2`: `git diff --check -- docs/plans/2026-08-18-migrate-plate-monorepo-to-ultracite.md` passed.
- `/Users/zbeyens/git/plate-2`: autogoal `check-complete.mjs` passed for this plan.

Final handoff contract:
- Recommendation: execute the ten-phase shared-base/nested-app/template-generator migration exactly as specified; do not flatten configs or copy IM exceptions wholesale.
- Confidence: 92/100 for planning completeness.
- Evidence: current configs/manifests/scripts/CI/editor/template owners, measured lint baseline, suppression/rule/file-family counts, official Oxlint behavior, global/IM policy comparison, and independent topology audit.
- Tests / commands: planning evidence commands above; execution verification matrix is complete and ordered.
- Browser proof: N/A for plan-only tooling work; future runtime code fixes trigger focused browser proof conditionally.
- PR / tracker: N/A; user requested a local plan only and did not authorize commit, push, PR, or tracker mutation.
- Caveats: actual Oxlint diagnostic counts, tsgolint project attachment, Oxfmt churn, and downstream template CI remain intentionally fresh execution evidence.
- Next owner: user reviews the plan; the same thread executes only after explicit instruction.

Timeline:
- 2026-08-18T22:26:51.150Z Major-task goal plan created.
- 2026-08-19 Read Plate repo/docs/agent doctrine and global migration policy; captured user requirements before broad exploration.
- 2026-08-19 Audited root Biome/ESLint, package/app/template commands, 64-manifest workspace shape, TypeScript graph, suppressions, CI/editor/hook owners, and generated boundaries.
- 2026-08-19 Measured warm current lint at 13.55s and 11.99s; recorded 15 Biome and 19 React Hooks warnings.
- 2026-08-19 Verified current Oxlint nested-config, type-aware, print-config, ignore, and native React Compiler behavior from official docs/local install.
- 2026-08-19 Applied independent topology and agent-native pressure; completed target architecture, rule/override/ignore matrices, ten phases, and proof/rollback gates.
- 2026-08-19 Plan whitespace/source-claim checks and autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plan closeout complete |
| Where am I going? | User review, then execution only on explicit instruction |
| What is the goal? | Produce an implementation-ready Plate Ultracite migration plan without executing it |
| What have I learned? | Root plus nested apps plus CI-owned template generation is the only low-drift shape; stale React/Browser assumptions must not be ported |
| What have I done? | Produced the complete source-backed execution plan, matrices, phases, gates, and measured baseline |

Open risks:
- Tsgolint may leave tests/type contracts unmatched because package tsconfigs exclude them; production source cannot be waived, while exact test owners may be documented.
- Oxfmt import/package/Tailwind sorting may conflict with Barrelsby, registry, or manifest order; the idempotence gates decide whether generator repair or narrow override wins.
- Template propagation requires CI generation and downstream repository readback; root completion must not be confused with three-lane completion.
- Exact diagnostic volume is deliberately unknown until dependencies/configs are installed; volume cannot justify weakening policy.
