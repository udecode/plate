export const pixelRegex = /([\d.]+)px/i;
export const percentageRegex = /([\d.]+)%/i;
export const pointRegex = /([\d.]+)pt/i;
export const cmRegex = /([\d.]+)cm/i;
export const inchRegex = /([\d.]+)in/i;

export const pixelToEMU = (pixelValue) => Math.round(pixelValue * 9525);

export const EMUToPixel = (EMUValue) => Math.round(EMUValue / 9525);

export const TWIPToEMU = (TWIPValue) => Math.round(TWIPValue * 635);

export const EMUToTWIP = (EMUValue) => Math.round(EMUValue / 635);

export const pointToTWIP = (pointValue) => Math.round(pointValue * 20);

export const TWIPToPoint = (TWIPValue) => Math.round(TWIPValue / 20);

export const pointToHIP = (pointValue) => Math.round(pointValue * 2);

export const HIPToPoint = (HIPValue) => Math.round(HIPValue / 2);

export const HIPToTWIP = (HIPValue) => Math.round(HIPValue * 10);

export const TWIPToHIP = (TWIPValue) => Math.round(TWIPValue / 10);

export const pixelToTWIP = (pixelValue) => EMUToTWIP(pixelToEMU(pixelValue));

export const TWIPToPixel = (TWIPValue) => EMUToPixel(TWIPToEMU(TWIPValue));

export const pixelToHIP = (pixelValue) =>
  TWIPToHIP(EMUToTWIP(pixelToEMU(pixelValue)));

export const HIPToPixel = (HIPValue) =>
  EMUToPixel(TWIPToEMU(HIPToTWIP(HIPValue)));

export const inchToPoint = (inchValue) => Math.round(inchValue * 72);

export const inchToTWIP = (inchValue) => pointToTWIP(inchToPoint(inchValue));

export const cmToInch = (cmValue) => cmValue * 0.393_700_8;

export const cmToTWIP = (cmValue) => inchToTWIP(cmToInch(cmValue));

export const pixelToPoint = (pixelValue) => HIPToPoint(pixelToHIP(pixelValue));

export const pointToPixel = (pointValue) => HIPToPixel(pointToHIP(pointValue));

export const EIPToPoint = (EIPValue) => Math.round(EIPValue / 8);

export const pointToEIP = (PointValue) => Math.round(PointValue * 8);

export const pixelToEIP = (pixelValue) => pointToEIP(pixelToPoint(pixelValue));

export const EIPToPixel = (EIPValue) => pointToPixel(EIPToPoint(EIPValue));
