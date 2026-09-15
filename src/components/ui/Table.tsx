import React from 'react';
import { cn } from '../../lib/utils';

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { containerClassName?: string }
>(({ className, containerClassName, ...props }, ref) => (
  <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs', containerClassName)}>
    <table ref={ref} className={cn('w-full caption-bottom text-xs text-left', className)} {...props} />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider select-none', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-slate-100 text-slate-700', className)} {...props} />
));
TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('bg-slate-50/60 border-t border-slate-200 font-medium text-slate-700', className)} {...props} />
));
TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('transition-colors hover:bg-slate-50/70', className)} {...props} />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { alignRight?: boolean }
>(({ className, alignRight = false, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-10 px-4 py-2 font-semibold text-slate-500 [&:has([role=checkbox])]:pr-0',
      alignRight && 'text-right',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { alignRight?: boolean }
>(({ className, alignRight = false, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'px-4 py-3.5 align-middle [&:has([role=checkbox])]:pr-0',
      alignRight && 'text-right font-mono',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';
