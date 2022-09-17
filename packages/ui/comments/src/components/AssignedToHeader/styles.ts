import { css } from 'styled-components';

export const assignedToHeaderRootCss = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 12px;
  border-bottom: 1px solid rgb(218, 220, 224);
`;

export const assignedToHeaderAvatarContainerCss = css`
  flex: 0 0 auto;
  margin-right: 10px;
  background-color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
`;

export const assignedToHeaderAssignedToContainerCss = css`
  flex: 1 1 auto;
`;

export const assignedToHeaderAssignedToTextCss = css`
  font-size: 0.75rem;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
`;

export const assignedToHeaderAssignedToUserNameCss = css`
  font-size: 0.875rem;
  font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
  line-height: 1.25rem;
  font-weight: 500;
`;

export const assignedToHeaderActionsCss = css`
  flex: 0 0 auto;
`;
