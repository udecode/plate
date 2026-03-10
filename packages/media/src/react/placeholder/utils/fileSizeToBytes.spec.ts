import { UploadErrorCode } from '../type';
import { bytesToFileSize, fileSizeToBytes } from './fileSizeToBytes';

describe('fileSizeToBytes', () => {
  const file = new File([], 'test.bin');

  const getErrorCode = (input: string) => {
    try {
      fileSizeToBytes(input as any, file);
    } catch (error: any) {
      return error.code;
    }
  };

  it.each([
    ['1B', 1],
    ['1024B', 1024],
    ['1KB', 1024],
    ['1MB', 1_048_576],
    ['1GB', 1_073_741_824],
    ['1kb', 1024],
    ['1 KB', 1024],
  ])('converts %s to %i bytes', (input, expected) => {
    expect(fileSizeToBytes(input as any, file)).toBe(expected);
  });

  it.each(['invalid', '-1KB'])('rejects %s with InvalidFileSize', (input) => {
    expect(getErrorCode(input)).toBe(UploadErrorCode.INVALID_FILE_SIZE);
  });
});

describe('bytesToFileSize', () => {
  it.each([
    [0, '0B'],
    [-1, '0B'],
    [500, '500.00B'],
    [1024, '1.02KB'],
    [1536, '1.54KB'],
    [1_048_576, '1.05MB'],
    [2_621_440, '2.62MB'],
    [1_073_741_824, '1.07GB'],
  ])('formats %i bytes as %s', (input, expected) => {
    expect(bytesToFileSize(input)).toBe(expected);
  });
});
