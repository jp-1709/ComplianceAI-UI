import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronLeft, ChevronRight, Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function EnterpriseDataTable<T>({
  data,
  columns,
  loading,
  searchPlaceholder = "Search records…",
  initialSearch = "",
  onRowClick,
  toolbar,
  empty,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  searchPlaceholder?: string;
  initialSearch?: string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  empty?: ReactNode;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [input, setInput] = useState(initialSearch);
  const [globalFilter, setGlobalFilter] = useState(initialSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => setGlobalFilter(input), 220);
    return () => window.clearTimeout(timer);
  }, [input]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  const visibleColumns = useMemo(
    () => table.getAllLeafColumns().filter((column) => column.getCanHide()),
    [table],
  );

  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-9"
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {toolbar}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="size-4" /> Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
                >
                  {column.id
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (value) => value.toUpperCase())}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/45 text-xs text-muted-foreground">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-2.5 font-medium">
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn(
                          "inline-flex items-center gap-1",
                          header.column.getCanSort() && "hover:text-foreground",
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <ChevronDown
                            className={cn(
                              "size-3 transition",
                              header.column.getIsSorted() === "asc" && "rotate-180",
                              !header.column.getIsSorted() && "opacity-30",
                            )}
                          />
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({ length: 6 }, (_, row) => (
                  <tr key={row}>
                    {columns.map((_, cell) => (
                      <td key={cell} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    onKeyDown={(event) => {
                      if (onRowClick && (event.key === "Enter" || event.key === " ")) {
                        event.preventDefault();
                        onRowClick(row.original);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : undefined}
                    className={cn(
                      "transition hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && table.getRowModel().rows.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {empty ?? "No matching records."}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length} records · page{" "}
          {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
