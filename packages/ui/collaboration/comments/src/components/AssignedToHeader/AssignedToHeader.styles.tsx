import { createStyles, StyledProps } from '@udecode/plate-styled-components';
import { css, CSSProp } from 'styled-components';

const borderRadius = '8px';

export type AssignedToHeaderStyledProps = StyledProps<{
  avatar: CSSProp;
  assignedTo: CSSProp;
  assignedToLabel: CSSProp;
  assignedToDisplayName: CSSProp;
  done: CSSProp;
}>;

export const createAssignedToHeaderStyles = (
  props: AssignedToHeaderStyledProps & { isAssignedToLoggedInUser: boolean }
) =>
  createStyles(
    {
      prefixClassNames: 'AssignedToHeader',
      ...props,
    },
    {
      root: css`
        display: flex;
        flex-direction: row;
        align-items: center;
        border-top-left-radius: ${borderRadius};
        border-top-right-radius: ${borderRadius};
        color: ${props.isAssignedToLoggedInUser ? 'white' : 'rgb(60, 64, 67)'};
        background-color: ${props.isAssignedToLoggedInUser
          ? '#1a73e8'
          : '#e8f0fe'};
        padding: 12px;
        border-bottom: 1px solid rgb(218, 220, 224);
      `,
      avatar: css`
        flex: 0 0 auto;
        margin-right: 10px;
        background-color: white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
      `,
      assignedTo: css`
        flex: 1 1 auto;
      `,
      assignedToLabel: css`
        font-size: 0.75rem;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
      `,
      assignedToDisplayName: css`
        font-size: 0.875rem;
        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
        line-height: 1.25rem;
        font-weight: 500;
      `,
      done: css`
        flex: 0 0 auto;
      `,
    }
  );
