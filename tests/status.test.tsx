import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders a status label in its colour', () => {
    render(<Badge variant="warning">Delays</Badge>);
    expect(screen.getByText('Delays')).toHaveClass('bg-warning', 'text-warning-foreground');
  });

  it('can render as a link', () => {
    // the link's text comes from the badge's children
    // oxlint-disable-next-line jsx-a11y/control-has-associated-label
    render(<Badge render={<a href="#status" />}>Status</Badge>);
    expect(screen.getByRole('link', { name: 'Status' })).toHaveAttribute('href', '#status');
  });
});

describe('Alert', () => {
  it('announces its title and details, and carries its status', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Suspended</AlertTitle>
        <AlertDescription>No service between Court Sq and Nassau Av.</AlertDescription>
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-variant', 'destructive');
    expect(alert).toHaveTextContent('SuspendedNo service between Court Sq and Nassau Av.');
  });
});
