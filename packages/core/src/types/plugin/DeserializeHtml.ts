import { AnyObject } from '@udecode/slate-utils/src';

export type DeserializeHtml = {
  /**
   * List of HTML attribute names to store their values in `node.attributes`.
   */
  attributeNames?: string[];

  /**
   * Deserialize an element.
   * Use this instead of plugin.isElement if you don't want the plugin to renderElement.
   * @default plugin.isElement
   */
  isElement?: boolean;

  /**
   * Deserialize a leaf.
   * Use this instead of plugin.isLeaf if you don't want the plugin to renderLeaf.
   * @default plugin.isLeaf
   */
  isLeaf?: boolean;

  /**
   * Deserialize html element to slate node.
   */
  getNode?: (
    element: HTMLElement,
    node: AnyObject
  ) => AnyObject | undefined | void;

  query?: (element: HTMLElement) => boolean;

  rules?: {
    /**
     * Deserialize an element:
     * - if this option (string) is in the element attribute names.
     * - if this option (object) values match the element attributes.
     */
    validAttribute?: string | { [key: string]: string | string[] };

    /**
     * Valid element `className`.
     */
    validClassName?: string;

    /**
     * Valid element `nodeName`.
     * Set '*' to allow any node name.
     */
    validNodeName?: string | string[];

    /**
     * Valid element style values.
     * Can be a list of string (only one match is needed).
     */
    validStyle?: Partial<
      Record<keyof CSSStyleDeclaration, string | string[] | undefined>
    >;
  }[];

  /**
   * Whether or not to include deserialized children on this node
   */
  withoutChildren?: boolean;
};
