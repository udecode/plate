import { PathApi } from '@platejs/slate';

import { NavigationFeedbackPlugin as NavigationFeedbackBasePlugin } from '../../../lib/plugins/navigation-feedback/NavigationFeedbackPlugin';
import { toTPlatePlugin } from '../../plugin';

export const NavigationFeedbackPlugin = toTPlatePlugin(
  NavigationFeedbackBasePlugin,
  {
    inject: {
      isElement: true,
      nodeProps: {
        transformProps: ({ api, element, path, props, text }) => {
          const activeTarget = api.navigation.activeTarget();
          const target = element ?? text;

          if (!activeTarget || !target) return props;

          if (!path || !PathApi.equals(activeTarget.path, path)) return props;

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
