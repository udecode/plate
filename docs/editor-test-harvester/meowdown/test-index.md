# Meowdown test-name index

target: `../meowdown`
source*commit: `5b9962982a1cb3d1732355c753ce76d9a5966af3`
generated: 2026-08-21
extraction: `rg --pcre2 -n --no-heading '(?<![A-Za-z0-9*$])(?:describe|it|test)(?:\\.(?:skip|only|todo|each|skipIf|runIf))_\\s_\\('`
runnable_files: 118
indexed_files: 117
raw_matches: 2137

## `../meowdown/packages/core/src/converters/check-roundtrip-fuzz.test.ts`

- L127: `it(`

## `../meowdown/packages/core/src/converters/check-roundtrip-spec.test.ts`

- L6: `it.each(commonmark.map((example, index) => ({ number: index + 1, markdown: example.markdown })))(`

## `../meowdown/packages/core/src/converters/check-roundtrip.bench.ts`

- L33: `describe('checkRoundTrip', () => {`

## `../meowdown/packages/core/src/converters/check-roundtrip.test.ts`

- L285: `describe('checkRoundTrip', () => {`
- L286: `it.each(EXACT_CASES)('reports exact for %j', (markdown) => {`
- L290: `it.each(NORMALIZING_CASES)('reports normalizing for %j', (markdown) => {`
- L294: `it.each(LOSSY_CASES)('reports lossy for %j', (markdown) => {`

## `../meowdown/packages/core/src/converters/html-to-md.test.ts`

- L10: `describe('htmlToMarkdown', () => {`
- L11: `it('converts strong and em to meowdown dialect', () => {`
- L17: `it('converts a bullet list with a dash marker', () => {`
- L21: `it('converts an ordered list', () => {`
- L25: `it('converts links, inline code, and strikethrough', () => {`
- L31: `it('converts a mark element to ==highlight==', () => {`
- L36: `it('keeps a line-leading mark unescaped', () => {`
- L42: `it('keeps nested formatting inside a mark', () => {`
- L49: `it('converts a heading and a blockquote', () => {`
- L55: `it('converts a GFM table', () => {`
- L61: `it('converts a GFM task list', () => {`
- L67: `it('does not promote a parent of a nested task item', () => {`
- L72: `it('converts a tiptap-style task list', () => {`
- L83: `it('converts a remirror-style task list', () => {`
- L90: `it('does not escape characters that are inert in meowdown', () => {`
- L101: `it('lets a literal ~~pair~~ become strikethrough', () => {`
- L105: `it('still escapes a line-leading tilde run', () => {`
- L111: `it('still escapes brackets inside a link label', () => {`
- L116: `it('still escapes syntax that meowdown would render', () => {`
- L144: `describe('toMeowdownUnsafe', () => {`
- L145: `it('narrows the stock escaping rules', () => {`

## `../meowdown/packages/core/src/converters/md-to-pm.test.ts`

- L39: `describe('markdownToDoc', () => {`
- L40: `it('materializes empty paragraphs from a blank-line run', () => {`
- L53: `it('skips leading and trailing blank lines', () => {`
- L61: `it('keeps a heading', () => {`
- L75: `it('keeps a paragraph', () => {`
- L88: `it('keeps a blockquote', () => {`
- L106: `it('keeps a bullet list', () => {`
- L145: `it('marks a \`+\` bullet collapsed and clears the marker', () => {`
- L157: `it('keeps \`-\` and \`\*\` bullets expanded', () => {`
- L162: `it('keeps \`+ [ ]\` as an expanded circle task', () => {`
- L170: `it('keeps each ordered item number', () => {`
- L209: `it('keeps a task item', () => {`
- L231: `it('keeps a checked task', () => {`
- L253: `it('keeps different markers for tasks', () => {`
- L289: `it('keeps mixed task and plain items', () => {`
- L301: `it('keeps a literal task marker in an ordered item', () => {`
- L325: `it('keeps a fenced block with language', () => {`
- L346: `it('keeps a multiple-line fenced block nested in a list item', () => {`
- L385: `it('keeps a horizontal rule', () => {`
- L393: `it('wraps each table cell text in a single paragraph', () => {`
- L408: `it('keeps a table with a header', () => {`
- L477: `it('parses column alignment from the delimiter row', () => {`
- L489: `it('parses alignment regardless of delimiter width', () => {`
- L501: `it('keeps empty table cells', () => {`
- L521: `it('keeps cells in their columns', () => {`
- L541: `it('unescapes an escaped pipe in a cell', () => {`
- L559: `it('keeps a short row padded', () => {`
- L579: `it('keeps the sample document', () => {`
- L583: `it('keeps an asterisk bullet', () => {`
- L605: `it('keeps a paren ordered delimiter', () => {`
- L627: `it('keeps a zero start', () => {`
- L649: `it('keeps an uppercase task marker', () => {`
- L671: `it('keeps an indented code block', () => {`
- L685: `it('keeps a dollar math block', () => {`
- L699: `it('keeps a math fence as a plain code block', () => {`
- L713: `it('keeps an unclosed dollar math block', () => {`
- L727: `it('keeps a tilde fence', () => {`
- L741: `it('keeps a four-character fence length', () => {`
- L755: `it('keeps a spaceless hash as text', () => {`
- L763: `it('keeps seven hashes as text', () => {`
- L771: `it('keeps an empty heading', () => {`
- L781: `it('keeps a nested quote', () => {`
- L800: `it('keeps setext text', () => {`
- L814: `it('keeps setext text (level 2)', () => {`
- L828: `it('keeps a raw HTML block', () => {`
- L836: `it('keeps a processing instruction', () => {`
- L844: `it('maps an HTML comment onto an invisible htmlComment node', () => {`
- L852: `it('keeps a multi-line HTML comment verbatim on the node', () => {`
- L860: `it('separates a comment from adjacent paragraph text', () => {`
- L874: `it('keeps a two-line quote clean', () => {`
- L887: `it('keeps a list item soft break as a dedented single text node', () => {`
- L912: `it('keeps YAML frontmatter as a doc attribute', () => {`
- L922: `it('keeps a multi-line frontmatter body literal before content', () => {`
- L937: `it('keeps an empty frontmatter block as an empty string', () => {`
- L945: `it('keeps a lone dashes line as a thematic break, not frontmatter', () => {`
- L953: `it('leaves a frontmatter block as content when frontmatter is off (default)', () => {`
- L958: `describe('measureContentColumn', () => {`
- L959: `it('is 0 at the document start', () => {`
- L963: `it('is 0 at the start of a line', () => {`
- L967: `it('counts the characters before the position', () => {`
- L971: `it('measures only the current line', () => {`
- L975: `it('counts a tab from column 0 as 4', () => {`
- L979: `it('counts a tab to the next multiple of 4', () => {`
- L985: `it('accumulates multiple tabs', () => {`
- L990: `describe('sliceColumn', () => {`
- L991: `it('drops leading spaces up to the column', () => {`
- L995: `it('leaves a line that stops short of the column', () => {`
- L999: `it('keeps whitespace beyond the column', () => {`
- L1003: `it('advances a tab to the next multiple of 4', () => {`
- L1010: `it('stops once a tab reaches the column', () => {`
- L1014: `it('leaves a tab that would reach past the column', () => {`
- L1018: `it('returns the line unchanged at column 0', () => {`
- L1023: `describe('dedentContinuation', () => {`
- L1024: `it('returns single-line content unchanged', () => {`
- L1028: `it('returns content unchanged at column 0', () => {`
- L1032: `it('keeps the first line and dedents the rest', () => {`
- L1036: `it('strips the full column from each continuation line', () => {`

## `../meowdown/packages/core/src/converters/pm-to-md.bench.ts`

- L25: `describe('docToMarkdown', () => {`

## `../meowdown/packages/core/src/converters/pm-to-md.test.ts`

- L13: `describe('docToMarkdown', () => {`
- L14: `it('keeps a paragraph', () => {`
- L20: `it('keeps an empty paragraph between paragraphs', () => {`
- L25: `it('drops a leading empty paragraph', () => {`
- L30: `it('drops a trailing empty paragraph', () => {`
- L35: `it('keeps a level-1 heading', () => {`
- L41: `it('keeps a level-3 heading', () => {`
- L47: `it('keeps a level-6 heading', () => {`
- L53: `it('emits a setext level-1 heading', () => {`
- L58: `it('emits a setext level-2 heading', () => {`
- L63: `it('keeps the setext underline length', () => {`
- L70: `it('emits a setext heading deeper than level 2 as ATX', () => {`
- L75: `it('emits an empty setext heading as ATX', () => {`
- L80: `it('keeps a blockquote', () => {`
- L86: `it('keeps a tight bullet list', () => {`
- L95: `it('keeps an ordered start number', () => {`
- L104: `it('writes a collapsed bullet with \`+\`', () => {`
- L115: `it('writes an expanded bullet with \`-\` or \`\*\`', () => {`
- L124: `it('keeps \`+\` as the circle task shape regardless of collapsed', () => {`
- L131: `it('keeps task markers', () => {`
- L156: `it('keeps a loose two-block item', () => {`
- L165: `it('keeps a blank line after a list', () => {`
- L171: `it('keeps an empty bullet between paragraphs', () => {`
- L181: `it('keeps an empty bullet marker', () => {`
- L187: `it('keeps an empty task marker', () => {`
- L195: `it('keeps an empty ordered marker', () => {`
- L201: `it('keeps a fenced block with language', () => {`
- L207: `it('keeps code containing triple-backticks', () => {`
- L213: `it('emits a tilde fence from \`fenceStyle\`', () => {`
- L218: `it('grows a tilde fence around tilde content', () => {`
- L223: `it('keeps a recorded fence length', () => {`
- L228: `it('grows a fence beyond the recorded length when the content demands it', () => {`
- L233: `it('emits an indented code block from \`fenceStyle\`', () => {`
- L238: `it('emits a dollar fence from \`fenceStyle\`', () => {`
- L243: `it('emits an empty dollar fence', () => {`
- L248: `it('falls back to a fence for a dollar block whose language changed', () => {`
- L253: `it('falls back to a math fence when the content contains a $$ line', () => {`
- L258: `it('falls back to a fence for an indented block with a language', () => {`
- L263: `it('falls back to a fence for an empty indented block', () => {`
- L268: `it('falls back to a fence when an indented block starts with a blank line', () => {`
- L273: `it('keeps a horizontal rule', () => {`
- L279: `it('keeps a table', () => {`
- L290: `it('emits column alignment from the header row', () => {`
- L309: `it('emits column alignment from the first row of a headerless table', () => {`
- L322: `it('keeps a nested bullet', () => {`
- L330: `it('keeps a deeply nested bullet', () => {`
- L342: `it('keeps an ordered list in a bullet', () => {`
- L354: `it('keeps a code block in a loose item', () => {`
- L362: `it('keeps a rule between paragraphs', () => {`
- L368: `it('keeps the sample document (doc → md → doc)', () => {`
- L374: `it('keeps the sample markdown stable (md → doc → md → doc)', () => {`
- L380: `it('keeps a list in a quote clean', () => {`
- L386: `it('keeps an empty code block clean', () => {`
- L392: `it('keeps a frontmatter-only document', () => {`
- L398: `it('keeps frontmatter before content', () => {`
- L404: `it('keeps an empty frontmatter block', () => {`
- L410: `it('ignores the frontmatter attribute by default', () => {`

## `../meowdown/packages/core/src/converters/roundtrip.test.ts`

- L15: `describe('text', () => {`
- L16: `it('keeps soft breaks', () => {`
- L20: `it('keeps a blank line between paragraphs', () => {`
- L25: `it('keeps a tab', () => {`
- L29: `it('keeps accented characters', () => {`
- L33: `it('keeps emoji', () => {`
- L37: `it('keeps CJK text', () => {`
- L41: `it('keeps multiple spaces', () => {`
- L45: `it('keeps a literal backslash', () => {`
- L49: `it('keeps angle brackets and ampersands', () => {`
- L53: `it('keeps trailing spaces', () => {`
- L58: `describe('inline', () => {`
- L59: `it('keeps bold markers', () => {`
- L63: `it('keeps italic markers', () => {`
- L67: `it('keeps strikethrough markers', () => {`
- L71: `it('keeps highlight markers', () => {`
- L75: `it('keeps a highlight inside a list item', () => {`
- L79: `it('keeps inline math', () => {`
- L83: `it('keeps double-dollar inline math', () => {`
- L87: `it('keeps currency dollars', () => {`
- L91: `it('keeps inline code', () => {`
- L95: `it('keeps a link', () => {`
- L99: `it('keeps an image', () => {`
- L103: `it('keeps an image width comment', () => {`
- L109: `it.each(['![[image.png]]', '![[image.png|320]]', '![[image.png|320x180]]', '![[Note|Alias]]'])(`
- L116: `it('keeps an angle autolink', () => {`
- L120: `it('keeps an aliased wikilink', () => {`
- L124: `it('keeps a hashtag', () => {`
- L128: `it('keeps escaped emphasis', () => {`
- L132: `it('keeps a tag in text', () => {`
- L136: `it('keeps a tag at line start', () => {`
- L140: `it('keeps a wikilink', () => {`
- L144: `it('keeps a wikilink at line start', () => {`
- L148: `it('keeps a spaced wikilink and a tag', () => {`
- L152: `it('keeps an inline URL', () => {`
- L156: `it('keeps a www host', () => {`
- L160: `it('keeps an email', () => {`
- L164: `it('keeps a URL before a period', () => {`
- L168: `it('keeps a bare domain', () => {`
- L172: `it('keeps a domain with a path', () => {`
- L176: `it('keeps a non-link filename', () => {`
- L180: `it('keeps two inline images', () => {`
- L186: `it('keeps a youtube embed image', () => {`
- L192: `it('keeps a twitter embed image', () => {`
- L198: `it('keeps an inline embed image', () => {`
- L204: `it('keeps a raw HTML block', () => {`
- L208: `it('keeps an HTML comment', () => {`
- L212: `it('keeps a multi-line HTML comment', () => {`
- L216: `it('keeps sentinel comments around body text', () => {`
- L224: `it('keeps a processing instruction', () => {`
- L228: `it('keeps a link reference definition', () => {`
- L232: `it('keeps nested multiline link reference indentation', () => {`
- L238: `describe('headings', () => {`
- L239: `it('keeps a level-6 heading', () => {`
- L243: `it('keeps seven hashes as text', () => {`
- L247: `it('keeps a spaceless hash as text', () => {`
- L251: `it('keeps a lone hash', () => {`
- L255: `it('keeps emphasis in a heading', () => {`
- L259: `it('keeps a trailing closing hash', () => {`
- L263: `it('keeps a multi-hash closing sequence', () => {`
- L267: `it('keeps text that ends with a hash', () => {`
- L272: `it('normalizes extra space after the hash', () => {`
- L276: `it('drops an empty heading trailing space', () => {`
- L280: `it('keeps setext text (level 1)', () => {`
- L284: `it('keeps setext text (level 2)', () => {`
- L288: `it('keeps setext roundtrip stable', () => {`
- L293: `it('keeps the setext underline length', () => {`
- L300: `it('keeps multi-line setext content', () => {`
- L305: `describe('blockquotes', () => {`
- L306: `it('keeps a simple quote', () => {`
- L310: `it('keeps an inner blank line', () => {`
- L314: `it('keeps an inner blank-line run', () => {`
- L318: `it('keeps an empty quote marker', () => {`
- L322: `it('keeps a heading in a quote', () => {`
- L326: `it('keeps a quote between paragraphs', () => {`
- L331: `it('keeps a tag in a quote', () => {`
- L335: `it('keeps a wikilink in a quote', () => {`
- L343: `it('keeps a two-line quote', () => {`
- L351: `it('keeps a nested list in a quote', () => {`
- L355: `it('keeps a two-item list in a quote', () => {`
- L360: `describe('bullet lists', () => {`
- L361: `it('keeps a single bullet', () => {`
- L365: `it('keeps a tight list', () => {`
- L369: `it('keeps a nested bullet', () => {`
- L373: `it('keeps an immediately nested bullet', () => {`
- L377: `it('keeps a loose two-block item', () => {`
- L382: `it('keeps a soft break inside an item', () => {`
- L386: `it('keeps a soft break in a second paragraph', () => {`
- L391: `it('keeps a soft break in a nested item', () => {`
- L404: `it('keeps a bare empty bullet', () => {`
- L408: `it('keeps an empty middle item', () => {`
- L412: `it('keeps an asterisk bullet', () => {`
- L416: `it('keeps a plus bullet', () => {`
- L420: `it('keeps a double space after the marker', () => {`
- L424: `it('keeps a 4-space marker gap', () => {`
- L428: `it('keeps a marker gap before a second paragraph', () => {`
- L433: `it('treats a 5-space gap as indented code, not a 1-space bullet', () => {`
- L459: `describe('list folding', () => {`
- L460: `it('keeps a collapsed bullet as \`+\`', () => {`
- L464: `it('keeps \`-\` and \`\*\` bullets', () => {`
- L469: `it('keeps a \`+ [ ]\` circle task', () => {`
- L474: `describe('ordered lists', () => {`
- L475: `it('keeps an ordered item', () => {`
- L479: `it('keeps a two-digit start', () => {`
- L483: `it('keeps a zero start', () => {`
- L487: `it('keeps a nested ordered list', () => {`
- L491: `it('keeps repeated 1. numbering', () => {`
- L495: `it('keeps sequential numbers', () => {`
- L499: `it('keeps a paren ordered list marker', () => {`
- L503: `it('keeps empty item numbers', () => {`
- L507: `it('keeps a marker gap', () => {`
- L512: `describe('task lists', () => {`
- L513: `it('keeps an unchecked task', () => {`
- L517: `it('keeps a checked task', () => {`
- L521: `it('keeps a task list', () => {`
- L527: `it('keeps mixed task and plain items', () => {`
- L533: `it('keeps double-spaced task text', () => {`
- L537: `it('keeps triple-spaced task text', () => {`
- L541: `it('keeps a gap before the checkbox', () => {`
- L545: `it('keeps an empty task marker', () => {`
- L549: `it('keeps a task marker in an ordered item', () => {`
- L553: `it('keeps a nested task', () => {`
- L557: `it('keeps a soft break in a task', () => {`
- L561: `it('keeps a soft break in a quoted task', () => {`
- L565: `it('keeps a comment opener in a task', () => {`
- L577: `it('keeps a tag in a task', () => {`
- L581: `it('keeps a wikilink in a task', () => {`
- L585: `it('keeps an uppercase marker', () => {`
- L589: `it('keeps a trailing space after the marker', () => {`
- L593: `it('keeps an unchecked circle task', () => {`
- L597: `it('keeps a checked circle task', () => {`
- L601: `it('keeps an uppercase checked circle task', () => {`
- L605: `it('keeps mixed circle tasks and square checkboxes', () => {`
- L611: `it('keeps a star-marked checkbox square', () => {`
- L615: `it('keeps a nested circle task under a square checkbox', () => {`
- L620: `describe('code blocks', () => {`
- L621: `it('keeps a fenced block with language', () => {`
- L625: `it('keeps a Mermaid fence', () => {`
- L630: `it('keeps multi-line fenced code', () => {`
- L634: `it('keeps indentation in a fence', () => {`
- L638: `it('keeps an empty fence', () => {`
- L642: `it('keeps a tilde fence', () => {`
- L646: `it('keeps a tilde fence with a language', () => {`
- L650: `it('keeps a five-character tilde fence', () => {`
- L654: `it('keeps a four-character backtick fence', () => {`
- L658: `it('keeps a four-character fence around a nested fence', () => {`
- L663: `it('normalizes a longer closing fence to the opening length', () => {`
- L667: `it('keeps a dollar math block', () => {`
- L671: `it('keeps a multi-line dollar math block', () => {`
- L675: `it('keeps an empty dollar math block', () => {`
- L679: `it('keeps a dollar math block containing single dollars', () => {`
- L683: `it('keeps an unclosed dollar math block to the end of input', () => {`
- L687: `it('keeps a dollar math block inside a blockquote', () => {`
- L691: `it('keeps a dollar math block starting a list item', () => {`
- L695: `it('keeps a dollar math block interrupting a paragraph, normalizing the separator', () => {`
- L701: `it('keeps a math fence', () => {`
- L705: `it('keeps an indented code block', () => {`
- L709: `it('keeps a multi-line indented code block', () => {`
- L713: `it('keeps a blank line inside an indented code block', () => {`
- L717: `it('keeps extra indentation inside an indented code block', () => {`
- L721: `it('keeps an indented code block inside a blockquote', () => {`
- L725: `it('keeps an indented code block starting a list item', () => {`
- L729: `it('keeps an indented code block after a paragraph', () => {`
- L734: `describe('thematic breaks', () => {`
- L735: `it('keeps a dash rule', () => {`
- L739: `it('keeps a rule between paragraphs', () => {`
- L744: `it('keeps an asterisk rule', () => {`
- L748: `it('keeps an underscore rule', () => {`
- L752: `it('keeps a spaced rule', () => {`
- L757: `describe('tables', () => {`
- L758: `it('keeps a single-column table', () => {`
- L762: `it('keeps a two-column table', () => {`
- L768: `it('keeps an all-empty table', () => {`
- L774: `it('keeps a partially-empty table', () => {`
- L780: `it('keeps a missing cell', () => {`
- L786: `it('keeps column alignment', () => {`
- L792: `it('keeps center alignment', () => {`
- L798: `it('normalizes delimiter width to three characters', () => {`
- L804: `it('keeps an escaped pipe', () => {`
- L810: `it('keeps inline markup in a cell', () => {`
- L817: `describe('soft breaks', () => {`
- L822: `it('reads a continuation line that opens a block back as that block', () => {`
- L833: `it('reads a blank soft line back as a block break', () => {`
- L841: `it('drops a break with nothing after it', () => {`
- L847: `describe('escapes and whitespace', () => {`
- L848: `it('keeps an escaped hash', () => {`
- L852: `it('keeps an escaped dash', () => {`
- L856: `it('keeps an escaped ordered marker', () => {`
- L860: `it('keeps empty input as one newline', () => {`
- L868: `it('keeps internal blank-line runs', () => {`
- L873: `it('keeps typed empty paragraphs', () => {`
- L885: `it('keeps YAML frontmatter', () => {`
- L889: `it('keeps YAML frontmatter before content', () => {`
- L894: `it('normalizes a missing blank line after frontmatter', () => {`
- L900: `it('renders a frontmatter block as content when frontmatter is off (default)', () => {`
- L905: `describe('mixed structures', () => {`
- L906: `it('keeps a paragraph-list-paragraph sequence', () => {`
- L911: `it('keeps a blank-line run after a list', () => {`
- L916: `it('keeps a heading-paragraph-list sequence', () => {`
- L921: `it('keeps a quote then a code block', () => {`
- L926: `it('keeps a code block in a list item', () => {`
- L931: `it('keeps every line of a multi-line code block in a list item', () => {`
- L938: `it('keeps a table then a list', () => {`
- L947: `it('keeps ordered numbers before a paragraph', () => {`
- L953: `describe('idempotency', () => {`
- L954: `it('keeps a paragraph stable', () => {`
- L959: `it('keeps a tight list stable', () => {`
- L964: `it('keeps a marker-gap bullet stable', () => {`
- L969: `it('keeps a blank-line run stable', () => {`
- L974: `it('keeps a normalized leading blank line stable', () => {`
- L979: `it('keeps a soft-wrapped item stable', () => {`
- L984: `it('keeps a fenced block stable', () => {`
- L989: `it('keeps a table stable', () => {`
- L994: `it('keeps a collapsed loose list stable', () => {`
- L999: `it('keeps a normalized asterisk bullet stable', () => {`
- L1004: `it('keeps an uppercase task marker stable', () => {`
- L1009: `it('keeps a renumbered list stable', () => {`
- L1014: `it('keeps a lazily-nested quote stable', () => {`
- L1019: `it('keeps frontmatter stable', () => {`
- L1024: `it('keeps a two-line quote stable', () => {`
- L1029: `it('keeps an empty fence stable', () => {`

## `../meowdown/packages/core/src/extensions/atom-mark-navigation.test.ts`

- L64: `describe('caret navigation across atom-only paragraphs', () => {`
- L65: `it('focus: ArrowLeft from after the tweet walks back through both embeds', async () => {`
- L90: `it('focus: ArrowRight from before the youtube walks forward through both embeds', async () => {`
- L115: `it('hide: ArrowLeft from after the tweet walks back through both embeds', async () => {`
- L140: `it('show: ArrowLeft from after the tweet walks back through both embeds', async () => {`
- L165: `it('focus: ArrowLeft with plain images instead of embeds', async () => {`
- L190: `it('focus: ArrowLeft from an embed paragraph into a text paragraph', async () => {`
- L212: `it('focus: ArrowRight from a text paragraph into an embed paragraph', async () => {`
- L231: `it('focus: ArrowRight from an embed paragraph into a text paragraph', async () => {`
- L247: `it('focus: ArrowLeft from a text paragraph into an embed paragraph', async () => {`
- L267: `describe('shift selection across atom-only paragraphs', () => {`
- L268: `it('focus: Shift-ArrowLeft from after the tweet extends back through both embeds', async () => {`
- L287: `it('focus: Shift-ArrowRight from before the youtube extends through both embeds', async () => {`
- L306: `it('focus: Shift-ArrowLeft in one paragraph swallows the image as a unit', async () => {`
- L321: `it('focus: Shift-ArrowLeft from an embed paragraph into a text paragraph', async () => {`
- L346: `describe('editing next to an atom unit', () => {`
- L347: `it('focus: Backspace removes the space before a unit', async () => {`
- L359: `it('focus: Backspace removes the letter before a unit', async () => {`
- L371: `it('focus: Backspace at the block start before a unit changes nothing', async () => {`
- L383: `it('focus: Delete removes the space after a unit', async () => {`
- L395: `it('focus: Delete removes the letter after a unit, not the rest of the block', async () => {`
- L407: `it('focus: Delete at the block end after a unit changes nothing', async () => {`
- L419: `it('focus: ArrowRight past a unit steps one character into the text after it', async () => {`
- L425: `it('focus: ArrowRight after a unit at the block end stays put', async () => {`
- L432: `describe('caret snapping out of hidden atom source', () => {`
- L433: `it('focus: a caret dropped inside the source leaves through the end it travelled towards', () => {`
- L439: `it('focus: a caret dropped inside the source leaves through the start when it came from the right', () => {`
- L446: `it('focus: a pointer caret inside the source takes the edge it landed nearest', () => {`
- L455: `it('focus: a caret already on a unit edge stays put', () => {`
- L464: `it('focus: Backspace from inside the source removes the whole unit', async () => {`
- L476: `it('focus: Delete from inside the source removes the whole unit', async () => {`
- L489: `it('focus: a typed character from inside the source lands outside the unit', async () => {`
- L496: `it('focus: Space from inside the source lands outside the unit', async () => {`
- L508: `it('focus: Enter from inside the source splits at the unit edge', async () => {`
- L522: `it('focus: a caret dropped inside an image source leaves the unit too', () => {`
- L528: `it('hide: a caret dropped inside the source leaves the unit', () => {`
- L534: `it('show: a caret dropped inside the source leaves the unit', () => {`
- L540: `it('focus: typing a wikilink by hand still ends up outside the finished unit', async () => {`
- L548: `describe('dragged selections growing to whole atom units', () => {`
- L549: `it('focus: a drag ending inside the source swallows the unit whole', () => {`
- L555: `it('focus: a drag starting inside the source swallows the unit whole', () => {`
- L566: `it('focus: a backwards drag keeps its direction while growing', () => {`
- L574: `it('focus: typing over a drag that cut the source keeps the unit whole', async () => {`
- L586: `it('focus: a drag inside plain text is left alone', () => {`
- L592: `it('focus: a selection that is not from a pointer keeps its endpoints', () => {`
- L598: `it('focus: a drag ending inside an image source swallows the image whole', () => {`
- L605: `describe('caret navigation between adjacent inline units', () => {`
- L606: `it('focus: ArrowRight between an image and a following wikilink', async () => {`
- L623: `it('focus: Backspace between two adjacent wikilinks removes the whole left one', async () => {`
- L635: `it('focus: Delete between an image and a following wikilink removes the whole wikilink', async () => {`
- L647: `it('focus: Shift-ArrowLeft from between two adjacent wikilinks swallows the left one whole', async () => {`
- L654: `it('focus: ArrowLeft walks over a wikilink followed by an image as two units', async () => {`
- L671: `it('hide: ArrowLeft walks over two adjacent wikilinks as two units', async () => {`
- L688: `it('focus: ArrowLeft walks two identical adjacent wikilinks as two units', async () => {`
- L705: `it('focus: Backspace between two identical adjacent wikilinks removes only the left one', async () => {`
- L717: `it('focus: ArrowLeft between two adjacent wikilinks', async () => {`

## `../meowdown/packages/core/src/extensions/autolink.test.ts`

- L8: `describe('autolink rendering', () => {`
- L9: `it('renders a scheme autolink as a link', async () => {`
- L18: `it('renders a bare domain as a link', async () => {`
- L25: `it('renders a bare custom-scheme URI as a link', async () => {`
- L36: `it('keeps a scheme autolink a link when the caret is inside it', async () => {`
- L45: `it('keeps a bare domain a link when the caret is inside it', async () => {`

## `../meowdown/packages/core/src/extensions/batch-set-mark-step.test.ts`

- L57: `describe('BatchSetMarkStep', () => {`
- L58: `it('applies a single chunk', () => {`
- L68: `it('applies multiple disjoint chunks', () => {`
- L81: `it('applies overlapping marks at distinct ranges', () => {`
- L93: `it('removes existing managed marks not in the new set', () => {`
- L102: `it('is a no-op for empty chunks', () => {`
- L109: `it('returns the same doc when the marks already match', () => {`
- L117: `it('invert + apply round-trips back to the original doc', () => {`
- L129: `it('invert returns a ReplaceStep', () => {`
- L135: `it('map always returns null (plugin re-derives on next dispatch)', () => {`
- L140: `it('merge always returns null', () => {`
- L146: `it('toJSON / fromJSON round-trip', () => {`
- L162: `it('is registered with Step.jsonID', () => {`
- L169: `it('applies 32 chunks through the sparse boundary', () => {`
- L176: `it('applies 33 chunks through the sequential boundary', () => {`
- L183: `it('preserves untouched node identities on the sequential path', () => {`
- L191: `it('rewrites more than 32 chunks inside a nested blockquote', () => {`
- L207: `it('returns the original document when 33 chunks already match', () => {`
- L217: `it('rewrites a chunk spanning existing text mark splits', () => {`
- L237: `it('clips sequential chunks to the document', () => {`
- L247: `it('inverts a sequential application back to the original document', () => {`
- L255: `it('round-trips more than 32 chunks through JSON', () => {`

## `../meowdown/packages/core/src/extensions/bullet-after-heading.test.ts`

- L15: `describe('defineBulletAfterHeading', () => {`
- L16: `it('starts an empty bullet on Enter at the end of the first heading', async () => {`
- L30: `it('drops the caret into the new bullet', async () => {`
- L45: `it('inserts the bullet between the first heading and the following block', async () => {`
- L60: `it('leaves a heading that is not the document first block to the default Enter', async () => {`
- L72: `it('leaves Enter in the middle of the first heading to the default split', async () => {`
- L82: `it('leaves Enter in a paragraph to the default behavior', async () => {`

## `../meowdown/packages/core/src/extensions/clipboard/clipboard.test.ts`

- L47: `describe('clipboard HTML', () => {`
- L48: `it('serializes a document to semantic HTML', () => {`
- L74: `it('stamps data-meowdown on every top-level element', () => {`
- L119: `describe('clipboard round trip', () => {`
- L120: `it('round-trips a heading with inline marks', () => {`
- L129: `it('round-trips a setext heading', () => {`
- L139: `it('round-trips a heading with closing hashes', () => {`
- L148: `it('round-trips a nested list', () => {`
- L158: `it('round-trips a round task', () => {`
- L167: `it('round-trips a blockquote with two paragraphs', () => {`
- L178: `it('round-trips a fenced code block', () => {`
- L189: `it('round-trips a table', () => {`
- L200: `it('round-trips an ordered list', () => {`
- L210: `it('round-trips a thematic break with a non-canonical marker', () => {`
- L223: `it('round-trips an html comment', () => {`
- L236: `it('round-trips gap paragraphs', () => {`
- L249: `it('round-trips a wikilink with a display alias', () => {`
- L258: `it('round-trips an inline image', () => {`
- L267: `it('round-trips inline math', () => {`
- L276: `it('round-trips a soft break inside a paragraph', () => {`
- L287: `describe('selection copy', () => {`
- L291: `it('unwraps a single task item into plain text', () => {`
- L305: `it('keeps sibling items as a list', () => {`
- L316: `it('keeps inline marks in a partial paragraph selection', () => {`

## `../meowdown/packages/core/src/extensions/clipboard/plain-paste.test.ts`

- L23: `describe('plain text paste', () => {`
- L24: `it('inserts a single line inline', async () => {`
- L37: `it('keeps a single newline as a soft break', async () => {`
- L47: `it('does not insert an empty paragraph for one blank line', async () => {`
- L58: `it('restores one gap paragraph for two blank lines', async () => {`
- L70: `it('trims leading and trailing newlines', async () => {`
- L79: `it('inserts nothing for whitespace-only newlines', async () => {`
- L86: `it('normalizes CRLF', async () => {`
- L98: `it('keeps tabs and spaces', async () => {`
- L107: `it('renders pasted inline markdown source immediately', async () => {`
- L142: `it('parses block markdown syntax into blocks', async () => {`
- L153: `it('parses pasted task lists', async () => {`
- L169: `it('parses pasted fenced code blocks', async () => {`
- L180: `it('keeps a pasted heading closed inside paragraph text', async () => {`
- L197: `it('keeps a pasted list closed inside paragraph text', async () => {`
- L215: `it('keeps a pasted list closed inside a list item', async () => {`
- L233: `it('opens a trailing paragraph after a pasted heading', async () => {`
- L250: `it('opens a leading paragraph before a pasted heading', async () => {`
- L268: `describe('plain text paste with shift', () => {`
- L271: `it('splits every newline run into paragraphs', () => {`

## `../meowdown/packages/core/src/extensions/clipboard/plain-text.test.ts`

- L37: `describe('plain text copy in show and focus mode', () => {`
- L38: `it('keeps the full inline source in show mode', () => {`
- L42: `it('keeps the full inline source in focus mode', () => {`
- L46: `it('emits block markers for a heading and a list', () => {`
- L57: `it('emits blockquote and fence markers', () => {`
- L69: `it('keeps a partial paragraph selection as inline source', () => {`
- L75: `it('copies part of a heading without its marker in focus mode', () => {`
- L81: `it('copies part of a heading without its marker in show mode', () => {`
- L87: `it('copies part of a code block without its fence in focus mode', () => {`
- L95: `it('copies part of a code block without its fence in show mode', () => {`
- L103: `it('keeps newlines inside a partial code block selection', () => {`
- L111: `it('drops fences when a code block selection starts at its content start', () => {`
- L119: `it('drops fences when a code block selection ends at its content end', () => {`
- L127: `it('keeps both heading prefixes when only the last heading ends partially', () => {`
- L139: `it('drops only the heading prefix whose content start is not selected', () => {`
- L151: `it('keeps both markers when both edge headings are complete', () => {`
- L163: `it('keeps a heading marker when all of its content is selected', () => {`
- L169: `it('does not synthesize a setext underline after a partial heading end', () => {`
- L177: `it('does not synthesize closing hashes after a partial heading end', () => {`
- L186: `describe('plain text copy in hide mode', () => {`
- L187: `it('strips emphasis syntax but keeps block markers', () => {`
- L197: `it('keeps blockquote structure with stripped inline syntax', () => {`
- L207: `it('keeps table structure with stripped inline syntax', () => {`
- L217: `it('keeps bullet list markers', () => {`
- L226: `it('keeps ordered list markers', () => {`
- L235: `it('keeps task checkboxes in all shapes', () => {`
- L247: `it('keeps a nested list shape', () => {`
- L258: `it('strips link syntax down to the label', () => {`
- L262: `it('keeps a bare autolink', () => {`
- L268: `it('keeps the whole image source', () => {`
- L274: `it('keeps the whole math source', () => {`
- L278: `it('replaces a wikilink with its target', () => {`
- L282: `it('replaces a wikilink with its display alias', () => {`
- L286: `it('keeps a tag verbatim', () => {`
- L290: `it('strips syntax from a partial paragraph selection', () => {`
- L296: `it('copies part of a heading without its marker', () => {`
- L302: `it('copies part of a code block without its fence', () => {`
- L310: `it('keeps code block content verbatim', () => {`
- L321: `describe('plain text copy block layout', () => {`
- L322: `it('separates paragraphs with a blank line', () => {`
- L332: `it('keeps gap paragraphs as extra blank lines', () => {`
- L344: `it('keeps a soft break inside a paragraph', () => {`
- L353: `it('drops a blockquote marker from a partial selection', () => {`
- L361: `it('keeps a blockquote marker when all content is selected', () => {`
- L369: `it('keeps a blockquote marker when its content start is selected', () => {`
- L375: `it('does not build a table around one fully selected cell', () => {`
- L391: `it('keeps a table when all cell content is selected', () => {`
- L404: `it('keeps flat-list selection unwrapping', () => {`
- L416: `describe('native plain text copy', () => {`
- L417: `it('writes a partial code block selection without fences', async () => {`

## `../meowdown/packages/core/src/extensions/clipboard/semantic-inline.test.ts`

- L20: `describe('paragraphClipboardDOM', () => {`
- L21: `it('serializes plain text', () => {`
- L32: `it('drops syntax characters and wraps semantic marks', () => {`
- L58: `it('keeps mark nesting', () => {`
- L75: `it('serializes a link with its href', () => {`
- L89: `it('serializes a bare autolink', () => {`
- L104: `it('replaces an image source with an img element', () => {`
- L121: `it('renders wikilink display text', () => {`
- L132: `it('keeps math source text', () => {`
- L143: `it('keeps a tag as plain text', () => {`
- L154: `it('renders a soft break as br', () => {`
- L171: `it('serializes an empty paragraph', () => {`
- L185: `describe('headingClipboardDOM', () => {`
- L186: `it('serializes an ATX heading with the source prefix in data-md', () => {`
- L200: `it('keeps setext underline metadata', () => {`
- L214: `it('keeps closing hashes metadata', () => {`

## `../meowdown/packages/core/src/extensions/code-block-highlight.test.ts`

- L7: `describe('defineCodeBlockSyntaxHighlight', () => {`
- L8: `it('renders syntax token spans for a code block', async () => {`
- L37: `it('does not crash on an unknown language and leaves the text intact', async () => {`

## `../meowdown/packages/core/src/extensions/code-block-languages.test.ts`

- L5: `describe('codeBlockLanguages', () => {`
- L6: `it('lists the supported languages as \`value → label\` pairs', () => {`

## `../meowdown/packages/core/src/extensions/code-block.test.ts`

- L7: `describe('codeBlock attrs', () => {`
- L8: `it('keeps \`fenceStyle\` and \`fenceLength\` through a DOM round-trip', () => {`
- L26: `describe('tilde fence rules', () => {`
- L27: `it('creates a tilde code block from \`~~~\` and Enter', async () => {`
- L38: `it('creates a tilde code block with a language from \`~~~js\` and Enter', async () => {`
- L49: `it('creates a tilde code block from \`~~~\` and Space', async () => {`
- L60: `describe('dollar fence rules', () => {`
- L61: `it('keeps \`fenceStyle: dollar\` through a DOM round-trip', () => {`
- L78: `it('creates a math block from \`$$\` and Enter', async () => {`
- L89: `it('does not create a math block from \`$$\` inside other text', async () => {`
- L101: `describe('typing over code block selections', () => {`
- L102: `it('keeps the typed text over a partial selection', async () => {`
- L116: `it('keeps the typed text over the full code text', async () => {`

## `../meowdown/packages/core/src/extensions/commands.test.ts`

- L6: `describe('insertMarkdown', () => {`
- L7: `it('inserts a lone-paragraph fragment inline at the cursor', () => {`
- L28: `it('collapses an active selection instead of deleting it', () => {`
- L49: `it('inserts a multi-block fragment as blocks with the cursor at its end', () => {`
- L79: `it('undoes an inserted fragment as a single history entry', () => {`
- L111: `it('ignores an empty or whitespace-only fragment', () => {`
- L134: `describe('insertTrigger', () => {`
- L135: `it('inserts the trigger text at the cursor', () => {`
- L156: `it('prefixes a space after a non-space character', () => {`
- L177: `it('does nothing in a code block', () => {`
- L202: `it('ignores empty trigger text', () => {`
- L224: `describe('turnIntoText', () => {`
- L225: `it('turns a heading into a paragraph', () => {`
- L246: `it('returns false on a plain top-level paragraph', () => {`
- L267: `it('unwraps a bullet list item', () => {`
- L288: `it('unwraps only the middle item of three', () => {`
- L321: `it('unwraps a checked task item, dropping the checkbox', () => {`
- L342: `it('turns a nested item into a continuation paragraph of its parent', () => {`
- L374: `it('lifts a paragraph out of a blockquote', () => {`
- L395: `it('splits the quote when lifting its middle paragraph', () => {`
- L426: `it('peels a heading inside a list item one layer per call', () => {`
- L454: `it('peels a list inside a blockquote one layer per call', () => {`
- L482: `it('keeps the caret in the text', () => {`

## `../meowdown/packages/core/src/extensions/cross-editor-drag.test.ts`

- L30: `describe('cross editor drag', () => {`
- L31: `it('removes the block from the source editor after it lands', async () => {`
- L43: `it('keeps list marker fidelity while moving', async () => {`
- L55: `it('moves a dragged text selection out of the source editor', async () => {`
- L69: `it('copies instead of moving when the copy modifier is held', async () => {`
- L81: `it('leaves the source alone when the drop carries nothing', async () => {`
- L94: `it('leaves the source alone when its doc changed during the drag', async () => {`
- L109: `it('ignores a drop that did not start in another meowdown editor', async () => {`
- L123: `it('does not touch a third editor that is not the drag source', async () => {`
- L136: `it('keeps a same editor drag on the ProseMirror move path', async () => {`

## `../meowdown/packages/core/src/extensions/embed-paste.test.ts`

- L24: `describe('detectEmbedUrl', () => {`
- L25: `it.each([`
- L35: `it('trims surrounding whitespace and newlines', () => {`
- L39: `it.each([`
- L52: `describe('paste a lone embed link', () => {`
- L53: `it('embeds a pasted YouTube link', async () => {`
- L67: `it('embeds a pasted tweet link', async () => {`
- L77: `it('replaces the selected text when pasting onto a selection', async () => {`
- L87: `it('leaves a non-embeddable URL as a normal paste', async () => {`
- L97: `it('does not embed when the clipboard has text around the URL', async () => {`
- L107: `it('does not embed inside a code block', async () => {`
- L117: `it('embeds over a selection that spans two blocks', async () => {`
- L128: `describe('undo restores the raw link', () => {`
- L129: `it('one undo turns the embed back into the link, a second removes it', async () => {`
- L156: `it('takes exactly two undo steps (proves the two-transaction split)', () => {`
- L167: `it('keeps the surrounding text, removing only the pasted link', () => {`
- L180: `it('reverts via the real Ctrl-z / Cmd-z shortcut', async () => {`

## `../meowdown/packages/core/src/extensions/escape-collapse.test.ts`

- L7: `describe('defineEscapeCollapse', () => {`
- L8: `it('collapses a text selection to a caret at its head', async () => {`
- L18: `it('collapses a backwards selection to its head', async () => {`
- L27: `it('leaves an empty selection alone', async () => {`
- L36: `it('collapses a node selection to a caret', async () => {`

## `../meowdown/packages/core/src/extensions/exit-boundary.test.ts`

- L23: `describe('defineExitBoundaryHandler', () => {`
- L24: `it('fires "up" when ArrowUp is pressed at the document top', async () => {`
- L36: `it('fires "down" when ArrowDown is pressed at the document bottom', async () => {`
- L47: `it('does not fire ArrowUp when a block sits above the cursor', async () => {`
- L57: `it('does not fire ArrowDown when a block sits below the cursor', async () => {`
- L67: `it('uses the visual line, not the caret position: ArrowUp fires from the first wrapped line', async () => {`
- L79: `it('does not fire ArrowUp from a lower visual line of the first paragraph', async () => {`
- L91: `it('fires "up" only once a node-selected top block has become a gap cursor', async () => {`
- L109: `it('fires "down" only once a node-selected bottom block has become a gap cursor', async () => {`
- L126: `it('does not fire "down" for a NodeSelection with content below', async () => {`
- L137: `it('does not fire for a non-empty text selection', async () => {`
- L147: `it('does not fire when a modifier (Shift) is held', async () => {`
- L157: `it('fires both directions in an empty document', async () => {`

## `../meowdown/packages/core/src/extensions/extension.test.ts`

- L6: `describe('defineEditorExtension', () => {`
- L7: `it('builds a document covering every node type', () => {`

## `../meowdown/packages/core/src/extensions/file-paste.test.ts`

- L30: `describe('file paste', () => {`
- L31: `it('inserts a [name](src) link for a pasted non-image file', async () => {`
- L44: `it('escapes brackets and backslashes in the filename', async () => {`
- L52: `it('inserts nothing when the callback declines with undefined', async () => {`
- L60: `it('pastes multiple files one link per line', async () => {`
- L68: `it('continues with the remaining files when a save throws', async () => {`
- L87: `it('inserts image syntax for a pasted image', async () => {`
- L99: `it('inserts image syntax for a pasted AVIF with no MIME type', async () => {`
- L108: `describe('file drop', () => {`
- L109: `it('inserts the link at the drop position', async () => {`
- L118: `it('consumes the drop when a handler can take the file', () => {`
- L124: `it('ignores files when onFilePaste is not configured', async () => {`
- L133: `it('consumes a declined drop without inserting anything', async () => {`
- L142: `it('inserts a mixed drop one link per line, in DataTransfer order', async () => {`
- L153: `it('inserts image syntax for a dropped SVG with an incorrect MIME type', async () => {`
- L163: `describe('buildFileMarkdown', () => {`
- L164: `it('builds image syntax for an image type', () => {`
- L170: `it('falls back to recognized image extensions case-insensitively', () => {`
- L182: `it('builds a link for any other file, with or without a type', () => {`
- L192: `it('escapes backslashes and brackets in the name', () => {`

## `../meowdown/packages/core/src/extensions/file-view.test.ts`

- L35: `describe('file pill rendering', () => {`
- L36: `it('renders a claimed link as a pill with its name', async () => {`
- L44: `it('leaves an unclaimed link as a regular link', async () => {`
- L51: `it('derives the file kind from the extension', async () => {`
- L57: `it('derives an archive kind case-insensitively with a query string', async () => {`
- L63: `it('falls back to the generic kind for an unknown extension', async () => {`
- L69: `it('falls back to the generic kind without an extension', async () => {`
- L76: `describe('file pill size', () => {`
- L77: `it('shows a synchronously resolved size', async () => {`
- L83: `it('fills the size in when the promise settles', async () => {`
- L96: `it('leaves the size empty when the resolver returns undefined', async () => {`
- L103: `it('leaves the size empty and logs when the resolver rejects', async () => {`
- L123: `it('ignores an invalid size', async () => {`
- L131: `describe('file pill update', () => {`
- L132: `it('keeps the same pill element while the name is updated', async () => {`
- L142: `it('rebuilds the pill when the href is edited', async () => {`
- L155: `it('drops the pill when the href is edited out of the resolver claim', async () => {`
- L167: `describe('file pill caret navigation', () => {`
- L168: `it('ArrowRight selects the pill, then steps past into DEF', async () => {`
- L183: `it('ArrowLeft selects the pill, then collapses to its left edge', async () => {`
- L195: `it('Backspace deletes the pill as a unit', async () => {`
- L202: `describe('file pill click callback', () => {`
- L219: `it('fires with the href, name, and originating MouseEvent when clicked', async () => {`
- L233: `it('does not fire when plain text is clicked', async () => {`
- L242: `it('does not fire onLinkClick for a pill click, and keeps it for regular links', async () => {`
- L261: `it('reports each adjacent pill by its own href and name', async () => {`

## `../meowdown/packages/core/src/extensions/find.test.ts`

- L19: `describe('find over hidden source', () => {`
- L23: `it('counts a match inside a hidden link destination and reveals it', () => {`
- L33: `it('matches a wiki link by the alias its preview shows', () => {`

## `../meowdown/packages/core/src/extensions/follow-link.test.ts`

- L26: `describe('defineFollowLinkHandler', () => {`
- L27: `it('does not follow a wikilink pill from the caret', async () => {`
- L41: `it('follows the tag under the caret and passes the KeyboardEvent', async () => {`
- L52: `it('follows the Markdown link under the caret', async () => {`
- L64: `it('follows a selected file pill instead of the link handler', async () => {`
- L83: `it('on a selected wikilink inside a task item follows instead of rotating the task', async () => {`
- L97: `it('off the link in the same task item rotates the task', async () => {`
- L110: `it('Mod-Shift-Enter still rotates a circle task even on a link', async () => {`
- L121: `it('falls through to the task rotation when no handler matches the unit', async () => {`
- L132: `it('does not follow a wikilink the caret only touches at its left edge', async () => {`
- L144: `it('does not follow a wikilink the caret only touches at its right edge', async () => {`
- L155: `it('does not follow a tag the caret only touches at its edge', async () => {`
- L165: `it('Mod-Enter on a selected wikilink next to another wikilink', async () => {`
- L188: `it('Enter on a selected wikilink', async () => {`
- L216: `it('Enter on a selected image', async () => {`
- L234: `it('Mod-Enter on a selected image reports \`mod\`', async () => {`
- L248: `it('Enter on a selected image with no matching handler is a no-op', async () => {`
- L263: `it('Enter on a selected wikilink inside a list item does not split the item', async () => {`

## `../meowdown/packages/core/src/extensions/get-link-unit-at.test.ts`

- L8: `describe('getLinkUnitAt', () => {`
- L9: `it('resolves href, label, and dest for a plain link', () => {`
- L22: `it('parses and unquotes a title', () => {`
- L32: `it('resolves href when the position is on the url run, not the label', () => {`
- L41: `it('returns the right href when two links touch', () => {`
- L49: `it('treats an autolink as href-only (no label or dest)', () => {`
- L60: `it('exposes the visible interior of an angle autolink as text', () => {`
- L72: `it('reads the angle autolink href when the position sits on a bracket', () => {`
- L81: `it('returns the unit after the boundary where two link units touch', () => {`
- L90: `it('handles an empty dest', () => {`
- L100: `it('returns undefined in plain text', () => {`
- L107: `it('returns undefined inside a non-link unit', () => {`
- L114: `it('resolves the link unit when the link nests inside an emphasis', () => {`
- L127: `it('returns a reference href without editable inline ranges', () => {`
- L145: `it('returns the visible range for a collapsed reference', () => {`
- L157: `it('returns the visible range for a shortcut reference', () => {`
- L169: `it('returns a resolved reference with an empty destination', () => {`

## `../meowdown/packages/core/src/extensions/heading.test.ts`

- L10: `describe('keymap', () => {`
- L12: `it(\`Mod-${level} sets heading ${level}\`, async () => {`
- L22: `it('toggles a heading back off with a second Mod-1', async () => {`
- L31: `it('does not bind Mod-Alt-1 (dropped in favor of Mod-1)', async () => {`
- L40: `it('turns a heading back into a paragraph on Backspace at its start', async () => {`
- L50: `describe('soft line break', () => {`
- L51: `it('declares whitespace: pre', () => {`
- L56: `it('keeps a multi-line setext heading through a DOM round-trip', () => {`

## `../meowdown/packages/core/src/extensions/hidden-run-caret.test.ts`

- L31: `describe('hide mode arrow traversal', () => {`
- L32: `it('ArrowLeft skips a hidden run interior but rests on both edges', async () => {`
- L45: `it('ArrowRight mirrors the traversal', async () => {`
- L58: `it('ArrowRight crosses the closing run through both edges', async () => {`
- L71: `it("traverses a link's trailing run in one step", async () => {`
- L83: `it('adjacent units expose both content edges but not the midpoint', async () => {`
- L97: `it('keeps focus and show modes untouched', async () => {`
- L110: `describe('hide mode pointer snapping', () => {`
- L111: `it('lands at the unit outer edge when clicking at the left edge of a word', async () => {`
- L118: `it('lands after the unit when clicking at the right edge of a word', async () => {`
- L126: `describe('hide mode selection extension', () => {`
- L127: `it('Shift+ArrowLeft extends over a hidden run without cutting it', async () => {`
- L136: `describe('hide mode caret invariants', () => {`
- L137: `it('vertical motion never rests inside a hidden run', async () => {`
- L150: `it('snaps a programmatic selection out of a run interior', () => {`
- L160: `describe('hide mode Enter relocation', () => {`
- L161: `it('splits after the unit at the closing content edge', async () => {`
- L172: `it('splits before the unit at the opening content edge', async () => {`
- L183: `it('keeps the unit whole when splitting inside a bullet', async () => {`
- L198: `it('splits mid-unit in focus mode exactly as before', async () => {`
- L210: `describe('hide mode unformat deletion', () => {`
- L211: `it('Backspace after a unit dissolves it', async () => {`
- L218: `it('Backspace at the content edge deletes a content char', async () => {`
- L225: `it('Delete at the content edge dissolves the unit', async () => {`
- L231: `it('Delete before a unit dissolves it', async () => {`
- L237: `it('Backspace after a link dissolves the whole link in one undo step', async () => {`
- L245: `it("Backspace at a link's content start dissolves the link", async () => {`
- L251: `it('dissolving an inner unit keeps the outer unit', async () => {`
- L258: `it('dissolving a triple run removes both nested units', async () => {`
- L264: `it('a merged run dissolves only the adjacent unit', async () => {`
- L271: `it('a fully hidden unit deletes entirely', async () => {`
- L277: `it('atom deletion stays with atom navigation at a shared boundary', async () => {`
- L283: `it('unformat wins over atom one-char deletion at a shared boundary', async () => {`
- L289: `it('a range selection still deletes natively', async () => {`
- L297: `it('keeps the per-char deletion in focus mode', async () => {`
- L304: `describe('hide mode complex cases', () => {`
- L305: `it('treats a link title as part of the hidden tail', async () => {`
- L321: `it('Enter never orphans link markers', async () => {`
- L332: `it('clicking into the link text keeps typing inside the link', async () => {`
- L341: `it('traverses a triple marker as one run per side', async () => {`
- L354: `it('Enter at an inner content edge relocates to the inner unit edge', async () => {`
- L365: `it('steps through a tag character by character', async () => {`
- L378: `it('steps through a bare autolink character by character', async () => {`
- L390: `it('leaves code blocks untouched', async () => {`
- L401: `it('dissolves inline code like bold', async () => {`
- L407: `it('dissolves highlight and strikethrough like bold', async () => {`
- L420: `it('keeps a unit alone in a paragraph fully reachable', async () => {`
- L433: `it('Backspace at paragraph start joins across a trailing unit', async () => {`
- L442: `it('keeps the caret on a rest position after native word deletion', async () => {`
- L455: `describe('hide mode typing at coincident positions', () => {`
- L456: `it('typing at the content edge joins the unit', async () => {`
- L463: `it('typing at the outer edge stays plain', async () => {`

## `../meowdown/packages/core/src/extensions/hidden-run.test.ts`

- L32: `describe('isHiddenChar', () => {`
- L33: `it('is true on syntax chars and false on content', () => {`
- L39: `it('is false on atom source chars', () => {`
- L47: `it('is false inside a code block', () => {`
- L57: `describe('hidden run walking', () => {`
- L58: `it('finds the bold marker runs', () => {`
- L68: `it('folds a link tail into one run', () => {`
- L75: `it('treats a triple marker as one run', () => {`
- L82: `it('merges touching runs of adjacent units', () => {`
- L89: `describe('isHiddenRunInterior', () => {`
- L90: `it('marks only strict run interiors', () => {`
- L98: `it('gives single-char runs no interior', () => {`
- L106: `describe('getInnermostPackRangeAt', () => {`
- L107: `it('resolves a nested marker to the inner unit', () => {`
- L114: `it('resolves the outermost marker of a triple run to the outer unit', () => {`
- L122: `describe('getRestPosition (keyboard)', () => {`
- L123: `it('continues through a run interior in the travel direction', () => {`
- L131: `it('keeps rest positions unchanged', () => {`
- L139: `describe('getRestPosition (pointer)', () => {`
- L140: `it('snaps run interiors and content edges to the unit outer edge', () => {`
- L150: `it('snaps a merged run to the nearest end and keeps both ends', () => {`
- L162: `describe('getCaretTail', () => {`
- L163: `it('points to the typing-affinity side at run edges', () => {`
- L171: `it('is undefined in plain text and run interiors', () => {`
- L179: `describe('getUnitMarkerRuns', () => {`
- L180: `it('returns the trailing run first for a bold unit', () => {`
- L189: `it('returns only the inner unit runs for a nested marker', () => {`
- L198: `it('returns both triple runs for the outer unit', () => {`
- L205: `it('returns one run for a fully hidden unit', () => {`

## `../meowdown/packages/core/src/extensions/horizontal-rule.test.ts`

- L16: `describe('horizontal rule marker', () => {`
- L17: `it('keeps a non-canonical marker through a DOM round-trip', () => {`
- L29: `it('parses a bare foreign hr as a default rule', () => {`
- L40: `describe('horizontal rule input rule in lists', () => {`
- L41: `it('replaces an otherwise-empty bullet item typed with \`- \`', async () => {`
- L56: `it('replaces an otherwise-empty ordered item typed with \`1. \`', async () => {`
- L71: `it('replaces an otherwise-empty task item', async () => {`
- L85: `it('replaces only the item under the caret, splitting the list', async () => {`
- L107: `it('keeps a bullet whose second paragraph gets the \`---\`', async () => {`
- L123: `it('keeps the outer item when a nested empty item gets the \`---\`', async () => {`
- L145: `it('keeps an item whose paragraph still has text after the caret', async () => {`

## `../meowdown/packages/core/src/extensions/html-comment.test.ts`

- L15: `describe('html comment node', () => {`
- L16: `it('serializes to a hidden element and recovers its content from the DOM', () => {`
- L34: `describe('html comment in a mounted editor', () => {`
- L35: `it('renders the comment invisibly without spilling into the visible text', () => {`
- L56: `it('keeps the comment in the document so it round-trips to markdown', () => {`
- L70: `it('steps the caret past the hidden comment without error', async () => {`

## `../meowdown/packages/core/src/extensions/html-paste.test.ts`

- L8: `describe('paste rich-text HTML', () => {`
- L9: `it('keeps bold and italic', () => {`
- L17: `it('keeps a bullet list with formatted items', () => {`
- L25: `it('keeps a link', () => {`
- L33: `it('replaces the selection when pasting onto it', () => {`
- L41: `it('pastes plain text inside a code block without converting', () => {`
- L50: `it('leaves meowdown-native clipboard HTML to the default path', () => {`
- L61: `it('leaves clipboard HTML from an older meowdown to the default path', () => {`
- L73: `it('converts HTML from a foreign ProseMirror editor', () => {`
- L83: `it('converts a foreign task list into a meowdown task list', () => {`
- L98: `it('keeps markdown punctuation in pasted prose unescaped', () => {`
- L106: `it('does not lose a pasted line that starts with tildes', () => {`
- L117: `describe('paste styled plain text', () => {`
- L118: `it('pastes code-editor line divs as markdown source', () => {`
- L132: `it('keeps active markdown syntax literal in plain HTML prose', () => {`
- L140: `it('keeps active markdown syntax literal in unstyled line divs', () => {`
- L148: `it('ignores styles outside line divs', () => {`
- L156: `it('keeps blank-line structure from line divs', () => {`
- L164: `it('separates plain HTML paragraphs', () => {`
- L172: `it('keeps non-breaking spaces in plain HTML prose', () => {`

## `../meowdown/packages/core/src/extensions/image.test.ts`

- L46: `describe('image caret navigation', () => {`
- L47: `it('ArrowRight selects the image, then steps past into DEF', async () => {`
- L62: `it('ArrowLeft selects the image, then collapses to its left edge', async () => {`
- L77: `describe('image deletion', () => {`
- L78: `it('Backspace deletes the image as a unit, plain text one char', async () => {`
- L99: `describe('image selection ring', () => {`
- L100: `it('rings the preview only while the image is selected, from either edge', async () => {`
- L122: `it('does not ring the preview inside a node-selected block', async () => {`
- L130: `describe('image click callback', () => {`
- L141: `it('fires with the src, alt, and originating MouseEvent when clicked', async () => {`
- L155: `it('prevents non-mouse pointerdown on clickable previews without swallowing click', async () => {`
- L210: `it.skipIf(cannotConstructTouch)('fires on a touch tap and cancels the touchend', async () => {`
- L230: `it.skipIf(cannotConstructTouch)('ignores a touch that moved too far to be a tap', async () => {`
- L248: `it.skipIf(cannotConstructTouch)('leaves a touch tap on the resize handle alone', async () => {`
- L264: `it('leaves mouse pointerdown on clickable previews alone', async () => {`
- L279: `it('does not fire when plain text is clicked', async () => {`
- L288: `it('reports each adjacent image by its own src and alt', async () => {`
- L310: `describe('image resize', () => {`
- L327: `it('applies a persisted width to the resizable root', async () => {`
- L336: `it('applies a persisted width and height to the resizable root', async () => {`
- L346: `it('pairs a persisted width with a derived height for a landscape image', async () => {`
- L356: `it('pairs a persisted width with a derived height for a portrait image', async () => {`
- L363: `it('writes a width and height comment when resized', async () => {`
- L372: `it('replaces an existing size comment when resized again', async () => {`
- L382: `it('applies a persisted width to a linked image', async () => {`
- L388: `it('writes the size comment inside the link label when a linked image is resized', async () => {`
- L400: `it('replaces the size comment of a linked image when resized again', async () => {`
- L414: `it('collapses a stacked run of size comments when resized', async () => {`
- L423: `it('keeps the same preview DOM when resized', async () => {`
- L436: `it.each([`
- L463: `it('shows a loading placeholder until the image loads', async () => {`
- L473: `describe('wiki image resize', () => {`
- L489: `it('applies width-only and width-by-height syntax', async () => {`
- L502: `it('rewrites only the wiki size suffix when resized', async () => {`
- L514: `describe('typing after an inline image', () => {`
- L515: `it('types the next character after the image, not before it', async () => {`
- L524: `it('types after an image that sits between words', async () => {`
- L535: `describe('image mark view update', () => {`
- L536: `it('keeps the same img element while the alt text is edited', async () => {`
- L558: `describe('image source spellcheck exemption', () => {`
- L561: `it('renders the image source with spellcheck off', async () => {`

## `../meowdown/packages/core/src/extensions/inline-mark-plugin.bench.ts`

- L23: `describe('inlineTextToMarkChunks', () => {`

## `../meowdown/packages/core/src/extensions/inline-mark-plugin.test.ts`

- L20: `describe('inlineMarkPlugin', () => {`
- L21: `it('applies mdStrong inside **bold**', () => {`
- L34: `it('applies mdEm inside *italic*', () => {`
- L44: `it('applies mdCode inside \`code\`', () => {`
- L54: `it('applies mdHighlight inside ==text==', () => {`
- L66: `it('applies mdMath across the whole $x$', () => {`
- L84: `it('removes mdMath when a dollar disappears', () => {`
- L97: `it('keeps nested mdStrong inside ==**bold**==', () => {`
- L107: `it('applies mdLinkText with href attr inside [text](url)', () => {`
- L120: `it('keeps a definition label literal while autolinking its URL', () => {`
- L129: `it('applies mdLinkText with a derived href on a bare autolink', () => {`
- L142: `it('applies mdLinkText with an https href on a bare domain', () => {`
- L155: `it('leaves a bare host off the TLD list as plain text', () => {`
- L165: `it('marks \`_foo_\` inside headings as well', () => {`
- L175: `it('does NOT mark inline syntax inside code blocks', () => {`
- L185: `it('does not infinitely recurse on its own appended transactions', () => {`
- L197: `it('removes marks when the syntax characters disappear', () => {`
- L213: `it('caches chunks per immutable paragraph node', () => {`
- L232: `it('only re-parses the edited paragraph, not its siblings', () => {`
- L251: `it('marks inline syntax inside a table cell paragraph', () => {`
- L261: `it('applies mdTag across the whole #tag, # included', () => {`
- L274: `it('marks tags inside headings', () => {`
- L284: `it('does NOT mark #tag inside code blocks', () => {`
- L294: `it('applies mdWikilink across the whole [[note]]', () => {`
- L308: `it('marks wikilinks inside headings', () => {`
- L318: `it('does not mark [[note]] inside code blocks', () => {`
- L328: `it('removes mdWikilink when the closing ] is deleted', () => {`
- L345: `it('removes mdTag when text is glued in front of the #', () => {`
- L359: `it('updates only references that use the changed definition key', () => {`
- L383: `it('resolves an existing unresolved reference when its definition appears', () => {`
- L397: `it('removes reference marks when its definition disappears', () => {`
- L410: `it('promotes the next duplicate after deleting the first definition', () => {`
- L428: `it('does not invalidate dependents when a shadowed duplicate changes', () => {`
- L449: `it('retains a definition across an external AddMarkStep', () => {`
- L466: `it('discovers a definition after AttrStep changes its list kind', () => {`
- L478: `it('does not reparse unchanged definitions on an unrelated edit', () => {`
- L491: `it('does no inline parsing for a selection-only transaction', () => {`
- L501: `it('invalidates cached definition context when a list kind changes', () => {`

## `../meowdown/packages/core/src/extensions/inline-marks.test.ts`

- L9: `describe('inline-marks', () => {`
- L10: `it('editor schema mark names match MARK_NAMES exactly', () => {`
- L16: `it('ranks the pack mark outermost of all, so it wraps the whole unit', () => {`
- L25: `describe('inline mark spellcheck exemption', () => {`
- L36: `it('renders inline code with spellcheck off', async () => {`
- L47: `it('renders the link destination with spellcheck off', async () => {`

## `../meowdown/packages/core/src/extensions/inline-text-to-mark-chunks.test.ts`

- L76: `describe('plain text', () => {`
- L77: `it('plain text', () => {`
- L85: `it('escaped', () => {`
- L93: `it('hard break', () => {`
- L101: `it('empty', () => {`
- L110: `describe('emphasis', () => {`
- L111: `it('emphasis', () => {`
- L122: `it('whole text', () => {`
- L132: `it('twice', () => {`
- L147: `describe('strong emphasis', () => {`
- L148: `it('strong emphasis', () => {`
- L161: `describe('emphasis and strong', () => {`
- L162: `it('triple', () => {`
- L174: `it('adjacent', () => {`
- L187: `it('nested', () => {`
- L202: `describe('inline code', () => {`
- L203: `it('inline code', () => {`
- L216: `describe('strikethrough', () => {`
- L217: `it('strikethrough', () => {`
- L230: `describe('highlight', () => {`
- L231: `it('highlight', () => {`
- L244: `describe('math', () => {`
- L245: `it('math', () => {`
- L257: `it('double dollar', () => {`
- L267: `it('formula with backslashes', () => {`
- L277: `it('escaped dollar inside the formula', () => {`
- L287: `it('inside bold', () => {`
- L299: `it('currency stays plain text', () => {`
- L308: `describe('link', () => {`
- L309: `it('link', () => {`
- L321: `it('adjacent and identical', () => {`
- L338: `it('title', () => {`
- L352: `it('emphasis inside', () => {`
- L366: `it('adjacent', () => {`
- L383: `it('single brackets stay plain text', () => {`
- L393: `it('full reference stays plain text', () => {`
- L401: `it('nested syntax inside plain brackets still renders', () => {`
- L413: `it('explicit empty destination keeps the link pack', () => {`
- L424: `describe('reference link', () => {`
- L431: `it('resolves a full reference link', () => {`
- L448: `it('resolves a collapsed reference link', () => {`
- L458: `it('resolves a shortcut reference link', () => {`
- L468: `it('normalizes case, whitespace, and Unicode labels', () => {`
- L478: `it('keeps an empty resolved destination as a link', () => {`
- L489: `it('keeps unresolved syntax plain while preserving nested marks', () => {`
- L501: `it('records an unresolved normalized key for invalidation', () => {`
- L510: `it('keeps the definition label unresolved while parsing other inline syntax', () => {`
- L522: `it('autolinks a URL inside definition source', () => {`
- L537: `it('distinguishes escaped labels during normalization', () => {`
- L547: `describe('image', () => {`
- L548: `it('image', () => {`
- L556: `it('adjacent and identical', () => {`
- L565: `it('only URL', () => {`
- L573: `it('empty title', () => {`
- L581: `it('formatted alt', () => {`
- L589: `it('wrapped by text', () => {`
- L599: `it('reference', () => {`
- L607: `it('resolves a full reference image', () => {`
- L617: `it('resolves a collapsed reference image', () => {`
- L623: `it('resolves a shortcut reference image', () => {`
- L629: `it('resolves a reference image nested inside an inline link', () => {`
- L639: `it('folds a trailing width comment into the image mark', () => {`
- L647: `it('keeps a non-adjacent comment separate', () => {`
- L656: `it('folds the comment when the image is wrapped by text', () => {`
- L666: `it('ignores a non-metadata comment after an image', () => {`
- L675: `it('folds a trailing width comment on an image inside a link label', () => {`
- L687: `it('folds a stacked run of size comments, first data winning', () => {`
- L695: `it('folds a stacked run of size comments inside a link label', () => {`
- L708: `it('stops the fold at a non-metadata comment', () => {`
- L718: `describe('wiki embed', () => {`
- L719: `it('stays literal without a host resolver', () => {`
- L727: `it('stays literal when the resolver cannot prove a target', () => {`
- L736: `it('passes the parsed alias and dimensions to the resolver', () => {`
- L747: `it('renders a resolved image with width-only sizing', () => {`
- L759: `it('renders a resolved image with width and height', () => {`
- L771: `it('renders a resolved file through the file atom', () => {`
- L783: `it('renders a resolved note through the wikilink atom', () => {`
- L795: `it('uses resolution overrides for file and note fallbacks', () => {`
- L813: `describe('autolink', () => {`
- L814: `it('https', () => {`
- L824: `it('www', () => {`
- L834: `it('email', () => {`
- L844: `it('mailto', () => {`
- L854: `it('trailing punctuation', () => {`
- L864: `it('inside emphasis', () => {`
- L874: `it('non-http scheme', () => {`
- L884: `it('custom app scheme', () => {`
- L895: `describe('angle autolink', () => {`
- L896: `it('https', () => {`
- L908: `it('ftp', () => {`
- L920: `it('ssh', () => {`
- L933: `describe('bare autolink', () => {`
- L934: `it('curated TLD', () => {`
- L944: `it('off-list TLD', () => {`
- L952: `it('starts text', () => {`
- L960: `it('with path', () => {`
- L968: `it('preserves case', () => {`
- L976: `it('trailing period', () => {`
- L986: `it('code-file name', () => {`
- L994: `it('www prefix', () => {`
- L1002: `it('explicit link label', () => {`
- L1014: `it('inside link label', () => {`
- L1026: `it('inside inline code', () => {`
- L1036: `it('email after @', () => {`
- L1047: `describe('tag', () => {`
- L1048: `it('tag', () => {`
- L1058: `it('twice', () => {`
- L1068: `it('inside emphasis', () => {`
- L1080: `it('inside link label', () => {`
- L1093: `it('heading-like', () => {`
- L1101: `it('all-digit', () => {`
- L1110: `describe('wikilink', () => {`
- L1111: `it('wikilink', () => {`
- L1121: `it('adjacent', () => {`
- L1130: `it('adjacent and identical', () => {`
- L1139: `it('three adjacent and identical', () => {`
- L1149: `it('identical but separated by text', () => {`
- L1159: `it('inside emphasis', () => {`
- L1171: `it('inside link label', () => {`
- L1184: `it('tag inside target', () => {`
- L1192: `it('unclosed', () => {`
- L1203: `describe('file link', () => {`
- L1206: `it('claims a link as a file', () => {`
- L1217: `it('leaves a declined link as a regular link', () => {`
- L1230: `it('names an empty label after the href basename', () => {`
- L1239: `it('strips query and hash from the basename', () => {`
- L1248: `it('keeps the raw segment when decoding fails', () => {`
- L1257: `it('keeps a nested label as its raw slice', () => {`
- L1266: `it('passes the title through', () => {`
- L1275: `it('claims only what the resolver claims in mixed content', () => {`
- L1294: `it('keeps parent marks inside emphasis', () => {`
- L1305: `it('never consults the resolver for images, autolinks, or linkless shapes', () => {`
- L1314: `it('can claim a resolved reference link', () => {`

## `../meowdown/packages/core/src/extensions/inline-toggle-commands.test.ts`

- L9: `describe('toggleStrong command', () => {`
- L10: `it('wraps the selection and re-derives marks', () => {`
- L19: `it('selects the content, not the delimiters, after wrapping', () => {`
- L28: `it('round-trips: toggling twice restores the text', () => {`
- L37: `it('one undo restores the original text', () => {`
- L46: `it('applies per block across a multi-paragraph selection', () => {`
- L55: `it('mixed state bolds the plain block and leaves the bold one alone', () => {`
- L64: `it('removes across blocks when everything is bold', () => {`
- L73: `it('works inside headings and blockquotes', () => {`
- L82: `it('works inside a table cell', () => {`
- L90: `it('refuses inside code blocks', () => {`
- L98: `it('skips the code block inside a wider selection', () => {`
- L110: `it('refuses on a node selection', () => {`
- L118: `describe('toggleStrong caret', () => {`
- L119: `it('plants a pair, then typing makes it real strong', () => {`
- L130: `it('toggling right back removes the planted pair', () => {`
- L139: `it('hops out of a span, so typing continues unformatted', () => {`
- L148: `it('hops into a span from its outer edge, so typing extends it', () => {`
- L157: `it('refuses inside a code span', () => {`
- L165: `describe('keymap', () => {`
- L166: `it('Mod-b toggles strong', async () => {`
- L175: `it.each([`
- L188: `it('Mod-Shift-x wraps the selection in ~~', async () => {`
- L197: `it('Mod-Shift-h wraps the selection in ==', async () => {`
- L206: `it('Mod-Shift-h unwraps an existing highlight', async () => {`
- L216: `describe('other constructs', () => {`
- L217: `it('toggleEm, toggleCode, toggleDel, toggleHighlight wrap with their delimiters', () => {`

## `../meowdown/packages/core/src/extensions/inline-toggle.test.ts`

- L45: `describe('toggle strong: add', () => {`
- L46: `it.each([`
- L95: `describe('toggle strong: remove', () => {`
- L96: `it.each([`
- L123: `describe('toggle em', () => {`
- L124: `it.each([`
- L142: `describe('toggle code', () => {`
- L143: `it.each([`
- L160: `describe('toggle del', () => {`
- L161: `it.each([`
- L172: `describe('toggle highlight', () => {`
- L173: `it.each([`
- L184: `describe('isInlineActive', () => {`
- L185: `it.each([`
- L205: `describe('caretPlan', () => {`
- L212: `it.each([`

## `../meowdown/packages/core/src/extensions/key-bindings.test.ts`

- L5: `describe('EDITOR_KEY_BINDINGS', () => {`
- L6: `it('lists every formatting and heading shortcut', () => {`

## `../meowdown/packages/core/src/extensions/link-commands.test.ts`

- L6: `describe('insertLink', () => {`
- L7: `it('wraps the selection as a link', () => {`
- L15: `it('normalizes a bare host and writes a title', () => {`
- L23: `it('refuses on an empty selection', () => {`
- L31: `describe('updateLink', () => {`
- L32: `it('rewrites the href in place', () => {`
- L41: `it('adds a title without changing the href', () => {`
- L50: `it('refuses on an autolink', () => {`
- L58: `it('does not rewrite a reference', () => {`
- L70: `describe('removeLink', () => {`
- L71: `it('keeps the label and drops the syntax', () => {`
- L80: `it('refuses on an autolink', () => {`
- L88: `it('does not unwrap a reference', () => {`

## `../meowdown/packages/core/src/extensions/link-hover.test.ts`

- L18: `describe('Markdown-link hover callback', () => {`
- L19: `it('keeps the hovered link active through an unrelated transaction', async () => {`
- L31: `it('leaves when the hovered link is deleted without pointer movement', async () => {`
- L44: `it('leaves when the hovered link destination is replaced', async () => {`

## `../meowdown/packages/core/src/extensions/link-paste.test.ts`

- L21: `describe('detectLinkUrl', () => {`
- L22: `it.each([`
- L33: `it('trims surrounding whitespace and newlines', () => {`
- L37: `it.each([`
- L49: `describe('paste a URL over a selection', () => {`
- L50: `it('wraps the selected text as a markdown link', () => {`
- L59: `it('leaves the caret after the closing paren', () => {`
- L70: `it('normalizes a www URL to an https href', () => {`
- L79: `it('links a custom scheme URI', () => {`
- L88: `it('wraps only the trimmed selection, keeping edge whitespace as text', () => {`
- L97: `it('one undo restores the plain selected text', () => {`
- L109: `describe('falls through to a plain paste', () => {`
- L110: `it('with an empty selection', () => {`
- L119: `it('when the selection spans two blocks', () => {`
- L128: `it('inside a code block', () => {`
- L137: `it('when the clipboard is not a lone URL', () => {`
- L147: `describe('ordering against embed paste', () => {`
- L157: `it('an embeddable URL pasted over a selection becomes a link, not an embed', async () => {`
- L167: `it('an embeddable URL pasted at a caret still embeds', async () => {`

## `../meowdown/packages/core/src/extensions/list-clipboard.test.ts`

- L23: `describe('list clipboard serializer', () => {`
- L24: `it('keeps the round task marker in the clipboard HTML', () => {`
- L32: `it('round-trips a round task', () => {`
- L37: `it('round-trips a checked round task', () => {`
- L42: `it('round-trips a star bullet', () => {`
- L47: `it('round-trips a parenthesis ordered item', () => {`
- L52: `it('round-trips an uppercase checked task', () => {`
- L57: `it('round-trips a wide marker gap', () => {`
- L62: `it('round-trips a square task unchanged', () => {`

## `../meowdown/packages/core/src/extensions/list-collapse.test.ts`

- L8: `describe('toggleListCollapsed', () => {`
- L9: `it('folds and unfolds a bullet that has children', () => {`
- L29: `it('cannot fold a leaf bullet', () => {`
- L36: `it('does not fold a task', () => {`
- L48: `describe('bullet fold rendering', () => {`
- L49: `it('hides descendants when collapsed and shows them when expanded', async () => {`
- L69: `it('folds when the bullet marker is clicked', async () => {`
- L89: `describe('deleting a selection that contains a folded bullet', () => {`
- L90: `it('expands hidden content before deleting', async () => {`
- L133: `it('deletes everything on the first Backspace in an AllSelection', async () => {`

## `../meowdown/packages/core/src/extensions/list.test.ts`

- L8: `describe('input rule', () => {`
- L9: `it('wraps a block into a circle checkbox task on \`+ \`', async () => {`
- L23: `it('wraps a block into a plain bullet on \`- \` (not a checkbox task)', async () => {`
- L38: `describe('commands', () => {`
- L39: `it('wrapInCircleTask makes a circle checkbox task', () => {`
- L52: `it('wrapInSquareTask makes a square checkbox task', () => {`
- L65: `it('converts a square checkbox task to a circle checkbox task, keeping checked', () => {`
- L78: `it('converts a circle checkbox task back to a square checkbox task, keeping checked', () => {`
- L91: `it('cycleCheckableList cycles plain content through square and circle tasks', () => {`
- L119: `it('cycleCheckableList preserves checked state and task-marker casing', () => {`
- L147: `it('cycleCheckableList clears latent checked state from non-task lists', () => {`
- L166: `it('cycleCheckableList changes only the closest nested list', () => {`
- L197: `it('cycleBulletOrderedList cycles plain content through bullet, ordered, and text', () => {`
- L213: `it('cycleBulletOrderedList converts a task to a plain bullet first', () => {`
- L232: `it('cycleBulletOrderedList cycles the closest nested list through ordered, plain, and bullet', () => {`
- L280: `it('cycleBulletOrderedList wraps a continuation paragraph into a bullet', () => {`
- L295: `it('cycleBulletOrderedList cycles a node-selected list through ordered and plain', () => {`
- L318: `it('cycleCheckableList wraps a continuation paragraph into a square task', () => {`
- L338: `describe('keymap', () => {`
- L343: `it('Mod-Enter cycles a square checkbox task: unchecked -> checked -> bullet', async () => {`
- L372: `it('Mod-Shift-Enter cycles a circle checkbox task: unchecked -> checked -> bullet', async () => {`
- L401: `it('Mod-Enter converts a circle checkbox task into a square checkbox task', async () => {`
- L418: `it('Mod-Shift-Enter converts a square checkbox task into a circle checkbox task', async () => {`
- L433: `it('Enter continues a circle checkbox task with another circle checkbox task', async () => {`
- L451: `it('Enter on a checked circle checkbox task continues with an unchecked one', async () => {`
- L467: `it('Enter in the middle of a circle checkbox task keeps the circle on both halves', async () => {`
- L485: `it('Enter at the start of a circle checkbox task inserts an empty circle task above', async () => {`
- L499: `it('Enter continues a square checkbox task with a square checkbox task', async () => {`
- L515: `it('Enter continues a \`_\` bullet with a \`_\` bullet', async () => {`
- L531: `it('Enter on an empty circle checkbox task still unwraps it', async () => {`
- L541: `it('Enter at the end of a collapsed bullet adds the next item below its hidden children', async () => {`
- L566: `it('Enter keeps the marker gap on the next item', async () => {`
- L588: `it('Mod-Shift-8 wraps a paragraph into a bullet and unwraps it again', async () => {`
- L610: `it('Mod-Shift-7 wraps a paragraph into an ordered list and unwraps it again', async () => {`
- L632: `it('Mod-Shift-9 wraps a paragraph into a square checkbox task and unwraps it again', async () => {`
- L654: `it('Mod-Shift-7 converts a bullet into an ordered list in place', async () => {`

## `../meowdown/packages/core/src/extensions/magic-comment.test.ts`

- L5: `describe('parseMagicComment', () => {`
- L6: `it('reads the metadata object from the canonical and spaced forms', () => {`
- L15: `it('reads height on its own', () => {`
- L19: `it('rounds width and height, and rejects junk', () => {`
- L32: `describe('formatMagicComment / stripMagicComment', () => {`
- L33: `it('round-trips through the canonical form', () => {`
- L39: `it('strips only a trailing comment', () => {`
- L44: `it('strips a whole stacked run of trailing comments', () => {`

## `../meowdown/packages/core/src/extensions/mark-mode.test.ts`

- L24: `describe('focus mode', () => {`
- L25: `it("sets data-mark-mode attribute to 'focus'", async () => {`
- L31: `it('reveals both ** when the cursor is inside **bold**', () => {`
- L62: `it('reveals nothing when the cursor is in plain text', () => {`
- L87: `it('reveals only the adjacent marker pair, not unrelated bolds', () => {`
- L131: `it('reveals nested wrappers (***foo***)', () => {`
- L181: `it('reveals all six stars after the italic unit forms around an existing bold', () => {`
- L240: `it('reveals every link marker when the cursor is in the text', () => {`
- L289: `it('reveals every link marker when the cursor is in the url', () => {`
- L338: `it('reveals nothing when the cursor is inside a bare autolink', () => {`
- L360: `it('reveals the angle brackets when the cursor is inside <url>', () => {`
- L394: `it('reveals when the cursor sits right after the closing **', () => {`
- L424: `it('reveals both units when the cursor sits on their shared boundary', () => {`
- L473: `it('reveals both identical adjacent links from their shared boundary', () => {`
- L560: `it('reveals both identical adjacent angle autolinks from their shared boundary', () => {`
- L615: `it('reveals the units at both edges of a multi-char selection', () => {`
- L665: `it('reveals the unit a multi-char selection sits inside', () => {`
- L694: `it('reveals nothing inside a wikilink (the source is one atom, never revealed)', () => {`
- L727: `it('reveals nothing inside a wikilink next to a markdown link', () => {`
- L787: `it('reveals a bold unit whose closing ** touches a wikilink', () => {`
- L838: `it('reveals only the first of two identical adjacent links', () => {`
- L915: `it('reveals nothing inside a #tag (tags have no syntax to reveal)', () => {`
- L929: `it('reveals the whole link when the cursor sits right after the closing )', () => {`
- L979: `it('reveals the angle autolink when the cursor sits right after the closing >', () => {`
- L1013: `it('reveals the whole outer unit even when the cursor is in its bold-only region', () => {`
- L1069: `it('reveals only the link the cursor is in, not its adjacent neighbor', () => {`
- L1146: `it('reveals nothing when the cursor is inside a code block', () => {`
- L1161: `it('renders an inline image as an atomic mark view, source kept in its content', () => {`
- L1214: `it('updates the reveal as the cursor moves between paragraphs', () => {`
- L1277: `it.skipIf(`
- L1302: `it('ArrowLeft from an empty paragraph lands at the end of a trailing bold unit', async () => {`
- L1319: `it('ArrowRight from an empty paragraph lands at the start of a leading bold unit', async () => {`
- L1335: `it('Shift-ArrowLeft from an empty paragraph extends to the end of a trailing bold unit', async () => {`
- L1351: `describe('hide mode', () => {`
- L1352: `it("sets data-mark-mode attribute to 'hide'", async () => {`
- L1358: `it('never reveals markers, even with the cursor inside bold', () => {`
- L1383: `it('never reveals markers with the cursor inside a wikilink', () => {`
- L1416: `it('handles backspace correctly around bold', async () => {`
- L1434: `describe('show mode', () => {`
- L1435: `it("sets data-mark-mode attribute to 'show'", async () => {`
- L1441: `it('never reveals markers (syntax is always visible via CSS, not decorations)', () => {`
- L1467: `describe('mark mode lifecycle', () => {`
- L1471: `it('carries data-mark-mode from the first paint', () => {`
- L1476: `it('honors the markMode extension option', () => {`
- L1481: `it('switches the mode with the setMarkMode command', async () => {`
- L1489: `it('keeps the mode when undo reverts a doc change made before the switch', () => {`
- L1500: `it('creates no undo entry for a bare mode switch', () => {`

## `../meowdown/packages/core/src/extensions/math.test.ts`

- L22: `describe('math preview rendering', () => {`
- L23: `it('renders KaTeX output when the caret is elsewhere in focus mode', async () => {`
- L31: `it('renders KaTeX output when the caret is elsewhere in hide mode', async () => {`
- L39: `it('never renders a preview in show mode', async () => {`
- L46: `it('renders an error for invalid TeX without breaking the editor', async () => {`
- L53: `it('re-renders the preview after the formula is edited', async () => {`
- L65: `describe('math source reveal', () => {`
- L66: `it('reveals the source when the caret is inside, in focus mode', async () => {`
- L75: `it('reveals the source when the caret is inside, even in hide mode', async () => {`
- L83: `it('reveals at the unit boundary, before the opening dollar', async () => {`
- L92: `it('does not reveal bold in hide mode (the math reveal must not leak)', () => {`
- L97: `it('restores the preview when the caret leaves the unit', async () => {`
- L106: `it('reveals the source after clicking the preview', async () => {`
- L116: `describe('math caret behavior', () => {`
- L117: `it('walks through the revealed source with ArrowRight in focus mode', async () => {`
- L132: `it('walks through the revealed source with ArrowRight in hide mode', async () => {`
- L147: `it('typing at the revealed boundary grows the formula', async () => {`
- L159: `it('Backspace at the closing dollar dissolves the unit into plain text', async () => {`
- L167: `it('undo restores a dissolved unit', async () => {`
- L182: `describe('math DOM structure', () => {`
- L183: `it('renders the unit as a mark view with a preview and the source content', () => {`
- L223: `it('nests the reveal decoration inside the mark view when the caret is inside', () => {`
- L270: `describe('math source spellcheck exemption', () => {`
- L271: `it('renders the math source with spellcheck off', async () => {`

## `../meowdown/packages/core/src/extensions/move-block.test.ts`

- L13: `describe('defineMoveBlock', () => {`
- L14: `it('Alt-ArrowUp swaps a list item with the one above', async () => {`
- L28: `it('Alt-ArrowDown swaps a list item with the one below', async () => {`
- L42: `it('moves a list item together with its nested children', async () => {`
- L60: `it('moves a checked task item preserving its marker', async () => {`
- L74: `it('Alt-ArrowUp swaps a plain paragraph with the block above', async () => {`
- L83: `it('Alt-ArrowDown swaps a paragraph with a heading below', async () => {`
- L92: `it('keeps the caret inside the moved block', async () => {`
- L106: `it('moves a node-selected block, keeping it selected', async () => {`
- L120: `it('moves the whole blockquote when the caret sits inside it', async () => {`
- L135: `it('does nothing at the document top and bottom', async () => {`
- L149: `it('does nothing inside a table cell', async () => {`
- L167: `it('swapTopLevelBlock rejects a selection spanning two top-level blocks', () => {`

## `../meowdown/packages/core/src/extensions/node-names.test.ts`

- L7: `it('editor schema node names match NODE_NAMES exactly', () => {`

## `../meowdown/packages/core/src/extensions/paragraph.test.ts`

- L12: `describe('soft line break', () => {`
- L13: `it('declares whitespace: pre', () => {`
- L18: `it('keeps a soft line break through a DOM round-trip', () => {`

## `../meowdown/packages/core/src/extensions/pending-replacement.test.ts`

- L18: `describe('pending replacement', () => {`
- L19: `it('stages and accumulates text without touching the document', () => {`
- L39: `it('discard clears the stage and leaves the document byte-identical', () => {`
- L54: `it('accepts a single-paragraph result inline, keeping the paragraph whole', () => {`
- L69: `it('accepts a multi-block result as blocks', () => {`
- L82: `it('accepts with a mode override (insert-below on a replace stage)', () => {`
- L95: `it('accepts in append mode after the source block', () => {`
- L108: `it('refuses to accept an empty stage', () => {`
- L120: `it('remaps the staged range through other edits', () => {`
- L139: `it('discards a replace stage when its source range is deleted', () => {`
- L153: `it('restarting the stage resets the accumulated text (retry)', () => {`
- L166: `it('rejects an out-of-range or empty replace stage', () => {`
- L178: `it('reports updates and the outcome to a handler', () => {`
- L204: `it('Escape discards the stage', async () => {`

## `../meowdown/packages/core/src/extensions/reference-links-transaction.bench.ts`

- L130: `describe('ordinary edit', () => {`
- L141: `describe('definition keystroke', () => {`
- L153: `describe('definition edit and flush', () => {`
- L183: `describe('reference index scan', () => {`

## `../meowdown/packages/core/src/extensions/reference-links.test.ts`

- L13: `describe('normalizeReferenceLabel', () => {`
- L14: `it('collapses whitespace and applies Unicode case folding', () => {`
- L19: `it('keeps escaped punctuation distinct', () => {`
- L24: `describe('parseReferenceDefinition', () => {`
- L25: `it('parses an angle destination and title', () => {`
- L33: `it('parses a title on the following line', () => {`
- L41: `it('decodes character references', () => {`
- L49: `it('accepts an empty destination', () => {`
- L57: `it('rejects ordinary and incomplete text', () => {`
- L63: `it('accepts the longest label supported by Lezer', () => {`
- L73: `it('rejects a label longer than the CommonMark limit', () => {`
- L78: `it('skips definition-shaped blocks longer than the parser budget', () => {`
- L84: `describe('collectReferenceDefinitions', () => {`
- L85: `it('collects definitions document-wide and keeps the first duplicate', () => {`
- L103: `it('rejects headings, table cells, and the task marker paragraph', () => {`
- L131: `it('reuses cached definitions for unchanged paragraph nodes', () => {`
- L139: `describe('updateReferenceDefinitions', () => {`
- L140: `it('rebuilds after a list kind AttrStep changes definition eligibility', () => {`
- L154: `it('reuses the index after an unrelated list AttrStep', () => {`

## `../meowdown/packages/core/src/extensions/reference-restyle.test.ts`

- L34: `describe('deferred reference restyle', () => {`
- L35: `it('resolves references synchronously on mount', () => {`
- L40: `it('keeps the previous href until the debounce flushes', async () => {`
- L51: `it('coalesces a definition-edit burst into one dependent pass', async () => {`
- L66: `it('flushes deterministically through the test helper', () => {`
- L74: `it('coalesces changed keys from multiple definitions', () => {`
- L95: `it('defers references when a container definition appears', async () => {`

## `../meowdown/packages/core/src/extensions/schema.test.ts`

- L5: `describe('getNodeBuilders', () => {`
- L6: `it('builds a node from the shared schema', () => {`
- L13: `it('returns a memoized instance', () => {`
- L18: `describe('getMarkBuilders', () => {`
- L19: `it('applies a mark to its children', () => {`
- L26: `it('returns a memoized instance', () => {`

## `../meowdown/packages/core/src/extensions/scroll-to-selection.test.ts`

- L48: `describe.each(ALL_MODES)('scroll to an atom mark boundary in %s mode', (mode) => {`
- L49: `it('scrolls to the caret after a trailing wikilink', () => {`
- L59: `it('scrolls to the caret before a leading wikilink', () => {`
- L69: `it('scrolls to the head of a selection that swallowed a wikilink', () => {`
- L79: `it('does not scroll while the caret is already visible', () => {`
- L92: `describe('scroll to a hidden run boundary in hide mode', () => {`
- L95: `it('scrolls to the caret after trailing hidden syntax', () => {`
- L107: `describe('the default scroll path', () => {`
- L108: `it('still scrolls to a plain text caret', () => {`
- L120: `describe('scrollMargin', () => {`
- L121: `it('keeps the configured margin below the caret', () => {`

## `../meowdown/packages/core/src/extensions/select-doc-boundary.test.ts`

- L12: `describe('Meta-ArrowUp / Meta-ArrowDown', () => {`
- L13: `it('moves the caret to the document start when the document begins with a task list', async () => {`
- L31: `it('moves the caret to the document start when the document begins with a bullet list', async () => {`
- L49: `it('moves the caret to the document start in a plain paragraph document, even right after focus', async () => {`
- L60: `it('rests before a hidden run when the document starts with one', async () => {`
- L71: `it('moves the caret to the document end when the document ends with a task list', async () => {`
- L89: `it('extends the selection to the document start on Shift-Meta-ArrowUp', async () => {`
- L101: `it('extends the selection to the document end on Shift-Meta-ArrowDown', async () => {`
- L113: `it('does not fire the exit-boundary handler from the document start', async () => {`

## `../meowdown/packages/core/src/extensions/soft-break.test.ts`

- L21: `describe('one press inserts a soft break', () => {`
- L22: `it('inserts a newline in the middle of a paragraph', async () => {`
- L31: `it('leaves the caret after the newline', async () => {`
- L40: `it('indents the continuation line of a list item', async () => {`
- L48: `it('carries the blockquote marker onto the continuation line', async () => {`
- L56: `it('keeps one inline unit across a break inside it', async () => {`
- L66: `it('replaces a non-empty selection', async () => {`
- L75: `describe('a second press splits the block', () => {`
- L76: `it('splits a paragraph and consumes the pending break', async () => {`
- L85: `it('leaves the caret at the start of the new paragraph', async () => {`
- L95: `it('splits a bullet item into two items', async () => {`
- L104: `it('keeps the task kind on the new item', async () => {`
- L113: `it('keeps the ordered marker on the new item', async () => {`
- L122: `it('keeps a nested item at its own depth', async () => {`
- L139: `it('opens a new item after a collapsed bullet without moving its children', async () => {`
- L156: `it('splits a blockquote into two quoted paragraphs', async () => {`
- L165: `it('opens an empty paragraph at the end of a paragraph', async () => {`
- L174: `it('splits an empty paragraph into two', async () => {`
- L183: `it('splits on a break that opens the paragraph', async () => {`
- L191: `it('splits beside a hidden unit in hide mode', async () => {`
- L200: `it('splits from the end of the line in front of a break', async () => {`
- L208: `it('lands the caret in the same place from either side of a break', async () => {`
- L217: `it('splits a list item from the end of the line in front of a break', async () => {`
- L225: `it('undoes both presses in one step', async () => {`
- L236: `describe('a code block behaves like Enter', () => {`
- L237: `it('writes a newline on every press', async () => {`
- L246: `it('matches what Enter writes at the same caret', async () => {`
- L256: `describe('declines where markdown cannot hold a break', () => {`
- L275: `it('leaves a body cell alone', async () => {`
- L282: `it('leaves a header cell alone', async () => {`
- L289: `it('leaves a heading alone', async () => {`
- L298: `describe('the insertSoftBreak command', () => {`
- L299: `it('matches two key presses', () => {`
- L308: `it('reports the guard through canExec', () => {`
- L317: `it('reports canExec on a caret that would split', () => {`
- L325: `describe('rendering', () => {`
- L326: `it('paints the break as a new line', async () => {`

## `../meowdown/packages/core/src/extensions/substitution.test.ts`

- L27: `describe('substitutions', () => {`
- L28: `it.each(REPLACEMENTS)(`
- L44: `it.each(REPLACEMENTS)(`
- L59: `it.each(REPLACEMENTS)(`
- L75: `it('uses normal Backspace behavior after more text is typed', async () => {`
- L85: `it.each([`
- L98: `it.each([`
- L112: `it('uses the matching suffix in \`->>\`', async () => {`
- L122: `it.each([`
- L144: `it.each([`
- L166: `it('keeps the horizontal-rule input rule working', async () => {`
- L176: `it('replaces the final dash pair after nonempty text', async () => {`
- L186: `it('undoes only the latest replacement', async () => {`

## `../meowdown/packages/core/src/extensions/table-column-align.test.ts`

- L85: `describe('table align sync', () => {`
- L86: `it('inherits column alignment when a row is inserted', () => {`
- L100: `it('leaves an inserted column unaligned', () => {`
- L113: `it('restores a data cell align that drifts from the alignment row', () => {`
- L132: `describe('setTableColumnAlign', () => {`
- L133: `it('aligns the column at the caret', () => {`
- L147: `it('aligns every column a cell selection touches', () => {`
- L162: `it('clears alignment with null', () => {`
- L176: `it('cannot exec outside a table', () => {`
- L184: `it('undoes the alignment and its sync in one step', () => {`
- L199: `describe('getTableColumnAlign', () => {`
- L200: `it('reads the alignment of the caret column', () => {`
- L208: `it('returns undefined for an unaligned column', () => {`
- L216: `it('returns undefined outside a table', () => {`

## `../meowdown/packages/core/src/extensions/table.test.ts`

- L11: `describe('table', () => {`
- L12: `it('deletes the whole selected table when Backspace', async () => {`
- L34: `it('clears only the selected cells when Backspace over a partial cell selection', async () => {`
- L56: `it('deletes the whole table when Backspace over a full cell selection', async () => {`
- L78: `describe('table cell is inline-only', () => {`
- L79: `it('cell schema forbids block children', () => {`
- L95: `it('block-creating commands add nothing inside a cell', () => {`
- L118: `it('keeps block-creating commands enabled outside a cell', () => {`
- L132: `it('bullet list input rule is inert inside a cell', async () => {`
- L143: `it('horizontal rule input rule is inert inside a cell', async () => {`
- L154: `it('horizontal rule input rule still fires outside a cell', async () => {`
- L164: `it('Enter does not split a cell into two paragraphs', async () => {`

## `../meowdown/packages/core/src/extensions/tag-click.test.ts`

- L7: `describe('findTagAt', () => {`
- L8: `it('finds the tag name covering a position', () => {`
- L16: `it('returns undefined in plain text', () => {`
- L23: `it('returns the right tag when two tags are adjacent', () => {`

## `../meowdown/packages/core/src/extensions/tweet.test.ts`

- L5: `describe('matchTweet', () => {`
- L6: `it.each([`
- L14: `it('declines profile and non-tweet URLs', () => {`
- L19: `it('describes the first-party embed iframe with the tweet id', () => {`

## `../meowdown/packages/core/src/extensions/view-attributes.test.ts`

- L10: `describe('defineViewAttributes', () => {`
- L11: `it('gives the editable root the content class from the first paint', async () => {`
- L17: `it('applies the gutter padding the content class carries', () => {`
- L22: `it('adds a host class alongside the built-in ones', async () => {`
- L31: `it('drops the host class when the extension is removed', async () => {`

## `../meowdown/packages/core/src/extensions/virtual-caret-line-break.test.ts`

- L97: `describe('virtual caret at a code block line break', () => {`
- L106: `it('draws at the end of the line before the break', async () => {`
- L113: `it('draws at the start of the line after the break', async () => {`
- L120: `it('draws at the start of an indented line after the break', async () => {`
- L127: `it('draws at the start of a line whose first token opens a highlight span', async () => {`
- L134: `it('draws at the start of a line in an unhighlighted code block', async () => {`
- L140: `it('draws the two sides of one break at two different points', async () => {`
- L157: `describe('virtual caret on an empty line', () => {`
- L166: `it('draws on an empty line between two code lines', async () => {`
- L172: `it('draws at the start of the line after an empty line', async () => {`
- L178: `it('draws on the empty last line of a code block', async () => {`
- L184: `it('draws on the empty first line of a code block', async () => {`
- L191: `describe('virtual caret at a paragraph soft line break', () => {`
- L200: `it('draws at the end of the line before a soft break', async () => {`
- L206: `it('draws at the start of the line after a soft break', async () => {`
- L212: `it('draws on an empty soft line', async () => {`
- L219: `describe('virtual caret at a soft wrap boundary', () => {`
- L243: `it('keeps the native measurement where a soft wrap offers two points', async () => {`

## `../meowdown/packages/core/src/extensions/virtual-caret.test.ts`

- L25: `describe('virtual caret rendering', () => {`
- L26: `it('draws a visible caret with a height when focused', async () => {`
- L34: `it('draws in every mark mode', async () => {`
- L42: `it('hides the caret when the editor is blurred', async () => {`
- L49: `it('hides the caret for a range selection', async () => {`
- L57: `it('hides the caret when an atom is selected', async () => {`
- L65: `it('restarts the blink animation on caret movement', async () => {`
- L76: `it('follows the selection horizontally', async () => {`
- L87: `it('keeps typing working with the transparent native caret', async () => {`
- L93: `it('moves to the new code-block line immediately after Enter', async () => {`
- L135: `describe('virtual caret geometry next to hidden runs (hide mode)', () => {`
- L136: `it('is visible and full-height right after a hidden closing run', async () => {`
- L144: `it('is visible at a unit outer edge at paragraph start', async () => {`
- L152: `it('draws the two coincident boundary positions at one x', async () => {`
- L164: `it('is visible inside an empty paragraph', async () => {`
- L173: `describe('virtual caret next to atom marks', () => {`
- L190: `it('is visible at the end of a paragraph holding only a wikilink', async () => {`
- L196: `it('is visible at the start of a paragraph holding only a wikilink', async () => {`
- L202: `it('is visible at the end of a wikilink preceded by text', async () => {`
- L208: `it('is visible at the start of a wikilink followed by text', async () => {`
- L214: `it('is visible at the end of a wikilink followed by text', async () => {`
- L220: `it('is visible between two adjacent wikilinks', async () => {`
- L226: `it('is visible at the end of a lone wikilink in show mode', async () => {`
- L232: `it('draws the caret flush against the wikilink label right edge', async () => {`
- L241: `it('draws the caret flush against the wikilink label left edge', async () => {`
- L250: `it('is visible at the end of a paragraph holding only a file pill', async () => {`
- L257: `describe('virtual caret at a line-wrapped wikilink', () => {`
- L265: `it('keeps the caret one line tall at the start of a paragraph holding only a wrapped wikilink', async () => {`
- L275: `it('keeps the caret one line tall at the end of a paragraph holding only a wrapped wikilink', async () => {`
- L286: `it('draws the end-of-paragraph caret on the last line fragment', async () => {`
- L299: `describe('virtual caret when the editor reflows', () => {`
- L318: `it('repositions when text below the caret rewraps without moving the caret line', async () => {`
- L332: `describe('virtual caret paints above code backgrounds', () => {`
- L346: `it('stays visible inside a code block', async () => {`
- L355: `it('stays visible inside inline code', async () => {`
- L365: `describe('virtual caret tails (hide mode)', () => {`
- L366: `it('shows a right tail after a closing run', async () => {`
- L372: `it('shows a left tail before a closing run', async () => {`
- L378: `it('shows tails at the opening edges', async () => {`
- L391: `it('shows no tail in plain text', async () => {`
- L398: `it('shows no tail in focus mode', async () => {`
- L405: `it('flips the tail while arrowing across a boundary', async () => {`
- L420: `describe('virtual caret under touch input', () => {`
- L433: `it('keeps the virtual caret before any touch arrives', async () => {`
- L440: `it('hands a visible text position to the native caret', async () => {`
- L448: `it('falls back to the virtual caret beside hidden syntax', async () => {`
- L456: `it('returns to the virtual caret on keyboard navigation', async () => {`
- L469: `it('leaves a range selection fully native', async () => {`

## `../meowdown/packages/core/src/extensions/wiki-embed-editor.test.ts`

- L27: `describe('wiki embed editor integration', () => {`
- L28: `it('keeps unresolved embeds literal and editable', async () => {`
- L34: `it('uses image rendering and image click hooks', async () => {`
- L48: `it('uses file pills and file click hooks', async () => {`
- L62: `it('uses wikilink chips and wikilink click hooks for note fallbacks', async () => {`

## `../meowdown/packages/core/src/extensions/wiki-embed.test.ts`

- L5: `describe('parseWikiEmbed', () => {`
- L6: `it('parses a plain target', () => {`
- L15: `it('parses an alias', () => {`
- L24: `it('parses width-only sizing', () => {`
- L33: `it('parses width and height sizing', () => {`
- L42: `it('treats invalid and zero sizes as aliases', () => {`
- L48: `it('formats a persisted image size', () => {`
- L54: `it('gets a decoded basename without a heading fragment', () => {`

## `../meowdown/packages/core/src/extensions/wikilink-click.test.ts`

- L15: `describe('parseWikilink', () => {`
- L16: `it.each([`
- L26: `describe('findWikilinkAt', () => {`
- L27: `it('finds the wikilink covering a position', () => {`
- L35: `it('returns undefined in plain text', () => {`
- L42: `it('resolves adjacent wikilinks to distinct targets by position', () => {`
- L54: `describe('wikilink click callback', () => {`
- L69: `it('fires with the target when the label is clicked', async () => {`
- L83: `it('reports a held modifier on a click', async () => {`
- L99: `it('passes the originating MouseEvent', async () => {`
- L109: `it('does not fire when plain text is clicked', async () => {`
- L118: `it('resolves adjacent wide aliases from their own hidden content holders', async () => {`

## `../meowdown/packages/core/src/extensions/wikilink-hover.test.ts`

- L18: `describe('wikilink hover callback', () => {`
- L19: `it('emits one enter while moving among one link label and its children', async () => {`
- L40: `it('leaves one adjacent link before entering the next', async () => {`
- L59: `it('leaves when the hovered link is deleted without pointer movement', async () => {`
- L69: `it('leaves when the hovered link is replaced', async () => {`
- L79: `it('keeps the same hovered element active through an unrelated transaction', async () => {`
- L89: `it('leaves when the editor is destroyed', async () => {`

## `../meowdown/packages/core/src/extensions/wikilink-insert-caret.test.ts`

- L32: `describe.each(ALL_MODES)('typing after an inserted wikilink in %s mode', (mode) => {`
- L33: `it('places the caret after the wikilink', () => {`
- L39: `it('types the next character after the wikilink, not before it', async () => {`
- L49: `it('keeps typing after the wikilink across several characters', async () => {`
- L59: `it('types after an alias wikilink, after its label', async () => {`
- L69: `it('types after the second of two adjacent wikilinks', async () => {`
- L82: `describe.each(ALL_MODES)('typing before an inserted wikilink in %s mode', (mode) => {`
- L83: `it('lands a character typed before the wikilink between A and the link', async () => {`
- L108: `describe.each(ALL_MODES)('typing before a wikilink at the paragraph start in %s mode', (mode) => {`
- L109: `it('types before a lone wikilink', async () => {`
- L118: `it('keeps typing before the wikilink across several characters', async () => {`
- L127: `it('types before a leading wikilink followed by text', async () => {`
- L136: `it('types between two adjacent wikilinks', async () => {`
- L148: `describe.each(ALL_MODES)('typing over a selected wikilink in %s mode', (mode) => {`
- L149: `it('replaces a selected lone wikilink', async () => {`
- L161: `it('replaces a selected leading wikilink followed by text', async () => {`
- L173: `it('replaces a selected wikilink in the middle of text', async () => {`
- L188: `describe('inserted wikilink rendering', () => {`
- L189: `it('renders the target as the visible label in hide mode', async () => {`
- L195: `it('renders the alias as the visible label in hide mode', async () => {`
- L201: `it('renders the label in show mode', async () => {`

## `../meowdown/packages/core/src/extensions/wikilink-trigger.test.ts`

- L36: `describe('defineWikilinkTrigger', () => {`
- L37: `it("'[' wraps a selected word into an open wikilink", async () => {`
- L46: `it("'[' with an empty selection types a literal bracket", async () => {`
- L55: `it("'[' drops a leading single bracket from the selection", async () => {`
- L64: `it("'[' over a selection already starting with '[[' falls through to typing", async () => {`
- L74: `it("'[' over a selection spanning two blocks types normally", async () => {`
- L83: `it("'[' in a code block types a literal bracket", async () => {`
- L92: `it('Mod-Shift-k inserts an open wikilink at an empty selection', async () => {`
- L101: `it('Mod-Shift-k wraps a selection like the bracket does', async () => {`
- L110: `it('uses visible text from a formatted selection as the query', async () => {`
- L121: `it('drops math delimiters from a formatted selection query', async () => {`
- L132: `it('keeps autocomplete matched while ArrowRight includes existing text', async () => {`
- L151: `it('does not activate autocomplete while ArrowRight crosses a loaded incomplete wikilink', async () => {`

## `../meowdown/packages/core/src/extensions/wikilink.test.ts`

- L33: `describe.each(ALL_MODES)('wikilink rendering in %s mode', (mode) => {`
- L34: `it('renders the target as the label', async () => {`
- L41: `it('renders one label per unit when two identical wikilinks touch', async () => {`
- L49: `it('renders the alias as the label', async () => {`
- L56: `it('renders the label in show mode', async () => {`
- L64: `it('renders the preview as a plain inline', async () => {`
- L78: `describe.each(ALL_MODES)('wikilink caret navigation in %s mode', (mode) => {`
- L81: `it('ArrowRight selects the wikilink, then steps past into CD', async () => {`
- L95: `it('ArrowLeft selects the wikilink, then collapses to its left edge', async () => {`
- L107: `it('Backspace deletes the wikilink as a unit, plain text one char', async () => {`
- L126: `describe.each(LABEL_MODES)('wikilink selection ring in %s mode', (mode) => {`
- L129: `it('rings the label only while the wikilink is selected', async () => {`
- L144: `it('rings the label when selected from its right edge', async () => {`
- L157: `describe('wikilink vertical caret navigation', () => {`
- L173: `it('can ArrowDown from the first paragraph to the last paragraph in hide mode', async () => {`
- L203: `it('can ArrowDown from the first paragraph to the last paragraph in show mode', async () => {`
- L233: `it('can ArrowDown from the first paragraph to the last paragraph in focus mode', async () => {`

## `../meowdown/packages/core/src/extensions/wililink-fuzz.test.ts`

- L121: `describe('caret fuzz over a wikilink outline in focus mode', () => {`
- L122: `it('records Backspace at every caret position', async () => {`
- L508: `it('records Space at every caret position', async () => {`
- L894: `it('records Enter at every caret position', async () => {`
- L1322: `describe('caret fuzz over a wikilink outline in hide mode', () => {`
- L1323: `it('records Backspace at every caret position', async () => {`
- L1709: `it('records Space at every caret position', async () => {`
- L2095: `it('records Enter at every caret position', async () => {`
- L2523: `describe('caret fuzz over a wikilink inside a paragraph in focus mode', () => {`
- L2524: `it('records Backspace at every caret position', async () => {`
- L2658: `it('records Space at every caret position', async () => {`
- L2796: `it('records Enter at every caret position', async () => {`
- L2963: `describe('caret fuzz over two adjacent wikilinks in focus mode', () => {`
- L2964: `it('records Backspace at every caret position', async () => {`
- L3131: `it('records Space at every caret position', async () => {`
- L3302: `it('records Enter at every caret position', async () => {`

## `../meowdown/packages/core/src/extensions/youtube.test.ts`

- L5: `describe('matchYouTube', () => {`
- L8: `it('matches the standard watch URL', () => {`
- L12: `it.each([`
- L21: `it('carries a start time (t=90, t=1m30s)', () => {`
- L28: `it('declines non-YouTube and malformed ids', () => {`
- L34: `it('describes a nocookie embed iframe', () => {`
- L41: `it('passes the start time through to the embed src', () => {`

## `../meowdown/packages/core/src/utils/backticks.test.ts`

- L5: `describe('longestBacktickRun', () => {`
- L6: `it.each([`
- L18: `it('clamps to min', () => {`

## `../meowdown/packages/core/src/utils/display-text.test.ts`

- L7: `describe('getTextblockDisplayText', () => {`
- L8: `it('keeps plain text and drops inline syntax runs', () => {`
- L15: `it('replaces a wikilink with its display text, falling back to the target', () => {`
- L22: `it('replaces an image with its alt text and math with its formula', () => {`
- L29: `it('replaces a file pill with its name', () => {`
- L36: `it('replaces both of two adjacent identical atoms', () => {`
- L43: `it('splits adjacent identical atoms after a JSON round trip', () => {`

## `../meowdown/packages/core/src/utils/format-file-size.test.ts`

- L5: `describe('formatFileSize', () => {`
- L6: `it('shows bytes below 1000 as-is', () => {`
- L12: `it('uses decimal units', () => {`
- L19: `it('keeps one decimal below 10 and drops a trailing zero', () => {`
- L26: `it('rounds to integers from 10 up', () => {`
- L32: `it('moves to the next unit when rounding would reach 1000', () => {`

## `../meowdown/packages/core/src/utils/selected-text.test.ts`

- L7: `describe('getSelectedText', () => {`
- L8: `it('returns bare text for a selection inside one textblock', () => {`
- L15: `it('returns an empty string for an empty selection', () => {`
- L22: `it('keeps block markers for a multi-block selection', () => {`
- L35: `it('keeps list markers when the selection spans list items partially', () => {`

## `../meowdown/packages/core/src/utils/top-level-block-boundary.test.ts`

- L7: `describe('top-level block boundary', () => {`
- L8: `it('recognizes the start of a top-level textblock', () => {`
- L17: `it('recognizes the end of a top-level textblock', () => {`
- L26: `it('checks every ancestor at the start of a nested textblock', () => {`
- L35: `it('checks every ancestor at the end of a nested textblock', () => {`

## `../meowdown/packages/eslint-rules/src/no-type-name-literal.test.ts`

- No direct `describe`, `it`, or `test` call matched. Classification must rely on the file read or harness role.

## `../meowdown/packages/markdown/src/autolink-tld.test.ts`

- L5: `describe('hostFromUrl', () => {`
- L6: `it('returns the whole string when there is no path', () => {`
- L10: `it('strips the path', () => {`
- L15: `describe('isLinkableBareHost', () => {`
- L25: `it(\`links ${host}\`, () => {`
- L52: `it(\`rejects ${host}\`, () => {`
- L58: `describe('getAutolinkHref', () => {`
- L59: `it('keeps a URL with a scheme', () => {`
- L63: `it('adds mailto for an email', () => {`
- L67: `it('adds https for a www URL', () => {`
- L71: `it('adds https for a linkable bare domain', () => {`
- L75: `it('declines a non-linkable bare domain', () => {`

## `../meowdown/packages/markdown/src/bare-autolink.test.ts`

- L15: `describe('bareAutolink', () => {`
- L16: `describe('detects a bare domain', () => {`
- L17: `it('at the start of the text', () => {`
- L21: `it('after whitespace', () => {`
- L25: `it('with a subdomain and a path', () => {`
- L29: `it('right after an opening paren', () => {`
- L34: `describe('ignores text that is not a linkable bare domain', () => {`
- L45: `it(text, () => {`
- L51: `describe('trims trailing punctuation', () => {`
- L52: `it('drops a sentence-ending period', () => {`
- L56: `it('drops a trailing comma', () => {`
- L60: `it('drops an unbalanced closing paren', () => {`
- L64: `it('keeps balanced parens inside the path', () => {`
- L68: `it('drops a trailing entity reference', () => {`
- L73: `describe('does not start mid-token or re-split other autolinks', () => {`
- L74: `it('treats an @ host as an email, not a bare domain', () => {`
- L78: `it('leaves a www. autolink as a single URL', () => {`
- L82: `it('leaves a scheme autolink as a single URL', () => {`
- L86: `it('does not link the label of an explicit link', () => {`
- L90: `it('does not link inside inline code', () => {`
- L94: `it('does not link inside a wikilink', () => {`

## `../meowdown/packages/markdown/src/hashtag.test.ts`

- L25: `describe('hashtag inline parser', () => {`
- L26: `describe('recognizes', () => {`
- L55: `it(\`${JSON.stringify(input)} -> ${tags.join(' ')}\`, () => {`
- L61: `describe('rejects', () => {`
- L85: `it(JSON.stringify(input), () => {`
- L91: `describe('stops at the first non-tag character', () => {`
- L102: `it(\`${JSON.stringify(input)} -> ${tags.join(' ')}\`, () => {`
- L108: `it('nests inside emphasis with exact offsets', () => {`
- L118: `it('is never produced by gfmBlockOnlyParser', () => {`

## `../meowdown/packages/markdown/src/inline.test.ts`

- L27: `describe('emphasis', () => {`
- L28: `it('can parses emphasis', () => {`
- L43: `describe('link', () => {`
- L44: `it('can parse link', () => {`
- L57: `it('can parse link with text', () => {`
- L70: `it('can parse link with title', () => {`
- L90: `it('parses a shortcut reference link with two LinkMarks', () => {`
- L100: `it('parses a full reference link with a LinkLabel', () => {`
- L111: `it('parses a collapsed reference link with an empty LinkLabel', () => {`
- L122: `it('parses an empty inline destination with four LinkMarks', () => {`
- L134: `it('does not attach a space-separated paren as a destination', () => {`
- L144: `it('parses nested syntax inside a shortcut reference', () => {`
- L157: `it('parses only the inner brackets of nested bracket pairs', () => {`
- L167: `it('parses the inner brackets of an unclosed wikilink as a link', () => {`
- L178: `describe('image', () => {`
- L179: `it('can parse image', () => {`
- L192: `it('can parse image with title', () => {`
- L206: `it('parses a reference-style image as an Image with a LinkLabel', () => {`
- L217: `it('can parse image with inline HTML comment', () => {`
- L231: `it('parses a comment after a linked image as a direct child of the Link', () => {`
- L252: `describe('highlight', () => {`
- L253: `it('wraps the run in Highlight with HighlightMark delimiters', () => {`
- L263: `it('finds a highlight surrounded by text', () => {`
- L273: `it('allows nested inline syntax inside a highlight', () => {`
- L286: `it('nests with strikethrough both ways', () => {`
- L309: `it('does not highlight space-flanked equals runs', () => {`
- L322: `it('does not consume a third equals as a delimiter', () => {`

## `../meowdown/packages/markdown/src/math.test.ts`

- L43: `describe('math inline parser', () => {`
- L44: `describe('recognizes', () => {`
- L63: `it(\`${JSON.stringify(input)} -> ${expressions.join(' ')}\`, () => {`
- L69: `describe('rejects', () => {`
- L92: `it(JSON.stringify(input), () => {`
- L98: `describe('claims the content atomically', () => {`
- L99: `it('never produces Emphasis inside math', () => {`
- L107: `it('never produces Strikethrough inside math', () => {`
- L114: `it('does not pair emphasis across a math boundary', () => {`
- L118: `it('closes double-dollar math before a trailing dollar run', () => {`
- L123: `it('produces an InlineMath with two InlineMathMark children', () => {`
- L133: `it('produces double-dollar marks covering both dollars', () => {`
- L143: `it('is never produced by gfmBlockOnlyParser', () => {`
- L192: `describe('math block parser', () => {`
- L193: `it('parses a dollar fence with marks and code text', () => {`
- L205: `it('parses a multi-line formula with an interior blank line', () => {`
- L220: `it('runs to the end of input when unclosed', () => {`
- L231: `it('interrupts a paragraph', () => {`
- L244: `it('parses inside a blockquote', () => {`
- L258: `it('parses inside a list item', () => {`
- L273: `it('does not swallow content after an unterminated block leaves its blockquote', () => {`
- L287: `it('allows trailing whitespace on the fences', () => {`
- L293: `it('ignores dollar runs longer than two', () => {`
- L297: `it('does not treat a single-line $$x$$ as a block', () => {`
- L302: `it('keeps single dollars inside the block as plain content', () => {`
- L306: `it('is still produced by gfmBlockOnlyParser', () => {`

## `../meowdown/packages/markdown/src/node-ids.test.ts`

- L5: `describe('LEZER_NODE_IDS', () => {`
- L6: `it('matches the gfmParser nodeSet name -> id assignment', () => {`

## `../meowdown/packages/markdown/src/node-names.test.ts`

- L6: `describe('LEZER_NODE_NAMES', () => {`
- L7: `it('contains all node names from gfmParser', () => {`

## `../meowdown/packages/markdown/src/parser.test.ts`

- L62: `describe('gfmParser', () => {`
- L63: `it('parses block and inline structure', () => {`
- L99: `describe('gfmBlockOnlyParser', () => {`
- L100: `it('parses block structure but never emits inline nodes', () => {`
- L132: `it('keeps a list item continuation indent inside the paragraph span', () => {`
- L149: `it('emits one CodeText per line for a fenced code block inside a list item', () => {`
- L182: `it('tokenizes the opening and closing marks of an ATX heading', () => {`

## `../meowdown/packages/markdown/src/scheme-autolink.test.ts`

- L15: `describe('schemeAutolink', () => {`
- L16: `describe('detects a bare custom-scheme URI', () => {`
- L17: `it('at the start of the text', () => {`
- L21: `it('after whitespace', () => {`
- L27: `it('with an uppercase scheme', () => {`
- L31: `it('with digits and plus in the scheme', () => {`
- L38: `it('right after an opening paren', () => {`
- L42: `it('picks up scheme URLs that GFM Autolink declines', () => {`
- L47: `describe('ignores text that is not a linkable scheme URI', () => {`
- L55: `it(text, () => {`
- L61: `describe('trims trailing punctuation', () => {`
- L62: `it('drops a sentence-ending period', () => {`
- L66: `it('drops a trailing comma', () => {`
- L70: `it('drops an unbalanced closing paren', () => {`
- L74: `it('keeps balanced parens inside the tail', () => {`
- L78: `it('declines when trimming leaves no tail', () => {`
- L83: `describe('leaves GFM-claimed shapes and other contexts alone', () => {`
- L84: `it('keeps the GFM end rule for an http URL (query needs a path)', () => {`
- L88: `it('leaves a mailto autolink to GFM', () => {`
- L92: `it('does not link the label of an explicit link', () => {`
- L96: `it('does not link inside inline code', () => {`
- L100: `it('does not link inside a wikilink', () => {`

## `../meowdown/packages/markdown/src/wiki-embed.test.ts`

- L20: `describe('wiki embed inline parser', () => {`
- L21: `it.each([`
- L32: `it.each([`
- L45: `it('produces a WikiEmbed with source-mark children', () => {`

## `../meowdown/packages/markdown/src/wikilink.test.ts`

- L43: `describe('wikilink inline parser', () => {`
- L44: `describe('recognizes', () => {`
- L68: `it(\`${JSON.stringify(input)} -> ${links.join(' ')}\`, () => {`
- L74: `describe('rejects', () => {`
- L92: `it(JSON.stringify(input), () => {`
- L98: `describe('precedence and partial matches', () => {`
- L109: `it(\`${JSON.stringify(input)} -> ${links.join(' ')}\`, () => {`
- L114: `it('never produces a Hashtag inside a wikilink', () => {`
- L122: `it('produces a Wikilink with two WikilinkMark children', () => {`
- L132: `it('parses ![[embed]] as a WikiEmbed, not a Wikilink', () => {`
- L142: `it('is never produced by gfmBlockOnlyParser', () => {`

## `../meowdown/packages/react/src/components/attributes-to-props.test.ts`

- L5: `describe('attributesToProps', () => {`
- L6: `it('returns an empty object when called without attributes', () => {`
- L11: `it('converts HTML attribute names to React prop names', () => {`
- L19: `it('matches attribute names case-insensitively', () => {`
- L23: `it('converts SVG attribute names to React prop names', () => {`
- L30: `it('keeps aria attributes unchanged', () => {`
- L34: `it('keeps data attributes unchanged', () => {`
- L38: `it('ignores the style attribute', () => {`
- L44: `it('keeps unknown attributes unchanged', () => {`
- L48: `it('converts boolean attributes to true', () => {`
- L53: `it('converts overloaded boolean attributes to true only when empty', () => {`
- L58: `it('keeps checked on an input element', () => {`
- L71: `it('keeps value on an input element', () => {`
- L78: `it('converts value to defaultValue on a textarea element', () => {`
- L82: `it('converts value to defaultValue on a select element', () => {`
- L86: `it('keeps value on elements that are not form controls', () => {`

## `../meowdown/packages/react/src/components/block-handle.test.tsx`

- L38: `describe('BlockHandle', () => {`
- L39: `it('shows when hovering a block', async () => {`
- L46: `it('hides when typing', async () => {`
- L54: `it('hides while text is selected', async () => {`
- L62: `it('keeps the gutter padding on the editor but off a bare ProseMirror drag preview', async () => {`
- L82: `it('selects the hovered block when pressing the drag handle', async () => {`
- L89: `it('does not render when blockHandle is false', async () => {`
- L96: `it('does not render when readOnly', async () => {`
- L102: `it('drags a block to a new position, showing the drop indicator', async () => {`

## `../meowdown/packages/react/src/components/code-block-view-loading.test.tsx`

- L13: `describe('code block Mermaid loading', () => {`
- L14: `it('keeps the source visible while the renderer loads', async () => {`

## `../meowdown/packages/react/src/components/code-block-view.test.tsx`

- L21: `describe('code block language selector', () => {`
- L22: `it('shows the current language for a code block', async () => {`
- L28: `it('highlights the code block with syntax tokens', async () => {`
- L33: `it('changes the language and round-trips it to markdown', async () => {`
- L47: `it('filters the languages as the user types', async () => {`
- L61: `it('lets the user set a language outside the list', async () => {`
- L75: `it('copies the code block contents to the clipboard', async () => {`
- L94: `describe('code block math preview', () => {`
- L95: `it('shows only the rendered formula when the caret is outside', async () => {`
- L102: `it('shows the source above the preview once the caret enters', async () => {`
- L116: `it('updates the preview live while typing', async () => {`
- L126: `it('renders a math fence with the same preview', async () => {`
- L131: `it('shows no preview for other languages', async () => {`
- L137: `it('renders an error for invalid TeX without hiding the block', async () => {`
- L142: `it('keeps the source visible for an empty math block', async () => {`
- L147: `it('drops the preview and falls back to a backtick fence when the language changes', async () => {`
- L168: `describe('code block Mermaid preview', () => {`
- L169: `it('shows only a Flowchart preview when the caret is outside', async () => {`
- L177: `it('shows the source above the preview once the caret enters', async () => {`
- L191: `it('updates the Flowchart preview live while typing', async () => {`
- L204: `it('renders a Sequence diagram', async () => {`
- L214: `it('keeps the source visible for an empty Mermaid block', async () => {`
- L220: `it('shows an editable error for unsupported syntax', async () => {`
- L232: `it('drops the preview when the language changes', async () => {`
- L249: `it('keeps hostile labels passive', async () => {`
- L261: `describe('typing over code block selections', () => {`
- L281: `it('updates the markdown when typing at a caret', async () => {`
- L290: `it('updates the markdown when typing over a partial selection', async () => {`
- L299: `it('updates the markdown when typing over the full code text', async () => {`
- L308: `it('notifies onDocChange when typing over the full code text', async () => {`
- L319: `describe('code block spellcheck exemption', () => {`
- L323: `it('keeps the pre exempt while the editor root has spellcheck on', async () => {`

## `../meowdown/packages/react/src/components/cross-editor-drag.test.tsx`

- L31: `describe('cross editor block drag', () => {`
- L32: `it('moves the block into the other editor', async () => {`

## `../meowdown/packages/react/src/components/editor.test.tsx`

- L24: `describe('MeowdownEditor', () => {`
- L25: `it('renders a ProseKit editor in focus mode by default', async () => {`
- L31: `it('keeps the ProseKit editor instance when switching among rich modes', async () => {`
- L42: `it('notifies onDocChange and exposes markdown via the ref', async () => {`
- L64: `it('replaces content via setMarkdown', async () => {`
- L79: `it('reports the document and selection via getState', async () => {`
- L91: `it('applies markdown and a selection hint via setState', async () => {`
- L104: `it('moves the cursor via a selection-only setState', async () => {`
- L116: `it('reads and writes the selection via getSelection and setSelection', async () => {`
- L129: `it('supports start and end selection hints', async () => {`
- L144: `it('clamps out-of-range selection hints without throwing', async () => {`
- L159: `it('round-trips the editor state through getState and setState', async () => {`
- L170: `it('renders and round-trips reference links and images as source', async () => {`
- L188: `it('renders an image when resolveImageUrl returns a url', async () => {`
- L198: `it('does not render an image when resolveImageUrl returns undefined', async () => {`
- L205: `it('renders a resolved wiki image and leaves an unresolved one literal', async () => {`
- L219: `it('embeds a pasted YouTube link by default', async () => {`
- L231: `it('does not embed a pasted link when embedPaste is off', async () => {`
- L245: `it('starts a bullet on Enter after a heading when bulletAfterHeading is on', async () => {`
- L258: `it('uploads and inserts an image dropped from outside the editor', async () => {`
- L282: `it('shows placeholder text in an empty editor and hides it once typed', async () => {`
- L292: `it('does not show the placeholder when the document is not empty', async () => {`
- L301: `it('makes the rich editor read-only and restores it when toggled off', async () => {`
- L315: `it('exposes the underlying editor on the handle', async () => {`
- L323: `it('applies editorClassName and wrapperClassName', async () => {`
- L338: `it('keeps the ProseMirror class when editorClassName changes', async () => {`
- L355: `it('keeps wikilink source hidden across an editorClassName change', async () => {`
- L371: `it('disables the caret glide with caretGlide={false}', async () => {`
- L384: `it('renders children inside the ProseKit context in rich modes', async () => {`
- L393: `it('calls onWikilinkClick when a rendered wiki link is clicked', async () => {`
- L404: `it('calls onImageClick when a rendered image is clicked', async () => {`
- L421: `it('calls onLinkClick when a rendered Markdown link is clicked', async () => {`
- L437: `it('calls onTagClick when a rendered tag is clicked', async () => {`
- L448: `it('calls onExitBoundary with "up" when ArrowUp is pressed at the top', async () => {`
- L460: `it('does not call onExitBoundary from a middle paragraph', async () => {`
- L470: `it('focuses and scrolls via the handle', async () => {`
- L481: `it('reveals a URL-decoded heading through the handle', async () => {`
- L497: `it('reveals GitHub-style heading slugs, including duplicate suffixes', async () => {`
- L515: `it('reports a missing heading without moving the selection', async () => {`
- L523: `it('refreshes creation-time resolver output without changing Markdown or selection', async () => {`
- L547: `describe('file pill props', () => {`
- L550: `it('renders a claimed link as a pill with its resolved size and reports clicks', async () => {`
- L572: `it('renders a pasted file as a pill once onFilePaste persists it', async () => {`
- L588: `it('leaves links as links without resolveFileLink', async () => {`
- L595: `describe('spellCheck prop', () => {`
- L596: `it('applies and updates the spellCheck prop on the editor root', async () => {`

## `../meowdown/packages/react/src/components/link-menu.test.tsx`

- L15: `describe('LinkMenu', () => {`
- L16: `it('shows the read preview on hover and copies the href', async () => {`
- L35: `it('anchors the preview to the link when hidden syntax ends the block', async () => {`
- L59: `it('anchors the preview to an angle autolink mid-line', async () => {`
- L76: `it('anchors the preview to an angle autolink alone in its block', async () => {`
- L99: `it('anchors the edit form to a selected wikilink alone in its block', async () => {`
- L123: `it('anchors the edit form to a selection ending in hidden link syntax', async () => {`
- L150: `it('creates a link from a selection with Mod-k', async () => {`
- L163: `it('removes a link from the read preview', async () => {`
- L176: `it('edits a link href from the read preview', async () => {`
- L190: `it('keeps reference links read-only in the preview and Mod-k flow', async () => {`

## `../meowdown/packages/react/src/components/markdown-view-loading.test.tsx`

- L13: `describe('MarkdownView Mermaid loading', () => {`
- L14: `it('renders the source while the renderer loads', async () => {`

## `../meowdown/packages/react/src/components/markdown-view.test.tsx`

- L22: `describe('MarkdownView', () => {`
- L23: `it('renders inline marks as rich text, not source', async () => {`
- L32: `it('renders a wikilink as a chip showing the target', async () => {`
- L37: `it('renders a wikilink alias', async () => {`
- L42: `it('calls onWikilinkClick with the target', async () => {`
- L50: `it('renders an image preview', async () => {`
- L57: `it('applies a size comment to an image inside a link', async () => {`
- L63: `it('renders a resolved wiki image with its alias and width', async () => {`
- L74: `it('renders a resolved wiki file as a pill and reports clicks', async () => {`
- L90: `it('renders a claimed standard Markdown file link as a pill', async () => {`
- L103: `it('leaves an unclaimed standard Markdown link as a link', async () => {`
- L110: `it('renders full, collapsed, and shortcut reference links', async () => {`
- L120: `it('uses the first normalized reference definition', async () => {`
- L129: `it('renders a reference image and omits its definition', async () => {`
- L137: `it('resolves a definition inside a blockquote', async () => {`
- L144: `it('reports clicks from a reference link', async () => {`
- L154: `it('resolves metadata for a claimed standard Markdown file link', async () => {`
- L165: `it('reports clicks on a claimed standard Markdown file link', async () => {`
- L179: `it('keeps a claimed standard file pill passive when interactive is false', async () => {`
- L194: `it('renders a resolved wiki note through the wikilink hook', async () => {`
- L207: `it('leaves an unresolved wiki embed literal', async () => {`
- L213: `it('renders a tweet embed', async () => {`
- L225: `it('renders a youtube embed', async () => {`
- L234: `it('omits recognized embeds before resolving images when interactive is false', async () => {`
- L245: `it('renders a passive tree when interactive is false', async () => {`
- L283: `it('highlights a code block with syntax tokens', async () => {`
- L290: `it('applies a custom mark mode to the root', async () => {`
- L295: `it('defaults to hide mark mode', async () => {`
- L300: `it('renders headings, lists and blockquotes', async () => {`
- L308: `it('folds a collapsed bullet, like the editor', async () => {`
- L314: `it('renders a collapsed bullet expanded with expandCollapsed', async () => {`
- L320: `it('expands collapsed bullets at every depth', async () => {`
- L326: `it('keeps a circle task round under expandCollapsed', async () => {`
- L333: `it('renders truncated markdown without throwing', async () => {`
- L338: `it('renders task checkboxes with their checked state', async () => {`
- L345: `it('calls onTaskClick with the document-order index and task facts', async () => {`
- L364: `it('numbers a nested task after its parent, in document order', async () => {`
- L375: `it('never flips a clicked checkbox itself', async () => {`
- L386: `it('keeps checkboxes inert without an onTaskClick handler', async () => {`
- L393: `it('re-seats checkbox state when the markdown prop changes', async () => {`
- L405: `it('updates when the markdown prop changes', async () => {`
- L452: `describe('MarkdownView math', () => {`
- L453: `it('renders inline math as KaTeX', async () => {`
- L458: `it('renders a dollar math block as a display formula', async () => {`
- L465: `it('renders a math fence as a display formula', async () => {`
- L473: `describe('MarkdownView Mermaid', () => {`
- L476: `it('renders a Flowchart as SVG', async () => {`
- L484: `it('renders a Sequence diagram as SVG', async () => {`
- L491: `it('renders unsupported syntax as an error', async () => {`
- L498: `it('renders passive SVG when interaction is disabled', async () => {`
- L511: `describe('MarkdownView parity with the editor', () => {`
- L518: `it.each([`
- L545: `it('matches the editor for inline math', async () => {`
- L566: `it('matches the editor for a Mermaid diagram', async () => {`

## `../meowdown/packages/react/src/components/mermaid-render.test.tsx`

- L11: `describe('MermaidRender', () => {`
- L12: `it('isolates its live theme from generic host variables without rendering again', async () => {`

## `../meowdown/packages/react/src/components/pending-replacement-preview.test.tsx`

- L20: `describe('PendingReplacementPreview', () => {`
- L21: `it('shows streamed text without touching the document', async () => {`
- L37: `it('labels the accept control by the staged mode', async () => {`
- L48: `it('Accept applies the text and reports the outcome', async () => {`
- L69: `it('Discard leaves the markdown byte-identical and reports the outcome', async () => {`
- L94: `it('renders host actions in the footer', async () => {`
- L108: `it('restarting the stage resets the preview text (retry)', async () => {`

## `../meowdown/packages/react/src/components/prosekit-editor.test.tsx`

- L13: `describe('ProseKitEditor', () => {`
- L14: `it('mounts a ProseMirror editor with the default content', async () => {`
- L19: `it('applies the mark mode', async () => {`
- L25: `it('switches the mark mode when the prop changes', async () => {`
- L32: `it('keeps the mark mode across undo', async () => {`
- L46: `it('notifies onDocChange and serializes markdown via the handle', async () => {`
- L65: `it('round-trips a node selection through getState and setState', async () => {`
- L79: `it('falls back to a text selection for an invalid selection hint', async () => {`
- L88: `it('keeps undo history across setMarkdown', async () => {`
- L101: `it('keeps a leading empty block when the host echoes unchanged Markdown', async () => {`
- L133: `it('fires onDocChange for insertMarkdown, unlike setMarkdown', async () => {`

## `../meowdown/packages/react/src/components/selection-menu.test.tsx`

- L29: `describe('SelectionMenu', () => {`
- L30: `it('opens over a selection via the handle and lists the items', async () => {`
- L48: `it('stays closed when the selection is empty', async () => {`
- L62: `it('passes the filter text and the selection to the search handler', async () => {`
- L81: `it('Enter picks the active item with the captured selection and closes', async () => {`
- L97: `it('shows the affordance on a selection and opens the menu from it', async () => {`
- L116: `it('hides the affordance when selectionMenuAffordance is off', async () => {`
- L133: `it('renders nothing when onSelectionMenuSearch is not given', async () => {`
- L141: `it('passes onSelectionMenuSearch through <MeowdownEditor>', async () => {`

## `../meowdown/packages/react/src/components/slash-menu.test.tsx`

- L34: `describe('SlashMenu', () => {`
- L35: `it('opens when typing "/" and lists the block types', async () => {`
- L46: `it('filters the items by the query', async () => {`
- L54: `it('inserts a table when Enter selects a normal single-slash command', async () => {`
- L67: `it('closes immediately on a double slash and preserves following text on Enter', async () => {`
- L83: `it('does not select a matching host template from double-slash text', async () => {`
- L101: `it('applies the selected block type and removes the query text', async () => {`
- L113: `it('turns a heading back into a paragraph', async () => {`
- L132: `it('removes the bullet when Text is selected in a list item', async () => {`
- L149: `it('wraps the current block in a circle checkbox task', async () => {`
- L159: `it('wraps the current block in a square checkbox task', async () => {`
- L169: `it('inserts a math code block', async () => {`
- L179: `it('inserts the current time in 12-hour format by default', async () => {`
- L189: `it('inserts the current time in 24-hour format when timeFormat is "24"', async () => {`
- L199: `it('attaches a selected file through the slash menu', async () => {`
- L224: `it('shows host items after the built-in ones', async () => {`
- L241: `it('supports an async host search handler', async () => {`
- L253: `it('filters host items by the query like the built-in items', async () => {`
- L267: `it('matches host-item keywords, never displaying them', async () => {`
- L283: `it('closes the menu and calls onSelect on a host item click', async () => {`
- L295: `it('removes the typed query text before a host onSelect runs', async () => {`
- L308: `it('opens when the insertTrigger command inserts "/"', async () => {`
- L317: `it('prefixes a space when insertTrigger runs right after a word', async () => {`
- L327: `it('fits inside a short viewport instead of overflowing it', async () => {`
- L346: `it('omits block items inside a table cell but keeps inline items', async () => {`

## `../meowdown/packages/react/src/components/table-handle.test.tsx`

- L39: `describe('TableHandle', () => {`
- L40: `it('shows the column and row handles when hovering a cell', async () => {`
- L49: `it('inserts a column to the right', async () => {`
- L58: `it('deletes a column', async () => {`
- L67: `it('inserts a row below', async () => {`
- L76: `it('deletes a row', async () => {`
- L85: `it('deletes the whole table', async () => {`
- L94: `it('aligns a column to the center', async () => {`
- L105: `it('marks the active alignment and clears it on a second click', async () => {`
- L120: `it('keeps the column alignment in an inserted row', async () => {`

## `../meowdown/packages/react/src/components/tag-menu.test.tsx`

- L27: `describe('TagMenu', () => {`
- L28: `it('opens when typing "#" followed by text and lists the matching tags', async () => {`
- L39: `it('does not open while typing a heading', async () => {`
- L46: `it('supports async onTagSearch and shows a loading state', async () => {`
- L62: `it('shows label and detail, inserts the tag, and runs onSelect', async () => {`
- L79: `it('inserts the selected tag as text and removes the query', async () => {`
- L91: `it('renders no tag menu when onTagSearch is not given', async () => {`
- L98: `it('passes onTagSearch through <MeowdownEditor>', async () => {`

## `../meowdown/packages/react/src/components/wikilink-hover-card.test.tsx`

- L25: `describe('WikilinkHoverCard', () => {`
- L26: `it('opens after a 300ms dwell and closes on leave', async () => {`
- L42: `it('restarts the dwell when the pointer moves to an adjacent target', async () => {`
- L62: `it('moves the open card to the next hovered link', async () => {`
- L78: `it('renders no card when the render prop returns null for the target', async () => {`
- L97: `it('opens with the resolved body of an async render function', async () => {`
- L115: `it('renders no card when the promise resolves to null', async () => {`
- L133: `it('renders no card when the render promise rejects', async () => {`
- L157: `it('discards a result that resolves after the pointer left', async () => {`
- L180: `it('shows only the newest target when an older promise resolves late', async () => {`
- L209: `it('removes the card when the hovered link is deleted', async () => {`
- L229: `it('preserves editor focus and selection and makes the popup inert', async () => {`
- L254: `it('keeps the popup inside an 8px viewport margin near the bottom-right edge', async () => {`

## `../meowdown/packages/react/src/components/wikilink-menu.test.tsx`

- L54: `describe('WikilinkMenu', () => {`
- L55: `it('opens right after typing "[[" and lists every note', async () => {`
- L66: `it('filters notes while typing after "[["', async () => {`
- L74: `it('passes the typed wikilink query with casing preserved', async () => {`
- L85: `it('passes the typed wikilink query with punctuation preserved', async () => {`
- L96: `it('does not open on a single "["', async () => {`
- L103: `it('closes when "]" is typed', async () => {`
- L112: `it('stays open when a space follows "[["', async () => {`
- L119: `it('opens right after typing "@" and lists every note', async () => {`
- L130: `it('filters notes while typing after "@"', async () => {`
- L138: `it('keeps the menu open across spaces for a multi-word query', async () => {`
- L146: `it('inserts the selected note as [[Name]] and removes the @query', async () => {`
- L158: `it('runs onSelect when a note is chosen', async () => {`
- L168: `it('does not open when "@" follows a non-space character', async () => {`
- L177: `it('does not open when a space follows "@"', async () => {`
- L184: `it('renders no @ menu when onWikilinkSearch is not given', async () => {`
- L191: `it('supports async onWikilinkSearch and shows a loading state', async () => {`
- L206: `it('shows label and detail, inserts the target, and runs onSelect', async () => {`
- L223: `it('keeps long rows within the menu width', async () => {`
- L245: `it('inserts the selected note as [[Name]] and removes the query', async () => {`
- L257: `it('extends the query over existing text with ArrowRight', async () => {`
- L282: `it('can create a wikilink from existing text included with ArrowRight', async () => {`
- L309: `it('does not reopen a dismissed query when ArrowRight crosses existing text', async () => {`
- L326: `it('extends instead of closing when the cursor moves programmatically', async () => {`
- L345: `it('renders no wikilink menu when onWikilinkSearch is not given', async () => {`
- L352: `it('passes onWikilinkSearch through <MeowdownEditor>', async () => {`
- L360: `describe('"[" over a selection', () => {`
- L361: `it('wraps the selection and opens the menu with it as the query', async () => {`
- L372: `it('types a literal bracket when nothing is selected', async () => {`
- L382: `describe('Escape', () => {`
- L383: `it('closes an open menu and keeps the typed text', async () => {`
- L394: `it('collapses a plain selection when no menu is open', async () => {`
- L406: `describe('Mod-Shift-K shortcut', () => {`
- L407: `it('opens the menu with every note', async () => {`
- L417: `it('seeds the query from the selected text', async () => {`
- L427: `it('seeds the query from the visible text of a formatted selection', async () => {`
- L449: `it('inserts the selected note as [[Name]] and removes the query', async () => {`
- L461: `it('does nothing when onWikilinkSearch is not given', async () => {`

## `../meowdown/packages/react/src/utils/date-format.test.ts`

- L14: `describe('formatTime', () => {`
- L15: `it('formats time in 12-hour format', () => {`
- L33: `it('formats time in 24-hour format', () => {`
- L49: `describe('formatNowTime', () => {`
- L50: `it('formats the current time in 12-hour format', () => {`
- L54: `it('formats the current time in 24-hour format', () => {`
