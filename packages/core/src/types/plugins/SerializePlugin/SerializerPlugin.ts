import { Deserialize } from './Deserialize';
import { Serialize } from './Serialize';

export interface SerializerPlugin<T = {}, P = {}> {
  /**
   * @see {@link DeserializeHtml}
   */
  deserialize?: Deserialize<T, P>;

  /**
   * @see {@link SerializeHtml}
   */
  serialize?: Serialize;
}
