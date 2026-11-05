import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// A route bullet: a coloured circle with a letter or number. Name a route
// (`route="A"`) and its colour follows; or pick a colour (`color="purple"`)
// and put anything in it. `express` draws the diamond.

type LineColor = 'blue' | 'orange' | 'lime' | 'brown' | 'grey' | 'yellow' | 'red' | 'green' | 'purple' | 'shuttle';

const ROUTE_COLORS: Record<string, LineColor> = {
  A: 'blue',
  C: 'blue',
  E: 'blue',
  B: 'orange',
  D: 'orange',
  F: 'orange',
  M: 'orange',
  G: 'lime',
  J: 'brown',
  Z: 'brown',
  L: 'grey',
  N: 'yellow',
  Q: 'yellow',
  R: 'yellow',
  W: 'yellow',
  '1': 'red',
  '2': 'red',
  '3': 'red',
  '4': 'green',
  '5': 'green',
  '6': 'green',
  '7': 'purple',
  S: 'shuttle',
};

// Type is white where it reaches 3:1 on the colour (the large-text bar; the
// glyph is bold and the bullet's name is in its label), and near-black
// where it doesn't.
const routeBulletVariants = cva(
  'inline-flex shrink-0 items-center justify-center font-bold leading-none tracking-tight select-none tabular-nums',
  {
    variants: {
      color: {
        blue: 'bg-line-blue text-white',
        orange: 'bg-line-orange text-[#111]',
        lime: 'bg-line-lime text-[#111]',
        brown: 'bg-line-brown text-white',
        grey: 'bg-line-grey text-[#111]',
        yellow: 'bg-line-yellow text-[#111]',
        red: 'bg-line-red text-white',
        green: 'bg-line-green text-white',
        purple: 'bg-line-purple text-white',
        shuttle: 'bg-line-shuttle text-white',
      },
      size: {
        sm: 'size-5 text-[0.7rem]',
        default: 'size-7 text-base',
        lg: 'size-10 text-2xl',
        xl: 'size-14 text-[2.1rem]',
      },
      express: {
        false: 'rounded-full',
        // a diamond needs more room than a circle to hold the same glyph
        true: '[clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)] scale-[1.2]',
      },
    },
    defaultVariants: { color: 'blue', size: 'default', express: false },
  },
);

function routeColor(route: string | undefined): LineColor | undefined {
  return route ? ROUTE_COLORS[route.toUpperCase()] : undefined;
}

type RouteBulletProps = Omit<React.ComponentProps<'span'>, 'color'> &
  VariantProps<typeof routeBulletVariants> & {
    /** A route letter or number; sets the colour and is shown unless children are given. */
    route?: string;
  };

function RouteBullet({ route, color, size, express, className, children, ...props }: RouteBulletProps) {
  const label = children ?? route;
  // a named route reads as "A train"; anything else is just its text
  const named = route && !children && !props['aria-hidden'];
  return (
    <span
      data-slot="route-bullet"
      data-express={express || undefined}
      {...(named && { role: 'img', 'aria-label': `${route}${express ? ' express' : ''} train` })}
      className={cn(routeBulletVariants({ color: color ?? routeColor(route) ?? 'shuttle', size, express }), className)}
      {...props}
    >
      {named ? <span aria-hidden>{label}</span> : label}
    </span>
  );
}

export { RouteBullet, routeBulletVariants, routeColor, ROUTE_COLORS, type LineColor };
