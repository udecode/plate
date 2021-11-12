import { Deserialize } from './Deserialize';
import { Serialize } from './Serialize';

export interface SerializePlugin<T = {}> {
  /**
   * @see {@link DeserializeHtml}
   */
  deserialize?: Deserialize<T>;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: Serialize;
}
