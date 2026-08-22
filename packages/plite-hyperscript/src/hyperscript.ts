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
  type HyperscriptAttributes,
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
  (tagName: string, attributes: HyperscriptAttributes, children: any[]) => T
>;

/**
 * `HyperscriptShorthands` are dictionaries of properties applied to specific
 * object kinds, keyed by tag name. Use them to define domain-specific fixture
 * tags.
 */

type HyperscriptShorthands = Record<string, HyperscriptAttributes>;

type HyperscriptElementCreators<TElements extends HyperscriptShorthands> = {
  [TKey in keyof TElements]: HyperscriptCreators<Element>[string];
};

const stripJsxDevelopmentAttributes = (
  attributes: object
): HyperscriptAttributes => {
  const normalized = Object.fromEntries(Object.entries(attributes));

  delete normalized.__self;
  delete normalized.__source;

  return normalized;
};

/**
 * Create a Plite hyperscript factory with optional custom creators and element
 * shorthands.
 */

const createHyperscript = <
  const TCreators extends HyperscriptCreators = {},
  const TElements extends HyperscriptShorthands = {},
>(options?: {
  creators?: TCreators;
  elements?: TElements;
}) => {
  const elementCreators = normalizeElements(options?.elements);
  // Object.assign preserves generic custom creator keys in the inferred factory type.

  const creators = Object.assign(
    {},
    DEFAULT_CREATORS,
    elementCreators,
    options?.creators
  );

  const jsx = createFactory(creators);
  return jsx;
};

/**
 * Create the callable JSX factory from a normalized creator map.
 */

const createFactory = <T extends HyperscriptCreators>(creators: T) => {
  const jsx = <S extends keyof T & string>(
    tagName: S,
    attributes?: object,
    ...children: any[]
  ): ReturnType<T[S]> => {
    const creator = creators[tagName];

    if (!creator) {
      throw new Error(`No hyperscript creator found for tag: <${tagName}>`);
    }

    let normalizedAttributes: HyperscriptAttributes = {};
    let normalizedChildren = children;

    if (attributes != null) {
      if (!isObject(attributes)) {
        normalizedChildren = [attributes].concat(normalizedChildren);
      } else {
        normalizedAttributes = stripJsxDevelopmentAttributes(attributes);
      }
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

const normalizeElements = <TElements extends HyperscriptShorthands>(
  elements: TElements | undefined
): HyperscriptElementCreators<TElements> => {
  const creators: HyperscriptCreators<Element> = {};

  if (!elements) {
    return creators as HyperscriptElementCreators<TElements>;
  }

  for (const tagName in elements) {
    if (!Object.hasOwn(elements, tagName)) continue;
    const props = elements[tagName];

    if (typeof props !== 'object') {
      throw new Error(
        `Properties specified for a hyperscript shorthand should be an object, but for the custom element <${tagName}> tag you passed: ${String(props)}`
      );
    }

    creators[tagName] = (
      _tagName: string,
      attributes: HyperscriptAttributes,
      children: any[]
    ) => createElement('element', { ...props, ...attributes }, children);
  }

  return creators as HyperscriptElementCreators<TElements>;
};

export {
  createHyperscript,
  type HyperscriptCreators,
  type HyperscriptShorthands,
};
