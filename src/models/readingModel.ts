export interface Reading {
  customerCode: string;
  measureType: string;
  month: string;
  measureValue: number;
  imageUrl: string;
  measureUuid: string;
}

const readings = new Map<string, Reading>();

export const getReadingForMonth = (customerCode: string, measureType: string, month: string): Reading | undefined => {
  const key = `${customerCode}-${measureType}-${month}`;
  return readings.get(key);
};

export const saveReading = (reading: Reading): void => {
  const key = `${reading.customerCode}-${reading.measureType}-${reading.month}`;
  readings.set(key, reading);
};
