"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface FilterState {
  search: string
  status: string
  membershipLevel: string
  gender: string
  minPurchase: string
  maxPurchase: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
}

interface CustomerFilterControlsProps {
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
}

export function CustomerFilterControls({ onFilterChange, onReset }: CustomerFilterControlsProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    membershipLevel: "all",
    gender: "all",
    minPurchase: "",
    maxPurchase: "",
    dateFrom: undefined,
    dateTo: undefined,
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    const emptyFilters: FilterState = {
      search: "",
      status: "all",
      membershipLevel: "all",
      gender: "all",
      minPurchase: "",
      maxPurchase: "",
      dateFrom: undefined,
      dateTo: undefined,
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
    onReset()
  }

  const activeFiltersCount = Object.values(filters).filter((value) => value !== "" && value !== undefined).length

  return (
    <div className="space-y-4">
      {/* Basic Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.membershipLevel} onValueChange={(value) => updateFilter("membershipLevel", value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Hạng thành viên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="bronze">Đồng</SelectItem>
            <SelectItem value="silver">Bạc</SelectItem>
            <SelectItem value="gold">Vàng</SelectItem>
            <SelectItem value="platinum">Bạch Kim</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Bộ lọc nâng cao
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto bg-transparent">
            <X className="w-4 h-4 mr-2" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <Select value={filters.gender} onValueChange={(value) => updateFilter("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Giới tính" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="male">Nam</SelectItem>
              <SelectItem value="female">Nữ</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex space-x-2">
            <Input
              placeholder="Mua hàng từ"
              type="number"
              value={filters.minPurchase}
              onChange={(e) => updateFilter("minPurchase", e.target.value)}
            />
            <Input
              placeholder="đến"
              type="number"
              value={filters.maxPurchase}
              onChange={(e) => updateFilter("maxPurchase", e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy", { locale: vi }) : "Từ ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter("dateFrom", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy", { locale: vi }) : "Đến ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter("dateTo", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
