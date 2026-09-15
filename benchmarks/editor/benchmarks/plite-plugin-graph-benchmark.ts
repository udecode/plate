import type { PluginReference } from '../../../packages/plitejs/src/index';
import {
  createEditor,
  definePlugin,
} from '../../../packages/plitejs/src/index';
import { getPluginRegistry } from '../../../packages/plitejs/src/internal';
import { getDefined } from '../../getDefined';
import { writeBenchmarkArtifact } from './benchmark-artifact';

const outputArgument = process.argv.find((argument) =>
  argument.startsWith('--output=')
);
const strict = process.env.PLITE_PLUGIN_GRAPH_STRICT === '1';
const cohorts = [
  { compileSamples: 40, descriptors: 10, reconfigureSamples: 40 },
  { compileSamples: 25, descriptors: 100, reconfigureSamples: 25 },
  { compileSamples: 10, descriptors: 1000, reconfigureSamples: 10 },
] as const;
const budgets = {
  compile1000P95MsExclusive: 1000,
  reconfigure1000CleanupP95MsExclusive: 1000,
  reconfigure1000InstallP95MsExclusive: 1000,
} as const;

const percentile = (values: readonly number[], ratio: number) =>
  values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];

const summarize = (values: readonly number[]) => {
  const sorted = [...values].sort((left, right) => left - right);

  return {
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    p99: percentile(sorted, 0.99),
  };
};

const createGraph = (
  count: number,
  prefix: string,
  lifecycle?: { activations: number; cleanups: number }
) => {
  const plugins: PluginReference[] = [];

  for (let index = 0; index < count; index++) {
    const previous = plugins[index - 1];
    const branch = index > 2 ? plugins[Math.floor(index / 2)] : undefined;

    plugins.push(
      definePlugin(`${prefix}-${index}`, {
        ...(lifecycle
          ? {
              activate(context) {
                lifecycle.activations += 1;
                context.onCleanup(() => {
                  lifecycle.cleanups += 1;
                });
              },
            }
          : {}),
        dependencies: [
          ...(previous ? [previous] : []),
          ...(branch && branch !== previous ? [branch] : []),
        ],
      })
    );
  }

  return {
    plugins,
    root: getDefined(plugins.at(-1)),
  };
};

const rows = cohorts.map(
  ({ compileSamples, descriptors, reconfigureSamples }) => {
    const compileGraph = createGraph(descriptors, `compile-${descriptors}`);
    const compileMs: number[] = [];

    for (let index = 0; index < compileSamples; index++) {
      const startedAt = performance.now();
      const editor = createEditor({ plugins: [compileGraph.root] });

      compileMs.push(performance.now() - startedAt);
      if (getPluginRegistry(editor).pluginsByDescriptor.size !== descriptors) {
        throw new Error(
          `${descriptors}: transitive compile did not install every descriptor.`
        );
      }
    }

    const lifecycle = { activations: 0, cleanups: 0 };
    const reconfigureGraph = createGraph(
      descriptors,
      `reconfigure-${descriptors}`,
      lifecycle
    );
    const editor = createEditor();
    const installMs: number[] = [];
    const cleanupMs: number[] = [];
    let installedRegistryRecords = 0;
    let removedRegistryRecords = 0;

    for (let index = 0; index < reconfigureSamples; index++) {
      const installStartedAt = performance.now();
      const cleanup = editor.install(reconfigureGraph.root);

      installMs.push(performance.now() - installStartedAt);
      const installedRegistry = getPluginRegistry(editor);
      const installedRegistrySizes = {
        dependencyOrder: installedRegistry.dependencyOrder.length,
        plugins: installedRegistry.plugins.size,
        pluginsByDescriptor: installedRegistry.pluginsByDescriptor.size,
      };

      installedRegistryRecords = Math.max(
        installedRegistryRecords,
        ...Object.values(installedRegistrySizes)
      );
      if (
        Object.values(installedRegistrySizes).some(
          (size) => size !== descriptors
        )
      ) {
        throw new Error(
          `${descriptors}: installed registry indexes were ${JSON.stringify(installedRegistrySizes)}.`
        );
      }

      const cleanupStartedAt = performance.now();

      cleanup();
      cleanupMs.push(performance.now() - cleanupStartedAt);
      const removedRegistry = getPluginRegistry(editor);

      removedRegistryRecords = Math.max(
        removedRegistry.plugins.size,
        removedRegistry.pluginsByDescriptor.size,
        removedRegistry.dependencyOrder.length,
        removedRegistry.apiGroups.size,
        removedRegistry.contributions.size,
        removedRegistry.commands.byDescriptor.size,
        removedRegistry.commands.byId.size,
        removedRegistry.reads.byDescriptor.size,
        removedRegistry.reads.byId.size,
        removedRegistry.stateGroups.size,
        removedRegistry.txGroups.size
      );
      if (removedRegistryRecords !== 0) {
        throw new Error(
          `${descriptors}: cleanup retained ${removedRegistryRecords} registry records.`
        );
      }
    }

    const expectedLifecycleCalls = descriptors * reconfigureSamples;

    if (
      lifecycle.activations !== expectedLifecycleCalls ||
      lifecycle.cleanups !== expectedLifecycleCalls
    ) {
      throw new Error(
        `${descriptors}: lifecycle calls were ${lifecycle.activations}/${lifecycle.cleanups}, expected ${expectedLifecycleCalls}.`
      );
    }

    return {
      cleanupMs: summarize(cleanupMs),
      compileMs: summarize(compileMs),
      compileSamples,
      descriptors,
      installedRegistryRecords,
      lifecycle,
      reconfigureSamples,
      removedRegistryRecords,
      installMs: summarize(installMs),
    };
  }
);

const stress = getDefined(rows.at(-1));
const budgetRatios = {
  cleanup: stress.cleanupMs.p95 / budgets.reconfigure1000CleanupP95MsExclusive,
  compile: stress.compileMs.p95 / budgets.compile1000P95MsExclusive,
  install: stress.installMs.p95 / budgets.reconfigure1000InstallP95MsExclusive,
};
const worstBudgetRatio = Math.max(...Object.values(budgetRatios));

if (strict && worstBudgetRatio >= 1) {
  throw new Error(
    `Plugin graph worst p95 budget ratio ${worstBudgetRatio} must stay below 1.`
  );
}

const result = {
  benchmark: 'plite-plugin-graph',
  budgetRatios,
  budgets,
  cohorts: {
    large: '100 descriptor DAG',
    normal: '10 descriptor DAG',
    stress: '1,000 descriptor DAG',
  },
  degradationContract:
    'Configuration work may scale with installed descriptors; removed roots retain zero registry records.',
  generatedAt: new Date().toISOString(),
  interactionMatrix: [
    'cold transitive compile',
    'dynamic root install',
    'reverse cleanup',
    'activation and cleanup exactness',
    'post-removal registry retention',
  ],
  repeatedUnit:
    'one descriptor with one required predecessor and one branch edge',
  rows,
  rumEvidence: 'unavailable; plugin configuration is a local runtime lane',
  version: 1,
  worstBudgetRatio,
};
const output = `${JSON.stringify(result, null, 2)}\n`;

process.stdout.write(
  `METRIC plite_plugin_graph_worst_budget_ratio=${worstBudgetRatio}\n`
);
process.stdout.write(
  `METRIC plite_plugin_graph_removed_registry_records=${stress.removedRegistryRecords}\n`
);

if (outputArgument) {
  writeBenchmarkArtifact(outputArgument.slice('--output='.length), output);
} else {
  process.stdout.write(output);
}
