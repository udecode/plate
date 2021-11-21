export interface RtfImage {
  hex: string;
  mimeType: string;
  spid: string;
}

export type RtfImagesMap = Record<RtfImage['spid'], RtfImage>;
