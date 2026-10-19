import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const units = JSON.parse(
  readFileSync(`${output}/source-inventory.json`, 'utf8')
);
const contracts = JSON.parse(
  readFileSync(`${output}/package-contract-inventory.json`, 'utf8')
);
const pliteCore = {
  document:
    /^(representation|snapshot-index|clone|initial-value|element-owned-root-index|public-root|value-codec|insert-limit)$/,
  transactions:
    /^(commit|public-state|document-change|change-events|node-property-mutation|transaction-values|update-context|semantic-update-method|tx-only|update-policy)$/,
  commands:
    /^(command-definition|command-registry|editor-commands|editor-lifecycle-api|target-runtime)$/,
  reads:
    /^(read-definition|read-registry|editor-read-execution|editor-read-runtime|editor-reads|resolved-token-cursor)$/,
  schema:
    /^(correction|editor-schema|schema-compiler|schema-contribution-registry|schema-definition|schema-source.internal|schema-validation)$/,
  extensions:
    /^(editor-extension|editor-runtime|extension-registry|extension-slot|lifecycle-error|listener-state)$/,
  facets: /^(facet|state-field|state-fields)$/,
  selection: /^(anchor-state|anchor|selection-protocol|selection-state)$/,
  clipboard: /^(content-slice|get-content-slice|get-fragment)$/,
  accessibility: /^screen-reader-announcement$/,
  profiling: /^profiling$/,
};
const coreLane = (rest) => {
  if (rest.startsWith('change/')) return 'plite.change-algebra';
  if (rest.startsWith('slice-fit/')) return 'plite.schema';
  const name = rest.replace(/\.(tsx?|mts)$/, '');
  if (name === 'index') return 'plite.packaging';
  for (const [lane, pattern] of Object.entries(pliteCore))
    if (pattern.test(name)) return `plite.${lane}`;
  return null;
};
const pliteLane = (rest) => {
  if (rest.startsWith('core/')) return coreLane(rest.slice(5));
  if (/^(interfaces|types)\//.test(rest)) return 'plite.public-contracts';
  if (
    /^(editor|transforms-node|transforms-text|transforms-selection)\//.test(
      rest
    )
  )
    return 'plite.editing-primitives';
  if (rest.startsWith('history/')) return 'plite.history';
  if (rest.startsWith('yjs/'))
    return /awareness|cursor-widget/.test(rest)
      ? 'plite.collaboration-presence'
      : 'plite.collaboration-document';
  if (rest.startsWith('pagination/')) return 'plite.pagination';
  if (rest.startsWith('annotations/')) return 'plite.annotations';
  if (rest.startsWith('diff/')) return 'plite.diff';
  if (/^(testing|hyperscript)\//.test(rest)) return 'proof.test-api';
  if (rest.startsWith('internal/view/')) return 'plite.view-sources';
  if (rest.startsWith('dom/')) {
    if (/clipboard|dom-html|host-codec/.test(rest)) return 'plite.clipboard';
    if (/dom-phase-scheduler|dom-sync-mutation|dom-integrity/.test(rest))
      return 'plite.dom-scheduling';
    if (/dom-text-flow|dom-geometry|dom-node-path|dom-event-range/.test(rest))
      return 'plite.dom-coordinates';
    return 'plite.dom-adapter';
  }
  if (rest.startsWith('react/')) {
    if (/dom-strategy\//.test(rest)) return 'plite.virtualization';
    if (/android|composition/.test(rest)) return 'plite.composition';
    if (/clipboard/.test(rest)) return 'plite.clipboard';
    if (/drag/.test(rest)) return 'plite.drag';
    if (
      /root-interaction|content-root|root-selection|view-boundary|root-key|shell-runtime|inactive-selection|history-focus|interaction-owner/.test(
        rest
      )
    )
      return 'plite.multiview';
    if (/selection|caret-engine|coordinate|vertical-geometry/.test(rest))
      return 'plite.native-selection';
    if (
      /external-text|editable-text-flow|editable-text-blocks|dom-text-sync|mutation-full-block|mutation-block/.test(
        rest
      )
    )
      return 'plite.text-rendering';
    if (/decoration|widget/.test(rest)) return 'plite.view-sources';
    if (/annotation/.test(rest)) return 'plite.annotations';
    if (/dom-commit-fence|use-claim-editable-dom-commit/.test(rest))
      return 'plite.react-commit';
    if (
      /hooks\/(use-generic-selector|use-node-selector|use-editor-selector|use-element|use-state-field)/.test(
        rest
      )
    )
      return 'plite.react-subscriptions';
    if (/root-groups|segment-placeholder|dom-coverage-boundary/.test(rest))
      return 'plite.staged-rendering';
    if (/render-profiler/.test(rest)) return 'plite.profiling';
    if (/announcement/.test(rest)) return 'plite.accessibility';
    if (rest.startsWith('react/editable/')) return 'plite.input-runtime';
    return 'plite.react-components';
  }
  if (/^(create-editor|editor-runtime-view)\./.test(rest))
    return 'plite.extensions';
  if (rest.startsWith('range-projection.')) return 'plite.selection';
  if (rest.startsWith('text-units.')) return 'plite.editing-primitives';
  if (/^(utils|internal)\//.test(rest)) return 'plite.document';
  if (rest.startsWith('index.')) return 'plite.packaging';
  return null;
};
const plateLane = (rest) => {
  const feature = rest.match(/^(?:react\/)?features\/([^/]+)\//)?.[1];
  if (feature) return `plate.${feature}`;
  if (
    /^internal\/plugin\/.*(Codecs|Model|Migration|prepare|Prepare)/.test(rest)
  )
    return 'plate.schema-codecs';
  if (rest.startsWith('internal/plugin/')) return 'plate.plugin-runtime';
  if (/^lib\/plugins\/(html|input-rules)\//.test(rest))
    return `plate.${rest.split('/')[2]}`;
  if (rest.startsWith('lib/plugins/')) return 'plate.core-plugins';
  if (/^react\/(stores|hooks|internal)\//.test(rest))
    return 'plate.react-state';
  if (rest.startsWith('react/')) return 'plate.react-composition';
  if (/^lib\/(plugin|editor)\//.test(rest)) return 'plate.plugin-api';
  if (rest.startsWith('static/')) return 'plate.static';
  const family = rest.split('/')[0];
  if (
    [
      'ai',
      'code-block',
      'code-drawing',
      'compiler',
      'csv',
      'diff',
      'dnd',
      'docx',
      'emoji',
      'excalidraw',
      'markdown',
      'math',
      'migrations',
      'pagination',
      'tabbable',
      'yjs',
    ].includes(family)
  )
    return `plate.${family}`;
  if (/^(history|hyperscript|testing)\//.test(rest))
    return 'plate.substrate-adoption';
  if (/^(lib|dom|internal|utils)\//.test(rest)) return 'plate.plugin-api';
  if (/^(core|facade|index|root)\./.test(rest)) return 'plate.packaging';
  return null;
};
const classify = (unit) => {
  const path = unit.path;
  const packageMatch = path.match(
    /^packages\/(plitejs|platejs|test|cli)\/src\/(.*)$/
  );
  if (packageMatch) {
    const [, packageName, rest] = packageMatch;
    if (
      /(?:^|\/)(?:__tests__|__fixtures__|fixtures)(?:\/|$)|(?:^|\.)(?:spec|test|slow|benchmark|bench)\.(?:[cm]?[jt]sx?)$/.test(
        rest
      )
    )
      return { lane: 'proof.package-corpus', role: 'proof' };
    const lane =
      packageName === 'plitejs'
        ? pliteLane(rest)
        : packageName === 'platejs'
          ? plateLane(rest)
          : packageName === 'test'
            ? 'proof.test-api'
            : 'tooling.cli';
    return {
      lane,
      role: /\/index\.[^.]+$/.test(path) ? 'barrel' : 'implementation',
    };
  }
  if (/^packages\/(plitejs|platejs|test|cli)\//.test(path))
    return {
      lane: 'tooling.package-build',
      role: /tests?\//.test(path) ? 'proof' : 'support',
    };
  if (path.startsWith('apps/www/src/registry/'))
    return { lane: 'product.registry', role: 'consumer' };
  if (path.startsWith('apps/www/'))
    return { lane: 'product.www-host', role: 'consumer' };
  if (path.startsWith('apps/plite/'))
    return {
      lane: 'proof.browser-host',
      role: /spec|test/.test(path) ? 'proof' : 'consumer',
    };
  if (path.startsWith('benchmarks/'))
    return { lane: 'proof.benchmark', role: 'benchmark' };
  if (path.startsWith('tooling/')) {
    if (
      /release|npm-publish|beta-pre-release|auto-release|template-refresh|template-packages|template-registry|migrate-platejs|sync-version/.test(
        path
      )
    )
      return {
        lane: 'excluded.release-operations',
        role: 'excluded',
        reason:
          'Release and migration automation does not execute during a human editor interaction; package artifact verification remains in scope.',
      };
    return {
      lane: 'proof.tooling',
      role: /spec|test/.test(path) ? 'proof' : 'support',
    };
  }
  return { lane: null, role: 'unclassified' };
};

const mapped = units.map((unit) => ({ ...unit, ...classify(unit) }));
const missing = mapped.filter((unit) => !unit.lane);
const lanes = [...new Set(mapped.map((unit) => unit.lane).filter(Boolean))]
  .sort()
  .map((id) => {
    const members = mapped.filter((unit) => unit.lane === id);
    return {
      id,
      count: members.length,
      roles: Object.fromEntries(
        [...new Set(members.map((unit) => unit.role))].map((role) => [
          role,
          members.filter((unit) => unit.role === role).length,
        ])
      ),
      files: members.map((unit) => unit.path),
      scored: !id.startsWith('excluded.'),
    };
  });
const exported = contracts.flatMap((contract) =>
  Object.entries(contract.exports).map(([entrypoint, target]) => ({
    package: contract.name,
    entrypoint,
    target,
    sourceOwners:
      entrypoint === './package.json'
        ? ['tooling.package-build']
        : contract.name === '@platejs/test'
          ? ['proof.test-api']
          : [
              contract.name === 'plitejs'
                ? 'plite.packaging'
                : 'plate.packaging',
            ],
    traceStatus:
      'entrypoint-contract-captured; semantic-export-facets-linked-by-lane',
  }))
);
const result = {
  capturedAt: new Date().toISOString(),
  method:
    'Fresh source ownership map created before reading prior audit candidates. Each captured unit has exactly one accounting owner. A mapping is inventory evidence, not proof that every implementation has been semantically audited.',
  expectedUnits: units.length,
  mappedUnits: mapped.length - missing.length,
  unclassifiedUnits: missing,
  lanes,
  exported,
  units: mapped,
};
writeFileSync(
  `${output}/local-architecture-manifest.json`,
  `${JSON.stringify(result, null, 2)}\n`
);
console.log(
  JSON.stringify({
    units: result.expectedUnits,
    mapped: result.mappedUnits,
    missing: missing.map((unit) => unit.path),
    lanes: lanes.length,
    exports: exported.length,
  })
);
if (missing.length) process.exitCode = 1;
