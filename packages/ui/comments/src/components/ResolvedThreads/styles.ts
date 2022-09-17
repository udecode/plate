import { css } from 'styled-components';

export const resolvedThreadsRootCss = css`
  background-color: white;
  border-radius: 8px;
  width: 24rem;
  height: 24rem;
  position: absolute;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
  display: flex;
  flex-direction: column;
`;

export const resolvedThreadsHeaderCss = css`
  border-bottom: 1px solid rgb(218, 220, 224);
  padding: 1rem;
  flex: 0 0 auto;

  h2 {
    font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
    font-weight: 500;
    font-size: 1rem;
    margin-top: 0;
    margin-bottom: 0;
  }
`;

export const resolvedThreadsBodyCss = css`
  flex: 1 1 auto;
  padding: 1rem;
  overflow-y: auto;

  & > * {
    margin-bottom: 1rem;
  }

  & > *:last-child {
    margin-bottom: 0;
  }
`;
