"use client"

import { useState, useMemo } from "react"

interface UseDataTableProps<T> {
  data: T[]
  searchFields?: (keyof T)[]
  initialSortField?: keyof T
  initialSortDirection?: "asc" | "desc"
}

export function useDataTable<T extends Record<string, any>>({
  data,
  searchFields = [],
  initialSortField,
  initialSortDirection = "asc",
}: UseDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof T | undefined>(initialSortField)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(initialSortDirection)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filteredData = useMemo(() => {
    if (!searchTerm) return data

    return data.filter((item) =>
      searchFields.some((field) => String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [data, searchTerm, searchFields])

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortField, sortDirection])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedData,
    totalPages,
    totalItems: sortedData.length,
  }
}
