/**
 * # Methodology
 *
 * ## Step 1. Get the list of all standard tag names
 *
 * Go to https://developer.mozilla.org/en-US/docs/Web/HTML/Element and run the
 * following in the console to generate a JSON array of tag names:
 *
 * ```js
 * JSON.stringify(
 *   Array.from(document.querySelectorAll('article table td:first-child'))
 *     .map((td) => {
 *       const body = document.createElement('body');
 *       body.innerHTML = td.textContent;
 *       return body.firstChild?.tagName;
 *     })
 *     .filter((tagName) => tagName)
 * );
 * ```
 *
 * Output (as of 2023-11-06):
 *
 * ```json
 * '["BASE","LINK","META","STYLE","TITLE","ADDRESS","ARTICLE","ASIDE","FOOTER","HEADER","H1","HGROUP","MAIN","NAV","SECTION","SEARCH","BLOCKQUOTE","DD","DIV","DL","DT","FIGCAPTION","FIGURE","HR","LI","MENU","OL","P","PRE","UL","A","ABBR","B","BDI","BDO","BR","CITE","CODE","DATA","DFN","EM","I","KBD","MARK","Q","RP","RT","RUBY","S","SAMP","SMALL","SPAN","STRONG","SUB","SUP","TIME","U","VAR","WBR","AREA","AUDIO","IMG","MAP","TRACK","VIDEO","EMBED","IFRAME","OBJECT","PICTURE","PORTAL","SOURCE","svg","math","CANVAS","NOSCRIPT","SCRIPT","DEL","INS","TABLE","BUTTON","DATALIST","FIELDSET","FORM","INPUT","LABEL","LEGEND","METER","OPTGROUP","OPTION","OUTPUT","PROGRESS","SELECT","TEXTAREA","DETAILS","DIALOG","SUMMARY","SLOT","TEMPLATE","ACRONYM","BIG","CENTER","CONTENT","DIR","FONT","IMG","MARQUEE","MENUITEM","NOBR","NOEMBED","NOFRAMES","PARAM","PLAINTEXT","RB","RTC","SHADOW","STRIKE","TT","XMP"]'
 * ```
 *
 * ## Step 2. For each tag name, determine the default browser style
 *
 * Open an empty HTML file in the browser and run the following in the console:
 *
 * ```js
 * const tagNames = JSON.parse(<JSON string from step 1>);
 *
 * JSON.stringify(
 *   tagNames.filter((tagName) => {
 *     const element = document.createElement(tagName);
 *     document.body.appendChild(element);
 *     const display = window.getComputedStyle(element).display;
 *     element.remove();
 *     return display.startsWith('inline');
 *   })
 * );
 * ```
 *
 * Place the result in the array below (accurate as of 2023-11-06).
 */

export const inlineTagNames = new Set([
  'A',
  'ABBR',
  'B',
  'BDI',
  'BDO',
  'BR',
  'CITE',
  'CODE',
  'DATA',
  'DFN',
  'EM',
  'I',
  'KBD',
  'MARK',
  'Q',
  'S',
  'SAMP',
  'SMALL',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'TIME',
  'U',
  'VAR',
  'WBR',
  'IMG',
  'MAP',
  'TRACK',
  'VIDEO',
  'EMBED',
  'IFRAME',
  'OBJECT',
  'PICTURE',
  'PORTAL',
  'SOURCE',
  'svg',
  'math',
  'CANVAS',
  'DEL',
  'INS',
  'BUTTON',
  'INPUT',
  'LABEL',
  'METER',
  'OUTPUT',
  'PROGRESS',
  'SELECT',
  'TEXTAREA',
  'ACRONYM',
  'BIG',
  'CONTENT',
  'FONT',
  'IMG',
  'MARQUEE',
  'MENUITEM',
  'NOBR',
  'SHADOW',
  'STRIKE',
  'TT',
]);
