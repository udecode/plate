import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  formatIconPlaceholder,
  ICON_PLACEHOLDER_ELEMENT,
  ICON_PLACEHOLDER_IMPORT,
  ICON_PLACEHOLDER_LIBRARIES,
  type IconLibrary,
  LUCIDE_PACKAGE,
  servesIconPlaceholders,
} from '../src/lib/registry-icon-placeholder.ts';
import type { RegistryPayload } from '../src/lib/registry-payload.ts';
import { getIconNames } from './icon-names.mts';
import {
  collectLucideUses,
  getIconProblems,
  type SourceRange,
} from './lucide-icons.mts';

const HUGEICONS_COMPONENT = 'HugeiconsIcon';

const ICON_PLACEHOLDER_REGEX = new RegExp(
  `<${ICON_PLACEHOLDER_ELEMENT}\\s+${ICON_PLACEHOLDER_LIBRARIES.map(
    (library) => `${library}="([^"]+)"`
  ).join(String.raw`\s+`)}`,
  'g'
);

export function readIconPlaceholders(source: string, filePath: string) {
  const placeholders = [...source.matchAll(ICON_PLACEHOLDER_REGEX)].map(
    ([, lucide, tabler, hugeicons, phosphor, remixicon]) => ({
      hugeicons,
      lucide,
      phosphor,
      remixicon,
      tabler,
    })
  );

  if (
    placeholders.length !==
    source.split(`<${ICON_PLACEHOLDER_ELEMENT}`).length - 1
  ) {
    throw new Error(
      `${filePath}: an ${ICON_PLACEHOLDER_ELEMENT} does not open with its five icon names`
    );
  }

  return placeholders;
}

function toIconPlaceholders(source: string, filePath: string) {
  const uses = collectLucideUses(source, filePath);
  const { elements, importRanges, otherNames } = uses;
  const problems = getIconProblems(filePath, uses);

  if (importRanges.length === 0 && problems.length === 0) return source;
  if (importRanges.length > 0 && elements.length === 0) {
    problems.push(`${filePath}: imports ${LUCIDE_PACKAGE} but renders no icon`);
  }
  if (otherNames.has(ICON_PLACEHOLDER_ELEMENT)) {
    problems.push(`${filePath}: already uses ${ICON_PLACEHOLDER_ELEMENT}`);
  }
  if (otherNames.has(HUGEICONS_COMPONENT)) {
    problems.push(
      `${filePath}: uses ${HUGEICONS_COMPONENT}, which the CLI imports in a hugeicons project; rename it`
    );
  }

  const placeholders = elements.map(({ imported, tagRange }) => {
    const names: Record<IconLibrary, string> = {
      hugeicons: '',
      phosphor: '',
      remixicon: '',
      tabler: '',
      ...getIconNames(imported),
      lucide: imported,
    };

    for (const library of ICON_PLACEHOLDER_LIBRARIES) {
      if (otherNames.has(names[library])) {
        problems.push(
          `${filePath}: uses ${names[library]}, which the CLI imports for ${imported} in a ${library} project; rename it`
        );
      }
    }

    return { range: tagRange, text: formatIconPlaceholder(names) };
  });

  if (problems.length > 0) {
    throw new Error(
      `Registry icon placeholders failed:\n${[...new Set(problems)].join('\n')}`
    );
  }

  const removeLine = ({ end, start }: SourceRange) => ({
    range: { end: source[end] === '\n' ? end + 1 : end, start },
    text: '',
  });
  const [firstDeclaration, ...otherDeclarations] = importRanges;
  const edits = [
    ...placeholders,
    { range: firstDeclaration, text: ICON_PLACEHOLDER_IMPORT },
    ...otherDeclarations.map(removeLine),
  ].sort((left, right) => right.range.start - left.range.start);

  return edits.reduce(
    (text, { range, text: replacement }) =>
      `${text.slice(0, range.start)}${replacement}${text.slice(range.end)}`,
    source
  );
}

export function toServedIcons(file: {
  content: string;
  path: string;
  type: string;
}) {
  if (servesIconPlaceholders(file)) {
    return toIconPlaceholders(file.content, file.path);
  }
  if (file.content.includes(ICON_PLACEHOLDER_ELEMENT)) {
    throw new Error(
      `${file.path}: the shadcn CLI copies a ${file.type} file as written, so it cannot hold an ${ICON_PLACEHOLDER_ELEMENT}; render a Lucide element instead.`
    );
  }

  return file.content;
}

function toServedIconPayload(payload: RegistryPayload): RegistryPayload {
  return {
    ...payload,
    files: payload.files?.map((file) =>
      typeof file.content === 'string'
        ? {
            ...file,
            content: toServedIcons({ ...file, content: file.content }),
          }
        : file
    ),
    items: payload.items?.map(toServedIconPayload),
  };
}

export async function serveIconPlaceholders(directory: string) {
  const fileNames = await readdir(directory);

  await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith('.json'))
      .map(async (fileName) => {
        const filePath = path.join(directory, fileName);
        const payload = JSON.parse(
          await readFile(filePath, 'utf-8')
        ) as RegistryPayload;

        await writeFile(
          filePath,
          `${JSON.stringify(toServedIconPayload(payload), null, 2)}\n`
        );
      })
  );
}
