export const createDataTransfer = (dataMap: Map<string, string> = new Map()) =>
  ({
    getData: (type: string) => dataMap.get(type) ?? '',
    setData: (type: string, value: string) => {
      dataMap.set(type, value);
    },
  }) as unknown as DataTransfer;
