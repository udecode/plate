import { RenderNodeOptions } from './RenderNodeOptions';
import { WithOptional } from './WithOptional';

export interface GetNodeDeserializerRule {
  /**
   * Required node names to deserialize the element.
   * Set '*' to allow any node name.
   */
  nodeNames?: string | string[];

  /**
   * Required className to deserialized the element.
   */
  className?: string;

  /**
   * Required style to deserialize the element. Each value should be a (list of) string.
   */
  style?: Partial<
    Record<keyof CSSStyleDeclaration, string | string[] | undefined>
  >;

  /**
   * Required attribute name or name + value
   */
  attribute?: string | { [key: string]: string | string[] };
}

export interface GetNodeDeserializerOptions {
  type: string;

  /**
   * Slate node creator from HTML element.
   */
  node: (el: HTMLElement) => { [key: string]: any } | undefined;

  /**
   * List of html attributes to store with the node
   */
  attributes?: string[];

  /**
   * List of rules the element needs to follow to be deserialized to a slate node.
   */
  rules: GetNodeDeserializerRule[];

  /**
   * Whether or not to include deserialized children on this node
   */
  withoutChildren?: boolean;
}

export interface GetElementDeserializerOptions
  extends WithOptional<GetNodeDeserializerOptions, 'node'> {
  type: string;
}

export interface GetLeafDeserializerOptions
  extends WithOptional<
    Omit<GetNodeDeserializerOptions, 'withoutChildren'>,
    'node'
  > {
  type: string;
}

export type DeserializerOptions =
  | GetElementDeserializerOptions
  | GetLeafDeserializerOptions;

export interface Deserialize extends RenderNodeOptions {
  /**
   * `getElementDeserializer` and `getLeafDeserializer` options
   */
  deserialize?: Partial<DeserializerOptions>;
}
