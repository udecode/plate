import { imageToBase64 } from './image-to-base64';

describe('imageToBase64', () => {
  let fetchSpy: ReturnType<typeof spyOn> | undefined;

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  it('rejects invalid urls before fetching', async () => {
    await expect(imageToBase64('javascript:alert(1)')).rejects.toThrow(
      'Invalid URL provided'
    );
  });

  it('throws when the fetch fails', async () => {
    const mockFetch = (async () =>
      ({
        ok: false,
        statusText: 'Not Found',
      }) as any) as unknown as typeof fetch;

    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(mockFetch);

    await expect(
      imageToBase64('https://platejs.org/missing.png')
    ).rejects.toThrow('Failed to fetch image: Not Found');
  });

  it('converts fetched bytes to base64', async () => {
    const mockFetch = (async () =>
      ({
        arrayBuffer: async () => new Uint8Array([72, 105]).buffer,
        ok: true,
      }) as any) as unknown as typeof fetch;

    fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(mockFetch);

    await expect(imageToBase64('https://platejs.org/image.png')).resolves.toBe(
      'SGk='
    );
  });
});
