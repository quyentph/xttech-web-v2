import { ITableColumn } from './types';

export function TableBody<T>({
  data,
  columns,
  select,
  onRowClick,
  onRowDoubleClick,
  focusedRowKey,
  getRowKey,
}: {
  data: T[];
  columns: ITableColumn<T>[];
  select: boolean;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  focusedRowKey?: string | number | null;
  getRowKey?: (row: T, index: number) => string | number;
}) {
  return (
    <tbody>
      {data?.map((row: T, index: number) => {
        const isFocused =
          focusedRowKey !== undefined && focusedRowKey !== null && getRowKey
            ? getRowKey(row, index) === focusedRowKey
            : false;

        return (
          <tr
            key={index}
            onClick={() => onRowClick?.(row)}
            onDoubleClick={() => onRowDoubleClick?.(row)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onRowDoubleClick?.(row);
              }
            }}
            className={`group border-b border-slate-200 transition-colors outline-none ${
              onRowClick || onRowDoubleClick ? 'cursor-pointer' : ''
            } ${
              isFocused
                ? 'bg-primary/10 border-l-4 border-l-primary text-primary font-medium'
                : 'hover:bg-slate-50/60 focus-visible:bg-slate-50'
            }`}
          >
            {/* Render checkbox */}
            {select && (
              <td className="h-12 px-4 py-2 text-center sticky left-0 z-10 bg-white group-hover:bg-slate-50/60 border-r border-slate-200 transition-colors">
                <input type="checkbox" />
              </td>
            )}

            {/* Render columns */}
            {columns.map((column) => {
              const isSticky = column.sticky;
              const leftOffset = isSticky ? (select ? '47px' : '0px') : undefined;

              return (
                <td
                  key={column.key}
                  className={`h-12 px-4 py-2 text-xs font-medium text-slate-600 whitespace-normal wrap-break-word ${column.maxWidth ? 'truncate' : ''} ${isSticky
                      ? 'sticky z-10 bg-white group-hover:bg-slate-50/60 border-r md:border-r-0 border-slate-200 transition-colors'
                      : ''
                    }`}
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    ...(isSticky ? { left: leftOffset } : {}),
                  }}
                >
                  {column.cell(row, index)}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
