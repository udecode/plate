import { css } from 'styled-components';

export const threadCommentEditingRootCss = css`
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
`;

export const threadCommentEditingActionsCss = css`
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
`;

export const threadCommentEditingSaveButtonCss = css`
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
`;

export const threadCommentEditingCancelButtonCss = css`
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
`;
