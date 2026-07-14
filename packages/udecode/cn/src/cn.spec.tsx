import { cva } from 'class-variance-authority';
import { render } from '@testing-library/react';
import * as React from 'react';

import { cn } from './cn';
import { withCn } from './withCn';
import { withProps } from './withProps';
import { withVariants } from './withVariants';

describe('cn utilities', () => {
  it('merges Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('merges default and consumer props while forwarding refs', () => {
    const Button = withProps('button', {
      className: 'px-2',
      type: 'button',
    });
    const ref = React.createRef<HTMLButtonElement>();
    const { getByRole } = render(
      <Button className="px-4" ref={ref}>
        Save
      </Button>
    );
    const button = getByRole('button', { name: 'Save' });

    if (!(button instanceof HTMLButtonElement)) {
      throw new TypeError('Expected a button element');
    }

    expect(button.className).toBe('px-4');
    expect(button.getAttribute('type')).toBe('button');
    expect(ref.current).toBe(button);
  });

  it('adds default classes to intrinsic elements', () => {
    const Card = withCn('div', 'rounded-md');
    const { getByText } = render(<Card className="border">Card</Card>);

    expect(getByText('Card').className).toBe('rounded-md border');
  });

  it('preserves required component props', () => {
    const LabeledButton = React.forwardRef<
      HTMLButtonElement,
      { className?: string; label: string }
    >(({ className, label }, ref) => (
      <button className={className} ref={ref} type="button">
        {label}
      </button>
    ));
    const Button = withCn(LabeledButton, 'font-medium');
    const { getByRole } = render(<Button label="Publish" />);

    expect(getByRole('button', { name: 'Publish' }).className).toBe(
      'font-medium'
    );
  });

  it('applies variants without forwarding variant-only props', () => {
    const variants = cva('font-medium', {
      variants: {
        intent: {
          primary: 'bg-blue-500',
        },
      },
    });
    const Button = withVariants('button', variants, ['intent']);
    const { getByRole } = render(<Button intent="primary">Continue</Button>);
    const button = getByRole('button', { name: 'Continue' });

    if (!(button instanceof HTMLButtonElement)) {
      throw new TypeError('Expected a button element');
    }

    expect(button.className).toBe('font-medium bg-blue-500');
    expect(button.hasAttribute('intent')).toBe(false);
  });
});
