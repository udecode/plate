/**
 * FIB (File Information Block) Parser
 *
 * The FIB is the master index of a Word binary document. It contains
 * pointers to all other data structures in the file.
 *
 * References:
 * - [MS-DOC] 2.5.1 Fib
 * - https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-doc/
 */

import { FIB_CONSTANTS, FIB_VERSIONS, DOC_STREAM_NAMES } from '../types/Constants';
import { FIB, FibBase, FibRgW97, FibRgLw97, FibRgFcLcb } from '../types/DocTypes';

/**
 * Error thrown when FIB parsing fails
 */
export class FIBParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FIBParseError';
  }
}

/**
 * FIB field definitions with offsets
 * Each entry is [name, offsetInFibRgFcLcb, description]
 */
const FIB_FCRLCB_FIELDS: [string, number][] = [
  // FibRgFcLcb97 fields (Word 97)
  ['fcStshfOrig', 0],
  ['lcbStshfOrig', 4],
  ['fcStshf', 8],
  ['lcbStshf', 12],
  ['fcPlcffndRef', 16],
  ['lcbPlcffndRef', 20],
  ['fcPlcffndTxt', 24],
  ['lcbPlcffndTxt', 28],
  ['fcPlcfandRef', 32],
  ['lcbPlcfandRef', 36],
  ['fcPlcfandTxt', 40],
  ['lcbPlcfandTxt', 44],
  ['fcPlcfSed', 48],
  ['lcbPlcfSed', 52],
  ['fcPlcPad', 56],
  ['lcbPlcPad', 60],
  ['fcPlcfPhe', 64],
  ['lcbPlcfPhe', 68],
  ['fcSttbfGlsy', 72],
  ['lcbSttbfGlsy', 76],
  ['fcPlcfGlsy', 80],
  ['lcbPlcfGlsy', 84],
  ['fcPlcfHdd', 88],
  ['lcbPlcfHdd', 92],
  ['fcPlcfBteChpx', 96],
  ['lcbPlcfBteChpx', 100],
  ['fcPlcfBtePapx', 104],
  ['lcbPlcfBtePapx', 108],
  ['fcPlcfSea', 112],
  ['lcbPlcfSea', 116],
  ['fcSttbfFfn', 120],
  ['lcbSttbfFfn', 124],
  ['fcPlcfFldMom', 128],
  ['lcbPlcfFldMom', 132],
  ['fcPlcfFldHdr', 136],
  ['lcbPlcfFldHdr', 140],
  ['fcPlcfFldFtn', 144],
  ['lcbPlcfFldFtn', 148],
  ['fcPlcfFldAtn', 152],
  ['lcbPlcfFldAtn', 156],
  ['fcPlcfFldMcr', 160],
  ['lcbPlcfFldMcr', 164],
  ['fcSttbfBkmk', 168],
  ['lcbSttbfBkmk', 172],
  ['fcPlcfBkf', 176],
  ['lcbPlcfBkf', 180],
  ['fcPlcfBkl', 184],
  ['lcbPlcfBkl', 188],
  ['fcCmds', 192],
  ['lcbCmds', 196],
  ['fcUnused1', 200],
  ['lcbUnused1', 204],
  ['fcSttbfMcr', 208],
  ['lcbSttbfMcr', 212],
  ['fcPrDrvr', 216],
  ['lcbPrDrvr', 220],
  ['fcPrEnvPort', 224],
  ['lcbPrEnvPort', 228],
  ['fcPrEnvLand', 232],
  ['lcbPrEnvLand', 236],
  ['fcWss', 240],
  ['lcbWss', 244],
  ['fcDop', 248],
  ['lcbDop', 252],
  ['fcSttbfAssoc', 256],
  ['lcbSttbfAssoc', 260],
  ['fcClx', 264],
  ['lcbClx', 268],
  ['fcPlcfPgdFtn', 272],
  ['lcbPlcfPgdFtn', 276],
  ['fcAutosaveSource', 280],
  ['lcbAutosaveSource', 284],
  ['fcGrpXstAtnOwners', 288],
  ['lcbGrpXstAtnOwners', 292],
  ['fcSttbfAtnBkmk', 296],
  ['lcbSttbfAtnBkmk', 300],
  ['fcUnused2', 304],
  ['lcbUnused2', 308],
  ['fcUnused3', 312],
  ['lcbUnused3', 316],
  ['fcPlcSpaMom', 320],
  ['lcbPlcSpaMom', 324],
  ['fcPlcSpaHdr', 328],
  ['lcbPlcSpaHdr', 332],
  ['fcPlcfAtnBkf', 336],
  ['lcbPlcfAtnBkf', 340],
  ['fcPlcfAtnBkl', 344],
  ['lcbPlcfAtnBkl', 348],
  ['fcPms', 352],
  ['lcbPms', 356],
  ['fcFormFldSttbs', 360],
  ['lcbFormFldSttbs', 364],
  ['fcPlcfendRef', 368],
  ['lcbPlcfendRef', 372],
  ['fcPlcfendTxt', 376],
  ['lcbPlcfendTxt', 380],
  ['fcPlcfFldEdn', 384],
  ['lcbPlcfFldEdn', 388],
  ['fcUnused4', 392],
  ['lcbUnused4', 396],
  ['fcDggInfo', 400],
  ['lcbDggInfo', 404],
  ['fcSttbfRMark', 408],
  ['lcbSttbfRMark', 412],
  ['fcSttbfCaption', 416],
  ['lcbSttbfCaption', 420],
  ['fcSttbfAutoCaption', 424],
  ['lcbSttbfAutoCaption', 428],
  ['fcPlcfWkb', 432],
  ['lcbPlcfWkb', 436],
  ['fcPlcfSpl', 440],
  ['lcbPlcfSpl', 444],
  ['fcPlcftxbxTxt', 448],
  ['lcbPlcftxbxTxt', 452],
  ['fcPlcfFldTxbx', 456],
  ['lcbPlcfFldTxbx', 460],
  ['fcPlcfHdrtxbxTxt', 464],
  ['lcbPlcfHdrtxbxTxt', 468],
  ['fcPlcffldHdrTxbx', 472],
  ['lcbPlcffldHdrTxbx', 476],
  ['fcStwUser', 480],
  ['lcbStwUser', 484],
  ['fcSttbTtmbd', 488],
  ['lcbSttbTtmbd', 492],
  ['fcCookieData', 496],
  ['lcbCookieData', 500],
  ['fcPgdMotherDocPre10', 504],
  ['lcbPgdMotherDocPre10', 508],
  ['fcBkdMotherDocPre10', 512],
  ['lcbBkdMotherDocPre10', 516],
  ['fcPgdFtnDocPre10', 520],
  ['lcbPgdFtnDocPre10', 524],
  ['fcBkdFtnDocPre10', 528],
  ['lcbBkdFtnDocPre10', 532],
  ['fcPgdEdnDocPre10', 536],
  ['lcbPgdEdnDocPre10', 540],
  ['fcBkdEdnDocPre10', 544],
  ['lcbBkdEdnDocPre10', 548],
  ['fcSttbfIntlFld', 552],
  ['lcbSttbfIntlFld', 556],
  ['fcRouteSlip', 560],
  ['lcbRouteSlip', 564],
  ['fcSttbSavedBy', 568],
  ['lcbSttbSavedBy', 572],
  ['fcSttbFnm', 576],
  ['lcbSttbFnm', 580],
  ['fcPlfLst', 584],
  ['lcbPlfLst', 588],
  ['fcPlfLfo', 592],
  ['lcbPlfLfo', 596],
  ['fcPlcfTxbxBkd', 600],
  ['lcbPlcfTxbxBkd', 604],
  ['fcPlcfTxbxHdrBkd', 608],
  ['lcbPlcfTxbxHdrBkd', 612],
  ['fcDocUndoWord9', 616],
  ['lcbDocUndoWord9', 620],
  ['fcRgbUse', 624],
  ['lcbRgbUse', 628],
  ['fcUsp', 632],
  ['lcbUsp', 636],
  ['fcUskf', 640],
  ['lcbUskf', 644],
  ['fcPlcupcRgbUse', 648],
  ['lcbPlcupcRgbUse', 652],
  ['fcPlcupcUsp', 656],
  ['lcbPlcupcUsp', 660],
  ['fcSttbGlsyStyle', 664],
  ['lcbSttbGlsyStyle', 668],
  ['fcPlgosl', 672],
  ['lcbPlgosl', 676],
  ['fcPlcocx', 680],
  ['lcbPlcocx', 684],
  ['fcPlcfBteLvc', 688],
  ['lcbPlcfBteLvc', 692],
  ['dwLowDateTime', 696],
  ['dwHighDateTime', 700],
  ['fcPlcfLvcPre10', 704],
  ['lcbPlcfLvcPre10', 708],
  ['fcPlcfAsumy', 712],
  ['lcbPlcfAsumy', 716],
  ['fcPlcfGram', 720],
  ['lcbPlcfGram', 724],
  ['fcSttbListNames', 728],
  ['lcbSttbListNames', 732],
  ['fcSttbfUssr', 736],
  ['lcbSttbfUssr', 740],
];

/**
 * Parse the File Information Block from WordDocument stream
 */
export class FIBParser {
  private data: Uint8Array;
  private view: DataView;

  constructor(wordDocumentStream: Uint8Array) {
    this.data = wordDocumentStream;
    this.view = new DataView(this.data.buffer, this.data.byteOffset, this.data.byteLength);
  }

  /**
   * Parse the complete FIB structure
   */
  parse(): FIB {
    this.validateFIB();

    const base = this.parseFibBase();
    const rgW97 = this.parseFibRgW97();
    const rgLw97 = this.parseFibRgLw97();
    const rgFcLcb = this.parseFibRgFcLcb(base.nFib);

    return {
      base,
      rgW97,
      rgLw97,
      rgFcLcb,
      tableStreamName: base.fWhichTblStm ? '1Table' : '0Table',
    };
  }

  /**
   * Validate the FIB structure
   */
  private validateFIB(): void {
    if (this.data.length < FIB_CONSTANTS.MIN_SIZE) {
      throw new FIBParseError(`WordDocument stream too small: ${this.data.length} bytes`);
    }

    const wIdent = this.view.getUint16(0, true);
    if (wIdent !== FIB_CONSTANTS.SIGNATURE) {
      throw new FIBParseError(
        `Invalid FIB signature: 0x${wIdent.toString(16).toUpperCase()} (expected 0x${FIB_CONSTANTS.SIGNATURE.toString(16).toUpperCase()})`
      );
    }
  }

  /**
   * Parse FibBase (first 32 bytes)
   */
  private parseFibBase(): FibBase {
    const wIdent = this.view.getUint16(0, true);
    const nFib = this.view.getUint16(2, true);
    const lid = this.view.getUint16(6, true);
    const pnNext = this.view.getUint16(8, true);
    const flags = this.view.getUint16(10, true);
    const nFibBack = this.view.getUint16(12, true);

    // Bit 9 (0x0200) indicates which table stream to use
    const fWhichTblStm = (flags & FIB_CONSTANTS.TABLE_STREAM_BIT) !== 0;

    return {
      wIdent,
      nFib,
      lid,
      pnNext,
      flags,
      nFibBack,
      fWhichTblStm,
    };
  }

  /**
   * Parse FibRgW97 (14 uint16 values starting at offset 32)
   */
  private parseFibRgW97(): FibRgW97 {
    const offset = 32;
    return {
      reserved1: this.view.getUint16(offset, true),
      reserved2: this.view.getUint16(offset + 2, true),
      reserved3: this.view.getUint16(offset + 4, true),
      reserved4: this.view.getUint16(offset + 6, true),
      reserved5: this.view.getUint16(offset + 8, true),
      reserved6: this.view.getUint16(offset + 10, true),
      reserved7: this.view.getUint16(offset + 12, true),
      reserved8: this.view.getUint16(offset + 14, true),
      reserved9: this.view.getUint16(offset + 16, true),
      reserved10: this.view.getUint16(offset + 18, true),
      reserved11: this.view.getUint16(offset + 20, true),
      reserved12: this.view.getUint16(offset + 22, true),
      reserved13: this.view.getUint16(offset + 24, true),
      lidFE: this.view.getUint16(offset + 26, true),
    };
  }

  /**
   * Parse FibRgLw97 (22 uint32 values starting at offset 60)
   */
  private parseFibRgLw97(): FibRgLw97 {
    const offset = 60;
    return {
      cbMac: this.view.getUint32(offset, true),
      reserved1: this.view.getUint32(offset + 4, true),
      reserved2: this.view.getUint32(offset + 8, true),
      ccpText: this.view.getUint32(offset + 12, true),
      ccpFtn: this.view.getUint32(offset + 16, true),
      ccpHdd: this.view.getUint32(offset + 20, true),
      reserved3: this.view.getUint32(offset + 24, true),
      ccpAtn: this.view.getUint32(offset + 28, true),
      ccpEdn: this.view.getUint32(offset + 32, true),
      ccpTxbx: this.view.getUint32(offset + 36, true),
      ccpHdrTxbx: this.view.getUint32(offset + 40, true),
      reserved4: this.view.getUint32(offset + 44, true),
      reserved5: this.view.getUint32(offset + 48, true),
      reserved6: this.view.getUint32(offset + 52, true),
      reserved7: this.view.getUint32(offset + 56, true),
      reserved8: this.view.getUint32(offset + 60, true),
      reserved9: this.view.getUint32(offset + 64, true),
      reserved10: this.view.getUint32(offset + 68, true),
      reserved11: this.view.getUint32(offset + 72, true),
      reserved12: this.view.getUint32(offset + 76, true),
      reserved13: this.view.getUint32(offset + 80, true),
      reserved14: this.view.getUint32(offset + 84, true),
    };
  }

  /**
   * Parse FibRgFcLcb (variable size based on nFib version)
   */
  private parseFibRgFcLcb(nFib: number): FibRgFcLcb {
    // FibRgFcLcb starts at offset 154 (after FibBase + csw + FibRgW97 + cslw + FibRgLw97 + cbRgFcLcb)
    // Actually: 32 (FibBase) + 2 (csw) + 28 (FibRgW97) + 2 (cslw) + 88 (FibRgLw97) + 2 (cbRgFcLcb) = 154
    const baseOffset = 154;

    // Determine how many fc/lcb pairs based on version
    let numPairs: number;
    if (nFib >= FIB_VERSIONS.WORD_2007) {
      numPairs = 274; // Word 2007+
    } else if (nFib >= FIB_VERSIONS.WORD_2003) {
      numPairs = 164; // Word 2003
    } else if (nFib >= FIB_VERSIONS.WORD_2002) {
      numPairs = 136; // Word 2002
    } else if (nFib >= FIB_VERSIONS.WORD_2000) {
      numPairs = 108; // Word 2000
    } else {
      numPairs = 93; // Word 97
    }

    const result: FibRgFcLcb = {} as FibRgFcLcb;

    // Parse known fields
    for (const [name, fieldOffset] of FIB_FCRLCB_FIELDS) {
      if (fieldOffset + 4 <= numPairs * 8) {
        const absoluteOffset = baseOffset + fieldOffset;
        if (absoluteOffset + 4 <= this.data.length) {
          result[name] = this.view.getUint32(absoluteOffset, true);
        }
      }
    }

    return result;
  }

  /**
   * Get the Word version from nFib
   */
  static getWordVersion(nFib: number): string {
    if (nFib >= FIB_VERSIONS.WORD_2007) return 'Word 2007+';
    if (nFib >= FIB_VERSIONS.WORD_2003) return 'Word 2003';
    if (nFib >= FIB_VERSIONS.WORD_2002) return 'Word 2002';
    if (nFib >= FIB_VERSIONS.WORD_2000) return 'Word 2000';
    if (nFib >= FIB_VERSIONS.WORD_97) return 'Word 97';
    return 'Unknown';
  }

  /**
   * Static method to parse from WordDocument stream
   */
  static parse(wordDocumentStream: Uint8Array): FIB {
    const parser = new FIBParser(wordDocumentStream);
    return parser.parse();
  }
}
