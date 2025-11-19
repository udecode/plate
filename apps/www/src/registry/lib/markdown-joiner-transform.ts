import type { TextStreamPart, ToolSet } from 'ai';

/**
 * Transform chunks like [**,bold,**] to [**bold**] make the md deserializer
 * happy.
 *
 * @experimental
 */
export const markdownJoinerTransform =
  <TOOLS extends ToolSet>() =>
  () => {
    const joiner = new MarkdownJoiner();
    let lastTextDeltaId: string | undefined;
    let textStreamEnded = false;

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      async flush(controller) {
        // Only flush if we haven't seen text-end yet
        if (!textStreamEnded) {
          const remaining = joiner.flush();
          if (remaining && lastTextDeltaId) {
            controller.enqueue({
              id: lastTextDeltaId,
              text: remaining,
              type: 'text-delta',
            } as TextStreamPart<TOOLS>);
          }
        }
      },
      async transform(chunk, controller) {
        if (chunk.type === 'text-delta') {
          lastTextDeltaId = chunk.id;
          const processedText = joiner.processText(chunk.text);
          if (processedText) {
            controller.enqueue({
              ...chunk,
              text: processedText,
            });
            await delay(joiner.delayInMs);
          }
        } else if (chunk.type === 'text-end') {
          // Flush any remaining buffer before text-end
          const remaining = joiner.flush();
          if (remaining && lastTextDeltaId) {
            controller.enqueue({
              id: lastTextDeltaId,
              text: remaining,
              type: 'text-delta',
            } as TextStreamPart<TOOLS>);
          }
          textStreamEnded = true;
          controller.enqueue(chunk);
        } else {
          controller.enqueue(chunk);
        }
      },
    });
  };

const DEFAULT_DELAY_IN_MS = 10;
const NEST_BLOCK_DELAY_IN_MS = 100;

const BOLD_PATTERN = /\*\*.*?\*\*/;
const CODE_LINE_PATTERN = /```[^\s]+/;
const LINK_PATTERN = /^\[.*?\]\(.*?\)$/;
const UNORDERED_LIST_PATTERN = /^[*-]\s+.+/;
const TODO_LIST_PATTERN = /^[*-]\s+\[[ xX]\]\s+.+/;
const ORDERED_LIST_PATTERN = /^\d+\.\s+.+/;
const MDX_TAG_PATTERN = /<([A-Za-z][A-Za-z0-9\-_]*)>/;
const DIGIT_PATTERN = /^[0-9]$/;

export class MarkdownJoiner {
  delayInMs = DEFAULT_DELAY_IN_MS;

  private buffer = '';
  private documentCharacterCount = 0;
  private isBuffering = false;
  private streamingCodeBlock = false;
  private streamingLargeDocument = false;
  private streamingTable = false;

  private clearBuffer(): void {
    this.buffer = '';
    this.isBuffering = false;
  }
  private isCompleteBold(): boolean {
    return BOLD_PATTERN.test(this.buffer);
  }

  private isCompleteCodeBlockEnd(): boolean {
    return this.buffer.trimEnd() === '```';
  }

  private isCompleteCodeBlockStart(): boolean {
    return CODE_LINE_PATTERN.test(this.buffer);
  }

  private isCompleteLink(): boolean {
    return LINK_PATTERN.test(this.buffer);
  }

  private isCompleteList(): boolean {
    if (UNORDERED_LIST_PATTERN.test(this.buffer) && this.buffer.includes('['))
      return TODO_LIST_PATTERN.test(this.buffer);

    return (
      UNORDERED_LIST_PATTERN.test(this.buffer) ||
      ORDERED_LIST_PATTERN.test(this.buffer) ||
      TODO_LIST_PATTERN.test(this.buffer)
    );
  }

  private isCompleteMdxTag(): boolean {
    return MDX_TAG_PATTERN.test(this.buffer);
  }

  private isCompleteTableStart(): boolean {
    return this.buffer.startsWith('|') && this.buffer.endsWith('|');
  }

  private isFalsePositive(char: string): boolean {
    // when link is not complete, even if ths buffer is more than 30 characters, it is not a false positive
    if (this.buffer.startsWith('[') && this.buffer.includes('http')) {
      return false;
    }

    return char === '\n' || this.buffer.length > 30;
  }

  private isLargeDocumentStart(): boolean {
    return this.documentCharacterCount > 2500;
  }

  private isListStartChar(char: string): boolean {
    return char === '-' || char === '*' || DIGIT_PATTERN.test(char);
  }

  private isTableExisted(): boolean {
    return this.buffer.length > 10 && !this.buffer.includes('|');
  }

  flush(): string {
    const remaining = this.buffer;
    this.clearBuffer();
    return remaining;
  }

  processText(text: string): string {
    let output = '';

    for (const char of text) {
      if (
        this.streamingCodeBlock ||
        this.streamingTable ||
        this.streamingLargeDocument
      ) {
        this.buffer += char;

        if (char === '\n') {
          output += this.buffer;
          this.clearBuffer();
        }

        if (this.isCompleteCodeBlockEnd() && this.streamingCodeBlock) {
          this.streamingCodeBlock = false;
          this.delayInMs = DEFAULT_DELAY_IN_MS;

          output += this.buffer;
          this.clearBuffer();
        }

        if (this.isTableExisted() && this.streamingTable) {
          this.streamingTable = false;
          this.delayInMs = DEFAULT_DELAY_IN_MS;

          output += this.buffer;
          this.clearBuffer();
        }
      } else if (this.isBuffering) {
        this.buffer += char;

        if (this.isCompleteCodeBlockStart()) {
          this.delayInMs = NEST_BLOCK_DELAY_IN_MS;
          this.streamingCodeBlock = true;
          continue;
        }

        if (this.isCompleteTableStart()) {
          this.delayInMs = NEST_BLOCK_DELAY_IN_MS;
          this.streamingTable = true;
          continue;
        }

        if (this.isLargeDocumentStart()) {
          this.delayInMs = NEST_BLOCK_DELAY_IN_MS;
          this.streamingLargeDocument = true;
          continue;
        }

        if (
          this.isCompleteBold() ||
          this.isCompleteMdxTag() ||
          this.isCompleteList() ||
          this.isCompleteLink()
        ) {
          output += this.buffer;
          this.clearBuffer();
        } else if (this.isFalsePositive(char)) {
          // False positive - flush buffer as raw text
          output += this.buffer;
          this.clearBuffer();
        }
        // Check if we should start buffering
      } else if (
        char === '*' ||
        char === '<' ||
        char === '`' ||
        char === '|' ||
        char === '[' ||
        this.isListStartChar(char)
      ) {
        this.buffer = char;
        this.isBuffering = true;
      } else {
        // Pass through character directly
        output += char;
      }
    }

    this.documentCharacterCount += text.length;
    return output;
  }
}

async function delay(delayInMs?: number | null): Promise<void> {
  return delayInMs == null
    ? Promise.resolve()
    : new Promise((resolve) => setTimeout(resolve, delayInMs));
}
