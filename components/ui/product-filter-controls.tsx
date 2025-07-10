"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductFilterControlsProps {
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  stockFilter: string
  setStockFilter: (value: string) => void
}

const CATEGORIES = [
  "Giảm đau, hạ sốt",
  "Kháng sinh",
  "Vitamin & Khoáng chất",
  "Tiêu hóa",
  "Tim mạch",
  "Hô hấp",
  "Da liễu",
  "Thần kinh",
  "Nội tiết",
  "Khác",
]

export function ProductFilterControls({
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  stockFilter,
  setStockFilter,
}: ProductFilterControlsProps) {
  return (
    <>
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả danh mục</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={stockFilter} onValueChange={setStockFilter}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Tình trạng kho" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="low">Sắp hết</SelectItem>
          <SelectItem value="normal">Bình thường</SelectItem>
          <SelectItem value="overstock">Dư thừa</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="active">Hoạt động</SelectItem>
          <SelectItem value="inactive">Ngừng bán</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
