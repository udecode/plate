export const createDataTransfer = (dataMap: Map<string, any> = new Map()) =>
  (({
    getData: (key: string) => dataMap.get(key) ?? '',
    setData: (key: string, value: string) => dataMap.set(key, value),
  } as unknown) as DataTransfer);
