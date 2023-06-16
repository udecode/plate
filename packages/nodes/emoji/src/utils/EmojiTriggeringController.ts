import { EMOJI_TRIGGERING_CONTROLLER_OPTIONS } from '../constants';
import {
  EmojiTriggeringControllerOptions,
  IEmojiTriggeringController,
} from './EmojiTriggeringController.types';

export class EmojiTriggeringController implements IEmojiTriggeringController {
  protected text = '';
  protected pos: any;
  // public isTriggering = false;
  private _isTriggering = false;
  public hasTriggeringMark = false;

  constructor(
    protected trigger = ':',
    protected options: EmojiTriggeringControllerOptions = EMOJI_TRIGGERING_CONTROLLER_OPTIONS
  ) {}

  get isTriggering(): boolean {
    return this._isTriggering;
  }

  setIsTriggering(isTriggering: boolean) {
    this._isTriggering = isTriggering;
    return this;
  }

  hasEnclosingTriggeringMark(): boolean {
    return this.endsWithEnclosingMark(this.text);
  }

  setText(text: string) {
    this.hasTriggeringMark = this.startsWithTriggeringMark(text);

    this.setIsTriggering(
      this.hasTriggeringMark && text.length > this.options.limitTriggeringChars
    );

    this.text = this.isTriggering ? text : '';

    return this;
  }

  private startsWithTriggeringMark(text: string) {
    return new RegExp(`^${this.trigger}`).test(text);
  }

  private endsWithEnclosingMark(text: string) {
    return new RegExp(`${this.trigger}$`).test(text);
  }

  getText() {
    let text = this.hasTriggeringMark ? this.text.slice(1) : this.text;
    text = this.hasEnclosingTriggeringMark() ? text.slice(0, -1) : text;

    return text;
  }

  getTextSize() {
    return this.text.length;
  }

  reset() {
    this.text = '';
    this.setIsTriggering(false);
    this.hasTriggeringMark = false;
    return this;
  }
}
