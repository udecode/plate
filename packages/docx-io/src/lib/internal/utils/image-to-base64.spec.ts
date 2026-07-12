import { imageToBase64 } from './image-to-base64';

describe('imageToBase64', () => {
  afterEach(() => {
    mock.restore();
  });

  it('rejects invalid urls before fetching', async () => {
    await expect(imageToBase64('javascript:alert(1)')).rejects.toThrow(
      'Invalid URL provided'
    );
  });

  it('throws when the fetch fails', async () => {
    spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(null, { status: 404, statusText: 'Not Found' })
    );

    await expect(
      imageToBase64('https://platejs.org/missing.png')
    ).rejects.toThrow('Failed to fetch image: Not Found');
  });

  it('converts fetched bytes to base64', async () => {
    spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(new Uint8Array([72, 105]))
    );

    await expect(imageToBase64('https://platejs.org/image.png')).resolves.toBe(
      'SGk='
    );
  });
});
