// rbush 4.0.1 ships no type declarations; these cover the calls arm W makes.
declare module 'rbush' {
  export type BBox = {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
  };

  export default class RBush<T extends BBox = BBox> {
    constructor(maxEntries?: number);
    clear(): this;
    load(items: readonly T[]): this;
    search(box: BBox): T[];
  }
}
