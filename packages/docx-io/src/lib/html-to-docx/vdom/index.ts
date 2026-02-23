/**
 * Virtual DOM classes - EXACT implementation matching virtual-dom@2.x
 *
 * Replaces the `virtual-dom` npm package to eliminate CVE-2025-57352
 * (via min-document transitive dependency) while maintaining 100% API
 * compatibility.
 *
 * Based on: https://github.com/Matt-Esch/virtual-dom
 */

const VERSION = '2';
const NO_PROPERTIES: Record<string, unknown> = {};
const NO_CHILDREN: (VNode | VText)[] = [];

export interface VNodeProperties {
  attributes?: Record<string, string>;
  style?: Record<string, string>;
  [key: string]: any;
}

function isVHook(x: unknown): boolean {
  if (!x || typeof x !== 'object') return false;

  const obj = x as Record<string, unknown>;

  return (
    (typeof obj.hook === 'function' &&
      !Object.prototype.hasOwnProperty.call(obj, 'hook')) ||
    (typeof obj.unhook === 'function' &&
      !Object.prototype.hasOwnProperty.call(obj, 'unhook'))
  );
}

function isWidgetNode(x: unknown): boolean {
  return !!x && (x as Record<string, unknown>).type === 'Widget';
}

function isThunkNode(x: unknown): boolean {
  return !!x && (x as Record<string, unknown>).type === 'Thunk';
}

/** Represents an HTML element in the virtual DOM tree. */
export class VNode {
  [key: string]: any;
  tagName: string;
  properties: VNodeProperties;
  children: (VNode | VText)[];
  key: string | undefined;
  namespace: string | null;
  count: number;
  hasWidgets: boolean;
  hasThunks: boolean;
  hooks: Record<string, unknown> | undefined;
  descendantHooks: boolean;
  version: string;
  type: string;

  constructor(
    tagName: string,
    properties?: VNodeProperties | null,
    children?: (VNode | VText)[] | null,
    key?: string | null,
    namespace?: string | null
  ) {
    this.tagName = tagName;
    this.properties = properties || NO_PROPERTIES;
    this.children = children || NO_CHILDREN;
    this.key = key != null ? String(key) : undefined;
    this.namespace = typeof namespace === 'string' ? namespace : null;
    this.version = VERSION;
    this.type = 'VirtualNode';

    const count = (children && children.length) || 0;
    let descendants = 0;
    let hasWidgets = false;
    let hasThunks = false;
    let descendantHooks = false;
    let hooks: Record<string, unknown> | undefined;

    for (const propName in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, propName)) {
        const property = properties[propName];

        if (isVHook(property) && (property as Record<string, unknown>).unhook) {
          if (!hooks) {
            hooks = {};
          }

          hooks[propName] = property;
        }
      }
    }

    for (let i = 0; i < count; i++) {
      const child = children![i];

      if (isVNode(child)) {
        const vChild = child as VNode;
        descendants += vChild.count || 0;

        if (!hasWidgets && vChild.hasWidgets) hasWidgets = true;
        if (!hasThunks && vChild.hasThunks) hasThunks = true;
        if (
          !descendantHooks &&
          (vChild.hooks || vChild.descendantHooks)
        )
          descendantHooks = true;
      } else if (!hasWidgets && isWidgetNode(child)) {
        if (typeof (child as Record<string, unknown>).destroy === 'function') {
          hasWidgets = true;
        }
      } else if (!hasThunks && isThunkNode(child)) {
        hasThunks = true;
      }
    }

    this.count = count + descendants;
    this.hasWidgets = hasWidgets;
    this.hasThunks = hasThunks;
    this.hooks = hooks;
    this.descendantHooks = descendantHooks;
  }
}

/** Represents a text node in the virtual DOM tree. */
export class VText {
  [key: string]: any;
  text: string;
  version: string;
  type: string;

  constructor(text: string) {
    this.text = String(text);
    this.version = VERSION;
    this.type = 'VirtualText';
  }
}

/** Check if a value is a VNode. */
export function isVNode(vnode: unknown): vnode is VNode {
  return !!vnode && (vnode as VNode).type === 'VirtualNode';
}

/** Check if a value is a VText. */
export function isVText(vtext: unknown): vtext is VText {
  return !!vtext && (vtext as VText).type === 'VirtualText';
}
