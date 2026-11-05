import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function Example() {
  return (
    <Tabs defaultValue="subway">
      <TabsList>
        <TabsTrigger value="subway">Subway</TabsTrigger>
        <TabsTrigger value="bus">Bus</TabsTrigger>
      </TabsList>
      <TabsContent value="subway">All lines</TabsContent>
      <TabsContent value="bus">All routes</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the chosen panel and switches on click', async () => {
    render(<Example />);
    expect(screen.getByRole('tab', { name: 'Subway' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('All lines');
    await userEvent.click(screen.getByRole('tab', { name: 'Bus' }));
    expect(screen.getByRole('tab', { name: 'Bus' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('All routes');
  });

  it('moves between tabs with the arrow keys', async () => {
    render(<Example />);
    await userEvent.tab();
    expect(screen.getByRole('tab', { name: 'Subway' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Bus' })).toHaveFocus();
  });
});
