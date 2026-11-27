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

const markRequestSchema = z.strictObject({
  box: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  gaps: z.array(z.number().int().nonnegative()).optional(),
  id: markIdSchema,
  margin: z.enum(['left', 'right']).optional(),
  words: z.array(z.number().int().nonnegative()).optional(),
});

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

const commentEditSchema = z.strictObject({
  kind: z.literal('comment'),
  passage: passageIdSchema,
  quote: z.string(),
  text: z.string().trim().min(1),
  words: z.tuple([
    z.number().int().nonnegative(),
    z.number().int().nonnegative(),
  ]),
});

const answerEditSchema = z.strictObject({
  kind: z.literal('answer'),
  passage: passageIdSchema,
  question: z.string().trim().min(1),
  quote: z.string(),
  text: z.string().trim().min(1),
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
  commentEditSchema,
  answerEditSchema,
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
  'You read hand-drawn proofreading marks over plain-text passages into candidate document edits.',
  'Each passage provides two PNG images (inkAlone, inkOnText), numbered words (0-based), and each mark with its pixel box and touched word or gap indices.',
  'Group related marks (such as a caret and the handwritten word written beside it, or multi-stroke letters of one handwritten word) into a single correction. Each mark may appear in at most one correction.',
  'For each correction, return 1 to 4 distinct candidate meanings ordered from most likely to least likely. When a caret sits beside a short word or a mark could plausibly mean two different edits or adjacent positions, include the next most plausible alternative as a second meaning.',
  'Each edit must be delete, replace, insert, highlight, comment, or answer within one passage.',
  'How to read proofreading marks:',
  '- Strikethrough (delete): a thin opaque pen stroke drawn horizontally through the middle of one or more words, or a scribble crossing out words, is a delete (not a highlight).',
  '- Highlight: a wide translucent marker band over words, or a circle/box/underline emphasizing words without crossing through them, is a highlight.',
  '- Caret insertion (insert): a caret (^ or v) pointing to a space between two words with handwritten text written above or below it inserts that handwritten text at the exact space the caret tip points to. Check both the visual caret apex in inkOnText and which gap makes the resulting sentence grammatical.',
  '- Replacement (replace): words crossed out or circled with handwritten replacement text written above/beside them.',
  '- Handwritten note (comment): a handwritten note in the margin (marked margin=left or margin=right) or beside words becomes a comment anchored on the words it refers to, with text set to the transcribed note.',
  '- Question on a marked passage (answer): a circled, underlined, or bracketed passage paired with a handwritten question (such as "Why?" or "What does this mean?") sets question to the transcribed question and text to a concise answer anchored on the marked words. When a handwritten question could also be saved literally as a note, include a comment meaning as a second option.',
  'Indexing rules:',
  '- For delete, replace, highlight, comment, and answer: set words to [startWord, endWord] (inclusive) and quote to the exact words joined by spaces.',
  '- For insert: gap index i is the space immediately BEFORE word i (between word i-1 and word i), and gap words.length is after the last word. Set between to [wordBeforeOrEmpty, wordAfterOrEmpty] and gap to the index of the word immediately AFTER the insertion point. Double-check that between[0] is words[gap - 1] (or "" if gap is 0) and between[1] is words[gap] (or "" if gap is words.length).',
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
      if (mark.margin) {
        segments.push(`margin=${mark.margin}`);
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

export const DEFAULT_INK_DIGITIZE_MODEL = 'google/gemini-3.8-flash';

// Gemini and Vertex response schemas reject JSON Schema tuple arrays (`items: [...]`)
// and drop fields inside `oneOf` discriminated unions, so the provider output schema
// stays flat with homogeneous arrays and is narrowed back through `inkDigitizeModelOutputSchema`.
// Keep `kind`, `text`/`quote`, and `between` ahead of numeric indices so autoregressive
// decoding commits to the gesture and surrounding words before computing `gap` or `words`.
const inkDigitizeProviderEditSchema = z.object({
  kind: z.enum([
    'delete',
    'replace',
    'insert',
    'highlight',
    'comment',
    'answer',
  ]),
  passage: passageIdSchema,
  quote: z
    .string()
    .describe(
      'For delete, replace, highlight, comment, answer: exact quoted words; empty string "" for insert.'
    ),
  question: z
    .string()
    .describe(
      'For answer: the transcribed handwritten question; empty string "" for other kinds.'
    ),
  text: z
    .string()
    .describe(
      'For insert, replace, comment, or answer: text to write, transcribed note, or concise answer to the question; empty string "" for delete or highlight.'
    ),
  between: z
    .array(z.string())
    .optional()
    .describe('For insert: [wordBeforeOrEmpty, wordAfterOrEmpty] around gap.'),
  gap: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .describe('For insert: index of the word immediately after the insertion.'),
  words: z
    .array(z.number().int().nonnegative())
    .optional()
    .describe(
      'For delete, replace, highlight, comment, answer: [startWord, endWord] inclusive.'
    ),
});

const inkDigitizeProviderOutputSchema = z.object({
  corrections: z.array(
    z.object({
      marks: z.array(markIdSchema).min(1),
      visual: z
        .string()
        .describe(
          'Short visual note of the stroke gesture in inkOnText, naming the exact touched word(s) or the exact two words on the left and right of a caret tip and the resulting phrase.'
        ),
      meanings: z
        .array(
          z.object({
            edits: z.array(inkDigitizeProviderEditSchema).min(1),
          })
        )
        .min(1)
        .max(4),
    })
  ),
});

const normalizeWordPair = (
  words: readonly number[] | undefined
): readonly [number, number] | undefined => {
  if (!words || words.length === 0) return undefined;
  if (words.length === 1) return [words[0], words[0]];
  if (words.length === 2) return [words[0], words[1]];

  return undefined;
};

const normalizeProviderEdit = (
  edit: z.infer<typeof inkDigitizeProviderEditSchema>
): unknown => {
  const words = normalizeWordPair(edit.words);

  switch (edit.kind) {
    case 'delete': {
      return {
        kind: 'delete',
        passage: edit.passage,
        quote: edit.quote,
        words,
      };
    }
    case 'highlight': {
      return {
        kind: 'highlight',
        passage: edit.passage,
        quote: edit.quote,
        words,
      };
    }
    case 'insert': {
      return {
        between: edit.between,
        gap: edit.gap,
        kind: 'insert',
        passage: edit.passage,
        text: edit.text,
      };
    }
    case 'replace': {
      return {
        kind: 'replace',
        passage: edit.passage,
        quote: edit.quote,
        text: edit.text,
        words,
      };
    }
    case 'comment': {
      return {
        kind: 'comment',
        passage: edit.passage,
        quote: edit.quote,
        text: edit.text,
        words,
      };
    }
    case 'answer': {
      return {
        kind: 'answer',
        passage: edit.passage,
        question: edit.question,
        quote: edit.quote,
        text: edit.text,
        words,
      };
    }
    default: {
      return edit;
    }
  }
};

export const runInkDigitize = async (
  input: InkDigitizeRequest,
  model: LanguageModel
): Promise<
  { ok: true; reading: InkDigitizeReading } | { error: string; ok: false }
> => {
  const { output } = await generateText({
    messages: buildInkDigitizeMessages(input),
    model,
    output: Output.object({ schema: inkDigitizeProviderOutputSchema }),
  });

  const normalized = {
    corrections: output.corrections.map((correction) => {
      const validMeanings = correction.meanings
        .map((meaning) =>
          inkDigitizeMeaningSchema.safeParse({
            edits: meaning.edits.map(normalizeProviderEdit),
          })
        )
        .filter((item) => item.success)
        .map((item) => item.data);

      return {
        marks: correction.marks,
        meanings: validMeanings,
      };
    }),
  };

  const parsed = inkDigitizeModelOutputSchema.safeParse(normalized);

  if (!parsed.success) {
    return {
      error: 'Reading returned malformed edits.',
      ok: false,
    };
  }

  const error = validateInkDigitizeReading(input, parsed.data);

  if (error) {
    return { error, ok: false };
  }

  return {
    ok: true,
    reading: {
      corrections: parsed.data.corrections,
      request: input.request,
    },
  };
};
