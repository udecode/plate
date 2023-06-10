export type SettingBadge = {
  label: string;
};
export const SettingBadges = {
  element: {
    label: 'Element',
    tooltip: '',
  },
  inline: {
    label: 'Inline',
  },
  void: {
    label: 'Void',
  },
  leaf: {
    label: 'Leaf',
  },
  style: {
    label: 'Style',
  },
  normalizer: {
    label: 'Normalizer',
  },
  handler: {
    label: 'Handler',
  },
  ui: {
    label: 'UI',
  },
};

export type SettingValue = keyof typeof SettingValues;

export const SettingValues = {
  playground: 'playground',
};
