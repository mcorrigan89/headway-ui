import { useEffect, useState, type ReactNode } from 'react';
import { BellRing, CalendarDays, List, MapIcon, Printer, Share2, Table2, ZoomIn, ZoomOut } from 'lucide-react';

import { CopyButton } from '@/components/ui/copy-button';
import { DateRangePicker, type DateRangeValue } from '@/components/ui/date-range-picker';
import { DownloadLink } from '@/components/ui/download-link';
import { FileUpload, type FileUploadFile } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@/components/ui/link';
import { NumberInput } from '@/components/ui/number-input';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { TimeInput } from '@/components/ui/time-input';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarLink,
  ToolbarSeparator,
  ToolbarToggle,
  ToolbarToggleGroup,
} from '@/components/ui/toolbar';

// Demos for the richer inputs, links and file controls, keyed by registry item name.

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function LinkDemo() {
  return (
    <div className="grid gap-3 text-base">
      <p>
        Check the <Link href="#weekend">weekend service changes</Link> before you travel.
      </p>
      <p>
        Fares are set by the{' '}
        <Link href="https://example.org/fares" external>
          transit authority board
        </Link>
        .
      </p>
      <p>
        {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- the Link's children name it */}
        <Link variant="muted" size="sm" render={<button type="button" />}>
          Resend trip alert email
        </Link>
      </p>
      <p>
        <Link href="#archive" disabled>
          Archived timetables
        </Link>
      </p>
    </div>
  );
}

function SegmentedControlDemo() {
  const [view, setView] = useState('list');
  const [period, setPeriod] = useState('weekday');
  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl aria-label="Arrivals view" value={view} onValueChange={setView}>
        <SegmentedControlItem value="list">
          <List /> List
        </SegmentedControlItem>
        <SegmentedControlItem value="timetable">
          <CalendarDays /> Timetable
        </SegmentedControlItem>
        <SegmentedControlItem value="map">
          <MapIcon /> Map
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Schedule" value={period} onValueChange={setPeriod} size="sm" fitContent>
        <SegmentedControlItem value="weekday">Weekday</SegmentedControlItem>
        <SegmentedControlItem value="saturday">Saturday</SegmentedControlItem>
        <SegmentedControlItem value="sunday">Sunday</SegmentedControlItem>
        <SegmentedControlItem value="holiday" disabled>
          Holiday
        </SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl aria-label="Route preference" defaultValue="fastest" fitContent>
        <SegmentedControlItem value="fastest" highlighted>
          Fastest
        </SegmentedControlItem>
        <SegmentedControlItem value="fewer-transfers">Fewer transfers</SegmentedControlItem>
        <SegmentedControlItem value="step-free">Step-free</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

function ToolbarDemo() {
  const [zoom, setZoom] = useState<string[]>(['line']);
  return (
    <div className="flex flex-col gap-6">
      <Toolbar aria-label="Service change actions">
        <ToolbarGroup>
          <ToolbarButton size="sm">
            <BellRing data-icon="inline-start" /> Notify riders
          </ToolbarButton>
          <ToolbarButton tooltip="Print station notice">
            <Printer />
          </ToolbarButton>
          <ToolbarButton tooltip="Share with operations">
            <Share2 />
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarToggle tooltip="Show as table" size="icon">
          <Table2 />
        </ToolbarToggle>
        <ToolbarSeparator />
        <ToolbarLink href="#timetable">View timetable</ToolbarLink>
      </Toolbar>
      <Toolbar aria-label="Map controls" variant="floating">
        <ToolbarButton tooltip="Zoom in">
          <ZoomIn />
        </ToolbarButton>
        <ToolbarButton tooltip="Zoom out">
          <ZoomOut />
        </ToolbarButton>
        <ToolbarSeparator />
        <ToolbarToggleGroup value={zoom} onValueChange={(v) => v.length && setZoom(v)} aria-label="Map layer">
          <ToolbarToggle value="line" size="text">
            Lines
          </ToolbarToggle>
          <ToolbarToggle value="station" size="text">
            Stations
          </ToolbarToggle>
          <ToolbarToggle value="elevator" size="text">
            Elevators
          </ToolbarToggle>
        </ToolbarToggleGroup>
      </Toolbar>
    </div>
  );
}

function CopyButtonDemo() {
  return (
    <div className="grid max-w-lg gap-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tabular-nums">TRP-2026-0418</span>
        <CopyButton value="TRP-2026-0418" label="Copy trip code" variant="ghost" size="icon-sm" />
      </div>
      <div className="flex gap-2">
        <Input readOnly value="A41N" aria-label="Stop ID for 125 St" className="tabular-nums" />
        <CopyButton value="A41N">Copy stop ID</CopyButton>
      </div>
      <div className="flex gap-2">
        <CopyButton value="https://transit.example.org/feeds/gtfs-rt/ace" variant="secondary" size="sm">
          Copy feed URL
        </CopyButton>
        <CopyButton value={() => Promise.reject(new Error('blocked'))} size="sm" errorLabel="Couldn't copy — select it instead">
          Copy (always fails)
        </CopyButton>
      </div>
    </div>
  );
}

function DownloadLinkDemo() {
  const [state, setState] = useState<'preparing' | 'ready' | 'error'>('preparing');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (state !== 'preparing') return;
    // the first build fails, the retry succeeds
    const t = setTimeout(() => setState(attempt === 0 ? 'error' : 'ready'), 1800);
    return () => clearTimeout(t);
  }, [state, attempt]);
  const pdf = 'data:application/pdf;base64,JVBERi0xLjQKJSVFT0YK';
  return (
    <div className="grid max-w-lg gap-6">
      <DownloadLink
        state={state}
        href={pdf}
        filename="a-line-weekday-timetable.pdf"
        label="A line timetable (PDF)"
        size={184_320}
        preparingLabel={state === 'preparing' ? 'Preparing the A line timetable…' : undefined}
        onRetry={() => {
          setAttempt((a) => a + 1);
          setState('preparing');
        }}
      />
      <DownloadLink
        state="ready"
        href={pdf}
        filename="weekend-service-changes.pdf"
        label="Weekend service changes"
        size="PDF, 9 lines on 4 pages"
      />
      <DownloadLink state="preparing" variant="button" filename="system-map.pdf" />
      <DownloadLink state="ready" variant="button" href={pdf} filename="system-map.pdf" label="Download the system map" size={2_412_000} />
      <DownloadLink state="error" filename="ridership-october.csv" errorLabel="The ridership export timed out." onRetry={() => {}} />
    </div>
  );
}

function NumberInputDemo() {
  const [fare, setFare] = useState<number | null>(2.9);
  const [headway, setHeadway] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <Field label="Base fare" htmlFor="demo-fare">
        <NumberInput id="demo-fare" value={fare} onValueChange={setFare} prefix="$" precision={2} min={0} step={0.25} />
      </Field>
      <Field label="Peak headway" htmlFor="demo-headway">
        <NumberInput
          id="demo-headway"
          value={headway}
          onValueChange={setHeadway}
          suffix="min"
          min={2}
          max={30}
          step={1}
          placeholder="e.g. 4"
        />
      </Field>
      <Field label="Cars per train" htmlFor="demo-cars">
        <NumberInput id="demo-cars" defaultValue={10} min={2} max={11} />
      </Field>
      <Field label="Platform (locked)" htmlFor="demo-platform">
        <NumberInput id="demo-platform" defaultValue={2} disabled />
      </Field>
    </div>
  );
}

function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRangeValue>({ type: 'last-7-days' });
  const [changes, setChanges] = useState<DateRangeValue | undefined>();
  return (
    <div className="flex flex-col gap-6">
      <Field label="Ridership period">
        <DateRangePicker value={range} onValueChange={setRange} aria-label="Ridership period" />
      </Field>
      <Field label="Service changes">
        <DateRangePicker value={changes} onValueChange={setChanges} aria-label="Service changes" placeholder="Any time" />
      </Field>
    </div>
  );
}

function TimeInputDemo() {
  const [departs, setDeparts] = useState<string | null>('07:45');
  const [closure, setClosure] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <Field label="Leave at" htmlFor="demo-departs">
        <TimeInput id="demo-departs" value={departs} onValueChange={setDeparts} min="05:00" max="23:30" />
      </Field>
      <Field label="Platform closes (24-hour)" htmlFor="demo-closure">
        <TimeInput id="demo-closure" value={closure} onValueChange={setClosure} hourCycle={24} step={30} />
      </Field>
      <p className="text-sm text-muted-foreground">
        Stored as {departs ?? 'nothing'} and {closure ?? 'nothing'}. Try “2p”, “1430” or the arrow keys.
      </p>
    </div>
  );
}

function FileUploadDemo() {
  const [files, setFiles] = useState<FileUploadFile[]>([
    { uid: 'notice', name: 'g-line-shuttle-notice.pdf', size: 2_400_000, status: 'done', url: '#notice' },
    { uid: 'plan', name: 'track-work-plan.pdf', size: 5_100_000, status: 'uploading', percent: 64 },
    {
      uid: 'photo',
      name: 'platform-signage.heic',
      size: 3_800_000,
      status: 'error',
      error: 'HEIC photos aren’t accepted. Export it as JPG.',
    },
  ]);
  const [rejected, setRejected] = useState<string | null>(null);
  return (
    <div className="flex max-w-xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Label>Service change notices</Label>
        <FileUpload
          multiple
          accept=".pdf,.png,.jpg"
          maxSize={25 * 1024 * 1024}
          maxCount={10}
          files={files}
          onFilesChange={setFiles}
          onReject={(r) =>
            setRejected(
              r
                .map(
                  ({ file, reason }) => `${file.name} (${reason === 'size' ? 'too big' : reason === 'accept' ? 'wrong type' : 'too many'})`,
                )
                .join(', '),
            )
          }
        />
        {rejected && <p className="text-sm text-error">Not added: {rejected}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label>Photos of the station condition</Label>
        <FileUpload multiple accept="image/*" listType="picture-card" label="Drop photos here or browse" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Reduced-fare proof</Label>
        <FileUpload variant="button" accept=".pdf" label="Upload proof" />
      </div>
    </div>
  );
}

export const INPUTS_DEMOS: Record<string, () => ReactNode> = {
  link: LinkDemo,
  'segmented-control': SegmentedControlDemo,
  toolbar: ToolbarDemo,
  'copy-button': CopyButtonDemo,
  'download-link': DownloadLinkDemo,
  'number-input': NumberInputDemo,
  'date-range-picker': DateRangePickerDemo,
  'time-input': TimeInputDemo,
  'file-upload': FileUploadDemo,
};
