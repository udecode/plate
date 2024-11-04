import { application } from '../internal/application';
import { audio } from '../internal/audio';
import { image } from '../internal/image';
import { misc } from '../internal/misc';
import { video } from '../internal/video';
import { text } from './text';

export const mimes = {
  ...application,
  ...audio,
  ...image,
  ...text,
  ...video,
  ...misc,
};

export type MimeType = keyof typeof mimes;

export type FileExtension = (typeof mimes)[MimeType]['extensions'][number];

export const ALLOWED_FILE_TYPES = [
  'image',
  'video',
  'audio',
  'pdf',
  'text',
  'blob',
] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];

export type FileRouterInputKey = AllowedFileType | MimeType;
