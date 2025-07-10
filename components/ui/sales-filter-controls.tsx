"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SalesFilterControlsProps {
  saleTypeFilter: string
  setSaleTypeFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  paymentStatusFilter: string
  setPaymentStatusFilter: (value: string) => void
  paymentMethodFilter: string
  setPaymentMethodFilter: (value: string) => void
  dateFrom: string
  setDateFrom: (value: string) => void
  dateTo: string
  setDateTo: (value: string) => void
}

export function SalesFilterControls({
  saleTypeFilter,
  setSaleTypeFilter,
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: SalesFilterControlsProps) {
  return (
    <>
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Từ ngày</Label>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="min-w-[140px]" />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Đến ngày</Label>
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="min-w-[140px]" />
      </div>

      <Select value={saleTypeFilter} onValueChange={setSaleTypeFilter}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="Loại bán" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="offline">Tại quầy</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="min-w-[120px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="completed">Hoàn thành</SelectItem>
          <SelectItem value="draft">Nháp</SelectItem>
          <SelectItem value="cancelled">Đã hủy</SelectItem>
          <SelectItem value="refunded">Đã hoàn</SelectItem>
        </SelectContent>
      </Select>

      <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
        <SelectTrigger className="min-w-[130px]">
          <SelectValue placeholder="TT Thanh toán" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="paid">Đã thanh toán</SelectItem>
          <SelectItem value="pending">Chờ thanh toán</SelectItem>
          <SelectItem value="partial">Thanh toán 1 phần</SelectItem>
        </SelectContent>
      </Select>

      <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
        <SelectTrigger className="min-w-[130px]">
          <SelectValue placeholder="PT Thanh toán" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="cash">Tiền mặt</SelectItem>
          <SelectItem value="card">Thẻ</SelectItem>
          <SelectItem value="transfer">Chuyển khoản</SelectItem>
          <SelectItem value="mixed">Hỗn hợp</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
