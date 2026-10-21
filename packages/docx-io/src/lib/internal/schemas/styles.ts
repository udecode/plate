import { defaultFont, defaultFontSize, defaultLang } from '../constants';
import namespaces from '../namespaces';
import type { Spacing } from '../types';

const defaultParagraphSpacing: Spacing = { after: 120 };

const defaultHeadingSpacing: Spacing[] = [
  { before: 480 },
  { after: 80, before: 360 },
  { after: 80, before: 280 },
  { after: 40, before: 240 },
  { after: 40, before: 220 },
  { after: 40, before: 200 },
];

const spacingAttributes = ({ after, before }: Spacing): string =>
  `${before === undefined ? '' : ` w:before="${before}"`}${
    after === undefined ? '' : ` w:after="${after}"`
  }`;

const headingSpacingXML = (level: number, spacing: Spacing): string =>
  `<w:spacing${spacingAttributes({
    ...defaultHeadingSpacing[level - 1],
    ...spacing,
  })} />`;

const generateStylesXML = (
  font: string = defaultFont,
  fontSize: number = defaultFontSize,
  complexScriptFontSize: number = defaultFontSize,
  lang: string = defaultLang,
  paragraphSpacing: Spacing = {},
  headingSpacing: Spacing = {}
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
		  <w:spacing${spacingAttributes({ ...defaultParagraphSpacing, ...paragraphSpacing })} w:line="240" w:lineRule="atLeast" />
		</w:pPr>
	  </w:pPrDefault>
	</w:docDefaults>
	<w:style w:type="character" w:styleId="Hyperlink">
	  <w:name w:val="Hyperlink" />
	  <w:rPr>
		<w:color w:val="0000FF" />
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
		${headingSpacingXML(1, headingSpacing)}
		<w:outlineLvl w:val="0" />
	  </w:pPr>
	  <w:rPr>
		<w:b />
		<w:sz w:val="48" />
		<w:szCs w:val="48" />
	  </w:rPr>
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
		${headingSpacingXML(2, headingSpacing)}
		<w:outlineLvl w:val="1" />
	  </w:pPr>
	  <w:rPr>
		<w:b />
		<w:sz w:val="36" />
		<w:szCs w:val="36" />
	  </w:rPr>
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
		${headingSpacingXML(3, headingSpacing)}
		<w:outlineLvl w:val="2" />
	  </w:pPr>
	  <w:rPr>
		<w:b />
		<w:sz w:val="28" />
		<w:szCs w:val="28" />
	  </w:rPr>
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
		${headingSpacingXML(4, headingSpacing)}
		<w:outlineLvl w:val="3" />
	  </w:pPr>
	  <w:rPr>
		<w:b />
		<w:sz w:val="24" />
		<w:szCs w:val="24" />
	  </w:rPr>
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
		${headingSpacingXML(5, headingSpacing)}
		<w:outlineLvl w:val="4" />
	  </w:pPr>
	  <w:rPr>
		<w:b />
	  </w:rPr>
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
		${headingSpacingXML(6, headingSpacing)}
		<w:outlineLvl w:val="5" />
	  </w:pPr>
	  <w:rPr>
		<w:b />
		<w:sz w:val="20" />
		<w:szCs w:val="20" />
	  </w:rPr>
	</w:style>
  </w:styles>
  `;

export default generateStylesXML;
