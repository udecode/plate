import {
  type HtmlMappingDiagnosticInput,
  property,
  type PropertyEnumDescriptor,
  type PropertyNumberDescriptor,
  type PropertyStringDescriptor,
} from '../../../core';

const BOARD_DASHES = ['dashed', 'dotted', 'solid'] as const;
const BOARD_STYLE_SIZES = ['l', 'm', 's', 'xl'] as const;

/** A named size for a board outline width or a shape's text. */
export type BoardStyleSize = (typeof BOARD_STYLE_SIZES)[number];

/** The styles a board shape can store, each with its value. */
export type BoardStyles = Readonly<{
  /** The outline's line: `solid`, `dashed` or `dotted`. */
  dash: (typeof BOARD_DASHES)[number];
  /** `none`, a color name or any CSS color. */
  fill: string;
  /** From 0.1 to 1. */
  opacity: number;
  /** A color name or any CSS color. */
  strokeColor: string;
  strokeWidth: BoardStyleSize;
  textSize: BoardStyleSize;
}>;

type BoardStyleKey = keyof BoardStyles;

type BoardStyleDefault<K extends BoardStyleKey> = Readonly<{
  default: BoardStyles[K];
}>;

// Each style names its own descriptor kind, because TypeScript 5 rejects a
// generic-kind descriptor where a plugin's schema reads its properties.
type BoardStyleDescriptors = Readonly<{
  dash: PropertyEnumDescriptor<typeof BOARD_DASHES, BoardStyleDefault<'dash'>>;
  fill: PropertyStringDescriptor<BoardStyleDefault<'fill'>>;
  opacity: PropertyNumberDescriptor<
    BoardStyleDefault<'opacity'> &
      Readonly<{
        validate: (value: unknown) => value is number;
        validationVersion: 1;
      }>
  >;
  strokeColor: PropertyStringDescriptor<BoardStyleDefault<'strokeColor'>>;
  strokeWidth: PropertyEnumDescriptor<
    typeof BOARD_STYLE_SIZES,
    BoardStyleDefault<'strokeWidth'>
  >;
  textSize: PropertyEnumDescriptor<
    typeof BOARD_STYLE_SIZES,
    BoardStyleDefault<'textSize'>
  >;
}>;

export type BoardStyleProperties<TStyles> = {
  readonly [K in keyof TStyles]: BoardStyleDescriptors[K & BoardStyleKey];
};

export type BoardStyleDefaults<TStyles> = {
  readonly [K in keyof TStyles]-?: K extends BoardStyleKey
    ? BoardStyles[K]
    : never;
};

const isOpacity = (value: unknown): value is number =>
  typeof value === 'number' && value >= 0.1 && value <= 1;

const oneOf =
  <const TValue extends string>(values: readonly TValue[]) =>
  (raw: unknown) =>
    values.find((value) => value === raw);

const isString = (value: unknown): value is string => typeof value === 'string';

const BOARD_STYLES: {
  readonly [K in BoardStyleKey]: Readonly<{
    attribute: string;
    parse: (raw: unknown) => BoardStyles[K] | undefined;
    property: (value: BoardStyles[K]) => BoardStyleDescriptors[K];
  }>;
} = {
  dash: {
    attribute: 'data-board-dash',
    parse: oneOf(BOARD_DASHES),
    property: (value) => property.enum(BOARD_DASHES, { default: value }),
  },
  fill: {
    attribute: 'data-board-fill',
    parse: (raw) => (isString(raw) ? raw : undefined),
    property: (value) => property.string({ default: value }),
  },
  opacity: {
    attribute: 'data-board-opacity',
    parse: (raw) => {
      const value = isString(raw) ? Number(raw) : raw;

      return isOpacity(value) ? value : undefined;
    },
    property: (value) =>
      property.number({
        default: value,
        validate: isOpacity,
        validationVersion: 1,
      }),
  },
  strokeColor: {
    attribute: 'data-board-stroke-color',
    parse: (raw) => (isString(raw) ? raw : undefined),
    property: (value) => property.string({ default: value }),
  },
  strokeWidth: {
    attribute: 'data-board-stroke-width',
    parse: oneOf(BOARD_STYLE_SIZES),
    property: (value) => property.enum(BOARD_STYLE_SIZES, { default: value }),
  },
  textSize: {
    attribute: 'data-board-text-size',
    parse: oneOf(BOARD_STYLE_SIZES),
    property: (value) => property.enum(BOARD_STYLE_SIZES, { default: value }),
  },
};

export const parseBoardStyle = <K extends BoardStyleKey>(
  key: K,
  value: unknown
): BoardStyles[K] | undefined => BOARD_STYLES[key].parse(value);

export const BOARD_NOTE_STYLES = {
  fill: 'yellow',
  opacity: 1,
  textSize: 'm',
} as const;

export const BOARD_GEO_STYLES = {
  dash: 'solid',
  fill: 'none',
  opacity: 1,
  strokeColor: 'currentColor',
  strokeWidth: 'm',
  textSize: 'm',
} as const;

export const BOARD_ARROW_STYLES = {
  dash: 'solid',
  opacity: 1,
  strokeColor: 'currentColor',
  strokeWidth: 'm',
  textSize: 's',
} as const;

export const BOARD_STROKE_STYLES = {
  opacity: 1,
  strokeColor: 'currentColor',
} as const;

export const isBoardStyleKey = (key: string): key is BoardStyleKey =>
  Object.hasOwn(BOARD_STYLES, key);

export const BOARD_STYLE_KEYS =
  Object.keys(BOARD_STYLES).filter(isBoardStyleKey);

const boardStyleKeys = <const TStyles extends Partial<BoardStyles>>(
  styles: TStyles
) =>
  BOARD_STYLE_KEYS.filter(
    (key): key is keyof TStyles & BoardStyleKey => key in styles
  );

const stylePropertyOf = <K extends BoardStyleKey>(
  key: K,
  styles: Partial<BoardStyles>
) => {
  const value = styles[key];

  if (value === undefined) {
    throw new Error(`The board style "${key}" has no default.`);
  }

  return [key, BOARD_STYLES[key].property(value)] as const;
};

export function boardStyleProperties<
  const TStyles extends Partial<BoardStyles>,
>(styles: TStyles): BoardStyleProperties<TStyles>;
export function boardStyleProperties(styles: Partial<BoardStyles>): unknown {
  const stray = Object.keys(styles).find((key) => !isBoardStyleKey(key));

  if (stray !== undefined) throw new Error(`"${stray}" is no board style.`);

  return Object.fromEntries(
    boardStyleKeys(styles).map((key) => stylePropertyOf(key, styles))
  );
}

type BoardHtmlReport = (diagnostic: HtmlMappingDiagnosticInput) => void;

export const encodeBoardStyleAttributes = <
  const TStyles extends Partial<BoardStyles>,
>(
  node: Readonly<Record<string, unknown>>,
  styles: TStyles,
  preserve: (...keys: Array<keyof TStyles & BoardStyleKey>) => void
) => {
  const keys = boardStyleKeys(styles);

  preserve(...keys);

  return Object.fromEntries(
    keys.map((key) => {
      const value = node[key];

      return [
        BOARD_STYLES[key].attribute,
        typeof value === 'number' || typeof value === 'string'
          ? value
          : undefined,
      ];
    })
  );
};

export const reportInvalidBoardAttribute = (
  report: BoardHtmlReport,
  attribute: string,
  raw: string
) =>
  report({
    action: 'dropped',
    kind: 'attribute',
    message: `Board HTML dropped ${attribute}="${raw}", a value the shape does not take, and gave the shape its default.`,
  });

const decodeStyle = <K extends BoardStyleKey>(
  key: K,
  element: Readonly<HTMLElement>,
  report: BoardHtmlReport
): Partial<BoardStyles> => {
  const { attribute, parse } = BOARD_STYLES[key];
  const raw = element.getAttribute(attribute);

  if (raw === null) return {};

  const value = parse(raw);

  if (value === undefined) {
    reportInvalidBoardAttribute(report, attribute, raw);

    return {};
  }

  return { [key]: value };
};

export const decodeBoardStyleAttributes = <
  const TStyles extends Partial<BoardStyles>,
>(
  element: Readonly<HTMLElement>,
  styles: TStyles,
  {
    preserve,
    report,
  }: Readonly<{
    preserve: (...attributes: readonly string[]) => void;
    report: BoardHtmlReport;
  }>
): Partial<Pick<BoardStyles, keyof TStyles & BoardStyleKey>> => {
  const keys = boardStyleKeys(styles);

  preserve(...keys.map((key) => BOARD_STYLES[key].attribute));

  const decoded: Partial<BoardStyles> = {};

  for (const key of keys) {
    Object.assign(decoded, decodeStyle(key, element, report));
  }

  return decoded;
};
