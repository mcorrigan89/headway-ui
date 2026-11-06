import { useState } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CopyButton } from '@/components/ui/copy-button';
import { DateRangePicker, formatDateRange, resolveDateRange, type DateRangeValue } from '@/components/ui/date-range-picker';
import { DownloadLink, formatBytes } from '@/components/ui/download-link';
import { FileUpload, fileMatchesAccept, type FileUploadFile } from '@/components/ui/file-upload';
import { Link } from '@/components/ui/link';
import { NumberInput } from '@/components/ui/number-input';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { parseTime, TimeInput } from '@/components/ui/time-input';
import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from '@/components/ui/toolbar';

// jsdom lacks a few things Base UI's popups reach for
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView ??= function () {};

describe('Link', () => {
  it('opens an external link in a new tab and says so', () => {
    render(
      <Link href="https://example.org" external>
        Fare board
      </Link>,
    );
    const link = screen.getByRole('link', { name: /Fare board/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
    expect(link).toHaveTextContent('(opens in a new tab)');
    expect(link).toHaveAttribute('data-slot', 'link');
    expect(link).toHaveClass('decoration-2', 'hover:decoration-4');
  });

  it('renders as a button, and a disabled link has no href', async () => {
    const onClick = vi.fn();
    render(
      <>
        {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- the Link's children name it */}
        <Link render={<button type="button" />} onClick={onClick}>
          Resend alert
        </Link>
        <Link href="/archive" disabled>
          Archive
        </Link>
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Resend alert' }));
    expect(onClick).toHaveBeenCalledOnce();
    const archive = screen.getByText('Archive');
    expect(archive).not.toHaveAttribute('href');
    expect(archive).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('SegmentedControl', () => {
  it('chooses one option and never none', async () => {
    const onValueChange = vi.fn();
    function Demo() {
      const [value, setValue] = useState('list');
      return (
        <SegmentedControl
          aria-label="View"
          value={value}
          onValueChange={(v) => {
            setValue(v);
            onValueChange(v);
          }}
        >
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="map">Map</SegmentedControlItem>
          <SegmentedControlItem value="timetable" disabled>
            Timetable
          </SegmentedControlItem>
        </SegmentedControl>
      );
    }
    render(<Demo />);
    const list = screen.getByRole('button', { name: 'List' });
    const map = screen.getByRole('button', { name: 'Map' });
    expect(list).toHaveAttribute('aria-pressed', 'true');
    expect(list).toHaveClass('data-pressed:bg-primary');
    expect(list.className).not.toMatch(/transition/);
    await userEvent.click(list);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(list).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(map);
    expect(onValueChange).toHaveBeenCalledWith('map');
    expect(map).toHaveAttribute('aria-pressed', 'true');
    expect(list).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Timetable' }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('moves focus with the arrow keys and sizes to fit on request', async () => {
    render(
      <SegmentedControl aria-label="Schedule" defaultValue="weekday" fitContent size="sm">
        <SegmentedControlItem value="weekday">Weekday</SegmentedControlItem>
        <SegmentedControlItem value="weekend" highlighted>
          Weekend
        </SegmentedControlItem>
      </SegmentedControl>,
    );
    const group = screen.getByRole('group', { name: 'Schedule' });
    expect(group).toHaveClass('w-fit', 'h-9');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Weekday' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const weekend = screen.getByRole('button', { name: 'Weekend' });
    expect(weekend).toHaveFocus();
    expect(weekend).toHaveAttribute('data-highlighted');
    await userEvent.keyboard(' ');
    expect(weekend).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('Toolbar', () => {
  it('is one tab stop with arrow-key focus between its items', async () => {
    const onPrint = vi.fn();
    render(
      <Toolbar aria-label="Notice actions">
        <ToolbarButton onClick={onPrint} aria-label="Print">
          P
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarButton aria-label="Share">S</ToolbarButton>
        <ToolbarToggle aria-label="Table view">T</ToolbarToggle>
      </Toolbar>,
    );
    expect(screen.getByRole('toolbar', { name: 'Notice actions' })).toHaveAttribute('data-slot', 'toolbar');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Print' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Share' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const toggle = screen.getByRole('button', { name: 'Table view' });
    expect(toggle).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onPrint).toHaveBeenCalledTimes(1);
  });

  it('runs a toggle group and names icon items by their tooltip', async () => {
    const onValueChange = vi.fn();
    render(
      <Toolbar aria-label="Map">
        <ToolbarToggleGroup defaultValue={['lines']} onValueChange={onValueChange}>
          <ToolbarToggle value="lines" tooltip="Show lines">
            L
          </ToolbarToggle>
          <ToolbarToggle value="stations" tooltip="Show stations">
            S
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>,
    );
    const lines = screen.getByRole('button', { name: 'Show lines' });
    expect(lines).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Show stations' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['stations'], expect.anything());
    expect(lines).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('CopyButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies, says Copied, announces it and reverts', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    const onCopy = vi.fn();
    render(
      <CopyButton value="TRP-2026-0418" onCopy={onCopy} timeout={50}>
        Copy trip code
      </CopyButton>,
    );
    await user.click(screen.getByRole('button', { name: 'Copy trip code' }));
    expect(writeText).toHaveBeenCalledWith('TRP-2026-0418');
    expect(onCopy).toHaveBeenCalledWith('TRP-2026-0418');
    expect(await screen.findByRole('button', { name: 'Copied' })).toHaveAttribute('data-state', 'copied');
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
    await act(() => new Promise((r) => setTimeout(r, 80)));
    expect(screen.getByRole('button', { name: 'Copy trip code' })).toHaveAttribute('data-state', 'idle');
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('is icon-only without children and reports a failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'));
    const onError = vi.fn();
    render(<CopyButton value="A41N" label="Copy stop ID" onError={onError} />);
    const button = screen.getByRole('button', { name: 'Copy stop ID' });
    await user.click(button);
    expect(onError).toHaveBeenCalled();
    expect(button).toHaveAttribute('data-state', 'error');
    expect(button).toHaveClass('text-error');
    expect(screen.getByRole('status')).toHaveTextContent("Couldn't copy");
  });

  it('accepts an async value', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    render(<CopyButton value={async () => 'token-123'}>Copy token</CopyButton>);
    await user.click(screen.getByRole('button', { name: 'Copy token' }));
    expect(writeText).toHaveBeenCalledWith('token-123');
  });
});

describe('DownloadLink', () => {
  it('formats sizes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(184_320)).toBe('180 KB');
    expect(formatBytes(2_500_000)).toBe('2.4 MB');
  });

  it('goes from preparing to a link with the file name and size', () => {
    function Harness() {
      const [ready, setReady] = useState(false);
      return (
        <>
          <DownloadLink state={ready ? 'ready' : 'preparing'} href="/timetable.pdf" filename="timetable.pdf" size={184_320} />
          <button type="button" onClick={() => setReady(true)}>
            finish
          </button>
        </>
      );
    }
    const { container } = render(<Harness />);
    const live = container.querySelector('[data-slot=download-link]')!;
    expect(live).toHaveAttribute('aria-live', 'polite');
    expect(live).toHaveTextContent('Preparing timetable.pdf…');
    expect(screen.queryByRole('link')).toBeNull();
    fireEvent.click(screen.getByText('finish'));
    const link = screen.getByRole('link', { name: /timetable\.pdf.*180 KB/ });
    expect(link).toHaveAttribute('href', '/timetable.pdf');
    expect(link).toHaveAttribute('download', 'timetable.pdf');
  });

  it('shows an error with a retry', async () => {
    const onRetry = vi.fn();
    render(<DownloadLink state="error" filename="ridership.csv" onRetry={onRetry} />);
    expect(screen.getByText("Couldn't prepare ridership.csv.")).toHaveClass('text-error');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('as a button, is disabled while preparing', () => {
    render(<DownloadLink state="preparing" variant="button" filename="system-map.pdf" />);
    expect(screen.getByRole('button', { name: /Preparing/ })).toBeDisabled();
  });
});

describe('NumberInput', () => {
  function Controlled(props: Partial<React.ComponentProps<typeof NumberInput>>) {
    const [value, setValue] = useState<number | null>(props.defaultValue ?? null);
    return (
      <>
        <NumberInput aria-label="Headway" {...props} defaultValue={undefined} value={value} onValueChange={setValue} />
        <output data-testid="value">{value === null ? 'empty' : String(value)}</output>
      </>
    );
  }

  it('steps with the buttons and the arrow keys, within min and max', async () => {
    render(<Controlled defaultValue={9} min={0} max={10} />);
    const input = screen.getByRole('textbox', { name: 'Headway' });
    await userEvent.click(screen.getByRole('button', { name: 'Increase' }));
    expect(screen.getByTestId('value')).toHaveTextContent('10');
    expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByTestId('value')).toHaveTextContent('8');
  });

  it('clamps on blur and allows an empty box', async () => {
    render(<Controlled min={1} max={12} />);
    const input = screen.getByRole('textbox', { name: 'Headway' });
    await userEvent.type(input, '40');
    await userEvent.tab();
    expect(screen.getByTestId('value')).toHaveTextContent('12');
    expect(input).toHaveValue('12');
    await userEvent.clear(input);
    await userEvent.tab();
    expect(screen.getByTestId('value')).toHaveTextContent('empty');
  });

  it('shows a prefix and suffix, keeps the precision, and puts aria-required on the input', () => {
    render(<NumberInput aria-label="Fare" aria-required defaultValue={2.9} prefix="$" suffix="USD" precision={2} />);
    const input = screen.getByRole('textbox', { name: 'Fare' });
    expect(input).toHaveValue('2.90');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('$')).toHaveAttribute('data-slot', 'number-input-prefix');
    expect(screen.getByText('USD')).toHaveAttribute('data-slot', 'number-input-suffix');
  });
});

describe('DateRangePicker', () => {
  it('formats ranges like the reference', () => {
    const today = new Date(2026, 10, 5);
    expect(formatDateRange(new Date(2026, 2, 3), new Date(2026, 2, 14), today)).toBe('March 3 – 14');
    expect(formatDateRange(new Date(2026, 2, 3), new Date(2026, 3, 2), today)).toBe('March 3 – April 2');
    expect(formatDateRange(new Date(2026, 2, 3), new Date(2026, 2, 3), today)).toBe('March 3');
    expect(formatDateRange(new Date(2025, 11, 28), new Date(2026, 0, 4), today)).toBe('December 28, 2025 – January 4, 2026');
    expect(formatDateRange(new Date(2025, 2, 3), new Date(2025, 2, 14), today)).toBe('March 3 – 14, 2025');
  });

  it('works presets out again from today', () => {
    const { from, to } = resolveDateRange({ type: 'last-7-days' }, undefined, new Date(2026, 10, 5, 15));
    expect(from).toEqual(new Date(2026, 9, 29));
    expect(to).toEqual(new Date(2026, 10, 5, 23, 59, 59, 999));
    const mtd = resolveDateRange({ type: 'month-to-date' }, undefined, new Date(2026, 10, 5));
    expect(mtd.from).toEqual(new Date(2026, 10, 1));
  });

  it('picks a preset from the popover and closes', async () => {
    const onValueChange = vi.fn();
    render(<DateRangePicker aria-label="Ridership" onValueChange={onValueChange} />);
    const trigger = screen.getByRole('button', { name: /^Ridership: / });
    expect(trigger).toHaveTextContent('Pick a date range');
    expect(trigger).toHaveAccessibleName('Ridership: Pick a date range');
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('button', { name: 'Today' }));
    const value = onValueChange.mock.calls[0]![0] as DateRangeValue;
    expect(value.type).toBe('today');
    expect(value.from?.getHours()).toBe(0);
    expect(value.to?.getHours()).toBe(23);
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Today' })).not.toBeInTheDocument());
  });

  it('takes a typed custom range and moves the end up to a later start', async () => {
    function Demo() {
      const [value, setValue] = useState<DateRangeValue>({
        type: 'custom',
        from: new Date(2026, 2, 3),
        to: new Date(2026, 2, 14, 23, 59, 59, 999),
      });
      return <DateRangePicker aria-label="Service changes" value={value} onValueChange={setValue} />;
    }
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: /^Service changes: / });
    expect(trigger).toHaveTextContent('March 3 – 14');
    await userEvent.click(trigger);
    // a custom value opens on the custom pane
    const end = await screen.findByRole('textbox', { name: 'End date' });
    expect(end).toHaveValue('3/14/2026');
    await userEvent.clear(end);
    await userEvent.type(end, '3/20/2026');
    expect(trigger).toHaveTextContent('March 3 – 20');
    const start = screen.getByRole('textbox', { name: 'Start date' });
    await userEvent.clear(start);
    await userEvent.type(start, '4/2/2026');
    await userEvent.tab();
    expect(trigger).toHaveTextContent('April 2');
    expect(screen.getByRole('button', { name: /Custom range/ })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('TimeInput', () => {
  it('reads times however they are typed', () => {
    expect(parseTime('2:30 pm')).toBe('14:30');
    expect(parseTime('2p')).toBe('14:00');
    expect(parseTime('1430')).toBe('14:30');
    expect(parseTime('12am')).toBe('00:00');
    expect(parseTime('9')).toBe('09:00');
    expect(parseTime('25:00')).toBeNull();
    expect(parseTime('13pm')).toBeNull();
  });

  it('settles typed text on blur and steps with the arrow keys', async () => {
    const onValueChange = vi.fn();
    function Demo() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <TimeInput
          aria-label="Leave at"
          value={value}
          onValueChange={(v) => {
            setValue(v);
            onValueChange(v);
          }}
        />
      );
    }
    render(<Demo />);
    const input = screen.getByRole('textbox', { name: 'Leave at' });
    await userEvent.type(input, '2p');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith('14:00');
    expect(input).toHaveValue('2:00 PM');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('14:15');
    expect(input).toHaveValue('2:15 PM');
  });

  it('emits null when cleared, puts back nonsense, and shows 24-hour time', async () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Closes" value="14:30" onValueChange={onValueChange} hourCycle={24} />);
    const input = screen.getByRole('textbox', { name: 'Closes' });
    expect(input).toHaveValue('14:30');
    await userEvent.clear(input);
    expect(onValueChange).toHaveBeenCalledWith(null);
    onValueChange.mockClear();
    await userEvent.type(input, 'rush hour');
    await userEvent.tab();
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('14:30');
  });

  it('clamps to min and max', async () => {
    const onValueChange = vi.fn();
    render(<TimeInput aria-label="Service" min="05:00" max="23:30" onValueChange={onValueChange} />);
    await userEvent.type(screen.getByRole('textbox', { name: 'Service' }), '4am{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('05:00');
  });
});

describe('FileUpload', () => {
  const pdf = (name = 'notice.pdf', size = 1000) => new File(['x'.repeat(size)], name, { type: 'application/pdf' });

  it('matches files against accept', () => {
    expect(fileMatchesAccept(pdf(), '.pdf')).toBe(true);
    expect(fileMatchesAccept(pdf(), 'application/pdf')).toBe(true);
    expect(fileMatchesAccept(new File([''], 'a.png', { type: 'image/png' }), 'image/*')).toBe(true);
    expect(fileMatchesAccept(new File([''], 'a.png', { type: 'image/png' }), '.pdf')).toBe(false);
    expect(fileMatchesAccept(pdf(), '*')).toBe(true);
  });

  it('opens the file dialog from the zone and lists chosen files', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileUpload multiple onFilesChange={onFilesChange} />);
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    const zone = screen.getByRole('button', { name: /^Drop files here/ });
    // the hidden input sits outside the zone, so the zone holds nothing interactive
    expect(zone).not.toContainElement(input);
    await userEvent.click(zone);
    expect(click).toHaveBeenCalledTimes(1);
    zone.focus();
    await userEvent.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(2);
    await userEvent.upload(input, [pdf('a.pdf'), pdf('b.pdf')]);
    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());
    expect(screen.getByText('a.pdf')).toBeInTheDocument();
    expect(screen.getByText('b.pdf')).toBeInTheDocument();
  });

  it('turns away the wrong type, too big and too many, and says why', async () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    render(
      <FileUpload
        multiple
        accept=".pdf"
        maxSize={2000}
        maxCount={2}
        defaultFiles={[{ uid: '1', name: 'old.pdf' }]}
        onReject={onReject}
        onFilesChange={onFilesChange}
      />,
    );
    const zone = screen.getByRole('button', { name: /^Drop files here/ });
    const files = [pdf('ok.pdf'), new File(['x'], 'photo.png', { type: 'image/png' }), pdf('huge.pdf', 5000), pdf('extra.pdf')];
    fireEvent.dragEnter(zone, { dataTransfer: { files } });
    expect(zone).toHaveAttribute('data-dragging');
    fireEvent.drop(zone, { dataTransfer: { files } });
    expect(zone).not.toHaveAttribute('data-dragging');
    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());
    expect(onReject.mock.calls[0]![0].map((r: { file: File; reason: string }) => `${r.file.name}:${r.reason}`)).toEqual([
      'photo.png:accept',
      'huge.pdf:size',
      'extra.pdf:count',
    ]);
    expect(onFilesChange.mock.calls[0]![0].map((f: FileUploadFile) => f.name)).toEqual(['old.pdf', 'ok.pdf']);
  });

  it('skips files beforeUpload returns false for, and replaces in single mode', async () => {
    const onFilesChange = vi.fn();
    const beforeUpload = vi.fn((file: File) => file.name !== 'skip.pdf');
    const { container } = render(
      <FileUpload defaultFiles={[{ uid: '1', name: 'old.pdf' }]} beforeUpload={beforeUpload} onFilesChange={onFilesChange} />,
    );
    const input = container.querySelector('input[type=file]') as HTMLInputElement;
    await userEvent.upload(input, pdf('skip.pdf'));
    await act(async () => {});
    expect(onFilesChange).not.toHaveBeenCalled();
    await userEvent.upload(input, pdf('new.pdf'));
    await waitFor(() => expect(onFilesChange).toHaveBeenCalled());
    expect(onFilesChange.mock.calls[0]![0].map((f: FileUploadFile) => f.name)).toEqual(['new.pdf']);
    expect(screen.queryByText('old.pdf')).not.toBeInTheDocument();
  });

  it('shows progress and errors, and removes unless onRemove says no', async () => {
    const onRemove = vi.fn((f: FileUploadFile) => f.uid !== 'keep');
    render(
      <FileUpload
        onRemove={onRemove}
        defaultFiles={[
          { uid: 'up', name: 'track-plan.pdf', status: 'uploading', percent: 40 },
          { uid: 'bad', name: 'signage.heic', status: 'error', error: 'HEIC isn’t accepted' },
          { uid: 'keep', name: 'notice.pdf', status: 'done' },
        ]}
      />,
    );
    expect(screen.getByRole('progressbar', { name: 'Uploading track-plan.pdf' })).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByText('HEIC isn’t accepted')).toHaveClass('text-error');
    await userEvent.click(screen.getByRole('button', { name: 'Remove signage.heic' }));
    await waitFor(() => expect(screen.queryByText('signage.heic')).not.toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Remove notice.pdf' }));
    await act(async () => {});
    expect(screen.getByText('notice.pdf')).toBeInTheDocument();
  });

  it('does nothing when disabled, and has a button variant', async () => {
    const { container } = render(
      <>
        <FileUpload disabled />
        <FileUpload variant="button" label="Upload proof" />
      </>,
    );
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type=file]');
    const click = vi.spyOn(inputs[0]!, 'click');
    await userEvent.click(screen.getByRole('button', { name: /^Drop a file here/ }));
    expect(click).not.toHaveBeenCalled();
    const click2 = vi.spyOn(inputs[1]!, 'click');
    await userEvent.click(screen.getByRole('button', { name: 'Upload proof' }));
    expect(click2).toHaveBeenCalledTimes(1);
  });
});
