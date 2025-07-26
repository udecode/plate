import type { TextStreamPart, ToolSet } from 'ai';

export class MarkdownJoiner {
  private buffer = '';
  private isBuffering = false;

  private clearBuffer(): void {
    this.buffer = '';
    this.isBuffering = false;
  }
  private isCompleteBold(): boolean {
    const boldPattern = /\*\*.*?\*\*/;

    if (this.buffer.length < 20) {
      return boldPattern.test(this.buffer);
    }

    return true;
  }

  private isCompleteHeading(): boolean {
    // Match # text pattern
    // 需要满足#空格和一个任意字符
    const headingPattern = /^#\s.{1,}$/;
    return headingPattern.test(this.buffer);
  }

  private isCompleteItalic(): boolean {
    // Match *text* pattern
    const italicPattern = /^\*(?!\*)(.+?)\*$/;
    return italicPattern.test(this.buffer);
  }

  private isCompleteLink(): boolean {
    // Match [text](url) pattern
    const linkPattern = /^\[.*?\]\(.*?\)$/;
    return linkPattern.test(this.buffer);
  }

  private isCompleteMdxTag(): boolean {
    const mdxTagPattern = /<([A-Za-z][A-Za-z0-9\-_]*)>/;

    return mdxTagPattern.test(this.buffer);
  }

  private isFalsePositive(char: string): boolean {
    if (this.buffer.startsWith('<')) {

      return char === '\n' || this.buffer.length > 20;
    }

    // // For bold: if we see * or ** followed by whitespace or newline
    // if (this.buffer.startsWith('*')) {
    //   // Single * followed by whitespace is likely a list item
    //   if (this.buffer.length === 1 && /\s/.test(char)) {
    //     return true;
    //   }
    //   // If we hit newline without completing bold, it's false positive
    //   return char === '\n';
    // }

    return false;
  }

  flush(): string {
    const remaining = this.buffer;
    this.clearBuffer();
    return remaining;
  }

  processText(text: string): string {
    let output = '';

    for (const char of text) {
      if (this.isBuffering) {
        this.buffer += char;

        if (this.isCompleteBold() || this.isCompleteMdxTag()) {
          output += this.buffer;
          this.clearBuffer();
        } else if (this.isFalsePositive(char)) {
          // False positive - flush buffer as raw text
          output += this.buffer;
          this.clearBuffer();
        }
      } else {
        // Check if we should start buffering
        if (char === '[' || char === '*' || char === '<') {
          this.buffer = char;
          this.isBuffering = true;
        } else {
          // Pass through character directly
          output += char;
        }
      }
    }

    // console.log('🚀 ~ MarkdownJoiner ~ processText ~ output:', output);

    return output;
  }
}

export const markdownJoinerTransform =
  <TOOLS extends ToolSet>() =>
  () => {
    const joiner = new MarkdownJoiner();

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      flush(controller) {
        const remaining = joiner.flush();
        if (remaining) {
          controller.enqueue({
            textDelta: remaining,
            type: 'text-delta',
          } as TextStreamPart<TOOLS>);
        }
      },
      transform(chunk, controller) {
        if (chunk.type === 'text-delta') {
          const processedText = joiner.processText(chunk.textDelta);
          if (processedText) {
            controller.enqueue({
              ...chunk,
              textDelta: processedText,
            });
          }
        } else {
          controller.enqueue(chunk);
        }
      },
    });
  };
