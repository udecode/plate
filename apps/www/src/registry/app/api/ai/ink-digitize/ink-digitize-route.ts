import {
  generateText,
  type LanguageModel,
  type ModelMessage,
  Output,
} from 'ai';
import { z } from 'zod';

const PASSAGE_ID = /^p\d+$/;
const MARK_ID = /^k\d+$/;
const DATA_PNG = 'data:image/png;base64,';

const passageIdSchema = z.string().regex(PASSAGE_ID);
const markIdSchema = z.string().regex(MARK_ID);
const pngDataUrlSchema = z
  .string()
  .refine(
    (value) => value.startsWith(DATA_PNG) && value.length > DATA_PNG.length,
    {
      message: 'Expected a base64 PNG data URL.',
    }
  );

const markRequestSchema = z
  .strictObject({
    box: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    gaps: z.array(z.number().int().nonnegative()).optional(),
    id: markIdSchema,
    words: z.array(z.number().int().nonnegative()).optional(),
  })
  .refine(
    (mark) => (mark.words?.length ?? 0) > 0 || (mark.gaps?.length ?? 0) > 0,
    { message: 'Each mark must name at least one word or gap.' }
  );

const passageRequestSchema = z.strictObject({
  id: passageIdSchema,
  images: z.strictObject({
    inkAlone: pngDataUrlSchema,
    inkOnText: pngDataUrlSchema,
  }),
  marks: z.array(markRequestSchema).min(1),
  words: z.array(z.string()).min(1),
});

export const inkDigitizeRequestSchema = z
  .strictObject({
    apiKey: z.string().optional(),
    correction: z
      .strictObject({
        marks: z.array(markIdSchema).min(1),
      })
      .optional(),
    instruction: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    passages: z.array(passageRequestSchema).min(1),
    request: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    const passageIds = new Set<string>();
    const markIds = new Set<string>();

    for (const [passageIndex, passage] of data.passages.entries()) {
      if (passageIds.has(passage.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate passage id "${passage.id}".`,
          path: ['passages', passageIndex, 'id'],
        });
      }
      passageIds.add(passage.id);

      const wordCount = passage.words.length;

      for (const [markIndex, mark] of passage.marks.entries()) {
        if (markIds.has(mark.id)) {
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate mark id "${mark.id}".`,
            path: ['passages', passageIndex, 'marks', markIndex, 'id'],
          });
        }
        markIds.add(mark.id);

        for (const word of mark.words ?? []) {
          if (word >= wordCount) {
            ctx.addIssue({
              code: 'custom',
              message: `Word index ${word} out of range for passage "${passage.id}".`,
              path: ['passages', passageIndex, 'marks', markIndex, 'words'],
            });
          }
        }
        for (const gap of mark.gaps ?? []) {
          if (gap > wordCount) {
            ctx.addIssue({
              code: 'custom',
              message: `Gap index ${gap} out of range for passage "${passage.id}".`,
              path: ['passages', passageIndex, 'marks', markIndex, 'gaps'],
            });
          }
        }
      }
    }

    if (Boolean(data.instruction) !== Boolean(data.correction)) {
      ctx.addIssue({
        code: 'custom',
        message: 'instruction and correction must be provided together.',
        path: ['instruction'],
      });
    }
    if (data.correction) {
      for (const id of data.correction.marks) {
        if (!markIds.has(id)) {
          ctx.addIssue({
            code: 'custom',
            message: `Correction mark "${id}" is not in passages.`,
            path: ['correction', 'marks'],
          });
        }
      }
    }
  });

export type InkDigitizeRequest = z.infer<typeof inkDigitizeRequestSchema>;

const deleteEditSchema = z.strictObject({
  kind: z.literal('delete'),
  passage: passageIdSchema,
  quote: z.string(),
  words: z.tuple([
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
  ]),
});

const replaceEditSchema = z.strictObject({
  kind: z.literal('replace'),
  passage: passageIdSchema,
  quote: z.string(),
  text: z.string(),
  words: z.tuple([
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
  ]),
});

const insertEditSchema = z.strictObject({
  between: z.tuple([z.string(), z.string()]),
  gap: z.number().int().nonnegative(),
  kind: z.literal('insert'),
  passage: passageIdSchema,
  text: z.string(),
});

const highlightEditSchema = z.strictObject({
  kind: z.literal('highlight'),
  passage: passageIdSchema,
  quote: z.string(),
  words: z.tuple([
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
  ]),
});

export const inkDigitizeEditSchema = z.discriminatedUnion('kind', [
  deleteEditSchema,
  replaceEditSchema,
  insertEditSchema,
  highlightEditSchema,
]);

export const inkDigitizeMeaningSchema = z.strictObject({
  edits: z.array(inkDigitizeEditSchema).min(1),
});

export const inkDigitizeCorrectionSchema = z.strictObject({
  marks: z.array(markIdSchema).min(1),
  meanings: z.array(inkDigitizeMeaningSchema).min(1).max(4),
});

export const inkDigitizeModelOutputSchema = z.strictObject({
  corrections: z.array(inkDigitizeCorrectionSchema),
});

export type InkDigitizeEdit = z.infer<typeof inkDigitizeEditSchema>;
export type InkDigitizeMeaning = z.infer<typeof inkDigitizeMeaningSchema>;
export type InkDigitizeCorrection = z.infer<typeof inkDigitizeCorrectionSchema>;

export type InkDigitizeReading = {
  corrections: InkDigitizeCorrection[];
  request: string;
};

const SYSTEM_PROMPT = [
  'You read hand-drawn pen and highlighter marks over plain-text passages into candidate edits.',
  'Each passage provides two PNG images (inkAlone, inkOnText), numbered words, and each mark with its pixel box and touched word or gap indices.',
  'A gap index i is the insertion point before word i, and gap words.length is after the last word.',
  'Group marks into corrections. Each mark may appear in at most one correction.',
  'For each correction, return 1 to 4 meanings ordered from most likely to least likely.',
  'Each edit must be delete, replace, insert, or highlight within one passage.',
  'For delete, replace, and highlight, set words to [startWord, endWord] (inclusive) and quote to the exact words joined by spaces.',
  'For insert, set gap to the gap index, between to [wordBeforeOrEmpty, wordAfterOrEmpty], and text to the inserted text.',
].join('\n');

export const buildInkDigitizeMessages = (
  input: InkDigitizeRequest
): ModelMessage[] => {
  const parts: Array<
    | { image: string; mediaType: 'image/png'; type: 'image' }
    | { text: string; type: 'text' }
  > = [];

  for (const passage of input.passages) {
    const wordList = passage.words
      .map((word, index) => `${index}:${JSON.stringify(word)}`)
      .join(' ');
    const markLines = passage.marks.map((mark) => {
      const segments = [`${mark.id} box=[${mark.box.join(',')}]`];

      if (mark.words && mark.words.length > 0) {
        segments.push(`words=[${mark.words.join(',')}]`);
      }
      if (mark.gaps && mark.gaps.length > 0) {
        segments.push(`gaps=[${mark.gaps.join(',')}]`);
      }

      return segments.join(' ');
    });

    parts.push({
      text: [
        `Passage ${passage.id}`,
        `Words: ${wordList}`,
        'Marks:',
        ...markLines,
      ].join('\n'),
      type: 'text',
    });
    parts.push({
      image: passage.images.inkAlone.slice(DATA_PNG.length),
      mediaType: 'image/png',
      type: 'image',
    });
    parts.push({
      image: passage.images.inkOnText.slice(DATA_PNG.length),
      mediaType: 'image/png',
      type: 'image',
    });
  }

  if (input.instruction && input.correction) {
    parts.push({
      text: `Instruction for marks [${input.correction.marks.join(',')}]: ${input.instruction}`,
      type: 'text',
    });
  }

  return [
    { content: SYSTEM_PROMPT, role: 'system' },
    { content: parts, role: 'user' },
  ];
};

export const validateInkDigitizeReading = (
  input: InkDigitizeRequest,
  output: z.infer<typeof inkDigitizeModelOutputSchema>
): string | null => {
  const passagesById = new Map(
    input.passages.map((passage) => [passage.id, passage])
  );
  const validMarks = new Set(
    input.passages.flatMap((passage) => passage.marks.map((mark) => mark.id))
  );
  const usedMarks = new Set<string>();

  for (const correction of output.corrections) {
    for (const markId of correction.marks) {
      if (!validMarks.has(markId)) {
        return `Reading named unknown mark "${markId}".`;
      }
      if (usedMarks.has(markId)) {
        return `Reading assigned mark "${markId}" to more than one correction.`;
      }
      usedMarks.add(markId);
    }

    for (const meaning of correction.meanings) {
      for (const edit of meaning.edits) {
        const passage = passagesById.get(edit.passage);

        if (!passage) {
          return `Reading named unknown passage "${edit.passage}".`;
        }
        if (edit.kind === 'insert') {
          if (edit.gap > passage.words.length) {
            return `Reading gap ${edit.gap} is out of range for passage "${edit.passage}".`;
          }
        } else {
          const [start, end] = edit.words;

          if (start > end || end >= passage.words.length) {
            return `Reading word span [${start}, ${end}] is out of range for passage "${edit.passage}".`;
          }
        }
      }
    }
  }

  return null;
};

export const DEFAULT_INK_DIGITIZE_MODEL = 'google/gemini-2.5-flash';

export const runInkDigitize = async (
  input: InkDigitizeRequest,
  model: LanguageModel
): Promise<
  { ok: true; reading: InkDigitizeReading } | { error: string; ok: false }
> => {
  const { output } = await generateText({
    messages: buildInkDigitizeMessages(input),
    model,
    output: Output.object({ schema: inkDigitizeModelOutputSchema }),
  });

  const error = validateInkDigitizeReading(input, output);

  if (error) {
    return { error, ok: false };
  }

  return {
    ok: true,
    reading: {
      corrections: output.corrections,
      request: input.request,
    },
  };
};
