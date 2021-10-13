import { SPEditor } from '../SPEditor';
import { TDescendant } from '../TDescendant';
import { HandlerReturnType } from './DOMHandlers';

export type DeserializeNode = {
  type: string;
  deserialize: (
    el: HTMLElement
  ) =>
    | {
        [key: string]: unknown;
      }
    | undefined;
  withoutChildren?: boolean;
};

/**
 * HTML Deserializer for element and leaf.
 */
export type Deserialize<T extends SPEditor = SPEditor> = (
  editor: T
) => {
  element?: DeserializeNode[];
  leaf?: DeserializeNode[];

  /**
   * Function called on `editor.insertData` to filter the fragment to insert.
   */
  getFragment?: (fragment: TDescendant[]) => TDescendant[];

  /**
   * Function called on `editor.insertData` just before `editor.insertFragment`.
   * Default: if the block above the selection is empty and the first fragment node type is not inline,
   * set the selected node type to the first fragment node type.
   * @return if true, the next handlers will be skipped.
   */
  preInsert?: (fragment: TDescendant[]) => HandlerReturnType;

  isDisabled?: (deserializerId: string) => boolean;
};
