import {
  ContentSlice,
  ElementApi,
  TextApi,
  type Descendant,
  type DescendantIn,
  type EditorCoreStateView,
  type EditorStateSchemaApi,
  type Element as PliteElement,
  type PropertyValueDescriptor,
  type SchemaProperty,
  type SchemaTarget,
  type Text,
  type Value,
} from '@platejs/plite';
import type {
  HostCodec,
  HostCodecParseContext,
  HostCodecSerializeContext,
} from '@platejs/plite-dom';
import { parseDOMClipboardHtml } from '@platejs/plite-dom/internal';
import {
  failInvariant,
  getCompiledEditorSchemaFromApi,
  getCompiledSchemaPropertyId,
  reportEditorLifecycleError,
  toEditorCoreStateView,
} from '@platejs/plite/internal';
import isEqual from 'lodash/isEqual.js';

import {
  getCompiledPlateModel,
  getCompiledPlatePlugin,
  getCompiledPlatePluginList,
  hasCompiledPlatePluginCandidate,
  type CompiledPlateModel,
  type CompiledPlateModelBinding,
} from '../../../internal/plugin/compilePlateModel';
import { getPluginStore } from '../../../internal/plugin/pluginStore';
import {
  getHtmlCodecSchemaFamilies,
  getPluginDescriptorMetadata,
  getPluginSchemaFamily,
} from '../../../internal/utils/mergePlugins';
import type { BaseEditor } from '../../editor';
import type {
  AnyBasePlugin,
  AnyBasePluginDefinition,
  DefinitionOf,
  ErasedPluginCallable,
  HtmlContentToken,
  HtmlMatcher,
  HtmlCodecHooks,
  HtmlParserOptions,
  HtmlPluginContext,
  HtmlPluginRegistry,
  PluginReference,
} from '../../plugin';
import { defineBasePlugin } from '../../plugin';
import { createPluginContext } from '../../plugin/createPluginContext.internal';
import { isHtmlBlockElement, isHtmlElement, isHtmlText } from './htmlDom';

type HtmlRuleDeclaration = Readonly<{
  createsElement?: true;
  decode: (context: {
    element: HTMLElement;
    state: EditorCoreStateView;
  }) => unknown;
  decodeOnly?: true;
  encode?: (context: Record<string, unknown>) => unknown;
  match: readonly HtmlMatcher[];
  priority?: number;
}>;

type CompiledHtmlProperty = Readonly<{
  id: string;
  key: string;
  property: SchemaProperty;
}>;

type CompiledHtmlRule = Readonly<{
  createsElement: boolean;
  declaration: HtmlRuleDeclaration;
  kind: 'element' | 'element-property' | 'mark';
  owner: string;
  properties: readonly CompiledHtmlProperty[];
  rulePriority: number;
  targetType: string | null;
}>;

type MutableHtmlNode = {
  attributeWrites: Map<string, boolean | number | string | null>;
  children: Array<
    HtmlContentToken | MutableHtmlNode | Readonly<{ text: string }>
  >;
  patchTarget: boolean;
  styleWrites: Map<string, number | string | null>;
  tag: string;
};

type CompiledHtmlMatcherIndex = Readonly<{
  attributes: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
  classes: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
  styles: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
  tags: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
}>;

type CompiledHtmlSerializerIndex = Readonly<{
  elementPropertiesByType: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
  elementsByType: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
  encodablePropertyIds: ReadonlySet<string>;
  marksByParentType: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
}>;

const HTML_FORMAT = 'text/html';
const HTML_HOST_KEY = 'plate:html';
const HTML_PLUGIN_NAME = 'html';
const HTML_CONTENT_TOKEN: HtmlContentToken = Object.freeze({
  __htmlContentToken: true,
});
const HTML_RULE_FIELDS = new Set([
  'createsElement',
  'decode',
  'decodeOnly',
  'encode',
  'match',
  'priority',
]);
const HTML_MATCHER_FIELDS = new Set([
  'attributes',
  'className',
  'style',
  'tag',
]);
const HTML_NODE_FIELDS = new Set([
  'attributes',
  'children',
  'patchTarget',
  'style',
  'tag',
]);
const HTML_PATCH_FIELDS = new Set(['attributes', 'children', 'style', 'tag']);
const HTML_WRAPPER_FIELDS = new Set(['attributes', 'style', 'tag']);
const HTML_VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const HTML_UNSAFE_TAGS = new Set([
  'base',
  'embed',
  'link',
  'meta',
  'object',
  'script',
  'style',
]);
const HTML_TAG_RE = /^[a-z][a-z0-9-]*$/;
const HTML_ATTRIBUTE_RE = /^[a-z_:][a-z0-9_.:-]*$/;
const HTML_URL_ATTRIBUTES = new Set([
  'action',
  'formaction',
  'href',
  'poster',
  'src',
  'xlink:href',
]);
const HTML_UNSAFE_URL_RE = /^(?:javascript|vbscript):/i;
const HTML_CLASS_WHITESPACE_RE = /\s/;
const HTML_STYLE_NAME_RE = /^(?:--[A-Za-z_][A-Za-z0-9_-]*|-?[a-z][a-z0-9-]*)$/;
const HTML_STYLE_URL_RE = /\burl *\(/gi;
const HTML_UNQUOTED_STYLE_URL_RE = /["'()\s]/;
const HTML_SAFE_IMAGE_DATA_URL_RE =
  /^data:image\/(?:avif|bmp|gif|jpeg|png|webp);base64,[a-z0-9+/]*={0,2}$/i;
const LEADING_WHITE_SPACE_RE = /^\s+/;
const TRAILING_NEWLINE_RE = /\n$/;

type CollapseWhiteSpaceState = {
  inlineFormattingContext: {
    atStart: boolean;
    lastHasTrailingWhiteSpace: boolean;
  } | null;
  whiteSpaceRule: 'normal' | 'pre' | 'pre-line';
};

export const htmlStringToDOMNode = (html: string) =>
  parseDOMClipboardHtml(html).body;

export const htmlTextNodeToString = (node: ChildNode | HTMLElement) => {
  if (!isHtmlText(node)) return undefined;
  if (node.parentElement?.dataset.platePreventDeserialization) return '';
  if (
    node.textContent === '\uFEFF' &&
    node.parentElement?.hasAttribute('data-plite-string')
  ) {
    return '';
  }

  return node.textContent || '';
};

export const htmlBrToNewLine = (node: ChildNode | HTMLElement) =>
  node.nodeName === 'BR' ? '\n' : undefined;

const collapseString = (
  text: string,
  {
    shouldCollapseWhiteSpace = true,
    trimEnd = 'collapse',
    trimStart = 'collapse',
    whiteSpaceIncludesNewlines = true,
  }: {
    shouldCollapseWhiteSpace?: boolean;
    trimEnd?: 'collapse' | 'single-newline';
    trimStart?: 'all' | 'collapse';
    whiteSpaceIncludesNewlines?: boolean;
  } = {}
) => {
  let result = text;

  if (trimStart === 'all') {
    result = result.replace(LEADING_WHITE_SPACE_RE, '');
  }
  if (trimEnd === 'single-newline') {
    result = result.replace(TRAILING_NEWLINE_RE, '');
  }
  if (shouldCollapseWhiteSpace) {
    if (whiteSpaceIncludesNewlines) {
      result = result.replaceAll(/\s+/g, ' ');
    } else {
      result = result
        .replaceAll(/[^\S\n\r]+/g, ' ')
        .replaceAll(/^[^\S\n\r]+/gm, '')
        .replaceAll(/[^\S\n\r]+$/gm, '');
    }
  }

  return result;
};

const inferWhiteSpaceRule = (
  element: HTMLElement
): CollapseWhiteSpaceState['whiteSpaceRule'] | null => {
  switch (element.style.whiteSpace) {
    case 'break-spaces':
    case 'pre':
    case 'pre-wrap': {
      return 'pre';
    }
    case 'normal':
    case 'nowrap': {
      return 'normal';
    }
    case 'pre-line': {
      return 'pre-line';
    }
  }

  if (element.tagName === 'PRE') return 'pre';
  if (element.style.whiteSpace === 'initial') return 'normal';

  return null;
};

const isLastNonEmptyText = (initialText: Node): boolean => {
  let currentNode: Node | null = initialText;

  while (true) {
    if (currentNode.nextSibling) {
      currentNode = currentNode.nextSibling;
    } else {
      currentNode = currentNode.parentElement;

      if (currentNode && isHtmlBlockElement(currentNode)) return true;

      currentNode = currentNode?.nextSibling || null;
    }

    if (!currentNode || isHtmlBlockElement(currentNode)) return true;
    if ((currentNode.textContent || '').length > 0) return false;
  }
};

const collapseWhiteSpaceNode = (node: Node, state: CollapseWhiteSpaceState) => {
  const collapseChildren = (parent: Node) => {
    Array.from(parent.childNodes).forEach((child) => {
      collapseWhiteSpaceNode(child, state);
    });
  };

  if (isHtmlElement(node)) {
    const element = node as HTMLElement;
    const isInlineElement = !isHtmlBlockElement(element);
    const previousWhiteSpaceRule = state.whiteSpaceRule;
    const inferredWhiteSpaceRule = inferWhiteSpaceRule(element);

    if (inferredWhiteSpaceRule) {
      state.whiteSpaceRule = inferredWhiteSpaceRule;
    }
    if (!isInlineElement) state.inlineFormattingContext = null;

    collapseChildren(element);

    if (!isInlineElement) state.inlineFormattingContext = null;

    state.whiteSpaceRule = previousWhiteSpaceRule;

    return;
  }

  if (isHtmlText(node)) {
    const textContent = node.textContent || '';
    const isWhiteSpaceOnly = textContent.trim() === '';

    if (state.inlineFormattingContext || !isWhiteSpaceOnly) {
      if (state.inlineFormattingContext) {
        state.inlineFormattingContext.atStart = false;
      } else {
        state.inlineFormattingContext = {
          atStart: true,
          lastHasTrailingWhiteSpace: false,
        };
      }
    }

    const { whiteSpaceRule } = state;
    const trimStart =
      whiteSpaceRule !== 'normal'
        ? 'collapse'
        : !state.inlineFormattingContext ||
            state.inlineFormattingContext.atStart ||
            state.inlineFormattingContext.lastHasTrailingWhiteSpace
          ? 'all'
          : 'collapse';
    const trimEnd =
      whiteSpaceRule === 'normal'
        ? 'collapse'
        : isLastNonEmptyText(node)
          ? 'single-newline'
          : 'collapse';
    const shouldCollapseWhiteSpace = whiteSpaceRule !== 'pre';
    const collapsedTextContent = collapseString(textContent, {
      shouldCollapseWhiteSpace,
      trimEnd,
      trimStart,
      whiteSpaceIncludesNewlines: whiteSpaceRule !== 'pre-line',
    });

    if (state.inlineFormattingContext && shouldCollapseWhiteSpace) {
      state.inlineFormattingContext.lastHasTrailingWhiteSpace =
        collapsedTextContent.endsWith(' ');
    }

    node.textContent = collapsedTextContent;

    return;
  }

  collapseChildren(node);
};

export const collapseWhiteSpace = (element: HTMLElement) => {
  const clonedElement = element.cloneNode(true) as HTMLElement;

  collapseWhiteSpaceNode(clonedElement, {
    inlineFormattingContext: null,
    whiteSpaceRule: 'normal',
  });

  return clonedElement;
};

type CompiledPlateHtmlArtifact = Readonly<{
  matcherIndex: CompiledHtmlMatcherIndex;
  rules: readonly CompiledHtmlRule[];
  serializerIndex: CompiledHtmlSerializerIndex;
}>;

const COMPILED_PLATE_HTML = new WeakMap<object, CompiledPlateHtmlArtifact>();

type PreparedHtmlPluginEntry<
  C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = Readonly<{
  context: Omit<HtmlPluginContext<C>, 'pluginState' | 'state'>;
  getPluginState: () => HtmlPluginContext<C>['pluginState'];
  name: string;
  query?: HtmlCodecHooks<C>['query'];
  transformData?: HtmlCodecHooks<C>['transformData'];
  transformFragment?: HtmlCodecHooks<C>['transformFragment'];
}>;

type PreparedHtmlRegistry = Readonly<{
  plugins: readonly PreparedHtmlPluginEntry[];
  public: HtmlPluginRegistry;
}>;

const EDITOR_PARSER_REGISTRIES = new WeakMap<
  BaseEditor,
  Readonly<{
    modelRevision: object | undefined;
    pluginList: readonly AnyBasePlugin[];
    registry: PreparedHtmlRegistry;
  }>
>();

const preparePlugin = <P extends AnyBasePlugin & PluginReference>(
  editor: BaseEditor,
  plugin: P,
  registry: HtmlPluginRegistry
): PreparedHtmlPluginEntry<DefinitionOf<P>> => {
  const installed =
    getCompiledPlatePlugin(editor, plugin) ??
    failInvariant('Expected value to be defined');
  const parserValue =
    typeof installed.codecs === 'object' && installed.codecs !== null
      ? Reflect.get(installed.codecs, 'text/html')
      : undefined;
  const parser =
    typeof parserValue === 'object' && parserValue !== null
      ? (parserValue as HtmlCodecHooks<DefinitionOf<P>>)
      : undefined;

  return Object.freeze({
    context: Object.freeze({
      name: plugin.name,
      registry,
    }),
    getPluginState: () =>
      getPluginStore<DefinitionOf<P>>(editor, plugin.name)?.public.get() ??
      installed.initialState,
    name: plugin.name,
    ...(parser?.query ? { query: parser.query } : {}),
    ...(parser?.transformData ? { transformData: parser.transformData } : {}),
    ...(parser?.transformFragment
      ? { transformFragment: parser.transformFragment }
      : {}),
  });
};

const prepareCompiledPlugin = (
  editor: BaseEditor,
  installed: AnyBasePlugin,
  registry: HtmlPluginRegistry
): PreparedHtmlPluginEntry => {
  const parserValue =
    typeof installed.codecs === 'object' && installed.codecs !== null
      ? Reflect.get(installed.codecs, 'text/html')
      : undefined;
  const parser =
    typeof parserValue === 'object' && parserValue !== null ? parserValue : {};
  const query = Reflect.get(parser, 'query');
  const transformData = Reflect.get(parser, 'transformData');
  const transformFragment = Reflect.get(parser, 'transformFragment');
  const prepared: PreparedHtmlPluginEntry = {
    context: Object.freeze({
      name: installed.name,
      registry,
    }),
    getPluginState: () =>
      getPluginStore(editor, installed.name)?.public.get() ??
      installed.initialState,
    name: installed.name,
    ...(typeof query === 'function'
      ? {
          query: (options) => Reflect.apply(query, undefined, [options]),
        }
      : {}),
    ...(typeof transformData === 'function'
      ? {
          transformData: (options) =>
            Reflect.apply(transformData, undefined, [options]),
        }
      : {}),
    ...(typeof transformFragment === 'function'
      ? {
          transformFragment: (options) =>
            Reflect.apply(transformFragment, undefined, [options]),
        }
      : {}),
  };

  return Object.freeze(prepared);
};

/** Snapshot the flat whole-input HTML hooks for one compiled Plate model. */
export const prepareHtmlRegistry = (
  editor: BaseEditor
): PreparedHtmlRegistry => {
  const pluginList = getCompiledPlatePluginList(editor);
  const model = getCompiledPlateModel(editor);
  const isCandidate = hasCompiledPlatePluginCandidate(editor);
  const cached = isCandidate ? undefined : EDITOR_PARSER_REGISTRIES.get(editor);

  if (
    cached?.pluginList === pluginList &&
    cached.modelRevision === model.revision
  ) {
    return cached.registry;
  }

  const names = new Set(pluginList.map((plugin) => plugin.name));
  const publicRegistry = Object.freeze({
    has: (name: string) => names.has(name),
  });
  const prepared = Object.freeze({
    plugins: Object.freeze(
      pluginList.map((plugin) =>
        prepareCompiledPlugin(editor, plugin, publicRegistry)
      )
    ),
    public: publicRegistry,
  });

  if (!isCandidate) {
    EDITOR_PARSER_REGISTRIES.set(
      editor,
      Object.freeze({
        modelRevision: model.revision,
        pluginList,
        registry: prepared,
      })
    );
  }

  return prepared;
};

const createHtmlPluginContext = <
  C extends AnyBasePluginDefinition,
  V extends Value,
>(
  plugin: PreparedHtmlPluginEntry<C>,
  state: EditorCoreStateView<V>
): HtmlPluginContext<C> =>
  Object.freeze({
    ...plugin.context,
    pluginState: Object.freeze({ ...plugin.getPluginState() }),
    state: toEditorCoreStateView(state) as unknown as EditorCoreStateView,
  });

export const pipePreparedInsertDataQuery = (
  state: EditorCoreStateView,
  plugins: readonly PreparedHtmlPluginEntry[],
  options: HtmlParserOptions
) =>
  plugins.every(
    (plugin) =>
      !plugin.query ||
      plugin.query({
        ...options,
        ...createHtmlPluginContext(plugin, state),
      })
  );

const pipeTransformData = (
  state: EditorCoreStateView,
  plugins: readonly PreparedHtmlPluginEntry[],
  { data: initialData, ...options }: HtmlParserOptions
) => {
  let data = initialData;
  plugins.forEach((plugin) => {
    if (!plugin.transformData) return;

    data = plugin.transformData({
      data,
      ...options,
      ...createHtmlPluginContext(plugin, state),
    });
  });

  return data;
};

const pipeTransformFragment = (
  state: EditorCoreStateView,
  plugins: readonly PreparedHtmlPluginEntry[],
  {
    fragment: initialFragment,
    ...options
  }: HtmlParserOptions & { fragment: readonly Descendant[] }
) => {
  let fragment = initialFragment;
  plugins.forEach((plugin) => {
    if (!plugin.transformFragment) return;

    fragment = plugin.transformFragment({
      fragment,
      ...options,
      ...createHtmlPluginContext(plugin, state),
    });
  });

  return fragment;
};

/** Build one parser context factory for focused package proof. */
export const prepareHtmlPluginContext = <
  P extends AnyBasePlugin & PluginReference,
>(
  editor: BaseEditor,
  plugin: P
): (<V extends Value>(
  state: EditorCoreStateView<V>
) => HtmlPluginContext<DefinitionOf<P>>) => {
  const registry = prepareHtmlRegistry(editor);
  const prepared = preparePlugin(editor, plugin, registry.public);

  return <V extends Value>(state: EditorCoreStateView<V>) =>
    createHtmlPluginContext(prepared, state);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasHtmlControl = (value: string) => {
  for (const character of value) {
    const codePoint =
      character.codePointAt(0) ?? failInvariant('Expected value to be defined');

    if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
      return true;
    }
  }

  return false;
};

const isSafeHtmlUrl = (tag: string, name: string, value: string) => {
  if (hasHtmlControl(value)) return false;
  const normalized = value.trim();

  if (HTML_UNSAFE_URL_RE.test(normalized)) return false;
  if (!normalized.toLowerCase().startsWith('data:')) return true;

  return (
    tag === 'img' &&
    name === 'src' &&
    HTML_SAFE_IMAGE_DATA_URL_RE.test(normalized)
  );
};

const isSafeDecodedElement = (element: HTMLElement) => {
  const tag = element.tagName.toLowerCase();

  if (HTML_UNSAFE_TAGS.has(tag)) return false;

  return element.getAttributeNames().every((rawName) => {
    const name = rawName.toLowerCase();

    if (name.startsWith('on') || name === 'srcdoc') return false;
    if (!HTML_URL_ATTRIBUTES.has(name)) return true;
    const value = element.getAttribute(rawName);

    return value === null || isSafeHtmlUrl(tag, name, value);
  });
};

const normalizeStyleName = (name: string) =>
  name.startsWith('--')
    ? name
    : name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const assertSafeStyleValue = (
  value: string,
  tag: string,
  name: string,
  label: string
) => {
  if (
    hasHtmlControl(value) ||
    value.includes(';') ||
    value.includes('{') ||
    value.includes('}') ||
    value.includes('\\') ||
    value.includes('/*') ||
    value.includes('*/')
  ) {
    throw new Error(`${label} has an unsafe CSS value.`);
  }
  HTML_STYLE_URL_RE.lastIndex = 0;
  let match = HTML_STYLE_URL_RE.exec(value);

  while (match) {
    let offset = HTML_STYLE_URL_RE.lastIndex;

    while (value[offset] === ' ') offset += 1;
    const quote =
      value[offset] === '"' || value[offset] === "'" ? value[offset] : null;
    let url: string;

    if (quote) {
      const end = value.indexOf(quote, offset + 1);

      if (end === -1) {
        throw new Error(`${label} has a malformed CSS URL.`);
      }
      url = value.slice(offset + 1, end);
      offset = end + 1;
      while (value[offset] === ' ') offset += 1;
      if (value[offset] !== ')') {
        throw new Error(`${label} has a malformed CSS URL.`);
      }
    } else {
      const end = value.indexOf(')', offset);

      if (end === -1) {
        throw new Error(`${label} has a malformed CSS URL.`);
      }
      const rawUrl = value.slice(offset, end).trim();

      if (HTML_UNQUOTED_STYLE_URL_RE.test(rawUrl)) {
        throw new Error(`${label} has a malformed CSS URL.`);
      }
      url = rawUrl;
      offset = end;
    }
    if (!isSafeHtmlUrl(tag, name, url)) {
      throw new Error(`${label} has an unsafe CSS URL.`);
    }
    HTML_STYLE_URL_RE.lastIndex = offset + 1;
    match = HTML_STYLE_URL_RE.exec(value);
  }
};

// Codec-local priority owns HTML precedence; plugin application order does not.
const compareRules = (left: CompiledHtmlRule, right: CompiledHtmlRule) =>
  right.rulePriority - left.rulePriority ||
  left.owner.localeCompare(right.owner);

const normalizeMatchValues = (
  value: unknown,
  label: string,
  normalize: (item: string) => string = (item) => item
): readonly string[] => {
  const values = typeof value === 'string' ? [value] : value;

  if (
    !Array.isArray(values) ||
    values.length === 0 ||
    values.some((item) => typeof item !== 'string' || item.length === 0)
  ) {
    throw new Error(`${label} must be a non-empty string or string array.`);
  }

  return Object.freeze([...new Set(values.map(normalize))]);
};

const compileMatcher = (
  owner: string,
  matcher: unknown,
  index: number
): HtmlMatcher => {
  const label = `Plate HTML codec "${owner}" matcher ${index}`;

  if (!isRecord(matcher)) throw new Error(`${label} must be an object.`);
  const fields = Object.keys(matcher);

  if (fields.length === 0) {
    throw new Error(`${label} must define at least one matcher field.`);
  }
  fields.forEach((field) => {
    if (!HTML_MATCHER_FIELDS.has(field)) {
      throw new Error(`${label} has unknown field "${field}".`);
    }
  });

  const compiled: {
    attributes?: Readonly<Record<string, true | readonly string[]>>;
    className?: string;
    style?: Readonly<Record<string, '*' | readonly string[]>>;
    tag?: readonly string[];
  } = {};

  if (matcher.tag !== undefined) {
    compiled.tag = normalizeMatchValues(matcher.tag, `${label} tag`, (item) =>
      item.toLowerCase()
    );
  }
  if (matcher.className !== undefined) {
    if (
      typeof matcher.className !== 'string' ||
      matcher.className.length === 0 ||
      HTML_CLASS_WHITESPACE_RE.test(matcher.className)
    ) {
      throw new Error(`${label} className must be one non-empty class token.`);
    }
    compiled.className = matcher.className;
  }
  if (matcher.attributes !== undefined) {
    if (!isRecord(matcher.attributes)) {
      throw new Error(`${label} attributes must be an object.`);
    }
    const attributes = new Map<string, true | readonly string[]>();

    if (Object.keys(matcher.attributes).length === 0) {
      throw new Error(`${label} attributes cannot be empty.`);
    }
    Object.entries(matcher.attributes).forEach(([rawName, value]) => {
      const name = rawName.toLowerCase();

      if (!HTML_ATTRIBUTE_RE.test(name)) {
        throw new Error(`${label} has invalid attribute "${rawName}".`);
      }
      const normalized =
        value === true
          ? true
          : normalizeMatchValues(value, `${label} attribute "${name}"`);
      const existing = attributes.get(name);

      if (existing !== undefined && !isEqual(existing, normalized)) {
        throw new Error(`${label} has conflicting attribute "${name}".`);
      }
      attributes.set(name, normalized);
    });
    compiled.attributes = Object.freeze(Object.fromEntries(attributes));
  }
  if (matcher.style !== undefined) {
    if (!isRecord(matcher.style)) {
      throw new Error(`${label} style must be an object.`);
    }
    const styles = new Map<string, '*' | readonly string[]>();

    if (Object.keys(matcher.style).length === 0) {
      throw new Error(`${label} style cannot be empty.`);
    }
    Object.entries(matcher.style).forEach(([rawName, value]) => {
      if (!rawName) throw new Error(`${label} has an empty style key.`);
      const name = normalizeStyleName(rawName);
      const normalized =
        value === '*'
          ? '*'
          : normalizeMatchValues(value, `${label} style "${name}"`);
      const existing = styles.get(name);

      if (existing !== undefined && !isEqual(existing, normalized)) {
        throw new Error(`${label} has conflicting style key "${name}".`);
      }
      styles.set(name, normalized);
    });
    compiled.style = Object.freeze(Object.fromEntries(styles));
  }
  if (Object.keys(compiled).length === 0) {
    throw new Error(`${label} must define at least one active matcher field.`);
  }

  return Object.freeze(compiled) as HtmlMatcher;
};

const compileProperties = (
  owner: string,
  binding: CompiledPlateModelBinding
): readonly CompiledHtmlProperty[] => {
  const byId = new Map<string, CompiledHtmlProperty>();

  binding.properties.forEach((property) => {
    if (typeof property.key !== 'string') {
      throw new Error(
        `Plate HTML codec "${owner}" cannot claim prefix schema properties.`
      );
    }
    const id = getCompiledSchemaPropertyId(property);

    byId.set(
      id,
      Object.freeze({
        id,
        key: property.key,
        property,
      })
    );
  });

  return Object.freeze([...byId.values()]);
};

const targetMatchesElementType = (
  model: CompiledPlateModel,
  target: SchemaTarget,
  type: string
): boolean | null => {
  switch (target.kind) {
    case 'type': {
      return target.type === type;
    }
    case 'types': {
      return target.types.includes(type);
    }
    case 'group': {
      return (
        model.contribution.elements?.[type]?.groups?.includes(target.group) ??
        false
      );
    }
    case 'not': {
      const matched = targetMatchesElementType(model, target.target, type);

      return matched === null ? null : !matched;
    }
    case 'and': {
      const matches = target.targets.map((child) =>
        targetMatchesElementType(model, child, type)
      );

      if (matches.includes(false)) return false;

      return matches.every((match) => match === true) ? true : null;
    }
    case 'or': {
      const matches = target.targets.map((child) =>
        targetMatchesElementType(model, child, type)
      );

      if (matches.includes(true)) return true;

      return matches.every((match) => match === false) ? false : null;
    }
    case 'parent':
    case 'root': {
      return null;
    }
  }

  return failInvariant('Unexpected schema target while matching HTML');
};

const compileRule = (
  editor: BaseEditor,
  model: CompiledPlateModel,
  pluginsByName: ReadonlyMap<string, AnyBasePlugin>,
  ownerPlugin: AnyBasePlugin,
  target: string | null,
  extension: ErasedPluginCallable
): CompiledHtmlRule => {
  function assertDeclaration(
    value: unknown
  ): asserts value is HtmlRuleDeclaration {
    if (!isRecord(value)) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" callback must return an object.`
      );
    }
    Object.keys(value).forEach((field) => {
      if (!HTML_RULE_FIELDS.has(field)) {
        throw new Error(
          `Plate HTML codec "${ownerPlugin.name}" has unknown field "${field}".`
        );
      }
    });
    if (!Array.isArray(value.match) || value.match.length === 0) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" match must be a non-empty array.`
      );
    }
    if (typeof value.decode !== 'function') {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" decode must be a function.`
      );
    }
    if (
      value.priority !== undefined &&
      (typeof value.priority !== 'number' || !Number.isFinite(value.priority))
    ) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" priority must be finite.`
      );
    }
    if (value.createsElement !== undefined && value.createsElement !== true) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" createsElement must be true when present.`
      );
    }
    if (value.decodeOnly !== undefined && value.decodeOnly !== true) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" decodeOnly must be true when present.`
      );
    }
    if (value.decodeOnly === true) {
      if (value.encode !== undefined) {
        throw new Error(
          `Plate HTML codec "${ownerPlugin.name}" cannot define encode with decodeOnly.`
        );
      }
    } else if (typeof value.encode !== 'function') {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" must define encode or decodeOnly: true.`
      );
    }
  }

  if (target === ownerPlugin.name) {
    throw new Error(
      `Plate HTML codec "${ownerPlugin.name}" must use the self overload for its own schema.`
    );
  }
  const targetPlugin = target ? pluginsByName.get(target) : ownerPlugin;

  if (!targetPlugin || targetPlugin.enabled === false) {
    throw new Error(
      `Plate HTML codec "${ownerPlugin.name}" targets missing or disabled plugin "${target}".`
    );
  }
  const authoredFamilies = getHtmlCodecSchemaFamilies(extension);

  if (
    !authoredFamilies ||
    getPluginSchemaFamily(ownerPlugin) !== authoredFamilies.owner ||
    getPluginSchemaFamily(targetPlugin) !== authoredFamilies.target
  ) {
    throw new Error(
      `Plate HTML codec "${ownerPlugin.name}" owner or target "${targetPlugin.name}" belongs to a different schema family than its authored descriptor.`
    );
  }
  const binding = model.byName[targetPlugin.name];

  if (!binding) {
    throw new Error(
      `Plate HTML codec "${ownerPlugin.name}" target "${targetPlugin.name}" has no compiled model binding.`
    );
  }
  const declaration = Reflect.apply(extension, undefined, [
    createPluginContext(editor, ownerPlugin),
  ]);

  assertDeclaration(declaration);
  if (target && declaration.createsElement) {
    throw new Error(
      `Plate HTML codec "${ownerPlugin.name}" cannot use createsElement for foreign target "${target}".`
    );
  }

  let kind: CompiledHtmlRule['kind'];
  let targetType: string | null = null;
  const properties = compileProperties(ownerPlugin.name, binding);

  if (
    binding.kind === 'element' &&
    properties.some(({ property }) => property.placement !== 'element')
  ) {
    throw new Error(
      `Plate HTML codec "${ownerPlugin.name}" element targets cannot mix element and text property claims.`
    );
  }
  if (binding.kind === 'element') {
    kind = 'element';
    targetType = binding.elementType;
  } else if (
    properties.length > 0 &&
    properties.every(({ property }) => property.placement === 'text')
  ) {
    kind = 'mark';
  } else if (
    properties.length > 0 &&
    properties.every(({ property }) => property.placement === 'element')
  ) {
    kind = 'element-property';
  } else {
    throw new Error(
      `Plate HTML codec "${ownerPlugin.name}" target "${targetPlugin.name}" must own one element or properties of one placement.`
    );
  }

  if (declaration.createsElement) {
    if (kind !== 'element-property' || target) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" can use createsElement only for self-owned element properties.`
      );
    }
    const primaryTarget = targetPlugin.targetPlugins[0];
    const primaryName =
      typeof primaryTarget === 'string' ? primaryTarget : primaryTarget?.name;
    const primaryPlugin = primaryName
      ? pluginsByName.get(primaryName)
      : undefined;
    const primaryBinding = primaryName ? model.byName[primaryName] : undefined;

    if (
      !primaryName ||
      !primaryPlugin ||
      primaryPlugin.enabled === false ||
      primaryBinding?.kind !== 'element' ||
      !primaryBinding.elementType
    ) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" createsElement requires installed element targetPlugins[0].`
      );
    }
    targetType = primaryBinding.elementType;
    const unsupported = properties.find(
      ({ property }) =>
        property.placement !== 'element' ||
        targetMatchesElementType(
          model,
          property.target,
          targetType ?? failInvariant('Expected value to be defined')
        ) !== true
    );

    if (unsupported) {
      throw new Error(
        `Plate HTML codec "${ownerPlugin.name}" configured primary "${targetType}" does not satisfy property "${unsupported.key}".`
      );
    }
  }

  return Object.freeze({
    createsElement: declaration.createsElement === true,
    declaration: Object.freeze({
      ...declaration,
      match: Object.freeze(
        declaration.match.map((matcher, index) =>
          compileMatcher(ownerPlugin.name, matcher, index)
        )
      ),
    }),
    kind,
    owner: ownerPlugin.name,
    properties,
    rulePriority: declaration.priority ?? 0,
    targetType,
  });
};

const matchValue = (actual: string, expected: unknown) =>
  Array.isArray(expected) && expected.includes(actual);

const getStyleValue = (element: HTMLElement, key: string) => {
  const value =
    element.style.getPropertyValue(key) ||
    Reflect.get(element.style, key) ||
    '';

  return String(value).trim();
};

const matches = (element: HTMLElement, matcher: HtmlMatcher) => {
  if (matcher.tag && !matchValue(element.tagName.toLowerCase(), matcher.tag)) {
    return false;
  }
  if (matcher.className && !element.classList.contains(matcher.className)) {
    return false;
  }
  if (
    matcher.attributes &&
    !Object.entries(matcher.attributes).every(([name, expected]) => {
      if (expected === true) return element.hasAttribute(name);
      const actual = element.getAttribute(name);

      return actual !== null && matchValue(actual, expected);
    })
  ) {
    return false;
  }
  if (
    matcher.style &&
    !Object.entries(matcher.style).every(([name, expected]) => {
      const actual = getStyleValue(element, name);

      return expected === '*'
        ? actual.length > 0
        : matchValue(actual, expected);
    })
  ) {
    return false;
  }

  return true;
};

const ruleMatches = (rule: CompiledHtmlRule, element: HTMLElement) =>
  rule.declaration.match.some((matcher) => matches(element, matcher));

const addRuleBucket = (
  buckets: Map<string, CompiledHtmlRule[]>,
  key: string,
  rule: CompiledHtmlRule
) => {
  const bucket = buckets.get(key) ?? [];

  if (!bucket.includes(rule)) bucket.push(rule);
  buckets.set(key, bucket);
};

const freezeRuleBuckets = (
  buckets: Map<string, CompiledHtmlRule[]>
): ReadonlyMap<string, readonly CompiledHtmlRule[]> =>
  new Map([...buckets].map(([key, rules]) => [key, Object.freeze([...rules])]));

const compileMatcherIndex = (
  rules: readonly CompiledHtmlRule[]
): CompiledHtmlMatcherIndex => {
  const attributes = new Map<string, CompiledHtmlRule[]>();
  const classes = new Map<string, CompiledHtmlRule[]>();
  const styles = new Map<string, CompiledHtmlRule[]>();
  const tags = new Map<string, CompiledHtmlRule[]>();

  rules.forEach((rule) => {
    rule.declaration.match.forEach((matcher) => {
      const matcherTags =
        typeof matcher.tag === 'string' ? [matcher.tag] : matcher.tag;

      matcherTags?.forEach((tag) => {
        addRuleBucket(tags, tag, rule);
      });
      if (matcher.className) {
        addRuleBucket(classes, matcher.className, rule);
      }
      Object.keys(matcher.attributes ?? {}).forEach((attribute) => {
        addRuleBucket(attributes, attribute, rule);
      });
      Object.keys(matcher.style ?? {}).forEach((style) => {
        addRuleBucket(styles, style, rule);
      });
    });
  });

  return Object.freeze({
    attributes: freezeRuleBuckets(attributes),
    classes: freezeRuleBuckets(classes),
    styles: freezeRuleBuckets(styles),
    tags: freezeRuleBuckets(tags),
  });
};

const getMatchedRules = (
  index: CompiledHtmlMatcherIndex,
  element: HTMLElement
): readonly CompiledHtmlRule[] => {
  const candidates = new Set<CompiledHtmlRule>();
  const add = (rules: readonly CompiledHtmlRule[] | undefined) => {
    rules?.forEach((rule) => {
      candidates.add(rule);
    });
  };

  add(index.tags.get(element.tagName.toLowerCase()));
  element.getAttributeNames().forEach((attribute) => {
    add(index.attributes.get(attribute.toLowerCase()));
  });
  element.classList.forEach((className) => {
    add(index.classes.get(className));
  });
  for (let offset = 0; offset < element.style.length; offset++) {
    const style = element.style.item(offset);

    if (style) add(index.styles.get(normalizeStyleName(style)));
  }

  return [...candidates]
    .sort(compareRules)
    .filter((rule) => ruleMatches(rule, element));
};

const matcherConstraintsOverlap = (left: unknown, right: unknown): boolean => {
  if (left === undefined || right === undefined) return true;
  if (left === true || right === true) return true;
  if (left === '*' || right === '*') return true;

  const rightSet = new Set(right as readonly string[]);

  return (left as readonly string[]).some((value) => rightSet.has(value));
};

const matchersOverlap = (left: HtmlMatcher, right: HtmlMatcher) => {
  if (!matcherConstraintsOverlap(left.tag, right.tag)) return false;

  // Distinct classes can coexist on one element, so they do not prove
  // disjointness.
  for (const [name, leftValue] of Object.entries(left.attributes ?? {})) {
    const rightValue = right.attributes?.[name];

    if (
      rightValue !== undefined &&
      !matcherConstraintsOverlap(leftValue, rightValue)
    ) {
      return false;
    }
  }
  for (const [name, leftValue] of Object.entries(left.style ?? {})) {
    const rightValue = right.style?.[name];

    if (
      rightValue !== undefined &&
      !matcherConstraintsOverlap(leftValue, rightValue)
    ) {
      return false;
    }
  }

  return true;
};

const rulesMayOverlap = (left: CompiledHtmlRule, right: CompiledHtmlRule) =>
  left.declaration.match.some((leftMatcher) =>
    right.declaration.match.some((rightMatcher) =>
      matchersOverlap(leftMatcher, rightMatcher)
    )
  );

const ruleClaimKeys = (rule: CompiledHtmlRule) => {
  const keys = rule.properties.map(({ id }) => `property:${id}`);

  if (rule.kind === 'element' || rule.createsElement) {
    keys.push(`element:${rule.targetType}`);
  }

  return keys;
};

const assertStaticConflicts = (rules: readonly CompiledHtmlRule[]) => {
  for (let index = 0; index < rules.length; index++) {
    const left = rules[index];

    for (const right of rules.slice(index + 1)) {
      if (left.rulePriority !== right.rulePriority) {
        continue;
      }
      const decodeClaimsOverlap = rulesMayOverlap(left, right);
      const bothEncode =
        typeof left.declaration.encode === 'function' &&
        typeof right.declaration.encode === 'function';
      const leftElementCandidate =
        left.kind === 'element' || left.createsElement;
      const rightElementCandidate =
        right.kind === 'element' || right.createsElement;

      if (
        decodeClaimsOverlap &&
        leftElementCandidate &&
        rightElementCandidate
      ) {
        throw new Error(
          `Plate HTML codecs "${left.owner}" and "${right.owner}" have equal priority and overlapping element candidates.`
        );
      }
      const rightClaims = new Set(ruleClaimKeys(right));
      const overlap = ruleClaimKeys(left).find((claim) =>
        rightClaims.has(claim)
      );

      if (overlap && decodeClaimsOverlap) {
        throw new Error(
          `Plate HTML codecs "${left.owner}" and "${right.owner}" have equal priority and overlapping "${overlap}" match claims.`
        );
      }
      if (overlap && bothEncode) {
        throw new Error(
          `Plate HTML codecs "${left.owner}" and "${right.owner}" have equal priority and competing encode claim "${overlap}".`
        );
      }
      if (
        bothEncode &&
        left.owner === right.owner &&
        left.kind === 'mark' &&
        right.kind === 'mark'
      ) {
        throw new Error(
          `Plate HTML codec "${left.owner}" has unresolved wrapper ordering; assign distinct rule priorities.`
        );
      }
    }
  }
};

const compileSerializerIndex = (
  model: CompiledPlateModel,
  rules: readonly CompiledHtmlRule[]
): CompiledHtmlSerializerIndex => {
  const elementTypes = model.bindings.flatMap((binding) =>
    binding.kind === 'element' && binding.elementType
      ? [binding.elementType]
      : []
  );
  const elementsByType = new Map<string, readonly CompiledHtmlRule[]>();
  const elementPropertiesByType = new Map<
    string,
    readonly CompiledHtmlRule[]
  >();
  const marksByParentType = new Map<string, readonly CompiledHtmlRule[]>();
  const encodableRules = rules.filter(
    (rule) => typeof rule.declaration.encode === 'function'
  );

  elementTypes.forEach((type) => {
    elementsByType.set(
      type,
      Object.freeze(
        encodableRules.filter(
          (rule) =>
            (rule.kind === 'element' || rule.createsElement) &&
            rule.targetType === type
        )
      )
    );
    elementPropertiesByType.set(
      type,
      Object.freeze(
        encodableRules.filter(
          (rule) =>
            rule.kind === 'element-property' &&
            !rule.createsElement &&
            rule.properties.some(
              ({ property }) =>
                !property.target ||
                targetMatchesElementType(model, property.target, type) !== false
            )
        )
      )
    );
    marksByParentType.set(
      type,
      Object.freeze(
        encodableRules.filter(
          (rule) =>
            rule.kind === 'mark' &&
            rule.properties.some(
              ({ property }) =>
                !property.target ||
                targetMatchesElementType(model, property.target, type) !== false
            )
        )
      )
    );
  });

  return Object.freeze({
    elementPropertiesByType,
    elementsByType,
    encodablePropertyIds: new Set(
      encodableRules.flatMap((rule) => rule.properties.map(({ id }) => id))
    ),
    marksByParentType,
  });
};

const reportDecodeError = (
  editor: BaseEditor,
  rule: CompiledHtmlRule,
  element: HTMLElement,
  cause: unknown
) => {
  const outerHtml = element.outerHTML.slice(0, 512);

  reportEditorLifecycleError(
    Object.freeze({
      cause: new Error(
        `Plate HTML decode failed for owner "${rule.owner}" at <${element.tagName.toLowerCase()}>: ${outerHtml}`,
        { cause }
      ),
      editor,
      extensionName: 'plate:html',
      format: HTML_FORMAT,
      key: `plate:${rule.owner}:html:decode`,
      phase: 'parse' as const,
      source: 'host-codec' as const,
    })
  );
};

const invokeDecode = <T>(
  editor: BaseEditor,
  rule: CompiledHtmlRule,
  element: HTMLElement,
  state: EditorCoreStateView,
  normalize: (value: unknown) => T
): T | undefined => {
  try {
    const before = element.outerHTML;
    const result = rule.declaration.decode(Object.freeze({ element, state }));

    if (element.outerHTML !== before) {
      throw new Error(
        `Plate HTML codec "${rule.owner}" decode must not mutate its element.`
      );
    }

    return result === undefined ? undefined : normalize(result);
  } catch (error) {
    reportDecodeError(editor, rule, element, error);
  }

  return undefined;
};

class ReportedHtmlEncodeError extends Error {
  override name = 'ReportedHtmlEncodeError';
}

const encodeWithRule = <T>(
  editor: BaseEditor,
  rule: CompiledHtmlRule,
  node: PliteElement | Text,
  parentType: string | null,
  run: () => T
): T => {
  try {
    return run();
  } catch (error) {
    reportEditorLifecycleError(
      Object.freeze({
        cause: new Error(
          `Plate HTML encode failed for owner "${rule.owner}", node "${TextApi.isText(node) ? (parentType ?? 'text') : node.type}", claims "${ruleClaimKeys(rule).join(', ')}".`,
          { cause: error }
        ),
        editor,
        extensionName: 'plate:html',
        format: HTML_FORMAT,
        key: `plate:${rule.owner}:html:encode`,
        phase: 'serialize' as const,
        source: 'host-codec' as const,
      })
    );

    throw new ReportedHtmlEncodeError();
  }
};

const elementValuesFromDecode = (
  rule: CompiledHtmlRule,
  value: unknown
): Record<string, unknown> => {
  if (!isRecord(value)) {
    throw new Error(
      `Plate HTML codec "${rule.owner}" element decode must return an object.`
    );
  }
  const fields = new Set([
    'children',
    ...rule.properties.map(({ key }) => key),
  ]);
  const unknownField = Object.keys(value).find((field) => !fields.has(field));

  if (unknownField) {
    throw new Error(
      `Plate HTML codec "${rule.owner}" element decode returned unowned field "${unknownField}".`
    );
  }
  if (Object.hasOwn(value, 'children') && !Array.isArray(value.children)) {
    throw new Error(
      `Plate HTML codec "${rule.owner}" element decode children must be an array.`
    );
  }
  rule.properties.forEach((property) => {
    if (
      Object.hasOwn(value, property.key) &&
      !isValidPropertyValue(property, value[property.key])
    ) {
      throw new Error(
        `Plate HTML codec "${rule.owner}" returned invalid property "${property.key}".`
      );
    }
  });

  return value;
};

const validateExplicitDecodedChildren = (
  rule: CompiledHtmlRule,
  value: Record<string, unknown>,
  state: EditorCoreStateView
) => {
  if (!Object.hasOwn(value, 'children')) return value;
  const children = value.children as Descendant[];
  const properties = Object.fromEntries(
    rule.properties.flatMap(({ key }) =>
      Object.hasOwn(value, key) ? [[key, value[key]] as const] : []
    )
  );
  const parent = state.schema.create(
    rule.targetType ?? failInvariant('Expected value to be defined'),
    properties
  );
  try {
    state.schema.assertFragment([{ ...parent, children }]);
  } catch {
    throw new Error(
      `Plate HTML codec "${rule.owner}" returned children outside target "${rule.targetType}" schema.`
    );
  }

  return value;
};

const isJsonValue = (value: unknown): boolean => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true;
  }
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (!isRecord(value)) return false;

  return Object.values(value).every(isJsonValue);
};

const isValidPropertyValue = (
  property: CompiledHtmlProperty,
  value: unknown
): boolean => {
  const descriptor = property.property.value;
  let valid: boolean;

  switch (descriptor.kind) {
    case 'boolean': {
      valid = typeof value === 'boolean';
      break;
    }
    case 'enum': {
      valid =
        typeof value === 'string' &&
        (
          descriptor as typeof descriptor & {
            values: readonly string[];
          }
        ).values.includes(value);
      break;
    }
    case 'json': {
      valid = isJsonValue(value);
      break;
    }
    case 'number': {
      valid = typeof value === 'number' && Number.isFinite(value);
      break;
    }
    case 'set': {
      const itemDescriptor = (
        descriptor as typeof descriptor & {
          item: PropertyValueDescriptor;
        }
      ).item;

      valid =
        Array.isArray(value) &&
        value.every((item) =>
          isValidPropertyValue(
            {
              ...property,
              property: {
                ...property.property,
                value: itemDescriptor,
              },
            },
            item
          )
        );
      break;
    }
    case 'string': {
      valid = typeof value === 'string';
      break;
    }
  }
  if (!valid || !descriptor.validate) return valid;

  try {
    return descriptor.validate(value);
  } catch {
    return false;
  }
};

const propertyValuesFromDecode = (rule: CompiledHtmlRule, value: unknown) => {
  if (rule.properties.length === 1) {
    if (!isValidPropertyValue(rule.properties[0], value)) {
      throw new Error(
        `Plate HTML codec "${rule.owner}" returned invalid property "${rule.properties[0].key}".`
      );
    }

    return new Map([[rule.properties[0].key, value]]);
  }
  if (!isRecord(value)) {
    throw new Error(
      `Plate HTML codec "${rule.owner}" multi-property decode must return an object.`
    );
  }
  const fields = new Set(rule.properties.map(({ key }) => key));
  const unknownField = Object.keys(value).find((field) => !fields.has(field));

  if (unknownField) {
    throw new Error(
      `Plate HTML codec "${rule.owner}" multi-property decode returned unowned field "${unknownField}".`
    );
  }
  rule.properties.forEach((property) => {
    if (
      Object.hasOwn(value, property.key) &&
      !isValidPropertyValue(property, value[property.key])
    ) {
      throw new Error(
        `Plate HTML codec "${rule.owner}" returned invalid property "${property.key}".`
      );
    }
  });

  return new Map(
    rule.properties.flatMap(({ key }) =>
      Object.hasOwn(value, key) ? [[key, value[key]] as const] : []
    )
  );
};

const propertyAppliesToType = (
  property: CompiledHtmlProperty,
  state: EditorCoreStateView,
  type: string | null
) =>
  state.schema.property({
    key: property.key,
    placement: property.property.placement,
    ...(type ? { type } : {}),
  })?.id === property.id;

type DecodedHtmlProperty = Readonly<{
  property: CompiledHtmlProperty;
  value: unknown;
}>;

const getDefaultRootType = (state: EditorCoreStateView) => {
  const fallback = state.schema.createDefaultRootChild();

  return ElementApi.isElement(fallback) ? fallback.type : null;
};

const descendantsHaveApplicableText = (
  descendants: readonly Descendant[],
  properties: readonly CompiledHtmlProperty[],
  state: EditorCoreStateView,
  parentType: string | null
): boolean =>
  descendants.some((node) => {
    if (TextApi.isText(node)) {
      return properties.some((property) =>
        propertyAppliesToType(property, state, parentType)
      );
    }
    if (!ElementApi.isElement(node)) return false;

    return descendantsHaveApplicableText(
      node.children,
      properties,
      state,
      node.type
    );
  });

const applyTextProperties = (
  descendants: readonly Descendant[],
  properties: ReadonlyMap<string, DecodedHtmlProperty>,
  state: EditorCoreStateView,
  parentType: string | null
): Descendant[] =>
  descendants.map((node) => {
    if (TextApi.isText(node)) {
      const applicable = [...properties.values()].flatMap(
        ({ property, value }) =>
          propertyAppliesToType(property, state, parentType) &&
          !Object.hasOwn(node, property.key)
            ? [[property.key, value] as const]
            : []
      );

      return applicable.length > 0
        ? { ...node, ...Object.fromEntries(applicable) }
        : node;
    }
    if (!ElementApi.isElement(node)) return node;

    return {
      ...node,
      children: applyTextProperties(
        node.children,
        properties,
        state,
        node.type
      ),
    };
  });

const isInlineDescendant = (node: Descendant, state: EditorCoreStateView) => {
  if (TextApi.isText(node)) return true;
  if (!ElementApi.isElement(node)) return false;

  return state.schema.element(node.type)?.behavior.inline === true;
};

const tryFitDecodedChildren = (
  children: readonly Descendant[],
  parent: PliteElement,
  state: EditorCoreStateView
): Descendant[] | null => {
  const fitted = state.slice.fitContent(ContentSlice.closed(children), {
    parent: { ...parent, children: [] },
  });

  return fitted ? [...fitted] : null;
};

const wrapRootInlineRuns = (
  descendants: readonly Descendant[],
  state: EditorCoreStateView
): Descendant[] => {
  const result: Descendant[] = [];
  let inlineRun: Descendant[] = [];
  const flush = () => {
    if (inlineRun.length === 0) return;
    const fallback = state.schema.createDefaultRootChild();

    if (ElementApi.isElement(fallback)) {
      const children = tryFitDecodedChildren(inlineRun, fallback, state);

      if (children) {
        result.push({ ...fallback, children });
      } else {
        result.push(...inlineRun);
      }
    } else {
      result.push(...inlineRun);
    }
    inlineRun = [];
  };

  descendants.forEach((node) => {
    if (isInlineDescendant(node, state)) {
      inlineRun.push(node);

      return;
    }
    flush();
    result.push(node);
  });
  flush();

  return result;
};

const coalesceAdjacentText = (
  descendants: readonly Descendant[]
): Descendant[] => {
  const result: Descendant[] = [];

  for (const node of descendants) {
    const normalized = ElementApi.isElement(node)
      ? { ...node, children: coalesceAdjacentText(node.children) }
      : node;
    const previous = result.at(-1);

    if (TextApi.isText(previous) && TextApi.isText(normalized)) {
      const { text: previousText, ...previousProperties } = previous;
      const { text, ...properties } = normalized;

      if (isEqual(previousProperties, properties)) {
        result[result.length - 1] = {
          ...previous,
          text: previousText + text,
        };
        continue;
      }
    }

    result.push(normalized);
  }

  return result;
};

const fitDecodedChildren = (
  children: readonly Descendant[],
  parent: PliteElement,
  state: EditorCoreStateView
): Descendant[] =>
  tryFitDecodedChildren(children, parent, state) ?? [...children];

const childrenMatchParentContent = (
  children: readonly Descendant[],
  parentType: string,
  state: EditorCoreStateView
) => {
  const content = state.schema.element(parentType)?.content;

  if (
    !content ||
    children.length < content.min ||
    (content.max !== null && children.length > content.max)
  ) {
    return false;
  }

  return children.every((child) => {
    if (TextApi.isText(child)) return content.allowsText;
    if (!ElementApi.isElement(child)) return false;

    return state.schema.allowsElementType(parentType, child.type);
  });
};

const shouldBrBecomeEmptyParagraph = (node: HTMLElement) => {
  if (node.nodeName !== 'BR') return false;
  if ((node as HTMLBRElement).className === 'Apple-interchange-newline') {
    return false;
  }
  const parent = node.parentElement;

  if (!parent || parent.tagName === 'P' || parent.tagName === 'SPAN') {
    return false;
  }
  let sibling: Node | null = node.previousSibling;

  while (sibling) {
    if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
      return false;
    }
    sibling = sibling.previousSibling;
  }
  sibling = node.nextSibling;
  while (sibling) {
    if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
      return false;
    }
    sibling = sibling.nextSibling;
  }

  return true;
};

const decodeCompiledHtml = (
  editor: BaseEditor,
  root: HTMLElement,
  matcherIndex: CompiledHtmlMatcherIndex,
  state: EditorCoreStateView
): Descendant[] => {
  const decodeElementProperties = (
    element: HTMLElement,
    matched: readonly CompiledHtmlRule[],
    targetType: string,
    initial: Readonly<Record<string, unknown>> = {}
  ) => {
    const properties: Record<string, unknown> = { ...initial };

    for (const rule of matched.filter(
      (candidate) =>
        candidate.kind === 'element-property' && !candidate.createsElement
    )) {
      const hasUnresolvedApplicableProperty = rule.properties.some(
        (property) =>
          propertyAppliesToType(property, state, targetType) &&
          !Object.hasOwn(properties, property.key)
      );

      if (!hasUnresolvedApplicableProperty) continue;
      const decoded = invokeDecode(editor, rule, element, state, (value) =>
        propertyValuesFromDecode(rule, value)
      );

      if (decoded === undefined) continue;
      for (const [key, value] of decoded) {
        const property =
          rule.properties.find((candidate) => candidate.key === key) ??
          failInvariant('Expected value to be defined');

        if (
          propertyAppliesToType(property, state, targetType) &&
          !Object.hasOwn(properties, key)
        ) {
          properties[key] = value;
        }
      }
    }

    return properties;
  };
  const decodeChildren = (
    parent: HTMLElement,
    parentType: string | null
  ): Descendant[] =>
    Array.from(parent.childNodes).flatMap((child) =>
      decodeNode(child, parentType)
    );

  const decodeNode = (
    node: ChildNode,
    parentType: string | null
  ): Descendant[] => {
    const text = htmlTextNodeToString(node);

    if (text !== undefined) return text ? [{ text }] : [];
    if (!isHtmlElement(node)) return [];
    const element = node as HTMLElement;

    if (element.hasAttribute('data-plite-spacer')) return [];
    if (shouldBrBecomeEmptyParagraph(element)) {
      const fallback = state.schema.createDefaultRootChild();

      return ElementApi.isElement(fallback) ? [fallback] : [];
    }
    if (
      node.nodeName === 'BR' &&
      (node as HTMLBRElement).className === 'Apple-interchange-newline'
    ) {
      return [];
    }
    const breakLine = htmlBrToNewLine(node);

    if (breakLine) return [{ text: breakLine }];
    if (!isSafeDecodedElement(element)) return [];

    const matched = getMatchedRules(matcherIndex, element);
    const elementRules = matched.filter(
      (rule) => rule.kind === 'element' || rule.createsElement
    );
    let structural:
      | Readonly<{
          result: Record<string, unknown>;
          rule: CompiledHtmlRule;
        }>
      | undefined;

    for (const rule of elementRules) {
      if (
        rule.createsElement &&
        !rule.properties.some((property) =>
          propertyAppliesToType(property, state, rule.targetType)
        )
      ) {
        continue;
      }
      const result = invokeDecode(editor, rule, element, state, (value) =>
        validateExplicitDecodedChildren(
          rule,
          elementValuesFromDecode(rule, value),
          state
        )
      );

      if (result === undefined) continue;
      structural = Object.freeze({ result, rule });
      break;
    }

    const defaultRootChild =
      !structural && parentType === null && isHtmlBlockElement(element)
        ? state.schema.createDefaultRootChild()
        : null;
    const fallbackRootElement = ElementApi.isElement(defaultRootChild)
      ? defaultRootChild
      : null;
    const createdType =
      structural?.rule.targetType ?? fallbackRootElement?.type ?? parentType;
    const childParentType = structural?.rule.targetType ?? parentType;
    const hasExplicitChildren =
      structural !== undefined && Object.hasOwn(structural.result, 'children');
    const decodedChildren = hasExplicitChildren
      ? (structural?.result.children as Descendant[])
      : decodeChildren(element, childParentType);
    const hasDecodedChildren =
      hasExplicitChildren || decodedChildren.length > 0;
    const propertyParentType = createdType ?? getDefaultRootType(state);
    const markValues = new Map<string, DecodedHtmlProperty>();

    for (const rule of matched.filter(
      (candidate) => candidate.kind === 'mark'
    )) {
      const unresolvedProperties = rule.properties.filter(
        (property) => !markValues.has(property.id)
      );

      if (
        !descendantsHaveApplicableText(
          decodedChildren,
          unresolvedProperties,
          state,
          propertyParentType
        )
      ) {
        continue;
      }
      const decoded = invokeDecode(editor, rule, element, state, (value) =>
        propertyValuesFromDecode(rule, value)
      );

      if (decoded === undefined) continue;
      for (const [key, value] of decoded) {
        const property =
          rule.properties.find((candidate) => candidate.key === key) ??
          failInvariant('Expected value to be defined');

        if (!markValues.has(property.id)) {
          markValues.set(property.id, Object.freeze({ property, value }));
        }
      }
    }
    const markedChildren =
      markValues.size > 0
        ? applyTextProperties(
            decodedChildren,
            markValues,
            state,
            propertyParentType
          )
        : decodedChildren;

    const initialProperties: Record<string, unknown> = {};

    structural?.rule.properties.forEach((property) => {
      if (
        propertyAppliesToType(property, state, structural.rule.targetType) &&
        Object.hasOwn(structural.result, property.key)
      ) {
        initialProperties[property.key] = structural.result[property.key];
      }
    });
    const properties = createdType
      ? decodeElementProperties(
          element,
          matched,
          createdType,
          initialProperties
        )
      : initialProperties;

    if (!structural) {
      if (markedChildren.length === 0 && isHtmlBlockElement(element)) {
        return [];
      }
      if (
        fallbackRootElement &&
        markedChildren.every((child) => isInlineDescendant(child, state))
      ) {
        const createdElement = state.schema.create(
          fallbackRootElement.type,
          properties
        );
        const children = tryFitDecodedChildren(
          markedChildren,
          createdElement,
          state
        );

        if (children) {
          return [
            {
              ...createdElement,
              ...properties,
              children,
            },
          ];
        }
      }
      if (parentType && isHtmlBlockElement(element)) {
        if (childrenMatchParentContent(markedChildren, parentType, state)) {
          return markedChildren;
        }

        return fitDecodedChildren(
          markedChildren,
          state.schema.create(parentType),
          state
        );
      }

      return markedChildren;
    }

    const createdElement = state.schema.create(
      structural.rule.targetType ??
        failInvariant('Expected value to be defined'),
      properties
    );
    const children =
      hasDecodedChildren && !hasExplicitChildren
        ? fitDecodedChildren(markedChildren, createdElement, state)
        : markedChildren;

    return [
      {
        ...createdElement,
        ...properties,
        children: hasDecodedChildren ? children : createdElement.children,
      },
    ];
  };

  return coalesceAdjacentText(
    wrapRootInlineRuns(
      root.tagName === 'BODY'
        ? decodeChildren(root, null)
        : decodeNode(root, null),
      state
    )
  );
};

const normalizeAttributeName = (name: string) => name.toLowerCase();

const normalizeHtmlValue = (
  value: unknown,
  label: string
): boolean | number | string | null => {
  if (value === undefined || value === null || value === false) return null;
  if (
    value !== true &&
    typeof value !== 'string' &&
    typeof value !== 'number'
  ) {
    throw new Error(`${label} must be a string, number, boolean, or null.`);
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error(`${label} number must be finite.`);
  }

  return value;
};

const setWrite = <T>(
  writes: Map<string, T>,
  key: string,
  value: T,
  label: string
) => {
  if (writes.has(key) && !isEqual(writes.get(key), value)) {
    throw new Error(`Plate HTML encode has conflicting ${label} "${key}".`);
  }
  writes.set(key, value);
};

const compileWrites = (
  value: Record<string, unknown>,
  label: string,
  tag: string
): Pick<MutableHtmlNode, 'attributeWrites' | 'styleWrites'> => {
  const attributeWrites = new Map<string, boolean | number | string | null>();
  const styleWrites = new Map<string, number | string | null>();

  if (value.attributes !== undefined) {
    if (!isRecord(value.attributes)) {
      throw new Error(`${label} attributes must be an object.`);
    }
    Object.entries(value.attributes).forEach(([rawName, rawValue]) => {
      const name = normalizeAttributeName(rawName);

      if (
        !HTML_ATTRIBUTE_RE.test(name) ||
        name.startsWith('on') ||
        name === 'srcdoc'
      ) {
        throw new Error(`${label} has unsafe attribute "${rawName}".`);
      }
      const normalized = normalizeHtmlValue(
        rawValue,
        `${label} attribute "${name}"`
      );

      if (
        HTML_URL_ATTRIBUTES.has(name) &&
        typeof normalized === 'string' &&
        !isSafeHtmlUrl(tag, name, normalized)
      ) {
        throw new Error(`${label} has unsafe URL attribute "${rawName}".`);
      }
      setWrite(attributeWrites, name, normalized, 'attribute');
    });
  }
  if (value.style !== undefined) {
    if (!isRecord(value.style)) {
      throw new Error(`${label} style must be an object.`);
    }
    if (attributeWrites.has('style')) {
      throw new Error(`${label} cannot use two style channels.`);
    }
    Object.entries(value.style).forEach(([rawName, rawValue]) => {
      const name = normalizeStyleName(rawName);

      if (!HTML_STYLE_NAME_RE.test(name)) {
        throw new Error(`${label} has unsafe style name "${rawName}".`);
      }
      const normalized = normalizeHtmlValue(
        rawValue,
        `${label} style "${name}"`
      );

      if (normalized === true) {
        throw new Error(`${label} style "${name}" cannot be boolean.`);
      }
      if (typeof normalized === 'string') {
        assertSafeStyleValue(normalized, tag, name, `${label} style "${name}"`);
      }
      setWrite(styleWrites, name, normalized, 'style');
    });
  }

  return { attributeWrites, styleWrites };
};

const compileNodeSpec = (
  value: unknown,
  seen: WeakSet<object>
): MutableHtmlNode => {
  if (!isRecord(value)) {
    throw new Error('Plate HTML node encoder must return an object.');
  }
  if (seen.has(value)) {
    throw new Error('Plate HTML node spec cannot be cyclic or reused.');
  }
  seen.add(value);
  Object.keys(value).forEach((field) => {
    if (!HTML_NODE_FIELDS.has(field)) {
      throw new Error(`Plate HTML node spec has unknown field "${field}".`);
    }
  });
  if (typeof value.tag !== 'string') {
    throw new Error('Plate HTML node spec tag must be a string.');
  }
  const tag = value.tag.toLowerCase();

  if (!HTML_TAG_RE.test(tag) || HTML_UNSAFE_TAGS.has(tag)) {
    throw new Error(`Plate HTML node spec has unsafe tag "${value.tag}".`);
  }
  if (value.patchTarget !== undefined && value.patchTarget !== true) {
    throw new Error('Plate HTML node spec patchTarget must be true.');
  }
  const writes = compileWrites(value, 'Plate HTML node spec', tag);
  const inputChildren =
    value.children === undefined
      ? HTML_VOID_TAGS.has(tag)
        ? []
        : [HTML_CONTENT_TOKEN]
      : value.children === HTML_CONTENT_TOKEN
        ? [HTML_CONTENT_TOKEN]
        : value.children;

  if (!Array.isArray(inputChildren)) {
    throw new Error(
      'Plate HTML node spec children must be the content token or an array.'
    );
  }
  const children = inputChildren.map((child) => {
    if (child === HTML_CONTENT_TOKEN) return child;
    if (isRecord(child) && Object.keys(child).length === 1 && 'text' in child) {
      if (typeof child.text !== 'string') {
        throw new Error('Plate HTML literal text must be a string.');
      }

      return Object.freeze({ text: child.text });
    }

    return compileNodeSpec(child, seen);
  });

  return {
    ...writes,
    children,
    patchTarget: value.patchTarget === true,
    tag,
  };
};

const findPatchTarget = (root: MutableHtmlNode) => {
  const targets: MutableHtmlNode[] = [];
  const visit = (node: MutableHtmlNode) => {
    if (node.patchTarget) targets.push(node);
    node.children.forEach((child) => {
      if (child !== HTML_CONTENT_TOKEN && 'tag' in child) visit(child);
    });
  };

  visit(root);
  if (targets.length > 1) {
    throw new Error('Plate HTML node spec has duplicate patchTarget markers.');
  }

  return targets[0] ?? root;
};

const applyPatch = (target: MutableHtmlNode, value: unknown) => {
  if (!isRecord(value)) {
    throw new Error('Plate HTML property encoder must return a patch object.');
  }
  Object.keys(value).forEach((field) => {
    if (!HTML_PATCH_FIELDS.has(field)) {
      throw new Error(`Plate HTML patch has unknown field "${field}".`);
    }
  });
  if (value.tag !== undefined || value.children !== undefined) {
    throw new Error('Plate HTML patches cannot replace tag or children.');
  }
  const writes = compileWrites(value, 'Plate HTML patch', target.tag);

  if (
    (target.attributeWrites.has('style') && writes.styleWrites.size > 0) ||
    (target.styleWrites.size > 0 && writes.attributeWrites.has('style'))
  ) {
    throw new Error('Plate HTML encode cannot use two style channels.');
  }
  writes.attributeWrites.forEach((entry, key) => {
    setWrite(target.attributeWrites, key, entry, 'attribute');
  });
  writes.styleWrites.forEach((entry, key) => {
    setWrite(target.styleWrites, key, entry, 'style');
  });
};

const escapeHtmlText = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const escapeHtmlAttribute = (value: string) =>
  escapeHtmlText(value).replaceAll('"', '&quot;');

const renderNodeSpec = (
  root: MutableHtmlNode,
  content: string,
  allowVoidRoot = false
) => {
  let contentTokens = 0;
  const render = (node: MutableHtmlNode): string => {
    const attributes = [...node.attributeWrites.entries()]
      .filter(([, value]) => value !== null)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, value]) =>
        value === true
          ? ` ${name}`
          : ` ${name}="${escapeHtmlAttribute(String(value))}"`
      );
    const styles = [...node.styleWrites.entries()]
      .filter(([, value]) => value !== null)
      .sort(([left], [right]) => left.localeCompare(right));

    if (styles.length > 0) {
      const style = styles
        .map(([name, value]) => `${name}: ${String(value)}`)
        .join('; ');

      attributes.push(` style="${escapeHtmlAttribute(style)}"`);
    }
    const open = `<${node.tag}${attributes.join('')}>`;

    if (HTML_VOID_TAGS.has(node.tag)) {
      if (node.children.length > 0) {
        throw new Error(
          `Plate HTML void element "${node.tag}" cannot have children.`
        );
      }

      return open;
    }
    const children = node.children
      .map((child) => {
        if (child === HTML_CONTENT_TOKEN) {
          contentTokens += 1;

          return content;
        }
        if ('text' in child) return escapeHtmlText(child.text);
        if ('tag' in child) return render(child);

        throw new Error('Plate HTML node spec contains an invalid child.');
      })
      .join('');

    return `${open}${children}</${node.tag}>`;
  };
  const html = render(root);

  if (HTML_VOID_TAGS.has(root.tag) && !allowVoidRoot) {
    throw new Error(
      `Plate HTML non-void schema element cannot encode as void tag "${root.tag}".`
    );
  }
  if (!HTML_VOID_TAGS.has(root.tag) && contentTokens !== 1) {
    throw new Error(
      'Plate HTML node spec must consume the content token exactly once.'
    );
  }

  return html;
};

const propertyValue = (
  node: PliteElement | Text,
  property: CompiledHtmlProperty,
  state: EditorCoreStateView,
  parentType: string | null
) => {
  const type = ElementApi.isElement(node) ? node.type : parentType;
  const compiled = state.schema.property({
    key: property.key,
    placement: property.property.placement,
    ...(type ? { type } : {}),
  });

  if (!compiled || compiled.id !== property.id) return undefined;
  const descriptor = compiled.value;
  const value =
    node[property.key] === undefined && 'default' in descriptor
      ? descriptor.default
      : node[property.key];

  if (
    compiled.role === 'metadata' ||
    value === undefined ||
    (descriptor.omitDefault &&
      'default' in descriptor &&
      isEqual(value, descriptor.default))
  ) {
    return undefined;
  }

  return value;
};

const hasContentValue = (
  node: PliteElement | Text,
  key: string,
  property: Pick<
    NonNullable<ReturnType<EditorCoreStateView['schema']['property']>>,
    'role' | 'value'
  >
) => {
  const descriptor = property.value;
  const value =
    node[key] === undefined && 'default' in descriptor
      ? descriptor.default
      : node[key];

  return (
    property.role === 'content' &&
    value !== undefined &&
    !(
      descriptor.omitDefault &&
      'default' in descriptor &&
      isEqual(value, descriptor.default)
    )
  );
};

const assertSupportedProperties = (
  node: PliteElement | Text,
  parentType: string | null,
  supportedPropertyIds: ReadonlySet<string>,
  state: EditorCoreStateView
) => {
  const placement = ElementApi.isElement(node) ? 'element' : 'text';
  const type = ElementApi.isElement(node) ? node.type : parentType;

  for (const key of Object.keys(node)) {
    if (key === 'children' || key === 'text' || key === 'type') continue;
    const property = state.schema.property({
      key,
      placement,
      ...(type ? { type } : {}),
    });

    if (
      property &&
      !supportedPropertyIds.has(property.id) &&
      hasContentValue(node, key, property)
    ) {
      throw new Error(
        `Plate HTML encode has no encoder for content property "${key}".`
      );
    }
  }
  const propertyIds = ElementApi.isElement(node)
    ? (state.schema.element(node.type)?.propertyIds ?? [])
    : state.schema.getVocabulary().propertyIds;
  const compiledSchema = getCompiledEditorSchemaFromApi(state.schema);

  for (const id of propertyIds) {
    const compiledProperty = compiledSchema?.properties.byId.get(id);
    const property = compiledProperty
      ? {
          id: compiledProperty.id,
          key: compiledProperty.key,
          placement: compiledProperty.placement,
          role: compiledProperty.role,
          value: compiledProperty.descriptor,
        }
      : null;

    if (
      !property ||
      typeof property.key !== 'string' ||
      property.placement !== placement
    ) {
      continue;
    }
    if (!ElementApi.isElement(node)) {
      const resolved = state.schema.property({
        key: property.key,
        placement: 'text',
        ...(parentType ? { type: parentType } : {}),
      });

      if (resolved?.id !== id) continue;
    }
    if (
      !supportedPropertyIds.has(id) &&
      hasContentValue(node, property.key, property)
    ) {
      throw new Error(
        `Plate HTML encode has no encoder for content property "${property.key}".`
      );
    }
  }
};

const encodeContext = (
  rule: CompiledHtmlRule,
  node: PliteElement | Text,
  state: EditorCoreStateView,
  parentType: string | null
) => {
  const values = new Map<string, unknown>();

  rule.properties.forEach((property) => {
    const value = propertyValue(node, property, state, parentType);

    if (value !== undefined) values.set(property.key, value);
  });
  const record = Object.fromEntries(values);

  return {
    context:
      rule.properties.length === 1 && rule.kind !== 'element'
        ? Object.freeze({
            node,
            state,
            value: values.get(rule.properties[0].key),
          })
        : rule.kind === 'element' || rule.createsElement
          ? Object.freeze({
              content: HTML_CONTENT_TOKEN,
              node,
              state,
            })
          : Object.freeze({ node, state, values: Object.freeze(record) }),
    hasValues: values.size > 0,
  };
};

const compileWrapperSpec = (value: unknown): MutableHtmlNode => {
  if (!isRecord(value)) {
    throw new Error('Plate HTML mark encoder must return a wrapper object.');
  }
  Object.keys(value).forEach((field) => {
    if (!HTML_WRAPPER_FIELDS.has(field)) {
      throw new Error(`Plate HTML wrapper has unknown field "${field}".`);
    }
  });

  return compileNodeSpec(
    { ...value, children: HTML_CONTENT_TOKEN },
    new WeakSet()
  );
};

const encodeCompiledHtml = (
  editor: BaseEditor,
  slice: ContentSlice,
  serializerIndex: CompiledHtmlSerializerIndex,
  state: EditorCoreStateView
) => {
  const encodeNode = (node: Descendant, parentType: string | null): string => {
    if (TextApi.isText(node)) {
      assertSupportedProperties(
        node,
        parentType,
        serializerIndex.encodablePropertyIds,
        state
      );
      const wrappers: Array<
        Readonly<{
          root: MutableHtmlNode;
          rule: CompiledHtmlRule;
        }>
      > = [];
      const handled = new Set<string>();

      for (const rule of parentType
        ? (serializerIndex.marksByParentType.get(parentType) ?? [])
        : []) {
        const pending = rule.properties.filter(
          (property) =>
            !handled.has(property.id) &&
            propertyValue(node, property, state, parentType) !== undefined
        );

        if (pending.length === 0) continue;
        const { context } = encodeContext(rule, node, state, parentType);
        const root = encodeWithRule(editor, rule, node, parentType, () => {
          const value = (
            rule.declaration.encode ??
            failInvariant('Expected value to be defined')
          )(context);

          if (value === null) {
            throw new Error(
              `Plate HTML codec "${rule.owner}" returned null for a present mark.`
            );
          }

          return compileWrapperSpec(value);
        });

        wrappers.push(Object.freeze({ root, rule }));
        pending.forEach(({ id }) => {
          handled.add(id);
        });
      }
      let html = escapeHtmlText(node.text);

      for (let index = wrappers.length - 1; index >= 0; index--) {
        const wrapper = wrappers[index];

        html = encodeWithRule(editor, wrapper.rule, node, parentType, () =>
          renderNodeSpec(wrapper.root, html)
        );
      }

      return html;
    }
    if (!ElementApi.isElement(node)) return '';
    assertSupportedProperties(
      node,
      parentType,
      serializerIndex.encodablePropertyIds,
      state
    );

    const content = node.children
      .map((child) => encodeNode(child, node.type))
      .join('');
    const structuralRules = serializerIndex.elementsByType.get(node.type) ?? [];
    let structuralRule: CompiledHtmlRule | undefined;
    let structuralContext: Record<string, unknown> | undefined;

    for (const rule of structuralRules) {
      const encoded = encodeContext(rule, node, state, parentType);

      if (rule.createsElement && !encoded.hasValues) continue;
      structuralRule = rule;
      structuralContext = encoded.context;
      break;
    }
    if (!structuralRule || !structuralRule.declaration.encode) {
      throw new Error(
        `Plate HTML encode has no encoder for element "${node.type}".`
      );
    }
    const { patchTarget, root } = encodeWithRule(
      editor,
      structuralRule,
      node,
      parentType,
      () => {
        const spec = (
          structuralRule.declaration.encode ??
          failInvariant('Expected value to be defined')
        )(structuralContext ?? failInvariant('Expected value to be defined'));

        if (spec === null) {
          throw new Error(
            `Plate HTML codec "${structuralRule.owner}" returned null for element "${node.type}".`
          );
        }
        const innerRoot = compileNodeSpec(spec, new WeakSet());

        return Object.freeze({
          patchTarget: findPatchTarget(innerRoot),
          root: innerRoot,
        });
      }
    );
    const handledProperties = new Set<string>(
      structuralRule.properties.map(({ id }) => id)
    );

    for (const rule of serializerIndex.elementPropertiesByType.get(node.type) ??
      []) {
      const pending = rule.properties.filter(
        (property) =>
          !handledProperties.has(property.id) &&
          propertyValue(node, property, state, parentType) !== undefined
      );

      if (pending.length === 0) continue;
      const { context } = encodeContext(rule, node, state, parentType);

      encodeWithRule(editor, rule, node, parentType, () => {
        const patch = (
          rule.declaration.encode ??
          failInvariant('Expected value to be defined')
        )(context);

        if (patch === null) {
          throw new Error(
            `Plate HTML codec "${rule.owner}" returned null for a present property.`
          );
        }
        applyPatch(patchTarget, patch);
      });
      pending.forEach(({ id }) => {
        handledProperties.add(id);
      });
    }

    return encodeWithRule(editor, structuralRule, node, parentType, () =>
      renderNodeSpec(
        root,
        content,
        state.schema.element(node.type)?.behavior.void === true
      )
    );
  };

  return slice.content.map((node) => encodeNode(node, null)).join('');
};

export const compilePlateHtmlCodec = (
  editor: BaseEditor,
  model: CompiledPlateModel,
  plugins: readonly AnyBasePlugin[]
): HostCodec => {
  const pluginsByName = new Map(
    plugins.map((plugin) => [plugin.name, plugin] as const)
  );
  const rules = Object.freeze(
    plugins
      .flatMap((plugin) =>
        getPluginDescriptorMetadata(plugin).htmlCodecContributions.map(
          ({ extension, targetPlugin }) =>
            compileRule(
              editor,
              model,
              pluginsByName,
              plugin,
              targetPlugin,
              extension
            )
        )
      )
      .sort(compareRules)
  );

  assertStaticConflicts(rules);
  const matcherIndex = compileMatcherIndex(rules);
  const serializerIndex = compileSerializerIndex(model, rules);

  const htmlPlugin = pluginsByName.get(HTML_PLUGIN_NAME);

  if (!htmlPlugin) throw new Error('Plate HTML plugin is not installed.');
  const registry = prepareHtmlRegistry(editor);
  const flatPipeline = registry.plugins;
  const parse = (context: HostCodecParseContext) => {
    const options = {
      data: context.data,
      format: context.format,
      source: context.source,
    };
    const transformedData = pipeTransformData(
      context.state,
      flatPipeline,
      options
    );
    const document = parseDOMClipboardHtml(transformedData);
    const root = collapseWhiteSpace(document.body);
    const fragment = decodeCompiledHtml(
      editor,
      root,
      matcherIndex,
      context.state
    );
    const transformedFragment = pipeTransformFragment(
      context.state,
      flatPipeline,
      {
        ...options,
        data: transformedData,
        fragment,
      }
    );

    if (transformedFragment.length === 0) return null;
    context.state.schema.assertFragment(transformedFragment);

    return ContentSlice.closed(transformedFragment);
  };

  const codec: HostCodec = Object.freeze({
    format: HTML_FORMAT,
    key: HTML_HOST_KEY,
    owns: Object.freeze([{ kind: 'schema' as const }]),
    parse,
    query: (context: HostCodecParseContext) =>
      pipePreparedInsertDataQuery(context.state, flatPipeline, {
        data: context.data,
        format: context.format,
        source: context.source,
      }),
    serialize: (context: HostCodecSerializeContext) => {
      try {
        return encodeCompiledHtml(
          editor,
          context.slice,
          serializerIndex,
          context.state
        );
      } catch (error) {
        if (error instanceof ReportedHtmlEncodeError) return null;

        throw error;
      }
    },
  });

  COMPILED_PLATE_HTML.set(
    model.revision,
    Object.freeze({
      matcherIndex,
      rules,
      serializerIndex,
    })
  );

  return codec;
};

export type HtmlApi<V extends Value = Value> = {
  deserialize: (options: {
    collapseWhiteSpace?: boolean;
    element: HTMLElement | string;
  }) => Array<DescendantIn<V>> | null;
};

export const HtmlPlugin = defineBasePlugin(HTML_PLUGIN_NAME, {
  api: ({ editor }): HtmlApi => ({
    deserialize: ({
      collapseWhiteSpace: shouldCollapseWhiteSpace = true,
      element,
    }: {
      collapseWhiteSpace?: boolean;
      element: HTMLElement | string;
    }): Descendant[] | null => {
      const model = getCompiledPlateModel(editor);
      const artifact = COMPILED_PLATE_HTML.get(model.revision);

      if (!artifact) {
        throw new Error('Plate HTML codec is not compiled.');
      }
      const root =
        typeof element === 'string' ? htmlStringToDOMNode(element) : element;
      const normalized = shouldCollapseWhiteSpace
        ? collapseWhiteSpace(root)
        : root;

      try {
        const fragment = editor.read((state) =>
          decodeCompiledHtml(editor, normalized, artifact.matcherIndex, state)
        );

        const schema: EditorStateSchemaApi = editor.read.schema;

        schema.assertFragment(fragment);

        return fragment;
      } catch (error) {
        reportEditorLifecycleError(
          Object.freeze({
            cause: new Error(
              `Plate HTML direct decode returned an invalid fragment for <${normalized.tagName.toLowerCase()}>: ${normalized.outerHTML.slice(0, 512)}`,
              { cause: error }
            ),
            editor,
            extensionName: 'plate:html',
            format: HTML_FORMAT,
            key: 'plate:html:decode',
            phase: 'parse' as const,
            source: 'host-codec' as const,
          })
        );

        return null;
      }
    },
  }),
});

export type HtmlDefinition = DefinitionOf<typeof HtmlPlugin>;
