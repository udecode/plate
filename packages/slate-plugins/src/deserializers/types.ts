export type DeserializeElement = Record<
  string,
  (
    el: HTMLElement
  ) =>
    | {
        type: string;
        [key: string]: any;
      }
    | undefined
>;

export type DeserializeLeafValue = (
  el: HTMLElement
) => Record<string, any> | undefined | false;

type DeserializeLeaf = Record<string, DeserializeLeafValue>;

export interface DeserializeHtml {
  element?: DeserializeElement;
  leaf?: DeserializeLeaf;
}
