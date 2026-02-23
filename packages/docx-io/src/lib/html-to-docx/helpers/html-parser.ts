/**
 * HTML to Virtual DOM Parser
 *
 * Converts HTML strings to virtual DOM trees using htmlparser2 for parsing.
 * Replaces the unmaintained `html-to-vdom` package while maintaining full API
 * compatibility.
 */

import { decode } from 'html-entities';
import * as htmlparser2 from 'htmlparser2';

import { VNode, VText } from '../vdom/index';

// ============================================================================
// Property Info System
// Configuration from the old virtual DOM library (originally from React's
// HTMLDOMPropertyConfig). Distinguishes HTML properties from attributes for
// correct VNode generation.
// ============================================================================

const MUST_USE_ATTRIBUTE = 0x1;
const MUST_USE_PROPERTY = 0x2;
const HAS_BOOLEAN_VALUE = 0x4;
const HAS_NUMERIC_VALUE = 0x8;
const HAS_POSITIVE_NUMERIC_VALUE = 0x10 | 0x8;
const HAS_OVERLOADED_BOOLEAN_VALUE = 0x20;

const Properties: Record<string, number | null> = {
  accept: null,
  acceptCharset: null,
  accessKey: null,
  action: null,
  allowFullScreen: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
  allowTransparency: MUST_USE_ATTRIBUTE,
  alt: null,
  async: HAS_BOOLEAN_VALUE,
  autoCapitalize: null,
  autoComplete: null,
  autoCorrect: null,
  autoFocus: HAS_BOOLEAN_VALUE,
  autoPlay: HAS_BOOLEAN_VALUE,
  capture: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
  cellPadding: null,
  cellSpacing: null,
  challenge: MUST_USE_ATTRIBUTE,
  charSet: MUST_USE_ATTRIBUTE,
  checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
  classID: MUST_USE_ATTRIBUTE,
  className: MUST_USE_ATTRIBUTE,
  cols: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
  colSpan: null,
  content: null,
  contentEditable: null,
  contextMenu: MUST_USE_ATTRIBUTE,
  controls: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
  coords: null,
  crossOrigin: null,
  data: null,
  dateTime: MUST_USE_ATTRIBUTE,
  defer: HAS_BOOLEAN_VALUE,
  dir: null,
  disabled: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
  download: HAS_OVERLOADED_BOOLEAN_VALUE,
  draggable: null,
  encType: null,
  form: MUST_USE_ATTRIBUTE,
  formAction: MUST_USE_ATTRIBUTE,
  formEncType: MUST_USE_ATTRIBUTE,
  formMethod: MUST_USE_ATTRIBUTE,
  formNoValidate: HAS_BOOLEAN_VALUE,
  formTarget: MUST_USE_ATTRIBUTE,
  frameBorder: MUST_USE_ATTRIBUTE,
  headers: null,
  height: MUST_USE_ATTRIBUTE,
  hidden: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
  high: null,
  href: null,
  hrefLang: null,
  htmlFor: null,
  httpEquiv: null,
  icon: null,
  id: MUST_USE_PROPERTY,
  is: MUST_USE_ATTRIBUTE,
  itemID: MUST_USE_ATTRIBUTE,
  itemProp: MUST_USE_ATTRIBUTE,
  itemRef: MUST_USE_ATTRIBUTE,
  itemScope: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
  itemType: MUST_USE_ATTRIBUTE,
  keyParams: MUST_USE_ATTRIBUTE,
  keyType: MUST_USE_ATTRIBUTE,
  label: null,
  lang: null,
  list: MUST_USE_ATTRIBUTE,
  loop: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
  low: null,
  manifest: MUST_USE_ATTRIBUTE,
  marginHeight: null,
  marginWidth: null,
  max: null,
  maxLength: MUST_USE_ATTRIBUTE,
  media: MUST_USE_ATTRIBUTE,
  mediaGroup: null,
  method: null,
  min: null,
  minLength: MUST_USE_ATTRIBUTE,
  multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
  muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
  name: null,
  noValidate: HAS_BOOLEAN_VALUE,
  open: HAS_BOOLEAN_VALUE,
  optimum: null,
  pattern: null,
  placeholder: null,
  poster: null,
  preload: null,
  property: null,
  radioGroup: null,
  readOnly: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
  rel: null,
  required: HAS_BOOLEAN_VALUE,
  role: MUST_USE_ATTRIBUTE,
  rows: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
  rowSpan: null,
  sandbox: null,
  scope: null,
  scoped: HAS_BOOLEAN_VALUE,
  scrolling: null,
  seamless: MUST_USE_ATTRIBUTE | HAS_BOOLEAN_VALUE,
  selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
  shape: null,
  size: MUST_USE_ATTRIBUTE | HAS_POSITIVE_NUMERIC_VALUE,
  sizes: MUST_USE_ATTRIBUTE,
  span: HAS_POSITIVE_NUMERIC_VALUE,
  spellCheck: null,
  src: null,
  srcDoc: MUST_USE_PROPERTY,
  srcSet: MUST_USE_ATTRIBUTE,
  start: HAS_NUMERIC_VALUE,
  step: null,
  style: null,
  tabIndex: null,
  target: null,
  title: null,
  type: null,
  unselectable: MUST_USE_ATTRIBUTE,
  useMap: null,
  value: MUST_USE_PROPERTY,
  width: MUST_USE_ATTRIBUTE,
  wmode: MUST_USE_ATTRIBUTE,
};

const PropertyToAttributeMapping: Record<string, string> = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
};

interface PropertyInfo {
  attributeName: string;
  hasBooleanValue: boolean;
  hasNumericValue: boolean;
  hasOverloadedBooleanValue: boolean;
  hasPositiveNumericValue: boolean;
  isCustomAttribute?: boolean;
  mustUseAttribute: boolean;
  mustUseProperty: boolean;
  propertyName: string;
}

function checkMask(value: number | null, bitmask: number): boolean {
  return ((value ?? 0) & bitmask) === bitmask;
}

const propInfoByAttributeName: Record<string, PropertyInfo> = {};

for (const propName of Object.keys(Properties)) {
  const propConfig = Properties[propName];
  const attributeName =
    PropertyToAttributeMapping[propName] || propName.toLowerCase();

  propInfoByAttributeName[attributeName] = {
    attributeName,
    hasBooleanValue: checkMask(propConfig, HAS_BOOLEAN_VALUE),
    hasNumericValue: checkMask(propConfig, HAS_NUMERIC_VALUE),
    hasOverloadedBooleanValue: checkMask(
      propConfig,
      HAS_OVERLOADED_BOOLEAN_VALUE
    ),
    hasPositiveNumericValue: checkMask(
      propConfig,
      HAS_POSITIVE_NUMERIC_VALUE
    ),
    mustUseAttribute: checkMask(propConfig, MUST_USE_ATTRIBUTE),
    mustUseProperty: checkMask(propConfig, MUST_USE_PROPERTY),
    propertyName: propName,
  };
}

function getPropertyInfo(attributeName: string): PropertyInfo {
  const lowerCased = attributeName.toLowerCase();

  if (
    Object.prototype.hasOwnProperty.call(propInfoByAttributeName, lowerCased)
  ) {
    return propInfoByAttributeName[lowerCased];
  }

  return {
    attributeName,
    hasBooleanValue: false,
    hasNumericValue: false,
    hasOverloadedBooleanValue: false,
    hasPositiveNumericValue: false,
    isCustomAttribute: true,
    mustUseAttribute: true,
    mustUseProperty: false,
    propertyName: attributeName,
  };
}

// ============================================================================
// Property Setters
// ============================================================================

function parseStyles(input: string): Record<string, string> {
  const attributes = input.split(';');

  return attributes.reduce(
    (object: Record<string, string>, attribute: string) => {
      const entry = attribute.split(/:(.*)/);

      if (entry[0] && entry[1]) {
        object[entry[0].trim()] = entry[1].trim();
      }

      return object;
    },
    {}
  );
}

const propertyValueConversions: Record<
  string,
  (value: string) => string | Record<string, string>
> = {
  alt: decode,
  placeholder: decode,
  style: parseStyles,
  title: decode,
};

function propertyIsTrue(propInfo: PropertyInfo, value: string): boolean {
  if (propInfo.hasBooleanValue) {
    return value === '' || value.toLowerCase() === propInfo.attributeName;
  }

  if (propInfo.hasOverloadedBooleanValue) {
    return value === '';
  }

  return false;
}

function getPropertyValue(
  propInfo: PropertyInfo,
  value: string
): boolean | number | string {
  const isTrue = propertyIsTrue(propInfo, value);

  if (propInfo.hasBooleanValue) return !!isTrue;
  if (propInfo.hasOverloadedBooleanValue) return isTrue ? true : value;
  if (propInfo.hasNumericValue || propInfo.hasPositiveNumericValue)
    return Number(value);

  return value;
}

interface VNodeProps {
  attributes: Record<string, string>;
  [key: string]: unknown;
}

function setVNodeProperty(
  properties: VNodeProps,
  propInfo: PropertyInfo,
  value: string
): void {
  let converted: unknown = value;
  const converter = propertyValueConversions[propInfo.propertyName];

  if (converter) {
    converted = converter(value);
  } else {
    converted = getPropertyValue(propInfo, value);
  }

  properties[propInfo.propertyName] = converted;
}

function setVNodeAttribute(
  properties: VNodeProps,
  propInfo: PropertyInfo,
  value: string
): void {
  properties.attributes[propInfo.attributeName] = propInfo.hasBooleanValue
    ? ''
    : value;
}

function getPropertySetter(propInfo: PropertyInfo) {
  if (propInfo.mustUseAttribute) {
    return { set: setVNodeAttribute };
  }

  return { set: setVNodeProperty };
}

interface HtmlParserTag {
  attribs: Record<string, string>;
  children?: HtmlParserNode[];
  name: string;
  type: string;
}

interface HtmlParserTextNode {
  data: string;
  type: 'text';
}

type HtmlParserNode = HtmlParserTag | HtmlParserTextNode;

function convertTagAttributes(tag: HtmlParserTag): VNodeProps {
  const attributes = tag.attribs;
  const vNodeProperties: VNodeProps = { attributes: {} };

  for (const attributeName of Object.keys(attributes)) {
    const value = attributes[attributeName];
    const propInfo = getPropertyInfo(attributeName);
    const propertySetter = getPropertySetter(propInfo);
    propertySetter.set(vNodeProperties, propInfo, value);
  }

  return vNodeProperties;
}

// ============================================================================
// HTML Parser to VDOM Converter
// ============================================================================

function createConverter() {
  const converter = {
    convert(
      node: HtmlParserNode,
      getVNodeKey?: (props: VNodeProps) => string | undefined
    ): VNode | VText {
      if (
        node.type === 'tag' ||
        node.type === 'script' ||
        node.type === 'style'
      ) {
        return converter.convertTag(
          node as HtmlParserTag,
          getVNodeKey
        );
      }

      if (node.type === 'text') {
        return new VText(decode((node as HtmlParserTextNode).data));
      }

      return new VText('');
    },

    convertTag(
      tag: HtmlParserTag,
      getVNodeKey?: (props: VNodeProps) => string | undefined
    ): VNode {
      const attributes = convertTagAttributes(tag);
      const key = getVNodeKey ? getVNodeKey(attributes) : undefined;
      const children = (tag.children || []).map((child) =>
        converter.convert(child as HtmlParserNode, getVNodeKey)
      );

      return new VNode(tag.name, attributes, children, key);
    },
  };

  return converter;
}

function parseHTML(html: string): HtmlParserNode[] {
  const handler = new htmlparser2.DomHandler();
  const parser = new htmlparser2.Parser(handler, {
    decodeEntities: false,
    lowerCaseAttributeNames: false,
  });
  parser.parseComplete(html);

  return handler.dom as unknown as HtmlParserNode[];
}

interface ConvertOptions {
  getVNodeKey?: (props: VNodeProps) => string | undefined;
}

function convertHTML(
  optionsOrHtml: ConvertOptions | string,
  html?: string
): VNode | VText | (VNode | VText)[] {
  let opts: ConvertOptions = {};
  let htmlString: string;

  if (typeof optionsOrHtml === 'string') {
    htmlString = optionsOrHtml;
  } else {
    opts = optionsOrHtml;
    htmlString = html!;
  }

  const converter = createConverter();
  const tags = parseHTML(htmlString);

  if (tags.length === 0) {
    return new VText('');
  }

  if (tags.length > 1) {
    return tags.map((tag) => converter.convert(tag, opts.getVNodeKey));
  }

  return converter.convert(tags[0], opts.getVNodeKey);
}

/** Factory function for HTML to VNode conversion. */
export default function createHTMLtoVDOM() {
  return convertHTML;
}
