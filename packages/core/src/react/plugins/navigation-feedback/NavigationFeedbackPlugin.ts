import { NavigationFeedbackPlugin as NavigationFeedbackBasePlugin } from '../../../lib/plugins/navigation-feedback/NavigationFeedbackPlugin';
import { toTPlatePlugin } from '../../plugin';
import { useNavigationHighlight } from './useNavigationHighlight';

export const NavigationFeedbackPlugin = toTPlatePlugin(
  NavigationFeedbackBasePlugin,
  {
    inject: {
      isElement: true,
      nodeProps: {
        transformProps: ({ element, props, text }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const activeTarget = useNavigationHighlight(element ?? text);

          if (!activeTarget) return props;

          return {
            ...props,
            'data-nav-cycle': String(activeTarget.cycle),
            'data-nav-highlight': activeTarget.variant,
            'data-nav-pulse': String(activeTarget.pulse),
            'data-nav-target': 'true',
            style: {
              ...(props.style ?? {}),
              '--plate-nav-feedback-duration': `${activeTarget.duration}ms`,
            },
          };
        },
      },
    },
  }
);
