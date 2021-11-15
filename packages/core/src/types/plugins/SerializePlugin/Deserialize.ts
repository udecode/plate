import { PlateEditor } from '../../PlateEditor';
import { TDescendant } from '../../slate/TDescendant';
import { HandlerReturnType } from '../PlatePlugin/DOMHandlers';
import { WithPlatePlugin } from '../PlatePlugin/PlatePlugin';

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
export type Deserialize<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: WithPlatePlugin<T, P>
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
