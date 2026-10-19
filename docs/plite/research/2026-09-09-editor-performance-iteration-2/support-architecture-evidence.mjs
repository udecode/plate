export const supportEvidence = [
  {
    id: 'product.registry',
    file: 'registry.ts',
    grades: '3333222',
    owner:
      'The source registry owns copied editor components, feature kits and runnable examples.',
    lifetime:
      'Generated registry output follows source generation; copied application consumers have independent installed lifetimes.',
    boundary:
      'Package proof does not automatically prove copied-source component configuration.',
    api: 'Examples and installable components are real public setup paths, including ordinary applications without generated contracts.',
    scale:
      'Full kits, optional feature reachability, toolbar stores and embedded widgets affect real route mount/edit cost.',
    correctness:
      'Copied UI must preserve schema, selection, focus and async cleanup in the consumer application.',
    proof:
      'The 41 canonical routes and 752 discovered Chromium cases define available journey evidence; production copy-out still needs its own configuration proof.',
    falsifier:
      'A package benchmark win that disappears with the real copied feature kit cannot support a registry performance claim.',
  },
  {
    id: 'product.www-host',
    file: 'apps/www/next.config.ts',
    grades: '3333222',
    incomplete: true,
    owner:
      'The documentation/application host owns route composition, framework configuration and surrounding page work.',
    lifetime:
      'Server output, client navigation and editor mounts have distinct lifetimes.',
    boundary:
      'Documentation chrome and route loading are separate from editor substrate cost.',
    api: 'Actual block/demo routes are the product consumer surface.',
    scale:
      'Framework build mode, cold hydration, route bundles and optional UI can dominate product smoke results.',
    correctness:
      'Hydration, route state and mounted feature configuration must match the measured build.',
    proof:
      'Route inventory is complete within the captured source set; materially distinct host consumers have not all been traced, so no numeric score is issued.',
    falsifier:
      'Complete the current/main real-route consumer trace and matching host build before lifting the incomplete-manifest cap.',
  },
  {
    id: 'proof.benchmark',
    file: 'benchmark-artifact.ts',
    grades: '3333222',
    owner:
      'Canonical target definitions and owned runners supply benchmark execution; research artifacts record one run.',
    lifetime:
      'A receipt belongs to exact source, fixture, toolchain, host and measurement policy.',
    boundary:
      'Performance observations remain separate from correctness and publication authority.',
    api: 'The target registry is the single discovery surface; a research coverage matrix must not become a competing target registry.',
    scale:
      'Observer work, snapshots, file writes and profiling can perturb large-document timing.',
    correctness:
      'Every timed operation needs text, marks, selection and focus oracles plus capability accounting.',
    proof:
      'This iteration repaired the Slate chunk-on control and preserved invalid, failed and unsupported results.',
    falsifier:
      'Any changed baseline strategy, missing oracle, censored duration reported as zero or p99 without enough samples invalidates the receipt.',
  },
  {
    id: 'proof.browser-host',
    file: 'apps/plite/playwright.config.ts',
    grades: '3333232',
    owner:
      'The Plite browser host reuses canonical www examples and owns browser-project execution.',
    lifetime:
      'A browser proof is bound to the serving build and fixture source identity.',
    boundary:
      'Automated browser, mobile viewport and raw device proof have different capability contracts.',
    api: 'Canonical journey discovery selects the actual example routes and existing assertions.',
    scale:
      'Serial timing avoids worker contention; browser breadth and performance distributions are separate runs.',
    correctness:
      'Native events, DOM/model convergence and exact route configuration are proof requirements.',
    proof:
      'All 752 Chromium cases are discovered; the timing overlay retains their assertions and explicitly reports Event Timing limitations.',
    falsifier:
      'A source/host fingerprint mismatch or a semantic mobile row presented as device evidence invalidates the affected claim.',
  },
  {
    id: 'proof.package-corpus',
    file: 'packages/platejs/src/features/table/lib/internal/mutation.benchmark.slow.ts',
    grades: '3333222',
    owner:
      'Package behavior and slow corpora own direct model, codec and feature invariants.',
    lifetime:
      'Each fixture/test owns its editor and cleanup; historical results stay immutable.',
    boundary:
      'Headless correctness is distinct from browser-native delivery and product latency.',
    api: 'Tests exercise public feature operations and selected internal correctness owners.',
    scale:
      'Large fixtures test specific growth laws; a unit test duration is not a user interaction metric.',
    correctness:
      'Exact values, spans, roots and undo outcomes must remain the semantic oracle.',
    proof:
      'Corpus files are inventoried; foreign portable invariants require individual dispositions rather than an aggregate green count.',
    falsifier:
      'A benchmark assertion that mirrors an implementation shortcut without testing the user outcome provides no regression protection.',
  },
  {
    id: 'proof.test-api',
    file: 'hyperscript.ts',
    grades: '3333222',
    owner:
      'Test helpers and hyperscript construct canonical documents and selections for behavior proof.',
    lifetime:
      'Helper state belongs to one fixture construction or test editor.',
    boundary:
      'Fixture conveniences must not become required product APIs or substitute for native input.',
    api: 'The test surface expresses readable expected document and selection structures.',
    scale:
      'Fixture construction and oracle reads can dominate a badly placed measurement boundary.',
    correctness:
      'Generated fixtures must preserve exact keys, marks, roots and selection semantics.',
    proof:
      'Test package exports and helper files are captured; benchmark setup/oracle time must remain explicitly accounted.',
    falsifier:
      'If the helper normalizes away the behavior under test or leaks work into only one benchmark arm, the proof is invalid.',
  },
  {
    id: 'proof.tooling',
    file: 'check-plite.mjs',
    grades: '3333232',
    owner:
      'The existing check runner owns affected development proof and strict package/browser handoff lanes.',
    lifetime:
      'A check receipt belongs to one effective source graph and selected proof command.',
    boundary:
      'Iteration checks, strict handoff and closure browser matrix have explicit distinct scope.',
    api: 'Canonical commands select proof without requiring users to reconstruct runner internals.',
    scale:
      'Broad browser matrices stay out of the normal affected development loop.',
    correctness:
      'Changed-owner routing must fail closed on missing proof and preserve source/build identity.',
    proof:
      'Runner contracts and inventory exist; this research reuses them rather than creating a second verifier.',
    falsifier:
      'An affected owner skipped by routing or an unrelated broad matrix inserted into every edit loop is a concrete workflow defect.',
  },
  {
    id: 'tooling.cli',
    file: 'generate.ts',
    grades: '3333222',
    owner:
      'The optional CLI evaluates configuration and generates explicit application artifacts.',
    lifetime:
      'Worker evaluation and generated output belong to a command invocation and its input configuration.',
    boundary:
      'CLI generation remains advanced tooling rather than an ordinary editor setup dependency.',
    api: 'Commands expose generation/migration jobs with explicit inputs and outputs.',
    scale:
      'Configuration width, evaluation startup and output generation determine DX cost.',
    correctness:
      'Worker errors, deterministic output and stale artifact detection must remain explicit.',
    proof:
      'CLI/package source entries are inventoried; current generated-output and consumer proof remain separate gates.',
    falsifier:
      'Any ordinary registry or plugin setup forced through generation contradicts the optional-tooling contract.',
  },
  {
    id: 'tooling.package-build',
    file: 'packages/platejs/tsdown.config.mts',
    grades: '3333222',
    incomplete: true,
    owner:
      'Package build configuration owns source entries, declarations and React Compiler transformation.',
    lifetime:
      'Emitted artifacts follow exact source/toolchain/configuration inputs.',
    boundary:
      'Source-first type checking, release artifacts and copied-source app compilation have distinct reachability contracts.',
    api: 'Published exports and inferred declarations must describe the runtime consumers actually load.',
    scale:
      'Type instantiations, build memory, compiler time, bundle cost and editing latency are independent measures.',
    correctness:
      'Compilation coverage cannot justify changed semantics or mislabel uncompiled hot functions.',
    proof:
      'All captured package-support/type-test files are accounted for; full materially distinct compiler consumer traces remain incomplete and no numeric score is issued.',
    falsifier:
      'Bind all compiler arms to emitted hot functions and prove package/copied-source consumers before lifting the incomplete-manifest cap.',
  },
];
