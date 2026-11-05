import { cn } from '@/lib/utils';

// The signage arrow: a heavy shaft and a broad head, in eight directions.
// It is as tall as the text around it (1em). Decorative unless given a label.

type Direction = 'up' | 'up-right' | 'right' | 'down-right' | 'down' | 'down-left' | 'left' | 'up-left';

const ANGLE: Record<Direction, number> = {
  right: 0,
  'down-right': 45,
  down: 90,
  'down-left': 135,
  left: 180,
  'up-left': 225,
  up: 270,
  'up-right': 315,
};

type ArrowProps = Omit<React.ComponentProps<'svg'>, 'direction'> & {
  direction?: Direction;
  /** An accessible name, such as "Exit". Without one the arrow is hidden from assistive tech. */
  label?: string;
};

function Arrow({ direction = 'right', label, className, ...props }: ArrowProps) {
  return (
    <svg
      data-slot="arrow"
      data-direction={direction}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={cn('h-[1em] w-[1em] shrink-0', className)}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...props}
    >
      <polygon points="8,40 50,40 50,12 92,50 50,88 50,60 8,60" transform={`rotate(${ANGLE[direction]} 50 50)`} />
    </svg>
  );
}

export { Arrow, type Direction };
