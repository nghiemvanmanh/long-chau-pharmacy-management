"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Contract, Supplier } from "@/hooks/use-suppliers"

interface ContractFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Contract, "id">) => void
  contract?: Contract | null
  suppliers: Supplier[]
  mode: "add" | "edit"
}

export function ContractFormModal({ isOpen, onClose, onSubmit, contract, suppliers, mode }: ContractFormModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    contractNumber: "",
    supplierId: 0,
    supplierName: "",
    title: "",
    startDate: "",
    endDate: "",
    value: 0,
    status: "pending" as "active" | "expired" | "pending",
    products: [] as string[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [productInput, setProductInput] = useState("")

  useEffect(() => {
    if (contract && mode === "edit") {
      setFormData(contract)
    } else {
      setFormData({
        contractNumber: "",
        supplierId: 0,
        supplierName: "",
        title: "",
        startDate: "",
        endDate: "",
        value: 0,
        status: "pending",
        products: [],
      })
    }
    setErrors({})
    setProductInput("")
  }, [contract, mode, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.contractNumber.trim()) newErrors.contractNumber = "Số hợp đồng là bắt buộc"
    if (!formData.supplierId) newErrors.supplierId = "Nhà cung cấp là bắt buộc"
    if (!formData.title.trim()) newErrors.title = "Tiêu đề hợp đồng là bắt buộc"
    if (!formData.startDate) newErrors.startDate = "Ngày bắt đầu là bắt buộc"
    if (!formData.endDate) newErrors.endDate = "Ngày kết thúc là bắt buộc"
    if (formData.value <= 0) newErrors.value = "Giá trị hợp đồng phải lớn hơn 0"

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Lỗi validation",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
      })
      return
    }

    onSubmit(formData)
    onClose()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === Number.parseInt(supplierId))
    if (supplier) {
      handleInputChange("supplierId", supplier.id)
      handleInputChange("supplierName", supplier.shortName)
    }
  }

  const addProduct = () => {
    if (productInput.trim() && !formData.products.includes(productInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        products: [...prev.products, productInput.trim()],
      }))
      setProductInput("")
    }
  }

  const removeProduct = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Thêm hợp đồng mới" : "Chỉnh sửa hợp đồng"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Số hợp đồng */}
            <div className="space-y-2">
              <Label htmlFor="contractNumber">Số hợp đồng *</Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={(e) => handleInputChange("contractNumber", e.target.value)}
                placeholder="VD: HĐ001"
                className={errors.contractNumber ? "border-red-500" : ""}
              />
              {errors.contractNumber && <p className="text-sm text-red-500">{errors.contractNumber}</p>}
            </div>

            {/* Nhà cung cấp */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Nhà cung cấp *</Label>
              <Select value={formData.supplierId.toString()} onValueChange={handleSupplierChange}>
                <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.shortName} - {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplierId && <p className="text-sm text-red-500">{errors.supplierId}</p>}
            </div>

            {/* Ngày bắt đầu */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Ngày bắt đầu *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={errors.startDate ? "border-red-500" : ""}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            {/* Ngày kết thúc */}
            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={errors.endDate ? "border-red-500" : ""}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>

            {/* Giá trị hợp đồng */}
            <div className="space-y-2">
              <Label htmlFor="value">Giá trị hợp đồng (VNĐ) *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) => handleInputChange("value", Number.parseInt(e.target.value) || 0)}
                placeholder="50000000"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "expired" | "pending") => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ ký</SelectItem>
                  <SelectItem value="active">Đang hiệu lực</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tiêu đề hợp đồng */}
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề hợp đồng *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Mô tả ngắn gọn về hợp đồng"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Sản phẩm */}
          <div className="space-y-2">
            <Label>Sản phẩm trong hợp đồng</Label>
            <div className="flex space-x-2">
              <Input
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
                placeholder="Nhập tên sản phẩm"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addProduct())}
              />
              <Button type="button" onClick={addProduct} variant="outline">
                Thêm
              </Button>
            </div>
            {formData.products.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.products.map((product, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {product}
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {mode === "add" ? "Thêm mới" : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
