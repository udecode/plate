import type { AnyObject } from '@udecode/utils';

import type { PlatePluginContext } from './PlatePlugin';

export type DeserializeHtml<O = {}, A = {}, T = {}, S = {}> = {
  /** List of HTML attribute names to store their values in `node.attributes`. */
  attributeNames?: string[];

  /** Deserialize html element to slate node. */
  getNode?: (
    options: {
      element: HTMLElement;
      node: AnyObject;
    } & PlatePluginContext<string, O, A, T, S>
  ) => AnyObject | undefined | void;

  /**
   * Deserialize an element. Use this instead of plugin.isElement if you don't
   * want the plugin to renderElement.
   *
   * @default plugin.isElement
   */
  isElement?: boolean;

  /**
   * Deserialize a leaf. Use this instead of plugin.isLeaf if you don't want the
   * plugin to renderLeaf.
   *
   * @default plugin.isLeaf
   */
  isLeaf?: boolean;

  query?: (
    options: { element: HTMLElement } & PlatePluginContext<string, O, A, T, S>
  ) => boolean;

  rules?: {
    /**
     * Deserialize an element:
     *
     * - If this option (string) is in the element attribute names.
     * - If this option (object) values match the element attributes.
     */
    validAttribute?: Record<string, string | string[]> | string;

    /** Valid element `className`. */
    validClassName?: string;

    /** Valid element `nodeName`. Set '*' to allow any node name. */
    validNodeName?: string | string[];

    /**
     * Valid element style values. Can be a list of string (only one match is
     * needed).
     */
    validStyle?: Partial<
      Record<keyof CSSStyleDeclaration, string | string[] | undefined>
    >;
  }[];

  /** Whether or not to include deserialized children on this node */
  withoutChildren?: boolean;
};
