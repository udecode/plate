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
  Range,
  Value,
} from '../../index';
import type { MaximizeMode, RangeMode } from '../../types/types';
import type { NodeMatch, PropsCompare, PropsMerge } from '../editor';

export interface NodeInsertNodesOptions<T extends Node> {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: RangeMode;
  hanging?: boolean;
  select?: boolean;
  voids?: boolean;
  batchDirty?: boolean;
}

export type NodeDuplicateOptions<T extends Node> = Omit<
  NodeInsertNodesOptions<T>,
  'at'
>;

export type BlockDuplicateOptions<T extends Element = Element> = {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: RangeMode;
  voids?: boolean;
} & Pick<NodeInsertNodesOptions<T>, 'batchDirty' | 'hanging' | 'select'>;

export interface NodeReplaceChildrenOptions {
  at: Path;
  count?: number;
  index?: number;
  newSelection?: Range | null;
}

export interface NodeSetNodesOptions<T extends Node = Node> {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: MaximizeMode;
  hanging?: boolean;
  split?: boolean;
  voids?: boolean;
  compare?: PropsCompare;
  merge?: PropsMerge;
}

export interface NodeUnsetNodesOptions<T extends Node = Node> {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: MaximizeMode;
  hanging?: boolean;
  split?: boolean;
  voids?: boolean;
}

export interface NodeMutationMethods<V extends Value = Value> {
  /**
   * Insert nodes in the editor
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertNodes: <T extends ElementOrTextIn<V>>(
    editor: Editor<V>,
    nodes: T | T[],
    options?: NodeInsertNodesOptions<T>
  ) => void;

  /**
   * Lift nodes at a specific location upwards in the document tree, splitting
   * their parent in two if necessary.
   */
  liftNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      voids?: boolean;
    }
  ) => void;

  /**
   * Merge a node at a location with the previous node of the same depth,
   * removing any empty containing nodes after the merge if necessary.
   */
  mergeNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      hanging?: boolean;
      voids?: boolean;
    }
  ) => void;

  /**
   * Move the nodes at a location to a new location.
   */
  moveNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    options: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      to: Path;
      voids?: boolean;
    }
  ) => void;

  /**
   * Remove the nodes at a specific location in the document.
   */
  removeNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      hanging?: boolean;
      voids?: boolean;
    }
  ) => void;

  /**
   * Replace a range of children under an ancestor node as one logical
   * `replace_children` operation.
   */
  replaceChildren: <T extends ElementOrTextIn<V>>(
    editor: Editor<V>,
    children: T[],
    options: NodeReplaceChildrenOptions
  ) => void;

  /**
   * Set new properties on the nodes at a location.
   */
  setNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    props: Partial<NodeProps<T>>,
    options?: NodeSetNodesOptions<T>
  ) => void;

  /**
   * Split the nodes at a specific location.
   */
  splitNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      always?: boolean;
      height?: number;
      position?: number;
      voids?: boolean;
    }
  ) => void;

  /**
   * Unset properties on the nodes at a location.
   */
  unsetNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    props: string | string[],
    options?: NodeUnsetNodesOptions<T>
  ) => void;

  /**
   * Unwrap the nodes at a location from a parent node, splitting the parent if
   * necessary to ensure that only the content in the range is unwrapped.
   */
  unwrapNodes: <T extends NodeIn<V>>(
    editor: Editor<V>,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      split?: boolean;
      voids?: boolean;
    }
  ) => void;

  /**
   * Wrap the nodes at a location in a new container node, splitting the edges
   * of the range first to ensure that only the content in the range is wrapped.
   */
  wrapNodes: <T extends NodeIn<V>, E extends ElementIn<V>>(
    editor: Editor<V>,
    element: E,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      split?: boolean;
      voids?: boolean;
    }
  ) => void;
}
