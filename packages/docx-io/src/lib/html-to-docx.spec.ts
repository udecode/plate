import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

const addFilesToContainerMock = mock();
const generateAsyncMock = mock();

class JSZipMock {}

mock.module('jszip', () => ({
  default: JSZipMock,
}));

mock.module('./internal/html-to-docx', () => ({
  default: addFilesToContainerMock,
}));

const loadModule = async () =>
  import(`./html-to-docx?test=${Math.random().toString(36).slice(2)}`);

describe('htmlToDocxBlob', () => {
  afterEach(() => {
    addFilesToContainerMock.mockReset();
    generateAsyncMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('normalizes empty html before delegating to the container builder', async () => {
    const { htmlToDocxBlob } = await loadModule();

    generateAsyncMock.mockImplementation(async () => new Uint8Array([1, 2, 3]));
    addFilesToContainerMock.mockImplementation(async () => ({
      generateAsync: generateAsyncMock,
    }));

    const blob = await htmlToDocxBlob('   ', {
      orientation: 'landscape',
    } as any);

    expect(addFilesToContainerMock).toHaveBeenCalledWith(
      expect.any(JSZipMock),
      '<p></p>',
      { orientation: 'landscape' },
      null
    );
    expect(generateAsyncMock).toHaveBeenCalledWith({ type: 'uint8array' });
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  });
});
