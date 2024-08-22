export type SelectAllSelectors = readonly (string | Element)[] | string | Element;

/**
 * Takes a selector (or array of selectors) and returns the matched nodes.
 * @param selector The selector or an Array of selectors.
 * @param doc
 * @returns {Array} Array of DOM-Nodes.
 */
export function selectAll(selector: SelectAllSelectors, doc: Document = document): Element[] {
    const list = !Array.isArray(selector) ? [selector] : selector;
    let nodes: Element[] = [];

    for (let i = 0, l = list.length; i < l; i++) {
        const item = list[i];

        if (typeof item === 'string') {
            /**
             * We can't use the spread operator here as with large amounts of elements
             * we'll get a "Maximum call stack size exceeded"-error.
             */
            nodes = nodes.concat(Array.from(doc.querySelectorAll(item)));
        } else if (item instanceof Element) {
            nodes.push(item);
        }
    }

    return nodes;
}
