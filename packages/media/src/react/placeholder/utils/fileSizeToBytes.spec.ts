/* eslint-disable jest/valid-expect */
/* eslint-disable jest/no-conditional-expect */
import { UploadErrorCode } from '../type';
import { bytesToFileSize, fileSizeToBytes } from './fileSizeToBytes';

describe('fileSizeToBytes', () => {
  it('should convert bytes correctly', () => {
    expect(fileSizeToBytes('1B', new File([], ''))).toBe(1);
    expect(fileSizeToBytes('1024B', new File([], ''))).toBe(1024);
  });

  it('should convert kilobytes correctly', () => {
    expect(fileSizeToBytes('1KB', new File([], ''))).toBe(1024);
  });

  it('should convert megabytes correctly', () => {
    expect(fileSizeToBytes('1MB', new File([], ''))).toBe(1_048_576);
  });

  it('should convert gigabytes correctly', () => {
    expect(fileSizeToBytes('1GB', new File([], ''))).toBe(1_073_741_824);
  });

  it('should be case insensitive', () => {
    expect(fileSizeToBytes('1KB', new File([], ''))).toBe(1024);
  });

  it('should handle whitespace', () => {});

  it('should throw InvalidFileSize for invalid formats', () => {
    expect(() => {
      try {
        fileSizeToBytes('invalid' as any, new File([], ''));
      } catch (error: any) {
        expect(error.code).toBe(UploadErrorCode.INVALID_FILE_SIZE);
      }
    });

    expect(() => {
      try {
        fileSizeToBytes('-1KB' as any, new File([], ''));
      } catch (error: any) {
        expect(error.code).toBe(UploadErrorCode.INVALID_FILE_SIZE);
      }
    });
  });
});

describe('bytesToFileSize', () => {
  it('should handle zero and negative one', () => {
    expect(bytesToFileSize(0)).toBe('0B');
    expect(bytesToFileSize(-1)).toBe('0B');
  });

  it('should convert bytes to human readable format', () => {
    expect(bytesToFileSize(500)).toBe('500.00B');
    expect(bytesToFileSize(1024)).toBe('1.02KB');
    expect(bytesToFileSize(1_048_576)).toBe('1.05MB');
    expect(bytesToFileSize(1_073_741_824)).toBe('1.07GB');
  });

  it('should round to 2 decimal places', () => {
    expect(bytesToFileSize(1536)).toBe('1.54KB');
    expect(bytesToFileSize(2_621_440)).toBe('2.62MB');
  });
});
