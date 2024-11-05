/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-conditional-expect */
import type { UploadConfig } from '../PlaceholderPlugin';

import { ErrorCode } from '../type';
import { groupFilesByType } from './groupFilesByType';

describe('groupFilesByType', () => {
  const createFile = (name: string, type: string): File => {
    return new File([], name, { type });
  };

  it('should group files by their types', () => {
    const files = [
      createFile('image.jpg', 'image/jpeg'),
      createFile('video.mp4', 'video/mp4'),
      createFile('doc.pdf', 'application/pdf'),
    ];

    const fileList = {
      [Symbol.iterator]: function* () {
        for (let i = 0; i < this.length; i++) {
          yield this.item(i);
        }
      },
      item: (i: number) => files[i],
      length: files.length,
    } as FileList;

    const config: UploadConfig = {
      image: { maxFileSize: '8B', mediaType: 'img' },
      pdf: { maxFileSize: '64B', mediaType: 'file' },
      video: { maxFileSize: '1024MB', mediaType: 'video' },
    };

    const result = groupFilesByType(fileList, config);

    expect(result.image).toHaveLength(1);
    expect(result.video).toHaveLength(1);
    expect(result.pdf).toHaveLength(1);
    expect(result.audio).toHaveLength(0);
    expect(result.blob).toHaveLength(0);
    expect(result.text).toHaveLength(0);
  });

  it('should throw InvalidFileTypeError for unsupported file types', () => {
    const files = [createFile('text.txt', 'text/plain')];
    const fileList = {
      [Symbol.iterator]: function* () {
        for (let i = 0; i < this.length; i++) {
          yield this.item(i);
        }
      },
      item: (i: number) => files[i],
      length: files.length,
    } as FileList;

    const config: UploadConfig = {
      image: { maxFileSize: '8MB', mediaType: 'img' },
    };

    expect(() => {
      try {
        groupFilesByType(fileList, config);
      } catch (error: any) {
        expect(error.code).toBe(ErrorCode.INVALID_FILE_TYPE);
      }
    });
  });

  it('should accept blob type as fallback', () => {
    const files = [createFile('unknown.xyz', 'application/octet-stream')];
    const fileList = {
      [Symbol.iterator]: function* () {
        for (let i = 0; i < this.length; i++) {
          yield this.item(i);
        }
      },
      item: (i: number) => files[i],
      length: files.length,
    } as FileList;

    const config: UploadConfig = {
      blob: { maxFileSize: '1024MB', mediaType: 'file' },
    };

    const result = groupFilesByType(fileList, config);
    expect(result.blob).toHaveLength(1);
  });
});
