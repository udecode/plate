import { defineBasePlugin } from '@platejs/core';
import {
  type Descendant,
  type Element,
  ElementApi,
  TextApi,
  type Value,
} from '@platejs/plite';

import { BaseScriptPlugin } from '../lib/BaseMarkPlugins';

/**
 * Converts pre-v54 subscript and superscript boolean marks into the v54
 * `script` mark before schema fitting.
 */
export const ScriptV54MigrationPlugin = defineBasePlugin('scriptV54Migration', {
  transformInitialValue: ({ editor, value }) => {
    const script = editor.plugin(BaseScriptPlugin);

    if (!script.installed) return value;

    const scriptKey = script.schema.key;

    const migrateText = (text: Descendant, location: string): Descendant => {
      if (!TextApi.isText(text)) return text;

      const hasSubscript = Object.hasOwn(text, 'subscript');
      const hasSuperscript = Object.hasOwn(text, 'superscript');

      if (!hasSubscript && !hasSuperscript) return text;

      const subscript = Reflect.get(text, 'subscript');
      const superscript = Reflect.get(text, 'superscript');

      if (subscript !== undefined && typeof subscript !== 'boolean') {
        throw new Error(
          `Legacy script mark at ${location}.subscript must be a boolean.`
        );
      }
      if (superscript !== undefined && typeof superscript !== 'boolean') {
        throw new Error(
          `Legacy script mark at ${location}.superscript must be a boolean.`
        );
      }
      if (subscript === true && superscript === true) {
        throw new Error(
          `Legacy script mark at ${location} cannot be both subscript and superscript.`
        );
      }

      const migrated =
        subscript === true ? 'sub' : superscript === true ? 'sup' : undefined;
      const current = Reflect.get(text, scriptKey);

      if (
        migrated !== undefined &&
        current !== undefined &&
        current !== migrated
      ) {
        throw new Error(
          `Legacy script mark at ${location} conflicts with ${scriptKey} "${String(current)}".`
        );
      }

      const {
        subscript: _subscript,
        superscript: _superscript,
        ...next
      } = text;

      return migrated === undefined ? next : { ...next, [scriptKey]: migrated };
    };
    function migrateDescendant(
      descendant: Descendant,
      location: string
    ): Descendant {
      if (TextApi.isText(descendant)) {
        return migrateText(descendant, location);
      }
      if (!ElementApi.isElement(descendant)) return descendant;

      return migrateElement(descendant, location);
    }
    function migrateElement(element: Element, location: string): Element {
      let changed = false;
      const children = element.children.map((child, index) => {
        const next = migrateDescendant(child, `${location}.${index}`);

        if (next !== child) changed = true;

        return next;
      });

      return changed ? { ...element, children } : element;
    }
    const migrateChildren = (children: Value, location: string): Value => {
      let changed = false;
      const next = children.map((child, index) => {
        const migrated = migrateElement(child, `${location}.${index}`);

        if (migrated !== child) changed = true;

        return migrated;
      });

      return changed ? next : children;
    };
    const children = migrateChildren(value.children, 'main');
    let roots = value.roots;

    if (roots) {
      let rootsChanged = false;
      const nextRoots = Object.fromEntries(
        Object.entries(roots).map(([root, rootChildren]) => {
          const next = migrateChildren(rootChildren, `roots.${root}`);

          if (next !== rootChildren) rootsChanged = true;

          return [root, next];
        })
      );

      if (rootsChanged) roots = nextRoots;
    }

    if (children === value.children && roots === value.roots) return value;

    return {
      ...value,
      children,
      ...(roots ? { roots } : {}),
    };
  },
});
