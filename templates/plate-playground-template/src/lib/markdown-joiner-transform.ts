import type { TextStreamPart, ToolSet } from 'ai';

/**
 * Transform chunks like [**,bold,**] to [**bold**] make the md deserializer happy.
 * @experimental
 */
export const markdownJoinerTransform =
  <TOOLS extends ToolSet>() =>
  () => {
    const joiner = new MarkdownJoiner();

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      async flush(controller) {
        const remaining = joiner.flush();
        if (remaining) {
          controller.enqueue({
            textDelta: remaining,
            type: 'text-delta',
          } as TextStreamPart<TOOLS>);
        }
      },
      async transform(chunk, controller) {
        if (chunk.type === 'text-delta') {
          const processedText = joiner.processText(chunk.textDelta);
          if (processedText) {
            controller.enqueue({
              ...chunk,
              textDelta: processedText,
            });
            await delay(joiner.delayInMs);
          }
        } else {
          controller.enqueue(chunk);
        }
      },
    });
  };

const DEFAULT_DELAY_IN_MS = 10;
const NEST_BLOCK_DELAY_IN_MS = 100;

export class MarkdownJoiner {
  private buffer = '';
  private isBuffering = false;
  private streamingCodeBlock = false;
  private streamingTable = false;
  public delayInMs = DEFAULT_DELAY_IN_MS;

  private clearBuffer(): void {
    this.buffer = '';
    this.isBuffering = false;
  }
  private isCompleteBold(): boolean {
    const boldPattern = /\*\*.*?\*\*/;

    return boldPattern.test(this.buffer);
  }

  private isCompleteCodeBlockEnd(): boolean {
    return this.buffer.trimEnd() === '```';
  }

  private isCompleteCodeBlockStart(): boolean {
    const codeLinePattern = /```[^\s]+/;
    return codeLinePattern.test(this.buffer);
  }

  private isCompleteLink(): boolean {
    const linkPattern = /^\[.*?\]\(.*?\)$/;
    return linkPattern.test(this.buffer);
  }

  private isCompleteList(): boolean {
    const unorderedListPattern = /^[*-]\s+.+/;
    const todoListPattern = /^[*-]\s+\[[ xX]\]\s+.+/;
    const orderedListPattern = /^\d+\.\s+.+/;

    if (unorderedListPattern.test(this.buffer) && this.buffer.includes('['))
      return todoListPattern.test(this.buffer);

    return (
      unorderedListPattern.test(this.buffer) ||
      orderedListPattern.test(this.buffer) ||
      todoListPattern.test(this.buffer)
    );
  }

  private isCompleteMdxTag(): boolean {
    const mdxTagPattern = /<([A-Za-z][A-Za-z0-9\-_]*)>/;

    return mdxTagPattern.test(this.buffer);
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

  private isListStartChar(char: string): boolean {
    return char === '-' || char === '*' || /^[0-9]$/.test(char);
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
      if (this.streamingCodeBlock || this.streamingTable) {
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
      } else {
        // Check if we should start buffering

        if (
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
    }

    return output;
  }
}

async function delay(delayInMs?: number | null): Promise<void> {
  return delayInMs == null
    ? Promise.resolve()
    : new Promise((resolve) => setTimeout(resolve, delayInMs));
}
