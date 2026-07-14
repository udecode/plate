// use function to allow for mocking in tests:
const getOriginalFetch = () => fetch;

export type CallCompletionApiOptions = {
  prompt: string;
  api?: string;
  body?: Record<string, unknown>;
  credentials?: RequestCredentials | undefined;
  fetch?: ReturnType<typeof getOriginalFetch> | undefined;
  headers?: HeadersInit | undefined;
  setAbortController?: (abortController: AbortController | null) => void;
  setCompletion?: (completion: string) => void;
  setError?: (error: Error | null) => void;
  setLoading?: (loading: boolean) => void;
  onError?: ((error: Error) => void) | undefined;
  onFinish?: ((prompt: string, completion: string) => void) | undefined;
  onResponse?: ((response: Response) => Promise<void> | void) | undefined;
};

export type CompleteOptions = Omit<
  CallCompletionApiOptions,
  'setAbortController' | 'setCompletion' | 'setError' | 'setLoading'
>;

// https://github.com/vercel/ai/blob/main/packages/ui-utils/src/call-completion-api.ts
// https://github.com/vercel/ai/blob/642ba22ee33723f3aae9669c7e075322cffca2f3/packages/react/src/use-completion.ts
export async function callCompletionApi({
  api = '/api/completion',
  body,
  credentials,
  fetch = getOriginalFetch(),
  headers,
  prompt,
  setAbortController = () => {},
  setCompletion = () => {},
  setError = () => {},
  setLoading = () => {},
  onError,
  onFinish,
  onResponse,
}: CallCompletionApiOptions) {
  try {
    setLoading(true);
    setError(null);

    const abortController = new AbortController();
    setAbortController(abortController);

    // Empty the completion immediately.
    setCompletion('');

    const res = await fetch(api, {
      body: JSON.stringify({
        prompt,
        ...body,
      }),
      credentials,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      method: 'POST',
      signal: abortController.signal,
    }).catch((error) => {
      throw error;
    });

    if (onResponse) {
      await onResponse(res);
    }
    if (!res.ok) {
      throw new Error(
        (await res.text()) || 'Failed to fetch the chat response.'
      );
    }
    if (!res.body) {
      throw new Error('The response body is empty.');
    }

    let text = '';

    if (res.headers.get('content-type')?.includes('application/json')) {
      const payload: unknown = await res.json();

      if (
        typeof payload === 'object' &&
        payload !== null &&
        'text' in payload &&
        typeof payload.text === 'string'
      ) {
        text = payload.text;
        setCompletion(text);
      }
    } else {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        text += decoder.decode(value, { stream: true });
        setCompletion(text);
      }

      const tail = decoder.decode();

      if (tail) {
        text += tail;
        setCompletion(text);
      }
    }

    if (!text) {
      throw new Error('The response does not contain completion text.');
    }

    if (onFinish) {
      onFinish(prompt, text);
    }

    setAbortController(null);

    return text;
  } catch (error) {
    // Ignore abort errors as they are expected.
    if (error instanceof Error && error.name === 'AbortError') {
      setAbortController(null);

      return null;
    }
    if (error instanceof Error && onError) {
      onError(error);
    }

    setError(error instanceof Error ? error : new Error(String(error)));
  } finally {
    setLoading(false);
  }
}
