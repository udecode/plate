export type EmojiTriggeringControllerOptions = {
  trigger: string;
  limitTriggeringChars: number;
};

export interface IEmojiTriggeringController {
  isTriggering: boolean;
  hasTriggeringMark: boolean;
  setIsTriggering: (isTriggering: boolean) => this;
  setText: (text: string) => this;
  getText: () => string;
  hasEnclosingTriggeringMark: () => boolean;
  getTextSize: () => number;
  reset: () => this;
}
