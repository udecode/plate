import type { Element } from '@platejs/plite';

import {
  createAnchor,
  createCursor,
  createEditor,
  createElement,
  createFocus,
  createFragment,
  createSelection,
  createText,
} from './creators';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

const DEFAULT_CREATORS = {
  anchor: createAnchor,
  cursor: createCursor,
  editor: createEditor(),
  element: createElement,
  focus: createFocus,
  fragment: createFragment,
  selection: createSelection,
  text: createText,
};

export type HyperscriptCreators<T = any> = Record<
  string,
  (tagName: string, attributes: Record<string, any>, children: any[]) => T
>;

export type HyperscriptShorthands = Record<string, Record<string, any>>;

const createHyperscript = (
  options: {
    creators?: HyperscriptCreators;
    elements?: HyperscriptShorthands;
  } = {}
) => {
  const { elements = {} } = options;
  const elementCreators = normalizeElements(elements);
  const creators = {
    ...DEFAULT_CREATORS,
    ...elementCreators,
    ...options.creators,
  };

  return createFactory(creators);
};

const createFactory = <T extends HyperscriptCreators>(creators: T) => {
  const jsx = <S extends keyof T & string>(
    tagName: S,
    attributes?: object,
    ...children: any[]
  ): ReturnType<T[S]> => {
    let attrs = attributes;
    let kids = children;

    for (const key in attrs) {
      if (key.startsWith('__')) {
        delete (attrs as any)[key];
      }
    }

    const creator = creators[tagName];

    if (!creator) {
      throw new Error(`No hyperscript creator found for tag: <${tagName}>`);
    }
    if (attrs == null) {
      attrs = {};
    }
    if (!isPlainObject(attrs)) {
      kids = [attrs].concat(kids);
      attrs = {};
    }

    kids = kids.filter(Boolean).flat();

    return creator(tagName, attrs, kids);
  };

  return jsx;
};

const normalizeElements = (elements: HyperscriptShorthands) => {
  const creators: HyperscriptCreators<Element> = {};

  for (const tagName in elements) {
    if (!Object.hasOwn(elements, tagName)) continue;

    const props = elements[tagName];

    if (typeof props !== 'object') {
      throw new TypeError(
        `Properties specified for a hyperscript shorthand should be an object, but for the custom element <${tagName}>  tag you passed: ${props}`
      );
    }

    creators[tagName] = (
      _tagName: string,
      attributes: Record<string, any>,
      children: any[]
    ) => {
      for (const key in attributes) {
        if (key.startsWith('__')) {
          delete attributes[key];
        }
      }

      return createElement('element', { ...props, ...attributes }, children);
    };
  }

  return creators;
};

export { createHyperscript };
