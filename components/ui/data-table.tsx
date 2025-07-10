"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, FileDown } from "lucide-react"

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  onAdd?: () => void
  onEdit?: (item: any) => void
  onDelete?: (item: any) => void
  onExport?: () => void
  title: string
  searchPlaceholder?: string
  customActions?: (item: any) => React.ReactNode
}

export default function DataTable({
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onExport,
  title,
  searchPlaceholder,
  customActions,
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">{title}</h2>
        <div className="flex items-center space-x-2">
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <FileDown className="w-4 h-4 mr-2" />
              Xuất file
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Input
          placeholder={searchPlaceholder || "Tìm kiếm..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <Button variant="outline" className="w-full sm:w-auto bg-transparent">
          Đặt lại bộ lọc
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">STT</TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                  {sortColumn === column.key && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                </TableHead>
              ))}
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell>{index + 1}</TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {customActions && customActions(item)}
                    {onEdit && (
                      <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
