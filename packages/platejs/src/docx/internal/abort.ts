export const throwIfDocxAborted = (
  signal: AbortSignal | undefined,
  abortError: () => unknown = () => new DOMException('Aborted', 'AbortError')
) => {
  if (!signal?.aborted) return;
  if ('reason' in signal) throw signal.reason;

  throw abortError();
};
