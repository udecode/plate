import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css, CSSProp } from 'styled-components';

export const createThreadStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'Thread',
      ...props,
    },
    {
      root: css`
        border-radius: 8px;
        box-shadow: 0 2px 6px 2px rgb(60 64 67 / 15%);
        background-color: white;
        border: 1px solid white;
      `,
    }
  );

export const createCommentHeaderStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadCommentHeader',
      ...props,
    },
    {
      root: css`
        box-sizing: content-box;
        font-weight: normal;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        text-align: left;
        color: black;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-size: 14px;
        direction: ltr;
        cursor: default;
        -webkit-user-select: text;
        height: 38px;
        white-space: nowrap;
        display: flex;
        margin: 0;
        padding: 12px;
        align-items: center;
      `,
    }
  );

export const createAuthorTimestampStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadAuthorTimestamp',
      ...props,
    },
    {
      root: css`
        font-weight: normal;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        text-align: left;
        color: black;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-size: 14px;
        cursor: pointer;
        direction: ltr;
        -webkit-user-select: text;
        padding-left: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -webkit-box-flex: 1;
        flex-grow: 1;
        display: flex;
        align-items: start;
        flex-direction: column;
        justify-content: center;
      `,
    }
  );

export const createCommenterNameStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadCommenterName',
      ...props,
    },
    {
      root: css`
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        text-align: left;
        direction: ltr;
        cursor: default;
        -webkit-user-select: text;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
        height: 18px;
        align-self: stretch;
        color: #3c4043;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 0.25px;
        line-height: 20px;
        margin-right: 0.25rem;
      `,
    }
  );

export const createTimestampStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadTimestamp',
      ...props,
    },
    {
      root: css`
        color: #3c4043;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.3px;
      `,
    }
  );

export const createCommentInputStyles = (props: StyledProps) =>
  createStyles<StyledProps<{ commentInputReply: CSSProp }>>(
    {
      prefixClassNames: 'ThreadCommentInput',
      ...props,
    } as any,
    {
      root: css`
        font-weight: normal;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        color: black;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        white-space: normal;
        font-size: 14px;
        cursor: default;
        -webkit-user-select: text;
        direction: ltr;
        unicode-bidi: isolate;
        position: relative;
        outline: none;
        zoom: 1;
        border: none;
        background-color: #fff;
        padding: 12px;
        display: block !important;
        padding-top: 0;
        text-align: left;
      `,
      commentInputReply: css`
        border-top: 1px solid rgb(218, 220, 224);
        padding-top: 12px;
        margin-top: 12px;
      `,
    }
  );

export const createTextAreaStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadTextArea',
      ...props,
    },
    {
      root: css`
        color: #3c4043;
        line-height: 20px;
        height: 38px;
        border: 1px solid #dadce0;
        border-radius: 4px;
        box-sizing: border-box;
        font-size: 14px;
        min-height: 36px;
        padding: 8px;
        display: block;
        margin: 0;
        overflow-x: hidden;
        overflow-y: hidden;
        outline-width: 0 !important;
        resize: none;
        width: 100%;
        cursor: text;
        text-align: start;
        word-wrap: break-word;
      `,
    }
  );

export const createButtonsStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadButtons',
      ...props,
    },
    {
      root: css`
        font-weight: normal;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        color: black;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        white-space: normal;
        font-size: 14px;
        cursor: pointer;
        direction: ltr;
        -webkit-user-select: text;
        zoom: 1;
        text-align: left;
        padding-top: 8px;
        display: block;
      `,
    }
  );

export const createCommentButtonStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadCommentButton',
      ...props,
    },
    {
      root: css`
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        direction: ltr;
        position: relative;
        display: inline-block;
        text-align: center;
        white-space: nowrap;
        outline: 0px;
        margin: 0 8px 0 0;
        min-width: 24px;
        vertical-align: middle;
        border: 1px solid transparent !important;
        border-radius: 4px;
        box-shadow: none;
        box-sizing: border-box;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 0.25px;
        line-height: 16px;
        height: 24px;
        padding: 3px 12px 5px;
        background-color: #1a73e8;
        color: #fff;
        user-select: none;
        cursor: pointer;

        &:hover {
          background-color: #2b7de9;
          box-shadow: 0 1px 3px 1px rgb(66 133 244 / 15%);
          color: #fff;
        }

        &:active {
          background-color: #63a0ef;
          box-shadow: 0 2px 6px 2px rgb(66 133 244 / 15%);
          color: #fff;
        }

        &[disabled] {
          background-color: #f1f3f4;
          color: #3c4043;
          opacity: 0.38;
          cursor: default;
        }
      `,
    }
  );

export const createCancelButtonStyles = (props: StyledProps) =>
  createStyles(
    {
      prefixClassNames: 'ThreadCommentButton',
      ...props,
    },
    {
      root: css`
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        direction: ltr;
        position: relative;
        display: inline-block;
        text-align: center;
        white-space: nowrap;
        outline: 0px;
        margin: 0 8px 0 0;
        min-width: 24px;
        vertical-align: middle;
        border-radius: 4px;
        box-shadow: none;
        box-sizing: border-box;
        font-weight: 500;
        font-size: 14px;
        letter-spacing: 0.25px;
        line-height: 16px;
        background: white;
        border: 1px solid #dadce0 !important;
        height: 24px;
        padding: 3px 12px 5px;
        color: #1a73e8;
        user-select: none;
        cursor: pointer;

        &:hover {
          background-color: #f8fbff;
          border-color: #cce0fc !important;
        }

        &:active {
          background-color: #e1ecfe;
          color: #1a73e8;
        }

        &:hover:active {
          box-shadow: 0 2px 6px 2px rgb(60 64 67 / 15%);
        }
      `,
    }
  );
