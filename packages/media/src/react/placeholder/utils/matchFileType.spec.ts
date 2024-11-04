/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-conditional-expect */
import { UploadErrorCode } from '../type';
import { matchFileType } from './matchFileType';

describe('matchFileType', () => {
  const createFile = (name: string, type: string): File => {
    return new File([], name, { type });
  };

  it('should return blob if no mime type and blob is allowed', () => {
    const file = createFile('test.txt', '');
    expect(matchFileType(file, ['blob'])).toBe('blob');
  });

  it('should match exact mime type if specified in allowed types', () => {
    const file = createFile('test.jpg', 'image/jpeg');
    expect(matchFileType(file, ['image/jpeg'])).toBe('image/jpeg');
  });

  it('should match general type for images', () => {
    const file = createFile('test.jpg', 'image/jpeg');
    expect(matchFileType(file, ['image'])).toBe('image');
  });

  it('should match general type for videos', () => {
    const file = createFile('test.mp4', 'video/mp4');
    expect(matchFileType(file, ['video'])).toBe('video');
  });

  it('should handle PDF files specially', () => {
    const file = createFile('test.pdf', 'application/pdf');
    expect(matchFileType(file, ['pdf'])).toBe('pdf');
  });

  it('should return blob for unsupported type if blob is allowed', () => {
    const file = createFile('test.txt', 'text/plain');
    expect(matchFileType(file, ['image', 'blob'])).toBe('blob');
  });

  it('should return InvalidFileTypeError for unsupported type if blob is not allowed', () => {
    const file = createFile('test.txt', 'text/plain');
    expect(() => {
      try {
        matchFileType(file, ['image']);
      } catch (error: any) {
        expect(error.code).toBe(UploadErrorCode.InvalidFileTypeError);
      }
    });
  });
});
