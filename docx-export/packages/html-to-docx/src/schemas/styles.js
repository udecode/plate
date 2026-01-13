import { defaultFont, defaultFontSize, defaultLang } from '../constants';
import namespaces from '../namespaces';

const generateStylesXML = (
  font = defaultFont,
  fontSize = defaultFontSize,
  complexScriptFontSize = defaultFontSize,
  lang = defaultLang
) => `
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
		<w:spacing w:before="480" />
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
		<w:spacing w:before="360" w:after="80" />
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
		<w:spacing w:before="280" w:after="80" />
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
		<w:spacing w:before="240" w:after="40" />
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
		<w:spacing w:before="220" w:after="40" />
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
		<w:spacing w:before="200" w:after="40" />
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
