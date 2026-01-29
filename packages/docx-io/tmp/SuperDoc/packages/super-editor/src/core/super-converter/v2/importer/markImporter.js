import { SuperConverter } from '../../SuperConverter.js';
import { TrackFormatMarkName } from '@extensions/track-changes/constants.js';
import { getHexColorFromDocxSystem, isValidHexColor, twipsToInches, twipsToLines, twipsToPt } from '../../helpers.js';

/**
 *
 * @param property
 * @returns {PmMarkJson[]}
 */
export function parseMarks(property, unknownMarks = [], docx = null) {
  const marks = [];
  const seen = new Set();

  const lang = property?.elements?.find((el) => el.name === 'w:lang');

  // eslint-disable-next-line no-unused-vars
  const langAttrs = lang?.attributes || {};

  property?.elements?.forEach((element) => {
    const marksForType = SuperConverter.markTypes.filter((mark) => mark.name === element.name);
    if (!marksForType.length) {
      const missingMarks = [
        'w:shd',
        'w:rStyle',
        'w:pStyle',
        'w:numPr',
        'w:outlineLvl',
        'w:bdr',
        'w:pBdr',
        'w:noProof',
        'w:contextualSpacing',
        'w:keepNext',
        'w:tabs',
        'w:keepLines',
      ];
      if (missingMarks.includes(element.name)) {
        unknownMarks.push(element.name);
      }
    }

    let filteredMarksForType = marksForType;

    /**
     * Now that we have 2 marks named 'spacing' we need to determine if its
     * for line height or letter spacing.
     *
     * If the spacing has a w:val attribute, it's for letter spacing.
     * If the spacing has a w:line, w:lineRule, w:before, w:after attribute, it's for line height.
     */
    if (element.name === 'w:spacing') {
      const attrs = element.attributes || {};
      const hasLetterSpacing = attrs['w:val'];
      filteredMarksForType = marksForType.filter((m) => {
        if (hasLetterSpacing) {
          return m.type === 'letterSpacing';
        }
        return m.type === 'lineHeight';
      });
    }

    filteredMarksForType.forEach((m) => {
      if (!m || seen.has(m.type)) return;
      seen.add(m.type);

      const { attributes = {} } = element;
      const newMark = { type: m.type };

      const exceptionMarks = ['w:b', 'w:caps'];
      if ((attributes['w:val'] === '0' || attributes['w:val'] === 'none') && !exceptionMarks.includes(m.name)) {
        return;
      }

      // Use the parent mark (ie: textStyle) if present
      if (m.mark) newMark.type = m.mark;

      // Special handling of "w:caps".
      if (m.name === 'w:caps') {
        newMark.attrs = {};
        if (attributes['w:val'] === '0') {
          newMark.attrs[m.property] = 'none';
        } else {
          newMark.attrs[m.property] = 'uppercase';
        }
        marks.push(newMark);
        return;
      }

      // Marks with attrs: we need to get their values
      if (Object.keys(attributes).length) {
        const value = getMarkValue(m.type, attributes, docx);

        // If there is no value for mark it can't be applied
        if (value === null || value === undefined) return;

        newMark.attrs = {};
        newMark.attrs[m.property] = value;
      }

      marks.push(newMark);
    });
  });
  return createImportMarks(marks);
}

/**
 *
 * @param {XmlNode} rPr
 * @param {PmMarkJson[]} currentMarks
 * @returns {PmMarkJson[]} a trackMarksMark, or an empty array
 */
export function handleStyleChangeMarks(rPr, currentMarks) {
  const styleChangeMark = rPr.elements?.find((el) => el.name === 'w:rPrChange');
  if (!styleChangeMark) {
    return [];
  }

  const { attributes } = styleChangeMark;
  const mappedAttributes = {
    id: attributes['w:id'],
    date: attributes['w:date'],
    author: attributes['w:author'],
    authorEmail: attributes['w:authorEmail'],
  };
  const submarks = parseMarks(styleChangeMark);
  return [{ type: TrackFormatMarkName, attrs: { ...mappedAttributes, before: submarks, after: [...currentMarks] } }];
}

/**
 *
 * @param {PmMarkJson[]} marks
 * @returns {PmMarkJson[]}
 */
export function createImportMarks(marks) {
  const textStyleMarksToCombine = marks.filter((mark) => mark.type === 'textStyle');
  const remainingMarks = marks.filter((mark) => mark.type !== 'textStyle');

  // Combine text style marks
  const combinedTextAttrs = {};
  if (textStyleMarksToCombine.length) {
    textStyleMarksToCombine.forEach((mark) => {
      const { attrs = {} } = mark;

      Object.keys(attrs).forEach((attr) => {
        combinedTextAttrs[attr] = attrs[attr];
      });
    });
  }

  const result = [...remainingMarks, { type: 'textStyle', attrs: combinedTextAttrs }];
  return result;
}

/**
 *
 * @param {string} markType
 * @param attributes
 * @returns {*}
 */
function getMarkValue(markType, attributes, docx) {
  if (markType === 'tabs') markType = 'textIndent';

  const markValueMapper = {
    color: () => `#${attributes['w:val']}`,
    fontSize: () => `${attributes['w:val'] / 2}pt`,
    textIndent: () => getIndentValue(attributes),
    fontFamily: () => getFontFamilyValue(attributes, docx),
    lineHeight: () => getLineHeightValue(attributes),
    letterSpacing: () => `${twipsToPt(attributes['w:val'])}pt`,
    textAlign: () => attributes['w:val'],
    link: () => attributes['href'],
    underline: () => attributes['w:val'],
    bold: () => attributes?.['w:val'] || null,
    italic: () => attributes?.['w:val'] || null,
    highlight: () => getHighLightValue(attributes),
    strike: () => getStrikeValue(attributes),
  };

  if (!(markType in markValueMapper)) {
    // console.debug('❗️❗️ No value mapper for:', markType, 'Attributes:', attributes);
  }

  // Returned the mapped mark value
  if (markType in markValueMapper) {
    return markValueMapper[markType]();
  }
}

function getFontFamilyValue(attributes, docx) {
  const ascii = attributes['w:ascii'];
  const themeAscii = attributes['w:asciiTheme'];

  if (!docx || !themeAscii) return ascii;
  const theme = docx['word/theme/theme1.xml'];
  if (!theme) return ascii;

  const { elements: topElements } = theme;
  const { elements } = topElements[0];
  const themeElements = elements.find((el) => el.name === 'a:themeElements');
  const fontScheme = themeElements.elements.find((el) => el.name === 'a:fontScheme');
  const majorFont = fontScheme.elements.find((el) => el.name === 'a:majorFont');

  const latin = majorFont.elements.find((el) => el.name === 'a:latin');
  const typeface = latin.attributes['typeface'];
  return typeface;
}

function getIndentValue(attributes) {
  let value = attributes['w:left'];
  if (!value) return null;
  return `${twipsToInches(value)}in`;
}

function getLineHeightValue(attributes) {
  const value = attributes['w:line'];
  const lineRule = attributes['w:lineRule'];

  // TODO: Figure out handling of additional line height attributes from docx
  // if (!value) value = attributes['w:lineRule'];
  // if (!value) value = attributes['w:after'];
  // if (!value) value = attributes['w:before'];
  if (!value || value === '0') return null;

  if (lineRule === 'exact') return `${twipsToPt(value)}pt`;
  return `${twipsToLines(value)}`;
}

function getHighLightValue(attributes) {
  const fill = attributes['w:fill'];
  if (fill && fill !== 'auto') return `#${fill}`;
  if (isValidHexColor(attributes?.['w:val'])) return `#${attributes['w:val']}`;
  return getHexColorFromDocxSystem(attributes?.['w:val']) || null;
}

function getStrikeValue(attributes) {
  return attributes?.['w:val'] === '1' ? attributes['w:val'] : null;
}
