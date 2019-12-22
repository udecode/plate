interface DeserializeElement {
  [key: string]: (
    el?: any
  ) => {
    type: string;
    [key: string]: any;
  };
}

interface DeserializeLeaf {
  [key: string]: (
    el?: any
  ) => {
    [key: string]: any;
  };
}

export interface DeserializeHtml {
  element?: DeserializeElement;
  leaf?: DeserializeLeaf;
}
