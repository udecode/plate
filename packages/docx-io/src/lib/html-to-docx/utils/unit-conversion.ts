export const pixelRegex = /([\d.]+)px/i;
export const percentageRegex = /([\d.]+)%/i;
export const pointRegex = /([\d.]+)pt/i;
export const cmRegex = /([\d.]+)cm/i;
export const inchRegex = /([\d.]+)in/i;

export const pixelToEMU = (pixelValue: number): number =>
  Math.round(pixelValue * 9525);

export const EMUToPixel = (EMUValue: number): number =>
  Math.round(EMUValue / 9525);

export const TWIPToEMU = (TWIPValue: number): number =>
  Math.round(TWIPValue * 635);

export const EMUToTWIP = (EMUValue: number): number =>
  Math.round(EMUValue / 635);

export const pointToTWIP = (pointValue: number): number =>
  Math.round(pointValue * 20);

export const TWIPToPoint = (TWIPValue: number): number =>
  Math.round(TWIPValue / 20);

export const pointToHIP = (pointValue: number): number =>
  Math.round(pointValue * 2);

export const HIPToPoint = (HIPValue: number): number =>
  Math.round(HIPValue / 2);

export const HIPToTWIP = (HIPValue: number): number =>
  Math.round(HIPValue * 10);

export const TWIPToHIP = (TWIPValue: number): number =>
  Math.round(TWIPValue / 10);

export const pixelToTWIP = (pixelValue: number): number =>
  EMUToTWIP(pixelToEMU(pixelValue));

export const TWIPToPixel = (TWIPValue: number): number =>
  EMUToPixel(TWIPToEMU(TWIPValue));

export const pixelToHIP = (pixelValue: number): number =>
  TWIPToHIP(EMUToTWIP(pixelToEMU(pixelValue)));

export const HIPToPixel = (HIPValue: number): number =>
  EMUToPixel(TWIPToEMU(HIPToTWIP(HIPValue)));

export const inchToPoint = (inchValue: number): number =>
  Math.round(inchValue * 72);

export const inchToTWIP = (inchValue: number): number =>
  pointToTWIP(inchToPoint(inchValue));

export const cmToInch = (cmValue: number): number => cmValue * 0.393_700_8;

export const cmToTWIP = (cmValue: number): number =>
  inchToTWIP(cmToInch(cmValue));

export const pixelToPoint = (pixelValue: number): number =>
  HIPToPoint(pixelToHIP(pixelValue));

export const pointToPixel = (pointValue: number): number =>
  HIPToPixel(pointToHIP(pointValue));

export const EIPToPoint = (EIPValue: number): number =>
  Math.round(EIPValue / 8);

export const pointToEIP = (PointValue: number): number =>
  Math.round(PointValue * 8);

export const pixelToEIP = (pixelValue: number): number =>
  pointToEIP(pixelToPoint(pixelValue));

export const EIPToPixel = (EIPValue: number): number =>
  pointToPixel(EIPToPoint(EIPValue));
