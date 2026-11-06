import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RouteBullet, routeColor } from '@/components/ui/route-bullet';
import { Arrow } from '@/components/ui/arrow';

describe('RouteBullet', () => {
  it('names a route as a train and colours it by its line', () => {
    render(<RouteBullet route="A" />);
    const bullet = screen.getByRole('img', { name: 'A train' });
    expect(bullet).toHaveClass('bg-line-blue');
    expect(bullet).toHaveTextContent('A');
  });

  it('marks express service', () => {
    render(<RouteBullet route="6" express />);
    expect(screen.getByRole('img', { name: '6 express train' })).toHaveAttribute('data-express', 'true');
  });

  it('takes a colour and any content without claiming to be a train', () => {
    render(<RouteBullet color="purple">3</RouteBullet>);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('bg-line-purple');
  });

  it('maps routes case-insensitively, and unknown ones to nothing', () => {
    expect(routeColor('q')).toBe('yellow');
    expect(routeColor('7')).toBe('purple');
    expect(routeColor('X')).toBeUndefined();
  });

  it('uses dark type on the light colours', () => {
    render(<RouteBullet route="N" />);
    expect(screen.getByRole('img', { name: 'N train' })).toHaveClass('text-[#111]');
  });
});

describe('Arrow', () => {
  it('is hidden when decorative and named when labelled', () => {
    const { container } = render(<Arrow />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    render(<Arrow direction="up-left" label="Exit" />);
    expect(screen.getByRole('img', { name: 'Exit' })).toHaveAttribute('data-direction', 'up-left');
  });
});
