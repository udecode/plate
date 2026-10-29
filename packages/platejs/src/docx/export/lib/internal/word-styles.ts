import { escapeXml } from './escape-xml';
import { HEADING_RUNS, HYPERLINK_RUN } from './schemas/styles';

export type StyleRun = Readonly<{
  backgroundColor?: string;
  color?: string;
  font?: string;
  fontSize?: number;
  strong?: boolean;
}>;

export type StyleRunKey = keyof StyleRun;

export const STYLE_RUN_KEYS: readonly StyleRunKey[] = [
  'backgroundColor',
  'color',
  'font',
  'fontSize',
  'strong',
];

type ValueKey = Exclude<StyleRunKey, 'strong'>;

const VALUE_KEYS = STYLE_RUN_KEYS.filter(
  (key): key is ValueKey => key !== 'strong'
);

export type RunSemantic = 'code' | 'codeKeyboard' | 'keyboard';

const SEMANTIC_STYLES: Readonly<
  Record<RunSemantic, Readonly<{ id: string; name: string }>>
> = {
  code: { id: 'HTMLCode', name: 'HTML Code' },
  codeKeyboard: { id: 'HTMLCodeKeyboard', name: 'HTML Code Keyboard' },
  keyboard: { id: 'HTMLKeyboard', name: 'HTML Keyboard' },
};

const LOOK_FAMILY = 'Plate Look';

export type QuoteStyle = Readonly<{
  afterSpacing?: number;
  beforeSpacing?: number;
  run: StyleRun;
}>;

export type NamedStyleRuns = Readonly<{
  code: StyleRun;
  keyboard: StyleRun;
  quote: QuoteStyle;
}>;

export type RunStyleRequest = Readonly<{
  hyperlink: boolean;
  look: StyleRun;
  paragraphStyle: string | undefined;
  semantic: RunSemantic | undefined;
}>;

type DerivedStyle = Readonly<{
  basedOn?: string;
  grayHighlight: boolean;
  id: string;
  name: string;
  run: StyleRun;
}>;

const sameValue = (left: unknown, right: unknown) =>
  typeof left === 'string' && typeof right === 'string'
    ? left.toUpperCase() === right.toUpperCase()
    : left === right;

const runXml = (
  { backgroundColor, color, font, fontSize, strong }: StyleRun,
  grayHighlight = false
) =>
  [
    font
      ? `<w:rFonts w:ascii="${escapeXml(font)}" w:hAnsi="${escapeXml(font)}"/>`
      : '',
    strong ? '<w:b/>' : '',
    color ? `<w:color w:val="${escapeXml(color)}"/>` : '',
    fontSize ? `<w:sz w:val="${fontSize}"/>` : '',
    grayHighlight && !backgroundColor ? '<w:highlight w:val="lightGray"/>' : '',
    backgroundColor
      ? `<w:shd w:val="clear" w:fill="${escapeXml(backgroundColor)}"/>`
      : '',
  ].join('');

const characterStyleXml = ({
  basedOn,
  grayHighlight,
  id,
  name,
  run,
}: DerivedStyle) =>
  `<w:style w:type="character" w:customStyle="1" w:styleId="${id}"><w:name w:val="${escapeXml(name)}"/>${
    basedOn ? `<w:basedOn w:val="${basedOn}"/>` : ''
  }<w:rPr>${runXml(run, grayHighlight)}</w:rPr></w:style>`;

export class WordStyles {
  private named: NamedStyleRuns = {
    code: {},
    keyboard: {},
    quote: { run: {} },
  };
  private readonly derived = new Map<string, DerivedStyle>();
  private readonly familySizes = new Map<string, number>(
    Object.values(SEMANTIC_STYLES).map(({ name }) => [name, 1])
  );

  define(named: NamedStyleRuns) {
    this.named = named;
  }

  private semanticRun(semantic: RunSemantic): StyleRun {
    return semantic === 'codeKeyboard'
      ? { ...this.named.keyboard, ...this.named.code }
      : this.named[semantic];
  }

  private paragraphRun(paragraphStyle: string | undefined): StyleRun {
    if (paragraphStyle === 'Quote') return this.named.quote.run;

    return (
      HEADING_RUNS.get(paragraphStyle?.match(/^Heading([1-6])$/)?.[1] ?? '') ??
      {}
    );
  }

  runStyle({
    hyperlink,
    look,
    paragraphStyle,
    semantic,
  }: RunStyleRequest): string | undefined {
    const paragraph = this.paragraphRun(paragraphStyle);
    const named = semantic ? this.semanticRun(semantic) : undefined;
    const base = named ?? (hyperlink ? HYPERLINK_RUN : {});
    const chained: StyleRun = { ...paragraph, ...base };
    const remainder: { -readonly [Key in StyleRunKey]?: StyleRun[Key] } = {};

    for (const key of VALUE_KEYS) {
      const value = look[key];

      if (value !== undefined && !sameValue(value, chained[key])) {
        Object.assign(remainder, { [key]: value });
      }
    }

    const paragraphStrong = paragraph.strong === true;
    const baseStrong = base.strong === true;
    // Word flips bold once for each style level that sets it, so two cancel.
    const cancelled = paragraphStrong && baseStrong;

    if (look.strong === true && !paragraphStrong && !baseStrong) {
      remainder.strong = true;
    }
    if (
      !cancelled &&
      Object.keys(remainder).length === 0 &&
      !(hyperlink && named)
    ) {
      return semantic
        ? SEMANTIC_STYLES[semantic].id
        : hyperlink
          ? 'Hyperlink'
          : undefined;
    }

    const family = semantic ? SEMANTIC_STYLES[semantic].name : LOOK_FAMILY;
    const detached = named && (hyperlink || cancelled);
    const basedOn = hyperlink
      ? 'Hyperlink'
      : semantic && !detached
        ? SEMANTIC_STYLES[semantic].id
        : undefined;
    const { strong: _strong, ...unbold } = named ?? {};
    const run = detached
      ? { ...(cancelled ? unbold : named), ...remainder }
      : remainder;
    const key = JSON.stringify([
      family,
      basedOn,
      STYLE_RUN_KEYS.map((name) => run[name] ?? null),
    ]);
    let style = this.derived.get(key);

    if (!style) {
      const size = (this.familySizes.get(family) ?? 0) + 1;
      const name = size === 1 ? family : `${family} ${size}`;

      this.familySizes.set(family, size);
      style = {
        basedOn,
        grayHighlight: Boolean(detached),
        id: name.replaceAll(' ', ''),
        name,
        run,
      };
      this.derived.set(key, style);
    }

    return style.id;
  }

  toXml(): string {
    const { quote } = this.named;
    const spacing =
      quote.beforeSpacing === undefined && quote.afterSpacing === undefined
        ? ''
        : `<w:spacing${
            quote.beforeSpacing === undefined
              ? ''
              : ` w:before="${quote.beforeSpacing}"`
          }${
            quote.afterSpacing === undefined
              ? ''
              : ` w:after="${quote.afterSpacing}"`
          }/>`;

    return [
      `<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="4" w:color="CCCCCC"/></w:pBdr>${spacing}<w:ind w:left="284"/></w:pPr><w:rPr>${runXml(quote.run)}</w:rPr></w:style>`,
      ...(['code', 'keyboard', 'codeKeyboard'] as const).map((semantic) =>
        characterStyleXml({
          ...SEMANTIC_STYLES[semantic],
          grayHighlight: true,
          run: this.semanticRun(semantic),
        })
      ),
      ...[...this.derived.values()].map(characterStyleXml),
    ].join('');
  }
}
