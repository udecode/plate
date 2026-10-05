import isEqual from 'lodash/isEqual.js';

import type {
  DataTransferFormat,
  DataTransferDecodeContext,
  DataTransferEncodeContext,
} from '../../../dom/plite-dom.internal';
import {
  ContentSlice,
  createEditorView,
  EditorSchemaValidationError,
  ElementApi,
  getCompiledEditorSchemaFromApi,
  schema as schemaDefinition,
  reportEditorLifecycleError,
  TextApi,
  type Descendant,
  type EditorCoreStateView,
  type EditorDocumentValue,
  type Element as EditorElement,
  type InternalEditorSchemaApi,
  type Path,
  type PropertyValueDescriptor,
  type SchemaProperty,
  type SchemaTarget,
  type Text,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import {
  getCompiledPlateModel,
  type CompiledPlateModel,
  type CompiledModelBinding,
} from '../../../internal/plugin/compilePlateModel';
import {
  createPluginFormatModelView,
  createPluginFormatOperationContext,
} from '../../../internal/plugin/pluginFormatOperation';
import {
  getHtmlMappingSchemaFamilies,
  getPluginDescriptorMetadata,
  getPluginSchemaFamily,
} from '../../../internal/utils/mergePlugins';
import { decideUrl } from '../../../internal/utils/urlPolicy';
import type { Editor } from '../../editor';
import { projectPlateFormatDocument } from '../../editor/withPlite';
import type {
  AnyBasePlugin,
  DefinitionOf,
  ErasedPluginCallable,
  HtmlContentToken,
  HtmlMappingDiagnosticInput,
  HtmlMatcher,
} from '../../plugin';
import { definePlugin } from '../../plugin';
import { createPluginContext } from '../../plugin/createPluginContext.internal';
import {
  createBrowserHtmlDocument,
  getHtmlAstPlainText,
  materializeHtmlAst,
  parseHtmlAst,
} from './htmlAst';
import { isHtmlBlockElement, isHtmlElement, isHtmlText } from './htmlDom';
import {
  decideHtmlAttribute,
  HTML_UNSAFE_TAGS,
  sanitizeHtmlDom,
  type HtmlUnsafeRemoval,
} from './htmlSafety';
import type {
  HtmlApi,
  HtmlDiagnostic,
  HtmlDocumentParseResult,
  HtmlEditorParseOptions,
  HtmlEditorSerializeOptions,
  HtmlErrorDiagnostic,
  HtmlModelLocation,
  HtmlSerializeResult,
  HtmlSliceParseResult,
  HtmlSourceLocation,
  HtmlWarningDiagnostic,
} from './htmlTypes';

export type { HtmlApi } from './htmlTypes';

type HtmlRuleDeclaration = Readonly<{
  createsElement?: true;
  decode: (context: Record<string, unknown>) => unknown;
  decodeOnly?: true;
  encode?: (context: Record<string, unknown>) => unknown;
  match: readonly HtmlMatcher[];
  prepareDocument?: (context: Record<string, unknown>) => void;
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
  plugin: AnyBasePlugin;
  properties: readonly CompiledHtmlProperty[];
  propertyIdsByKey: ReadonlyMap<string, string>;
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
  elementWrappersByType: ReadonlyMap<string, readonly CompiledHtmlRule[]>;
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
  'prepareDocument',
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
const HTML_TAG_RE = /^[a-z][a-z0-9-]*$/;
const HTML_ATTRIBUTE_RE = /^[a-z_:][a-z0-9_.:-]*$/;
const HTML_CLASS_WHITESPACE_RE = /\s/;
const HTML_STYLE_NAME_RE = /^(?:--[A-Za-z_][A-Za-z0-9_-]*|-?[a-z][a-z0-9-]*)$/;
// A declaration value cannot open another declaration, block or comment, hide
// a function name behind an escape, or load through a function besides url().
const HTML_UNSAFE_STYLE_VALUE_RE =
  /[;{}\\]|\/\*|\*\/|\bimage-set\s*\(|\bsrc\s*\(/i;
const HTML_STYLE_URL_RE = /\burl *\(/gi;
const HTML_UNQUOTED_STYLE_URL_RE = /["'()\s]/;
const LEADING_WHITE_SPACE_RE = /^\s+/;
const TRAILING_NEWLINE_RE = /\n$/;

type CollapseWhiteSpaceState = {
  inlineFormattingContext: {
    atStart: boolean;
    lastHasTrailingWhiteSpace: boolean;
  } | null;
  whiteSpaceRule: 'normal' | 'pre' | 'pre-line';
};

export const htmlTextNodeToString = (node: ChildNode | HTMLElement) => {
  if (!isHtmlText(node)) return undefined;
  if (node.parentElement?.dataset.editorPreventDeserialization) return '';
  if (
    node.textContent === '\uFEFF' &&
    node.parentElement?.hasAttribute('data-editor-string')
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
  editor: Editor;
  getFormatContext: ReturnType<typeof createPluginFormatOperationContext>;
  matcherIndex: CompiledHtmlMatcherIndex;
  prepareDocument: readonly CompiledHtmlRule[];
  rules: readonly CompiledHtmlRule[];
  serializerIndex: CompiledHtmlSerializerIndex;
}>;

const COMPILED_PLATE_HTML = new WeakMap<object, CompiledPlateHtmlArtifact>();
const COMPILED_PLATE_HTML_BY_SCHEMA = new WeakMap<
  object,
  CompiledPlateHtmlArtifact
>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeStyleName = (name: string) =>
  name.startsWith('--')
    ? name
    : name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const hasControlCharacter = (value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return true;
  }

  return false;
};

// A CSS resource loads automatically, so each `url()` meets the image role.
const isSafeStyleValue = (value: string) => {
  if (hasControlCharacter(value) || HTML_UNSAFE_STYLE_VALUE_RE.test(value)) {
    return false;
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

      if (end === -1) return false;
      url = value.slice(offset + 1, end);
      offset = end + 1;
      while (value[offset] === ' ') offset += 1;
      if (value[offset] !== ')') return false;
    } else {
      const end = value.indexOf(')', offset);

      if (end === -1) return false;
      url = value.slice(offset, end).trim();
      if (HTML_UNQUOTED_STYLE_URL_RE.test(url)) return false;
      offset = end;
    }
    const decision = decideUrl('image', url);

    if (!decision.ok && decision.reason !== 'empty') return false;
    HTML_STYLE_URL_RE.lastIndex = offset + 1;
    match = HTML_STYLE_URL_RE.exec(value);
  }

  return true;
};

// Mapping-local priority owns HTML precedence; plugin application order does not.
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
  const label = `Plate HTML mapping "${owner}" matcher ${index}`;

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
  binding: CompiledModelBinding
): readonly CompiledHtmlProperty[] => {
  const byId = new Map<string, CompiledHtmlProperty>();

  binding.properties.forEach((property) => {
    if (typeof property.key !== 'string') {
      throw new Error(
        `Plate HTML mapping "${owner}" cannot claim prefix schema properties.`
      );
    }
    const { id } = schemaDefinition.handle.property(property);

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
  editor: Editor,
  model: CompiledPlateModel,
  pluginsByName: ReadonlyMap<string, AnyBasePlugin>,
  ownerPlugin: AnyBasePlugin,
  target: string | null,
  factory: ErasedPluginCallable,
  defaultBlockType: string | null
): CompiledHtmlRule => {
  function assertDeclaration(
    value: unknown
  ): asserts value is HtmlRuleDeclaration {
    if (!isRecord(value)) {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" callback must return an object.`
      );
    }
    Object.keys(value).forEach((field) => {
      if (!HTML_RULE_FIELDS.has(field)) {
        throw new Error(
          `Plate HTML mapping "${ownerPlugin.name}" has unknown field "${field}".`
        );
      }
    });
    if (!Array.isArray(value.match) || value.match.length === 0) {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" match must be a non-empty array.`
      );
    }
    if (typeof value.decode !== 'function') {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" decode must be a function.`
      );
    }
    if (
      value.prepareDocument !== undefined &&
      typeof value.prepareDocument !== 'function'
    ) {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" prepareDocument must be a function.`
      );
    }
    if (
      value.priority !== undefined &&
      (typeof value.priority !== 'number' || !Number.isFinite(value.priority))
    ) {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" priority must be finite.`
      );
    }
    if (value.createsElement !== undefined && value.createsElement !== true) {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" createsElement must be true when present.`
      );
    }
    if (value.decodeOnly !== undefined && value.decodeOnly !== true) {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" decodeOnly must be true when present.`
      );
    }
    if (value.decodeOnly === true) {
      if (value.encode !== undefined) {
        throw new Error(
          `Plate HTML mapping "${ownerPlugin.name}" cannot define encode with decodeOnly.`
        );
      }
    } else if (typeof value.encode !== 'function') {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" must define encode or decodeOnly: true.`
      );
    }
  }

  if (target === ownerPlugin.name) {
    throw new Error(
      `Plate HTML mapping "${ownerPlugin.name}" must use the self overload for its own schema.`
    );
  }
  const targetPlugin = target ? pluginsByName.get(target) : ownerPlugin;

  if (!targetPlugin || targetPlugin.enabled === false) {
    throw new Error(
      `Plate HTML mapping "${ownerPlugin.name}" targets missing or disabled plugin "${target}".`
    );
  }
  const authoredFamilies = getHtmlMappingSchemaFamilies(factory);

  if (
    !authoredFamilies ||
    getPluginSchemaFamily(ownerPlugin) !== authoredFamilies.owner ||
    getPluginSchemaFamily(targetPlugin) !== authoredFamilies.target
  ) {
    throw new Error(
      `Plate HTML mapping "${ownerPlugin.name}" owner or target "${targetPlugin.name}" belongs to a different schema family than its authored descriptor.`
    );
  }
  const binding = model.byName[targetPlugin.name];

  if (!binding) {
    throw new Error(
      `Plate HTML mapping "${ownerPlugin.name}" target "${targetPlugin.name}" has no compiled model binding.`
    );
  }
  const declaration = Reflect.apply(factory, undefined, [
    createPluginContext(editor, ownerPlugin),
  ]);

  assertDeclaration(declaration);
  if (target && declaration.createsElement) {
    throw new Error(
      `Plate HTML mapping "${ownerPlugin.name}" cannot use createsElement for foreign target "${target}".`
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
      `Plate HTML mapping "${ownerPlugin.name}" element targets cannot mix element and text property claims.`
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
      `Plate HTML mapping "${ownerPlugin.name}" target "${targetPlugin.name}" must own one element or properties of one placement.`
    );
  }

  if (declaration.createsElement) {
    if (kind !== 'element-property' || target) {
      throw new Error(
        `Plate HTML mapping "${ownerPlugin.name}" can use createsElement only for self-owned element properties.`
      );
    }
    const targetNames = targetPlugin.targetPlugins.map((primaryTarget) =>
      typeof primaryTarget === 'string' ? primaryTarget : primaryTarget.name
    );
    // Target order is membership, not intent: bare HTML content belongs in the
    // schema's default block, while other targets may require properties the
    // mapping cannot supply.
    const primaryName =
      targetNames.find(
        (name) =>
          defaultBlockType !== null &&
          model.byName[name]?.elementType === defaultBlockType
      ) ?? targetNames[0];
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
        `Plate HTML mapping "${ownerPlugin.name}" createsElement requires an installed element target.`
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
        `Plate HTML mapping "${ownerPlugin.name}" configured primary "${targetType}" does not satisfy property "${unsupported.key}".`
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
    plugin: ownerPlugin,
    properties,
    propertyIdsByKey: new Map(properties.map(({ id, key }) => [key, id])),
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
  for (const style of Array.from(element.style)) {
    add(index.styles.get(normalizeStyleName(style)));
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
          `Plate HTML formats "${left.owner}" and "${right.owner}" have equal priority and overlapping element candidates.`
        );
      }
      const rightClaims = new Set(ruleClaimKeys(right));
      const overlap = ruleClaimKeys(left).find((claim) =>
        rightClaims.has(claim)
      );

      if (overlap && decodeClaimsOverlap) {
        throw new Error(
          `Plate HTML formats "${left.owner}" and "${right.owner}" have equal priority and overlapping "${overlap}" match claims.`
        );
      }
      if (overlap && bothEncode) {
        throw new Error(
          `Plate HTML formats "${left.owner}" and "${right.owner}" have equal priority and competing encode claim "${overlap}".`
        );
      }
      if (
        bothEncode &&
        left.owner === right.owner &&
        left.kind === 'mark' &&
        right.kind === 'mark'
      ) {
        throw new Error(
          `Plate HTML mapping "${left.owner}" has unresolved wrapper ordering; assign distinct rule priorities.`
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
  const elementWrappersByType = new Map<string, readonly CompiledHtmlRule[]>();
  const marksByParentType = new Map<string, readonly CompiledHtmlRule[]>();
  const encodableRules = rules.filter(
    (rule) => typeof rule.declaration.encode === 'function'
  );
  const targetsType = (rule: CompiledHtmlRule, type: string) =>
    rule.properties.some(
      ({ property }) =>
        !property.target ||
        targetMatchesElementType(model, property.target, type) !== false
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
            targetsType(rule, type)
        )
      )
    );
    // A mapping that creates its primary target wraps its other targets.
    elementWrappersByType.set(
      type,
      Object.freeze(
        encodableRules.filter(
          (rule) =>
            rule.createsElement &&
            rule.targetType !== type &&
            targetsType(rule, type)
        )
      )
    );
    marksByParentType.set(
      type,
      Object.freeze(
        encodableRules.filter(
          (rule) => rule.kind === 'mark' && targetsType(rule, type)
        )
      )
    );
  });

  return Object.freeze({
    elementPropertiesByType,
    elementsByType,
    elementWrappersByType,
    marksByParentType,
  });
};

const reportDecodeError = (
  editor: Editor,
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
      pluginName: 'plate:html',
      mimeType: HTML_FORMAT,
      key: `plate:${rule.owner}:html:decode`,
      phase: 'decode' as const,
      source: 'data-transfer-format' as const,
    })
  );
};

/**
 * Run one decoder. The attributes it claims with `preserve` join `claims` only
 * when it returns a result.
 */
const invokeDecode = <T>(
  editor: Editor,
  rule: CompiledHtmlRule,
  element: HTMLElement,
  state: EditorCoreStateView,
  getFormatContext: ReturnType<typeof createPluginFormatOperationContext>,
  operationKey: object,
  source: () => HtmlSourceLocation,
  onLoss: ((loss: HtmlMappingLoss) => void) | undefined,
  normalize: (value: unknown) => T,
  reportErrors: boolean,
  claims: Set<string>
): T | undefined => {
  try {
    const before = element.outerHTML;
    const preserved = new Set<string>();
    const preserve = (...attributes: readonly string[]) => {
      for (const attribute of attributes) {
        preserved.add(normalizeAttributeName(attribute));
      }
    };
    const report = (diagnostic: HtmlMappingDiagnosticInput) => {
      if (!onLoss) {
        throw new Error(
          `Plate HTML format "${rule.owner}" reported unsupported content without a diagnostic collector.`
        );
      }
      onLoss(
        Object.freeze({
          ...diagnostic,
          owner: rule.owner,
          source: source(),
        })
      );
    };
    const result = rule.declaration.decode(
      Object.freeze({
        ...getFormatContext(rule.plugin, state, operationKey),
        element,
        preserve,
        report,
      })
    );

    if (element.outerHTML !== before) {
      throw new Error(
        `Plate HTML mapping "${rule.owner}" decode must not mutate its element.`
      );
    }
    if (result === undefined) return undefined;
    const normalized = normalize(result);

    for (const attribute of preserved) claims.add(attribute);

    return normalized;
  } catch (error) {
    if (!reportErrors) throw error;

    reportDecodeError(editor, rule, element, error);
  }

  return undefined;
};

class ReportedHtmlEncodeError extends Error {
  override name = 'ReportedHtmlEncodeError';
}

const encodeWithRule = <T>(
  editor: Editor,
  rule: CompiledHtmlRule,
  node: EditorElement | Text,
  parentType: string | null,
  run: () => T,
  reportErrors = true
): T => {
  try {
    return run();
  } catch (error) {
    if (!reportErrors) throw error;

    reportEditorLifecycleError(
      Object.freeze({
        cause: new Error(
          `Plate HTML encode failed for owner "${rule.owner}", node "${TextApi.isText(node) ? (parentType ?? 'text') : node.type}", claims "${ruleClaimKeys(rule).join(', ')}".`,
          { cause: error }
        ),
        editor,
        pluginName: 'plate:html',
        mimeType: HTML_FORMAT,
        key: `plate:${rule.owner}:html:encode`,
        phase: 'encode' as const,
        source: 'data-transfer-format' as const,
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
      `Plate HTML mapping "${rule.owner}" element decode must return an object.`
    );
  }
  const fields = new Set([
    'children',
    ...rule.properties.map(({ key }) => key),
  ]);
  const unknownField = Object.keys(value).find((field) => !fields.has(field));

  if (unknownField) {
    throw new Error(
      `Plate HTML mapping "${rule.owner}" element decode returned unowned field "${unknownField}".`
    );
  }
  if (Object.hasOwn(value, 'children') && !Array.isArray(value.children)) {
    throw new Error(
      `Plate HTML mapping "${rule.owner}" element decode children must be an array.`
    );
  }
  rule.properties.forEach((property) => {
    if (
      Object.hasOwn(value, property.key) &&
      !isValidPropertyValue(property, value[property.key])
    ) {
      throw new Error(
        `Plate HTML mapping "${rule.owner}" returned invalid property "${property.key}".`
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
      `Plate HTML mapping "${rule.owner}" returned children outside target "${rule.targetType}" schema.`
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
        `Plate HTML mapping "${rule.owner}" returned invalid property "${rule.properties[0].key}".`
      );
    }

    return new Map([[rule.properties[0].key, value]]);
  }
  if (!isRecord(value)) {
    throw new Error(
      `Plate HTML mapping "${rule.owner}" multi-property decode must return an object.`
    );
  }
  const fields = new Set(rule.properties.map(({ key }) => key));
  const unknownField = Object.keys(value).find((field) => !fields.has(field));

  if (unknownField) {
    throw new Error(
      `Plate HTML mapping "${rule.owner}" multi-property decode returned unowned field "${unknownField}".`
    );
  }
  rule.properties.forEach((property) => {
    if (
      Object.hasOwn(value, property.key) &&
      !isValidPropertyValue(property, value[property.key])
    ) {
      throw new Error(
        `Plate HTML mapping "${rule.owner}" returned invalid property "${property.key}".`
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
  parent: EditorElement,
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

/** Merge adjacent text leaves whose non-text properties are equal. @internal */
export const coalesceAdjacentText = <T extends Descendant>(
  descendants: readonly T[]
): T[] => {
  const result: T[] = [];

  for (const node of descendants) {
    const normalized: T = ElementApi.isElement(node)
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
  parent: EditorElement,
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
    if (sibling.nodeType === 3 && sibling.textContent?.trim()) {
      return false;
    }
    sibling = sibling.previousSibling;
  }
  sibling = node.nextSibling;
  while (sibling) {
    if (sibling.nodeType === 3 && sibling.textContent?.trim()) {
      return false;
    }
    sibling = sibling.nextSibling;
  }

  return true;
};

const htmlTreeLocation = (
  root: Element,
  element: Element
): HtmlSourceLocation => {
  const path: number[] = [];
  let current: Node | null = element;

  while (current && current !== root) {
    const parent: ParentNode | null = current.parentNode;

    if (!parent) break;
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, current));
    current = parent;
  }

  return Object.freeze({
    kind: 'tree' as const,
    path: Object.freeze(path),
    tag: element.tagName.toLowerCase(),
  });
};

// Unmapped embedded content is lost even when its fallback children survive.
// A <picture> is only a container: its <img> reports for itself. Mappings that
// decline one instance report their own loss.
const EMBEDDED_HTML_CONTENT = new Set([
  'audio',
  'canvas',
  'iframe',
  'img',
  'video',
]);

/**
 * The attributes Plate's own HTML mappings write. Parsing reports each one no
 * decoder claims, so HTML moving between editors never drops Plate data
 * silently; other markup, such as `class`, `style` or `id`, belongs to its
 * source. HTML conformance checks this set against what the mappings emit.
 *
 * @internal
 */
export const PLATE_HTML_ATTRIBUTES: ReadonlySet<string> = new Set([
  'data-checked',
  'data-code-trailing-newlines',
  'data-editor-media-provider',
  'data-editor-media-source-url',
  'data-editor-media-url',
  'data-editor-media-width',
  'data-editor-mention',
  'data-editor-mention-label',
  'data-editor-mention-ref',
  'data-editor-natural-height',
  'data-editor-natural-width',
  'data-indent',
  'data-language',
  'data-list-restart',
  'data-list-start',
  'data-list-style',
  'data-list-type',
  'data-text-indent',
]);

type HtmlDecodeOperation = Readonly<{
  fitSchema?: boolean;
  onLoss?: (loss: HtmlMappingLoss) => void;
  operationKey: object;
  reportMappingErrors?: boolean;
}>;

const decodeCompiledHtml = (
  editor: Editor,
  root: HTMLElement,
  artifact: CompiledPlateHtmlArtifact,
  state: EditorCoreStateView,
  operation: HtmlDecodeOperation
): Descendant[] => {
  const reportMappingErrors = operation.reportMappingErrors ?? true;
  const fitSchema = operation.fitSchema ?? true;
  // Attributes each source element's kept results represent.
  const claimedAttributes = new Map<Element, Set<string>>();
  const claim = (element: Element, attributes: ReadonlySet<string>) => {
    if (attributes.size === 0) return;
    const claimed = claimedAttributes.get(element) ?? new Set<string>();

    for (const attribute of attributes) claimed.add(attribute);
    claimedAttributes.set(element, claimed);
  };
  // A lost element reports once; its attributes are lost with it.
  const lostElements = new Set<Element>();
  const lossAt = (element: Element) =>
    operation.onLoss &&
    ((loss: HtmlMappingLoss) => {
      if (loss.kind === 'element') lostElements.add(element);
      operation.onLoss?.(loss);
    });
  const decodeElementProperties = (
    element: HTMLElement,
    matched: readonly CompiledHtmlRule[],
    targetType: string,
    source: () => HtmlSourceLocation,
    initial: Readonly<Record<string, unknown>>,
    claims: Set<string>
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
      const ruleClaims = new Set<string>();
      const decoded = invokeDecode(
        editor,
        rule,
        element,
        state,
        artifact.getFormatContext,
        operation.operationKey,
        source,
        lossAt(element),
        (value) => propertyValuesFromDecode(rule, value),
        reportMappingErrors,
        ruleClaims
      );

      if (decoded === undefined) continue;
      let applied = false;

      for (const [key, value] of decoded) {
        const property =
          rule.properties.find((candidate) => candidate.key === key) ??
          failInvariant('Expected value to be defined');

        if (
          propertyAppliesToType(property, state, targetType) &&
          !Object.hasOwn(properties, key)
        ) {
          properties[key] = value;
          applied = true;
        }
      }
      if (applied) {
        for (const attribute of ruleClaims) claims.add(attribute);
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

    if (element.hasAttribute('data-editor-spacer')) return [];
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

    const matched = getMatchedRules(artifact.matcherIndex, element);
    let location: HtmlSourceLocation | undefined;
    // A tree path costs a sibling scan, so only a reported element pays it.
    const source = () => (location ??= htmlTreeLocation(root, element));
    const elementRules = matched.filter(
      (rule) => rule.kind === 'element' || rule.createsElement
    );
    let structural:
      | Readonly<{
          claims: ReadonlySet<string>;
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
      const claims = new Set<string>();
      const result = invokeDecode(
        editor,
        rule,
        element,
        state,
        artifact.getFormatContext,
        operation.operationKey,
        source,
        lossAt(element),
        (value) =>
          validateExplicitDecodedChildren(
            rule,
            elementValuesFromDecode(rule, value),
            state
          ),
        reportMappingErrors,
        claims
      );

      if (result === undefined) continue;
      structural = Object.freeze({ claims, result, rule });
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
      const ruleClaims = new Set<string>();
      const decoded = invokeDecode(
        editor,
        rule,
        element,
        state,
        artifact.getFormatContext,
        operation.operationKey,
        source,
        lossAt(element),
        (value) => propertyValuesFromDecode(rule, value),
        reportMappingErrors,
        ruleClaims
      );

      if (decoded === undefined) continue;
      let applied = false;

      for (const [key, value] of decoded) {
        const property =
          rule.properties.find((candidate) => candidate.key === key) ??
          failInvariant('Expected value to be defined');

        if (!markValues.has(property.id)) {
          markValues.set(property.id, Object.freeze({ property, value }));
          applied = true;
        }
      }
      if (applied) claim(element, ruleClaims);
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
    const propertyClaims = new Set<string>();
    const properties = createdType
      ? decodeElementProperties(
          element,
          matched,
          createdType,
          source,
          initialProperties,
          propertyClaims
        )
      : initialProperties;

    if (!structural) {
      const tag = element.tagName.toLowerCase();

      if (elementRules.length === 0 && EMBEDDED_HTML_CONTENT.has(tag)) {
        lossAt(element)?.(
          Object.freeze({
            action:
              markedChildren.length === 0
                ? ('dropped' as const)
                : ('replaced' as const),
            kind: 'element' as const,
            message:
              markedChildren.length === 0
                ? `Plate HTML decode has no mapping for <${tag}>.`
                : `Plate HTML decode has no mapping for <${tag}>; kept its fallback content.`,
            owner: 'plate:html',
            source: source(),
          })
        );

        if (markedChildren.length === 0) return [];
      }
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
        const children = fitSchema
          ? tryFitDecodedChildren(markedChildren, createdElement, state)
          : [...markedChildren];

        if (children) {
          claim(element, propertyClaims);

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

        return fitSchema
          ? fitDecodedChildren(
              markedChildren,
              state.schema.create(parentType),
              state
            )
          : markedChildren;
      }

      return markedChildren;
    }

    let content = markedChildren;

    // A created element that holds one block, such as a list item holding a
    // heading, puts its properties on that block when the block's type
    // carries them. Otherwise a text block gives the created element its text.
    if (structural.rule.createsElement && !hasExplicitChildren) {
      const block = getSoleBlock(markedChildren);
      const carried = structural.rule.properties.filter(({ key }) =>
        Object.hasOwn(structural.result, key)
      );

      if (
        block &&
        carried.every((property) =>
          propertyAppliesToType(property, state, block.type)
        )
      ) {
        const blockClaims = new Set(structural.claims);
        const blockProperties = decodeElementProperties(
          element,
          matched,
          block.type,
          source,
          Object.fromEntries(
            carried.map(({ key }) => [key, structural.result[key]])
          ),
          blockClaims
        );

        claim(element, blockClaims);

        return [{ ...block, ...blockProperties }];
      }
      if (block && isTextBlock(block)) content = [...block.children];
    }
    claim(element, structural.claims);
    claim(element, propertyClaims);
    const createdElement = state.schema.create(
      structural.rule.targetType ??
        failInvariant('Expected value to be defined'),
      properties
    );
    const children =
      fitSchema && hasDecodedChildren && !hasExplicitChildren
        ? fitDecodedChildren(content, createdElement, state)
        : content;

    return liftDisallowedBlocks({
      ...createdElement,
      ...properties,
      children: hasDecodedChildren ? children : createdElement.children,
    });
  };

  // The only block among `children` when the rest is white space.
  const getSoleBlock = (children: readonly Descendant[]) => {
    let block: EditorElement | undefined;

    for (const child of children) {
      if (TextApi.isText(child)) {
        if (child.text.trim() !== '') return undefined;
      } else if (
        block ||
        !ElementApi.isElement(child) ||
        isInlineDescendant(child, state)
      ) {
        return undefined;
      } else {
        block = child;
      }
    }

    return block;
  };
  const isTextBlock = (block: EditorElement) => {
    const behavior = state.schema.element(block.type)?.behavior;

    return (
      behavior !== undefined &&
      !behavior.object &&
      !behavior.void &&
      block.children.every((child) => isInlineDescendant(child, state))
    );
  };

  // HTML permits block content such as images inside text blocks; the editor
  // grammar does not, so each disallowed block child becomes a sibling.
  const liftDisallowedBlocks = (element: EditorElement): Descendant[] => {
    const isDisallowedBlock = (child: Descendant) =>
      ElementApi.isElement(child) &&
      !isInlineDescendant(child, state) &&
      !state.schema.allowsElementType(element.type, child.type);

    if (!element.children.some(isDisallowedBlock)) return [element];
    const result: Descendant[] = [];
    let run: Descendant[] = [];
    const flush = () => {
      if (
        run.some((child) => !TextApi.isText(child) || child.text.trim() !== '')
      ) {
        result.push({ ...element, children: run });
      }
      run = [];
    };

    for (const child of element.children) {
      if (isDisallowedBlock(child)) {
        flush();
        result.push(child);
      } else {
        run.push(child);
      }
    }
    flush();

    return result;
  };

  const decoded =
    root.tagName === 'BODY'
      ? decodeChildren(root, null)
      : decodeNode(root, null);

  reportUnclaimedAttributes(
    root,
    claimedAttributes,
    lostElements,
    operation.onLoss
  );

  return coalesceAdjacentText(
    fitSchema ? wrapRootInlineRuns(decoded, state) : decoded
  );
};

/**
 * Report each attribute Plate's mappings write that no kept decoder result
 * claims, except on an element already reported lost. A claim covers its
 * element's subtree, because a decoder may read the elements it consumes, such
 * as an image figure's `<img>`.
 */
const reportUnclaimedAttributes = (
  root: Element,
  claimedAttributes: ReadonlyMap<Element, ReadonlySet<string>>,
  lostElements: ReadonlySet<Element>,
  onLoss: ((loss: HtmlMappingLoss) => void) | undefined
) => {
  if (!onLoss) return;
  const visit = (element: Element, inherited: ReadonlySet<string>) => {
    const own = claimedAttributes.get(element);
    const claimed = own ? new Set([...inherited, ...own]) : inherited;
    const attributes = lostElements.has(element)
      ? []
      : element.getAttributeNames();

    for (const attribute of attributes) {
      if (!PLATE_HTML_ATTRIBUTES.has(attribute) || claimed.has(attribute)) {
        continue;
      }

      onLoss(
        Object.freeze({
          action: 'dropped' as const,
          kind: 'attribute' as const,
          message: `No HTML mapping represents attribute "${attribute}" on <${element.tagName.toLowerCase()}>; it was omitted.`,
          owner: 'plate:html',
          source: Object.freeze({
            ...htmlTreeLocation(root, element),
            attribute,
          }),
        })
      );
    }
    for (const child of Array.from(element.children)) visit(child, claimed);
  };

  visit(root, new Set());
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

type HtmlUnsafeReport = (removal: HtmlUnsafeRemoval) => void;

// Emitted values come from documents and trusted callbacks, so a value that
// fails its sink is removed and reported; an unsafe name is a mapping bug.
const compileWrites = (
  value: Record<string, unknown>,
  label: string,
  tag: string,
  onUnsafe: HtmlUnsafeReport
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
      const decision =
        typeof normalized === 'string'
          ? decideHtmlAttribute(tag, name, normalized)
          : undefined;

      if (decision && 'removal' in decision) {
        onUnsafe(decision.removal);

        return;
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
      if (typeof normalized === 'string' && !isSafeStyleValue(normalized)) {
        onUnsafe(
          Object.freeze({
            action: 'removed' as const,
            impact: 'lossy' as const,
            kind: 'style' as const,
            message: `Removed unsafe CSS value for "${name}" from <${tag}>.`,
          })
        );

        return;
      }
      setWrite(styleWrites, name, normalized, 'style');
    });
  }

  return { attributeWrites, styleWrites };
};

const compileNodeSpec = (
  value: unknown,
  seen: WeakSet<object>,
  onUnsafe: HtmlUnsafeReport
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
  const writes = compileWrites(value, 'Plate HTML node spec', tag, onUnsafe);
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

    return compileNodeSpec(child, seen, onUnsafe);
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

const applyPatch = (
  target: MutableHtmlNode,
  value: unknown,
  onUnsafe: HtmlUnsafeReport
) => {
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
  const writes = compileWrites(value, 'Plate HTML patch', target.tag, onUnsafe);

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
  node: EditorElement | Text,
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
  node: EditorElement | Text,
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

export type HtmlMappingLoss = Readonly<{
  action: 'dropped' | 'replaced' | 'unwrapped';
  kind: 'attribute' | 'element' | 'style';
  message: string;
  model?: HtmlModelLocation;
  owner: string;
  source?: HtmlSourceLocation;
}>;

type HtmlUnsafeOutput = HtmlUnsafeRemoval &
  Readonly<{ model: HtmlModelLocation }>;

type HtmlEncodeOperation = Readonly<{
  document?: EditorDocumentValue;
  getFormatContext: ReturnType<typeof createPluginFormatOperationContext>;
  onLoss?: (loss: HtmlMappingLoss) => void;
  onUnsafe: (removal: HtmlUnsafeOutput) => void;
  operationKey: object;
  reportMappingErrors?: boolean;
}>;

type HtmlStateReader = <T>(read: (state: EditorCoreStateView) => T) => T;

/**
 * Report each content property that no encoder of `node` claimed. Claims come
 * from retained output only, so an owner's encoder existing claims nothing.
 */
const reportUnclaimedProperties = (
  node: EditorElement | Text,
  parentType: string | null,
  claimed: ReadonlySet<string>,
  state: EditorCoreStateView,
  path: Path,
  onLoss?: (loss: HtmlMappingLoss) => void
) => {
  const placement = ElementApi.isElement(node) ? 'element' : 'text';
  const type = ElementApi.isElement(node) ? node.type : parentType;
  const reported = new Set<string>();
  const unsupported = (key: string, id: string) => {
    if (reported.has(id)) return;
    reported.add(id);
    const message = `No HTML mapping represents content property "${key}" on ${ElementApi.isElement(node) ? `"${node.type}"` : 'text'}; it was omitted.`;

    if (!onLoss) throw new Error(message);
    onLoss(
      Object.freeze({
        action: 'dropped' as const,
        kind: 'attribute' as const,
        message,
        model: Object.freeze({ path, property: key, root: 'main' as const }),
        owner: 'plate:html',
      })
    );
  };

  for (const key of Object.keys(node)) {
    if (key === 'children' || key === 'text' || key === 'type') continue;
    const property = state.schema.property({
      key,
      placement,
      ...(type ? { type } : {}),
    });

    if (
      property &&
      !claimed.has(property.id) &&
      hasContentValue(node, key, property)
    ) {
      unsupported(key, property.id);
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
    if (!claimed.has(id) && hasContentValue(node, property.key, property)) {
      unsupported(property.key, id);
    }
  }
};

const encodeContext = (
  rule: CompiledHtmlRule,
  node: EditorElement | Text,
  state: EditorCoreStateView,
  parentType: string | null,
  document: EditorDocumentValue,
  path: Path,
  getFormatContext: ReturnType<typeof createPluginFormatOperationContext>,
  operationKey: object,
  onLoss?: (loss: HtmlMappingLoss) => void
) => {
  const values = new Map<string, unknown>();

  rule.properties.forEach((property) => {
    const value = propertyValue(node, property, state, parentType);

    if (value !== undefined) values.set(property.key, value);
  });
  const record = Object.fromEntries(values);

  const model = createPluginFormatModelView(document, node, path, 'main');
  const report = (diagnostic: HtmlMappingDiagnosticInput) => {
    if (!onLoss) {
      throw new Error(
        `Plate HTML format "${rule.owner}" reported unsupported content without a diagnostic collector.`
      );
    }
    onLoss(
      Object.freeze({
        ...diagnostic,
        model: Object.freeze({ path, root: 'main' as const }),
        owner: rule.owner,
      })
    );
  };
  const operationContext = Object.freeze({
    ...getFormatContext(rule.plugin, state, operationKey),
    ...model,
    report,
  });
  const preserved = new Set<string>();
  const preserve = (...keys: readonly string[]) => {
    for (const key of keys) {
      const id = rule.propertyIdsByKey.get(key);

      if (id === undefined) {
        throw new Error(
          `Plate HTML mapping "${rule.owner}" cannot preserve "${key}": it is not a property of its target.`
        );
      }
      preserved.add(id);
    }
  };
  const structural = rule.kind === 'element' || rule.createsElement;

  return {
    context: structural
      ? Object.freeze({
          ...operationContext,
          content: HTML_CONTENT_TOKEN,
          preserve,
        })
      : rule.properties.length === 1
        ? Object.freeze({
            ...operationContext,
            value: values.get(rule.properties[0].key),
          })
        : Object.freeze({
            ...operationContext,
            preserve,
            values: Object.freeze(record),
          }),
    hasValues: values.size > 0,
    // A single-value mapping represents its value whenever it writes output;
    // every other encoder claims what it represents with `preserve`.
    retain: (claimed: Set<string>) => {
      const ids =
        !structural && rule.properties.length === 1
          ? [rule.properties[0].id]
          : preserved;

      for (const id of ids) claimed.add(id);
    },
  };
};

const writesHtml = (patch: unknown) =>
  isRecord(patch) &&
  [patch.attributes, patch.style].some(
    (writes) =>
      isRecord(writes) &&
      Object.values(writes).some(
        (value) => value !== undefined && value !== null && value !== false
      )
  );

const compileWrapperSpec = (
  value: unknown,
  onUnsafe: HtmlUnsafeReport
): MutableHtmlNode => {
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
    new WeakSet(),
    onUnsafe
  );
};

const encodeCompiledHtml = (
  editor: Editor,
  slice: ContentSlice,
  serializerIndex: CompiledHtmlSerializerIndex,
  state: EditorCoreStateView,
  operation: HtmlEncodeOperation
) => {
  const reportMappingErrors = operation.reportMappingErrors ?? true;
  const document = operation.document ?? state.value();
  const reportLoss = (path: Path) =>
    operation.onLoss
      ? (loss: HtmlMappingLoss) =>
          operation.onLoss?.(
            loss.model
              ? loss
              : Object.freeze({
                  ...loss,
                  model: Object.freeze({ path, root: 'main' as const }),
                })
          )
      : undefined;
  const encodeNode = (
    node: Descendant,
    parentType: string | null,
    relativePath: Path
  ): string => {
    const path = state.nodes.path(node) ?? relativePath;
    const onLoss = reportLoss(path);
    const onUnsafe = (removal: HtmlUnsafeRemoval) =>
      operation.onUnsafe(
        Object.freeze({
          ...removal,
          model: Object.freeze({ path, root: 'main' as const }),
        })
      );

    if (TextApi.isText(node)) {
      const wrappers: Array<
        Readonly<{
          root: MutableHtmlNode;
          rule: CompiledHtmlRule;
        }>
      > = [];
      const handled = new Set<string>();
      const claimed = new Set<string>();

      for (const rule of parentType
        ? (serializerIndex.marksByParentType.get(parentType) ?? [])
        : []) {
        const pending = rule.properties.filter(
          (property) =>
            !handled.has(property.id) &&
            propertyValue(node, property, state, parentType) !== undefined
        );

        if (pending.length === 0) continue;
        const invocation = encodeContext(
          rule,
          node,
          state,
          parentType,
          document,
          path,
          operation.getFormatContext,
          operation.operationKey,
          onLoss
        );
        const root = encodeWithRule(
          editor,
          rule,
          node,
          parentType,
          () => {
            const value = (
              rule.declaration.encode ??
              failInvariant('Expected value to be defined')
            )(invocation.context);

            return value === null ? null : compileWrapperSpec(value, onUnsafe);
          },
          reportMappingErrors
        );

        pending.forEach(({ id }) => {
          handled.add(id);
        });
        if (root === null) continue;
        wrappers.push(Object.freeze({ root, rule }));
        invocation.retain(claimed);
      }
      reportUnclaimedProperties(node, parentType, claimed, state, path, onLoss);
      let html = escapeHtmlText(node.text);

      for (let index = wrappers.length - 1; index >= 0; index--) {
        const wrapper = wrappers[index];

        html = encodeWithRule(
          editor,
          wrapper.rule,
          node,
          parentType,
          () => renderNodeSpec(wrapper.root, html),
          reportMappingErrors
        );
      }

      return html;
    }
    if (!ElementApi.isElement(node)) return '';
    const encodeChildren = () =>
      node.children
        .map((child, index) => encodeNode(child, node.type, [...path, index]))
        .join('');
    const structuralRules = serializerIndex.elementsByType.get(node.type) ?? [];
    let structuralRule: CompiledHtmlRule | undefined;
    let structural: ReturnType<typeof encodeContext> | undefined;

    for (const rule of structuralRules) {
      const invocation = encodeContext(
        rule,
        node,
        state,
        parentType,
        document,
        path,
        operation.getFormatContext,
        operation.operationKey,
        onLoss
      );

      if (rule.createsElement && !invocation.hasValues) continue;
      structuralRule = rule;
      structural = invocation;
      break;
    }
    // A lost element reports once; its properties are lost with it.
    if (!structuralRule || !structural || !structuralRule.declaration.encode) {
      const content = encodeChildren();
      const message = `Plate HTML encode has no encoder for element "${node.type}".`;

      if (!onLoss) throw new Error(message);
      onLoss(
        Object.freeze({
          action: 'unwrapped' as const,
          kind: 'element' as const,
          message,
          owner: 'plate:html',
        })
      );

      return content;
    }
    const structuralContext = structural.context;
    const encoded = encodeWithRule(
      editor,
      structuralRule,
      node,
      parentType,
      () => {
        const spec = (
          structuralRule.declaration.encode ??
          failInvariant('Expected value to be defined')
        )(structuralContext);

        if (spec === null) return null;
        const innerRoot = compileNodeSpec(spec, new WeakSet(), onUnsafe);

        return Object.freeze({
          patchTarget: findPatchTarget(innerRoot),
          root: innerRoot,
        });
      },
      reportMappingErrors
    );

    // An encoder that returns null omits the element and its subtree.
    if (encoded === null) return '';
    const { patchTarget, root } = encoded;
    const claimed = new Set<string>();
    const handledProperties = new Set<string>(
      structuralRule.properties.map(({ id }) => id)
    );

    structural.retain(claimed);
    for (const rule of serializerIndex.elementPropertiesByType.get(node.type) ??
      []) {
      const pending = rule.properties.filter(
        (property) =>
          !handledProperties.has(property.id) &&
          propertyValue(node, property, state, parentType) !== undefined
      );

      if (pending.length === 0) continue;
      const invocation = encodeContext(
        rule,
        node,
        state,
        parentType,
        document,
        path,
        operation.getFormatContext,
        operation.operationKey,
        onLoss
      );

      const patch = encodeWithRule(
        editor,
        rule,
        node,
        parentType,
        () =>
          (
            rule.declaration.encode ??
            failInvariant('Expected value to be defined')
          )(invocation.context),
        reportMappingErrors
      );

      if (patch !== null) {
        applyPatch(patchTarget, patch, onUnsafe);
        if (writesHtml(patch)) invocation.retain(claimed);
      }
      pending.forEach(({ id }) => {
        handledProperties.add(id);
      });
    }
    const wrappers: Array<
      Readonly<{
        root: MutableHtmlNode;
        rule: CompiledHtmlRule;
      }>
    > = [];

    for (const rule of serializerIndex.elementWrappersByType.get(node.type) ??
      []) {
      const invocation = encodeContext(
        rule,
        node,
        state,
        parentType,
        document,
        path,
        operation.getFormatContext,
        operation.operationKey,
        onLoss
      );

      if (!invocation.hasValues) continue;
      const wrapper = encodeWithRule(
        editor,
        rule,
        node,
        parentType,
        () => {
          const spec = (
            rule.declaration.encode ??
            failInvariant('Expected value to be defined')
          )(invocation.context);

          return spec === null
            ? null
            : compileNodeSpec(spec, new WeakSet(), onUnsafe);
        },
        reportMappingErrors
      );

      if (wrapper === null) continue;
      wrappers.push(Object.freeze({ root: wrapper, rule }));
      invocation.retain(claimed);
    }
    reportUnclaimedProperties(node, parentType, claimed, state, path, onLoss);
    const content = encodeChildren();
    let html = encodeWithRule(
      editor,
      structuralRule,
      node,
      parentType,
      () =>
        renderNodeSpec(
          root,
          content,
          state.schema.element(node.type)?.behavior.void === true
        ),
      reportMappingErrors
    );

    for (let index = wrappers.length - 1; index >= 0; index--) {
      const wrapper = wrappers[index];

      html = encodeWithRule(
        editor,
        wrapper.rule,
        node,
        parentType,
        () => renderNodeSpec(wrapper.root, html),
        reportMappingErrors
      );
    }

    return html;
  };

  return slice.content
    .map((node, index) => encodeNode(node, null, [index]))
    .join('');
};

const prepareHtmlDocument = (
  artifact: CompiledPlateHtmlArtifact,
  document: Document,
  state: EditorCoreStateView,
  operationKey: object,
  onLoss?: (loss: HtmlMappingLoss) => void
) => {
  artifact.prepareDocument.forEach((rule) => {
    const prepare =
      rule.declaration.prepareDocument ??
      failInvariant('Expected value to be defined');
    const report = (diagnostic: HtmlMappingDiagnosticInput) => {
      if (!onLoss) {
        throw new Error(
          `Plate HTML format "${rule.owner}" reported unsupported content without a diagnostic collector.`
        );
      }
      onLoss(Object.freeze({ ...diagnostic, owner: rule.owner }));
    };

    prepare(
      Object.freeze({
        ...artifact.getFormatContext(rule.plugin, state, operationKey),
        document,
        report,
      })
    );
  });
};

const htmlMappingDiagnostics = (
  losses: readonly HtmlMappingLoss[],
  phase: 'parse' | 'serialize',
  lossPolicy: 'allow' | 'reject'
): readonly HtmlDiagnostic[] => {
  const seen = new Set<string>();
  const diagnostics: HtmlDiagnostic[] = [];

  losses.forEach((loss) => {
    const key = JSON.stringify([
      phase,
      loss.owner,
      'html-unsupported-content',
      loss.source ?? null,
      loss.model ?? null,
      loss.action,
    ]);

    if (seen.has(key)) return;
    seen.add(key);
    diagnostics.push(
      Object.freeze({
        ...loss,
        code: 'html-unsupported-content' as const,
        phase,
        // A lost property warns under every policy; lost elements follow it.
        severity:
          lossPolicy === 'reject' && loss.kind === 'element'
            ? 'error'
            : 'warning',
      })
    );
  });

  return Object.freeze(diagnostics);
};

// A link keeps its label when it loses a destination (`unwrapped`), so that
// loss warns under every policy; other lossy removals follow `lossPolicy`.
const isRejectedRemoval = (
  { action, impact }: Readonly<{ action: string; impact: string }>,
  lossPolicy: 'allow' | 'reject'
) => lossPolicy === 'reject' && impact === 'lossy' && action === 'removed';

const unsafeContentDiagnostic = (
  removal: HtmlUnsafeRemoval,
  location:
    | Readonly<{ model: HtmlModelLocation }>
    | Readonly<{ source: HtmlSourceLocation }>,
  lossPolicy: 'allow' | 'reject'
): HtmlDiagnostic =>
  Object.freeze({
    ...location,
    action: removal.action,
    code: 'html-unsafe-content' as const,
    impact: removal.impact,
    kind: removal.kind,
    message: removal.message,
    severity: isRejectedRemoval(removal, lossPolicy)
      ? ('error' as const)
      : ('warning' as const),
  });

// DOCX applies its loss policy to mapping losses by action: unwrapped content
// survives, so a lossless removal or a lost destination stays a warning and a
// lossy removal follows it.
const unsafeMappingLoss = (
  root: Element,
  element: Element,
  { action, impact, kind, message }: HtmlUnsafeRemoval
): HtmlMappingLoss =>
  Object.freeze({
    action:
      impact === 'lossless' || action === 'unwrapped'
        ? ('unwrapped' as const)
        : ('dropped' as const),
    kind: kind === 'url' ? ('attribute' as const) : kind,
    message,
    owner: 'plate:html',
    source: htmlTreeLocation(root, element),
  });

const restoreAppleConvertedSpaces = (root: HTMLElement) => {
  root.querySelectorAll('span.Apple-converted-space').forEach((span) => {
    if (span.childNodes.length !== 1 || span.textContent !== '\u00A0') return;

    span.replaceWith(root.ownerDocument.createTextNode(' '));
  });
};

const decodeHtmlTransferWithArtifact = (
  artifact: CompiledPlateHtmlArtifact,
  context: DataTransferDecodeContext
): ContentSlice | null => {
  const parsed = parseHtmlAst(context.data, 'slice');

  if (!parsed.ok) return null;
  const plainText = context.snapshot.getData('text/plain');

  if (plainText && getHtmlAstPlainText(parsed.ast) === plainText) return null;
  const document = createBrowserHtmlDocument();
  const root = materializeHtmlAst(parsed.ast, document);
  restoreAppleConvertedSpaces(root);
  const result = decodeMaterializedHtmlWithEditor(
    artifact.editor,
    'slice',
    document,
    root,
    parsed.ast.diagnostics,
    { lossPolicy: 'allow' },
    (read) => read(context.state),
    context.snapshot,
    true
  ) as HtmlSliceParseResult;

  if (!result.ok) return null;
  // A payload that loses all of its content still reports what it lost.
  result.diagnostics.forEach((diagnostic) => {
    context.report({
      // Parser recovery keeps what a browser shows; unmapped content does not.
      impact:
        'impact' in diagnostic
          ? diagnostic.impact
          : diagnostic.code === 'html-parser-recovery'
            ? 'lossless'
            : 'lossy',
      message: diagnostic.message,
    });
  });

  return result.slice.content.length === 0 ? null : result.slice;
};

/**
 * Decode an HTML clipboard payload with the HTML format compiled for
 * `context.state`, for a format that prepares HTML first, such as Word paste.
 * Reports what the payload leaves out through `context.report` and returns the
 * slice to insert, or null when nothing is insertable so the next format can
 * decode the payload. HTML that fails to parse, or only repeats the plain
 * text, returns null without reports.
 */
export const decodeHtmlDataTransfer = (context: DataTransferDecodeContext) => {
  const artifact = COMPILED_PLATE_HTML_BY_SCHEMA.get(context.state.schema);

  if (!artifact) {
    throw new Error('Plate HTML format is not compiled for this editor state.');
  }

  return decodeHtmlTransferWithArtifact(artifact, context);
};

export const compilePlateHtmlFormat = (
  editor: Editor,
  model: CompiledPlateModel,
  plugins: readonly AnyBasePlugin[]
): DataTransferFormat => {
  const pluginsByName = new Map(
    plugins.map((plugin) => [plugin.name, plugin] as const)
  );
  const schemaApi = editor.read((state) => state.schema);
  const defaultBlock = schemaApi.createDefaultRootChild();
  const defaultBlockType = ElementApi.isElement(defaultBlock)
    ? defaultBlock.type
    : null;
  const rules = Object.freeze(
    plugins
      .flatMap((plugin) =>
        getPluginDescriptorMetadata(plugin).htmlMappingContributions.map(
          ({ factory, targetPlugin }) =>
            compileRule(
              editor,
              model,
              pluginsByName,
              plugin,
              targetPlugin,
              factory,
              defaultBlockType
            )
        )
      )
      .sort(compareRules)
  );

  assertStaticConflicts(rules);
  const matcherIndex = compileMatcherIndex(rules);
  const serializerIndex = compileSerializerIndex(model, rules);
  const prepareDocument = Object.freeze(
    rules.filter((rule) => rule.declaration.prepareDocument)
  );
  const preparedOwners = new Set<string>();

  prepareDocument.forEach((rule) => {
    if (preparedOwners.has(rule.owner)) {
      throw new Error(
        `Plate HTML format owner "${rule.owner}" may declare prepareDocument once.`
      );
    }
    preparedOwners.add(rule.owner);
  });

  const htmlPlugin = pluginsByName.get(HTML_PLUGIN_NAME);

  if (!htmlPlugin) throw new Error('Plate HTML plugin is not installed.');
  const artifact = Object.freeze({
    editor,
    getFormatContext: createPluginFormatOperationContext(
      editor,
      model,
      plugins
    ),
    matcherIndex,
    prepareDocument,
    rules,
    serializerIndex,
  });
  COMPILED_PLATE_HTML.set(model.revision, artifact);
  COMPILED_PLATE_HTML_BY_SCHEMA.set(schemaApi, artifact);

  const mapping: DataTransferFormat = Object.freeze({
    mimeType: HTML_FORMAT,
    key: HTML_HOST_KEY,
    claims: Object.freeze([{ kind: 'schema' as const }]),
    decode: (context: DataTransferDecodeContext) =>
      decodeHtmlTransferWithArtifact(artifact, context),
    encode: (context: DataTransferEncodeContext) => {
      const losses: HtmlMappingLoss[] = [];
      const removals: HtmlUnsafeOutput[] = [];

      try {
        const data = encodeCompiledHtml(
          editor,
          context.slice,
          serializerIndex,
          context.state,
          {
            getFormatContext: artifact.getFormatContext,
            onLoss: (loss) => losses.push(loss),
            onUnsafe: (removal) => removals.push(removal),
            operationKey: context.slice,
          }
        );

        // Clipboard HTML is written only when it carries the slice faithfully.
        return losses.length > 0 || removals.length > 0 ? null : data;
      } catch (error) {
        if (error instanceof ReportedHtmlEncodeError) return null;

        throw error;
      }
    },
  });

  return mapping;
};

/** Capture one detached DOM decoder while the compiled format target is active. @internal */
export const compileHtmlElementDecoder = (
  editor: Editor,
  state: EditorCoreStateView
) => {
  const model = getCompiledPlateModel(editor);
  const artifact = COMPILED_PLATE_HTML.get(model.revision);

  if (!artifact) throw new Error('Plate HTML format is not compiled.');
  const operationKey = Object.freeze({});

  // DOCX import decodes after its compilation scope clears plugin stores, so
  // every mapping context is captured now; decode must read only these.
  for (const plugin of new Set(artifact.rules.map((rule) => rule.plugin))) {
    artifact.getFormatContext(plugin, state, operationKey);
  }

  return (
    element: HTMLElement,
    {
      collapseWhitespace: shouldCollapseWhiteSpace = true,
      onLoss,
    }: Readonly<{
      collapseWhitespace?: boolean;
      onLoss: (loss: HtmlMappingLoss) => void;
    }>
  ): Descendant[] => {
    const sanitize = () =>
      sanitizeHtmlDom(element, (node, removal) =>
        onLoss(unsafeMappingLoss(element, node, removal))
      );

    // No source pass has read this DOM, and preparation may write to it.
    sanitize();
    prepareHtmlDocument(
      artifact,
      element.ownerDocument,
      state,
      operationKey,
      onLoss
    );
    if (artifact.prepareDocument.length > 0) sanitize();
    const normalized = shouldCollapseWhiteSpace
      ? collapseWhiteSpace(element)
      : element;

    return decodeCompiledHtml(editor, normalized, artifact, state, {
      fitSchema: false,
      onLoss,
      operationKey,
      reportMappingErrors: false,
    });
  };
};

type HtmlSchemaRepair = ReturnType<
  InternalEditorSchemaApi['fitDocumentWithReport']
>['repairs'][number];

const failedHtml = (
  diagnostic: HtmlErrorDiagnostic,
  diagnostics: readonly HtmlDiagnostic[] = []
) => {
  const ordered = [diagnostic, ...diagnostics];
  const partitioned = [
    ...ordered.filter((item) => item.severity === 'error'),
    ...ordered.filter((item) => item.severity === 'warning'),
  ] as [HtmlErrorDiagnostic, ...HtmlDiagnostic[]];

  return Object.freeze({
    diagnostics: Object.freeze(partitioned),
    ok: false as const,
  });
};

const failedHtmlDiagnostics = (diagnostics: readonly HtmlDiagnostic[]) => {
  const error = diagnostics.find(
    (diagnostic): diagnostic is HtmlErrorDiagnostic =>
      diagnostic.severity === 'error'
  );

  if (!error) {
    throw new Error('Failed HTML result requires at least one error.');
  }

  return failedHtml(
    error,
    diagnostics.filter((diagnostic) => diagnostic !== error)
  );
};

const schemaDiagnostic = (
  error: EditorSchemaValidationError
): HtmlErrorDiagnostic => {
  const schema = error.diagnostics[0];

  if (!schema) throw error;

  return Object.freeze({
    code: 'html-schema-invalid' as const,
    message: schema.message,
    model: Object.freeze({
      path: schema.path,
      ...(schema.property ? { property: schema.property.key } : {}),
      ...(schema.root === null ? {} : { root: schema.root }),
    }),
    schema,
    severity: 'error' as const,
  });
};

const schemaFailure = (
  error: unknown,
  diagnostics: readonly HtmlDiagnostic[]
) => {
  if (!(error instanceof EditorSchemaValidationError)) throw error;

  return failedHtmlDiagnostics([...diagnostics, schemaDiagnostic(error)]);
};

const repairAction = (
  code: HtmlSchemaRepair['code']
): 'dropped' | 'replaced' | 'unwrapped' => {
  switch (code) {
    case 'drop-unplaceable-text':
    case 'omit-default-property':
    case 'remove-empty-text':
    case 'remove-noncanonical-child': {
      return 'dropped';
    }
    case 'flatten-block-content': {
      return 'unwrapped';
    }
    default: {
      return 'replaced';
    }
  }
};

const repairLocation = (location: HtmlSchemaRepair['inputs'][number]) =>
  Object.freeze({
    path: location.path,
    ...(location.property ? { property: location.property } : {}),
    root: location.root,
  });

const repairDiagnostic = (
  repair: HtmlSchemaRepair,
  lossPolicy: 'allow' | 'reject'
): HtmlDiagnostic => {
  const severity =
    repair.impact === 'lossy' && lossPolicy === 'reject'
      ? ('error' as const)
      : ('warning' as const);

  return Object.freeze({
    action: repairAction(repair.code),
    code: 'html-schema-repair' as const,
    impact: repair.impact,
    inputs: Object.freeze(repair.inputs.map(repairLocation)),
    message: `HTML schema repair "${repair.code}" was ${repair.impact}.`,
    outputs: Object.freeze(repair.outputs.map(repairLocation)),
    owner: repair.owner,
    repair: repair.code,
    severity,
  });
};

const decodeMaterializedHtmlWithEditor = (
  editor: Editor,
  kind: 'document' | 'slice',
  ownerDocument: Document,
  root: HTMLElement,
  parserDiagnostics: readonly HtmlWarningDiagnostic[],
  options: HtmlEditorParseOptions,
  readState: HtmlStateReader,
  operationKey: object = root,
  // Transfer negotiation isolates each mapping candidate so one failing
  // mapping delegates to a lower candidate; direct parsing reports it by throwing.
  isolateMappingErrors = false
): HtmlDocumentParseResult | HtmlSliceParseResult => {
  const model = getCompiledPlateModel(editor);
  const artifact = COMPILED_PLATE_HTML.get(model.revision);

  if (!artifact) throw new Error('Plate HTML format is not compiled.');
  const lossPolicy = options.lossPolicy ?? 'reject';
  const losses: HtmlMappingLoss[] = [];
  const preparedRemovals: HtmlDiagnostic[] = [];
  const { children, schema } = readState((state) => {
    prepareHtmlDocument(artifact, ownerDocument, state, operationKey, (loss) =>
      losses.push(loss)
    );
    // Preparation runs after the source pass, so its writes are checked here.
    if (artifact.prepareDocument.length > 0) {
      sanitizeHtmlDom(root, (element, removal) =>
        preparedRemovals.push(
          unsafeContentDiagnostic(
            removal,
            { source: htmlTreeLocation(root, element) },
            lossPolicy
          )
        )
      );
    }
    const normalized =
      (options.collapseWhitespace ?? true) ? collapseWhiteSpace(root) : root;

    return Object.freeze({
      children: decodeCompiledHtml(editor, normalized, artifact, state, {
        fitSchema: false,
        onLoss: (loss) => losses.push(loss),
        operationKey,
        reportMappingErrors: isolateMappingErrors,
      }),
      schema: state.schema as InternalEditorSchemaApi,
    });
  });
  const mappingDiagnostics = htmlMappingDiagnostics(
    losses,
    'parse',
    lossPolicy
  );
  const sourceDiagnostics = parserDiagnostics.map((diagnostic) =>
    diagnostic.code === 'html-unsafe-content' &&
    isRejectedRemoval(diagnostic, lossPolicy)
      ? Object.freeze({ ...diagnostic, severity: 'error' as const })
      : diagnostic
  );
  const parseDiagnostics = Object.freeze([
    ...sourceDiagnostics,
    ...preparedRemovals,
    ...mappingDiagnostics,
  ]);
  const rejectsLoss = parseDiagnostics.some(
    (diagnostic) => diagnostic.severity === 'error'
  );
  if (kind === 'slice') {
    const slice = ContentSlice.closed(children);
    const assertContentSliceForSchema: InternalEditorSchemaApi['assertContentSliceForSchema'] =
      schema.assertContentSliceForSchema;

    try {
      assertContentSliceForSchema(slice);
    } catch (error) {
      return schemaFailure(error, parseDiagnostics);
    }
    if (rejectsLoss) return failedHtmlDiagnostics(parseDiagnostics);

    return Object.freeze({
      diagnostics: parseDiagnostics as readonly HtmlWarningDiagnostic[],
      ok: true as const,
      slice,
    });
  }

  let fitted: ReturnType<InternalEditorSchemaApi['fitDocumentWithReport']>;

  try {
    fitted = schema.fitDocumentWithReport(
      Object.freeze({
        children: Object.freeze(children),
      }) as unknown as EditorDocumentValue
    );
  } catch (error) {
    return schemaFailure(error, parseDiagnostics);
  }
  const repairDiagnostics = fitted.repairs.map((repair) =>
    repairDiagnostic(repair, options.lossPolicy ?? 'reject')
  );
  const failureIndex = repairDiagnostics.findIndex(
    (diagnostic) => diagnostic.severity === 'error'
  );

  if (failureIndex !== -1) {
    return failedHtmlDiagnostics([...parseDiagnostics, ...repairDiagnostics]);
  }
  if (rejectsLoss) {
    return failedHtmlDiagnostics([...parseDiagnostics, ...repairDiagnostics]);
  }

  return Object.freeze({
    diagnostics: Object.freeze([
      ...parseDiagnostics,
      ...(repairDiagnostics as readonly HtmlWarningDiagnostic[]),
    ]) as readonly HtmlWarningDiagnostic[],
    document: fitted.document,
    ok: true as const,
  });
};

const decodeHtmlAstWithEditor = (
  editor: Editor,
  source: string,
  kind: 'document' | 'slice',
  ownerDocument: Document,
  options: HtmlEditorParseOptions,
  readState: HtmlStateReader
): HtmlDocumentParseResult | HtmlSliceParseResult => {
  const parsed = parseHtmlAst(source, kind, options.limits);

  if (!parsed.ok) return parsed;
  const root = materializeHtmlAst(parsed.ast, ownerDocument);

  return decodeMaterializedHtmlWithEditor(
    editor,
    kind,
    ownerDocument,
    root,
    parsed.ast.diagnostics,
    options,
    readState
  );
};

export const parseHtmlWithEditor = (
  editor: Editor,
  source: string,
  options: HtmlEditorParseOptions = {},
  ownerDocument = createBrowserHtmlDocument(),
  readState: HtmlStateReader = (read) => editor.read(read)
): HtmlDocumentParseResult =>
  decodeHtmlAstWithEditor(
    editor,
    source,
    'document',
    ownerDocument,
    options,
    readState
  ) as HtmlDocumentParseResult;

export const parseHtmlSliceWithEditor = (
  editor: Editor,
  source: string,
  options: HtmlEditorParseOptions = {},
  ownerDocument = createBrowserHtmlDocument(),
  readState: HtmlStateReader = (read) => editor.read(read)
): HtmlSliceParseResult =>
  decodeHtmlAstWithEditor(
    editor,
    source,
    'slice',
    ownerDocument,
    options,
    readState
  ) as HtmlSliceParseResult;

const htmlDocumentDiagnostics = (
  document: EditorDocumentValue
): readonly HtmlWarningDiagnostic[] => {
  const roots = Object.keys(document.roots ?? {});
  const metadata = Object.keys(document.meta ?? {}).filter(
    (key) => key !== 'authored'
  );

  return Object.freeze([
    ...roots.map((root) =>
      Object.freeze({
        code: 'html-unsupported-root' as const,
        message: `Semantic HTML omits document root "${root}" because no installed HTML mapping owns its placement.`,
        root,
        severity: 'warning' as const,
      })
    ),
    ...metadata.map((key) =>
      Object.freeze({
        code: 'html-unsupported-metadata' as const,
        key,
        message: `Semantic HTML omits document metadata "${key}".`,
        severity: 'warning' as const,
      })
    ),
  ]);
};

export const serializeHtmlDocumentWithState = (
  editor: Editor,
  state: EditorCoreStateView,
  outputDocument: EditorDocumentValue,
  projectionDiagnostics: readonly HtmlWarningDiagnostic[],
  lossPolicy: 'allow' | 'reject'
): HtmlSerializeResult => {
  const model = getCompiledPlateModel(editor);
  const artifact = COMPILED_PLATE_HTML.get(model.revision);

  if (!artifact) throw new Error('Plate HTML format is not compiled.');
  const losses: HtmlMappingLoss[] = [];
  const removals: HtmlDiagnostic[] = [];
  const operationKey = Object.freeze({});
  const data = encodeCompiledHtml(
    editor,
    ContentSlice.closed(outputDocument.children),
    artifact.serializerIndex,
    state,
    {
      document: outputDocument,
      getFormatContext: artifact.getFormatContext,
      onLoss: (loss) => losses.push(loss),
      onUnsafe: (removal) =>
        removals.push(
          unsafeContentDiagnostic(removal, { model: removal.model }, lossPolicy)
        ),
      operationKey,
      reportMappingErrors: false,
    }
  );
  const encodeDiagnostics = [
    ...removals,
    ...htmlMappingDiagnostics(losses, 'serialize', lossPolicy),
  ];
  const warnings = Object.freeze([
    ...projectionDiagnostics,
    ...htmlDocumentDiagnostics(outputDocument),
  ]);

  if (encodeDiagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
    return failedHtmlDiagnostics([...warnings, ...encodeDiagnostics]);
  }

  return Object.freeze({
    data,
    diagnostics: Object.freeze([
      ...warnings,
      ...(encodeDiagnostics as readonly HtmlWarningDiagnostic[]),
    ]),
    ok: true as const,
  });
};

export const serializeHtmlWithEditor = (
  editor: Editor,
  options: HtmlEditorSerializeOptions = {}
): HtmlSerializeResult => {
  const document = options.document ?? editor.read.value();

  if (
    document.meta?.authored !== undefined &&
    options.projection === undefined
  ) {
    throw new TypeError(
      'HTML serialization requires projection when the document contains authored changes.'
    );
  }
  const projected = projectPlateFormatDocument(
    editor,
    document,
    options.projection ?? 'proposed'
  );
  const outputDocument = projected.document;
  const view = createEditorView(editor, {
    document: outputDocument,
  }) as unknown as Editor;
  return view.read((state) =>
    serializeHtmlDocumentWithState(
      view,
      state,
      outputDocument,
      projected.diagnostics as readonly HtmlWarningDiagnostic[],
      options.lossPolicy ?? 'reject'
    )
  );
};

export const HtmlPlugin = definePlugin(HTML_PLUGIN_NAME, {
  api: ({ editor }): HtmlApi => ({
    parse: (source, options) => parseHtmlWithEditor(editor, source, options),
    parseSlice: (source, options) =>
      parseHtmlSliceWithEditor(editor, source, options),
    serialize: (options) => serializeHtmlWithEditor(editor, options),
  }),
});

export type HtmlDefinition = DefinitionOf<typeof HtmlPlugin>;
