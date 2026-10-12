/** The list plugin's `ListLevel`, restated because `docx/import` cannot depend on the list feature. */
export type DocxListLevel = Readonly<{
  label?: string;
  restartAfter?: number;
  start?: number;
}>;

/** The list facts one numbered Word paragraph maps to. */
export type DocxListItem = Readonly<{
  checked?: boolean;
  indent: number;
  listId: string;
  listLevels?: Readonly<Record<string, DocxListLevel>>;
  listRestart?: number;
  listStyle?: string;
  listType: 'bulleted' | 'numbered' | 'task';
}>;

type WordLevel = Readonly<{
  format: string;
  label?: string;
  restart?: number;
  start: number;
  style?: string;
}>;

type WordNum = Readonly<{
  abstractId: string;
  id: string;
  levels: ReadonlyMap<number, WordLevel>;
  startOverrides: ReadonlyMap<number, number>;
}>;

type NumberedParagraph = Readonly<{ level: number; num: WordNum }>;

const STYLE_BY_FORMAT: Readonly<Record<string, string>> = {
  decimalZero: 'decimal-leading-zero',
  lowerLetter: 'lower-alpha',
  lowerRoman: 'lower-roman',
  upperLetter: 'upper-alpha',
  upperRoman: 'upper-roman',
};

// Word draws these bullets from symbol fonts.
const STYLE_BY_BULLET: Readonly<Record<string, string>> = {
  o: 'circle',
  '': 'square',
  '': 'disc',
  '▪': 'square',
  '◦': 'circle',
};

// Plate's export draws a to-do level's bullet as ☑ or ☐.
const CHECKED_BY_BULLET: ReadonlyMap<string, boolean> = new Map([
  ['☐', false],
  ['☑', true],
  ['☒', true],
]);

const childrenNamed = (element: Element | undefined, name: string) =>
  element
    ? Array.from(element.children).filter((child) => child.localName === name)
    : [];

const childNamed = (element: Element | undefined, name: string) =>
  childrenNamed(element, name)[0];

const attribute = (element: Element | undefined, name: string) =>
  element
    ? (Array.from(element.attributes).find(
        (candidate) =>
          candidate.localName === name ||
          candidate.name.split(':').at(-1) === name
      )?.value ?? undefined)
    : undefined;

const integer = (value: string | undefined) => {
  if (value === undefined || value.trim() === '') return undefined;

  const parsed = Number(value);

  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

const readLevel = (element: Element): WordLevel => {
  const restart = integer(attribute(childNamed(element, 'lvlRestart'), 'val'));
  const label = attribute(childNamed(element, 'lvlText'), 'val');
  const style = attribute(childNamed(element, 'pStyle'), 'val');

  return {
    format: attribute(childNamed(element, 'numFmt'), 'val') ?? 'decimal',
    start: integer(attribute(childNamed(element, 'start'), 'val')) ?? 1,
    ...(label === undefined ? {} : { label }),
    ...(restart === undefined ? {} : { restart }),
    ...(style === undefined ? {} : { style }),
  };
};

// Word ignores w:start and w:lvlRestart inside a level override (MS-OI29500
// 17.9.25 and 17.9.10).
const overrideLevel = (
  element: Element,
  base: WordLevel | undefined
): WordLevel => {
  const format = attribute(childNamed(element, 'numFmt'), 'val');
  const label = attribute(childNamed(element, 'lvlText'), 'val');
  const style = attribute(childNamed(element, 'pStyle'), 'val');

  return {
    ...base,
    format: format ?? base?.format ?? 'decimal',
    start: base?.start ?? 1,
    ...(label === undefined ? {} : { label }),
    ...(style === undefined ? {} : { style }),
  };
};

const readLevels = (element: Element | undefined) => {
  const levels = new Map<number, WordLevel>();

  for (const level of childrenNamed(element, 'lvl')) {
    const index = integer(attribute(level, 'ilvl'));

    if (index !== undefined) levels.set(index, readLevel(level));
  }

  return levels;
};

type StyleNumbering = Readonly<{ level?: number; numId?: string }>;

const readStyles = (styles: Document | undefined) => {
  const byId = new Map<
    string,
    Readonly<{ basedOn?: string; numbering?: StyleNumbering }>
  >();

  for (const style of styles
    ? Array.from(styles.getElementsByTagName('*')).filter(
        (element) => element.localName === 'style'
      )
    : []) {
    const id = attribute(style, 'styleId');

    if (!id) continue;

    const numPr = childNamed(childNamed(style, 'pPr'), 'numPr');

    byId.set(id, {
      basedOn: attribute(childNamed(style, 'basedOn'), 'val'),
      numbering: numPr
        ? {
            level: integer(attribute(childNamed(numPr, 'ilvl'), 'val')),
            numId: attribute(childNamed(numPr, 'numId'), 'val'),
          }
        : undefined,
    });
  }

  return byId;
};

const readNums = (
  numbering: Document | undefined,
  styles: ReturnType<typeof readStyles>
) => {
  const nums = new Map<string, WordNum>();

  if (!numbering) return nums;

  const elements = Array.from(numbering.getElementsByTagName('*'));
  const abstracts = new Map<string, Element>();
  const numElements = new Map<string, Element>();

  for (const element of elements) {
    if (element.localName === 'abstractNum') {
      const id = attribute(element, 'abstractNumId');

      if (id !== undefined) abstracts.set(id, element);
    } else if (element.localName === 'num') {
      const id = attribute(element, 'numId');

      if (id !== undefined) numElements.set(id, element);
    }
  }

  // A list style's abstract definition holds no levels; it links to a style
  // whose numbering names the definition that does.
  const resolveAbstract = (
    id: string,
    seen = new Set<string>()
  ): { element: Element | undefined; id: string } => {
    const element = abstracts.get(id);

    if (!element || seen.has(id)) return { element, id };
    seen.add(id);

    const link = attribute(childNamed(element, 'numStyleLink'), 'val');
    const linkedNum = link ? styles.get(link)?.numbering?.numId : undefined;
    const linkedAbstract = linkedNum
      ? attribute(
          childNamed(numElements.get(linkedNum), 'abstractNumId'),
          'val'
        )
      : undefined;

    return linkedAbstract === undefined
      ? { element, id }
      : resolveAbstract(linkedAbstract, seen);
  };

  for (const [id, element] of numElements) {
    const abstractRef = attribute(childNamed(element, 'abstractNumId'), 'val');

    if (abstractRef === undefined) continue;

    const abstract = resolveAbstract(abstractRef);
    const levels = readLevels(abstract.element);
    const startOverrides = new Map<number, number>();

    for (const override of childrenNamed(element, 'lvlOverride')) {
      const index = integer(attribute(override, 'ilvl'));

      if (index === undefined) continue;

      const level = childNamed(override, 'lvl');
      const start = integer(
        attribute(childNamed(override, 'startOverride'), 'val')
      );

      if (level) levels.set(index, overrideLevel(level, levels.get(index)));
      if (start !== undefined) startOverrides.set(index, start);
    }
    nums.set(id, { abstractId: abstract.id, id, levels, startOverrides });
  }

  return nums;
};

const readParagraphNumbering = (
  paragraph: Element,
  nums: ReadonlyMap<string, WordNum>,
  styles: ReturnType<typeof readStyles>
): NumberedParagraph | undefined => {
  const properties = childNamed(paragraph, 'pPr');
  const numPr = childNamed(properties, 'numPr');
  let numId = attribute(childNamed(numPr, 'numId'), 'val');
  let level = integer(attribute(childNamed(numPr, 'ilvl'), 'val'));
  let styleId = attribute(childNamed(properties, 'pStyle'), 'val');
  const paragraphStyle = styleId;
  const seen = new Set<string>();

  while ((numId === undefined || level === undefined) && styleId) {
    if (seen.has(styleId)) break;
    seen.add(styleId);

    const style = styles.get(styleId);

    numId ??= style?.numbering?.numId;
    level ??= style?.numbering?.level;
    styleId = style?.basedOn;
  }

  const num = numId === undefined ? undefined : nums.get(numId);

  if (!num) return undefined;
  if (level === undefined && paragraphStyle) {
    for (const [index, candidate] of num.levels) {
      if (candidate.style === paragraphStyle) level = index;
    }
  }

  return { level: level ?? 0, num };
};

const toListLevels = (levels: ReadonlyMap<number, WordLevel>) => {
  const result: Record<string, DocxListLevel> = {};

  for (const [index, level] of levels) {
    // Bullet text and a level's own `%N.` add nothing to the marker Plate draws.
    const label =
      level.format === 'bullet' || level.label === `%${index + 1}.`
        ? undefined
        : level.label;
    const entry = {
      ...(label === undefined ? {} : { label }),
      ...(level.restart === undefined ? {} : { restartAfter: level.restart }),
      ...(level.start === 1 ? {} : { start: level.start }),
    };

    if (Object.keys(entry).length > 0) result[String(index + 1)] = entry;
  }

  return Object.keys(result).length > 0 ? result : undefined;
};

export const readDocxNumbering = (
  document: Document,
  parts: Readonly<{ numbering?: Document; styles?: Document }>
): ReadonlyMap<Element, DocxListItem> => {
  const styles = readStyles(parts.styles);
  const nums = readNums(parts.numbering, styles);
  const items = new Map<Element, DocxListItem>();
  const seen = new Set<string>();

  if (nums.size === 0) return items;

  for (const paragraph of document.getElementsByTagName('*')) {
    if (paragraph.localName !== 'p') continue;

    const numbered = readParagraphNumbering(paragraph, nums, styles);

    if (!numbered) continue;

    const { level, num } = numbered;
    const rules = num.levels.get(level);
    const bullet = rules?.format === 'bullet';
    const listStyle = bullet
      ? STYLE_BY_BULLET[rules?.label ?? '']
      : STYLE_BY_FORMAT[rules?.format ?? 'decimal'];
    const checked = bullet
      ? CHECKED_BY_BULLET.get(rules?.label ?? '')
      : undefined;
    const listLevels = toListLevels(num.levels);
    // Word counts every instance of a definition in one sequence per level,
    // and an instance's start override resets it at the instance's first
    // paragraph there (MS-DOC 2.4.6.4), which a restart on that item counts.
    const key = `${num.id}:${level}`;
    const restart = seen.has(key) ? undefined : num.startOverrides.get(level);

    seen.add(key);
    items.set(paragraph, {
      ...(checked === undefined ? {} : { checked }),
      indent: level + 1,
      listId: `abstract:${num.abstractId}`,
      listType:
        checked === undefined ? (bullet ? 'bulleted' : 'numbered') : 'task',
      ...(listLevels ? { listLevels } : {}),
      ...(listStyle === undefined || listStyle === 'disc' ? {} : { listStyle }),
      ...(restart === undefined || bullet ? {} : { listRestart: restart }),
    });
  }

  return items;
};
