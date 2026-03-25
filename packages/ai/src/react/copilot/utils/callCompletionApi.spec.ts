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
      async () =>
        new Response(JSON.stringify({ text: 'done' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        })
    );

    await expect(
      callCompletionApi({
        fetch: fetchMock as any,
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
});
