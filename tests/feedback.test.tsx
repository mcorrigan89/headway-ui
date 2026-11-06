import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Banner } from '@/components/ui/banner';
import { BusyHold, formatElapsed } from '@/components/ui/busy-hold';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, ConfirmDialogHost, confirm } from '@/components/ui/confirm-dialog';
import { ErrorPage } from '@/components/ui/error-page';
import { KeyHint, KeyHints } from '@/components/ui/key-hints';
import { Lightbox, type LightboxImage } from '@/components/ui/lightbox';
import { QueryState, QueryTableState } from '@/components/ui/query-state';
import { SpotlightCallout, SpotlightTour } from '@/components/ui/spotlight';
import { Table, TableBody } from '@/components/ui/table';
import { FEEDBACK_DEMOS } from '@/docs/demos/feedback';

// jsdom lacks a few things Base UI reaches for
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.getAnimations ??= () => [];
globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
})) as typeof globalThis.matchMedia;

afterEach(() => {
  vi.useRealTimers();
});

describe('QueryState', () => {
  it('shows loading, not the page or an empty state, while pending', () => {
    render(
      <QueryState query={{ status: 'pending' }} isEmpty empty="No trains">
        {() => <p>Arrival list</p>}
      </QueryState>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByText('Arrival list')).not.toBeInTheDocument();
    expect(screen.queryByText('No trains')).not.toBeInTheDocument();
  });

  it('shows a failure with the reason and a working Try again', async () => {
    const refetch = vi.fn();
    render(
      <QueryState query={{ status: 'error', error: new Error('Timed out'), refetch }} what="the arrivals" isEmpty empty="No trains">
        {() => <p>Arrival list</p>}
      </QueryState>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Couldn’t load the arrivals.');
    expect(alert).toHaveTextContent('Timed out');
    expect(alert).toHaveAttribute('data-variant', 'destructive');
    expect(screen.queryByText('No trains')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows empty only after success, and the page otherwise; explicit props work too', () => {
    const { rerender } = render(
      <QueryState status="success" isEmpty empty="No trains">
        {() => <p>Arrival list</p>}
      </QueryState>,
    );
    expect(screen.getByText('No trains')).toBeInTheDocument();
    rerender(<QueryState status="success">{() => <p>Arrival list</p>}</QueryState>);
    expect(screen.getByText('Arrival list')).toBeInTheDocument();
  });

  it('renders one spanning table row for each state, and nothing when there are rows', () => {
    const table = (ui: React.ReactNode) => (
      <Table>
        <TableBody>{ui}</TableBody>
      </Table>
    );
    const { rerender, container } = render(
      table(<QueryTableState status="error" error="Server error" colSpan={4} isEmpty empty="No trains match." what="the arrivals" />),
    );
    expect(container.querySelector('td')).toHaveAttribute('colspan', '4');
    expect(screen.getByRole('alert')).toHaveTextContent('Couldn’t load the arrivals. Server error');
    rerender(table(<QueryTableState status="success" colSpan={4} isEmpty empty="No trains match." />));
    expect(screen.getByText('No trains match.')).toBeInTheDocument();
    rerender(table(<QueryTableState status="success" colSpan={4} isEmpty={false} empty="No trains match." />));
    expect(container.querySelector('[data-slot=query-table-state]')).toBeNull();
  });
});

describe('Spotlight', () => {
  it('rings the target in the ring colour, labels a section, and cleans up on Escape', async () => {
    function Demo() {
      const ref = useRef<HTMLDivElement>(null);
      const [open, setOpen] = useState(true);
      return (
        <>
          <div ref={ref} className="border" data-testid="fares">
            Fares
          </div>
          <SpotlightCallout target={ref} kind="section" label="Fares" open={open} onOpenChange={setOpen}>
            What this trip costs.
          </SpotlightCallout>
        </>
      );
    }
    render(<Demo />);
    const callout = await screen.findByRole('dialog');
    expect(callout).toHaveTextContent('What this trip costs.');
    expect(callout).toHaveClass('on-sign', 'bg-popover');
    const target = screen.getByTestId('fares');
    expect(target).toHaveClass('outline-ring', 'border');
    expect(target).toHaveAttribute('data-spotlight-label', 'Fares');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // our classes go; the target's own stay
    expect(target).not.toHaveClass('outline-ring');
    expect(target).toHaveClass('border');
    expect(target).not.toHaveAttribute('data-spotlight-label');
  });

  it('does not dismiss on an outside click', async () => {
    const onOpenChange = vi.fn();
    render(
      <>
        <button type="button">Elsewhere</button>
        <div id="save">Save trip</div>
        <SpotlightCallout target="#save" label="Save trip" onOpenChange={onOpenChange} />
      </>,
    );
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('waits for a selector, then reports a missing target', async () => {
    vi.useFakeTimers();
    const onMissing = vi.fn();
    render(<SpotlightCallout target="#nowhere" label="Nowhere" waitFor={500} onTargetMissing={onMissing} />);
    await act(async () => {
      vi.advanceTimersByTime(700);
    });
    expect(onMissing).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('steps through a tour with Next, Back and Done', async () => {
    const onFinish = vi.fn();
    render(
      <>
        <div id="a">Route</div>
        <div id="b">Fares</div>
        <SpotlightTour
          title="Planning a trip"
          onFinish={onFinish}
          steps={[
            { target: '#a', label: 'Route', body: 'Which trains.' },
            { target: '#b', label: 'Fares', body: 'What you pay.' },
          ]}
        />
      </>,
    );
    expect(await screen.findByText('Step 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('Planning a trip')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByText('Step 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('What you pay.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByText('Step 1 of 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Done' }));
    expect(onFinish).toHaveBeenCalledOnce();
  });
});

describe('ConfirmDialog', () => {
  it('focuses Cancel, shows destructive styling, and stays pending until the action settles', async () => {
    let finish!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(
      <ConfirmDialog
        trigger={<Button>Suspend service</Button>}
        title="Suspend the G?"
        details={['14 trips are cancelled']}
        confirmLabel="Suspend"
        destructive
        onConfirm={onConfirm}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Suspend service' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('14 trips are cancelled');
    expect(dialog.querySelector('[data-slot=alert-dialog-media]')).toHaveClass('bg-destructive');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus());
    const action = screen.getByRole('button', { name: 'Suspend' });
    expect(action).toHaveClass('bg-destructive');
    await userEvent.click(action);
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute('aria-busy', 'true');
    // Escape can't close it while pending
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await act(async () => finish());
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('stays open and says why when the action fails', async () => {
    render(
      <ConfirmDialog
        defaultOpen
        title="Publish this notice?"
        confirmLabel="Publish"
        onConfirm={() => Promise.reject(new Error('The notice has no end date.'))}
      />,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Publish' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The notice has no end date.');
    expect(screen.getByRole('alert')).toHaveClass('text-error');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('answers confirm() with true or false', async () => {
    render(<ConfirmDialogHost />);
    let answer: Promise<boolean>;
    act(() => {
      answer = confirm({ title: 'Discard changes?', confirmLabel: 'Discard' });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    await expect(answer!).resolves.toBe(true);
    act(() => {
      answer = confirm({ title: 'Discard changes?', confirmLabel: 'Discard' });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await expect(answer!).resolves.toBe(false);
  });
});

describe('Banner', () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => window.localStorage.clear());

  it('folds its details behind a chevron, with the routes it affects', async () => {
    render(<Banner tone="warning" routes={['A', 'C']} title="No trains to Euclid Av" collapsible items={['Take shuttle buses']} />);
    const region = screen.getByRole('region', { name: 'No trains to Euclid Av' });
    expect(region).toHaveClass('bg-warning', 'text-warning-foreground');
    expect(within(region).getByRole('img', { name: 'A train' })).toBeInTheDocument();
    expect(screen.queryByText('Take shuttle buses')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Show details' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(screen.getByText('Take shuttle buses')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('is a sign band by default, and remembers being dismissed by key', async () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <Banner title="Fare capping covers express buses" dismissible dismissKey="capping-2026" onDismiss={onDismiss} />,
    );
    expect(screen.getByRole('region', { name: 'Fare capping covers express buses' })).toHaveClass('sign', 'sign-rule', 'on-sign');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    unmount();
    render(<Banner title="Fare capping covers express buses" dismissible dismissKey="capping-2026" />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});

// ---- lightbox -----------------------------------------------------------------

const PAGES: LightboxImage[] = [
  {
    src: 'data:image/png;base64,iVBORw0KGgo=',
    alt: 'Mezzanine',
    caption: 'station-map.pdf · p. 1',
    regions: [{ x: 0.1, y: 0.2, width: 0.3, height: 0.1, label: 'Elevator' }],
  },
  { src: 'data:image/png;base64,iVBORw0KGgo=', alt: 'Platforms', caption: 'station-map.pdf · p. 2' },
];

describe('Lightbox', () => {
  it('opens from its trigger with the caption and regions', async () => {
    const user = userEvent.setup();
    render(<Lightbox images={PAGES} trigger={<Button>View map</Button>} />);
    await user.click(screen.getByRole('button', { name: 'View map' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('station-map.pdf · p. 1')).toBeInTheDocument();
    expect(within(dialog).getByText('1 of 2')).toBeInTheDocument();
    fireEvent.load(within(dialog).getByRole('img', { name: 'Mezzanine' }));
    const region = dialog.querySelector('[data-slot=lightbox-region]') as HTMLElement;
    expect(region).toHaveStyle({ left: '10%', top: '20%', width: '30%', height: '10%' });
    expect(region).toHaveClass('border-ring');
    expect(region).toHaveTextContent('Elevator');
  });

  it('steps through the set with buttons and arrow keys', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    render(<Lightbox images={PAGES} defaultOpen onIndexChange={onIndexChange} />);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Previous' })).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'Next' }));
    expect(within(dialog).getByText('station-map.pdf · p. 2')).toBeInTheDocument();
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
    expect(within(dialog).getByRole('button', { name: 'Next' })).toBeDisabled();
    fireEvent.keyDown(within(dialog).getByRole('button', { name: 'Zoom in' }), { key: 'ArrowLeft' });
    expect(within(dialog).getByText('station-map.pdf · p. 1')).toBeInTheDocument();
  });

  it('zooms between fit, 100% and steps', async () => {
    const user = userEvent.setup();
    render(<Lightbox images={[PAGES[0]!]} defaultOpen />);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Next' })).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Fit' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(dialog).getByRole('button', { name: '100%' }));
    expect(within(dialog).getByRole('button', { name: '100%' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(dialog).getByRole('button', { name: 'Zoom in' }));
    expect(within(dialog).getByText('150%')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Zoom out' }));
    await user.click(within(dialog).getByRole('button', { name: 'Zoom out' }));
    expect(within(dialog).getByText('75%')).toBeInTheDocument();
  });
});

describe('BusyHold', () => {
  function Form({ busy }: { busy: boolean }) {
    return (
      <BusyHold busy={busy} label="Planning the trip">
        <label>
          From <input defaultValue="Jay St–MetroTech" />
        </label>
        <button type="button">Save</button>
      </BusyHold>
    );
  }

  it('disables every control inside, says what is happening and keeps the content in view', () => {
    const { rerender } = render(<Form busy={false} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    rerender(<Form busy />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'From' })).toBeDisabled();
    expect(screen.getByRole('group')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Planning the trip');
    expect(screen.getByRole('status')).toHaveClass('on-sign', 'bg-card');
    // still there to read
    expect(screen.getByRole('textbox', { name: 'From' })).toHaveValue('Jay St–MetroTech');

    rerender(<Form busy={false} />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('counts the time so far', () => {
    vi.useFakeTimers();
    render(<Form busy />);
    act(() => {
      vi.advanceTimersByTime(65_000);
    });
    expect(screen.getByText('1m 05s')).toBeInTheDocument();
    expect(formatElapsed(8_400)).toBe('8s');
  });
});

describe('ErrorPage', () => {
  it('says what happened in words, offers a way back and folds the technical message away', async () => {
    const onRetry = vi.fn();
    render(<ErrorPage error={new Error('503 Service Unavailable')} reference="req_7f3a" onRetry={onRetry} homeHref="/home" />);
    expect(screen.getByRole('alert')).toHaveAccessibleName('This page ran into a problem');
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('font-bold');
    expect(screen.getByText('Something went wrong').closest('[data-slot=sign]')).toBeInTheDocument();
    expect(screen.queryByText('503 Service Unavailable')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/home');

    await userEvent.click(screen.getByRole('button', { name: 'Technical details' }));
    expect(await screen.findByText('503 Service Unavailable')).toBeInTheDocument();
    expect(screen.getByText('req_7f3a')).toBeInTheDocument();
  });

  it('has a not-found variant on a station sign, with no details to show', () => {
    render(<ErrorPage variant="not-found" />);
    expect(screen.getByRole('heading', { name: 'We couldn’t find that page' })).toBeInTheDocument();
    expect(screen.getByText('404 · Not found')).toHaveAttribute('data-slot', 'error-page-eyebrow');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Technical details' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/');
  });
});

describe('KeyHints', () => {
  it('is a labelled list of keycaps and what they do', () => {
    render(
      <KeyHints>
        <KeyHint keys={['J', 'K']}>move</KeyHint>
        <KeyHint keys={['1', '7']} range>
          open line
        </KeyHint>
      </KeyHints>,
    );
    const list = screen.getByRole('list', { name: 'Keyboard shortcuts' });
    const [move, line] = within(list).getAllByRole('listitem');
    expect(move!.querySelectorAll('kbd')).toHaveLength(2);
    expect(move).toHaveTextContent('JKmove');
    expect(line!.querySelectorAll('kbd')).toHaveLength(2);
    expect(within(line!).getByLabelText('to')).toHaveTextContent('–');
  });
});

describe('FEEDBACK_DEMOS', () => {
  it('renders every demo', () => {
    for (const Demo of Object.values(FEEDBACK_DEMOS)) {
      const { unmount } = render(<Demo />);
      unmount();
    }
  });
});
