export interface DeserializeElement {
  [key: string]: (
    el: HTMLElement
  ) =>
    | {
        type: string;
        [key: string]: any;
      }
    | undefined;
}

export type DeserializeLeafValue = (
  el: HTMLElement
) =>
  | {
      [key: string]: any;
    }
  | undefined
  | false;

interface DeserializeLeaf {
  [key: string]: DeserializeLeafValue;
}

export interface DeserializeHtml {
  element?: DeserializeElement;
  leaf?: DeserializeLeaf;
}
