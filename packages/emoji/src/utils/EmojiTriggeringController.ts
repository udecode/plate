import { emojiTriggeringControllerOptions } from '../index';

export type EmojiTriggeringControllerOptions = {
  limitTriggeringChars: number;
  trigger: string;
};

export interface IEmojiTriggeringController {
  getText: () => string;
  getTextSize: () => number;
  hasEnclosingTriggeringMark: () => boolean;
  hasTriggeringMark: boolean;
  isTriggering: boolean;
  reset: () => this;
  setIsTriggering: (isTriggering: boolean) => this;
  setText: (text: string) => this;
}

export class EmojiTriggeringController implements IEmojiTriggeringController {
  private _hasTriggeringMark = false;
  private _isTriggering = false;
  protected pos: any;
  protected text = '';

  constructor(
    protected options: EmojiTriggeringControllerOptions = emojiTriggeringControllerOptions
  ) {}

  private endsWithEnclosingMark(text: string) {
    return new RegExp(`${this.options.trigger}$`).test(text);
  }

  private startsWithTriggeringMark(text: string) {
    return new RegExp(`^${this.options.trigger}`).test(text);
  }

  getText() {
    return this.text.replaceAll(/^:|:$/g, '');
  }

  getTextSize() {
    return this.text.length;
  }

  hasEnclosingTriggeringMark(): boolean {
    return this.endsWithEnclosingMark(this.text);
  }

  reset() {
    this.text = '';
    this.setIsTriggering(false);
    this._hasTriggeringMark = false;

    return this;
  }

  setIsTriggering(isTriggering: boolean) {
    this._isTriggering = isTriggering;

    return this;
  }

  setText(text: string) {
    this._hasTriggeringMark = this.startsWithTriggeringMark(text);

    this.setIsTriggering(
      this._hasTriggeringMark && text.length > this.options.limitTriggeringChars
    );

    this.text = this.isTriggering ? text : '';

    return this;
  }

  get hasTriggeringMark(): boolean {
    return this._hasTriggeringMark;
  }

  get isTriggering(): boolean {
    return this._isTriggering;
  }
}
