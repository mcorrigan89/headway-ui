import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

describe('Table', () => {
  it('is a captioned table with column headers on a sign band', () => {
    render(
      <Table>
        <TableCaption>Departures</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>To</TableHead>
            <TableHead>Min</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Coney Island</TableCell>
            <TableCell>2</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole('table', { name: 'Departures' });
    expect(table).toHaveClass('tabular-nums');
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['To', 'Min']);
    expect(screen.getByRole('columnheader', { name: 'To' }).closest('thead')).toHaveClass('bg-sign');
    expect(screen.getByRole('cell', { name: 'Coney Island' })).toBeInTheDocument();
  });
});
