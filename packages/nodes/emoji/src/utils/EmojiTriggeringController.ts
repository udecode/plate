import { EMOJI_TRIGGERING_CONTROLLER_OPTIONS } from '../constants';

export type EmojiTriggeringControllerOptions = {
  limitTriggeringChars: number;
  maxTextToSearch: number;
};

export interface IEmojiTriggeringController {
  isTriggering: boolean;
  hasTriggeringMark: boolean;
  getText: () => string;
  setText: (text: string) => void;
  reset: () => void;
  getOptions: () => EmojiTriggeringControllerOptions;
  getTextSize: () => number;
}
export class EmojiTriggeringController implements IEmojiTriggeringController {
  protected text = '';
  protected pos: any;
  public isTriggering = false;
  public hasTriggeringMark = false;

  constructor(
    protected trigger = ':',
    protected options: EmojiTriggeringControllerOptions = EMOJI_TRIGGERING_CONTROLLER_OPTIONS
  ) {}

  setText(text: string) {
    this.text = text;
    this.hasTriggeringMark = this.isWithTriggeringMark(text);

    this.isTriggering =
      this.hasTriggeringMark &&
      this.text.length >= this.options.limitTriggeringChars;
  }

  private isWithTriggeringMark(text: string) {
    return new RegExp(`^${this.trigger}.*`).test(text);
  }

  getText() {
    return this.hasTriggeringMark ? this.text.slice(1) : this.text;
  }

  getOptions(): EmojiTriggeringControllerOptions {
    return this.options;
  }

  getTextSize() {
    return this.text.length;
  }

  reset() {
    this.text = '';
    this.isTriggering = false;
    this.hasTriggeringMark = false;
  }
}
