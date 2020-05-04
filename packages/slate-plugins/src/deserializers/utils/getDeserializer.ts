/**
 * Get deserializer from the type and the possible tag names
 */
export const getDeserializer = (
  type: string,
  tagNames: string[],
  cb: (el: HTMLElement) => Record<string, any> = () => ({ type })
): Record<string, () => { type: string }> =>
  tagNames.reduce(
    (obj: Record<string, any>, tagName) => {
      obj[tagName] = cb;
      return obj;
    },
    {
      [type]: () => ({ type }),
    }
  );
