import * as React from 'react';
import ReactMarkdown, { type Components, type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

// Written text — a service notice, a station's accessibility notes, a help
// article, an AI answer — rendered from Markdown with GitHub's extensions
// (tables, task lists, strikethrough, autolinks) and set like a notice in the
// system: bold, tight headings, regular body, underlined links with the
// yellow focus ring, code in mono on a muted key, a heavy foreground rule
// down a quote's left side, and tables like <Table>: a black sign band over
// hairline rows on a panel. The styles live here, on the elements inside, so
// no prose utility is needed.
// Safe by default: raw HTML in the source is dropped, never rendered, and
// react-markdown strips javascript: and other unsafe link targets. Pass
// `components` to swap any element's renderer (a code block, a heading with
// an anchor); yours win over the defaults here.
//
//   <Markdown>{notice}</Markdown>

const prose = cn(
  'text-base leading-relaxed text-foreground',
  // rhythm: each block keeps a gap below it, the last one doesn't
  '[&>*]:mb-[1em] [&>*:last-child]:mb-0',
  // headings: bold and tight, larger ones with a little more room above
  '[&_h1]:mt-[1.25em] [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight',
  '[&_h2]:mt-[1.25em] [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:font-bold [&_h2]:tracking-tight',
  '[&_h3]:mt-[1em] [&_h3]:text-xl [&_h3]:leading-snug [&_h3]:font-bold [&_h3]:tracking-tight',
  '[&_h4]:mt-[1em] [&_h4]:text-lg [&_h4]:font-bold [&_h5]:font-bold [&_h6]:font-bold',
  '[&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0 [&>h4:first-child]:mt-0',
  '[&_strong]:font-bold [&_del]:text-muted-foreground',
  // lists: square bullets, numbers in tabular figures
  '[&_ul]:list-[square] [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:tabular-nums [&_li]:my-1 [&_li>ul]:mt-1 [&_li>ol]:mt-1',
  '[&_li::marker]:text-muted-foreground',
  // task lists: no bullet, the box in its place
  '[&_li:has(>input[type=checkbox])]:list-none [&_li:has(>input[type=checkbox])]:-ml-6 [&_li>input[type=checkbox]]:mr-2 [&_li>input[type=checkbox]]:size-4 [&_li>input[type=checkbox]]:align-[-0.15em] [&_li>input[type=checkbox]]:accent-foreground',
  // links
  '[&_a]:font-bold [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a:hover]:decoration-ring',
  // code: mono, on a muted key; a block is a panel of its own
  '[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.875em]',
  '[&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-sm [&_pre]:leading-normal [&_pre_code]:bg-transparent [&_pre_code]:p-0',
  // quotes: a heavy rule down the left
  '[&_blockquote]:border-l-4 [&_blockquote]:border-foreground [&_blockquote]:pl-4',
  '[&_hr]:border-t-2 [&_hr]:border-foreground',
  '[&_img]:max-w-full',
);

const defaultComponents: Components = {
  // a GFM task list's box is read-only and unlabelled; name it by its state so
  // a screen reader hears "done" or "to do" before the item's text
  input: ({ node: _node, ...props }) =>
    props.type === 'checkbox' ? <input {...props} aria-label={props.checked ? 'Done' : 'To do'} /> : <input {...props} />,
  // links keep the underline and gain the standard focus ring
  a: ({ node: _node, className, children, ...props }) => (
    <a
      className={cn(
        'outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
  // a wide table scrolls in place instead of widening the page; it sits on a
  // panel with a sign-band header, like <Table>
  table: ({ node: _node, className, ...props }) => (
    <div data-slot="markdown-table" className="on-sign mb-[1em] overflow-x-auto bg-card text-foreground">
      <table
        className={cn(
          'w-full text-sm tabular-nums',
          '[&_thead]:bg-sign [&_thead]:text-sign-foreground [&_th]:h-10 [&_th]:px-3 [&_th]:text-left [&_th]:align-middle [&_th]:font-bold [&_th]:whitespace-nowrap',
          '[&_tbody_tr]:border-b [&_tbody_tr]:border-border [&_tbody_tr:last-child]:border-b-2 [&_tbody_tr:last-child]:border-b-foreground',
          '[&_td]:px-3 [&_td]:py-2.5 [&_td]:align-middle',
          className,
        )}
        {...props}
      />
    </div>
  ),
};

type MarkdownProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  /** the Markdown source */
  children: string;
  /** element renderers, merged over the defaults */
  components?: Components;
  /** more remark plugins, after remark-gfm */
  remarkPlugins?: Options['remarkPlugins'];
  rehypePlugins?: Options['rehypePlugins'];
  /** override react-markdown's URL check (it already drops unsafe protocols) */
  urlTransform?: Options['urlTransform'];
};

function Markdown({ children, components, remarkPlugins = [], rehypePlugins, urlTransform, className, ...props }: MarkdownProps) {
  const merged = React.useMemo(() => ({ ...defaultComponents, ...components }), [components]);
  return (
    <div data-slot="markdown" className={cn(prose, className)} {...props}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, ...(remarkPlugins ?? [])]}
        rehypePlugins={rehypePlugins}
        components={merged}
        skipHtml
        {...(urlTransform ? { urlTransform } : {})}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export { Markdown, type MarkdownProps };
