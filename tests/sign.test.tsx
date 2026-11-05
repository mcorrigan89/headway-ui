import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteBullet } from '@/components/ui/route-bullet';
import { Sign, SignContent, SignTitle } from '@/components/ui/sign';

describe('Sign', () => {
  it('is a black band with the rule, holding its title and bullets', () => {
    const { container } = render(
      <Sign>
        <SignContent>
          <SignTitle>Downtown</SignTitle>
        </SignContent>
        <RouteBullet route="4" />
      </Sign>,
    );
    const sign = container.querySelector('[data-slot=sign]');
    expect(sign).toHaveClass('sign', 'sign-rule');
    expect(sign).toHaveTextContent('Downtown');
    expect(screen.getByRole('img', { name: '4 train' })).toBeInTheDocument();
  });

  it('can drop the rule', () => {
    const { container } = render(<Sign rule={false}>Exit</Sign>);
    expect(container.querySelector('[data-slot=sign]')).not.toHaveClass('sign-rule');
  });
});

describe('Card', () => {
  it('makes its header a sign band on request', () => {
    const { container } = render(
      <Card>
        <CardHeader variant="sign">
          <CardTitle>Uptown</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(container.querySelector('[data-slot=card-header]')).toHaveClass('sign', 'sign-rule');
  });
});
