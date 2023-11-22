import { Path } from 'slate';

export interface OpMessage {
  messageType: string;
  data: any;
  inverse: boolean;
}

export interface OpMessagesPlugin {
  /**
   * Handle operaion messages.
   */
  onMessage: (message: OpMessage) => void;

  /**
   * This plugin passes messages using Slate operations by triggering a
   * set_node operation with a path not normally associated with that operation
   * type. By default, this path is [], but any other invalid path can be used
   * in case of conflicts.
   */
  operationPath?: Path;

  /**
   * Automatically catch errors thrown by the onMessage handler. This helps to
   * prevent malicious messages from crashing the editor. Default: true.
   */
  catchErrors?: boolean;
}
