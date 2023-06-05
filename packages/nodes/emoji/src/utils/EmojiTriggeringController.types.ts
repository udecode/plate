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
  isEnclosingTriggeringCharacter: (char: string) => boolean;
}
