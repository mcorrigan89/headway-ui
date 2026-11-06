import { useState, type ReactNode } from 'react';
import { Accessibility, ArrowLeftRight, BellRing, Bike, Bus, Plus, TrainFront } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from '@/components/ui/native-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Demos for the form controls, keyed by registry item name.

function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Label>
        <Checkbox defaultChecked />
        Step-free routes only
      </Label>
      <Label>
        <Checkbox />
        Avoid stations with escalator outages
      </Label>
      <Label>
        <Checkbox aria-invalid />
        I agree to the OMNY terms
      </Label>
      <Label>
        <Checkbox disabled />
        Include Express Bus (unavailable)
      </Label>
    </div>
  );
}

function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="pay-per-ride" aria-label="Fare" className="max-w-xs">
      <Label>
        <RadioGroupItem value="pay-per-ride" />
        Pay-per-ride, $2.90
      </Label>
      <Label>
        <RadioGroupItem value="7-day" />
        7-Day Unlimited, $34
      </Label>
      <Label>
        <RadioGroupItem value="30-day" />
        30-Day Unlimited, $132
      </Label>
      <Label>
        <RadioGroupItem value="reduced" disabled />
        Reduced Fare (apply first)
      </Label>
    </RadioGroup>
  );
}

function SwitchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Label>
        <Switch defaultChecked />
        Service alerts for my lines
      </Label>
      <Label>
        <Switch />
        Elevator outage alerts
      </Label>
      <Label>
        <Switch size="sm" defaultChecked />
        Weekend changes only
      </Label>
      <Label>
        <Switch disabled />
        Text messages (no number on file)
      </Label>
    </div>
  );
}

function SliderDemo() {
  const [walk, setWalk] = useState(10);
  return (
    <div className="flex max-w-sm flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-sm">
          <span id="walk-label" className="font-bold">
            Longest walk
          </span>
          <span className="text-muted-foreground tabular-nums">{walk} min</span>
        </div>
        <Slider aria-labelledby="walk-label" value={walk} onValueChange={(v) => setWalk(v as number)} min={0} max={30} />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold">Leave between</span>
        <Slider defaultValue={[7, 10]} min={5} max={24} getAriaLabel={(i) => (i === 0 ? 'Earliest hour' : 'Latest hour')} />
      </div>
    </div>
  );
}

function ToggleDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle aria-label="Accessible stations" defaultPressed>
        <Accessibility />
      </Toggle>
      <Toggle variant="outline">
        <BellRing data-icon="inline-start" />
        Alerts
      </Toggle>
      <Toggle size="sm">Express only</Toggle>
      <Toggle disabled>Ferry</Toggle>
    </div>
  );
}

function ToggleGroupDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ToggleGroup multiple defaultValue={['subway', 'bus']} aria-label="Modes">
        <ToggleGroupItem value="subway">
          <TrainFront data-icon="inline-start" />
          Subway
        </ToggleGroupItem>
        <ToggleGroupItem value="bus">
          <Bus data-icon="inline-start" />
          Bus
        </ToggleGroupItem>
        <ToggleGroupItem value="bike">
          <Bike data-icon="inline-start" />
          Citi Bike
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup variant="outline" spacing={0} defaultValue={['uptown']} aria-label="Direction">
        <ToggleGroupItem value="uptown">Uptown</ToggleGroupItem>
        <ToggleGroupItem value="downtown">Downtown</ToggleGroupItem>
        <ToggleGroupItem value="both">Both</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

function TextareaDemo() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="textarea-feedback">Tell us what happened</Label>
        <Textarea id="textarea-feedback" placeholder="Train, station, time and what you saw" />
      </div>
      <Textarea aria-label="Disabled" disabled defaultValue="Comments are closed for this station." />
    </div>
  );
}

function NativeSelectDemo() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="native-select-borough">Borough</Label>
        <NativeSelect id="native-select-borough" defaultValue="manhattan">
          <NativeSelectOption value="bronx">The Bronx</NativeSelectOption>
          <NativeSelectOption value="brooklyn">Brooklyn</NativeSelectOption>
          <NativeSelectOption value="manhattan">Manhattan</NativeSelectOption>
          <NativeSelectOption value="queens">Queens</NativeSelectOption>
          <NativeSelectOption value="staten-island">Staten Island</NativeSelectOption>
        </NativeSelect>
      </div>
      <NativeSelect size="sm" aria-label="Line" defaultValue="7">
        <NativeSelectOptGroup label="Numbered">
          <NativeSelectOption value="1">1 Broadway–7 Av Local</NativeSelectOption>
          <NativeSelectOption value="7">7 Flushing Local</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Lettered">
          <NativeSelectOption value="A">A 8 Av Express</NativeSelectOption>
          <NativeSelectOption value="L">L 14 St–Canarsie Local</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  );
}

const STATIONS = [
  { value: 'times-sq', label: 'Times Sq–42 St' },
  { value: 'grand-central', label: 'Grand Central–42 St' },
  { value: 'union-sq', label: '14 St–Union Sq' },
  { value: 'atlantic', label: 'Atlantic Av–Barclays Ctr' },
  { value: 'jamaica', label: 'Jamaica Center' },
];

function SelectDemo() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <Select items={STATIONS} defaultValue="union-sq">
        <SelectTrigger className="w-64" aria-label="Station">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Transfer stations</SelectLabel>
            {STATIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger size="sm" aria-label="Alert type">
          <SelectValue placeholder="Alert type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="delays">Delays</SelectItem>
          <SelectItem value="planned">Planned work</SelectItem>
          <SelectItem value="elevators">Elevators and escalators</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function InputOTPDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Label id="otp-label">Code from your OMNY text</Label>
      <InputOTP length={6} aria-labelledby="otp-label">
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

function ButtonGroupDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup aria-label="Trip">
        <Button variant="outline">Earlier</Button>
        <Button variant="outline">Now</Button>
        <Button variant="outline">Later</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Swap stations">
        <Input aria-label="From" defaultValue="Fulton St" className="w-40" />
        <Button variant="secondary" size="icon" aria-label="Swap">
          <ArrowLeftRight />
        </Button>
        <Input aria-label="To" defaultValue="Court Sq" className="w-40" />
      </ButtonGroup>
      <ButtonGroup aria-label="Add value">
        <ButtonGroupText>$</ButtonGroupText>
        <Input aria-label="Amount" defaultValue="20.00" className="w-28" />
        <ButtonGroupSeparator />
        <Button>
          <Plus data-icon="inline-start" />
          Add to card
        </Button>
      </ButtonGroup>
    </div>
  );
}

export const FORMS_DEMOS: Record<string, () => ReactNode> = {
  checkbox: CheckboxDemo,
  'radio-group': RadioGroupDemo,
  switch: SwitchDemo,
  slider: SliderDemo,
  toggle: ToggleDemo,
  'toggle-group': ToggleGroupDemo,
  textarea: TextareaDemo,
  'native-select': NativeSelectDemo,
  select: SelectDemo,
  'input-otp': InputOTPDemo,
  'button-group': ButtonGroupDemo,
};
