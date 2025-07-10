"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { InventoryItem } from "@/hooks/use-inventory"

interface InventoryFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<InventoryItem, "id">) => Promise<{ success: boolean; error?: string }>
  editingItem?: InventoryItem | null
  categories: string[]
  suppliers: string[]
}

export function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  categories,
  suppliers,
}: InventoryFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    avgMonthlyUsage: 0,
    supplier: "",
    location: "",
    costPrice: 0,
    sellingPrice: 0,
    expiryDate: "",
    batchNumber: "",
    description: "",
  })

  useEffect(() => {
    if (editingItem) {
      setFormData({
        code: editingItem.code,
        name: editingItem.name,
        category: editingItem.category,
        currentStock: editingItem.currentStock,
        minStock: editingItem.minStock,
        maxStock: editingItem.maxStock,
        avgMonthlyUsage: editingItem.avgMonthlyUsage,
        supplier: editingItem.supplier,
        location: editingItem.location,
        costPrice: editingItem.costPrice,
        sellingPrice: editingItem.sellingPrice,
        expiryDate: editingItem.expiryDate || "",
        batchNumber: editingItem.batchNumber || "",
        description: editingItem.description || "",
      })
    } else {
      setFormData({
        code: "",
        name: "",
        category: "",
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        avgMonthlyUsage: 0,
        supplier: "",
        location: "",
        costPrice: 0,
        sellingPrice: 0,
        expiryDate: "",
        batchNumber: "",
        description: "",
      })
    }
  }, [editingItem, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code || !formData.name || !formData.category) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const result = await onSubmit({
      ...formData,
      lastRestocked: new Date().toISOString().split("T")[0],
      value: formData.currentStock * formData.costPrice,
      status: "normal" as const,
    })

    if (result.success) {
      toast({
        title: "Thành công",
        description: editingItem ? "Cập nhật sản phẩm thành công" : "Thêm sản phẩm thành công",
      })
      onClose()
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Có lỗi xảy ra",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Mã sản phẩm *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="VD: TH001"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Tên sản phẩm *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="VD: Paracetamol 500mg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Danh mục *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">+ Thêm danh mục mới</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplier">Nhà cung cấp</Label>
              <Select value={formData.supplier} onValueChange={(value) => handleInputChange("supplier", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="currentStock">Tồn kho hiện tại</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => handleInputChange("currentStock", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="minStock">Tồn kho tối thiểu</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleInputChange("minStock", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="maxStock">Tồn kho tối đa</Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => handleInputChange("maxStock", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="costPrice">Giá nhập</Label>
              <Input
                id="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleInputChange("costPrice", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="sellingPrice">Giá bán</Label>
              <Input
                id="sellingPrice"
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange("sellingPrice", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="avgMonthlyUsage">Sử dụng TB/tháng</Label>
              <Input
                id="avgMonthlyUsage"
                type="number"
                value={formData.avgMonthlyUsage}
                onChange={(e) => handleInputChange("avgMonthlyUsage", Number.parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="location">Vị trí</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="VD: Kệ A1-01"
              />
            </div>

            <div>
              <Label htmlFor="expiryDate">Ngày hết hạn</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="batchNumber">Số lô</Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                placeholder="VD: LOT001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về sản phẩm..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : editingItem ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
