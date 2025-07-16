"use client"

import { Search, Filter, RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SupplierFilterControlsProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  businessTypeFilter: string
  onBusinessTypeFilterChange: (value: string) => void
  paymentTermsFilter: string
  onPaymentTermsFilterChange: (value: string) => void
  businessTypes: string[]
  paymentTerms: string[]
  onReset: () => void
}

export function SupplierFilterControls({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  businessTypeFilter,
  onBusinessTypeFilterChange,
  paymentTermsFilter,
  onPaymentTermsFilterChange,
  businessTypes,
  paymentTerms,
  onReset,
}: SupplierFilterControlsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Filter className="w-5 h-5 mr-2 text-blue-600" />
          Bộ lọc và Tìm kiếm
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm theo tên, mã NCC, người đại diện..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hợp tác</SelectItem>
            </SelectContent>
          </Select>

          {/* Business Type Filter */}
          <Select value={businessTypeFilter} onValueChange={onBusinessTypeFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Loại hình KD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {businessTypes?.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Terms Filter */}
          <Select value={paymentTermsFilter} onValueChange={onPaymentTermsFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Điều kiện TT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {paymentTerms?.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Button */}
          <Button variant="outline" onClick={onReset} className="flex items-center bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            Đặt lại
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
