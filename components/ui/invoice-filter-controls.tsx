"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, Search, X } from "lucide-react"

interface InvoiceFilterControlsProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  saleTypeFilter: string
  setSaleTypeFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  paymentStatusFilter: string
  setPaymentStatusFilter: (value: string) => void
  dateRange: { from: string; to: string }
  setDateRange: (range: { from: string; to: string }) => void
  createdByFilter: string
  setCreatedByFilter: (value: string) => void
  onReset: () => void
}

export function InvoiceFilterControls({
  searchTerm,
  setSearchTerm,
  saleTypeFilter,
  setSaleTypeFilter,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  dateRange,
  setDateRange,
  createdByFilter,
  setCreatedByFilter,
  onReset,
}: InvoiceFilterControlsProps) {
  const activeFiltersCount = [
    searchTerm,
    saleTypeFilter !== "all" ? saleTypeFilter : "",
    statusFilter !== "all" ? statusFilter : "",
    paymentStatusFilter !== "all" ? paymentStatusFilter : "",
    dateRange.from,
    dateRange.to,
    createdByFilter !== "all" ? createdByFilter : "",
  ].filter(Boolean).length

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Bộ lọc và Tìm kiếm
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount} bộ lọc
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="w-4 h-4 mr-2" />
              Xóa tất cả
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm theo số HĐ, tên KH, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sale Type Filter */}
          <Select value={saleTypeFilter} onValueChange={setSaleTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Loại bán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Tại quầy</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái HĐ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
              <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status Filter */}
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="TT Thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả TT</SelectItem>
              <SelectItem value="pending">Chờ thanh toán</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="failed">Thất bại</SelectItem>
              <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>

          {/* Created By Filter */}
          <Select value={createdByFilter} onValueChange={setCreatedByFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Người tạo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="Nguyễn Văn An">Nguyễn Văn An</SelectItem>
              <SelectItem value="Trần Thị Bình">Trần Thị Bình</SelectItem>
              <SelectItem value="Lê Văn Cường">Lê Văn Cường</SelectItem>
              <SelectItem value="Phạm Văn Đức">Phạm Văn Đức</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Từ ngày:</span>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Đến ngày:</span>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onReset} className="flex-1 bg-transparent">
              Đặt lại bộ lọc
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
