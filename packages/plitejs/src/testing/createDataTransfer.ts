export const createDataTransfer = (dataMap = new Map<string, string>()) =>
  ({
    files: [],
    getData: (type: string) => dataMap.get(type) ?? '',
    setData: (type: string, value: string) => {
      dataMap.set(type, value);
    },
    get types() {
      return [...dataMap.keys()];
    },
  }) as unknown as DataTransfer;
