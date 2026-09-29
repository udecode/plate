export type DocxRelationship = Readonly<{
  external: boolean;
  id: string;
  target: string;
  targetPart: string | null;
  type: string;
}>;

export type DocxContentTypeIndex = Readonly<{
  defaults: ReadonlyMap<string, string>;
  document: Document;
  overrides: ReadonlyMap<string, string>;
}>;

export const parseXml = (source: string) => {
  const document = new DOMParser().parseFromString(source, 'application/xml');

  if (document.querySelector('parsererror')) {
    throw new Error('DOCX package contains malformed XML.');
  }

  return document;
};

export const decodeXml = (source: Uint8Array) =>
  new TextDecoder().decode(source);

export const elements = (document: Document | Element) =>
  Array.from(document.getElementsByTagName('*'));

export const relationshipPartFor = (part: string) => {
  if (part === '') return '_rels/.rels';
  const separator = part.lastIndexOf('/');
  const directory = separator === -1 ? '' : part.slice(0, separator + 1);
  const filename = part.slice(separator + 1);

  return `${directory}_rels/${filename}.rels`;
};

const resolveTarget = (owner: string, target: string): string | null => {
  if (
    target.includes('\\') ||
    /%(?:00|2f|5c)/i.test(target) ||
    target.includes('?') ||
    target.includes('#')
  ) {
    return null;
  }
  let decoded: string;

  try {
    decoded = decodeURIComponent(target);
  } catch {
    return null;
  }
  const path = decoded.startsWith('/') ? [] : owner.split('/').slice(0, -1);

  for (const segment of decoded.replace(/^\/+/, '').split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (path.length === 0) return null;
      path.pop();
    } else {
      path.push(segment);
    }
  }

  return path.length > 0 ? path.join('/') : null;
};

/** Read the relationships a part owns; the package root is the empty part. */
export const readRelationships = (
  entries: ReadonlyMap<string, Uint8Array>,
  owner: string
): readonly DocxRelationship[] => {
  const source = entries.get(relationshipPartFor(owner));

  if (!source) return Object.freeze([]);
  const document = parseXml(decodeXml(source));

  return Object.freeze(
    elements(document)
      .filter((element) => element.localName === 'Relationship')
      .map((element) => {
        const target = element.getAttribute('Target') ?? '';
        const external =
          element.getAttribute('TargetMode')?.toLowerCase() === 'external';

        return Object.freeze({
          external,
          id: element.getAttribute('Id') ?? '',
          target,
          targetPart: external ? null : resolveTarget(owner, target),
          type: element.getAttribute('Type') ?? '',
        });
      })
  );
};

export const readContentTypes = (source: Uint8Array): DocxContentTypeIndex => {
  const document = parseXml(decodeXml(source));
  const defaults = new Map<string, string>();
  const overrides = new Map<string, string>();

  for (const element of elements(document)) {
    const contentType = element.getAttribute('ContentType');

    if (!contentType) continue;
    if (element.localName === 'Default') {
      const extension = element.getAttribute('Extension');

      if (extension) defaults.set(extension.toLowerCase(), contentType);
    } else if (element.localName === 'Override') {
      const part = element.getAttribute('PartName')?.replace(/^\//, '');

      if (part) overrides.set(part, contentType);
    }
  }

  return Object.freeze({ defaults, document, overrides });
};

export const contentTypeFor = (index: DocxContentTypeIndex, part: string) => {
  const override = index.overrides.get(part);

  if (override) return override;
  const extension = part.includes('.') ? part.split('.').at(-1) : undefined;

  return extension ? index.defaults.get(extension.toLowerCase()) : undefined;
};
