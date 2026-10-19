import type {
  PluginContribution,
  PluginContributionInput,
  PluginPoint,
} from '../interfaces/editor';

// Points are created while modules load, so this module imports nothing that
// can import it back.
const PLUGIN_CONTRIBUTION_VALUES = new WeakMap<object, unknown>();

/** Define a typed plugin point for ordered cross-plugin contributions. */
export const definePluginPoint = <TValue>(id: string): PluginPoint<TValue> => {
  if (!id) {
    throw new Error('Editor plugin point id cannot be empty.');
  }

  const point = Object.freeze({
    id,
    of(value: TValue) {
      const contribution = Object.freeze({
        point,
      }) as PluginContribution<TValue>;

      PLUGIN_CONTRIBUTION_VALUES.set(contribution, value);

      return contribution;
    },
  });

  return point;
};

export const getPluginContributionValue = (
  contribution: PluginContributionInput<any>
) => {
  if (!PLUGIN_CONTRIBUTION_VALUES.has(contribution)) {
    throw new Error(
      `Editor plugin contribution "${contribution.point.id}" was not created by its point.`
    );
  }

  return PLUGIN_CONTRIBUTION_VALUES.get(contribution);
};
