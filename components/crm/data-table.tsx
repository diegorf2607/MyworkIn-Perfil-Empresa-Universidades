"use client"

import * as React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: keyof T | string
  header: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKey?: keyof T
  searchPlaceholder?: string
  onRowClick?: (item: T) => void
  emptyMessage?: string
  actions?: (item: T) => React.ReactNode
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Buscar...",
  onRowClick,
  emptyMessage = "No hay datos",
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")

  const filteredData = React.useMemo(() => {
    let result = [...data]

    // Filter by search
    if (search && searchKey) {
      const searchLower = search.toLowerCase()
      result = result.filter((item) => {
        const value = item[searchKey]
        return String(value).toLowerCase().includes(searchLower)
      })
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey]
        const bVal = (b as Record<string, unknown>)[sortKey]

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal
        }

        return 0
      })
    }

    return result
  }, [data, search, searchKey, sortKey, sortDirection])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const getValue = (item: T, key: string): unknown => {
    if (key.includes(".")) {
      const keys = key.split(".")
      let value: unknown = item
      for (const k of keys) {
        value = (value as Record<string, unknown>)?.[k]
      }
      return value
    }
    return (item as Record<string, unknown>)[key]
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {searchKey && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={cn(column.sortable && "cursor-pointer select-none", column.className)}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable &&
                      sortKey === String(column.key) &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} className={column.className}>
                      {column.render ? column.render(item) : String(getValue(item, String(column.key)) ?? "")}
                    </TableCell>
                  ))}
                  {actions && <TableCell onClick={(e) => e.stopPropagation()}>{actions(item)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredData.length} de {data.length} registros
      </p>
    </div>
  )
}
