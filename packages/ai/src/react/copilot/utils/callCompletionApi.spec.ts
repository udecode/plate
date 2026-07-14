describe('callCompletionApi', () => {
  it('returns completion text and updates loading, completion, and abort controller state', async () => {
    const { callCompletionApi } = await import(
      `./callCompletionApi?test=${Math.random().toString(36).slice(2)}`
    );
    const setAbortController = mock();
    const setCompletion = mock();
    const setError = mock();
    const setLoading = mock();
    const onFinish = mock();
    const onResponse = mock();

    const fetchMock = mock(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(JSON.stringify({ text: 'done' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
    ) as unknown as typeof fetch;

    await expect(
      callCompletionApi({
        fetch: fetchMock,
        onFinish,
        onResponse,
        prompt: 'hi',
        setAbortController,
        setCompletion,
        setError,
        setLoading,
      })
    ).resolves.toBe('done');

    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setCompletion).toHaveBeenCalledWith('');
    expect(onResponse).toHaveBeenCalled();
    expect(setCompletion).toHaveBeenCalledWith('done');
    expect(onFinish).toHaveBeenCalledWith('hi', 'done');
    expect(setAbortController).toHaveBeenLastCalledWith(null);
    expect(setLoading).toHaveBeenLastCalledWith(false);
    expect(setError).toHaveBeenCalledWith(null);
  });

  it('streams text responses into the completion state', async () => {
    const { callCompletionApi } = await import(
      `./callCompletionApi?test=${Math.random().toString(36).slice(2)}`
    );
    const setCompletion = mock();
    const encoder = new TextEncoder();
    const fetchMock = mock(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode('hel'));
              controller.enqueue(encoder.encode('lo'));
              controller.close();
            },
          }),
          {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            status: 200,
          }
        )
    ) as unknown as typeof fetch;

    await expect(
      callCompletionApi({
        fetch: fetchMock,
        prompt: 'hi',
        setCompletion,
      })
    ).resolves.toBe('hello');

    expect(setCompletion).toHaveBeenNthCalledWith(1, '');
    expect(setCompletion).toHaveBeenNthCalledWith(2, 'hel');
    expect(setCompletion).toHaveBeenNthCalledWith(3, 'hello');
  });
});
