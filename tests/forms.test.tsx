import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// jsdom lacks a few things Base UI's popups and sliders reach for
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView ??= function () {};

describe('Checkbox', () => {
  it('checks and unchecks by click and by its label', async () => {
    const onCheckedChange = vi.fn();
    render(
      <Label>
        <Checkbox onCheckedChange={onCheckedChange} />
        Step-free routes only
      </Label>,
    );
    const box = screen.getByRole('checkbox', { name: 'Step-free routes only' });
    expect(box).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(box);
    expect(box).toHaveAttribute('aria-checked', 'true');
    expect(box).toHaveAttribute('data-slot', 'checkbox');
    expect(onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());
    await userEvent.click(screen.getByText('Step-free routes only'));
    expect(box).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles with the space bar and ignores clicks when disabled', async () => {
    render(
      <>
        <Checkbox aria-label="Alerts" />
        <Checkbox aria-label="Ferry" disabled />
      </>,
    );
    await userEvent.tab();
    expect(screen.getByRole('checkbox', { name: 'Alerts' })).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: 'Alerts' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Ferry' }));
    expect(screen.getByRole('checkbox', { name: 'Ferry' })).toHaveAttribute('aria-checked', 'false');
  });
});

describe('RadioGroup', () => {
  function Fares({ onValueChange }: { onValueChange?: (v: unknown) => void }) {
    return (
      <RadioGroup defaultValue="ride" aria-label="Fare" onValueChange={onValueChange}>
        <Label>
          <RadioGroupItem value="ride" />
          Pay-per-ride
        </Label>
        <Label>
          <RadioGroupItem value="week" />
          7-Day Unlimited
        </Label>
        <Label>
          <RadioGroupItem value="month" />
          30-Day Unlimited
        </Label>
      </RadioGroup>
    );
  }

  it('chooses one at a time', async () => {
    const onValueChange = vi.fn();
    render(<Fares onValueChange={onValueChange} />);
    expect(screen.getByRole('radio', { name: 'Pay-per-ride' })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(screen.getByRole('radio', { name: '30-Day Unlimited' }));
    expect(screen.getByRole('radio', { name: '30-Day Unlimited' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Pay-per-ride' })).toHaveAttribute('aria-checked', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith('month', expect.anything());
  });

  it('moves the choice with the arrow keys', async () => {
    render(<Fares />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Pay-per-ride' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: '7-Day Unlimited' })).toHaveFocus();
    expect(screen.getByRole('radio', { name: '7-Day Unlimited' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Switch', () => {
  it('turns on and off, by click and keyboard', async () => {
    render(<Switch aria-label="Service alerts" />);
    const sw = screen.getByRole('switch', { name: 'Service alerts' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(sw).toHaveAttribute('data-size', 'default');
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    expect(sw).toHaveAttribute('data-checked');
    await userEvent.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });
});

// jsdom has no layout, so Base UI keeps the thumbs visibility: hidden until it
// can measure them, and Testing Library won't name a hidden element: find the
// thumbs' inputs by their aria-label instead
function thumb(name: string) {
  const found = screen.getAllByRole('slider', { hidden: true }).find((el) => el.getAttribute('aria-label') === name);
  if (!found) throw new Error(`no slider thumb named ${name}`);
  return found;
}

describe('Slider', () => {
  it('names its thumb and steps with the arrow keys', async () => {
    const onValueChange = vi.fn();
    render(<Slider aria-label="Longest walk" defaultValue={10} max={30} onValueChange={onValueChange} />);
    const input = thumb('Longest walk');
    expect(input).toHaveAttribute('aria-valuenow', '10');
    // the input sits inside the thumb; focus it directly (jsdom has no layout to click on)
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    expect(input).toHaveAttribute('aria-valuenow', '11');
    expect(onValueChange).toHaveBeenLastCalledWith(11, expect.anything());
  });

  it('draws a thumb per value in a range, each with its own name', () => {
    render(<Slider defaultValue={[7, 10]} min={5} max={24} getAriaLabel={(i) => (i === 0 ? 'Earliest' : 'Latest')} />);
    expect(thumb('Earliest')).toHaveAttribute('aria-valuenow', '7');
    expect(thumb('Latest')).toHaveAttribute('aria-valuenow', '10');
  });
});

describe('Toggle', () => {
  it('latches when pressed', async () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Express only</Toggle>);
    const t = screen.getByRole('button', { name: 'Express only' });
    expect(t).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(t);
    expect(t).toHaveAttribute('aria-pressed', 'true');
    expect(onPressedChange).toHaveBeenLastCalledWith(true, expect.anything());
  });
});

describe('ToggleGroup', () => {
  it('allows one pressed at a time by default', async () => {
    render(
      <ToggleGroup defaultValue={['uptown']} aria-label="Direction">
        <ToggleGroupItem value="uptown">Uptown</ToggleGroupItem>
        <ToggleGroupItem value="downtown">Downtown</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Downtown' }));
    expect(screen.getByRole('button', { name: 'Downtown' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Uptown' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('allows several with multiple, and passes variant to its items', async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleGroup multiple variant="outline" spacing={0} onValueChange={onValueChange} aria-label="Modes">
        <ToggleGroupItem value="subway">Subway</ToggleGroupItem>
        <ToggleGroupItem value="bus">Bus</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Subway' }));
    await userEvent.click(screen.getByRole('button', { name: 'Bus' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['subway', 'bus'], expect.anything());
    expect(screen.getByRole('button', { name: 'Bus' })).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('group', { name: 'Modes' })).toHaveAttribute('data-spacing', '0');
  });

  it('moves focus along the row with the arrow keys', async () => {
    render(
      <ToggleGroup aria-label="Direction">
        <ToggleGroupItem value="uptown">Uptown</ToggleGroupItem>
        <ToggleGroupItem value="downtown">Downtown</ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Uptown' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Downtown' })).toHaveFocus();
  });
});

describe('Textarea', () => {
  it('takes typed text', async () => {
    render(<Textarea aria-label="What happened" />);
    const box = screen.getByRole('textbox', { name: 'What happened' });
    await userEvent.type(box, 'Doors stuck at Canal St');
    expect(box).toHaveValue('Doors stuck at Canal St');
    expect(box).toHaveAttribute('data-slot', 'textarea');
  });
});

describe('NativeSelect', () => {
  it('is a real select that changes value', async () => {
    const onChange = vi.fn();
    render(
      <NativeSelect aria-label="Borough" defaultValue="queens" onChange={onChange}>
        <NativeSelectOption value="bronx">The Bronx</NativeSelectOption>
        <NativeSelectOption value="queens">Queens</NativeSelectOption>
      </NativeSelect>,
    );
    const select = screen.getByRole('combobox', { name: 'Borough' });
    expect(select).toHaveValue('queens');
    await userEvent.selectOptions(select, 'bronx');
    expect(select).toHaveValue('bronx');
    expect(onChange).toHaveBeenCalled();
  });
});

describe('Select', () => {
  const items = [
    { value: 'times-sq', label: 'Times Sq–42 St' },
    { value: 'union-sq', label: '14 St–Union Sq' },
  ];

  it('opens a list and picks an option', async () => {
    const onValueChange = vi.fn();
    render(
      <Select items={items} onValueChange={onValueChange}>
        <SelectTrigger aria-label="Station">
          <SelectValue placeholder="Choose a station" />
        </SelectTrigger>
        <SelectContent>
          {items.map((i) => (
            <SelectItem key={i.value} value={i.value}>
              {i.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'Station' });
    expect(trigger).toHaveTextContent('Choose a station');
    await userEvent.click(trigger);
    const listbox = await screen.findByRole('listbox');
    expect(listbox.closest('[data-slot=select-content]')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: '14 St–Union Sq' }));
    expect(onValueChange).toHaveBeenLastCalledWith('union-sq', expect.anything());
    expect(trigger).toHaveTextContent('14 St–Union Sq');
  });
});

describe('InputOTP', () => {
  it('fills one character per slot and reports the code', async () => {
    const onValueChange = vi.fn();
    render(
      <InputOTP length={4} onValueChange={onValueChange} aria-label="Code">
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>,
    );
    const slots = screen.getAllByRole('textbox');
    expect(slots).toHaveLength(4);
    await userEvent.click(slots[0]!);
    await userEvent.keyboard('2468');
    expect(onValueChange).toHaveBeenLastCalledWith('2468', expect.anything());
    expect(slots.map((s) => (s as HTMLInputElement).value).join('')).toBe('2468');
  });
});

describe('ButtonGroup', () => {
  it('is a labelled group of its controls', () => {
    render(
      <ButtonGroup aria-label="When">
        <ButtonGroupText>Leave</ButtonGroupText>
        <Button>Now</Button>
        <Button>Later</Button>
      </ButtonGroup>,
    );
    const group = screen.getByRole('group', { name: 'When' });
    expect(group).toHaveAttribute('data-slot', 'button-group');
    expect(screen.getByText('Leave')).toHaveAttribute('data-slot', 'button-group-text');
    expect(group.querySelectorAll('button')).toHaveLength(2);
  });
});
