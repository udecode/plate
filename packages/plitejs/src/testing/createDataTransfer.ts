export const createDataTransfer = (dataMap = new Map<string, string>()) =>
  ({
    getData: (type: string) => dataMap.get(type) ?? '',
    setData: (type: string, value: string) => {
      dataMap.set(type, value);
    },
  }) as unknown as DataTransfer;
