import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from 'lucide-react';

// Toasts as black panels in either mode, laid out like the alert: a status
// rail down the left edge and the icon on a tile of the same colour (ok green,
// warning yellow, destructive red, info blue; white for a plain message), then
// a bold title and the details. The rail keys off sonner's data-type
// attribute: sonner adds the `default` class to EVERY toast, so per-type
// border classes would fight it. Sonner runs unstyled, so nothing of its own
// theme leaks in, and the panels are always black, so its theme is fixed.

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    position="bottom-right"
    gap={10}
    icons={{
      success: <CircleCheckIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast:
          'on-sign group flex w-(--width) items-start gap-3 rounded-none border border-border border-l-4! border-l-primary! bg-popover px-4 py-3 text-sm leading-snug text-popover-foreground shadow-lg data-[type=error]:border-l-destructive! data-[type=info]:border-l-info! data-[type=loading]:border-l-muted-foreground! data-[type=success]:border-l-ok! data-[type=warning]:border-l-warning!',
        title: 'text-base leading-tight font-bold tracking-tight text-foreground',
        description: 'mt-0.5 text-sm text-muted-foreground',
        icon: 'm-0! flex! size-6! shrink-0 items-center! justify-center! bg-primary text-primary-foreground',
        content: 'flex min-w-0 flex-1 flex-col',
        success: '[&_[data-icon]]:bg-ok [&_[data-icon]]:text-ok-foreground',
        error: '[&_[data-icon]]:bg-destructive [&_[data-icon]]:text-destructive-foreground',
        warning: '[&_[data-icon]]:bg-warning [&_[data-icon]]:text-warning-foreground',
        info: '[&_[data-icon]]:bg-info [&_[data-icon]]:text-info-foreground',
        loading: '[&_[data-icon]]:bg-transparent [&_[data-icon]]:text-muted-foreground',
        actionButton:
          'ml-auto h-8 shrink-0 bg-primary px-3 text-xs font-bold text-primary-foreground outline-none hover:bg-primary/85 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid',
        cancelButton:
          'ml-auto h-8 shrink-0 border-2 border-foreground px-3 text-xs font-bold text-foreground outline-none hover:bg-foreground hover:text-background focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid',
        closeButton:
          'absolute top-1.5 right-1.5 border-0 bg-transparent text-muted-foreground outline-none hover:text-foreground focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-solid',
      },
    }}
    {...props}
  />
);

export { Toaster };
