import { type FileExtension, type MimeType, mimes } from './mimes';

/** Lookup the MIME type for a file path/extension. */
export function lookup(path: string): MimeType | false {
  if (!path || typeof path !== 'string') {
    return false;
  }

  // get the extension ("ext" or ".ext" or full path)
  const extension = extname('x.' + path)
    .toLowerCase()
    .slice(1) as FileExtension;

  if (!extension) {
    return false;
  }

  return getTypes()[extension] || false;
}

const extensions = {} as Record<MimeType, FileExtension[]>;
const types = {} as Record<FileExtension, MimeType>;

export function getTypes(): Record<FileExtension, MimeType> {
  populateMaps(extensions, types);

  return types;
}

export const mimeTypes = mimes as unknown as Record<
  MimeType,
  { extensions: FileExtension[]; source: string }
>;

let inittedMaps = false;
/**
 * Populate the extensions and types maps.
 *
 * @private
 */

function populateMaps(
  extensions: Record<MimeType, FileExtension[]>,
  types: Record<FileExtension, MimeType>
) {
  if (inittedMaps) return;

  inittedMaps = true;
  // source preference (least -> most)
  const preference = ['nginx', 'apache', undefined, 'iana'];

  (Object.keys(mimeTypes) as MimeType[]).forEach((type) => {
    const mime = mimeTypes[type];
    const exts = mime.extensions;

    if (!exts?.length) {
      return;
    }

    // mime -> extensions
    extensions[type] = exts;

    // extension -> mime

    for (const extension of exts) {
      if (types[extension]) {
        const from = preference.indexOf(mimeTypes[types[extension]].source);
        const to = preference.indexOf(mime.source);

        if (
          types[extension] !== 'application/octet-stream' &&
          (from > to ||
            (from === to && types[extension].startsWith('application/')))
        ) {
          // skip the remapping
          continue;
        }
      }

      // set the extension -> mime
      types[extension] = type;
    }
  });
}

function extname(path: string) {
  const index = path.lastIndexOf('.');

  return index < 0 ? '' : path.slice(Math.max(0, index));
}
