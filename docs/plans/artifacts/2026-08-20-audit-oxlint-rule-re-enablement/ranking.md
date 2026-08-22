# Oxlint rule re-enablement ranking

## Decision

Six globally disabled rules deserve the next repair batch. Four more deserve a focused audit. The remaining rules have stronger reasons to stay off than their current finding counts suggest.

The selector cleanup is independent:

- Typed config and setup entrypoints now share the broad non-production adapter policy through `**/*.{config,setup}.{cts,mts,ts,tsx}`.
- `**/playwright/**` is part of the single repository-wide test policy.
- The exact `doc-page.tsx` exception moved to a file-header directive because that file alone owns the extensible Shadcn registry metadata boundary.
- The structural checker rejects filename-specific wildcard selectors such as `**/doc-page.tsx`.

Global unsafe-rule disabling is rejected. It would hide production type failures to avoid four external/generated boundaries.

## Scoring

Importance is scored out of 100:

- Bug, security, or API-contract value: 40
- Signal quality and false-positive resistance: 25
- Unique coverage not already owned by TypeScript, another rule, generators, or tests: 20
- Safe adoption without behavior-changing rewrites: 10
- Repair surface: 5

Finding count contributes only the final five points. A zero-error style rule does not become important, and a high-error correctness rule does not become disposable. The top candidates were manually audited. Lower rows use the current P-tier, canonical Ultracite policy, Ellie comparison, and repair-surface bucket as a conservative screening score.

The lower-row screening formula is fully mechanical:

| Current reason | Value | Signal | Unique | Adoption |
| --- | ---: | ---: | ---: | ---: |
| P0 | 10 | 3 | 3 | 2 |
| P1 | 14 | 8 | 6 | 4 |
| P2 | 4 | 5 | 3 | 2 |
| Missing tier | 10 | 6 | 5 | 3 |

The policy class adjusts the Unique component: baseline-off is -3,
conditional-off is unchanged, and Plate-only is +2. The repair component is 5
for zero findings, 4 for 1-10, 3 for 11-50, 2 for 51-250, 1 for 251-1000, and
0 above 1000. The full-ranking score is the sum of those five components.

The 20 manually audited rows replace that screening formula with these explicit
components:

| Rule | Value | Signal | Unique | Adoption | Repair | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| typescript/no-deprecated | 36 | 22 | 18 | 9 | 3 | 88 |
| typescript/require-array-sort-compare | 35 | 23 | 18 | 7 | 3 | 86 |
| react-doctor/effect-needs-cleanup | 34 | 18 | 18 | 7 | 5 | 82 |
| typescript/restrict-template-expressions | 33 | 19 | 17 | 9 | 2 | 80 |
| anti-slop/no-chained-type-assertions | 34 | 17 | 18 | 4 | 5 | 78 |
| anti-slop/no-unsafe-dictionary-type | 31 | 17 | 18 | 5 | 5 | 76 |
| react/jsx-no-constructed-context-values | 27 | 18 | 14 | 8 | 3 | 70 |
| typescript/no-unnecessary-type-parameters | 30 | 17 | 16 | 4 | 2 | 69 |
| typescript/no-redundant-type-constituents | 29 | 14 | 15 | 5 | 3 | 66 |
| react/display-name | 20 | 20 | 12 | 7 | 3 | 62 |
| react/react-compiler | 29 | 12 | 13 | 2 | 2 | 58 |
| typescript/no-explicit-any | 33 | 10 | 10 | 3 | 0 | 56 |
| typescript/no-unnecessary-condition | 32 | 9 | 10 | 3 | 0 | 54 |
| typescript/no-unsafe-type-assertion | 34 | 8 | 9 | 2 | 0 | 53 |
| accessor-pairs | 23 | 13 | 9 | 2 | 4 | 51 |
| import/no-cycle | 28 | 7 | 10 | 3 | 1 | 49 |
| no-alert | 16 | 17 | 8 | 2 | 4 | 47 |
| typescript/unified-signatures | 27 | 8 | 8 | 0 | 3 | 46 |
| no-param-reassign | 22 | 10 | 7 | 2 | 3 | 44 |
| anti-slop/no-unknown-returns | 20 | 7 | 7 | 1 | 5 | 40 |

Scan provenance:

- Date and owner root: 2026-08-20,
  `/Users/zbeyens/git/plate-2`.
- Toolchain: Oxlint 1.78.0 and Ultracite 7.10.5.
- Baseline input: the 183 root rules whose resolved severity was `off`.
- Diagnostic command shape: `pnpm exec oxlint -f json`, with one generated
  `-D <rule>` argument for every root-off rule, against `.`.
- Result: 58,308 findings across 3,548 files. Diagnostic codes were mapped back
  to the exact configured rule; each row records finding and distinct-file
  counts.
- Policy inputs: the canonical `rule-policy.json`, the current Plate P-tier
  reason, and `../ellie/oxlint.config.ts`. Ellie state is comparison evidence,
  never an automatic score.
- Candidate probes: `allowArray: true` reduced
  `typescript/restrict-template-expressions` from 90 to 10 findings;
  `ignoreStringArrays: true` plus the unchecked-JavaScript override reduced
  `typescript/require-array-sort-compare` from 41 to two typed findings.

Forcing all 183 disabled rules on produced 58,308 findings across 3,548 files. That number describes repair cost only; it is not a policy argument.

## Re-enable next

1. **typescript/no-deprecated — 88.** It finds stale APIs that silently accumulate compatibility and maintenance risk. The 15 findings split into genuine replacement work and intentional browser fallbacks. Fix the former and add local reasons to the latter.
2. **typescript/require-array-sort-compare — 86.** Comparator-free sorting is a real correctness hazard for non-string arrays. Configure `ignoreStringArrays: true`, disable it only for unchecked JavaScript, and review the two remaining typed findings.
3. **react-doctor/effect-needs-cleanup — 82.** Resource leaks are real defects and there are no current findings. Future owner-managed cleanup exceptions can stay local instead of disabling the guard globally.
4. **typescript/restrict-template-expressions — 80.** Accidental object stringification creates useless `[object Object]` output. Configuring `allowArray: true` reduces the current 90 findings to 10 focused cases; fix or locally justify those.
5. **anti-slop/no-chained-type-assertions — 78.** Chained assertions discard type evidence and there are no current uses. The current global exception is speculative; a future proven invariant bridge should carry its own local explanation.
6. **anti-slop/no-unsafe-dictionary-type — 76.** Unbounded dictionaries should have a named validation owner. There are no current findings, so keeping this globally off only reserves permission for future weak types.

## Targeted audit, not automatic re-enable

- **react/jsx-no-constructed-context-values — 70:** 18 production findings. The rule protects provider identity and consumer rerenders, but React Compiler ownership must be checked per component before adding memoization.
- **typescript/no-unnecessary-type-parameters — 69:** 102 findings across 37 files. It can expose fake public generics, but changing Plate inference is public-API work and needs a dedicated API review.
- **typescript/no-redundant-type-constituents — 66:** 22 findings across 14 files. Several come from unresolved error types; repair the type graph before trusting the rule.
- **react/display-name — 62:** all 13 current findings are in tests. Enable it for production and add it to the shared test policy only if the remaining production scan stays empty.

## Important rules that should remain off

- **anti-slop/no-unknown-returns:** `unknown` is the honest safe type for unvalidated data. Banning it encourages false precision.
- **no-empty-function:** production has deliberate no-op defaults and adapters. Replacing them with `() => undefined` is token laundering.
- **import/no-cycle:** it reports every participant in generated barrel/editor graphs instead of identifying the owning edge.
- **no-param-reassign:** Plate transforms and render pipelines intentionally use parameters as local working state; aliasing them can create stale-value bugs.
- **accessor-pairs:** getter-only and setter-only descriptors are valid proxy and test contracts.
- **no-alert:** the current native dialogs are deliberate user-triggered fallbacks. This is a UX preference, not a correctness rule.
- The P2 syntax and naming rules remain formatter or local-taste territory.

## Full ranking

Ellie is comparison evidence, not authority. “on” means Ellie does not globally disable the rule.

| Score | Rule | Findings / files | Current reason | Policy | Ellie | Verdict |
| ---: | --- | ---: | :---: | --- | :---: | --- |
| 88 | typescript/no-deprecated | 15 / 14 | P1 | Plate-only | on | re-enable |
| 86 | typescript/require-array-sort-compare | 41 / 19 | P0 | Plate-only | on | re-enable |
| 82 | react-doctor/effect-needs-cleanup | 0 / 0 | P0 | Plate-only | on | re-enable |
| 80 | typescript/restrict-template-expressions | 90 / 28 | P0 | Plate-only | on | re-enable |
| 78 | anti-slop/no-chained-type-assertions | 0 / 0 | P0 | Plate-only | on | re-enable |
| 76 | anti-slop/no-unsafe-dictionary-type | 0 / 0 | P0 | Plate-only | on | re-enable |
| 70 | react/jsx-no-constructed-context-values | 18 / 12 | P0 | baseline-off | off | targeted audit |
| 69 | typescript/no-unnecessary-type-parameters | 102 / 37 | P0 | Plate-only | on | targeted audit |
| 66 | typescript/no-redundant-type-constituents | 22 / 14 | P0 | Plate-only | on | targeted audit |
| 62 | react/display-name | 13 / 5 | P1 | Plate-only | on | targeted audit |
| 58 | react/react-compiler | 175 / 57 | P0 | Plate-only | on | keep off |
| 56 | typescript/no-explicit-any | 2168 / 274 | P0 | Plate-only | on | keep off |
| 54 | typescript/no-unnecessary-condition | 1651 / 455 | P1 | baseline-off | off | keep off |
| 53 | typescript/no-unsafe-type-assertion | 4596 / 726 | P0 | baseline-off | off | keep off |
| 51 | accessor-pairs | 1 / 1 | P1 | Plate-only | on | keep off |
| 49 | import/no-cycle | 637 / 177 | P0 | Plate-only | on | keep off |
| 47 | no-alert | 4 / 3 | P1 | Plate-only | on | keep off |
| 46 | typescript/unified-signatures | 26 / 2 | P0 | Plate-only | on | keep off |
| 44 | no-param-reassign | 46 / 23 | P0 | Plate-only | on | keep off |
| 40 | anti-slop/no-unknown-returns | 0 / 0 | P0 | conditional-off | on | keep off |
| 38 | no-inner-declarations | 1 / 1 | P1 | Plate-only | on | keep off |
| 38 | no-new | 1 / 1 | P1 | Plate-only | on | keep off |
| 38 | prefer-object-spread | 1 / 1 | P1 | Plate-only | on | keep off |
| 38 | react/no-clone-element | 8 / 6 | P1 | Plate-only | on | keep off |
| 38 | typescript/no-array-delete | 5 / 5 | P1 | Plate-only | on | keep off |
| 38 | typescript/no-namespace | 3 / 3 | P1 | Plate-only | on | keep off |
| 38 | typescript/no-this-alias | 1 / 1 | P1 | Plate-only | on | keep off |
| 38 | unicorn/no-this-assignment | 1 / 1 | P1 | Plate-only | on | keep off |
| 36 | react/no-set-state | 1 / 1 | P1 | conditional-off | on | keep off |
| 36 | react/state-in-constructor | 1 / 1 | P1 | conditional-off | on | keep off |
| 35 | unicorn/no-new-array | 23 / 10 | P1 | conditional-off | on | keep off |
| 34 | promise/no-promise-in-callback | 0 / 0 | P1 | baseline-off | off | keep off |
| 34 | promise/prefer-catch | 0 / 0 | P1 | baseline-off | off | keep off |
| 34 | promise/spec-only | 0 / 0 | P1 | baseline-off | off | keep off |
| 33 | promise/no-callback-in-promise | 2 / 2 | P1 | baseline-off | off | keep off |
| 33 | promise/no-nesting | 2 / 2 | P1 | baseline-off | off | keep off |
| 33 | unicorn/no-array-method-this-argument | 2 / 2 | P1 | baseline-off | off | keep off |
| 33 | unicorn/no-object-as-default-parameter | 7 / 5 | P1 | baseline-off | off | keep off |
| 33 | unicorn/prefer-export-from | 7 / 5 | P1 | baseline-off | off | keep off |
| 33 | unicorn/prefer-query-selector | 2 / 2 | P1 | baseline-off | off | keep off |
| 33 | unicorn/prefer-single-call | 8 / 2 | P1 | baseline-off | off | keep off |
| 32 | class-methods-use-this | 28 / 13 | P1 | baseline-off | off | keep off |
| 32 | promise/prefer-await-to-then | 36 / 24 | P1 | baseline-off | off | keep off |
| 32 | react/hook-use-state | 45 / 23 | P1 | baseline-off | off | keep off |
| 32 | typescript/no-unnecessary-type-conversion | 41 / 29 | P1 | baseline-off | off | keep off |
| 32 | typescript/prefer-for-of | 11 / 3 | P1 | baseline-off | off | keep off |
| 32 | unicorn/no-array-reduce | 39 / 30 | P1 | baseline-off | off | keep off |
| 32 | unicorn/no-array-reverse | 42 / 33 | P1 | baseline-off | off | keep off |
| 32 | unicorn/prefer-import-meta-properties | 47 / 37 | P1 | baseline-off | off | keep off |
| 31 | no-bitwise | 194 / 30 | P1 | baseline-off | off | keep off |
| 31 | no-negated-condition | 79 / 50 | P1 | baseline-off | off | keep off |
| 31 | promise/avoid-new | 127 / 55 | P1 | baseline-off | off | keep off |
| 31 | unicorn/no-negated-condition | 79 / 50 | P1 | baseline-off | off | keep off |
| 31 | unicorn/no-useless-undefined | 79 / 41 | P1 | baseline-off | off | keep off |
| 31 | unicorn/prefer-string-replace-all | 114 / 55 | P1 | baseline-off | off | keep off |
| 30 | no-eq-null | 336 / 100 | P1 | baseline-off | off | keep off |
| 30 | no-void | 956 / 122 | P1 | baseline-off | off | keep off |
| 30 | promise/prefer-await-to-callbacks | 251 / 63 | P1 | baseline-off | off | keep off |
| 30 | require-await | 881 / 98 | P1 | baseline-off | off | keep off |
| 30 | typescript/prefer-nullish-coalescing | 472 / 119 | P1 | baseline-off | off | keep off |
| 30 | unicorn/no-array-for-each | 618 / 201 | P1 | baseline-off | off | keep off |
| 30 | unicorn/no-array-sort | 396 / 140 | P1 | baseline-off | off | keep off |
| 29 | typescript/no-non-null-assertion | 2195 / 386 | P1 | baseline-off | off | keep off |
| 25 | anti-slop/no-reflect-apply | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | anti-slop/no-reflect-get | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/async-await-in-loop | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/js-cache-property-access | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/js-combine-iterations | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/js-flatmap-filter | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/js-length-check-first | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/js-set-map-lookups | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/js-tosorted-immutable | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-barrel-import | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-fetch-in-effect | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-giant-component | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-json-parse-stringify-clone | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-many-boolean-props | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-pass-data-to-parent | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-pass-live-state-to-parent | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/no-render-prop-children | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/only-export-components | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/prefer-module-scope-pure-function | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/prefer-useReducer | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/react-compiler-no-manual-memoization | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/rendering-svg-precision | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | react-doctor/zod-v4-no-deprecated-schema-apis | 0 / 0 | P0 | Plate-only | on | keep off |
| 25 | unicorn/empty-brace-spaces | 0 / 0 | P0 | Plate-only | on | keep off |
| 24 | react/prefer-function-component | 1 / 1 | P0 | Plate-only | on | keep off |
| 24 | unicorn/no-typeof-undefined | 1 / 1 | P0 | Plate-only | on | keep off |
| 24 | unicorn/no-useless-spread | 10 / 3 | P0 | Plate-only | on | keep off |
| 24 | unicorn/prefer-dom-node-text-content | 3 / 1 | P0 | Plate-only | on | keep off |
| 24 | unicorn/prefer-math-trunc | 2 / 2 | P0 | Plate-only | on | keep off |
| 24 | unicorn/prefer-negative-index | 2 / 1 | P0 | Plate-only | on | keep off |
| 24 | unicorn/prefer-regexp-test | 1 / 1 | P0 | Plate-only | on | keep off |
| 23 | anti-slop/no-module-mocking | 0 / 0 | P0 | conditional-off | off | keep off |
| 23 | no-loop-func | 35 / 22 | P0 | Plate-only | on | keep off |
| 23 | react/no-react-children | 22 / 10 | P0 | Plate-only | on | keep off |
| 23 | react/no-string-refs | 31 / 7 | P0 | Plate-only | on | keep off |
| 23 | typescript/consistent-type-exports | 17 / 8 | P0 | Plate-only | on | keep off |
| 23 | unicorn/prefer-code-point | 39 / 24 | P0 | Plate-only | on | keep off |
| 22 | no-warning-comments | 10 / 3 | P0 | conditional-off | on | keep off |
| 22 | oxc/no-barrel-file | 86 / 86 | P0 | Plate-only | on | keep off |
| 22 | typescript/method-signature-style | 97 / 19 | P0 | Plate-only | on | keep off |
| 22 | typescript/no-invalid-void-type | 72 / 35 | P0 | Plate-only | on | keep off |
| 22 | unicorn/prefer-dom-node-remove | 6 / 6 | P0 | conditional-off | on | keep off |
| 21 | typescript/ban-types | 284 / 45 | P0 | Plate-only | on | keep off |
| 21 | typescript/no-empty-interface | 12 / 6 | P0 | conditional-off | on | keep off |
| 21 | typescript/no-useless-default-assignment | 41 / 22 | P0 | conditional-off | on | keep off |
| 21 | unicorn/prefer-dom-node-dataset | 687 / 89 | P0 | Plate-only | on | keep off |
| 20 | anti-slop/no-conditional-empty-object-spread | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | anti-slop/no-known-value-widening | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | anti-slop/no-object-parameters | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | anti-slop/no-runtime-typeof | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | anti-slop/no-shape-in-symbol-names | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | anti-slop/no-unknown-parameters | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | anti-slop/require-safety-comment-for-type-assertion | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | import/default | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | no-empty-function | 210 / 94 | P0 | conditional-off | off | keep off |
| 20 | no-lone-blocks | 6 / 2 | P2 | Plate-only | on | keep off |
| 20 | node/callback-return | 59 / 37 | P0 | conditional-off | on | keep off |
| 20 | typescript/no-unnecessary-template-expression | 9 / 7 | P2 | Plate-only | on | keep off |
| 20 | unicorn/no-static-only-class | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | unicorn/prefer-class-fields | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | unicorn/prefer-default-parameters | 0 / 0 | P0 | baseline-off | off | keep off |
| 20 | unicorn/prefer-string-starts-ends-with | 0 / 0 | P0 | baseline-off | off | keep off |
| 19 | import/namespace | 6 / 3 | P0 | baseline-off | off | keep off |
| 19 | import/no-named-as-default-member | 7 / 7 | P0 | baseline-off | off | keep off |
| 19 | no-shadow | 700 / 231 | P0 | conditional-off | on | keep off |
| 19 | typescript/consistent-type-assertions | 23 / 7 | P2 | Plate-only | on | keep off |
| 19 | typescript/no-inferrable-types | 20 / 16 | P2 | Plate-only | on | keep off |
| 19 | typescript/no-meaningless-void-operator | 28 / 5 | P2 | Plate-only | on | keep off |
| 19 | unicorn/numeric-separators-style | 26 / 8 | P2 | Plate-only | on | keep off |
| 18 | jsx-a11y/prefer-tag-over-role | 27 / 14 | P0 | baseline-off | off | keep off |
| 18 | max-classes-per-file | 20 / 20 | P0 | baseline-off | off | keep off |
| 18 | typescript/array-type | 191 / 104 | P2 | Plate-only | on | keep off |
| 18 | typescript/no-dynamic-delete | 36 / 28 | P0 | baseline-off | off | keep off |
| 17 | default-case | 75 / 47 | P0 | baseline-off | off | keep off |
| 17 | typescript/consistent-type-imports | 296 / 36 | P2 | Plate-only | on | keep off |
| 17 | typescript/no-unnecessary-type-arguments | 285 / 101 | P2 | Plate-only | on | keep off |
| 17 | typescript/promise-function-async | 241 / 98 | P0 | baseline-off | off | keep off |
| 17 | unicorn/import-style | 57 / 57 | P0 | baseline-off | off | keep off |
| 17 | unicorn/prefer-dom-node-append | 174 / 13 | P0 | baseline-off | off | keep off |
| 17 | unicorn/prefer-number-coercion | 134 / 50 | P0 | baseline-off | off | keep off |
| 17 | unicorn/prefer-structured-clone | 83 / 41 | P0 | baseline-off | off | keep off |
| 17 | unicorn/prefer-type-error | 96 / 49 | P0 | baseline-off | off | keep off |
| 16 | complexity | 326 / 189 | P0 | baseline-off | off | keep off |
| 16 | no-await-in-loop | 273 / 49 | P0 | baseline-off | off | keep off |
| 16 | typescript/consistent-return | 567 / 201 | P0 | baseline-off | off | keep off |
| 16 | typescript/no-unnecessary-type-assertion | 1914 / 386 | P2 | Plate-only | on | keep off |
| 16 | typescript/parameter-properties | 0 / 0 | P2 | baseline-off | off | keep off |
| 16 | typescript/strict-void-return | 375 / 96 | P0 | baseline-off | off | keep off |
| 16 | unicorn/consistent-function-scoping | 424 / 191 | P0 | baseline-off | off | keep off |
| 16 | unicorn/filename-case | 621 / 621 | P0 | baseline-off | off | keep off |
| 16 | unicorn/prefer-spread | 429 / 219 | P0 | baseline-off | off | keep off |
| 15 | no-use-before-define | 1013 / 204 | P0 | baseline-off | off | keep off |
| 15 | require-unicode-regexp | 2260 / 352 | P0 | baseline-off | off | keep off |
| 15 | sort-vars | 9 / 4 | P2 | baseline-off | off | keep off |
| 15 | typescript/consistent-type-definitions | 1156 / 410 | P0 | baseline-off | off | keep off |
| 15 | typescript/no-extraneous-class | 6 / 5 | P2 | baseline-off | off | keep off |
| 15 | typescript/strict-boolean-expressions | 4209 / 681 | P0 | baseline-off | off | keep off |
| 14 | react/jsx-handler-names | 11 / 3 | P2 | baseline-off | off | keep off |
| 14 | typescript/consistent-generic-constructors | 36 / 5 | P2 | baseline-off | off | keep off |
| 14 | typescript/no-unnecessary-boolean-literal-compare | 19 / 14 | P2 | baseline-off | off | keep off |
| 14 | typescript/non-nullable-type-assertion-style | 15 / 10 | P2 | baseline-off | off | keep off |
| 14 | typescript/prefer-regexp-exec | 40 / 22 | P2 | baseline-off | off | keep off |
| 14 | unicorn/catch-error-name | 23 / 13 | P2 | baseline-off | off | keep off |
| 14 | unicorn/consistent-existence-index-check | 46 / 21 | P2 | baseline-off | off | keep off |
| 14 | unicorn/no-await-expression-member | 36 / 21 | P2 | baseline-off | off | keep off |
| 14 | unicorn/prefer-logical-operator-over-ternary | 16 / 8 | P2 | baseline-off | off | keep off |
| 14 | unicorn/prefer-ternary | 28 / 22 | P2 | baseline-off | off | keep off |
| 13 | no-inline-comments | 85 / 30 | P2 | baseline-off | off | keep off |
| 13 | react/no-unescaped-entities | 78 / 22 | P2 | baseline-off | off | keep off |
| 12 | no-nested-ternary | 527 / 187 | P2 | baseline-off | off | keep off |
| 12 | no-plusplus | 946 / 254 | P2 | baseline-off | off | keep off |
| 12 | prefer-destructuring | 710 / 328 | P2 | baseline-off | off | keep off |
| 12 | prefer-named-capture-group | 322 / 94 | P2 | baseline-off | off | keep off |
| 12 | react/function-component-definition | 518 / 151 | P2 | baseline-off | off | keep off |
| 12 | unicorn/no-nested-ternary | 382 / 182 | P2 | baseline-off | off | keep off |
| 12 | unicorn/switch-case-braces | 577 / 67 | P2 | baseline-off | off | keep off |
| 11 | func-style | 1902 / 462 | P2 | baseline-off | off | keep off |
| 11 | import/consistent-type-specifier-style | 2620 / 842 | P2 | baseline-off | off | keep off |
| 11 | sort-keys | 13248 / 1196 | P2 | baseline-off | off | keep off |
| 11 | typescript/no-confusing-void-expression | 1525 / 354 | P2 | baseline-off | off | keep off |
