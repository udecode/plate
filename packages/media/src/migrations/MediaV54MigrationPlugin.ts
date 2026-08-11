import { defineBasePlugin } from '@platejs/core';
import {
  type Descendant,
  type EditorDocumentValue,
  ElementApi,
  TextApi,
  type Value,
} from '@platejs/plite';

import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseVideoPlugin,
} from '../lib/BaseMediaPlugin';
import { BaseImagePlugin } from '../lib/image/BaseImagePlugin';
import { BaseMediaEmbedPlugin } from '../lib/media-embed/BaseMediaEmbedPlugin';

type MediaV54MigrationOptions = {
  isInline: (node: Descendant) => boolean;
  typeMigrations: ReadonlyMap<string, string>;
  types: ReadonlySet<string>;
};

const migrateMediaDescendant = (
  input: unknown,
  location: string,
  options: MediaV54MigrationOptions
): Descendant => {
  if (TextApi.isText(input)) return input;
  if (!ElementApi.isElement(input)) {
    throw new Error(`Invalid media caption node at ${location}.`);
  }

  const migratedType = options.types.has(input.type)
    ? undefined
    : options.typeMigrations.get(input.type);
  let element = migratedType ? { ...input, type: migratedType } : input;

  if (!options.types.has(element.type)) {
    let changed = element !== input;
    const children = element.children.map((child, index) => {
      const migrated = migrateMediaDescendant(
        child,
        `${location}.${index}`,
        options
      );

      if (migrated !== child) changed = true;

      return migrated;
    });

    return changed ? { ...element, children } : input;
  }

  if (
    !Object.hasOwn(element, 'url') ||
    Object.hasOwn(element, 'placeholderId')
  ) {
    const { placeholderId: _placeholderId, ...properties } = element;

    element = {
      ...properties,
      ...(Object.hasOwn(element, 'url') ? {} : { url: '' }),
    };
  }

  if (!Object.hasOwn(element, 'caption')) return element;

  const legacyCaption = Reflect.get(element, 'caption');
  const migrateCaptionChildren = (
    children: readonly unknown[],
    childLocation: string
  ) =>
    children.map((child, index) =>
      migrateMediaDescendant(child, `${childLocation}.${index}`, options)
    );
  const isInlineCaptionChild = (child: Descendant) =>
    TextApi.isText(child) ||
    (ElementApi.isElement(child) && options.isInline(child));
  const migrateInlineChildren = (
    children: readonly unknown[],
    childLocation: string
  ) => {
    const migrated = migrateCaptionChildren(children, childLocation);

    if (!migrated.every(isInlineCaptionChild)) {
      throw new Error(
        `Media caption at ${childLocation} must contain inline content.`
      );
    }

    return migrated;
  };
  const isAbsent = (children: readonly Descendant[]) =>
    children.length === 0 ||
    (children.length === 1 &&
      TextApi.isText(children[0]) &&
      children[0].text === '' &&
      Object.keys(children[0]).every((key) => key === 'text'));
  const direct = migrateInlineChildren(
    element.children,
    `${location}.children`
  );
  let legacy: Descendant[] = [];

  if (!Array.isArray(legacyCaption)) {
    throw new Error(`Legacy media caption at ${location} must be an array.`);
  }

  const migratedLegacy = migrateCaptionChildren(
    legacyCaption,
    `${location}.caption`
  );

  if (migratedLegacy.every(isInlineCaptionChild)) {
    legacy = migratedLegacy;
  } else if (
    migratedLegacy.length === 1 &&
    ElementApi.isElement(migratedLegacy[0]) &&
    migratedLegacy[0].children.every(isInlineCaptionChild)
  ) {
    legacy = [...migratedLegacy[0].children];
  } else {
    throw new Error(
      `Legacy media caption at ${location} must contain inline content or one block wrapper.`
    );
  }

  const nonEmptySources = [direct, legacy].filter(
    (children) => !isAbsent(children)
  );

  if (nonEmptySources.length > 1) {
    throw new Error(
      `Media element at ${location} has multiple non-empty caption sources.`
    );
  }

  const { caption: _caption, ...migratedElement } = element;
  const children = nonEmptySources[0] ?? [{ text: '' }];

  return {
    ...migratedElement,
    children,
  };
};

const migrateMediaChildren = (
  children: Value,
  location: string,
  options: MediaV54MigrationOptions
): Value => {
  let changed = false;
  const next = children.map((child, index) => {
    const migrated = migrateMediaDescendant(
      child,
      `${location}.${index}`,
      options
    );

    if (migrated !== child) changed = true;

    return migrated;
  }) as Value;

  return changed ? next : children;
};

const migrateMediaV54Document = (
  value: EditorDocumentValue,
  options: MediaV54MigrationOptions
): EditorDocumentValue => {
  if (options.types.size === 0) return value;

  const children = migrateMediaChildren(value.children, 'main', options);
  let roots = value.roots;

  if (roots) {
    let rootsChanged = false;
    const nextRoots = Object.fromEntries(
      Object.entries(roots).map(([root, rootChildren]) => {
        const next = migrateMediaChildren(
          rootChildren,
          `roots.${root}`,
          options
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
};

/**
 * Migrates pre-v54 media identities and `caption` properties before schema
 * fitting.
 */
export const MediaV54MigrationPlugin = defineBasePlugin('mediaV54Migration', {
  transformInitialValue: ({ editor, value }) => {
    const audio = editor.plugin(BaseAudioPlugin);
    const file = editor.plugin(BaseFilePlugin);
    const image = editor.plugin(BaseImagePlugin);
    const mediaEmbed = editor.plugin(BaseMediaEmbedPlugin);
    const video = editor.plugin(BaseVideoPlugin);
    const typeMigrations = new Map<string, string>();

    if (image.installed && !editor.read.schema.element('img')) {
      typeMigrations.set('img', image.schema.type);
    }
    if (mediaEmbed.installed && !editor.read.schema.element('media_embed')) {
      typeMigrations.set('media_embed', mediaEmbed.schema.type);
    }

    const types = new Set(
      [audio, file, image, mediaEmbed, video]
        .filter((plugin) => plugin.installed)
        .map((plugin) => plugin.schema.type)
    );

    return migrateMediaV54Document(value, {
      isInline: editor.read.schema.isInline,
      typeMigrations,
      types,
    });
  },
});
