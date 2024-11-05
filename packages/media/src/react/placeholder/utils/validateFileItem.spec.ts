/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-conditional-expect */
import { type MediaItemConfig, UploadErrorCode } from '../type';
import { validateFileItem } from './validateFileItem';

describe('validateFileItem', () => {
  const createFile = (name: string, size = 0): File => {
    const file = new File([''], name, { type: '' });
    Object.defineProperty(file, 'size', { value: size });

    return file;
  };

  it('should validate files within constraints', () => {
    const files = [createFile('test.jpg', 500)];
    const config: MediaItemConfig = {
      maxFileSize: '1KB',
      mediaType: 'img',
    };

    expect(validateFileItem(files, config, 'image')).toBe(true);
  });

  it('should throw MaxFileCountExceeded when files exceed maximum', () => {
    const files = [
      createFile('test1.jpg', 500),
      createFile('test2.jpg', 500),
      createFile('test3.jpg', 500),
    ];
    const config: MediaItemConfig = {
      maxFileCount: 2,
      maxFileSize: '1KB',
      mediaType: 'img',
    };

    expect(() => {
      try {
        validateFileItem(files, config, 'image');
      } catch (error: any) {
        expect(error.code).toBe(UploadErrorCode.TOO_MANY_FILES);
      }
    });
  });

  it('should throw MaxFileSizeExceeded when any file exceeds size limit', () => {
    const files = [createFile('test.jpg', 2048)];
    const config: MediaItemConfig = {
      maxFileSize: '1KB',
      mediaType: 'img',
    };

    expect(() => {
      try {
        validateFileItem(files, config, 'image');
      } catch (error: any) {
        expect(error.code).toBe(UploadErrorCode.TOO_LARGE);
      }
    });
  });

  it('should use default values for min and max file count', () => {
    const files = [createFile('test.jpg', 500)];
    const config: MediaItemConfig = {
      maxFileSize: '1KB',
      mediaType: 'img',
    };

    expect(validateFileItem(files, config, 'image')).toBe(true);
  });
});
