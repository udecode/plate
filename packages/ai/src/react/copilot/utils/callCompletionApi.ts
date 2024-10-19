// use function to allow for mocking in tests:
const getOriginalFetch = () => fetch;

export type CallCompletionApiOptions = {
  prompt: string;
  api?: string;
  body?: Record<string, any>;
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

    const { text } = await res.json();

    if (!text) {
      throw new Error('The response does not contain a text field.');
    }

    setCompletion(text);

    if (onFinish) {
      onFinish(prompt, text);
    }

    setAbortController(null);

    return text as string;
  } catch (error) {
    // Ignore abort errors as they are expected.
    if ((error as any).name === 'AbortError') {
      setAbortController(null);

      return null;
    }
    if (error instanceof Error && onError) {
      onError(error);
    }

    setError(error as Error);
  } finally {
    setLoading(false);
  }
}
