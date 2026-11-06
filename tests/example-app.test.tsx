import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ExampleApp } from '@/docs/example-app/app';
import { ALERTS, ROUTES } from '@/docs/example-app/data';

// jsdom gaps the app touches
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.getAnimations ??= () => [];
globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof matchMedia;

const goTo = (hash: string) =>
  act(() => {
    location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });

afterEach(() => {
  location.hash = '';
  localStorage.clear();
});

describe('example app', () => {
  it('lists every line on the status page and links each to its own page', () => {
    location.hash = '#/';
    render(<ExampleApp />);
    expect(screen.getByRole('heading', { level: 1, name: 'Service status' })).toBeInTheDocument();
    for (const route of ROUTES) {
      expect(
        screen
          .getAllByRole('link', { name: new RegExp(route.name) })
          .some((l) => l.getAttribute('href') === `#/lines/${route.id.toLowerCase()}`),
      ).toBe(true);
    }
    expect(screen.getByText('No G trains between Court Sq and Nassau Av')).toBeInTheDocument();
  });

  it('shows a line with its strip map and log, and marks Lines in the nav', () => {
    location.hash = '#/lines/a';
    render(<ExampleApp />);
    expect(screen.getByRole('heading', { level: 1, name: '8 Av Express' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'A train stops' })).toBeInTheDocument();
    expect(screen.getByText('Signal maintainers on site')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getByRole('link', { name: 'Lines' })).toHaveAttribute('aria-current', 'page');
  });

  it('resolves selected alerts in bulk', async () => {
    location.hash = '#/alerts';
    render(<ExampleApp />);
    const active = ALERTS.filter((a) => a.status !== 'resolved').length;
    expect(screen.getAllByRole('checkbox', { name: /^Select SA-/ })).toHaveLength(active);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select SA-0418' }));
    await userEvent.click(screen.getByRole('button', { name: 'Resolve' }));
    expect(screen.queryByRole('checkbox', { name: 'Select SA-0418' })).not.toBeInTheDocument();
  });

  it('checks the new-alert form and adds the alert', async () => {
    location.hash = '#/alerts';
    render(<ExampleApp />);
    await userEvent.click(screen.getByRole('button', { name: 'New alert' }));
    const dialog = await screen.findByRole('dialog', { name: 'New service alert' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Send alert' }));
    expect(within(dialog).getByText('Pick at least one line.')).toBeInTheDocument();
    expect(within(dialog).getByText('Say where it is.')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'L train' }));
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Station' }), 'Bedford Av');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Send alert' }));
    expect(await screen.findByRole('checkbox', { name: 'Select SA-0430' })).toBeInTheDocument();
  });

  it('shows the week’s planned work and a placeholder for the rest', () => {
    location.hash = '#/planned';
    render(<ExampleApp />);
    expect(screen.getByRole('heading', { level: 1, name: /Planned work/ })).toBeInTheDocument();
    goTo('#/people');
    expect(screen.getByText('Not in this sample')).toBeInTheDocument();
  });
});
