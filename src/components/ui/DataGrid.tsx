import React from 'react';
import clsx from 'clsx';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  // Sorting
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnKey: string) => void;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  loading?: boolean;
}

export function DataGrid<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  loading
}: DataGridProps<T>) {
  
  const renderSortIcon = (colKey: string) => {
    if (sortColumn !== colKey) {
      return <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-50">unfold_more</span>;
    }
    return (
      <span className="material-symbols-outlined text-[14px] text-primary">
        {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    );
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider select-none border-b border-surface-container-highest">
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className={clsx(
                    "py-3.5 px-4 font-semibold", 
                    col.align === 'right' && "text-right",
                    col.align === 'center' && "text-center",
                    col.sortable && "cursor-pointer group hover:text-on-surface transition-colors"
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <div className={clsx("flex items-center gap-1", 
                    col.align === 'right' && "justify-end",
                    col.align === 'center' && "justify-center"
                  )}>
                    {col.header}
                    {col.sortable && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest">
            {loading && <tr><td colSpan={columns.length} className="py-12 text-center">Loading...</td></tr>}
            {loading && <tr><td colSpan={columns.length} className="py-12 text-center">Loading...</td></tr>}
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-on-surface-variant font-body-md">
                  No records found matching your criteria.
                </td>
              </tr>
            ) : (
              !loading && !loading && data.map((item) => (
                <tr 
                  key={keyExtractor(item)} 
                  className={clsx(
                    "hover:bg-surface-container-lowest/50 transition-colors group",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map(col => (
                    <td 
                      key={col.key} 
                      className={clsx(
                        "py-3.5 px-4 font-body-sm text-body-sm text-on-surface",
                        col.align === 'right' && "text-right",
                        col.align === 'center' && "text-center"
                      )}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages !== undefined && totalPages > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-surface-container-highest bg-surface-container-lowest">
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            {totalItems !== undefined ? (
              <span>Showing <strong>{data.length}</strong> of <strong>{totalItems}</strong> records</span>
            ) : (
              <span>Page {currentPage} of {totalPages}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange?.((currentPage || 1) - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-surface-container disabled:opacity-50 disabled:hover:bg-transparent text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="font-label-md text-label-md font-semibold text-on-surface">
              {currentPage}
            </div>
            <button 
              onClick={() => onPageChange?.((currentPage || 1) + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded hover:bg-surface-container disabled:opacity-50 disabled:hover:bg-transparent text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
