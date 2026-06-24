import { type Element, createEditor as makeEditor } from '@platejs/plite';
import { isObject } from '@platejs/plite/internal';
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

/**
 * The default creators for Plite objects.
 */

const DEFAULT_CREATORS = {
  anchor: createAnchor,
  cursor: createCursor,
  editor: createEditor(makeEditor),
  element: createElement,
  focus: createFocus,
  fragment: createFragment,
  selection: createSelection,
  text: createText,
};

/**
 * `HyperscriptCreators` are dictionaries of `HyperscriptCreator` functions
 * keyed by tag name.
 */

type HyperscriptCreators<T = any> = Record<
  string,
  (tagName: string, attributes: { [key: string]: any }, children: any[]) => T
>;

/**
 * `HyperscriptShorthands` are dictionaries of properties applied to specific
 * object kinds, keyed by tag name. Use them to define domain-specific fixture
 * tags.
 */

type HyperscriptShorthands = Record<string, Record<string, any>>;

/**
 * Create a Plite hyperscript factory with optional custom creators and element
 * shorthands.
 */

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

  const jsx = createFactory(creators);
  return jsx;
};

/**
 * Create the callable JSX factory from a normalized creator map.
 */

const createFactory = <T extends HyperscriptCreators>(creators: T) => {
  const jsx = <S extends keyof T & string>(
    tagName: S,
    attributes?: Object,
    ...children: any[]
  ): ReturnType<T[S]> => {
    const creator = creators[tagName];

    if (!creator) {
      throw new Error(`No hyperscript creator found for tag: <${tagName}>`);
    }

    let normalizedAttributes = attributes ?? {};
    let normalizedChildren = children;

    if (!isObject(normalizedAttributes)) {
      normalizedChildren = [normalizedAttributes].concat(normalizedChildren);
      normalizedAttributes = {};
    }

    normalizedChildren = normalizedChildren
      .filter((child) => child != null && child !== false)
      .flat();
    const ret = creator(tagName, normalizedAttributes, normalizedChildren);
    return ret;
  };

  return jsx;
};

/**
 * Normalize a dictionary of element shorthands into creator functions.
 */

const normalizeElements = (elements: HyperscriptShorthands) => {
  const creators: HyperscriptCreators<Element> = {};

  for (const tagName in elements) {
    if (!Object.hasOwn(elements, tagName)) continue;
    const props = elements[tagName];

    if (typeof props !== 'object') {
      throw new Error(
        `Properties specified for a hyperscript shorthand should be an object, but for the custom element <${tagName}> tag you passed: ${props}`
      );
    }

    creators[tagName] = (
      tagName: string,
      attributes: { [key: string]: any },
      children: any[]
    ) => createElement('element', { ...props, ...attributes }, children);
  }

  return creators;
};

export {
  createHyperscript,
  type HyperscriptCreators,
  type HyperscriptShorthands,
};
