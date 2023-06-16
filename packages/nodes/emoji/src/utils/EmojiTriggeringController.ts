import { emojiTriggeringControllerOptions } from '../constants';
import {
  EmojiTriggeringControllerOptions,
  IEmojiTriggeringController,
} from './EmojiTriggeringController.types';

export class EmojiTriggeringController implements IEmojiTriggeringController {
  private _isTriggering = false;
  private _hasTriggeringMark = false;
  protected text = '';
  protected pos: any;

  constructor(
    protected options: EmojiTriggeringControllerOptions = emojiTriggeringControllerOptions
  ) {}

  get isTriggering(): boolean {
    return this._isTriggering;
  }

  setIsTriggering(isTriggering: boolean) {
    this._isTriggering = isTriggering;
    return this;
  }

  get hasTriggeringMark(): boolean {
    return this._hasTriggeringMark;
  }

  hasEnclosingTriggeringMark(): boolean {
    return this.endsWithEnclosingMark(this.text);
  }

  setText(text: string) {
    this._hasTriggeringMark = this.startsWithTriggeringMark(text);

    this.setIsTriggering(
      this._hasTriggeringMark && text.length > this.options.limitTriggeringChars
    );

    this.text = this.isTriggering ? text : '';

    return this;
  }

  private startsWithTriggeringMark(text: string) {
    return new RegExp(`^${this.options.trigger}`).test(text);
  }

  private endsWithEnclosingMark(text: string) {
    return new RegExp(`${this.options.trigger}$`).test(text);
  }

  getText() {
    return this.text.replace(/(^:)|(:$)/, '');
  }

  getTextSize() {
    return this.text.length;
  }

  reset() {
    this.text = '';
    this.setIsTriggering(false);
    this._hasTriggeringMark = false;
    return this;
  }
}
