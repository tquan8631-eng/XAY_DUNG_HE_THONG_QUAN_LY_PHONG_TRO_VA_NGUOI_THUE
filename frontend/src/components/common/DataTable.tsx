import React from 'react';
import { ChevronUp, ChevronDown, Inbox } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

function DataTable<T>({
  columns,
  data,
  loading = false,
  onSort,
  sortKey,
  sortDirection,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  emptyMessage = 'Không có dữ liệu'
}: DataTableProps<T>) {
  const safeData = Array.isArray(data) ? data : [];

  const handleSort = (key: string) => {
    if (!onSort) return;

    const isAsc = sortKey === key && sortDirection === 'asc';

    onSort(
      key,
      isAsc ? 'desc' : 'asc'
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 ${
                    col.sortable
                      ? 'cursor-pointer hover:bg-gray-100'
                      : ''
                  }`}
                  onClick={() =>
                    col.sortable && handleSort(col.key)
                  }
                >
                  <div className="flex items-center gap-1">
                    {col.label}

                    {col.sortable &&
                      sortKey === col.key &&
                      (
                        sortDirection === 'asc'
                          ? <ChevronUp size={14} />
                          : <ChevronDown size={14} />
                      )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center"
                >
                  <LoadingSpinner />
                </td>
              </tr>
            ) : safeData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox
                      size={32}
                      className="text-gray-400"
                    />

                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              safeData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() =>
                    onRowClick && onRowClick(item)
                  }
                  className={`bg-white border-b hover:bg-gray-50 transition-colors ${
                    onRowClick
                      ? 'cursor-pointer'
                      : ''
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(item)
                        : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages !== undefined &&
        totalPages > 1 &&
        onPageChange &&
        page !== undefined && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
    </div>
  );
}

export default DataTable;
