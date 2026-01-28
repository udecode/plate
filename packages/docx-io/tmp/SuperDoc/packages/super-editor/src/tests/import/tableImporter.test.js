import { parseXmlToJson } from '@converter/v2/docxHelper.js';
import { handleTrackChangeNode } from '@converter/v2/importer/trackChangesImporter.js';
import { defaultNodeListHandler } from '@converter/v2/importer/docxImporter.js';
import { TrackInsertMarkName } from '@extensions/track-changes/constants.js';
import { handleAllTableNodes } from '@converter/v2/importer/tableImporter.js';
import { getTestDataByFileName } from '@tests/helpers/helpers.js';

describe('table live xml test', () => {
  const simpleTableStyleXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16du="http://schemas.microsoft.com/office/word/2023/wordml/word16du" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16du"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:asciiTheme="minorHAnsi" w:eastAsiaTheme="minorHAnsi" w:hAnsiTheme="minorHAnsi" w:cstheme="minorBidi"/><w:kern w:val="2"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US" w:eastAsia="en-US" w:bidi="ar-SA"/><w14:ligatures w14:val="standardContextual"/></w:rPr></w:rPrDefault><w:pPrDefault/></w:docDefaults><w:latentStyles w:defLockedState="0" w:defUIPriority="99" w:defSemiHidden="0" w:defUnhideWhenUsed="0" w:defQFormat="0" w:count="376"><w:lsdException w:name="Normal" w:uiPriority="0" w:qFormat="1"/><w:lsdException w:name="heading 1" w:uiPriority="9" w:qFormat="1"/><w:lsdException w:name="heading 2" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="heading 3" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="heading 4" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="heading 5" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="heading 6" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="heading 7" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="heading 8" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="heading 9" w:semiHidden="1" w:uiPriority="9" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="index 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 6" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 7" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 8" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index 9" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 1" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 2" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 3" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 4" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 5" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 6" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 7" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 8" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="toc 9" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1"/><w:lsdException w:name="Normal Indent" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="footnote text" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="annotation text" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="header" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="footer" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="index heading" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="caption" w:semiHidden="1" w:uiPriority="35" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="table of figures" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="envelope address" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="envelope return" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="footnote reference" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="annotation reference" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="line number" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="page number" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="endnote reference" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="endnote text" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="table of authorities" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="macro" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="toa heading" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Bullet" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Number" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Bullet 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Bullet 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Bullet 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Bullet 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Number 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Number 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Number 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Number 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Title" w:uiPriority="10" w:qFormat="1"/><w:lsdException w:name="Closing" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Signature" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Default Paragraph Font" w:semiHidden="1" w:uiPriority="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text Indent" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Continue" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Continue 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Continue 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Continue 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="List Continue 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Message Header" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Subtitle" w:uiPriority="11" w:qFormat="1"/><w:lsdException w:name="Salutation" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Date" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text First Indent" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text First Indent 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Note Heading" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text Indent 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Body Text Indent 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Block Text" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Hyperlink" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="FollowedHyperlink" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Strong" w:uiPriority="22" w:qFormat="1"/><w:lsdException w:name="Emphasis" w:uiPriority="20" w:qFormat="1"/><w:lsdException w:name="Document Map" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Plain Text" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="E-mail Signature" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Top of Form" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Bottom of Form" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Normal (Web)" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Acronym" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Address" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Cite" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Code" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Definition" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Keyboard" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Preformatted" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Sample" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Typewriter" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="HTML Variable" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Normal Table" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="annotation subject" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="No List" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Outline List 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Outline List 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Outline List 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Simple 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Simple 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Simple 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Classic 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Classic 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Classic 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Classic 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Colorful 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Colorful 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Colorful 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Columns 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Columns 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Columns 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Columns 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Columns 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 6" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 7" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid 8" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 4" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 5" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 6" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 7" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table List 8" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table 3D effects 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table 3D effects 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table 3D effects 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Contemporary" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Elegant" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Professional" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Subtle 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Subtle 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Web 1" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Web 2" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Web 3" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Balloon Text" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Table Grid" w:uiPriority="39"/><w:lsdException w:name="Table Theme" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Placeholder Text" w:semiHidden="1"/><w:lsdException w:name="No Spacing" w:uiPriority="1" w:qFormat="1"/><w:lsdException w:name="Light Shading" w:uiPriority="60"/><w:lsdException w:name="Light List" w:uiPriority="61"/><w:lsdException w:name="Light Grid" w:uiPriority="62"/><w:lsdException w:name="Medium Shading 1" w:uiPriority="63"/><w:lsdException w:name="Medium Shading 2" w:uiPriority="64"/><w:lsdException w:name="Medium List 1" w:uiPriority="65"/><w:lsdException w:name="Medium List 2" w:uiPriority="66"/><w:lsdException w:name="Medium Grid 1" w:uiPriority="67"/><w:lsdException w:name="Medium Grid 2" w:uiPriority="68"/><w:lsdException w:name="Medium Grid 3" w:uiPriority="69"/><w:lsdException w:name="Dark List" w:uiPriority="70"/><w:lsdException w:name="Colorful Shading" w:uiPriority="71"/><w:lsdException w:name="Colorful List" w:uiPriority="72"/><w:lsdException w:name="Colorful Grid" w:uiPriority="73"/><w:lsdException w:name="Light Shading Accent 1" w:uiPriority="60"/><w:lsdException w:name="Light List Accent 1" w:uiPriority="61"/><w:lsdException w:name="Light Grid Accent 1" w:uiPriority="62"/><w:lsdException w:name="Medium Shading 1 Accent 1" w:uiPriority="63"/><w:lsdException w:name="Medium Shading 2 Accent 1" w:uiPriority="64"/><w:lsdException w:name="Medium List 1 Accent 1" w:uiPriority="65"/><w:lsdException w:name="Revision" w:semiHidden="1"/><w:lsdException w:name="List Paragraph" w:uiPriority="34" w:qFormat="1"/><w:lsdException w:name="Quote" w:uiPriority="29" w:qFormat="1"/><w:lsdException w:name="Intense Quote" w:uiPriority="30" w:qFormat="1"/><w:lsdException w:name="Medium List 2 Accent 1" w:uiPriority="66"/><w:lsdException w:name="Medium Grid 1 Accent 1" w:uiPriority="67"/><w:lsdException w:name="Medium Grid 2 Accent 1" w:uiPriority="68"/><w:lsdException w:name="Medium Grid 3 Accent 1" w:uiPriority="69"/><w:lsdException w:name="Dark List Accent 1" w:uiPriority="70"/><w:lsdException w:name="Colorful Shading Accent 1" w:uiPriority="71"/><w:lsdException w:name="Colorful List Accent 1" w:uiPriority="72"/><w:lsdException w:name="Colorful Grid Accent 1" w:uiPriority="73"/><w:lsdException w:name="Light Shading Accent 2" w:uiPriority="60"/><w:lsdException w:name="Light List Accent 2" w:uiPriority="61"/><w:lsdException w:name="Light Grid Accent 2" w:uiPriority="62"/><w:lsdException w:name="Medium Shading 1 Accent 2" w:uiPriority="63"/><w:lsdException w:name="Medium Shading 2 Accent 2" w:uiPriority="64"/><w:lsdException w:name="Medium List 1 Accent 2" w:uiPriority="65"/><w:lsdException w:name="Medium List 2 Accent 2" w:uiPriority="66"/><w:lsdException w:name="Medium Grid 1 Accent 2" w:uiPriority="67"/><w:lsdException w:name="Medium Grid 2 Accent 2" w:uiPriority="68"/><w:lsdException w:name="Medium Grid 3 Accent 2" w:uiPriority="69"/><w:lsdException w:name="Dark List Accent 2" w:uiPriority="70"/><w:lsdException w:name="Colorful Shading Accent 2" w:uiPriority="71"/><w:lsdException w:name="Colorful List Accent 2" w:uiPriority="72"/><w:lsdException w:name="Colorful Grid Accent 2" w:uiPriority="73"/><w:lsdException w:name="Light Shading Accent 3" w:uiPriority="60"/><w:lsdException w:name="Light List Accent 3" w:uiPriority="61"/><w:lsdException w:name="Light Grid Accent 3" w:uiPriority="62"/><w:lsdException w:name="Medium Shading 1 Accent 3" w:uiPriority="63"/><w:lsdException w:name="Medium Shading 2 Accent 3" w:uiPriority="64"/><w:lsdException w:name="Medium List 1 Accent 3" w:uiPriority="65"/><w:lsdException w:name="Medium List 2 Accent 3" w:uiPriority="66"/><w:lsdException w:name="Medium Grid 1 Accent 3" w:uiPriority="67"/><w:lsdException w:name="Medium Grid 2 Accent 3" w:uiPriority="68"/><w:lsdException w:name="Medium Grid 3 Accent 3" w:uiPriority="69"/><w:lsdException w:name="Dark List Accent 3" w:uiPriority="70"/><w:lsdException w:name="Colorful Shading Accent 3" w:uiPriority="71"/><w:lsdException w:name="Colorful List Accent 3" w:uiPriority="72"/><w:lsdException w:name="Colorful Grid Accent 3" w:uiPriority="73"/><w:lsdException w:name="Light Shading Accent 4" w:uiPriority="60"/><w:lsdException w:name="Light List Accent 4" w:uiPriority="61"/><w:lsdException w:name="Light Grid Accent 4" w:uiPriority="62"/><w:lsdException w:name="Medium Shading 1 Accent 4" w:uiPriority="63"/><w:lsdException w:name="Medium Shading 2 Accent 4" w:uiPriority="64"/><w:lsdException w:name="Medium List 1 Accent 4" w:uiPriority="65"/><w:lsdException w:name="Medium List 2 Accent 4" w:uiPriority="66"/><w:lsdException w:name="Medium Grid 1 Accent 4" w:uiPriority="67"/><w:lsdException w:name="Medium Grid 2 Accent 4" w:uiPriority="68"/><w:lsdException w:name="Medium Grid 3 Accent 4" w:uiPriority="69"/><w:lsdException w:name="Dark List Accent 4" w:uiPriority="70"/><w:lsdException w:name="Colorful Shading Accent 4" w:uiPriority="71"/><w:lsdException w:name="Colorful List Accent 4" w:uiPriority="72"/><w:lsdException w:name="Colorful Grid Accent 4" w:uiPriority="73"/><w:lsdException w:name="Light Shading Accent 5" w:uiPriority="60"/><w:lsdException w:name="Light List Accent 5" w:uiPriority="61"/><w:lsdException w:name="Light Grid Accent 5" w:uiPriority="62"/><w:lsdException w:name="Medium Shading 1 Accent 5" w:uiPriority="63"/><w:lsdException w:name="Medium Shading 2 Accent 5" w:uiPriority="64"/><w:lsdException w:name="Medium List 1 Accent 5" w:uiPriority="65"/><w:lsdException w:name="Medium List 2 Accent 5" w:uiPriority="66"/><w:lsdException w:name="Medium Grid 1 Accent 5" w:uiPriority="67"/><w:lsdException w:name="Medium Grid 2 Accent 5" w:uiPriority="68"/><w:lsdException w:name="Medium Grid 3 Accent 5" w:uiPriority="69"/><w:lsdException w:name="Dark List Accent 5" w:uiPriority="70"/><w:lsdException w:name="Colorful Shading Accent 5" w:uiPriority="71"/><w:lsdException w:name="Colorful List Accent 5" w:uiPriority="72"/><w:lsdException w:name="Colorful Grid Accent 5" w:uiPriority="73"/><w:lsdException w:name="Light Shading Accent 6" w:uiPriority="60"/><w:lsdException w:name="Light List Accent 6" w:uiPriority="61"/><w:lsdException w:name="Light Grid Accent 6" w:uiPriority="62"/><w:lsdException w:name="Medium Shading 1 Accent 6" w:uiPriority="63"/><w:lsdException w:name="Medium Shading 2 Accent 6" w:uiPriority="64"/><w:lsdException w:name="Medium List 1 Accent 6" w:uiPriority="65"/><w:lsdException w:name="Medium List 2 Accent 6" w:uiPriority="66"/><w:lsdException w:name="Medium Grid 1 Accent 6" w:uiPriority="67"/><w:lsdException w:name="Medium Grid 2 Accent 6" w:uiPriority="68"/><w:lsdException w:name="Medium Grid 3 Accent 6" w:uiPriority="69"/><w:lsdException w:name="Dark List Accent 6" w:uiPriority="70"/><w:lsdException w:name="Colorful Shading Accent 6" w:uiPriority="71"/><w:lsdException w:name="Colorful List Accent 6" w:uiPriority="72"/><w:lsdException w:name="Colorful Grid Accent 6" w:uiPriority="73"/><w:lsdException w:name="Subtle Emphasis" w:uiPriority="19" w:qFormat="1"/><w:lsdException w:name="Intense Emphasis" w:uiPriority="21" w:qFormat="1"/><w:lsdException w:name="Subtle Reference" w:uiPriority="31" w:qFormat="1"/><w:lsdException w:name="Intense Reference" w:uiPriority="32" w:qFormat="1"/><w:lsdException w:name="Book Title" w:uiPriority="33" w:qFormat="1"/><w:lsdException w:name="Bibliography" w:semiHidden="1" w:uiPriority="37" w:unhideWhenUsed="1"/><w:lsdException w:name="TOC Heading" w:semiHidden="1" w:uiPriority="39" w:unhideWhenUsed="1" w:qFormat="1"/><w:lsdException w:name="Plain Table 1" w:uiPriority="41"/><w:lsdException w:name="Plain Table 2" w:uiPriority="42"/><w:lsdException w:name="Plain Table 3" w:uiPriority="43"/><w:lsdException w:name="Plain Table 4" w:uiPriority="44"/><w:lsdException w:name="Plain Table 5" w:uiPriority="45"/><w:lsdException w:name="Grid Table Light" w:uiPriority="40"/><w:lsdException w:name="Grid Table 1 Light" w:uiPriority="46"/><w:lsdException w:name="Grid Table 2" w:uiPriority="47"/><w:lsdException w:name="Grid Table 3" w:uiPriority="48"/><w:lsdException w:name="Grid Table 4" w:uiPriority="49"/><w:lsdException w:name="Grid Table 5 Dark" w:uiPriority="50"/><w:lsdException w:name="Grid Table 6 Colorful" w:uiPriority="51"/><w:lsdException w:name="Grid Table 7 Colorful" w:uiPriority="52"/><w:lsdException w:name="Grid Table 1 Light Accent 1" w:uiPriority="46"/><w:lsdException w:name="Grid Table 2 Accent 1" w:uiPriority="47"/><w:lsdException w:name="Grid Table 3 Accent 1" w:uiPriority="48"/><w:lsdException w:name="Grid Table 4 Accent 1" w:uiPriority="49"/><w:lsdException w:name="Grid Table 5 Dark Accent 1" w:uiPriority="50"/><w:lsdException w:name="Grid Table 6 Colorful Accent 1" w:uiPriority="51"/><w:lsdException w:name="Grid Table 7 Colorful Accent 1" w:uiPriority="52"/><w:lsdException w:name="Grid Table 1 Light Accent 2" w:uiPriority="46"/><w:lsdException w:name="Grid Table 2 Accent 2" w:uiPriority="47"/><w:lsdException w:name="Grid Table 3 Accent 2" w:uiPriority="48"/><w:lsdException w:name="Grid Table 4 Accent 2" w:uiPriority="49"/><w:lsdException w:name="Grid Table 5 Dark Accent 2" w:uiPriority="50"/><w:lsdException w:name="Grid Table 6 Colorful Accent 2" w:uiPriority="51"/><w:lsdException w:name="Grid Table 7 Colorful Accent 2" w:uiPriority="52"/><w:lsdException w:name="Grid Table 1 Light Accent 3" w:uiPriority="46"/><w:lsdException w:name="Grid Table 2 Accent 3" w:uiPriority="47"/><w:lsdException w:name="Grid Table 3 Accent 3" w:uiPriority="48"/><w:lsdException w:name="Grid Table 4 Accent 3" w:uiPriority="49"/><w:lsdException w:name="Grid Table 5 Dark Accent 3" w:uiPriority="50"/><w:lsdException w:name="Grid Table 6 Colorful Accent 3" w:uiPriority="51"/><w:lsdException w:name="Grid Table 7 Colorful Accent 3" w:uiPriority="52"/><w:lsdException w:name="Grid Table 1 Light Accent 4" w:uiPriority="46"/><w:lsdException w:name="Grid Table 2 Accent 4" w:uiPriority="47"/><w:lsdException w:name="Grid Table 3 Accent 4" w:uiPriority="48"/><w:lsdException w:name="Grid Table 4 Accent 4" w:uiPriority="49"/><w:lsdException w:name="Grid Table 5 Dark Accent 4" w:uiPriority="50"/><w:lsdException w:name="Grid Table 6 Colorful Accent 4" w:uiPriority="51"/><w:lsdException w:name="Grid Table 7 Colorful Accent 4" w:uiPriority="52"/><w:lsdException w:name="Grid Table 1 Light Accent 5" w:uiPriority="46"/><w:lsdException w:name="Grid Table 2 Accent 5" w:uiPriority="47"/><w:lsdException w:name="Grid Table 3 Accent 5" w:uiPriority="48"/><w:lsdException w:name="Grid Table 4 Accent 5" w:uiPriority="49"/><w:lsdException w:name="Grid Table 5 Dark Accent 5" w:uiPriority="50"/><w:lsdException w:name="Grid Table 6 Colorful Accent 5" w:uiPriority="51"/><w:lsdException w:name="Grid Table 7 Colorful Accent 5" w:uiPriority="52"/><w:lsdException w:name="Grid Table 1 Light Accent 6" w:uiPriority="46"/><w:lsdException w:name="Grid Table 2 Accent 6" w:uiPriority="47"/><w:lsdException w:name="Grid Table 3 Accent 6" w:uiPriority="48"/><w:lsdException w:name="Grid Table 4 Accent 6" w:uiPriority="49"/><w:lsdException w:name="Grid Table 5 Dark Accent 6" w:uiPriority="50"/><w:lsdException w:name="Grid Table 6 Colorful Accent 6" w:uiPriority="51"/><w:lsdException w:name="Grid Table 7 Colorful Accent 6" w:uiPriority="52"/><w:lsdException w:name="List Table 1 Light" w:uiPriority="46"/><w:lsdException w:name="List Table 2" w:uiPriority="47"/><w:lsdException w:name="List Table 3" w:uiPriority="48"/><w:lsdException w:name="List Table 4" w:uiPriority="49"/><w:lsdException w:name="List Table 5 Dark" w:uiPriority="50"/><w:lsdException w:name="List Table 6 Colorful" w:uiPriority="51"/><w:lsdException w:name="List Table 7 Colorful" w:uiPriority="52"/><w:lsdException w:name="List Table 1 Light Accent 1" w:uiPriority="46"/><w:lsdException w:name="List Table 2 Accent 1" w:uiPriority="47"/><w:lsdException w:name="List Table 3 Accent 1" w:uiPriority="48"/><w:lsdException w:name="List Table 4 Accent 1" w:uiPriority="49"/><w:lsdException w:name="List Table 5 Dark Accent 1" w:uiPriority="50"/><w:lsdException w:name="List Table 6 Colorful Accent 1" w:uiPriority="51"/><w:lsdException w:name="List Table 7 Colorful Accent 1" w:uiPriority="52"/><w:lsdException w:name="List Table 1 Light Accent 2" w:uiPriority="46"/><w:lsdException w:name="List Table 2 Accent 2" w:uiPriority="47"/><w:lsdException w:name="List Table 3 Accent 2" w:uiPriority="48"/><w:lsdException w:name="List Table 4 Accent 2" w:uiPriority="49"/><w:lsdException w:name="List Table 5 Dark Accent 2" w:uiPriority="50"/><w:lsdException w:name="List Table 6 Colorful Accent 2" w:uiPriority="51"/><w:lsdException w:name="List Table 7 Colorful Accent 2" w:uiPriority="52"/><w:lsdException w:name="List Table 1 Light Accent 3" w:uiPriority="46"/><w:lsdException w:name="List Table 2 Accent 3" w:uiPriority="47"/><w:lsdException w:name="List Table 3 Accent 3" w:uiPriority="48"/><w:lsdException w:name="List Table 4 Accent 3" w:uiPriority="49"/><w:lsdException w:name="List Table 5 Dark Accent 3" w:uiPriority="50"/><w:lsdException w:name="List Table 6 Colorful Accent 3" w:uiPriority="51"/><w:lsdException w:name="List Table 7 Colorful Accent 3" w:uiPriority="52"/><w:lsdException w:name="List Table 1 Light Accent 4" w:uiPriority="46"/><w:lsdException w:name="List Table 2 Accent 4" w:uiPriority="47"/><w:lsdException w:name="List Table 3 Accent 4" w:uiPriority="48"/><w:lsdException w:name="List Table 4 Accent 4" w:uiPriority="49"/><w:lsdException w:name="List Table 5 Dark Accent 4" w:uiPriority="50"/><w:lsdException w:name="List Table 6 Colorful Accent 4" w:uiPriority="51"/><w:lsdException w:name="List Table 7 Colorful Accent 4" w:uiPriority="52"/><w:lsdException w:name="List Table 1 Light Accent 5" w:uiPriority="46"/><w:lsdException w:name="List Table 2 Accent 5" w:uiPriority="47"/><w:lsdException w:name="List Table 3 Accent 5" w:uiPriority="48"/><w:lsdException w:name="List Table 4 Accent 5" w:uiPriority="49"/><w:lsdException w:name="List Table 5 Dark Accent 5" w:uiPriority="50"/><w:lsdException w:name="List Table 6 Colorful Accent 5" w:uiPriority="51"/><w:lsdException w:name="List Table 7 Colorful Accent 5" w:uiPriority="52"/><w:lsdException w:name="List Table 1 Light Accent 6" w:uiPriority="46"/><w:lsdException w:name="List Table 2 Accent 6" w:uiPriority="47"/><w:lsdException w:name="List Table 3 Accent 6" w:uiPriority="48"/><w:lsdException w:name="List Table 4 Accent 6" w:uiPriority="49"/><w:lsdException w:name="List Table 5 Dark Accent 6" w:uiPriority="50"/><w:lsdException w:name="List Table 6 Colorful Accent 6" w:uiPriority="51"/><w:lsdException w:name="List Table 7 Colorful Accent 6" w:uiPriority="52"/><w:lsdException w:name="Mention" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Smart Hyperlink" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Hashtag" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Unresolved Mention" w:semiHidden="1" w:unhideWhenUsed="1"/><w:lsdException w:name="Smart Link" w:semiHidden="1" w:unhideWhenUsed="1"/></w:latentStyles><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading1Char"/><w:uiPriority w:val="9"/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="360" w:after="80"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading2Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="160" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading3Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="160" w:after="80"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading4"><w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading4Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="80" w:after="40"/><w:outlineLvl w:val="3"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:i/><w:iCs/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading5"><w:name w:val="heading 5"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading5Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="80" w:after="40"/><w:outlineLvl w:val="4"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading6"><w:name w:val="heading 6"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading6Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="40"/><w:outlineLvl w:val="5"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:i/><w:iCs/><w:color w:val="595959" w:themeColor="text1" w:themeTint="A6"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading7"><w:name w:val="heading 7"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading7Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="40"/><w:outlineLvl w:val="6"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="595959" w:themeColor="text1" w:themeTint="A6"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading8"><w:name w:val="heading 8"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading8Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="7"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:i/><w:iCs/><w:color w:val="272727" w:themeColor="text1" w:themeTint="D8"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading9"><w:name w:val="heading 9"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="Heading9Char"/><w:uiPriority w:val="9"/><w:semiHidden/><w:unhideWhenUsed/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:keepNext/><w:keepLines/><w:outlineLvl w:val="8"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="272727" w:themeColor="text1" w:themeTint="D8"/></w:rPr></w:style><w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/><w:unhideWhenUsed/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style><w:style w:type="numbering" w:default="1" w:styleId="NoList"><w:name w:val="No List"/><w:uiPriority w:val="99"/><w:semiHidden/><w:unhideWhenUsed/></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading1Char"><w:name w:val="Heading 1 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading1"/><w:uiPriority w:val="9"/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading2Char"><w:name w:val="Heading 2 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading2"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading3Char"><w:name w:val="Heading 3 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading3"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading4Char"><w:name w:val="Heading 4 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading4"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:i/><w:iCs/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading5Char"><w:name w:val="Heading 5 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading5"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading6Char"><w:name w:val="Heading 6 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading6"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:i/><w:iCs/><w:color w:val="595959" w:themeColor="text1" w:themeTint="A6"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading7Char"><w:name w:val="Heading 7 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading7"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="595959" w:themeColor="text1" w:themeTint="A6"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading8Char"><w:name w:val="Heading 8 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading8"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:i/><w:iCs/><w:color w:val="272727" w:themeColor="text1" w:themeTint="D8"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="Heading9Char"><w:name w:val="Heading 9 Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Heading9"/><w:uiPriority w:val="9"/><w:semiHidden/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="272727" w:themeColor="text1" w:themeTint="D8"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="TitleChar"/><w:uiPriority w:val="10"/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:spacing w:after="80"/><w:contextualSpacing/></w:pPr><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/><w:spacing w:val="-10"/><w:kern w:val="28"/><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="TitleChar"><w:name w:val="Title Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Title"/><w:uiPriority w:val="10"/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:asciiTheme="majorHAnsi" w:eastAsiaTheme="majorEastAsia" w:hAnsiTheme="majorHAnsi" w:cstheme="majorBidi"/><w:spacing w:val="-10"/><w:kern w:val="28"/><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="SubtitleChar"/><w:uiPriority w:val="11"/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:numPr><w:ilvl w:val="1"/></w:numPr><w:spacing w:after="160"/></w:pPr><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="595959" w:themeColor="text1" w:themeTint="A6"/><w:spacing w:val="15"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="SubtitleChar"><w:name w:val="Subtitle Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Subtitle"/><w:uiPriority w:val="11"/><w:rsid w:val="00833D48"/><w:rPr><w:rFonts w:eastAsiaTheme="majorEastAsia" w:cstheme="majorBidi"/><w:color w:val="595959" w:themeColor="text1" w:themeTint="A6"/><w:spacing w:val="15"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="QuoteChar"/><w:uiPriority w:val="29"/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:spacing w:before="160" w:after="160"/><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:iCs/><w:color w:val="404040" w:themeColor="text1" w:themeTint="BF"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="QuoteChar"><w:name w:val="Quote Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="Quote"/><w:uiPriority w:val="29"/><w:rsid w:val="00833D48"/><w:rPr><w:i/><w:iCs/><w:color w:val="404040" w:themeColor="text1" w:themeTint="BF"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:uiPriority w:val="34"/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:ind w:left="720"/><w:contextualSpacing/></w:pPr></w:style><w:style w:type="character" w:styleId="IntenseEmphasis"><w:name w:val="Intense Emphasis"/><w:basedOn w:val="DefaultParagraphFont"/><w:uiPriority w:val="21"/><w:qFormat/><w:rsid w:val="00833D48"/><w:rPr><w:i/><w:iCs/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="IntenseQuote"><w:name w:val="Intense Quote"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:link w:val="IntenseQuoteChar"/><w:uiPriority w:val="30"/><w:qFormat/><w:rsid w:val="00833D48"/><w:pPr><w:pBdr><w:top w:val="single" w:sz="4" w:space="10" w:color="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:bottom w:val="single" w:sz="4" w:space="10" w:color="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:pBdr><w:spacing w:before="360" w:after="360"/><w:ind w:left="864" w:right="864"/><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:iCs/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:rPr></w:style><w:style w:type="character" w:customStyle="1" w:styleId="IntenseQuoteChar"><w:name w:val="Intense Quote Char"/><w:basedOn w:val="DefaultParagraphFont"/><w:link w:val="IntenseQuote"/><w:uiPriority w:val="30"/><w:rsid w:val="00833D48"/><w:rPr><w:i/><w:iCs/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/></w:rPr></w:style><w:style w:type="character" w:styleId="IntenseReference"><w:name w:val="Intense Reference"/><w:basedOn w:val="DefaultParagraphFont"/><w:uiPriority w:val="32"/><w:qFormat/><w:rsid w:val="00833D48"/><w:rPr><w:b/><w:bCs/><w:smallCaps/><w:color w:val="0F4761" w:themeColor="accent1" w:themeShade="BF"/><w:spacing w:val="5"/></w:rPr></w:style><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:uiPriority w:val="39"/><w:rsid w:val="00833D48"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr></w:style></w:styles>`;
  const simpleTableXml = `<w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid" />
        <w:tblW w:w="0" w:type="auto" />
        <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0"
          w:noHBand="0" w:noVBand="1" />
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4675" />
        <w:gridCol w:w="4675" />
      </w:tblGrid>
      <w:tr w:rsidR="00833D48" w14:paraId="0A54184A" w14:textId="77777777" w:rsidTr="00833D48">
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
          </w:tcPr>
          <w:p w14:paraId="1159FC76" w14:textId="3D07C504" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 1 ROW 1</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
          </w:tcPr>
          <w:p w14:paraId="4436EDF8" w14:textId="5B1976D8" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 2 ROW 1</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr w:rsidR="00833D48" w14:paraId="00EE17B3" w14:textId="77777777" w:rsidTr="00833D48">
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
          </w:tcPr>
          <w:p w14:paraId="57349683" w14:textId="20493167" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 1 ROW 2</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
          </w:tcPr>
          <w:p w14:paraId="177F124F" w14:textId="7105C366" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 2 ROW 2</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>`;

  const nilBordersTableXml = `<w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid" />
        <w:tblW w:w="0" w:type="auto" />
        <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0"
          w:noHBand="0" w:noVBand="1" />
      </w:tblPr>
      <w:tblGrid>
        <w:gridCol w:w="4675" />
        <w:gridCol w:w="4675" />
      </w:tblGrid>
      <w:tr w:rsidR="00833D48" w14:paraId="0A54184A" w14:textId="77777777" w:rsidTr="00833D48">
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
            <w:tcBorders>
              <w:right w:val="nil"/>
            </w:tcBorders>
          </w:tcPr>
          <w:p w14:paraId="1159FC76" w14:textId="3D07C504" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 1 ROW 1</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
             <w:tcBorders>
              <w:bottom w:val="nil"/>
            </w:tcBorders>
          </w:tcPr>
          <w:p w14:paraId="4436EDF8" w14:textId="5B1976D8" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 2 ROW 1</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
      <w:tr w:rsidR="00833D48" w14:paraId="00EE17B3" w14:textId="77777777" w:rsidTr="00833D48">
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
          </w:tcPr>
          <w:p w14:paraId="57349683" w14:textId="20493167" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 1 ROW 2</w:t>
            </w:r>
          </w:p>
        </w:tc>
        <w:tc>
          <w:tcPr>
            <w:tcW w:w="4675" w:type="dxa" />
          </w:tcPr>
          <w:p w14:paraId="177F124F" w14:textId="7105C366" w:rsidR="00833D48"
            w:rsidRDefault="00833D48">
            <w:r>
              <w:t>COL 2 ROW 2</w:t>
            </w:r>
          </w:p>
        </w:tc>
      </w:tr>
    </w:tbl>`;

  const tableCellsNoInlineWidth = `
  <w:tbl>
	<w:tblPr>
		<w:tblStyle w:val="a"/>
		<w:tblW w:w="10076" w:type="dxa"/>
		<w:tblInd w:w="0" w:type="dxa"/>
		<w:tblBorders>
			<w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
			<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
			<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
			<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
		</w:tblBorders>
		<w:tblLayout w:type="fixed"/>
		<w:tblLook w:val="0400" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
	</w:tblPr>
	<w:tblGrid>
		<w:gridCol w:w="5842"/>
		<w:gridCol w:w="387"/>
		<w:gridCol w:w="3847"/>
	</w:tblGrid>
	<w:tr w:rsidR="009F4290" w14:paraId="4139DE7B" w14:textId="77777777">
		<w:tc>
			<w:tcPr>
				<w:gridSpan w:val="2"/>
				<w:tcBorders>
					<w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="61AF2643" w14:textId="3E765FEA" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
		<w:tc>
			<w:tcPr>
				<w:tcBorders>
					<w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="35816CDB" w14:textId="12AAD33C" w:rsidR="009F4290" w:rsidRDefault="00C06379">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
				<w:r>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
					<w:t xml:space="preserve"></w:t>
				</w:r>
			</w:p>
		</w:tc>
	</w:tr>
	<w:tr w:rsidR="009F4290" w14:paraId="51AF2876" w14:textId="77777777">
		<w:tc>
			<w:tcPr>
				<w:gridSpan w:val="2"/>
				<w:tcBorders>
					<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="6418F51D" w14:textId="285228B6" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
		<w:tc>
			<w:tcPr>
				<w:tcBorders>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="2C8050F9" w14:textId="72F095AC" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
	</w:tr>
	<w:tr w:rsidR="009F4290" w14:paraId="4BB0FC91" w14:textId="77777777">
		<w:tc>
			<w:tcPr>
				<w:gridSpan w:val="3"/>
				<w:tcBorders>
					<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="47B02610" w14:textId="7921FF75" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:jc w:val="both"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
	</w:tr>
	<w:tr w:rsidR="009F4290" w14:paraId="47FA89A2" w14:textId="77777777">
		<w:tc>
			<w:tcPr>
				<w:tcBorders>
					<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="5FD62ED3" w14:textId="4731FD03" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
		<w:tc>
			<w:tcPr>
				<w:gridSpan w:val="2"/>
				<w:tcBorders>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="36CF40ED" w14:textId="63C43494" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
	</w:tr>
	<w:tr w:rsidR="009F4290" w14:paraId="787CEA56" w14:textId="77777777">
		<w:tc>
			<w:tcPr>
				<w:gridSpan w:val="3"/>
				<w:tcBorders>
					<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="29BAA5F1" w14:textId="7C7C4A0E" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:jc w:val="both"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
	</w:tr>
	<w:tr w:rsidR="009F4290" w14:paraId="56580AE6" w14:textId="77777777">
		<w:tc>
			<w:tcPr>
				<w:gridSpan w:val="3"/>
				<w:tcBorders>
					<w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
					<w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
				</w:tcBorders>
				<w:shd w:val="clear" w:color="auto" w:fill="FFFFFF"/>
				<w:tcMar>
					<w:top w:w="0" w:type="dxa"/>
					<w:left w:w="210" w:type="dxa"/>
					<w:bottom w:w="0" w:type="dxa"/>
					<w:right w:w="210" w:type="dxa"/>
				</w:tcMar>
			</w:tcPr>
			<w:p w14:paraId="313B988C" w14:textId="5E5EF8D1" w:rsidR="009F4290" w:rsidRDefault="009F4290">
				<w:pPr>
					<w:spacing w:before="120" w:after="120" w:line="240" w:lineRule="auto"/>
					<w:jc w:val="both"/>
					<w:rPr>
						<w:rFonts w:ascii="Arial" w:eastAsia="Arial" w:hAnsi="Arial" w:cs="Arial"/>
						<w:sz w:val="20"/>
						<w:szCs w:val="20"/>
					</w:rPr>
				</w:pPr>
			</w:p>
		</w:tc>
	</w:tr>
  </w:tbl>`;

  it('parses simple xml', () => {
    const nodes = parseXmlToJson(simpleTableXml).elements;
    const styles = parseXmlToJson(simpleTableStyleXml);
    const docx = {
      'word/styles.xml': styles,
    };

    const result = handleAllTableNodes({ nodes, docx, nodeListHandler: defaultNodeListHandler() });
    expect(result.nodes.length).toBe(1);

    expect(result.nodes[0].type).toBe('table');
    expect(result.nodes[0].content.length).toBe(2);
    expect(result.nodes[0].attrs).toEqual({
      tableWidth: {
        type: 'auto',
        width: 0,
      },
      tableStyleId: 'TableGrid',
      borders: {
        top: { size: 0.66665 },
        left: { size: 0.66665 },
        bottom: { size: 0.66665 },
        right: { size: 0.66665 },
        insideH: { size: 0.66665 },
        insideV: { size: 0.66665 },
      },
    });

    expect(result.nodes[0].content[0].type).toBe('tableRow');
    expect(result.nodes[0].content[0].content.length).toBe(2);
    expect(result.nodes[0].content[0].content[0].content[0].type).toBe('paragraph');

    expect(result.nodes[0].content[0].content[0].content[0].content[0].type).toBe('text');
    expect(result.nodes[0].content[0].content[0].content[0].content[0].text).toBe('COL 1 ROW 1');
    expect(result.nodes[0].content[0].content[1].content[0].type).toBe('paragraph');
    expect(result.nodes[0].content[0].content[1].content[0].content[0].type).toBe('text');
    expect(result.nodes[0].content[0].content[1].content[0].content[0].text).toBe('COL 2 ROW 1');
    expect(result.nodes[0].content[0].attrs.borders).toBeDefined();

    expect(result.nodes[0].content[1].type).toBe('tableRow');
    expect(result.nodes[0].content[1].content.length).toBe(2);
    expect(result.nodes[0].content[1].content[0].content[0].type).toBe('paragraph');
    expect(result.nodes[0].content[1].content[0].content[0].content[0].type).toBe('text');
    expect(result.nodes[0].content[1].content[0].content[0].content[0].text).toBe('COL 1 ROW 2');
    expect(result.nodes[0].content[1].content[1].content[0].type).toBe('paragraph');
    expect(result.nodes[0].content[1].content[1].content[0].content[0].type).toBe('text');
    expect(result.nodes[0].content[1].content[1].content[0].content[0].text).toBe('COL 2 ROW 2');
    expect(result.nodes[0].content[1].attrs.borders).toBeDefined();
  });

  it('gets styles from base tab and parse internal borders', () => {
    const nodes = parseXmlToJson(nilBordersTableXml).elements;
    const styles = parseXmlToJson(simpleTableStyleXml);
    const docx = {
      'word/styles.xml': styles,
    };
    const result = handleAllTableNodes({ nodes, docx, nodeListHandler: defaultNodeListHandler() });
    expect(result.nodes[0].content[0].content[0].attrs.borders).toBeDefined();
    expect(result.nodes[0].content[0].content[1].attrs.borders).toBeDefined();
    expect(result.nodes[0].content[0].content[0].attrs.borders.right.val).toBe('none');
    expect(result.nodes[0].content[0].content[1].attrs.borders.bottom.val).toBe('none');
    expect(result.nodes[0].content[0].content[0].attrs.cellMargins).toBeDefined();
    expect(result.nodes[0].content[0].content[0].attrs.cellMargins.left).toBe(8);
    expect(result.nodes[0].content[0].content[0].attrs.cellMargins.right).toBe(8);
  });

  it('correctly gets colwidth for cells without inline width', () => {
    const nodes = parseXmlToJson(tableCellsNoInlineWidth).elements;
    const styles = parseXmlToJson(simpleTableStyleXml);
    const docx = { 'word/styles.xml': styles };
    const result = handleAllTableNodes({ nodes, docx, nodeListHandler: defaultNodeListHandler() });

    expect(result.nodes[0].content[0].content[0].attrs.colwidth).toEqual([390, 26]);
    expect(result.nodes[0].content[0].content[1].attrs.colwidth).toEqual([256]);
    expect(result.nodes[0].content[1].content[0].attrs.colwidth).toEqual([390, 26]);
    expect(result.nodes[0].content[1].content[1].attrs.colwidth).toEqual([256]);
    expect(result.nodes[0].content[2].content[0].attrs.colwidth).toEqual([390, 26, 256]);
  });
});

describe('table tests to check colwidth', () => {
  it('correctly gets colwidth for horizontally merged cells', async () => {
    const dataName = 'table-merged-cells.docx';
    const docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];

    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    const content = body.elements;

    const result = handleAllTableNodes({ nodes: [content[0]], docx, nodeListHandler: defaultNodeListHandler() });
    const node = result.nodes[0];

    expect(node.type).toBe('table');

    const tr1 = node.content[0];
    const tr2 = node.content[1];
    const tr3 = node.content[2];

    expect(tr1.content[0].attrs.colspan).toBe(2);
    expect(tr1.content[0].attrs.colwidth).toEqual([94, 331]);
    expect(tr1.content[1].attrs.colwidth).toEqual([176]);

    expect(tr2.content[0].attrs.colwidth).toEqual([94]);
    expect(tr2.content[1].attrs.colwidth).toEqual([331]);
    expect(tr2.content[2].attrs.colwidth).toEqual([176]);

    expect(tr3.content[0].attrs.colspan).toBe(3);
    expect(tr3.content[0].attrs.colwidth).toEqual([94, 331, 176]);
  });
});
