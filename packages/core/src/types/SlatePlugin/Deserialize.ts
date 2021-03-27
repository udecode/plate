import { SPEditor } from '../SPEditor';

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
export type Deserialize = (
  editor: SPEditor
) => {
  element?: DeserializeNode[];
  leaf?: DeserializeNode[];
};
