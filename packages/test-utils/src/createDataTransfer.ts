export type DataTransferDataMap = Map<DataTransferDataType, unknown>;

export type DataTransferDataType = string | 'text/html' | 'text/plain';

export const createDataTransfer = (dataMap: DataTransferDataMap = new Map()) =>
  ({
    getData: (type: string) => dataMap.get(type) ?? '',
    setData: (type: string, value: string) => dataMap.set(type, value),
  }) as unknown as DataTransfer;
