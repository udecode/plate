import { createBasePlugin } from '@platejs/core';
import {
  type Descendant,
  ElementApi,
  TextApi,
  type Value,
} from '@platejs/plite';

import { BaseScriptPlugin } from '../lib/BaseScriptPlugin';

const migrateScriptText = (
  text: Descendant,
  location: string,
  type: string
): Descendant => {
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

  const value =
    subscript === true ? 'sub' : superscript === true ? 'sup' : undefined;
  const current = Reflect.get(text, type);

  if (value !== undefined && current !== undefined && current !== value) {
    throw new Error(
      `Legacy script mark at ${location} conflicts with ${type} "${String(current)}".`
    );
  }

  const { subscript: _subscript, superscript: _superscript, ...next } = text;

  return value === undefined ? next : { ...next, [type]: value };
};

const migrateScriptDescendant = (
  descendant: Descendant,
  location: string,
  type: string
): Descendant => {
  if (TextApi.isText(descendant)) {
    return migrateScriptText(descendant, location, type);
  }
  if (!ElementApi.isElement(descendant)) return descendant;

  let changed = false;
  const children = descendant.children.map((child, index) => {
    const next = migrateScriptDescendant(child, `${location}.${index}`, type);

    if (next !== child) changed = true;

    return next;
  });

  return changed ? { ...descendant, children } : descendant;
};

const migrateScriptChildren = (
  children: Value,
  location: string,
  type: string
): Value => {
  let changed = false;
  const next = children.map((child, index) => {
    const migrated = migrateScriptDescendant(
      child,
      `${location}.${index}`,
      type
    );

    if (migrated !== child) changed = true;

    return migrated;
  }) as Value;

  return changed ? next : children;
};

/**
 * Converts pre-v54 subscript and superscript boolean marks into the v54
 * `script` mark before schema fitting.
 */
export const ScriptV54MigrationPlugin = createBasePlugin({
  key: 'scriptV54Migration',
  transformInitialValue: ({ editor, value }) => {
    const script = editor.plugin(BaseScriptPlugin);

    if (!script.installed) return value;
    if (script.type === 'subscript' || script.type === 'superscript') {
      throw new Error(
        `ScriptV54MigrationPlugin cannot migrate into legacy property "${script.type}".`
      );
    }

    const children = migrateScriptChildren(value.children, 'main', script.type);
    let roots = value.roots;

    if (roots) {
      let rootsChanged = false;
      const nextRoots = Object.fromEntries(
        Object.entries(roots).map(([root, rootChildren]) => {
          const next = migrateScriptChildren(
            rootChildren,
            `roots.${root}`,
            script.type
          );

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
