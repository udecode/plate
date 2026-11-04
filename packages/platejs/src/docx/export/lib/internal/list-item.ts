import type { ListElement } from '../../../../features/list';

export type DocxListItem = Readonly<{
  level: number;
  levels?: ListElement['listLevels'];
  list: Readonly<{ id: string; root: string; story: string }>;
  marker:
    | Readonly<{ kind: 'bulleted'; style: string }>
    | Readonly<{
        kind: 'numbered';
        number: number;
        restart: boolean;
        style: string;
      }>
    | Readonly<{ kind: 'task'; checked: boolean }>;
}>;

export const listTextIndent = (level: number) => level * 360 + 360;

export const writeListItem = ({
  level,
  levels,
  list,
  marker,
}: DocxListItem) => ({
  'data-docx-list': marker.kind,
  'data-docx-list-id': list.id,
  'data-docx-list-level': String(level),
  'data-docx-list-root': list.root,
  'data-docx-list-story': list.story,
  ...(levels === undefined
    ? {}
    : { 'data-docx-list-levels': JSON.stringify(levels) }),
  ...(marker.kind === 'task'
    ? marker.checked
      ? { 'data-docx-list-checked': '' }
      : {}
    : { 'data-docx-list-style': marker.style }),
  ...(marker.kind === 'numbered'
    ? {
        'data-docx-list-number': String(marker.number),
        ...(marker.restart ? { 'data-docx-list-restart': '' } : {}),
      }
    : {}),
});

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  '&#39;': "'",
  '&#x27;': "'",
  '&amp;': '&',
  '&gt;': '>',
  '&lt;': '<',
  '&quot;': '"',
};

const malformed = (name: string): never => {
  throw new Error(`A listed block's Word list record has a malformed ${name}.`);
};

type RecordAttributes =
  | Readonly<Record<string, string | undefined>>
  | undefined;

export const isListedBlock = (attributes: RecordAttributes) =>
  attributes?.['data-docx-list'] !== undefined;

export const readListItem = (
  attributes: RecordAttributes
): DocxListItem | undefined => {
  const kind = attributes?.['data-docx-list'];

  if (kind === undefined) return undefined;

  // html-to-vdom keeps attribute values entity-encoded.
  const read = (name: string) =>
    attributes?.[`data-docx-list-${name}`]?.replaceAll(
      /&(?:#39|#x27|amp|gt|lt|quot);/g,
      (entity) => HTML_ENTITIES[entity]
    );
  const text = (name: string) => read(name) ?? malformed(name);
  const count = (name: string, least: number) => {
    const value = Number(text(name));

    return Number.isInteger(value) && value >= least ? value : malformed(name);
  };
  const levels = read('levels');
  const list = { id: text('id'), root: text('root'), story: text('story') };
  const level = count('level', 0);

  const parseLevels = () => {
    try {
      return JSON.parse(levels ?? 'null') ?? undefined;
    } catch {
      return malformed('levels');
    }
  };

  switch (kind) {
    case 'bulleted': {
      return {
        level,
        levels: parseLevels(),
        list,
        marker: { kind, style: text('style') },
      };
    }
    case 'numbered': {
      return {
        level,
        levels: parseLevels(),
        list,
        marker: {
          kind,
          number: count('number', -Infinity),
          restart: read('restart') !== undefined,
          style: text('style'),
        },
      };
    }
    case 'task': {
      return {
        level,
        levels: parseLevels(),
        list,
        marker: { checked: read('checked') !== undefined, kind },
      };
    }
    default: {
      return malformed('kind');
    }
  }
};
