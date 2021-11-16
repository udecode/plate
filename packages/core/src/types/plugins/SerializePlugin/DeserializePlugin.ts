import { AnyObject } from '../../utility/AnyObject';
import { WithOptional } from '../../utility/WithOptional';

export interface NodeDeserializePluginRule {
  /**
   * Deserialize an element if its `nodeName` is in this list.
   * Set '*' to allow any node name.
   */
  nodeNames?: string | string[];

  /**
   * Deserialize an element if its `className` match this option.
   */
  className?: string;

  /**
   * Deserialize an element if this option values match the element style values.
   * Option value can be a list of string (only one match is needed).
   */
  style?: Partial<
    Record<keyof CSSStyleDeclaration, string | string[] | undefined>
  >;

  /**
   * Deserialize an element:
   * - if this option (string) is in the element attribute names.
   * - if this option (object) values match the element attributes.
   */
  attribute?: string | { [key: string]: string | string[] };
}

export interface NodeDeserializePlugin {
  type?: string;

  /**
   * Map HTML element to slate node.
   */
  getNode?: (el: HTMLElement) => AnyObject | undefined;

  /**
   * List of rules the element needs to follow to be deserialized to a slate node.
   */
  rules?: NodeDeserializePluginRule[];

  /**
   * List of HTML attribute names to store their values in `node.attributes`.
   */
  attributeNames?: string[];

  /**
   * Whether or not to include deserialized children on this node
   */
  withoutChildren?: boolean;
}

export interface ElementDeserializePlugin
  extends WithOptional<NodeDeserializePlugin, 'getNode'> {
  type?: string;
}

export interface LeafDeserializePlugin
  extends WithOptional<
    Omit<NodeDeserializePlugin, 'withoutChildren'>,
    'getNode'
  > {
  type?: string;
}

export type DeserializePlugin =
  | ElementDeserializePlugin
  | LeafDeserializePlugin;
