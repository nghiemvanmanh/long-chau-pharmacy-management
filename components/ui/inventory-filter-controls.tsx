"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterSection } from "@/components/ui/filter-section"

interface InventoryFilterControlsProps {
  filterCategory: string
  setFilterCategory: (value: string) => void
  filterStatus: string
  setFilterStatus: (value: string) => void
  filterSupplier: string
  setFilterSupplier: (value: string) => void
  categories: string[]
  suppliers: string[]
  onResetFilters: () => void
}

export function InventoryFilterControls({
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  filterSupplier,
  setFilterSupplier,
  categories,
  suppliers,
  onResetFilters,
}: InventoryFilterControlsProps) {
  return (
    <FilterSection title="Bộ lọc">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Danh mục</label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Trạng thái tồn kho</label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="normal">Bình thường</SelectItem>
              <SelectItem value="low">Sắp hết</SelectItem>
              <SelectItem value="overstock">Dư thừa</SelectItem>
              <SelectItem value="out_of_stock">Hết hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Nhà cung cấp</label>
          <Select value={filterSupplier} onValueChange={setFilterSupplier}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn nhà cung cấp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={onResetFilters} className="w-full bg-transparent">
            Đặt lại bộ lọc
          </Button>
        </div>
      </div>
    </FilterSection>
  )
}
