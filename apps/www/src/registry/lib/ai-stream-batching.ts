const DEFAULT_BATCH_WINDOW_IN_MS = 16;
const SLOW_BATCH_WINDOW_IN_MS = 32;
const SLOW_FLUSH_THRESHOLD_IN_MS = 24;

type AIStreamBatchTimer = ReturnType<typeof setTimeout>;
type AIStreamBatchFlushOptions = {
  force?: boolean;
};

export type AIStreamBatcher = ReturnType<typeof createAIStreamBatcher>;

export function shouldFlushAIStreamChunkImmediately(chunk: string) {
  return chunk.includes('\n') || chunk.includes('```') || chunk.includes('|');
}

export function createAIStreamBatcher({
  applyChunk,
  cancel = clearTimeout,
  getNow = () => performance.now(),
  schedule = setTimeout,
}: {
  applyChunk: (chunk: string, options?: AIStreamBatchFlushOptions) => void;
  cancel?: (timer: AIStreamBatchTimer) => void;
  getNow?: () => number;
  schedule?: (callback: () => void, delayInMs: number) => AIStreamBatchTimer;
}) {
  let batchWindowInMs = DEFAULT_BATCH_WINDOW_IN_MS;
  let pendingChunk = '';
  let timer: AIStreamBatchTimer | null = null;

  const clearTimer = () => {
    if (timer) {
      cancel(timer);
      timer = null;
    }
  };

  const flush = (options?: AIStreamBatchFlushOptions) => {
    if (!pendingChunk) return false;

    const chunk = pendingChunk;

    pendingChunk = '';
    clearTimer();

    const startedAt = getNow();

    applyChunk(chunk, options);

    batchWindowInMs =
      getNow() - startedAt > SLOW_FLUSH_THRESHOLD_IN_MS
        ? SLOW_BATCH_WINDOW_IN_MS
        : DEFAULT_BATCH_WINDOW_IN_MS;

    return true;
  };

  const queue = ({ chunk, isFirst }: { chunk: string; isFirst: boolean }) => {
    if (!chunk) return;

    if (isFirst) {
      reset();
      pendingChunk = chunk;
      flush();

      return;
    }

    pendingChunk += chunk;

    if (shouldFlushAIStreamChunkImmediately(chunk)) {
      flush();

      return;
    }

    if (!timer) {
      timer = schedule(() => {
        timer = null;
        flush();
      }, batchWindowInMs);
    }
  };

  const reset = () => {
    pendingChunk = '';
    batchWindowInMs = DEFAULT_BATCH_WINDOW_IN_MS;
    clearTimer();
  };

  return {
    flush,
    getBatchWindowInMs: () => batchWindowInMs,
    getPendingChunk: () => pendingChunk,
    queue,
    reset,
  };
}
