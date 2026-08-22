# Oxlint suppression ownership ledger

Baseline: 326 directives in 275 files, covering 515 rule references.

Current: 229 directives in 211 files, covering 399 rule references.

Removed: 97 directives from 64 file owners. Ordinary test directives: 0.

## Config-owned policy

### Repository-wide negative-sum rules

These rules are off because their premise is wrong for this repository, not
because they reported often:

- `anti-slop/no-module-mocking`: detects Jest/Vitest but not equivalent Bun
  mocks and would force production dependency injection for test ownership.
- `accessor-pairs`, `no-lone-blocks`, `no-alert`, `no-inner-declarations`, and
  `no-new`: each bans a valid language/platform ownership pattern without a
  correctness gain.
- `import/no-cycle`: recursive editor/plugin graphs and generated barrels make
  it report every participant instead of an actionable owning edge.
- `prefer-object-spread`, `unicorn/no-useless-spread`,
  `unicorn/no-typeof-undefined`, `unicorn/prefer-negative-index`, and
  `unicorn/prefer-regexp-test`: their rewrites can change identity, host-global
  safety, custom method contracts, or generic inference.
- `typescript/consistent-type-exports`: generated barrels cannot preserve its
  preferred spelling; TypeScript and `pnpm brl` own the export contract.
- `typescript/no-array-delete`, `typescript/no-deprecated`, and
  `typescript/no-this-alias`: sparse indices, compatibility implementation,
  and explicit callback ownership are valid repository patterns.
- `react/display-name`, `react/no-clone-element`, `react/no-set-state`,
  `react/no-string-refs`, and `react/state-in-constructor`: the rules reject
  inferred component names, standard composition, class lifecycles, or plain
  editor data.
- `react-doctor/effect-needs-cleanup`,
  `react-doctor/js-length-check-first`,
  `react-doctor/js-set-map-lookups`, `react-doctor/no-fetch-in-effect`,
  `react-doctor/no-pass-data-to-parent`,
  `react-doctor/no-pass-live-state-to-parent`, and
  `react-doctor/no-render-prop-children`: these syntax/architecture heuristics
  cannot model owner-managed cleanup, prefix relations, small ordered data,
  client state, controlled composition, or render slots.
- `react-doctor/zod-v4-no-deprecated-schema-apis`: the repository owns Zod 3;
  the suggested Zod 4 APIs do not exist in the installed version.
- `unicorn/no-this-assignment`: explicit `this` capture is a valid callback or
  constructor-double bridge.

### Structural patterns

- All app source uses one Next preset pattern: `apps/**/*`.
- All test owners use one override: `*.test.*`, `*.spec.*`, `*.slow.*`,
  `__tests__`, `test`, `tests`, and `type-tests` across the whole repository.
- Test unsafe-value rules are off together because Bun spies, asymmetric
  matchers, partial component doubles, and generated fixtures expose values as
  `any` or `error`; test-only wrappers or domain annotations would launder the
  same boundary. Production remains strict.
- All typed `*.config.*` files share one external-tool adapter policy.
- `scripts`, `tooling`, `dev`, benchmark, and editor-performance trees share
  one non-production adapter/output policy.
- CommonJS config, declarations, Playwright trees, generated doc pages,
  benchmark trees, and registry value fixtures each use one semantic glob.
- No rule override selects an exact file or a package name.

The canonical strict checker accepts the unified test policy: it reports no
broad test unsafe override, unknown test pattern, or test directive violation.
It still rejects Plate's larger repository-wide rule policy and four Next rules
that are intentionally disabled only inside the all-app preset. Those are
project policy differences outside this normalization; the repository
structural checker and full CI remain their executable owners.

## Remaining source-local owners

| Rule | Rule references | Decision | Why it stays local |
|---|---:|---|---|
| `typescript/no-unsafe-assignment` | 100 | defer production repair | Schema-generic, generated, provider, editor-runtime, and codec owners need behavior-proven type repair; a broad disable would hide real unsafe flow. |
| `typescript/no-unsafe-argument` | 85 | defer production repair | Same boundary; keep the rule enabled for every unlisted production owner. |
| `typescript/no-unsafe-return` | 66 | defer production repair | Same boundary; callers still benefit from the rule outside each explicit owner. |
| `typescript/no-unsafe-member-access` | 61 | defer production repair | Same boundary; broad configuration would erase useful member validation. |
| `typescript/no-unsafe-call` | 27 | defer production repair | Same boundary; callable evidence must be repaired at its runtime owner. |
| `react-hooks/exhaustive-deps` | 12 | keep file owner | These files use stable mutable editor/store protocols; adding dependencies can recreate or resubscribe the owner, while the rule remains valuable elsewhere. |
| `typescript/unbound-method` | 6 | keep file owner | The named owners use bound methods, explicit receivers, or identity inspection; detached calls elsewhere remain a correctness risk. |
| `typescript/only-throw-error` | 4 | keep local | These production paths preserve host/provider failure identity or domain sentinel values; normal production throws stay strict. |
| `react/no-danger` | 5 | keep file owner | Each sink owns trusted generated, sanitized, encoded, or editor-marker HTML; the security rule remains valuable elsewhere. |
| `react/iframe-missing-sandbox` | 5 | keep file owner | Each fixed integration needs capabilities that a sandbox would remove; future iframes must still justify that choice. |
| `jsx-a11y/media-has-caption` | 4 | keep file owner | User media has no caption-track contract; fake empty tracks would lie, but future media surfaces must still be checked. |
| `react-hooks/rules-of-hooks` | 3 | keep file owner | These renderer/type owners have fixed hook order behind nonstandard boundaries; ordinary hooks remain strict. |
| `no-unmodified-loop-condition` | 1 | keep file owner | The exact loop delegates condition mutation; other unmodified conditions may be real infinite-loop bugs. |
| `unicorn/no-document-cookie` | 2 | keep next-line | Two synchronous persistence writes need broad browser support; other cookie access stays visible. |
| `jsx-a11y/no-noninteractive-element-interactions` | 2 | keep file owner | The exact editor surfaces intercept pointer propagation without becoming controls; other surfaces stay strict. |
| `react-doctor/no-array-index-as-key` | 2 | keep file owner | The two arrays have immutable positional identity; arbitrary rendered lists do not. |
| `typescript/prefer-promise-reject-errors` | 2 | keep next-line | Host rejection values must preserve identity through the adapter. |
| `react-doctor/no-adjust-state-on-prop-change` | 2 | keep file owner | These effects reconcile external runtime monitors; general derived-state copies remain suspect. |
| `no-unreachable-loop` | 2 | keep file owner | The exact iterator scans exit on their first meaningful result; the rule still catches accidental one-pass loops. |
| `react-doctor/no-transition-all` | 1 | keep file owner | Tailwind owns the generated transition-property expansion for this component only. |
| `jsx-a11y/click-events-have-key-events` | 1 | keep file owner | The adjacent pointer surface is not itself a control; other click handlers stay checked. |
| `typescript/no-misused-spread` | 1 | keep line | One synthetic event projection deliberately converts a class-backed host value to a plain object. |
| `array-callback-return` | 1 | keep next-line | The infinite scan returns on every reachable exit; a sentinel return is unreachable. |
| `no-console` | 1 | keep file owner | `DebugPlugin` explicitly owns diagnostic console output; library code remains protected. |
| `jsx-a11y/interactive-supports-focus` | 1 | keep file owner | One composite widget delegates focus to its owned interactive child. |
| `oxc/bad-bitwise-operator` | 1 | keep file owner | The grapheme algorithm implements binary masks and shifts from Unicode data. |
| `unicorn/prefer-add-event-listener` | 1 | keep next-line | A fresh `Image` owns one replaceable handler; accumulation and cleanup would be wrong. |

Every remaining directive maps to a row above. No remaining directive is owned
by an ordinary test, typed config, benchmark, generated fixture pattern, or
generic tooling unsafe-value boundary.
