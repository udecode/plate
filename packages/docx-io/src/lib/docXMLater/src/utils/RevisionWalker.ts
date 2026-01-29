/**
 * RevisionWalker - DOM-based tree walker for accepting tracked changes
 *
 * Replaces the fragile RegEx-based revision acceptance with a robust
 * DOM-based approach that properly handles nested elements and preserves
 * element ordering.
 *
 * @module RevisionWalker
 */

import type { ParsedXMLObject } from '../xml/XMLParser';

/**
 * Options for controlling which revision types to accept
 */
export interface RevisionWalkerOptions {
  /** Keep content, remove w:ins wrapper (default: true) */
  acceptInsertions?: boolean;
  /** Remove w:del and content entirely (default: true) */
  acceptDeletions?: boolean;
  /** Handle w:moveFrom/w:moveTo (default: true) */
  acceptMoves?: boolean;
  /** Remove *Change elements (default: true) */
  acceptPropertyChanges?: boolean;
}

/**
 * Structure for tracking element order
 */
interface OrderedChildInfo {
  type: string;
  index: number;
}

/**
 * Revision element categories
 */
const REVISION_ELEMENTS = {
  /** Elements to unwrap (keep content, remove wrapper) */
  UNWRAP: ['w:ins', 'w:moveTo'],

  /** Elements to remove entirely (with content) */
  REMOVE: ['w:del', 'w:moveFrom'],

  /** Property change tracking elements */
  PROPERTY_CHANGES: [
    'w:rPrChange',
    'w:pPrChange',
    'w:tblPrChange',
    'w:tcPrChange',
    'w:trPrChange',
    'w:sectPrChange',
    'w:tblGridChange',
    'w:numberingChange',
    'w:tblPrExChange',
  ],

  /** Range marker elements */
  RANGE_MARKERS: [
    'w:moveFromRangeStart',
    'w:moveFromRangeEnd',
    'w:moveToRangeStart',
    'w:moveToRangeEnd',
    'w:customXmlInsRangeStart',
    'w:customXmlInsRangeEnd',
    'w:customXmlDelRangeStart',
    'w:customXmlDelRangeEnd',
    'w:customXmlMoveFromRangeStart',
    'w:customXmlMoveFromRangeEnd',
    'w:customXmlMoveToRangeStart',
    'w:customXmlMoveToRangeEnd',
  ],
};

/**
 * DOM-based tree walker for accepting Word document revisions
 *
 * This class processes a parsed XML object tree (from XMLParser.parseToObject())
 * and accepts all tracked changes by:
 * - Unwrapping insertions (w:ins, w:moveTo) - keeping content
 * - Removing deletions (w:del, w:moveFrom) - discarding content
 * - Removing property changes (*Change elements)
 * - Removing range markers
 *
 * Element order is preserved using the _orderedChildren metadata.
 */
export class RevisionWalker {
  /**
   * Process a parsed XML object tree and accept all revisions
   *
   * @param obj - Parsed XML object from XMLParser.parseToObject()
   * @param options - Options controlling which revisions to accept
   * @returns New object tree with revisions accepted
   *
   * @example
   * ```typescript
   * const parsed = XMLParser.parseToObject(documentXml);
   * const clean = RevisionWalker.processTree(parsed);
   * ```
   */
  static processTree(
    obj: ParsedXMLObject,
    options?: RevisionWalkerOptions
  ): ParsedXMLObject {
    const opts: Required<RevisionWalkerOptions> = {
      acceptInsertions: options?.acceptInsertions ?? true,
      acceptDeletions: options?.acceptDeletions ?? true,
      acceptMoves: options?.acceptMoves ?? true,
      acceptPropertyChanges: options?.acceptPropertyChanges ?? true,
    };

    // Deep clone the object to avoid mutating the original
    const clone = RevisionWalker.deepClone(obj);

    // Walk and transform the tree
    RevisionWalker.walkAndTransform(clone, opts);

    return clone;
  }

  /**
   * Deep clone an object
   */
  private static deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => RevisionWalker.deepClone(item));
    }

    const clone: any = {};
    for (const key of Object.keys(obj)) {
      clone[key] = RevisionWalker.deepClone(obj[key]);
    }
    return clone;
  }

  /**
   * Recursively walk and transform the object tree
   * Processes children first (depth-first) to handle nested revisions
   */
  private static walkAndTransform(
    obj: any,
    options: Required<RevisionWalkerOptions>
  ): void {
    if (obj === null || typeof obj !== 'object') {
      return;
    }

    // Get keys to process (excluding metadata keys)
    const keys = Object.keys(obj).filter(
      (k) => !k.startsWith('@_') && k !== '#text' && k !== '_orderedChildren'
    );

    // First pass: recurse into children (depth-first)
    for (const key of keys) {
      const value = obj[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          RevisionWalker.walkAndTransform(item, options);
        }
      } else if (typeof value === 'object' && value !== null) {
        RevisionWalker.walkAndTransform(value, options);
      }
    }

    // Second pass: process revision elements at this level
    // We need to iterate carefully because we're modifying the object
    RevisionWalker.processRevisions(obj, options);
  }

  /**
   * Process revision elements at the current level
   */
  private static processRevisions(
    parent: any,
    options: Required<RevisionWalkerOptions>
  ): void {
    if (!parent || typeof parent !== 'object') {
      return;
    }

    const keysToProcess = Object.keys(parent).filter(
      (k) => !k.startsWith('@_') && k !== '#text' && k !== '_orderedChildren'
    );

    for (const key of keysToProcess) {
      // Check if this is a revision element
      if (RevisionWalker.shouldUnwrap(key, options)) {
        RevisionWalker.unwrapAllElements(parent, key);
      } else if (RevisionWalker.shouldRemove(key, options)) {
        RevisionWalker.removeAllElements(parent, key);
      }
    }
  }

  /**
   * Check if an element should be unwrapped (content kept)
   */
  private static shouldUnwrap(
    key: string,
    options: Required<RevisionWalkerOptions>
  ): boolean {
    if (REVISION_ELEMENTS.UNWRAP.includes(key)) {
      if (key === 'w:ins' && !options.acceptInsertions) return false;
      if (key === 'w:moveTo' && !options.acceptMoves) return false;
      return true;
    }
    return false;
  }

  /**
   * Check if an element should be removed (content discarded)
   */
  private static shouldRemove(
    key: string,
    options: Required<RevisionWalkerOptions>
  ): boolean {
    if (REVISION_ELEMENTS.REMOVE.includes(key)) {
      if (key === 'w:del' && !options.acceptDeletions) return false;
      if (key === 'w:moveFrom' && !options.acceptMoves) return false;
      return true;
    }
    if (REVISION_ELEMENTS.PROPERTY_CHANGES.includes(key)) {
      return options.acceptPropertyChanges;
    }
    if (REVISION_ELEMENTS.RANGE_MARKERS.includes(key)) {
      return true; // Always remove range markers
    }
    return false;
  }

  /**
   * Unwrap all elements of a given type, promoting their children to parent
   *
   * This is the most complex operation in RevisionWalker. When we unwrap a
   * revision element like w:ins, we need to:
   * 1. Extract the children from inside w:ins
   * 2. Insert them at the correct position in the parent's element arrays
   * 3. Update _orderedChildren to reflect the new structure
   *
   * The key challenge is maintaining correct element order. For example:
   *   Before: <w:tbl><w:tr>Row1</w:tr><w:ins><w:tr>Row2</w:tr></w:ins><w:tr>Row3</w:tr></w:tbl>
   *   After:  <w:tbl><w:tr>Row1</w:tr><w:tr>Row2</w:tr><w:tr>Row3</w:tr></w:tbl>
   */
  private static unwrapAllElements(parent: any, key: string): void {
    const elements = parent[key];
    if (!elements) return;

    const elementArray = Array.isArray(elements) ? elements : [elements];

    // Build a complete ordered list of child elements by walking _orderedChildren
    // This captures the intended order before we modify anything
    const orderedElements: Array<{ type: string; element: any }> = [];

    if (parent._orderedChildren) {
      // Track how many of each type we've seen to get correct array index
      const typeCounters: Map<string, number> = new Map();
      let unwrappedIndex = 0;

      for (const entry of parent._orderedChildren) {
        const { type } = entry;

        if (type === key) {
          // This is a revision element - extract its children in order
          const revElement = elementArray[unwrappedIndex];
          unwrappedIndex++;

          if (revElement && typeof revElement === 'object') {
            if (revElement._orderedChildren) {
              // Use the revision element's _orderedChildren for correct order
              const childCounters: Map<string, number> = new Map();
              for (const childEntry of revElement._orderedChildren) {
                const childType = childEntry.type;
                const childIdx = childCounters.get(childType) || 0;
                childCounters.set(childType, childIdx + 1);

                const childElements = revElement[childType];
                if (childElements) {
                  const childArray = Array.isArray(childElements)
                    ? childElements
                    : [childElements];
                  if (childIdx < childArray.length) {
                    orderedElements.push({
                      type: childType,
                      element: childArray[childIdx],
                    });
                  }
                }
              }
            } else {
              // No _orderedChildren, extract children in object key order
              const childKeys = Object.keys(revElement).filter(
                (k) =>
                  !k.startsWith('@_') &&
                  k !== '#text' &&
                  k !== '_orderedChildren'
              );
              for (const childKey of childKeys) {
                const childValue = revElement[childKey];
                const childArray = Array.isArray(childValue)
                  ? childValue
                  : [childValue];
                for (const child of childArray) {
                  orderedElements.push({ type: childKey, element: child });
                }
              }
            }
          }
        } else {
          // Regular element - get it from the parent
          const idx = typeCounters.get(type) || 0;
          typeCounters.set(type, idx + 1);

          const parentElements = parent[type];
          if (parentElements) {
            const parentArray = Array.isArray(parentElements)
              ? parentElements
              : [parentElements];
            if (idx < parentArray.length) {
              orderedElements.push({ type, element: parentArray[idx] });
            }
          }
        }
      }
    }

    // Remove the revision wrapper
    delete parent[key];

    // If we have ordered elements, rebuild the arrays in correct order
    if (orderedElements.length > 0) {
      // Group elements by type
      const rebuiltArrays: Map<string, any[]> = new Map();

      for (const { type, element } of orderedElements) {
        if (!rebuiltArrays.has(type)) {
          rebuiltArrays.set(type, []);
        }
        rebuiltArrays.get(type)!.push(element);
      }

      // Update parent with rebuilt arrays
      for (const [type, elements] of rebuiltArrays) {
        if (elements.length === 1) {
          parent[type] = elements[0];
        } else {
          parent[type] = elements;
        }
      }

      // Rebuild _orderedChildren
      const newOrderedChildren: OrderedChildInfo[] = [];
      const typeCounters: Map<string, number> = new Map();

      for (const { type } of orderedElements) {
        const idx = typeCounters.get(type) || 0;
        typeCounters.set(type, idx + 1);
        newOrderedChildren.push({ type, index: idx });
      }

      parent._orderedChildren = newOrderedChildren;
    } else {
      // Fallback for when there's no _orderedChildren - just merge
      for (const element of elementArray) {
        if (!element || typeof element !== 'object') continue;

        const elementKeys = Object.keys(element).filter(
          (k) =>
            !k.startsWith('@_') && k !== '#text' && k !== '_orderedChildren'
        );

        for (const childKey of elementKeys) {
          RevisionWalker.mergeIntoParent(parent, childKey, element[childKey]);
        }
      }
    }
  }

  /**
   * Remove all elements of a given type (including their content)
   */
  private static removeAllElements(parent: any, key: string): void {
    if (!parent[key]) return;

    // Update _orderedChildren before removing
    if (parent._orderedChildren) {
      parent._orderedChildren = parent._orderedChildren.filter(
        (c: OrderedChildInfo) => c.type !== key
      );
      // Re-index remaining elements of same types
      RevisionWalker.reindexOrderedChildren(parent._orderedChildren);
    }

    // Remove the element
    delete parent[key];
  }

  /**
   * Merge a child value into the parent, handling arrays properly
   */
  private static mergeIntoParent(
    parent: any,
    childKey: string,
    childValue: any
  ): void {
    if (parent[childKey] === undefined) {
      // No existing value, just assign
      parent[childKey] = childValue;
    } else {
      // Existing value, need to merge
      const existing = parent[childKey];
      const incoming = Array.isArray(childValue) ? childValue : [childValue];

      if (Array.isArray(existing)) {
        parent[childKey] = [...existing, ...incoming];
      } else {
        parent[childKey] = [existing, ...incoming];
      }
    }
  }

  /**
   * Re-index _orderedChildren to ensure indices are sequential per type
   */
  private static reindexOrderedChildren(
    orderedChildren: OrderedChildInfo[]
  ): void {
    const typeCounters: Map<string, number> = new Map();

    for (const entry of orderedChildren) {
      const currentIndex = typeCounters.get(entry.type) || 0;
      entry.index = currentIndex;
      typeCounters.set(entry.type, currentIndex + 1);
    }
  }

  /**
   * Check if an element is a revision-related element (any type)
   */
  static isRevisionElement(key: string): boolean {
    return (
      REVISION_ELEMENTS.UNWRAP.includes(key) ||
      REVISION_ELEMENTS.REMOVE.includes(key) ||
      REVISION_ELEMENTS.PROPERTY_CHANGES.includes(key) ||
      REVISION_ELEMENTS.RANGE_MARKERS.includes(key)
    );
  }

  /**
   * Get revision element categories (for external use/testing)
   */
  static getRevisionElementCategories(): typeof REVISION_ELEMENTS {
    return { ...REVISION_ELEMENTS };
  }
}
