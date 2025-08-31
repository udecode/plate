import React from 'react';

interface AIReviewComment {
  blockId: string;
  comment: string;
  content: string;
}

interface AIReviewObject {
  comments?: AIReviewComment[];
}

type StreamStatus = 'error' | 'idle' | 'streaming' | 'success';

interface UseStreamObjectOptions {
  api?: string;
  onError?: (error: Error) => void;
  onFinish?: (object: AIReviewObject) => void;
  onNewComment?: (comment: AIReviewComment) => void;
  onStream?: (comment: AIReviewComment) => void;
}

export interface UseStreamObjectReturn {
  /** Stream an object with the given prompt and system */
  streamObject: (prompt: string, system: string) => Promise<void>;
  /** The current streamed object */
  object: AIReviewObject | undefined;
  /** The current status of the stream */
  status: StreamStatus;
  /** The error if status is 'error' */
  error: Error | undefined;
  /** Stop the current stream */
  stop: () => void;
  /** Reset the state */
  reset: () => void;
  /** Array of comments that have been fully streamed */
  comments: AIReviewComment[];
}

export function useStreamObject(
  options: UseStreamObjectOptions = {}
): UseStreamObjectReturn {
  const { api = '/api/ai/review', onError, onFinish, onNewComment } = options;

  const [object, setObject] = React.useState<AIReviewObject | undefined>(
    undefined
  );
  const [status, setStatus] = React.useState<StreamStatus>('idle');
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [comments, setComments] = React.useState<AIReviewComment[]>([]);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const lastContentRef = React.useRef<string | null>(null);

  const reset = React.useCallback(() => {
    setObject(undefined);
    setError(undefined);
    setStatus('idle');
    setComments([]);
    lastContentRef.current = null;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const stop = React.useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus('idle');
  }, []);

  // Track latest comments during streaming
  React.useEffect(() => {
    let latestFinishedComment: AIReviewComment | null = null;

    if (object?.comments && object.comments.length > 0) {
      if (status === 'streaming') {
        // During streaming, the last item is incomplete, so get the second-to-last
        if (object.comments.length >= 2) {
          latestFinishedComment = object.comments.at(-2) ?? null;
        }
      } else if (status === 'success') {
        // When finished, the last item is complete
        latestFinishedComment = object.comments.at(-1) ?? null;
      }
    }

    // Check if we have a new comment (not seen before)
    if (
      latestFinishedComment &&
      latestFinishedComment.content !== lastContentRef.current
    ) {
      lastContentRef.current = latestFinishedComment.content;
      setComments((prev) => [...prev, latestFinishedComment]);
      onNewComment?.(latestFinishedComment);
    }
  }, [object, status, onNewComment]);

  const streamObject = React.useCallback(
    async (prompt: string, system: string) => {
      try {
        // Reset state
        setObject(undefined);
        setError(undefined);
        setStatus('streaming');
        setComments([]);
        lastContentRef.current = null;

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        const response = await fetch(api, {
          body: JSON.stringify({ prompt, system }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let currentObject: AIReviewObject = {};

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Flush remaining buffer
            if (buffer.trim()) {
              for (const line of buffer.split('\n')) {
                if (line.trim()) {
                  try {
                    const event = JSON.parse(line);
                    if (event.type === 'finish' && event.object) {
                      currentObject = event.object;
                      setObject(currentObject);
                    }
                  } catch (error_) {
                    console.error('Failed to parse event:', error_);
                  }
                }
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const event = JSON.parse(line);

              if (event.type === 'object' && event.object) {
                currentObject = event.object;
                setObject(currentObject);
              }

              if (event.type === 'finish' && event.object) {
                currentObject = event.object;
                setObject(currentObject);
              }
            } catch (error_) {
              console.error('Failed to parse event:', error_);
            }
          }
        }

        setStatus('success');
        onFinish?.(currentObject);
      } catch (error_) {
        // Ignore abort errors
        if (error_ instanceof Error && error_.name === 'AbortError') {
          setStatus('idle');
          return;
        }

        const error =
          error_ instanceof Error ? error_ : new Error('Unknown error');
        setError(error);
        setStatus('error');
        onError?.(error);
      }
    },
    [api, onFinish, onError]
  );

  return {
    comments,
    error,
    object,
    reset,
    status,
    stop,
    streamObject,
  };
}
