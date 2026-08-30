import {
  type Descendant,
  type EditorCoreStateView,
  type Element,
  ElementApi,
  type NodeEntry,
  type Path,
  PathApi,
  TextApi,
  type Value,
} from 'plitejs';

import type { DocumentMigration } from '../lib/editor/documentMigrations';
import {
  V53_ELEMENT_TYPE_OWNERS,
  V53_FIRST_PARTY_IDENTITIES,
} from './v53-manifest';

const LEGACY_HEADING_TYPE_RE = /^h([1-6])$/;

const formatMigrationValue = (value: unknown): string => {
  if (typeof value === 'string') return value;

  return JSON.stringify(value) ?? 'unknown';
};

type MigrationListSiblingState = {
  nodes: Pick<EditorCoreStateView['nodes'], 'get'>;
};

type MigrationListSiblingOptions = {
  breakOnEqIndentNeqList?: boolean;
  breakOnLowerIndent?: boolean;
  breakQuery?: (
    siblingNode: Element,
    currentNode: Element
  ) => boolean | undefined;
  eqIndent?: boolean;
  getPreviousEntry?: (
    entry: NodeEntry<Element>,
    state: MigrationListSiblingState
  ) => NodeEntry<Element> | undefined;
  query?: (siblingNode: Element, currentNode: Element) => boolean | undefined;
};

const isAbsentCaption = (children: readonly Descendant[]) =>
  children.length === 0 ||
  (children.length === 1 &&
    TextApi.isText(children[0]) &&
    children[0].text === '' &&
    Object.keys(children[0]).every((key) => key === 'text'));

/** Upgrade the frozen first-party Plate v53 document profile to v54. */
export const migratePlateV54: DocumentMigration = ({ document, editor }) => {
  const ownsProperty = (
    key: string,
    placement: 'element' | 'text',
    type?: string
  ) =>
    editor.read.schema.property({
      key,
      placement,
      ...(type === undefined ? {} : { type }),
    }) !== null;
  const resolveElementType = (name: string) => {
    const plugin = editor.plugin(name);

    return plugin.installed ? plugin.schema.type : undefined;
  };
  const script = editor.plugin('script');
  const scriptKey = script.installed ? script.schema.key : undefined;
  const mediaTypes = new Set(
    ['audio', 'file', 'image', 'mediaEmbed', 'video']
      .map(resolveElementType)
      .filter((type): type is string => type !== undefined)
  );
  const tableCellType = resolveElementType('tableCell');
  const codeBlockType = resolveElementType('codeBlock');
  const headingType = resolveElementType('heading');
  const imageType = resolveElementType('image');
  const tableRowType = resolveElementType('tableRow');
  const tableType = resolveElementType('table');
  const videoType = resolveElementType('video');
  const ownsTableCellSize =
    tableCellType !== undefined &&
    ownsProperty('size', 'element', tableCellType);
  const legacyListLocations = new Map<
    string,
    { derivedStart: number | undefined }
  >();
  const typeMigrations = new Map<string, string>();
  const firstPartyElementTypes = new Set<string>();
  const listPlugin = editor.plugin('list');
  const configuredListSiblingOptions = listPlugin.installed
    ? (
        (listPlugin.store as unknown as { get: () => unknown }).get() as {
          getSiblingListOptions?: MigrationListSiblingOptions;
        }
      ).getSiblingListOptions
    : undefined;

  for (const entry of V53_FIRST_PARTY_IDENTITIES) {
    if (!entry.kind.startsWith('element-')) continue;
    const owner = 'owner' in entry ? entry.owner : entry.identity;
    const target = resolveElementType(owner);

    if (target) {
      if (
        entry.kind === 'element-unchanged' ||
        !editor.read.schema.element(entry.identity)
      ) {
        firstPartyElementTypes.add(entry.identity);
      }
      firstPartyElementTypes.add(target);
    }
  }

  for (const [legacyType, owner] of Object.entries(V53_ELEMENT_TYPE_OWNERS)) {
    if (editor.read.schema.element(legacyType)) continue;
    const target = resolveElementType(owner);

    if (target) typeMigrations.set(legacyType, target);
  }

  const renameElementProperty = (
    element: Element,
    from: string,
    to: string,
    location: string
  ): Element => {
    if (
      !Object.hasOwn(element, from) ||
      ownsProperty(from, 'element', element.type)
    ) {
      return element;
    }
    if (Object.hasOwn(element, to)) {
      throw new Error(
        `Plate v53 migration collision at ${location}: properties "${from}" and "${to}" are both present.`
      );
    }

    const next = { ...element } as Record<string, unknown>;
    const value = next[from];

    delete next[from];
    next[to] = value;

    return next as Element;
  };

  const migrateText = (
    text: Descendant,
    location: string,
    parentType?: string
  ): Descendant => {
    if (
      !TextApi.isText(text) ||
      !scriptKey ||
      !parentType ||
      !firstPartyElementTypes.has(parentType)
    ) {
      return text;
    }

    const hasSubscript =
      Object.hasOwn(text, 'subscript') &&
      !ownsProperty('subscript', 'text', parentType);
    const hasSuperscript =
      Object.hasOwn(text, 'superscript') &&
      !ownsProperty('superscript', 'text', parentType);

    if (!hasSubscript && !hasSuperscript) return text;

    const subscript = hasSubscript ? Reflect.get(text, 'subscript') : undefined;
    const superscript = hasSuperscript
      ? Reflect.get(text, 'superscript')
      : undefined;

    if (subscript !== undefined && typeof subscript !== 'boolean') {
      throw new Error(
        `Legacy script mark at ${location}.subscript must be a boolean.`
      );
    }
    if (superscript !== undefined && typeof superscript !== 'boolean') {
      throw new Error(
        `Legacy script mark at ${location}.superscript must be a boolean.`
      );
    }
    if (subscript === true && superscript === true) {
      throw new Error(
        `Legacy script mark at ${location} cannot be both subscript and superscript.`
      );
    }

    const migrated =
      subscript === true ? 'sub' : superscript === true ? 'sup' : undefined;
    const current = Reflect.get(text, scriptKey);

    if (
      migrated !== undefined &&
      current !== undefined &&
      current !== migrated
    ) {
      throw new Error(
        `Legacy script mark at ${location} conflicts with ${scriptKey} "${formatMigrationValue(current)}".`
      );
    }

    let next = text;

    if (hasSubscript) {
      const { subscript: _subscript, ...withoutSubscript } = next;

      next = withoutSubscript;
    }
    if (hasSuperscript) {
      const { superscript: _superscript, ...withoutSuperscript } = next;

      next = withoutSuperscript;
    }

    return migrated === undefined ? next : { ...next, [scriptKey]: migrated };
  };

  const migrateDescendant = (
    input: unknown,
    location: string,
    parentType?: string
  ): Descendant => {
    if (TextApi.isText(input)) return migrateText(input, location, parentType);
    if (!ElementApi.isElement(input)) {
      throw new Error(`Invalid Plate document node at ${location}.`);
    }

    let changed = false;
    let { type } = input;

    if (
      (type === 'th' || type === 'tableCellHeader') &&
      !editor.read.schema.element(type) &&
      tableCellType
    ) {
      if (Object.hasOwn(input, 'header') && input.header !== true) {
        throw new Error(
          `Legacy table header at ${location} conflicts with header "${String(input.header)}".`
        );
      }
      type = tableCellType;
      changed = true;
    } else {
      const migratedType = typeMigrations.get(type);

      if (migratedType) {
        type = migratedType;
        changed = true;
      }
    }

    const children = input.children.map((child, index) => {
      const migrated = migrateDescendant(
        child,
        `${location}.children.${index}`,
        type
      );

      if (migrated !== child) changed = true;

      return migrated;
    });
    let element: Element = changed ? { ...input, children, type } : input;

    if (
      (input.type === 'th' || input.type === 'tableCellHeader') &&
      type === tableCellType &&
      element.header !== true
    ) {
      element = { ...element, header: true };
    }

    if (
      Object.hasOwn(element, 'align') &&
      firstPartyElementTypes.has(element.type) &&
      !ownsProperty('align', 'element', element.type)
    ) {
      if (Object.hasOwn(element, 'textAlign')) {
        throw new Error(
          `Plate v53 migration collision at ${location}: properties "align" and "textAlign" are both present.`
        );
      }
      const { align, ...properties } = element;

      element = { ...properties, textAlign: align };
    }

    const legacyHeading = LEGACY_HEADING_TYPE_RE.exec(input.type);

    if (headingType && element.type === headingType && legacyHeading) {
      const level = Number(legacyHeading[1]);

      if (Object.hasOwn(element, 'level') && element.level !== level) {
        throw new Error(
          `Plate v53 migration collision at ${location}: heading "${input.type}" conflicts with level "${String(element.level)}".`
        );
      }
      if (element.level !== level) element = { ...element, level };
    }

    if (codeBlockType && element.type === codeBlockType) {
      element = renameElementProperty(element, 'lang', 'language', location);
    }

    if (tableType && element.type === tableType) {
      element = renameElementProperty(
        element,
        'colSizes',
        'columnWidths',
        location
      );

      if (!Object.hasOwn(element, 'columnWidths')) {
        const rows = input.children.filter((child): child is Element =>
          ElementApi.isElement(child)
        );
        const widths: Array<number | undefined> = [];
        const occupiedRows: number[] = [];
        let columnCount = 0;

        rows.forEach((row, rowIndex) => {
          if (rowIndex > 0) {
            occupiedRows.forEach((remaining, index) => {
              occupiedRows[index] = Math.max(0, remaining - 1);
            });
          }

          let column = 0;

          row.children.forEach((cell) => {
            if (!ElementApi.isElement(cell)) return;

            const columnSpan =
              typeof cell.colSpan === 'number' &&
              Number.isSafeInteger(cell.colSpan) &&
              cell.colSpan > 0
                ? cell.colSpan
                : 1;
            while (
              Array.from(
                { length: columnSpan },
                (_, offset) => occupiedRows[column + offset] ?? 0
              ).some((remaining) => remaining > 0)
            ) {
              column += 1;
            }
            const rowSpan =
              typeof cell.rowSpan === 'number' &&
              Number.isSafeInteger(cell.rowSpan) &&
              cell.rowSpan > 0
                ? cell.rowSpan
                : 1;
            const size =
              !ownsTableCellSize &&
              typeof cell.size === 'number' &&
              Number.isFinite(cell.size)
                ? cell.size
                : undefined;
            const spanIndices = Array.from(
              { length: columnSpan },
              (_, offset) => column + offset
            );
            const unknownIndices = spanIndices.filter(
              (index) => widths[index] === undefined
            );
            const knownWidth = spanIndices.reduce(
              (total, index) => total + (widths[index] ?? 0),
              0
            );
            const unknownWidth =
              size !== undefined && unknownIndices.length > 0
                ? Math.max(0, size - knownWidth) / unknownIndices.length
                : undefined;

            for (const index of spanIndices) {
              if (unknownWidth !== undefined && widths[index] === undefined) {
                widths[index] = unknownWidth;
              }
              if (rowSpan > 1) {
                occupiedRows[index] = Math.max(
                  occupiedRows[index] ?? 0,
                  rowSpan
                );
              }
            }

            column += columnSpan;
            columnCount = Math.max(columnCount, column);
          });
        });
        widths.length = columnCount;
        const normalizedWidths = Array.from(
          { length: columnCount },
          (_, index) => widths[index]
        );

        if (normalizedWidths.some((width) => width !== undefined)) {
          element = {
            ...element,
            columnWidths: normalizedWidths.map((width) => width ?? 0),
          };
        }
      }
    }

    if (tableRowType && element.type === tableRowType) {
      element = renameElementProperty(element, 'size', 'height', location);
    }

    if (tableCellType && element.type === tableCellType) {
      element = renameElementProperty(
        element,
        'background',
        'backgroundColor',
        location
      );

      if (Object.hasOwn(element, 'borders')) {
        const borders = Reflect.get(element, 'borders');

        if (
          typeof borders !== 'object' ||
          borders === null ||
          Array.isArray(borders)
        ) {
          throw new Error(
            `Legacy table borders at ${location}.borders must be an object.`
          );
        }

        let bordersChanged = false;
        const nextBorders = Object.fromEntries(
          Object.entries(borders).map(([direction, border]) => {
            if (
              typeof border !== 'object' ||
              border === null ||
              Array.isArray(border) ||
              !Object.hasOwn(border, 'size')
            ) {
              return [direction, border];
            }
            if (Object.hasOwn(border, 'width')) {
              throw new Error(
                `Plate v53 migration collision at ${location}.borders.${direction}: properties "size" and "width" are both present.`
              );
            }

            const { size, ...rest } = border as Record<string, unknown>;

            bordersChanged = true;

            return [direction, { ...rest, width: size }];
          })
        );

        if (bordersChanged) element = { ...element, borders: nextBorders };
      }

      if (Object.hasOwn(element, 'size') && !ownsTableCellSize) {
        const { size: _size, ...withoutSize } = element;

        element = withoutSize;
      }
    }

    if (
      ownsProperty('listType', 'element', element.type) &&
      Object.hasOwn(element, 'listStyleType') &&
      !ownsProperty('listStyleType', 'element', element.type)
    ) {
      const legacyStyle = Reflect.get(element, 'listStyleType');

      if (typeof legacyStyle !== 'string') {
        throw new Error(
          `Legacy list style at ${location}.listStyleType must be a string.`
        );
      }

      const bulletedStyles = new Set([
        'circle',
        'disc',
        'disclosure-closed',
        'disclosure-open',
        'square',
      ]);
      const listType =
        legacyStyle === 'todo'
          ? 'task'
          : bulletedStyles.has(legacyStyle)
            ? 'bulleted'
            : 'numbered';
      const listStyle =
        legacyStyle === 'todo' ||
        legacyStyle === 'disc' ||
        legacyStyle === 'decimal'
          ? undefined
          : legacyStyle;
      const equivalentDefaultStyle =
        legacyStyle === 'decimal'
          ? 'decimal'
          : legacyStyle === 'disc'
            ? 'disc'
            : undefined;

      if (Object.hasOwn(element, 'listType') && element.listType !== listType) {
        throw new Error(
          `Plate v53 migration collision at ${location}: listStyleType "${legacyStyle}" conflicts with listType "${String(element.listType)}".`
        );
      }
      if (
        Object.hasOwn(element, 'listStyle') &&
        element.listStyle !== undefined &&
        element.listStyle !== (listStyle ?? equivalentDefaultStyle)
      ) {
        throw new Error(
          `Plate v53 migration collision at ${location}: listStyleType "${legacyStyle}" conflicts with listStyle "${formatMigrationValue(element.listStyle)}".`
        );
      }

      const restart = Object.hasOwn(element, 'listRestart')
        ? Reflect.get(element, 'listRestart')
        : undefined;
      const restartPolite = Object.hasOwn(element, 'listRestartPolite')
        ? Reflect.get(element, 'listRestartPolite')
        : undefined;
      const derivedStart = Object.hasOwn(element, 'listStart')
        ? Reflect.get(element, 'listStart')
        : undefined;

      if (
        restart !== undefined &&
        (typeof restart !== 'number' || !Number.isFinite(restart))
      ) {
        throw new Error(
          `Legacy list restart at ${location} must be a finite number.`
        );
      }
      if (
        restartPolite !== undefined &&
        (typeof restartPolite !== 'number' || !Number.isFinite(restartPolite))
      ) {
        throw new Error(
          `Legacy polite list restart at ${location} must be a finite number.`
        );
      }
      if (
        derivedStart !== undefined &&
        (typeof derivedStart !== 'number' || !Number.isFinite(derivedStart))
      ) {
        throw new Error(
          `Legacy list start at ${location} must be a finite number.`
        );
      }
      const listRestart =
        restart !== undefined && restart !== 0 ? restart : undefined;
      const listStart =
        listRestart === undefined &&
        restartPolite !== undefined &&
        restartPolite !== 0
          ? restartPolite
          : undefined;

      legacyListLocations.set(location, {
        derivedStart:
          typeof derivedStart === 'number' ? derivedStart : undefined,
      });

      const {
        listRestart: _listRestart,
        listRestartPolite: _listRestartPolite,
        listStart: _listStart,
        listStyle: _listStyle,
        listStyleType: _listStyleType,
        ...withoutLegacyList
      } = element;
      const next = {
        ...withoutLegacyList,
        listType,
        ...(listStyle === undefined ? {} : { listStyle }),
        ...(listType === 'numbered' && listRestart !== undefined
          ? { listRestart }
          : {}),
        ...(listType === 'numbered' && listStart !== undefined
          ? { listStart }
          : {}),
      };

      if (
        listType !== 'numbered' &&
        (Object.hasOwn(next, 'listRestart') || Object.hasOwn(next, 'listStart'))
      ) {
        const {
          listRestart: inner_listRestart,
          listStart: inner_listStart,
          ...withoutStart
        } = next;

        element = withoutStart;
      } else {
        element = next;
      }
    }

    if (imageType && element.type === imageType) {
      element = renameElementProperty(
        element,
        'initialHeight',
        'naturalHeight',
        location
      );
      element = renameElementProperty(
        element,
        'initialWidth',
        'naturalWidth',
        location
      );
    }

    if (
      mediaTypes.has(element.type) &&
      Object.hasOwn(element, 'isUpload') &&
      !ownsProperty('isUpload', 'element', element.type)
    ) {
      const isUpload = Reflect.get(element, 'isUpload');

      if (typeof isUpload !== 'boolean') {
        throw new Error(
          `Legacy media isUpload at ${location} must be a boolean.`
        );
      }
      if (
        isUpload &&
        videoType &&
        element.type === videoType &&
        Object.hasOwn(element, 'provider') &&
        element.provider !== 'file'
      ) {
        throw new Error(
          `Plate v53 migration collision at ${location}: isUpload conflicts with provider "${String(element.provider)}".`
        );
      }

      const { isUpload: _isUpload, ...withoutUpload } = element;

      element =
        isUpload && videoType && element.type === videoType
          ? { ...withoutUpload, provider: 'file' }
          : withoutUpload;
    }

    if (!mediaTypes.has(element.type)) return element;

    const removePlaceholder =
      Object.hasOwn(element, 'placeholderId') &&
      !ownsProperty('placeholderId', 'element', element.type);

    if (!Object.hasOwn(element, 'url') || removePlaceholder) {
      let properties = element;

      if (removePlaceholder) {
        const { placeholderId: _placeholderId, ...withoutPlaceholder } =
          properties;

        properties = withoutPlaceholder;
      }

      element = {
        ...properties,
        ...(Object.hasOwn(element, 'url') ? {} : { url: '' }),
      };
    }
    if (
      !Object.hasOwn(element, 'caption') ||
      ownsProperty('caption', 'element', element.type)
    ) {
      return element;
    }

    const legacyCaption = Reflect.get(element, 'caption');

    if (!Array.isArray(legacyCaption)) {
      throw new Error(`Legacy media caption at ${location} must be an array.`);
    }

    const isInlineCaptionChild = (child: Descendant) =>
      TextApi.isText(child) ||
      (ElementApi.isElement(child) && editor.read.schema.isInline(child));
    const direct = element.children;
    const migratedLegacy = legacyCaption.map((child, index) =>
      migrateDescendant(child, `${location}.caption.${index}`, element.type)
    );
    let legacy: Descendant[];

    if (migratedLegacy.every(isInlineCaptionChild)) {
      legacy = migratedLegacy;
    } else if (
      migratedLegacy.length === 1 &&
      ElementApi.isElement(migratedLegacy[0]) &&
      migratedLegacy[0].children.every(isInlineCaptionChild)
    ) {
      legacy = [...migratedLegacy[0].children];
    } else {
      throw new Error(
        `Legacy media caption at ${location} must contain inline content or one block wrapper.`
      );
    }
    if (!direct.every(isInlineCaptionChild)) {
      throw new Error(
        `Media caption at ${location}.children must contain inline content.`
      );
    }

    const nonEmptySources = [direct, legacy].filter(
      (source) => !isAbsentCaption(source)
    );

    if (nonEmptySources.length > 1) {
      throw new Error(
        `Media element at ${location} has multiple non-empty caption sources.`
      );
    }

    const { caption: _caption, ...migratedElement } = element;

    return {
      ...migratedElement,
      children: nonEmptySources[0] ?? [{ text: '' }],
    };
  };

  const normalizeMigratedListChildren = (
    inputChildren: Value,
    location: string
  ): Value => {
    const getNodeAtPath = (path: Path): Descendant | undefined => {
      let children: readonly Descendant[] = inputChildren;
      let node: Descendant | undefined;

      for (const index of path) {
        node = children[index];
        if (!node) return undefined;
        children = ElementApi.isElement(node) ? node.children : [];
      }

      return node;
    };
    const state: MigrationListSiblingState = {
      nodes: {
        get: ((
          path: Path,
          options?: {
            match?: (node: Descendant, path: Path) => boolean;
          }
        ) => {
          const node = getNodeAtPath(path);

          if (!node || (options?.match && !options.match(node, path))) {
            return undefined;
          }

          return [node, path];
        }) as EditorCoreStateView['nodes']['get'],
      },
    };
    const getListIndent = (element: Element) =>
      typeof element.indent === 'number' ? element.indent : 1;
    const getListStyle = (element: Element) =>
      (element.listType === 'numbered' && element.listStyle === 'decimal') ||
      (element.listType === 'bulleted' && element.listStyle === 'disc')
        ? undefined
        : element.listStyle;
    const isHeading = (element: Element) =>
      headingType !== undefined && element.type === headingType;
    const getPreviousEntry =
      configuredListSiblingOptions?.getPreviousEntry ??
      (([, path]: NodeEntry<Element>) => {
        if (!PathApi.hasPrevious(path)) return undefined;

        return state.nodes.get(PathApi.previous(path), {
          match: ElementApi.isElement,
        });
      });
    const getPreviousListEntry = (
      entry: NodeEntry<Element>
    ): NodeEntry<Element> | undefined => {
      const {
        breakOnEqIndentNeqList = true,
        breakOnLowerIndent = true,
        breakQuery,
        eqIndent = true,
        query,
      } = configuredListSiblingOptions ?? {};
      const [element] = entry;
      const indent = getListIndent(element);
      let previous = getPreviousEntry(entry, state);

      while (previous) {
        const [previousElement] = previous;
        const previousIndent = getListIndent(previousElement);
        const sameSequence =
          previousElement.listType === element.listType &&
          getListStyle(previousElement) === getListStyle(element);

        if (
          (previousIndent === indent &&
            sameSequence &&
            isHeading(previousElement) !== isHeading(element)) ||
          breakQuery?.(previousElement, element)
        ) {
          return undefined;
        }
        if (breakOnLowerIndent && previousIndent < indent) return undefined;
        if (
          breakOnEqIndentNeqList &&
          previousIndent === indent &&
          !sameSequence
        ) {
          return undefined;
        }
        if (
          sameSequence &&
          isHeading(previousElement) === isHeading(element) &&
          (!query || query(previousElement, element)) &&
          (!eqIndent || previousIndent === indent)
        ) {
          return previous;
        }

        previous = getPreviousEntry(previous, state);
      }

      return undefined;
    };
    let changed = false;
    const normalizeDescendant = (
      descendant: Descendant,
      path: Path,
      descendantLocation: string
    ): Descendant => {
      if (!ElementApi.isElement(descendant)) return descendant;

      const normalizedChildren = descendant.children.map((child, index) =>
        normalizeDescendant(
          child,
          [...path, index],
          `${descendantLocation}.children.${index}`
        )
      );
      const childrenChanged = normalizedChildren.some(
        (child, index) => child !== descendant.children[index]
      );
      let element = childrenChanged
        ? ({ ...descendant, children: normalizedChildren } as Element)
        : descendant;
      const metadata = legacyListLocations.get(descendantLocation);

      if (
        metadata &&
        element.listType === 'numbered' &&
        metadata.derivedStart !== undefined &&
        metadata.derivedStart !== 1 &&
        !Object.hasOwn(element, 'listRestart') &&
        !Object.hasOwn(element, 'listStart') &&
        getPreviousListEntry([descendant, path]) === undefined
      ) {
        element = { ...element, listStart: metadata.derivedStart };
      }

      if (element !== descendant) changed = true;

      return element;
    };
    const normalized = inputChildren.map((child, index) =>
      normalizeDescendant(child, [index], `${location}.${index}`)
    ) as Value;

    return changed ? normalized : inputChildren;
  };

  const migrateChildren = (children: Value, location: string): Value => {
    let changed = false;
    const next = children.map((child, index) => {
      const migrated = migrateDescendant(child, `${location}.${index}`);

      if (migrated !== child) changed = true;

      return migrated;
    }) as Value;
    const normalized = normalizeMigratedListChildren(next, location);

    return changed || normalized !== next ? normalized : children;
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
