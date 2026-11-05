import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StripMap } from '@/components/ui/strip-map';

const stops = [{ label: 'Jay St' }, { label: 'York St' }, { label: 'East Broadway' }];

describe('StripMap', () => {
  it('lists its stops in order and marks the current one', () => {
    render(<StripMap aria-label="F train" route="F" current={1} stops={stops} />);
    const items = within(screen.getByRole('list', { name: 'F train' })).getAllByRole('listitem');
    expect(items.map((li) => li.getAttribute('data-state'))).toEqual(['passed', 'current', 'ahead']);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).toHaveTextContent('Jay St(passed)');
  });

  it('puts every stop ahead without a current stop', () => {
    render(<StripMap stops={stops} />);
    expect(screen.getAllByRole('listitem').every((li) => li.dataset.state === 'ahead')).toBe(true);
  });

  it('draws the line in the route colour, or the colour given', () => {
    const { rerender } = render(<StripMap route="7" stops={stops} />);
    expect(screen.getByRole('list').style.getPropertyValue('--strip')).toBe('var(--line-purple)');
    rerender(<StripMap color="lime" stops={stops} />);
    expect(screen.getByRole('list').style.getPropertyValue('--strip')).toBe('var(--line-lime)');
  });
});
