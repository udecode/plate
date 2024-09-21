export const styles = [
  {
    label: 'Default',
    name: 'default',
  },
] as const;

export type Style = (typeof styles)[number];
