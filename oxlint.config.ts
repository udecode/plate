import { fileURLToPath } from 'node:url';

import { defineConfig } from 'oxlint';
import antiSlop from 'ultracite/oxlint/anti-slop';
import core from 'ultracite/oxlint/core';
import { jsPluginSettings, selectJsPlugins } from 'ultracite/oxlint/js-plugins';
import next from 'ultracite/oxlint/next';
import nextJsPlugins from 'ultracite/oxlint/next/js-plugins';
import react from 'ultracite/oxlint/react';

const plateOxlintIgnorePatterns = [
  'templates/**',
  '**/.agents/**',
  '**/.claude/**',
  '**/.codex/**',
  '**/.next*/**',
  '**/.tmp/**',
  '**/__registry__/**',
  'docs/**',
  '**/public/**',
  'skills/**',
  '**/test-results/**',
  '**/tmp/**',
  'apps/plite/tests/**/donor/**',
  'benchmarks/slate-v2/donor/**',
  'tooling/plite/donor/**',
];

const plateAntiSlop = {
  ...antiSlop,
  jsPlugins: [
    {
      name: 'anti-slop',
      specifier: fileURLToPath(
        new URL('tooling/oxlint/anti-slop-plugin.mjs', import.meta.url)
      ),
    },
  ],
};

export default defineConfig({
  extends: [
    core,
    react,
    selectJsPlugins(['react-doctor']),
    plateAntiSlop,
    {
      plugins: next.plugins,
    },
  ],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    ...plateOxlintIgnorePatterns,
  ],
  options: {
    denyWarnings: true,
    reportUnusedDisableDirectives: 'deny',
    typeAware: true,
  },
  settings: jsPluginSettings,
  overrides: [
    {
      files: ['apps/**/*.{cjs,cts,js,jsx,mjs,mjsx,mts,ts,tsx}'],
      rules: {
        ...next.rules,
        ...nextJsPlugins.rules,
        // [P0 false-positive] Local bindings named module are ordinary lexical values; this rule mistakes them for writes to the CommonJS module global.
        'nextjs/no-assign-module-variable': 'off',
        // [P0 false-positive] Raw images are required for user/runtime URLs, editor-owned dimensions, copied components, and browser fixtures that Next Image cannot statically authorize or preserve.
        'nextjs/no-img-element': 'off',
        // [P0 owner-conflict] Interactive, polling, and browser-only data can be deliberately client-owned; a blanket server rewrite changes behavior or duplicates the API boundary.
        'react-doctor/nextjs-no-client-fetch-for-server-data': 'off',
        // [P0 false-positive] Access redirects may depend on hydrated client authorization state while rendering remains withheld; forcing a server read duplicates ownership.
        'react-doctor/nextjs-no-client-side-redirect': 'off',
        // [P0 owner-conflict] OG runtime selection is a deployment, capability, and latency decision rather than a lint rewrite.
        'react-doctor/nextjs-no-edge-og-runtime': 'off',
        // [P0 false-positive] Raw images are required for user/runtime URLs, editor-owned dimensions, copied components, and browser fixtures that Next Image cannot statically authorize or preserve.
        'react-doctor/nextjs-no-img-element': 'off',
        // [P0 false-positive] Parent layouts may own Suspense, and Next build already checks unsupported static rendering cases.
        'react-doctor/nextjs-no-use-search-params-without-suspense': 'off',
      },
    },
    {
      files: ['**/src/**/debug/**'],
      rules: {
        // [P1 logging-owner] Debug modules own direct console diagnostics; routing them through the system they inspect would recurse or hide the output.
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.{cjs,cjsx,js,jsx,mjs,mjsx}'],
      rules: {
        // [P0 unchecked-boundary] JavaScript is outside a checkJs program.
        'typescript/no-misused-promises': 'off',
        // [P0 unchecked-boundary] JavaScript is outside a checkJs program.
        'typescript/no-unsafe-argument': 'off',
        // [P0 unchecked-boundary] JavaScript is outside a checkJs program.
        'typescript/no-unsafe-assignment': 'off',
        // [P0 unchecked-boundary] JavaScript is outside a checkJs program.
        'typescript/no-unsafe-call': 'off',
        // [P0 unchecked-boundary] JavaScript is outside a checkJs program.
        'typescript/no-unsafe-member-access': 'off',
        // [P0 unchecked-boundary] JavaScript is outside a checkJs program.
        'typescript/no-unsafe-return': 'off',
        // [P0 unchecked-boundary] JavaScript cannot express the TypeScript annotation required by this rule.
        'typescript/use-unknown-in-catch-callback-variable': 'off',
      },
    },
    {
      files: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.slow.*',
        '**/__tests__/**',
        '**/test/**',
        '**/tests/**',
        '**/type-tests/**',
        '**/src/playwright/**',
      ],
      rules: {
        // [P1 test-semantics] Synthetic event hosts intentionally expose handlers without browser interaction semantics.
        'jsx-a11y/no-static-element-interactions': 'off',
        // [P1 test-semantics] Standalone blocks keep fixture lifetimes and repeated setup branches locally scoped.
        'no-lone-blocks': 'off',
        // [P1 test-semantics] Source-audit fixtures preserve literal template placeholders.
        'no-template-curly-in-string': 'off',
        // [P0 test-semantics] Tests must preserve javascript: URLs verbatim to prove rejection and sanitization behavior.
        'no-script-url': 'off',
        // [P1 test-semantics] Tests may intentionally evaluate generated source to verify its executable contract.
        'no-new-func': 'off',
        // [P1 test-semantics] Opt-in debug helpers own test-runner console output.
        'no-console': 'off',
        // [P1 test-semantics] Hook contract tests intentionally invoke hooks behind deterministic non-component harnesses.
        'react-hooks/rules-of-hooks': 'off',
        // [P1 test-semantics] JSX fixture spelling is asserted as editor data rather than rendered output.
        'react/jsx-curly-brace-presence': 'off',
        // [P1 test-semantics] Anonymous wrapper components are local test harnesses; duplicate display names add no debugging value.
        'react/display-name': 'off',
        // [P1 test-semantics] TSX arrays often serialize editor values rather than render React lists.
        'react/jsx-key': 'off',
        // [P0 test-semantics] Local dynamic-import bindings named module are fixture values, not writes to the CommonJS module global.
        'nextjs/no-assign-module-variable': 'off',
        // [P0 test-semantics] Browser fixtures must exercise raw runtime image behavior without introducing Next-owned optimization.
        'nextjs/no-img-element': 'off',
        // [P0 test-semantics] Browser fixtures must exercise raw runtime image behavior without introducing Next-owned optimization.
        'react-doctor/nextjs-no-img-element': 'off',
        // [P1 test-semantics] Top-level fixture expressions construct editor values.
        'no-unused-expressions': 'off',
        // [P0 test-semantics] Bun's resolves/rejects matcher returns a Promise at runtime but its declaration is not thenable.
        'typescript/await-thenable': 'off',
        // [P1 test-semantics] Fixtures deliberately assert values installed by setup code whose runtime proof is the test itself.
        'typescript/no-non-null-assertion': 'off',
        // [P1 test-semantics] Sparse-array contract tests intentionally preserve deleted indexes; splice would change the subject under test.
        'typescript/no-array-delete': 'off',
        // [P1 test-semantics] Type-contract tests spell default generic arguments to assert public inference and specialization.
        'typescript/no-unnecessary-type-arguments': 'off',
        // [P1 test-semantics] Compatibility tests deliberately exercise deprecated browser and DOM APIs to prove the fallback behavior production still supports.
        'typescript/no-deprecated': 'off',
        // [P0 upstream-type-hole] Bun declares AsymmetricMatcher as any, so native matcher composition is unavoidably reported as an unsafe argument.
        'typescript/no-unsafe-argument': 'off',
        // [P0 upstream-type-hole] Bun declares AsymmetricMatcher as any, so native matcher composition is unavoidably reported as an unsafe assignment.
        'typescript/no-unsafe-assignment': 'off',
        // [P0 test-double-type-hole] Bun spies, partial component doubles, and generated fixtures expose callable values as any or error; wrappers would only launder the same test boundary.
        'typescript/no-unsafe-call': 'off',
        // [P0 test-double-type-hole] Bun spies, partial component doubles, and generated fixtures expose inspected values as any or error; wrappers would only launder the same test boundary.
        'typescript/no-unsafe-member-access': 'off',
        // [P0 test-double-type-hole] Bun spies, partial component doubles, and generated fixtures intentionally return erased values; false domain annotations would weaken the tests.
        'typescript/no-unsafe-return': 'off',
        // [P1 test-semantics] Synthetic-event fixtures intentionally spread class-backed host values into plain objects.
        'typescript/no-misused-spread': 'off',
        // [P1 test-semantics] Dynamic-source tests intentionally use Function as their evaluator.
        'typescript/no-implied-eval': 'off',
        // [P1 test-semantics] Browser command fixtures expose fill methods that are unrelated to Array.fill.
        'unicorn/no-array-fill-with-reference-type': 'off',
        // [P1 test-semantics] Settlement fixtures deliberately model thenable values.
        'unicorn/no-thenable': 'off',
        // [P1 test-semantics] Compatibility tests deliberately record legacy KeyboardEvent keyCode values.
        'unicorn/prefer-keyboard-event-key': 'off',
        // [P1 test-semantics] DOM ownership fixtures require insertBefore's explicit parent contract.
        'unicorn/prefer-modern-dom-apis': 'off',
        // [P1 test-semantics] Mutable callback fixtures need assignable wrappers around coercion functions.
        'unicorn/prefer-native-coercion-functions': 'off',
      },
    },
    {
      files: [
        '**/benchmarks/**',
        '**/dev/**',
        '**/editor-perf/**',
        '**/scripts/**',
        '**/*.{config,setup}.{cjs,cts,js,jsx,mjs,mjsx,mts,ts,tsx}',
        'tooling/**',
      ],
      rules: {
        // [P1 output-owner] CLI and dev tools own their terminal output.
        'no-console': 'off',
        // [P0 adapter-boundary] Tooling consumes generated, process, and cross-realm values whose command contracts provide the runtime proof; local casts would only launder them.
        'typescript/no-unsafe-argument': 'off',
        // [P0 adapter-boundary] Tooling consumes generated, process, and cross-realm values whose command contracts provide the runtime proof; local casts would only launder them.
        'typescript/no-unsafe-assignment': 'off',
        // [P0 adapter-boundary] Tooling consumes generated, process, and cross-realm values whose command contracts provide the runtime proof; local casts would only launder them.
        'typescript/no-unsafe-call': 'off',
        // [P0 adapter-boundary] Tooling consumes generated, process, and cross-realm values whose command contracts provide the runtime proof; local casts would only launder them.
        'typescript/no-unsafe-member-access': 'off',
        // [P0 adapter-boundary] Tooling consumes generated, process, and cross-realm values whose command contracts provide the runtime proof; local casts would only launder them.
        'typescript/no-unsafe-return': 'off',
      },
    },
    {
      files: ['**/*.config.{cjs,js}', '.changeset/**/*.js'],
      rules: {
        // [P1 compatibility] Tool loaders may require CommonJS configuration even in an ESM repository.
        'unicorn/prefer-module': 'off',
      },
    },
    {
      files: ['**/*.d.ts', '**/*.d.mts', '**/*.d.cts'],
      rules: {
        // [P1 ambient-contract] Ambient modules need not add runtime exports.
        'unicorn/require-module-specifiers': 'off',
        // [P1 ambient-contract] Declarations intentionally introduce ambient names.
        'no-implicit-globals': 'off',
        // [P1 ambient-contract] Declaration merging intentionally repeats names.
        'no-redeclare': 'off',
        // [P1 ambient-contract] Ambient declarations require var syntax.
        'no-var': 'off',
        // [P1 ambient-contract] Ambient vars have no runtime ordering.
        'vars-on-top': 'off',
        // [P1 ambient-contract] JSX and HKT declarations may require triple-slash namespace dependencies.
        'typescript/triple-slash-reference': 'off',
      },
    },
    {
      files: ['**/registry/examples/values/**'],
      rules: {
        // [P1 fixture-data] Template-looking text is serialized editor data.
        'no-template-curly-in-string': 'off',
        // [P1 fixture-data] Expression statements construct serialized editor data.
        'no-unused-expressions': 'off',
        // [P1 fixture-data] JSX brace spelling is serialized editor content, not rendered syntax.
        'react/jsx-curly-brace-presence': 'off',
        // [P0 fixture-boundary] Serialized JSX globals intentionally erase values.
        'typescript/no-unsafe-argument': 'off',
        // [P0 fixture-boundary] Serialized JSX globals intentionally erase values.
        'typescript/no-unsafe-assignment': 'off',
        // [P0 fixture-boundary] Serialized JSX globals intentionally erase values.
        'typescript/no-unsafe-member-access': 'off',
        // [P0 fixture-boundary] Serialized JSX globals intentionally erase values.
        'typescript/no-unsafe-return': 'off',
      },
    },
  ],
  rules: {
    // P0: enforcing the rule can change behavior or hide correctness.
    // P1: the rule rejects a valid recurring pattern or compatibility boundary.
    // P2: the rule enforces syntax or naming without a safety benefit.
    // [P0 inconsistent] This rule bans Jest/Vitest module replacement while ignoring the repository's equivalent Bun mock.module API; production dependency injection solely for tests would worsen runtime APIs.
    'anti-slop/no-module-mocking': 'off',
    // [P0 laundering] Object spread ignores both empty objects and undefined; this rule is defeated by a behavior-equivalent token swap and generated mass no-op churn.
    'anti-slop/no-conditional-empty-object-spread': 'off',
    // [P0 counterproductive] Explicit broad annotations can intentionally hide implementation literals behind a stable mutable or API contract; this syntax-only rule is trivially bypassed by identity wrappers and therefore generates abstraction sludge.
    'anti-slop/no-known-value-widening': 'off',
    // [P0 conflicting] This rule forces fake one-use `Value extends object` parameters; plain object parameters preserve the actual contract without invented precision.
    'anti-slop/no-object-parameters': 'off',
    // [P0 counterproductive] Native typeof is the canonical primitive guard; banning it creates wrapper indirection, hides null semantics, and moves validation away from the owning branch.
    'anti-slop/no-runtime-typeof': 'off',
    // [P0 semantic-change] `shape` is legitimate schema and AST vocabulary plus an external API property; banning it renamed serialized entitlement fields and content-derived IDs, corrupting contracts for vocabulary preference.
    'anti-slop/no-shape-in-symbol-names': 'off',
    // [P0 conflicting] Parsers, type guards, and rejected-promise callbacks must accept unknown; this rule conflicts with use-unknown-in-catch-callback-variable and rewards fake generics instead of validation.
    'anti-slop/no-unknown-parameters': 'off',
    // [P0 boundary-conflict] Parsers, selectors, property bags, and external adapters must sometimes return unparsed unknown; forcing a named false type or assertion hides the validation boundary instead of making it safer.
    'anti-slop/no-unknown-returns': 'off',
    // [P0 counterproductive] This presence-only rule cannot verify an invariant; it rewards canned and misplaced comments while type-aware unsafe, chained, and widening rules check the actual assertions.
    'anti-slop/require-safety-comment-for-type-assertion': 'off',
    // [P1 valid-pattern] Interface-shaped instance methods need not read this in every implementation.
    'class-methods-use-this': 'off',
    // [P0 counterproductive] A fixed threshold rewards function splitting, not lower domain complexity.
    complexity: 'off',
    // [P0 counterproductive] Forced defaults can hide missing cases in otherwise exhaustive switches.
    'default-case': 'off',
    // [P2 style-only] Declarations and expressions have useful, different hoisting and locality semantics.
    'func-style': 'off',
    // [P2 style-only] Inline and top-level type imports both serve legitimate readability needs.
    'import/consistent-type-specifier-style': 'off',
    // [P0 conflict] TS7 module resolution owns TypeScript import-shape validation more reliably.
    'import/default': 'off',
    // [P0 conflict] TS7 module resolution owns namespace import validation more reliably.
    'import/namespace': 'off',
    // [P0 false-positive] Default exports may intentionally expose properties matching named exports.
    'import/no-named-as-default-member': 'off',
    // [P0 counterproductive] Closely related private classes can belong in one ownership-focused file.
    'max-classes-per-file': 'off',
    // [P0 counterproductive] Database and workflow operations are often intentionally sequential.
    'no-await-in-loop': 'off',
    // [P1 valid-pattern] Bitwise operations are valid for masks, hashes, and binary protocols.
    'no-bitwise': 'off',
    // [P0 semantic-change] Plate's grapheme, hash, mask, and binary algorithms intentionally use JavaScript's signed 32-bit operators; arithmetic rewrites change truncation, overflow, or UTF-16 behavior.
    'oxc/bad-bitwise-operator': 'off',
    // [P1 valid-pattern] value == null intentionally checks null and undefined together.
    'no-eq-null': 'off',
    // [P2 style-only] Inline comments can be the clearest place to explain one expression or argument.
    'no-inline-comments': 'off',
    // [P0 duplicate-false-positive] no-var already removes the shared-binding bug; this rule still rejects closures over safe block-scoped loop bindings.
    'no-loop-func': 'off',
    // [P1 counterproductive] Failure-first branches are often clearest when the exceptional condition is negated.
    'no-negated-condition': 'off',
    // [P2 style-only] Small expression-local branches can be clearer than expanded control flow.
    'no-nested-ternary': 'off',
    // [P2 style-only] Increment and decrement are idiomatic in indexed loops.
    'no-plusplus': 'off',
    // [P0 conflict] TypeScript catches unsafe temporal access while valid declarations can be hoisted.
    'no-use-before-define': 'off',
    // [P1 valid-pattern] void explicitly marks intentionally discarded promises or values.
    'no-void': 'off',
    // [P2 style-only] Direct property access can preserve locality better than a one-use destructuring declaration.
    'prefer-destructuring': 'off',
    // [P2 style-only] Named groups add ceremony to small regexes without adding safety.
    'prefer-named-capture-group': 'off',
    // [P1 compatibility] Promise constructors are required to adapt callback and event APIs.
    'promise/avoid-new': 'off',
    // [P1 compatibility] Promise-to-callback bridges can be the correct integration boundary.
    'promise/no-callback-in-promise': 'off',
    // [P1 valid-pattern] Nested promises can retain an outer dependency without widening its scope or duplicating work.
    'promise/no-nesting': 'off',
    // [P1 compatibility] Callback-to-Promise bridges can be the correct integration boundary.
    'promise/no-promise-in-callback': 'off',
    // [P1 compatibility] Callbacks remain correct for event, stream, and provider APIs.
    'promise/prefer-await-to-callbacks': 'off',
    // [P1 valid-pattern] Promise chaining can better express composition and concurrent flow.
    'promise/prefer-await-to-then': 'off',
    // [P1 valid-pattern] then's rejection callback can intentionally scope error handling.
    'promise/prefer-catch': 'off',
    // [P1 compatibility] Typed vendor and test Promise extensions may be deliberate.
    'promise/spec-only': 'off',
    // [P0 semantic-change] Caching a property outside a loop changes getter timing and mutation visibility; lint cannot prove the access is pure, stable, or hot enough to justify that rewrite.
    'react-doctor/js-cache-property-access': 'off',
    // [P0 owner-conflict] Combining array stages changes callback index, mutation, and allocation behavior while often reducing readability; benchmark evidence, not lint, owns hot-path loop fusion.
    'react-doctor/js-combine-iterations': 'off',
    // [P0 owner-conflict] Replacing map/filter stages with flatMap changes callback indexes and intermediate-value ownership for a speculative allocation win; measured hot paths choose that tradeoff locally.
    'react-doctor/js-flatmap-filter': 'off',
    // [P0 invalid-rewrite] The rule treats every spread iterable as an Array and recommends Map, Set, and iterator `.toSorted()` calls that do not exist; its type-blind rewrite produced repository-wide TypeScript failures.
    'react-doctor/js-tosorted-immutable': 'off',
    // [P0 architecture-conflict] Plate and Plite barrels are generated public API owners; forced deep imports bypass package boundaries and can recreate module cycles, while Next package-import optimization owns external bundle expansion.
    'react-doctor/no-barrel-import': 'off',
    // [P0 semantic-change] JSON round trips intentionally enforce serialized-data semantics in codecs, collaboration, and fixtures; structuredClone preserves values that JSON must drop and rejects different inputs.
    'react-doctor/no-json-parse-stringify-clone': 'off',
    // [P0 architecture-conflict] Component modules intentionally colocate variants, hooks, schemas, and styling contracts; splitting public owners solely for development Fast Refresh fragments the API without changing production behavior.
    'react-doctor/only-export-components': 'off',
    // [P0 counterproductive] Hoisting one-owner helpers out of components harms locality and can broaden accidental reuse; pure function placement is an ownership decision, not a render-correctness law.
    'react-doctor/prefer-module-scope-pure-function': 'off',
    // [P0 counterproductive] Boolean count does not reveal invalid state combinations; forcing variants or component splits without a proven state invariant fragments otherwise clear internal APIs.
    'react-doctor/no-many-boolean-props': 'off',
    // [P0 counterproductive] The number of setState calls does not establish one state machine; reducer adoption belongs to coupled transition invariants, not a numeric threshold.
    'react-doctor/prefer-useReducer': 'off',
    // [P0 semantic-change] Manual memoization can provide observable identity to subscriptions, imperative adapters, and third-party hooks; React Compiler optimization does not prove removing each boundary preserves that contract.
    'react-doctor/react-compiler-no-manual-memoization': 'off',
    // [P0 owner-conflict] Coordinate rounding mutates canonical vector geometry without a visual tolerance or screenshot proof; SVG minification and compression, not source lint, own measured asset bytes.
    'react-doctor/rendering-svg-precision': 'off',
    // [P0 counterproductive] React Compiler already skips components it cannot safely optimize; promoting bailouts to correctness errors forces behavior-changing rewrites for optimization eligibility.
    'react/react-compiler': 'off',
    // [P2 style-only] Declarations and arrows are both valid; ownership and hoisting decide locally.
    'react/function-component-definition': 'off',
    // [P0 counterproductive] This syntax-only rule cannot see composite widgets, nested interactive children, or library-injected keyboard semantics; blindly swapping a role-bearing container for a native element can create invalid nested controls and change layout or submission behavior.
    'jsx-a11y/prefer-tag-over-role': 'off',
    // [P1 false-positive] Setter-less useState is the correct lazy per-mount constant primitive; forcing an unused setter or a different hook misstates lifecycle without adding safety.
    'react/hook-use-state': 'off',
    // [P2 style-only] Handler names are local readability choices with no behavioral effect.
    'react/jsx-handler-names': 'off',
    // [P0 conflict] React Compiler handles memoization; forced manual wrappers add churn.
    'react/jsx-no-constructed-context-values': 'off',
    // [P0 valid-pattern] React.Children is the supported traversal API for opaque children; array coercion or direct iteration does not preserve fragments, keys, or non-array child shapes.
    'react/no-react-children': 'off',
    // [P0 lifecycle-false-positive] Class components remain required for error boundaries and commit lifecycles that have no function-component equivalent.
    'react/prefer-function-component': 'off',
    // [P2 style-only] Escaping ordinary prose harms source readability without improving safety.
    'react/no-unescaped-entities': 'off',
    // [P1 compatibility] Async signatures may satisfy interfaces even when an implementation has no await.
    'require-await': 'off',
    // [P0 counterproductive] The u flag changes regex semantics and can break code-unit-oriented patterns.
    'require-unicode-regexp': 'off',
    // [P2 style-only] Domain order is more meaningful than alphabetical key churn.
    'sort-keys': 'off',
    // [P2 style-only] Declaration order should follow domain flow, not identifier spelling.
    'sort-vars': 'off',
    // [P2 style-only] Generic placement on a variable or constructor has no safety effect.
    'typescript/consistent-generic-constructors': 'off',
    // [P2 style-and-context] Object annotations, `as` assertions, and angle-bracket assertions have different contextual typing and excess-property behavior; one syntax is not universally safer.
    'typescript/consistent-type-assertions': 'off',
    'typescript/consistent-type-imports': [
      'error',
      { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
    ],
    // [P2 style-only] `T[]` and `Array<T>` are equivalent, while the generic form is often clearer for unions, intersections, and generated declarations; formatting owns local readability.
    'typescript/array-type': 'off',
    // [P0 conflict] Interfaces are open and mergeable while aliases are closed and composable; forcing either changes modeling semantics.
    'typescript/consistent-type-definitions': 'off',
    // [P2 style-only] Concise void-returning callbacks are idiomatic; braces add no safety.
    'typescript/no-confusing-void-expression': 'off',
    // [P0 robustness] Dynamic deletion is valid for JSON objects, headers, DTOs, and record-shaped external data.
    'typescript/no-dynamic-delete': 'off',
    // [P0 library-contract] Plate and Plite use any as the deliberate top type in generic constraints, conditional types, declaration surfaces, and third-party adapters; replacing it with unknown breaks assignability, while runtime input validation remains owned by the actual external boundary.
    'typescript/no-explicit-any': 'off',
    // [P0 wrong-owner] Plate's deliberate existential any contracts propagate through heterogeneous editor, plugin, schema, and adapter APIs; these rules report every typed consumer rather than the declaration or runtime-validation boundary that owns safety, so enforcement produces casts and suppressions without recovering evidence.
    'typescript/no-unsafe-argument': 'off',
    // [P0 wrong-owner] Assignments from existential editor and plugin contracts inherit deliberate erasure from their declaration; forcing consumer casts only launders the same value.
    'typescript/no-unsafe-assignment': 'off',
    // [P0 wrong-owner] Heterogeneous callback registries intentionally erase callable signatures after registration-time validation; this rule reports invocation sites that cannot recover the erased generic.
    'typescript/no-unsafe-call': 'off',
    // [P0 wrong-owner] Runtime-checked plugin and adapter portals expose heterogeneous members after the owning boundary validates their shape; consumer assertions would duplicate neither validation nor evidence.
    'typescript/no-unsafe-member-access': 'off',
    // [P0 wrong-owner] Framework adapters preserve caller-defined generic returns across type-erased registries; wrapper annotations would falsely narrow or cast those values instead of making them safer.
    'typescript/no-unsafe-return': 'off',
    // [P0 type-system-conflict] Plate's public extension algebra uses phantom generic witnesses and conditional extraction to preserve caller inference; this rule cannot observe those downstream type roles and recommends deleting part of the contract.
    'typescript/no-unnecessary-type-parameters': 'off',
    // [P0 error-identity] Plate is framework and adapter code: plugins, hosts, uploads, and providers may use typed non-Error failure values that must cross the framework unchanged; wrapping them changes observable identity and payloads.
    'typescript/only-throw-error': 'off',
    // [P0 receiver-contract] Plate APIs deliberately expose bound, receiver-free, and identity-inspected methods as first-class values; the rule cannot prove those contracts and forces wrappers or property rewrites that change identity and assignability.
    'typescript/unbound-method': 'off',
    // [P0 false-positive] This heuristic cannot follow cleanup functions returned by subscription APIs or timers drained through collection-owned cleanup; satisfying it duplicates ownership rather than preventing leaks.
    'react-doctor/effect-needs-cleanup': 'off',
    // [P2 style-only] Static-only or private classes can express ownership and interface shape.
    'typescript/no-extraneous-class': 'off',
    // [P2 style-only] Explicit annotations on initialized declarations can document and freeze a public, mutable, or generated contract; removing them provides no safety gain.
    'typescript/no-inferrable-types': 'off',
    // [P2 intent-marker] `void` can deliberately mark ignored completion and fire-and-forget intent even when the current callee returns void; removing it gains no type safety and makes intent depend on a drifting signature.
    'typescript/no-meaningless-void-operator': 'off',
    // [P1 declaration-contract] Namespace merging is a unique TypeScript mechanism used by JSX, HKT, and extension declarations; banning it forces less accurate type structure.
    'typescript/no-namespace': 'off',
    // [P2 style-only] Explicit boolean comparisons can document expected polarity.
    'typescript/no-unnecessary-boolean-literal-compare': 'off',
    // [P1 robustness] Defensive checks protect against external data that violates declared types.
    'typescript/no-unnecessary-condition': 'off',
    'typescript/restrict-template-expressions': [
      'error',
      { allowArray: true, allowNumber: true },
    ],
    // [P0 runtime-robustness] Published TypeScript libraries still receive JavaScript and stale serialized inputs; a destructuring default can intentionally defend runtime callers even when the declared type is non-nullish.
    'typescript/no-useless-default-assignment': 'off',
    // [P1 robustness] Explicit conversion documents normalization at external boundaries.
    'typescript/no-unnecessary-type-conversion': 'off',
    // [P0 counterproductive] This rejects valid typed-route, generic-restoration, branded-value, validated-parser, and test-double boundaries with no usable options; enforcing it drives assertion-laundering helpers while runtime validators and precise boundary types own actual evidence loss.
    'typescript/no-unsafe-type-assertion': 'off',
    // [P2 style-only] Choosing non-null assertion syntax over as is style, not safety.
    'typescript/non-nullable-type-assertion-style': 'off',
    // [P0 type-semantic-change] Interface methods are intentionally bivariant while function-valued properties are checked contravariantly under strictFunctionTypes; rewriting between them changes public assignability.
    'typescript/method-signature-style': 'off',
    // [P2 style-only] Constructor parameter properties are a local readability tradeoff.
    'typescript/parameter-properties': 'off',
    // [P1 valid-pattern] Index loops may need stable indices, mutation, or precise iteration control.
    'typescript/prefer-for-of': 'off',
    // [P1 valid-pattern] Empty string, zero, and false are sometimes intentionally treated as missing.
    'typescript/prefer-nullish-coalescing': 'off',
    // [P2 style-only] match and exec expose different APIs; neither is universally clearer.
    'typescript/prefer-regexp-exec': 'off',
    'typescript/require-array-sort-compare': [
      'error',
      { ignoreStringArrays: true },
    ],
    // [P0 counterproductive] Returning an existing promise avoids an unnecessary async wrapper.
    'typescript/promise-function-async': 'off',
    // [P0 counterproductive] Narrowed domain values make idiomatic truthiness safe; this rule adds coercion noise.
    'typescript/strict-boolean-expressions': 'off',
    // [P0 conflict] TypeScript intentionally accepts value-returning callbacks where void is expected.
    'typescript/strict-void-return': 'off',
    // [P0 type-semantic-change] Overload order, distinct documentation, generic inference, and correlated parameter/return pairs are observable public API behavior that a union signature can weaken or erase.
    'typescript/unified-signatures': 'off',
    // [P2 style-only] Error variable names are contextual and have no safety effect.
    'unicorn/catch-error-name': 'off',
    // [P2 style-only] Equivalent index checks do not deserve a globally enforced spelling.
    'unicorn/consistent-existence-index-check': 'off',
    // [P0 counterproductive] Hoisting local helpers outward harms ownership and locality.
    'unicorn/consistent-function-scoping': 'off',
    // [P0 conflict] Oxfmt expands empty catch blocks while this rule demands compact braces, creating a formatter-linter loop with no semantic value.
    'unicorn/empty-brace-spaces': 'off',
    // [P0 conflict] Framework and domain filename conventions legitimately differ.
    'unicorn/filename-case': 'off',
    // [P0 conflict] Import form depends on API, bundler, and tree-shaking behavior.
    'unicorn/import-style': 'off',
    // [P1 valid-pattern] forEach is concise for synchronous side effects and is not inherently unsafe.
    'unicorn/no-array-for-each': 'off',
    // [P1 valid-pattern] Array callback thisArg is valid and can avoid closure allocation.
    'unicorn/no-array-method-this-argument': 'off',
    // [P1 valid-pattern] reduce is the clearest form for genuine accumulations.
    'unicorn/no-array-reduce': 'off',
    // [P1 compatibility] toReversed adds allocation and newer-runtime requirements; owned mutation is valid.
    'unicorn/no-array-reverse': 'off',
    // [P1 compatibility] toSorted adds allocation and newer-runtime requirements; owned mutation is valid.
    'unicorn/no-array-sort': 'off',
    // [P2 style-only] Awaited member access is unambiguous; an intermediate variable adds noise.
    'unicorn/no-await-expression-member': 'off',
    // [P1 counterproductive] Failure-first branches are often clearest when the exceptional condition is negated.
    'unicorn/no-negated-condition': 'off',
    // [P2 style-only] Compact expression branches can be clearer; syntax shape is not correctness.
    'unicorn/no-nested-ternary': 'off',
    // [P1 valid-pattern] A numeric Array constructor intentionally creates sparse or fixed-size indexed storage; alternatives allocate or change hole semantics.
    'unicorn/no-new-array': 'off',
    // [P1 valid-pattern] Typed dependency objects make unsafe partial defaults a compile-time concern.
    'unicorn/no-object-as-default-parameter': 'off',
    // [P0 conflict] Static-only classes can intentionally express a constructless namespace or dependency-injection contract.
    'unicorn/no-static-only-class': 'off',
    // [P2 style-only] Numeric separator grouping does not change values, and enforcing arbitrary digit groups conflicts with the formatter owning source spelling.
    'unicorn/numeric-separators-style': 'off',
    // [P1 valid-pattern] Explicit undefined can preserve tuple positions, object shape, and API intent.
    'unicorn/no-useless-undefined': 'off',
    // [P0 semantic-change] Moving constructor assignments to fields can change initialization order and subclass behavior.
    'unicorn/prefer-class-fields': 'off',
    // [P0 semantic-change] Default parameters treat only undefined as missing; rewrites can change null and falsy behavior.
    'unicorn/prefer-default-parameters': 'off',
    // [P0 semantic-change] JavaScript strings, DOM offsets, and editor positions use UTF-16 code units; codePointAt combines surrogate pairs and changes index-based algorithms that intentionally use charCodeAt.
    'unicorn/prefer-code-point': 'off',
    // [P0 conflict] append and appendChild differ in accepted values and return semantics.
    'unicorn/prefer-dom-node-append': 'off',
    // [P0 semantic-change] getAttribute preserves exact data-* names and reports absence as null; dataset camel-cases names and reports absence as undefined, changing observable tests and runtime branches.
    'unicorn/prefer-dom-node-dataset': 'off',
    // [P0 semantic-change] removeChild validates the expected parent and returns the removed node; remove silently detaches from any parent and returns undefined.
    'unicorn/prefer-dom-node-remove': 'off',
    // [P0 semantic-change] innerText reads rendered visible text while textContent reads raw hidden content without layout-aware line breaks; browser assertions choose between those contracts explicitly.
    'unicorn/prefer-dom-node-text-content': 'off',
    // [P1 valid-pattern] Importing before export keeps local ownership and transformation points explicit.
    'unicorn/prefer-export-from': 'off',
    // [P1 compatibility] New import.meta properties are not uniformly supported by runtimes and bundlers.
    'unicorn/prefer-import-meta-properties': 'off',
    // [P2 style-only] Explicit ternaries can communicate result values better than truthiness operators.
    'unicorn/prefer-logical-operator-over-ternary': 'off',
    // [P0 semantic-change] Bitwise truncation intentionally converts through signed 32-bit integer space; Math.trunc preserves larger magnitudes and therefore changes hashes and binary algorithms.
    'unicorn/prefer-math-trunc': 'off',
    // [P0 counterproductive] Number conversion forms have different parsing semantics.
    'unicorn/prefer-number-coercion': 'off',
    // [P1 valid-pattern] Specialized DOM APIs can express stronger intent and narrower types.
    'unicorn/prefer-query-selector': 'off',
    // [P1 valid-pattern] Combining calls can obscure staged side effects and error boundaries.
    'unicorn/prefer-single-call': 'off',
    // [P0 counterproductive] Spread can allocate, hit argument limits, or change iterable semantics.
    'unicorn/prefer-spread': 'off',
    // [P1 compatibility] replace and replaceAll differ in semantics and runtime support.
    'unicorn/prefer-string-replace-all': 'off',
    // [P0 conflict] The type-aware TypeScript rule owns this deprecated Unicorn rule's concern.
    'unicorn/prefer-string-starts-ends-with': 'off',
    // [P0 counterproductive] structuredClone rejects or changes functions, prototypes, and custom values.
    'unicorn/prefer-structured-clone': 'off',
    // [P2 style-only] Statements are clearer for side effects and multi-step branches.
    'unicorn/prefer-ternary': 'off',
    // [P0 conflict] Error classes are observable domain and telemetry contracts, not syntax choices.
    'unicorn/prefer-type-error': 'off',
    // [P2 style-only] Case braces are useful for scoped declarations, not as blanket ceremony.
    'unicorn/switch-case-braces': 'off',
    // [P0 conflict] Generated public barrels are a release and API owner enforced by pnpm brl; banning them contradicts package architecture.
    'oxc/no-barrel-file': 'off',
    // [P0 duplicate-ownership] typescript/no-empty-object-type owns the same declaration concern; declaration merging is handled by a declaration override.
    'typescript/no-empty-interface': 'off',
    // [P0 semantic-conflict] Plate proxy, descriptor, schema, and dynamic plugin runtimes require receiver-aware Reflect.get semantics that typed property syntax cannot preserve.
    'anti-slop/no-reflect-get': 'off',
    // [P0 semantic-change] Plate command, schema, and plugin runtimes require receiver-controlled dynamic invocation; direct calls or wrappers change this semantics or launder the same boundary.
    'anti-slop/no-reflect-apply': 'off',
    // [P0 counterproductive] Conventional callback and API names such as editor, target, options, and value improve locality throughout Plate; forced renaming adds noise without lexical safety.
    'no-shadow': 'off',
    // [P0 false-positive] The rule misclassifies typed editor, lifecycle, DOM, and middleware callbacks as Node error-first callbacks; TypeScript owns their return contracts.
    'node/callback-return': 'off',
    // [P0 owner-conflict] The rule reintroduces the rejected no-await-in-loop policy and cannot prove independence, ordering, memory bounds, or side-effect safety.
    'react-doctor/async-await-in-loop': 'off',
    // [P0 counterproductive] A fixed line threshold rewards arbitrary component splitting instead of reducing state or ownership complexity.
    'react-doctor/no-giant-component': 'off',
    // [P0 duplicate-ownership] The deprecated aggregate duplicates no-unsafe-function-type, no-wrapper-object-types, and configurable no-empty-object-type while rejecting Plate's intentional non-nullish object contract.
    'typescript/ban-types': 'off',
    // [P0 semantic-change] Plate uses void as a command-input marker and typed handler result constituent; replacement changes conditional tuple inference or handled/no-result contracts.
    'typescript/no-invalid-void-type': 'off',
    // [P1 valid-pattern] Modern module-scoped declarations may intentionally close over branch-local state; moving them outward widens mutable ownership without fixing a runtime hazard.
    'no-inner-declarations': 'off',
    // [P0 non-actionable] Recursive editor/plugin graphs and generated public barrels make this rule report every participant instead of the owning edge; typecheck and runtime tests own initialization correctness.
    'import/no-cycle': 'off',
    // [P0 generated-owner] Repository barrels are generator-owned, and the generator cannot classify type-only exports; manual rewrites are regenerated while TypeScript still verifies the export graph.
    'typescript/consistent-type-exports': 'off',
    // [P1 valid-pattern] Capturing this can be the simplest explicit bridge for callback and constructor-double ownership.
    'typescript/no-this-alias': 'off',
    // [P0 semantic-change] Fixed small arrays, substring checks, and ordered plugin lists are not lookup tables; allocating Set or Map can add work or change matching semantics.
    'react-doctor/js-set-map-lookups': 'off',
    // [P0 semantic-change] Prefix and lineage comparisons intentionally accept different lengths; forcing equal-length checks changes the relation into equality.
    'react-doctor/js-length-check-first': 'off',
    // [P0 architecture-conflict] Guarded client loaders tied to hydrated browser state are valid owners; a blanket server rewrite changes refresh and loading behavior.
    'react-doctor/no-fetch-in-effect': 'off',
    // [P0 architecture-conflict] Controlled React composition legitimately sends state and data to the parent owner; banning that flow duplicates or desynchronizes state.
    'react-doctor/no-pass-data-to-parent': 'off',
    // [P0 architecture-conflict] Controlled React composition legitimately sends live state to the parent owner; banning that flow duplicates or desynchronizes state.
    'react-doctor/no-pass-live-state-to-parent': 'off',
    // [P0 public-api-conflict] Render-prop children are a deliberate public composition contract; renaming the slot does not improve correctness and breaks the API.
    'react-doctor/no-render-prop-children': 'off',
    // [P0 dependency-mismatch] This repository compiles against Zod 3, so the reported Zod 4 replacement APIs do not exist in the installed owner version.
    'react-doctor/zod-v4-no-deprecated-schema-apis': 'off',
    // [P1 valid-pattern] cloneElement is the standard API for preserving a supplied element while injecting owned accessibility, style, or command props.
    'react/no-clone-element': 'off',
    // [P0 false-positive] Editor and fixture data legitimately use a field named ref; this syntax rule mistakes plain object data for legacy React string refs.
    'react/no-string-refs': 'off',
    // [P1 valid-pattern] Retained class components and error boundaries require setState for lifecycle recovery.
    'react/no-set-state': 'off',
    // [P1 valid-pattern] Class fields are the repository's standard state initialization syntax; forcing constructor assignment is obsolete ceremony.
    'react/state-in-constructor': 'off',
    // [P0 semantic-change] Removing a spread can share object or array identity with later mutation even when the syntax-only rule calls the copy useless.
    'unicorn/no-useless-spread': 'off',
    // [P0 robustness] typeof is the only safe existence check for a potentially undeclared host global; replacing it with a direct read can throw.
    'unicorn/no-typeof-undefined': 'off',
    // [P1 valid-pattern] Assigning this to an owned variable is a legitimate callback or constructor-double bridge, not a correctness defect.
    'unicorn/no-this-assignment': 'off',
    // [P0 false-positive] This syntax rule mistakes domain methods named slice for built-in Array or String slicing, where a negative index would change the input contract.
    'unicorn/prefer-negative-index': 'off',
    // [P0 false-positive] This syntax rule mistakes arbitrary callbacks or methods named match for RegExp matching and recommends an unrelated API.
    'unicorn/prefer-regexp-test': 'off',
    // [P1 valid-pattern] Object.assign and object spread have distinct setter, generic-inference, and compatibility behavior; neither form is universally preferable.
    'prefer-object-spread': 'off',
    curly: ['error', 'multi-line'],
    'func-names': ['error', 'as-needed', { generators: 'as-needed' }],
    eqeqeq: ['error', 'smart'],
    'jsdoc/check-tag-names': [
      'error',
      {
        definedTags: [
          'experimental',
          'packageDocumentation',
          'platejs-curated-entrypoint',
        ],
        jsxTags: true,
      },
    ],
    // [P0 laundering] No-op callbacks are valid context defaults, timers, adapters, and optional handlers; replacing an empty body with undefined is behavior-equivalent token laundering.
    'no-empty-function': 'off',
    // [P0 counterproductive] TODO/FIXME are accepted debt markers; banning their spelling hides work instead of resolving it.
    'no-warning-comments': 'off',
    'no-console': ['error', { allow: ['assert', 'error', 'info', 'warn'] }],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
      },
    ],
    // Self-referential closures require deferred assignment; artificial wrappers would only satisfy syntax.
    'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    'react/jsx-pascal-case': [
      'error',
      { allowAllCaps: true, allowNamespace: true },
    ],
    'promise/param-names': [
      'error',
      {
        rejectPattern: '^_?reject(?:[A-Z].*)?$',
        resolvePattern: '^_?resolve(?:[A-Z].*)?$',
      },
    ],
    'typescript/no-empty-object-type': [
      'error',
      {
        allowInterfaces: 'with-single-extends',
        allowObjectTypes: 'always',
      },
    ],
    'typescript/no-floating-promises': [
      'error',
      {
        allowForKnownSafeCalls: [
          {
            from: 'package',
            name: [
              'afterAll',
              'afterEach',
              'beforeAll',
              'beforeEach',
              'describe',
              'it',
              'module',
              'suite',
              'test',
            ],
            package: 'bun:test',
          },
          {
            from: 'package',
            name: [
              'after',
              'afterEach',
              'before',
              'beforeEach',
              'describe',
              'it',
              'suite',
              'test',
            ],
            package: 'node:test',
          },
        ],
      },
    ],
    'typescript/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: false } },
    ],
    'typescript/return-await': ['error', 'error-handling-correctness-only'],
    'typescript/switch-exhaustiveness-check': [
      'error',
      { considerDefaultExhaustiveForUnions: true },
    ],
  },
});
