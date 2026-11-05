import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { CONTENT_DEMOS } from '@/docs/demos/content';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/ui/markdown';
import { PageHeader } from '@/components/ui/page-header';
import { RouteBullet } from '@/components/ui/route-bullet';
import {
  SettingsSection,
  SettingsSectionContent,
  SettingsSectionDescription,
  SettingsSectionFooter,
  SettingsSectionHeader,
  SettingsSectionPanel,
  SettingsSectionStatus,
  SettingsSectionTitle,
} from '@/components/ui/settings-section';
import { Tile } from '@/components/ui/tile';
import { Tree, type TreeNode } from '@/components/ui/tree';
import { useHotkeys, type HotkeyHandler } from '@/hooks/use-hotkeys';

// jsdom lacks a few things Base UI reaches for
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function () {};
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

describe('Markdown', () => {
  it('renders GitHub-flavoured Markdown, styled in place', () => {
    const { container } = render(
      <Markdown>
        {
          '## Fares\n\n| Ride | Fare |\n| --- | --- |\n| Subway | $2.90 |\n\n~~MetroCard~~ retired, see [OMNY](https://example.com).\n\n- [x] Elevator in service\n- [ ] Escalator in service'
        }
      </Markdown>,
    );
    expect(container.firstChild).toHaveAttribute('data-slot', 'markdown');
    expect(container.firstChild).toHaveClass('[&_h2]:font-bold');
    expect(screen.getByRole('heading', { level: 2, name: 'Fares' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(container.querySelector('[data-slot=markdown-table]')).toHaveClass('on-sign');
    expect(container.querySelector('del')).toHaveTextContent('MetroCard');
    expect(screen.getByRole('link', { name: 'OMNY' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByRole('checkbox', { name: 'Done' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'To do' })).not.toBeChecked();
  });

  it('drops raw HTML and unsafe links', () => {
    const { container } = render(<Markdown>{'Hello <script>alert(1)</script><b>bold</b> [x](javascript:alert(1))'}</Markdown>);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(screen.getByText('x').closest('a')?.getAttribute('href') ?? '').not.toContain('javascript');
  });

  it('passes components overrides through', () => {
    render(<Markdown components={{ h1: ({ children }) => <h1 data-testid="custom">{children}</h1> }}>{'# Title'}</Markdown>);
    expect(screen.getByTestId('custom')).toHaveTextContent('Title');
  });
});

const NODES: TreeNode[] = [
  {
    id: 'subway',
    label: 'Subway',
    children: [
      { id: 'single', label: 'Single ride' },
      { id: 'reduced', label: 'Reduced fare', children: [{ id: 'senior', label: 'Senior fare' }] },
    ],
  },
  { id: 'bus', label: 'Bus', children: [{ id: 'sbs', label: 'Select Bus fare' }] },
  { id: 'transfer', label: 'Transfer fee' },
];

describe('Tree', () => {
  it('exposes the tree roles and levels', () => {
    render(<Tree aria-label="Fares" items={NODES} defaultExpanded={['subway']} />);
    const tree = screen.getByRole('tree', { name: 'Fares' });
    const subway = within(tree).getByRole('treeitem', { name: /^Subway/ });
    expect(subway).toHaveAttribute('aria-expanded', 'true');
    expect(subway).toHaveAttribute('aria-level', '1');
    expect(within(tree).getByRole('treeitem', { name: 'Single ride' })).toHaveAttribute('aria-level', '2');
    expect(within(tree).getByRole('treeitem', { name: /^Bus/ })).toHaveAttribute('aria-expanded', 'false');
    expect(within(tree).queryByRole('treeitem', { name: 'Select Bus fare' })).toBeNull();
    // one tab stop
    expect(
      within(tree)
        .getAllByRole('treeitem')
        .filter((i) => i.tabIndex === 0),
    ).toHaveLength(1);
  });

  it('moves and opens with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Tree aria-label="Fares" items={NODES} />);
    await user.tab();
    const subway = screen.getByRole('treeitem', { name: /^Subway/ });
    expect(subway).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(subway).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('treeitem', { name: 'Single ride' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('treeitem', { name: 'Senior fare' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('treeitem', { name: /^Reduced fare/ })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('treeitem', { name: /^Reduced fare/ })).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{End}');
    expect(screen.getByRole('treeitem', { name: 'Transfer fee' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(subway).toHaveFocus();
    await user.keyboard('b');
    expect(screen.getByRole('treeitem', { name: /^Bus/ })).toHaveFocus();
  });

  it('opens every sibling with * and selects with Enter or a click', async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(<Tree aria-label="Fares" items={NODES} selectionMode="single" onSelectedChange={onSelectedChange} />);
    await user.tab();
    await user.keyboard('*');
    expect(screen.getByRole('treeitem', { name: /^Subway/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: /^Bus/ })).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onSelectedChange).toHaveBeenLastCalledWith('single');
    const single = screen.getByRole('treeitem', { name: 'Single ride' });
    expect(single).toHaveAttribute('aria-selected', 'true');
    expect(single.querySelector('[data-slot=tree-row]')).toHaveClass('bg-primary');
    await user.click(screen.getByText('Select Bus fare'));
    expect(onSelectedChange).toHaveBeenLastCalledWith('sbs');
  });

  it('toggles a branch from its square toggle', async () => {
    const user = userEvent.setup();
    const { container } = render(<Tree aria-label="Fares" items={NODES} />);
    await user.click(container.querySelectorAll('[data-slot=tree-toggle]')[1]!);
    expect(screen.getByRole('treeitem', { name: /^Bus/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('treeitem', { name: 'Select Bus fare' })).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('shows the eyebrow, title, count and a search that clears', async () => {
    function Demo() {
      const [q, setQ] = useState('');
      return (
        <PageHeader
          eyebrow="Service changes"
          title="Planned work"
          count={1280}
          search={q}
          onSearchChange={setQ}
          searchPlaceholder="Search service changes"
          actions={<Button>New notice</Button>}
        />
      );
    }
    render(<Demo />);
    expect(screen.getByRole('heading', { level: 1, name: 'Planned work' })).toHaveClass('text-4xl', 'font-bold');
    expect(screen.getByText('Service changes')).toHaveClass('font-bold');
    expect(screen.getByText('1,280')).toHaveAttribute('data-slot', 'page-header-count');
    const search = screen.getByRole('searchbox', { name: 'Search service changes' });
    await userEvent.type(search, 'canal');
    expect(search).toHaveValue('canal');
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(search).toHaveValue('');
    await userEvent.type(search, 'fulton{Escape}');
    expect(search).toHaveValue('');
  });

  it('shows route bullets passed as the eyebrow', () => {
    render(<PageHeader title="8 Av local" eyebrow={<RouteBullet route="A" />} />);
    expect(screen.getByRole('img', { name: 'A train' })).toBeInTheDocument();
  });
});

describe('Tile', () => {
  it('is a button that reports selection', async () => {
    const onClick = vi.fn();
    render(<Tile title="Plan a trip" description="Door to door" selected onClick={onClick} />);
    const tile = screen.getByRole('button', { name: /Plan a trip/ });
    expect(tile).toHaveAttribute('aria-pressed', 'true');
    expect(tile).toHaveAttribute('data-selected');
    expect(tile).toHaveClass('on-sign', 'data-selected:border-primary');
    await userEvent.click(tile);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is a link with href, and a disabled link goes nowhere', async () => {
    const onClick = vi.fn();
    render(
      <>
        <Tile href="/fares" title="Fares and OMNY" />
        <Tile href="/metrocard" title="MetroCard refills" disabled onClick={onClick} />
      </>,
    );
    expect(screen.getByRole('link', { name: /Fares and OMNY/ })).toHaveAttribute('href', '/fares');
    const disabled = screen.getByText('MetroCard refills').closest('a')!;
    expect(disabled).not.toHaveAttribute('href');
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(disabled);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('SettingsSection', () => {
  it('is a region named by its title, with the form in a panel and a footer', () => {
    render(
      <SettingsSection variant="destructive">
        <SettingsSectionHeader>
          <SettingsSectionTitle>Delete saved trips</SettingsSectionTitle>
          <SettingsSectionDescription>Your fare history is kept.</SettingsSectionDescription>
        </SettingsSectionHeader>
        <SettingsSectionPanel>
          <SettingsSectionContent>You have 6 saved trips.</SettingsSectionContent>
          <SettingsSectionFooter>
            <SettingsSectionStatus>2 with alerts</SettingsSectionStatus>
            <button type="button">Delete</button>
          </SettingsSectionFooter>
        </SettingsSectionPanel>
      </SettingsSection>,
    );
    const section = screen.getByRole('region', { name: 'Delete saved trips' });
    expect(section).toHaveAttribute('data-variant', 'destructive');
    expect(section).toHaveClass('@3xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]');
    expect(within(section).getByRole('heading', { level: 2 })).toHaveClass('font-bold');
    expect(section.querySelector('[data-slot=settings-section-panel]')).toHaveClass('on-sign', 'bg-card');
    expect(within(section).getByRole('status')).toHaveTextContent('2 with alerts');
  });

  it('tracks unsaved changes, cancels and saves (demo)', async () => {
    const Demo = CONTENT_DEMOS['settings-section']!;
    render(<Demo />);
    const section = screen.getByRole('region', { name: 'Service alerts' });
    const save = within(section).getByRole('button', { name: 'Save' });
    expect(save).toBeDisabled();
    const lead = within(section).getByRole('textbox', { name: 'Warn me before my trip (minutes)' });
    await userEvent.clear(lead);
    await userEvent.type(lead, '15');
    expect(within(section).getByRole('status')).toHaveTextContent('Unsaved changes');
    await userEvent.click(within(section).getByRole('button', { name: 'Cancel' }));
    expect(lead).toHaveValue('10');
    await userEvent.type(lead, '0');
    await userEvent.click(save);
    expect(within(section).getByRole('status')).toHaveTextContent('Saved');
    expect(save).toBeDisabled();
  });
});

function Keys({ keys, enabled }: { keys: Record<string, HotkeyHandler>; enabled?: boolean }) {
  useHotkeys(keys, { enabled });
  return (
    <>
      <input aria-label="Search" />
      <button type="button">Save</button>
      <div role="dialog">
        <button type="button">In dialog</button>
      </div>
    </>
  );
}

describe('useHotkeys', () => {
  it('fires single keys case-insensitively, but not while typing or in a dialog', async () => {
    const save = vi.fn();
    render(<Keys keys={{ s: save }} />);
    await userEvent.keyboard('s');
    await userEvent.keyboard('S');
    expect(save).toHaveBeenCalledTimes(2);
    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }));
    await userEvent.keyboard('s');
    expect(save).toHaveBeenCalledTimes(2);
    screen.getByRole('button', { name: 'In dialog' }).focus();
    await userEvent.keyboard('s');
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('runs mod+ bindings from a field and ignores plain keys with a modifier held', async () => {
    const palette = vi.fn();
    const save = vi.fn();
    render(<Keys keys={{ 'mod+k': palette, s: save }} />);
    await userEvent.click(screen.getByRole('textbox', { name: 'Search' }));
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(palette).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Meta>}k{/Meta}');
    expect(palette).toHaveBeenCalledTimes(2);
    (document.activeElement as HTMLElement).blur();
    await userEvent.keyboard('{Control>}s{/Control}');
    expect(save).not.toHaveBeenCalled();
  });

  it('prevents the default unless the handler returns false, and can be disabled', () => {
    const { rerender } = render(<Keys keys={{ '/': () => {}, escape: () => false }} />);
    const slash = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
    document.body.dispatchEvent(slash);
    expect(slash.defaultPrevented).toBe(true);
    const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    document.body.dispatchEvent(esc);
    expect(esc.defaultPrevented).toBe(false);
    rerender(<Keys keys={{ '/': () => {} }} enabled={false} />);
    const again = new KeyboardEvent('keydown', { key: '/', bubbles: true, cancelable: true });
    document.body.dispatchEvent(again);
    expect(again.defaultPrevented).toBe(false);
  });

  it('only fires shift+ bindings with Shift held', async () => {
    const back = vi.fn();
    render(<Keys keys={{ 'shift+j': back }} />);
    await userEvent.keyboard('j');
    expect(back).not.toHaveBeenCalled();
    await userEvent.keyboard('{Shift>}J{/Shift}');
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('moves and saves in the demo', async () => {
    const Demo = CONTENT_DEMOS['use-hotkeys']!;
    render(<Demo />);
    await userEvent.keyboard('js');
    expect(screen.getByText('Saved the N to Coney Island–Stillwell Av')).toBeInTheDocument();
    await userEvent.keyboard('/');
    expect(screen.getByRole('textbox', { name: 'Search stations' })).toHaveFocus();
  });
});

describe('CONTENT_DEMOS', () => {
  it('renders every demo', () => {
    for (const [name, Demo] of Object.entries(CONTENT_DEMOS)) {
      const { unmount } = render(<Demo />);
      expect(document.body.textContent, name).not.toBe('');
      unmount();
    }
  });
});
