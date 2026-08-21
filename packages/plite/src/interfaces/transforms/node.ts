import type {
  Element,
  Editor,
  ElementIn,
  ElementOrTextIn,
  Location,
  Node,
  NodeIn,
  NodeProps,
  Path,
  Selection,
  Value,
} from '../../index';
import type { MaximizeMode, RangeMode } from '../../types/types';
import type { NodeForTypeSelector, PropsCompare, PropsMerge } from '../editor';
import type { NodeMatch, NodeTypeSelector } from '../node';

export interface NodeInsertSplitOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = undefined,
> {
  match?: NodeMatch<T>;
  type?: TType;
}

export interface NodeInsertNodesOptions<
  TSplit extends Node = Node,
  TType extends NodeTypeSelector | undefined = undefined,
> {
  at?: Location;
  mode?: RangeMode;
  hanging?: boolean;
  select?: boolean;
  split?: NodeInsertSplitOptions<TSplit, TType>;
  voids?: boolean;
}

export interface NodeRemoveNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  hanging?: boolean;
  voids?: boolean;
}

export interface NodeLiftNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface NodeMergeNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: RangeMode;
  hanging?: boolean;
  voids?: boolean;
}

export interface NodeMoveNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  to: Path;
  voids?: boolean;
}

export interface NodeSplitNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: RangeMode;
  always?: boolean;
  height?: number;
  position?: number;
  voids?: boolean;
}

export interface NodeUnwrapNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  split?: boolean;
  voids?: boolean;
}

export interface NodeWrapNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  split?: boolean;
  voids?: boolean;
}

export type NodeDuplicateOptions = Pick<
  NodeInsertNodesOptions,
  'hanging' | 'select' | 'voids'
>;

export type BlockDuplicateOptions<
  T extends Element = Element,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> = {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: RangeMode;
  voids?: boolean;
} & Pick<NodeInsertNodesOptions, 'hanging' | 'select'>;

export interface NodeReplaceChildrenOptions {
  at: Path;
  count?: number;
  index?: number;
  newSelection?: Selection;
  /** Preserve runtime keys for positionally corresponding replacements. */
  preserveKeys?: boolean;
}

export interface NodeSetNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  hanging?: boolean;
  marks?: boolean;
  split?: boolean;
  voids?: boolean;
  compare?: PropsCompare;
  merge?: PropsMerge;
}

export interface NodeUnsetNodesOptions<
  T extends Node = Node,
  TType extends NodeTypeSelector | undefined = NodeTypeSelector | undefined,
> {
  at?: Location;
  match?: NodeMatch<T>;
  type?: TType;
  mode?: MaximizeMode;
  hanging?: boolean;
  split?: boolean;
  voids?: boolean;
}

type NodeMutationTarget<
  V extends Value,
  TType extends NodeTypeSelector | undefined,
> = undefined extends TType
  ? NodeIn<V>
  : NodeForTypeSelector<Extract<TType, NodeTypeSelector>>;

type OptionalSelectorOptions<
  TOptions extends { type?: NodeTypeSelector | undefined },
> = undefined extends TOptions['type'] ? TOptions : never;

export interface NodeMutationMethods<V extends Value = Value> {
  /**
   * Insert nodes in the editor
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      T extends ElementOrTextIn<TValue>,
      const TType extends NodeTypeSelector | undefined,
    >(
      editor: Editor<TValue, TExtensions>,
      nodes: T | readonly T[],
      options: NodeInsertNodesOptions<
        NodeMutationTarget<TValue, TType>,
        TType
      > & {
        split: NodeInsertNodesOptions<
          NodeMutationTarget<TValue, TType>,
          TType
        >['split'] & { type: TType };
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      T extends ElementOrTextIn<TValue>,
    >(
      editor: Editor<TValue, TExtensions>,
      nodes: T | readonly T[],
      options?: NodeInsertNodesOptions<NodeIn<TValue>, undefined>
    ): void;
  };

  /**
   * Lift nodes at a specific location upwards in the document tree, splitting
   * their parent in two if necessary.
   */
  liftNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      options: NodeLiftNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeLiftNodesOptions<NodeIn<TValue>> =
        NodeLiftNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /**
   * Merge a node at a location with the previous node of the same depth,
   * removing any empty containing nodes after the merge if necessary.
   */
  mergeNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      options: NodeMergeNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeMergeNodesOptions<NodeIn<TValue>> =
        NodeMergeNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /**
   * Move the nodes at a location to a new location.
   */
  moveNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      options: NodeMoveNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeMoveNodesOptions<NodeIn<TValue>> =
        NodeMoveNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      options: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /**
   * Remove the nodes at a specific location in the document.
   */
  removeNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      options: NodeRemoveNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeRemoveNodesOptions<NodeIn<TValue>> =
        NodeRemoveNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /** Replace a range of children under an ancestor node atomically. */
  replaceChildren: <
    TValue extends V,
    TExtensions extends readonly unknown[],
    T extends ElementOrTextIn<TValue>,
  >(
    editor: Editor<TValue, TExtensions>,
    children: readonly T[],
    options: NodeReplaceChildrenOptions
  ) => void;

  /**
   * Set new properties on the nodes at a location.
   */
  setNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      props: Partial<NodeProps<NodeForTypeSelector<TType>>>,
      options: NodeSetNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeSetNodesOptions<NodeIn<TValue>> =
        NodeSetNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      props: Partial<NodeProps<NodeIn<TValue>>>,
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /**
   * Split the nodes at a specific location.
   */
  splitNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      options: NodeSplitNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeSplitNodesOptions<NodeIn<TValue>> =
        NodeSplitNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /**
   * Unset properties on the nodes at a location.
   */
  unsetNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      props: string | readonly string[],
      options: NodeUnsetNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeUnsetNodesOptions<NodeIn<TValue>> =
        NodeUnsetNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      props: string | readonly string[],
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /**
   * Unwrap the nodes at a location from a parent node, splitting the parent if
   * necessary to ensure that only the content in the range is unwrapped.
   */
  unwrapNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      options: NodeUnwrapNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeUnwrapNodesOptions<NodeIn<TValue>> =
        NodeUnwrapNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };

  /**
   * Wrap the nodes at a location in a new container node, splitting the edges
   * of the range first to ensure that only the content in the range is wrapped.
   */
  wrapNodes: {
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TType extends NodeTypeSelector,
    >(
      editor: Editor<TValue, TExtensions>,
      element: ElementIn<TValue>,
      options: NodeWrapNodesOptions<NodeForTypeSelector<TType>, TType> & {
        type: TType;
      }
    ): void;
    <
      TValue extends V,
      TExtensions extends readonly unknown[],
      const TOptions extends NodeWrapNodesOptions<NodeIn<TValue>> =
        NodeWrapNodesOptions<NodeIn<TValue>>,
    >(
      editor: Editor<TValue, TExtensions>,
      element: ElementIn<TValue>,
      options?: OptionalSelectorOptions<TOptions>
    ): void;
  };
}
