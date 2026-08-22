import type { DocumentMigration } from '@platejs/core';
import {
  type Descendant,
  type Element,
  ElementApi,
  TextApi,
  type Value,
} from '@platejs/plite';

const CODE_DRAWING_LANGUAGES = new Set([
  'flowchart',
  'graphviz',
  'mermaid',
  'plantuml',
]);
const CODE_DRAWING_VIEWS = new Set(['code', 'preview', 'split']);
const TEXT_ALIGNMENTS = new Set([
  'center',
  'end',
  'justify',
  'left',
  'right',
  'start',
]);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const legacyCodeDrawingLanguage = (value: unknown) => {
  if (typeof value !== 'string') return undefined;

  const normalized = value.toLowerCase();

  return CODE_DRAWING_LANGUAGES.has(normalized) ? normalized : undefined;
};

const legacyCodeDrawingView = (value: unknown) => {
  if (typeof value !== 'string') return undefined;

  const normalized = value.toLowerCase();

  if (normalized === 'both') return 'split';
  if (normalized === 'image') return 'preview';

  return CODE_DRAWING_VIEWS.has(normalized) ? normalized : undefined;
};

const safeInteger = (value: unknown) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;

  const integer = Math.trunc(value);

  return Number.isSafeInteger(integer) ? integer : undefined;
};

/** Upgrade the v54 beta document profile to the final v55 AST contracts. */
export const migratePlateV55: DocumentMigration = ({ document, editor }) => {
  const resolveElementType = (name: string) => {
    const plugin = editor.plugin(name);

    return plugin.installed ? plugin.schema.type : undefined;
  };
  const ownsProperty = (type: string, key: string) =>
    editor.read.schema.property({ key, placement: 'element', type }) !== null;
  const dateType = resolveElementType('date');
  const mentionType = resolveElementType('mention');
  const footnoteDefinitionType = resolveElementType('footnoteDefinition');
  const footnoteReferenceType = resolveElementType('footnote');
  const columnGroupType = resolveElementType('columnGroup');
  const columnType = resolveElementType('column');
  const fileType = resolveElementType('file');
  const mediaTypes = new Set(
    ['audio', 'file', 'image', 'mediaEmbed', 'video']
      .map(resolveElementType)
      .filter((type): type is string => type !== undefined)
  );
  const codeDrawingType = resolveElementType('codeDrawing');
  const equationTypes = new Set(
    ['equation', 'inlineEquation']
      .map(resolveElementType)
      .filter((type): type is string => type !== undefined)
  );
  const imageType = resolveElementType('image');
  const tableType = resolveElementType('table');
  const tableRowType = resolveElementType('tableRow');
  const tableCellType = resolveElementType('tableCell');
  const occupiedFootnoteRefs = new Set<string>();
  const collectFootnoteRefs = (input: Descendant) => {
    if (TextApi.isText(input)) return;

    if (
      input.type === footnoteDefinitionType ||
      input.type === footnoteReferenceType
    ) {
      if (isNonEmptyString(input.identifier)) {
        occupiedFootnoteRefs.add(input.identifier);
      }
      if (isNonEmptyString(input.ref)) occupiedFootnoteRefs.add(input.ref);
    }

    input.children.forEach(collectFootnoteRefs);
  };

  document.children.forEach(collectFootnoteRefs);
  Object.values(document.roots ?? {}).forEach((children) => {
    children.forEach(collectFootnoteRefs);
  });

  const allocateUnresolvedFootnoteRef = (location: string) => {
    const base = `unresolved:${location}`;
    let candidate = base;
    let suffix = 1;

    while (occupiedFootnoteRefs.has(candidate)) {
      candidate = `${base}:${suffix}`;
      suffix += 1;
    }
    occupiedFootnoteRefs.add(candidate);

    return candidate;
  };

  const migrateDescendant = (
    input: Descendant,
    location: string
  ): Descendant => {
    if (TextApi.isText(input)) return input;

    let changed = false;
    const children = input.children.map((child, index) => {
      const migrated = migrateDescendant(
        child,
        `${location}.children.${index}`
      );

      if (migrated !== child) changed = true;

      return migrated;
    });
    let element: Element = changed ? { ...input, children } : input;
    const properties = () => element as Record<string, unknown>;
    const without = (...keys: string[]) => {
      if (!keys.some((key) => Object.hasOwn(element, key))) return;

      const next = { ...element } as Record<string, unknown>;

      for (const key of keys) delete next[key];
      element = next as Element;
    };
    const setMigratedProperty = (
      key: string,
      value: unknown,
      source: string
    ) => {
      if (Object.hasOwn(element, key)) {
        if (!Object.is(properties()[key], value)) {
          throw new Error(
            `Plate v55 migration collision at ${location}: ${source} conflicts with property "${key}".`
          );
        }

        return;
      }

      element = { ...element, [key]: value };
    };

    if (dateType && element.type === dateType) {
      const rawDate = isNonEmptyString(properties().rawDate)
        ? properties().rawDate
        : undefined;
      const date = isNonEmptyString(properties().date)
        ? properties().date
        : undefined;

      if (rawDate !== undefined && date !== undefined && rawDate !== date) {
        throw new Error(
          `Plate v55 migration collision at ${location}: properties "rawDate" and "date" conflict.`
        );
      }

      const legacyValue = rawDate ?? date;
      const value =
        legacyValue ??
        (isNonEmptyString(properties().value) ? properties().value : undefined);

      if (!value) return { text: '' };

      if (
        Object.hasOwn(element, 'value') &&
        !isNonEmptyString(properties().value)
      ) {
        without('value');
      }

      if (legacyValue !== undefined) {
        setMigratedProperty('value', legacyValue, '`date` / `rawDate`');
      }
      without('date', 'rawDate');
    }

    if (mentionType && element.type === mentionType) {
      const rawLegacyKey = properties().key;
      const hasLegacyKey = Object.hasOwn(element, 'key');
      const legacyKey = isNonEmptyString(rawLegacyKey)
        ? rawLegacyKey
        : typeof rawLegacyKey === 'number' && Number.isFinite(rawLegacyKey)
          ? String(rawLegacyKey)
          : undefined;

      const rawLegacyValue = properties().value;
      const rawExistingLabel = properties().label;
      const rawExistingRef = properties().ref;
      const legacyValue = isNonEmptyString(rawLegacyValue)
        ? rawLegacyValue
        : undefined;
      const existingLabel = isNonEmptyString(rawExistingLabel)
        ? rawExistingLabel
        : undefined;
      const existingRef = isNonEmptyString(rawExistingRef)
        ? rawExistingRef
        : undefined;

      if (
        hasLegacyKey &&
        legacyKey === undefined &&
        existingRef === undefined
      ) {
        return { text: `@${existingLabel ?? legacyValue ?? ''}` };
      }

      const legacyRef =
        existingRef !== undefined && legacyKey === undefined
          ? undefined
          : (legacyKey ??
            (isNonEmptyString(legacyValue) ? legacyValue : undefined));
      const ref = legacyRef ?? existingRef;

      if (!ref) return { text: `@${existingLabel ?? legacyValue ?? ''}` };

      if (Object.hasOwn(element, 'ref') && existingRef === undefined) {
        without('ref');
      }

      if (legacyRef !== undefined) {
        setMigratedProperty('ref', legacyRef, '`key` / `value`');
      }
      const legacyLabel =
        (legacyKey !== undefined || existingRef !== undefined) &&
        legacyValue !== undefined &&
        legacyValue !== ref
          ? legacyValue
          : undefined;

      if (Object.hasOwn(element, 'label') && existingLabel === undefined) {
        without('label');
      }
      if (legacyLabel !== undefined) {
        setMigratedProperty('label', legacyLabel, '`value`');
      }
      without('key', 'value');
    }

    if (
      (footnoteDefinitionType && element.type === footnoteDefinitionType) ||
      (footnoteReferenceType && element.type === footnoteReferenceType)
    ) {
      const legacyRef = isNonEmptyString(properties().identifier)
        ? properties().identifier
        : undefined;
      const existingRef = isNonEmptyString(properties().ref)
        ? properties().ref
        : undefined;
      const ref =
        legacyRef ?? existingRef ?? allocateUnresolvedFootnoteRef(location);

      if (Object.hasOwn(element, 'ref') && existingRef === undefined) {
        without('ref');
      }

      if (legacyRef !== undefined) {
        setMigratedProperty('ref', legacyRef, '`identifier`');
      } else if (existingRef === undefined) {
        setMigratedProperty('ref', ref, 'missing footnote association');
      }
      without('identifier');
    }

    if (columnGroupType && element.type === columnGroupType) {
      const { layout } = properties();

      if (columnType) {
        const columnCount = element.children.filter(
          (child) => ElementApi.isElement(child) && child.type === columnType
        ).length;
        const fallbackWidth = `${100 / Math.max(columnCount, 1)}%`;
        const nextChildren = element.children.map((child, index) => {
          const width: unknown = Array.isArray(layout)
            ? layout[index]
            : undefined;
          const layoutWidth =
            typeof width === 'number' && Number.isFinite(width) && width > 0
              ? `${width}%`
              : fallbackWidth;

          if (!ElementApi.isElement(child) || child.type !== columnType) {
            return child;
          }

          if (isNonEmptyString(child.width)) {
            if (
              typeof width === 'number' &&
              Number.isFinite(width) &&
              width > 0 &&
              child.width !== layoutWidth
            ) {
              throw new Error(
                `Plate v55 migration collision at ${location}.children.${index}: layout width "${layoutWidth}" conflicts with property "width" value "${child.width}".`
              );
            }

            return child;
          }

          return { ...child, width: layoutWidth };
        });

        if (
          nextChildren.some((child, index) => child !== element.children[index])
        ) {
          element = { ...element, children: nextChildren };
        }
      }
      without('layout');
    }

    if (
      mediaTypes.has(element.type) &&
      element.type !== fileType &&
      !ownsProperty(element.type, 'name') &&
      Object.hasOwn(element, 'name')
    ) {
      without('name');
    }

    if (codeDrawingType && element.type === codeDrawingType) {
      const { data } = properties();
      const record =
        typeof data === 'object' && data !== null && !Array.isArray(data)
          ? (data as Record<string, unknown>)
          : {};

      const legacyCode = isNonEmptyString(record.code)
        ? record.code
        : undefined;
      const legacyLanguage = legacyCodeDrawingLanguage(record.drawingType);
      const legacyView = legacyCodeDrawingView(record.drawingMode);
      const existingCodeValid =
        typeof properties().code === 'string' &&
        (legacyCode === undefined || isNonEmptyString(properties().code));
      const existingLanguageValid = CODE_DRAWING_LANGUAGES.has(
        String(properties().language)
      );
      const existingViewValid = CODE_DRAWING_VIEWS.has(
        String(properties().view)
      );

      if (!existingCodeValid && Object.hasOwn(element, 'code')) without('code');
      if (!existingLanguageValid && Object.hasOwn(element, 'language')) {
        without('language');
      }
      if (!existingViewValid && Object.hasOwn(element, 'view')) without('view');

      if (legacyCode !== undefined) {
        setMigratedProperty('code', legacyCode, '`data.code`');
      } else if (!existingCodeValid) {
        setMigratedProperty('code', '', 'missing Code Drawing code');
      }
      if (legacyLanguage !== undefined) {
        setMigratedProperty('language', legacyLanguage, '`data.drawingType`');
      } else if (!existingLanguageValid) {
        setMigratedProperty(
          'language',
          'mermaid',
          'missing Code Drawing language'
        );
      }
      if (legacyView !== undefined) {
        setMigratedProperty('view', legacyView, '`data.drawingMode`');
      } else if (!existingViewValid) {
        setMigratedProperty('view', 'split', 'missing Code Drawing view');
      }
      without('data');
    }

    if (equationTypes.has(element.type)) {
      const legacyLatex = isNonEmptyString(properties().texExpression)
        ? properties().texExpression
        : undefined;
      const existingLatexValid =
        typeof properties().latex === 'string' &&
        (legacyLatex === undefined || isNonEmptyString(properties().latex));

      if (!existingLatexValid && Object.hasOwn(element, 'latex')) {
        without('latex');
      }

      if (legacyLatex !== undefined) {
        setMigratedProperty('latex', legacyLatex, '`texExpression`');
      } else if (!existingLatexValid) {
        setMigratedProperty('latex', '', 'missing equation source');
      }
      without('texExpression');
    }

    if (ownsProperty(element.type, 'listStart')) {
      for (const key of ['listRestart', 'listStart'] as const) {
        if (!Object.hasOwn(element, key)) continue;

        const value = safeInteger(properties()[key]);

        if (value === undefined) {
          without(key);
        } else if (value !== properties()[key]) {
          element = { ...element, [key]: value };
        }
      }
    }

    if (
      ownsProperty(element.type, 'indent') &&
      Object.hasOwn(element, 'indent')
    ) {
      const indent = safeInteger(properties().indent);

      if (indent === undefined || indent < 0) {
        without('indent');
      } else if (indent !== properties().indent) {
        element = { ...element, indent };
      }
    }

    if (
      ownsProperty(element.type, 'textAlign') &&
      Object.hasOwn(element, 'textAlign') &&
      !TEXT_ALIGNMENTS.has(String(properties().textAlign))
    ) {
      without('textAlign');
    }

    if (imageType && element.type === imageType) {
      for (const key of ['naturalHeight', 'naturalWidth'] as const) {
        if (!Object.hasOwn(element, key)) continue;

        const value = safeInteger(properties()[key]);

        if (value === undefined || value <= 0) {
          without(key);
        } else if (value !== properties()[key]) {
          element = { ...element, [key]: value };
        }
      }
    }

    if (tableCellType && element.type === tableCellType) {
      for (const key of ['colSpan', 'rowSpan'] as const) {
        if (!Object.hasOwn(element, key)) continue;

        const value = properties()[key];

        if (
          typeof value !== 'number' ||
          !Number.isSafeInteger(value) ||
          value <= 0
        ) {
          without(key);
        }
      }

      if (Object.hasOwn(element, 'borders')) {
        const { borders } = properties();

        if (
          typeof borders === 'object' &&
          borders !== null &&
          !Array.isArray(borders)
        ) {
          let bordersChanged = false;
          const directions = new Set(['bottom', 'left', 'right', 'top']);
          const nextBorders = Object.fromEntries(
            Object.entries(borders).flatMap(([direction, border]) => {
              if (!directions.has(direction)) {
                bordersChanged = true;

                return [];
              }
              if (
                typeof border !== 'object' ||
                border === null ||
                Array.isArray(border)
              ) {
                bordersChanged = true;

                return [];
              }
              const record = border as Record<string, unknown>;
              const nextBorder: Record<string, unknown> = {};

              if (typeof record.color === 'string') {
                nextBorder.color = record.color;
              }
              if (typeof record.style === 'string') {
                nextBorder.style = record.style;
              }
              if (
                typeof record.width === 'number' &&
                Number.isFinite(record.width)
              ) {
                nextBorder.width = Math.max(0, record.width);
              }

              if (
                Object.keys(record).length !== Object.keys(nextBorder).length ||
                Object.entries(nextBorder).some(
                  ([key, value]) => !Object.is(record[key], value)
                )
              ) {
                bordersChanged = true;
              }

              return [[direction, nextBorder]];
            })
          );

          if (bordersChanged) {
            element = { ...element, borders: nextBorders };
          }
        } else {
          without('borders');
        }
      }
    }

    if (
      tableRowType &&
      element.type === tableRowType &&
      Object.hasOwn(element, 'height') &&
      (typeof properties().height !== 'number' ||
        !Number.isFinite(properties().height) ||
        Number(properties().height) <= 0)
    ) {
      without('height');
    }

    if (tableType && element.type === tableType) {
      const { columnWidths } = properties();

      if (Array.isArray(columnWidths)) {
        let widthsChanged = false;
        const nextColumnWidths = columnWidths.map((width) => {
          const normalized =
            typeof width === 'number' && Number.isFinite(width) && width > 0
              ? width
              : null;

          if (!Object.is(normalized, width)) widthsChanged = true;

          return normalized;
        });

        if (widthsChanged) {
          element = {
            ...element,
            columnWidths: nextColumnWidths,
          };
        }
      } else if (Object.hasOwn(element, 'columnWidths')) {
        without('columnWidths');
      }
    }

    return element;
  };

  const migrateChildren = (children: Value, location: string): Value => {
    let changed = false;
    const next = children.map((child, index) => {
      const migrated = migrateDescendant(child, `${location}.${index}`);

      if (migrated !== child) changed = true;

      return migrated;
    }) as Value;

    return changed ? next : children;
  };
  const children = migrateChildren(document.children, 'main');
  let { roots } = document;

  if (roots) {
    let changed = false;
    const next = Object.fromEntries(
      Object.entries(roots).map(([root, rootChildren]) => {
        const migrated = migrateChildren(rootChildren, `roots.${root}`);

        if (migrated !== rootChildren) changed = true;

        return [root, migrated];
      })
    );

    if (changed) roots = next;
  }

  if (children === document.children && roots === document.roots) {
    return document;
  }

  return {
    ...document,
    children,
    ...(roots ? { roots } : {}),
  };
};
