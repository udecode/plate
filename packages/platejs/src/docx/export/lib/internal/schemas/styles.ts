import namespaces from '../namespaces';
import type { StyleRun } from '../word-styles';

export const HEADING_RUNS: ReadonlyMap<string, StyleRun> = new Map(
  (
    [
      ['1', 48],
      ['2', 36],
      ['3', 28],
      ['4', 24],
      ['5', undefined],
      ['6', 20],
    ] as const
  ).map(([level, fontSize]) => [level, { fontSize, strong: true }])
);

export const HYPERLINK_RUN: StyleRun = { color: '0000FF' };

const headingRunXml = (level: number) => {
  const fontSize = HEADING_RUNS.get(String(level))?.fontSize;

  return `<w:rPr><w:b />${
    fontSize ? `<w:sz w:val="${fontSize}" /><w:szCs w:val="${fontSize}" />` : ''
  }</w:rPr>`;
};

const generateStylesXML = (
  font: string,
  fontSize: number,
  complexScriptFontSize: number,
  lang: string,
  extraStyles = ''
): string => `
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

  <w:styles xmlns:w="${namespaces.w}" xmlns:r="${namespaces.r}">
	<w:docDefaults>
	  <w:rPrDefault>
		<w:rPr>
		  <w:rFonts w:ascii="${font}" w:eastAsiaTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi" />
		  <w:sz w:val="${fontSize}" />
		  <w:szCs w:val="${complexScriptFontSize}" />
		  <w:lang w:val="${lang}" w:eastAsia="${lang}" w:bidi="ar-SA" />
		</w:rPr>
	  </w:rPrDefault>
	  <w:pPrDefault>
		<w:pPr>
		  <w:spacing w:after="120" w:line="240" w:lineRule="atLeast" />
		</w:pPr>
	  </w:pPrDefault>
	</w:docDefaults>
	<w:style w:type="character" w:styleId="Hyperlink">
	  <w:name w:val="Hyperlink" />
	  <w:rPr>
		<w:color w:val="${HYPERLINK_RUN.color}" />
		<w:u w:val="single" />
	  </w:rPr>
	</w:style>
	<w:style w:type="paragraph" w:styleId="Heading1">
	  <w:name w:val="heading 1" />
	  <w:basedOn w:val="Normal" />
	  <w:next w:val="Normal" />
	  <w:uiPriority w:val="9" />
	  <w:qFormat />
	  <w:pPr>
		<w:keepNext />
		<w:keepLines />
		<w:spacing w:before="480" />
		<w:outlineLvl w:val="0" />
	  </w:pPr>
	  ${headingRunXml(1)}
	</w:style>
	<w:style w:type="paragraph" w:styleId="Heading2">
	  <w:name w:val="heading 2" />
	  <w:basedOn w:val="Normal" />
	  <w:next w:val="Normal" />
	  <w:uiPriority w:val="9" />
	  <w:unhideWhenUsed />
	  <w:qFormat />
	  <w:pPr>
		<w:keepNext />
		<w:keepLines />
		<w:spacing w:before="360" w:after="80" />
		<w:outlineLvl w:val="1" />
	  </w:pPr>
	  ${headingRunXml(2)}
	</w:style>
	<w:style w:type="paragraph" w:styleId="Heading3">
	  <w:name w:val="heading 3" />
	  <w:basedOn w:val="Normal" />
	  <w:next w:val="Normal" />
	  <w:uiPriority w:val="9" />
	  <w:semiHidden />
	  <w:unhideWhenUsed />
	  <w:qFormat />
	  <w:pPr>
		<w:keepNext />
		<w:keepLines />
		<w:spacing w:before="280" w:after="80" />
		<w:outlineLvl w:val="2" />
	  </w:pPr>
	  ${headingRunXml(3)}
	</w:style>
	<w:style w:type="paragraph" w:styleId="Heading4">
	  <w:name w:val="heading 4" />
	  <w:basedOn w:val="Normal" />
	  <w:next w:val="Normal" />
	  <w:uiPriority w:val="9" />
	  <w:semiHidden />
	  <w:unhideWhenUsed />
	  <w:qFormat />
	  <w:pPr>
		<w:keepNext />
		<w:keepLines />
		<w:spacing w:before="240" w:after="40" />
		<w:outlineLvl w:val="3" />
	  </w:pPr>
	  ${headingRunXml(4)}
	</w:style>
	<w:style w:type="paragraph" w:styleId="Heading5">
	  <w:name w:val="heading 5" />
	  <w:basedOn w:val="Normal" />
	  <w:next w:val="Normal" />
	  <w:uiPriority w:val="9" />
	  <w:semiHidden />
	  <w:unhideWhenUsed />
	  <w:qFormat />
	  <w:pPr>
		<w:keepNext />
		<w:keepLines />
		<w:spacing w:before="220" w:after="40" />
		<w:outlineLvl w:val="4" />
	  </w:pPr>
	  ${headingRunXml(5)}
	</w:style>
	<w:style w:type="paragraph" w:styleId="Heading6">
	  <w:name w:val="heading 6" />
	  <w:basedOn w:val="Normal" />
	  <w:next w:val="Normal" />
	  <w:uiPriority w:val="9" />
	  <w:semiHidden />
	  <w:unhideWhenUsed />
	  <w:qFormat />
	  <w:pPr>
		<w:keepNext />
		<w:keepLines />
		<w:spacing w:before="200" w:after="40" />
		<w:outlineLvl w:val="5" />
	  </w:pPr>
	  ${headingRunXml(6)}
	</w:style>
  ${extraStyles}
  </w:styles>
  `;

export default generateStylesXML;
