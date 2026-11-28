import {
  applyCssDeclaration,
  findLastTopLevelBang,
  FONT_LONGHANDS,
  LIST_STYLE_LONGHANDS,
  normalizeCssPropertyName,
  parseCssDeclarationsInto,
  serializeCssEntries,
  stripCommentsAndSplitDeclarations,
  type StyleEntry,
} from './serverCssParser.internal';

const INDEX_KEY_RE = /^(?:0|[1-9]\d*)$/;

const camelToKebab = (property: string): string => {
  if (property === 'cssFloat' || property === 'float') return 'float';
  if (property.startsWith('--')) return property;

  return property.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};

const readBoxShorthand = (
  entries: ReadonlyMap<string, StyleEntry>,
  prefix: 'margin' | 'padding'
): StyleEntry | undefined => {
  const top = entries.get(`${prefix}-top`);
  const right = entries.get(`${prefix}-right`);
  const bottom = entries.get(`${prefix}-bottom`);
  const left = entries.get(`${prefix}-left`);

  if (
    !top ||
    !right ||
    !bottom ||
    !left ||
    top.important !== right.important ||
    top.important !== bottom.important ||
    top.important !== left.important
  ) {
    return undefined;
  }

  const { important } = top;

  if (
    top.value === right.value &&
    top.value === bottom.value &&
    top.value === left.value
  ) {
    return { important, value: top.value };
  }
  if (top.value === bottom.value && right.value === left.value) {
    return { important, value: `${top.value} ${right.value}` };
  }
  if (right.value === left.value) {
    return { important, value: `${top.value} ${right.value} ${bottom.value}` };
  }

  return {
    important,
    value: `${top.value} ${right.value} ${bottom.value} ${left.value}`,
  };
};

const readPropertyEntry = (
  entries: ReadonlyMap<string, StyleEntry>,
  name: string
): StyleEntry | undefined => {
  const direct = entries.get(name);

  if (direct) return direct;
  if (name === 'background') return entries.get('background-color');
  if (name === 'margin' || name === 'padding') {
    return readBoxShorthand(entries, name);
  }

  return undefined;
};

const removeShorthandOrLonghand = (
  entries: Map<string, StyleEntry>,
  name: string
): string => {
  const previous = readPropertyEntry(entries, name)?.value ?? '';

  if (name === 'font') {
    entries.delete('font');
    for (const longhand of FONT_LONGHANDS) entries.delete(longhand);

    return previous;
  }
  if (name === 'margin' || name === 'padding') {
    for (const side of ['top', 'right', 'bottom', 'left'] as const) {
      entries.delete(`${name}-${side}`);
    }

    return previous;
  }
  if (name === 'margin-inline' || name === 'padding-inline') {
    entries.delete(`${name}-start`);
    entries.delete(`${name}-end`);

    return previous;
  }
  if (name === 'list-style') {
    for (const longhand of LIST_STYLE_LONGHANDS) entries.delete(longhand);

    return previous;
  }
  if (name === 'background') {
    entries.delete('background');
    entries.delete('background-color');

    return previous;
  }

  entries.delete(name);

  return previous;
};

const createServerCssStyleDeclaration = (
  element: Element
): CSSStyleDeclaration => {
  const entries = new Map<string, StyleEntry>();
  let lastRaw: string | null | undefined;

  const syncFromAttribute = () => {
    const raw = element.getAttribute('style');

    if (raw === lastRaw) return;
    if (raw) parseCssDeclarationsInto(raw, entries);
    else entries.clear();
    lastRaw = raw;
  };

  const flushToAttribute = () => {
    const serialized = serializeCssEntries(entries);

    if (serialized || element.hasAttribute('style')) {
      element.setAttribute('style', serialized);
      lastRaw = element.getAttribute('style');
    } else {
      lastRaw = null;
    }
  };

  const getKeys = () => {
    syncFromAttribute();

    return [...entries.keys()];
  };

  const declaration = {
    get cssText(): string {
      syncFromAttribute();

      return serializeCssEntries(entries);
    },
    set cssText(value: string) {
      parseCssDeclarationsInto(String(value ?? ''), entries);
      flushToAttribute();
    },
    getPropertyPriority(property: string): string {
      syncFromAttribute();
      const name = normalizeCssPropertyName(property);

      return name && readPropertyEntry(entries, name)?.important
        ? 'important'
        : '';
    },
    getPropertyValue(property: string): string {
      syncFromAttribute();
      const name = normalizeCssPropertyName(property);

      return name ? (readPropertyEntry(entries, name)?.value ?? '') : '';
    },
    item(index: number): string {
      const keys = getKeys();

      return index >= 0 && index < keys.length ? (keys[index] ?? '') : '';
    },
    get length(): number {
      syncFromAttribute();

      return entries.size;
    },
    removeProperty(property: string): string {
      syncFromAttribute();
      const name = normalizeCssPropertyName(property);

      if (!name) return '';
      const previous = removeShorthandOrLonghand(entries, name);

      flushToAttribute();

      return previous;
    },
    setProperty(
      property: string,
      value: string | null,
      priority?: string
    ): void {
      syncFromAttribute();
      const name = normalizeCssPropertyName(property);

      if (!name) return;

      const text = value == null ? '' : String(value).trim();

      if (!text) {
        removeShorthandOrLonghand(entries, name);
        flushToAttribute();

        return;
      }

      const parts = stripCommentsAndSplitDeclarations(text);

      if (parts.length !== 1) return;

      const cleaned = parts[0].trim();

      if (
        !cleaned ||
        (!name.startsWith('--') && findLastTopLevelBang(cleaned) !== -1)
      ) {
        return;
      }

      const priorityText = priority
        ? String(priority).trim().toLowerCase()
        : '';

      if (priorityText && priorityText !== 'important') return;

      applyCssDeclaration(
        entries,
        name,
        cleaned,
        priorityText === 'important',
        true
      );
      flushToAttribute();
    },
    [Symbol.iterator](): IterableIterator<string> {
      return getKeys()[Symbol.iterator]();
    },
    toString(): string {
      syncFromAttribute();

      return serializeCssEntries(entries);
    },
  };

  return new Proxy(declaration, {
    get(target, property, receiver) {
      if (typeof property === 'symbol' || property in target) {
        return Reflect.get(target, property, receiver);
      }
      if (INDEX_KEY_RE.test(property)) {
        return getKeys()[Number(property)];
      }

      return target.getPropertyValue(camelToKebab(property));
    },
    set(target, property, value, receiver) {
      if (typeof property === 'symbol' || property === 'cssText') {
        return Reflect.set(target, property, value, receiver);
      }
      target.setProperty(
        camelToKebab(property),
        value == null ? '' : String(value)
      );

      return true;
    },
  }) as unknown as CSSStyleDeclaration;
};

const attachServerCssStyle = (element: Element) => {
  let styleDeclaration: CSSStyleDeclaration | undefined;

  Object.defineProperty(element, 'style', {
    configurable: true,
    enumerable: true,
    get() {
      styleDeclaration ??= createServerCssStyleDeclaration(element);

      return styleDeclaration;
    },
    set(value: string) {
      styleDeclaration ??= createServerCssStyleDeclaration(element);
      styleDeclaration.cssText = value;
    },
  });
};

type ElementFactoryDocument = {
  body: HTMLElement | null;
  createElement: (
    tagName: string,
    options?: ElementCreationOptions
  ) => HTMLElement;
  createElementNS?: (
    namespace: string | null,
    qualifiedName: string,
    options?: ElementCreationOptions
  ) => Element;
  documentElement: HTMLElement | null;
  head: HTMLElement | null;
};

const patchElementFactories = (doc: ElementFactoryDocument) => {
  for (const element of [doc.documentElement, doc.head, doc.body]) {
    if (element) attachServerCssStyle(element);
  }

  const originalCreateElement = doc.createElement.bind(doc);

  doc.createElement = (tagName, options) => {
    const element = originalCreateElement(tagName, options);

    attachServerCssStyle(element);

    return element;
  };

  if (typeof doc.createElementNS === 'function') {
    const originalCreateElementNS = doc.createElementNS.bind(doc);

    doc.createElementNS = (namespace, qualifiedName, options) => {
      const element = originalCreateElementNS(
        namespace,
        qualifiedName,
        options
      );

      attachServerCssStyle(element);

      return element;
    };
  }
};

export const installServerCssStyles = (document: Document): Document => {
  patchElementFactories(document);

  return document;
};
