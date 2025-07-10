"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Product {
  id?: number
  code: string
  name: string
  category: string
  manufacturer: string
  dosage: string
  unit: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  maxStock: number
  expiryDate: string
  batchNumber: string
  barcode: string
  description: string
  status: string
  location?: string
  supplier?: string
}

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Product) => void
  product?: Product | null
  mode: "create" | "edit"
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

const UNITS = ["Viên", "Vỉ", "Hộp", "Chai", "Ống", "Gói", "Tuýp", "Lọ", "Ml", "Mg"]

const MANUFACTURERS = [
  "Công ty Dược Hà Tây",
  "Công ty Dược Sài Gòn",
  "Công ty Dược Miền Trung",
  "Công ty Dược Phẩm Teva",
  "Công ty Dược Phẩm DHG",
  "Công ty Dược Phẩm Imexpharm",
  "Khác",
]

export function ProductFormModal({ isOpen, onClose, onSubmit, product, mode }: ProductFormModalProps) {
  const [formData, setFormData] = useState<Product>({
    code: "",
    name: "",
    category: "",
    manufacturer: "",
    dosage: "",
    unit: "Viên",
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 0,
    maxStock: 0,
    expiryDate: "",
    batchNumber: "",
    barcode: "",
    description: "",
    status: "active",
    location: "",
    supplier: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (product && mode === "edit") {
      setFormData(product)
    } else {
      setFormData({
        code: "",
        name: "",
        category: "",
        manufacturer: "",
        dosage: "",
        unit: "Viên",
        price: 0,
        costPrice: 0,
        stock: 0,
        minStock: 0,
        maxStock: 0,
        expiryDate: "",
        batchNumber: "",
        barcode: "",
        description: "",
        status: "active",
        location: "",
        supplier: "",
      })
    }
    setErrors({})
  }, [product, mode, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Mã sản phẩm là bắt buộc"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc"
    }

    if (!formData.category) {
      newErrors.category = "Danh mục là bắt buộc"
    }

    if (!formData.manufacturer) {
      newErrors.manufacturer = "Nhà sản xuất là bắt buộc"
    }

    if (!formData.dosage.trim()) {
      newErrors.dosage = "Liều lượng là bắt buộc"
    }

    if (formData.price <= 0) {
      newErrors.price = "Giá bán phải lớn hơn 0"
    }

    if (formData.costPrice <= 0) {
      newErrors.costPrice = "Giá vốn phải lớn hơn 0"
    }

    if (formData.costPrice >= formData.price) {
      newErrors.costPrice = "Giá vốn phải nhỏ hơn giá bán"
    }

    if (formData.stock < 0) {
      newErrors.stock = "Tồn kho không được âm"
    }

    if (formData.minStock < 0) {
      newErrors.minStock = "Tồn kho tối thiểu không được âm"
    }

    if (formData.maxStock <= formData.minStock) {
      newErrors.maxStock = "Tồn kho tối đa phải lớn hơn tồn kho tối thiểu"
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Hạn sử dụng là bắt buộc"
    } else {
      const expiryDate = new Date(formData.expiryDate)
      const today = new Date()
      if (expiryDate <= today) {
        newErrors.expiryDate = "Hạn sử dụng phải sau ngày hôm nay"
      }
    }

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = "Số lô là bắt buộc"
    }

    if (!formData.barcode.trim()) {
      newErrors.barcode = "Mã vạch là bắt buộc"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  const handleInputChange = (field: keyof Product, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const generateBarcode = () => {
    const barcode = "893600" + Math.random().toString().slice(2, 8)
    handleInputChange("barcode", barcode)
  }

  const getStockStatus = () => {
    if (formData.stock <= formData.minStock) {
      return { label: "Sắp hết", color: "bg-red-100 text-red-800" }
    }
    if (formData.stock >= formData.maxStock * 0.9) {
      return { label: "Dư thừa", color: "bg-orange-100 text-orange-800" }
    }
    return { label: "Bình thường", color: "bg-green-100 text-green-800" }
  }

  const stockStatus = getStockStatus()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Thêm sản phẩm mới" : "Chỉnh sửa sản phẩm"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="VD: SP001"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Tên sản phẩm <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="VD: Paracetamol 500mg"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Danh mục <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">
                Nhà sản xuất <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.manufacturer} onValueChange={(value) => handleInputChange("manufacturer", value)}>
                <SelectTrigger className={errors.manufacturer ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn nhà sản xuất" />
                </SelectTrigger>
                <SelectContent>
                  {MANUFACTURERS.map((manufacturer) => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.manufacturer && <p className="text-sm text-red-500">{errors.manufacturer}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">
                Liều lượng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange("dosage", e.target.value)}
                placeholder="VD: 500mg"
                className={errors.dosage ? "border-red-500" : ""}
              />
              {errors.dosage && <p className="text-sm text-red-500">{errors.dosage}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Đơn vị</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">
                Giá vốn (₫) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="costPrice"
                type="number"
                value={formData.costPrice}
                onChange={(e) => handleInputChange("costPrice", Number(e.target.value))}
                placeholder="0"
                className={errors.costPrice ? "border-red-500" : ""}
              />
              {errors.costPrice && <p className="text-sm text-red-500">{errors.costPrice}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Giá bán (₫) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", Number(e.target.value))}
                placeholder="0"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
              {formData.price > 0 && formData.costPrice > 0 && (
                <p className="text-sm text-green-600">
                  Lợi nhuận: {(((formData.price - formData.costPrice) / formData.costPrice) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>

          {/* Stock Management */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">
                Tồn kho hiện tại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                placeholder="0"
                className={errors.stock ? "border-red-500" : ""}
              />
              {errors.stock && <p className="text-sm text-red-500">{errors.stock}</p>}
              {formData.stock >= 0 && (
                <Badge variant="secondary" className={stockStatus.color}>
                  {stockStatus.label}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">
                Tồn kho tối thiểu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleInputChange("minStock", Number(e.target.value))}
                placeholder="0"
                className={errors.minStock ? "border-red-500" : ""}
              />
              {errors.minStock && <p className="text-sm text-red-500">{errors.minStock}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStock">
                Tồn kho tối đa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={(e) => handleInputChange("maxStock", Number(e.target.value))}
                placeholder="0"
                className={errors.maxStock ? "border-red-500" : ""}
              />
              {errors.maxStock && <p className="text-sm text-red-500">{errors.maxStock}</p>}
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">
                Hạn sử dụng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                className={errors.expiryDate ? "border-red-500" : ""}
              />
              {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">
                Số lô <span className="text-red-500">*</span>
              </Label>
              <Input
                id="batchNumber"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange("batchNumber", e.target.value)}
                placeholder="VD: LOT001"
                className={errors.batchNumber ? "border-red-500" : ""}
              />
              {errors.batchNumber && <p className="text-sm text-red-500">{errors.batchNumber}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">
                Mã vạch <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  placeholder="VD: 8936001234567"
                  className={errors.barcode ? "border-red-500 flex-1" : "flex-1"}
                />
                <Button type="button" variant="outline" onClick={generateBarcode}>
                  Tạo mã
                </Button>
              </div>
              {errors.barcode && <p className="text-sm text-red-500">{errors.barcode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng bán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Vị trí kho</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="VD: Kệ A1-01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Nhà cung cấp</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                placeholder="VD: Dược Hà Tây"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Mô tả chi tiết về sản phẩm..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {mode === "create" ? "Thêm sản phẩm" : "Cập nhật"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
