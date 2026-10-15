import {
  ContentSlice,
  type createEditor,
  defineEditorSchema,
  definePlugin,
  type Descendant,
  editorReads,
  property,
  schema,
  SelectionApi,
  type SliceLanding,
  type SliceLandingInput,
  target,
} from 'plitejs';

export const text = () => schema.content.text({ default: 'text', min: 1 });
export const paragraph = (value: string, props: object = {}) => ({
  type: 'paragraph',
  ...props,
  children: [{ text: value }],
});
export const heading = (value: string) => ({
  type: 'heading',
  children: [{ text: value }],
});
export const media = (caption: string) => ({
  type: 'media',
  children: [{ text: caption }],
});
const blocks = () =>
  schema.content.types(['paragraph', 'heading', 'media', 'portal', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  });

export const LandingSchema = defineEditorSchema('schema:slice-landing', {
  elements: {
    heading: { content: text() },
    media: { content: text(), object: true },
    paragraph: { content: text(), properties: { align: property.string() } },
    portal: {
      content: text(),
      contentRoots: {
        body: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    quote: {
      content: schema.content.types(['paragraph', 'portal'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  properties: [
    schema.elementProperty('indent', property.number(), {
      target: target.types(['heading', 'paragraph']),
      typeChange: 'preserve-if-allowed',
    }),
  ],
  root: blocks(),
  unknown: 'reject',
});
export const NotesSchema = defineEditorSchema('schema:slice-landing-notes', {
  ...LandingSchema.schema,
  roots: { notes: blocks() },
});

export const HeaderNotesSchema = defineEditorSchema(
  'schema:slice-landing-header',
  {
    ...LandingSchema.schema,
    roots: { header: blocks(), notes: blocks() },
  }
);

export const SharedPortalSchema = defineEditorSchema(
  'schema:slice-landing-shared',
  {
    ...LandingSchema.schema,
    elements: {
      ...LandingSchema.schema.elements,
      portal: {
        content: text(),
        contentRoots: {
          body: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
    },
  }
);

export const NestedPortalSchema = defineEditorSchema(
  'schema:slice-landing-nested',
  {
    ...LandingSchema.schema,
    elements: {
      ...LandingSchema.schema.elements,
      portal: {
        content: text(),
        contentRoots: {
          body: {
            content: schema.content.types(['paragraph', 'portal'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
            ownership: 'exclusive',
          },
        },
      },
    },
  }
);

export const rootOwner = (root: string, caption = 'P') => ({
  childRoots: { body: root },
  children: [{ text: caption }],
  type: 'portal',
});

export const carried = (root: string) =>
  ContentSlice.fromJSON({
    content: [rootOwner(root)],
    openEnd: 0,
    openStart: 0,
    roots: { [root]: [paragraph('X')] },
  });

export const pasteOutcome = (
  editor: ReturnType<typeof createEditor>,
  slice: ContentSlice
) => {
  const before = {
    selection: editor.read.selection(),
    value: editor.read.value(),
  };
  const result = editor.update.slice.replace(slice);

  return {
    after: { selection: editor.read.selection(), value: editor.read.value() },
    before,
    result,
  };
};

export const SingleNoteSchema = defineEditorSchema(
  'schema:slice-landing-single-note',
  {
    ...LandingSchema.schema,
    roots: {
      notes: schema.content.types(['paragraph', 'heading'], {
        default: { type: 'paragraph' },
        max: 1,
        min: 1,
      }),
    },
  }
);

export const caret = (path: number[], offset = 0) =>
  SelectionApi.text({ anchor: { offset, path }, focus: { offset, path } });

export const landing = (
  name: string,
  land: (
    input: SliceLandingInput,
    next: (input?: SliceLandingInput) => SliceLanding
  ) => SliceLanding
) =>
  definePlugin(name, {
    readMiddleware: ({ around }) => [
      around(editorReads.slice.landing, ({ input, next }) =>
        land(input, (override) => (override ? next(override) : next()))
      ),
    ],
  });

export const proposeOnEmpty = (content: Descendant[], omit?: string[]) =>
  landing('propose-on-empty', (input, next) => {
    const landed = next();

    return input.target.kind === 'empty'
      ? {
          ...landed,
          replaceEmpty: {
            omitTargetProperties: omit,
            slice: ContentSlice.closed(content),
          },
        }
      : landed;
  });
