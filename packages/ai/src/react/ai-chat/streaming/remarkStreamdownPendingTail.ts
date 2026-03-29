export function remarkStreamdownPendingTail(this: {
  data(key: 'settings'): Record<string, unknown> | undefined;
  data(key: 'settings', value: Record<string, unknown>): void;
}) {
  const settings = this.data('settings') ?? {};
  const streamdown =
    settings.streamdown &&
    typeof settings.streamdown === 'object' &&
    !Array.isArray(settings.streamdown)
      ? (settings.streamdown as Record<string, unknown>)
      : {};

  this.data('settings', {
    ...settings,
    streamdown: {
      ...streamdown,
      preservePendingTail: true,
    },
  });
}
