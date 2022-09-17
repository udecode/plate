import { css } from 'styled-components';

export const threadCommentHeaderCss = css`
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
`;

export const threadCommentHeaderInfoCss = css`
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
`;

export const threadCommentHeaderCreatedByNameCss = css`
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
`;

export const threadCommentHeaderCreatedDateCss = css`
  color: #3c4043;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.3px;
`;

export const threadCommentTextCss = css`
  padding-left: 12px;
  padding-right: 12px;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  white-space: pre-wrap;
`;
