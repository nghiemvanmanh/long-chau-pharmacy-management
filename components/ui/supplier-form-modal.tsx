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
import type { Supplier } from "@/hooks/use-suppliers"

interface SupplierFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Supplier, "id">) => void
  supplier?: Supplier | null
  mode: "add" | "edit"
}

export function SupplierFormModal({ isOpen, onClose, onSubmit, supplier, mode }: SupplierFormModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    shortName: "",
    email: "",
    phone: "",
    address: "",
    representative: "",
    taxCode: "",
    businessType: "",
    paymentTerms: "",
    status: "active" as "active" | "inactive",
    contractCount: 0,
    totalPurchases: 0,
    lastTransaction: "",
    rating: 0,
    productCount: 0,
    totalDebt: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (supplier && mode === "edit") {
      setFormData(supplier)
    } else {
      setFormData({
        code: "",
        name: "",
        shortName: "",
        email: "",
        phone: "",
        address: "",
        representative: "",
        taxCode: "",
        businessType: "",
        paymentTerms: "",
        status: "active",
        contractCount: 0,
        totalPurchases: 0,
        lastTransaction: new Date().toISOString().split("T")[0],
        rating: 0,
        productCount: 0,
        totalDebt: 0,
      })
    }
    setErrors({})
  }, [supplier, mode, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) newErrors.code = "Mã nhà cung cấp là bắt buộc"
    if (!formData.name.trim()) newErrors.name = "Tên nhà cung cấp là bắt buộc"
    if (!formData.shortName.trim()) newErrors.shortName = "Tên viết tắt là bắt buộc"
    if (!formData.email.trim()) newErrors.email = "Email là bắt buộc"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ"
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc"
    if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc"
    if (!formData.representative.trim()) newErrors.representative = "Người đại diện là bắt buộc"
    if (!formData.taxCode.trim()) newErrors.taxCode = "Mã số thuế là bắt buộc"
    if (!formData.businessType.trim()) newErrors.businessType = "Loại hình kinh doanh là bắt buộc"
    if (!formData.paymentTerms.trim()) newErrors.paymentTerms = "Điều kiện thanh toán là bắt buộc"

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Thêm nhà cung cấp mới" : "Chỉnh sửa nhà cung cấp"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mã nhà cung cấp */}
            <div className="space-y-2">
              <Label htmlFor="code">Mã nhà cung cấp *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="VD: NCC001"
                className={errors.code ? "border-red-500" : ""}
              />
              {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
            </div>

            {/* Tên nhà cung cấp */}
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhà cung cấp *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Tên đầy đủ của công ty"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Tên viết tắt */}
            <div className="space-y-2">
              <Label htmlFor="shortName">Tên viết tắt *</Label>
              <Input
                id="shortName"
                value={formData.shortName}
                onChange={(e) => handleInputChange("shortName", e.target.value)}
                placeholder="Tên gọi ngắn gọn"
                className={errors.shortName ? "border-red-500" : ""}
              />
              {errors.shortName && <p className="text-sm text-red-500">{errors.shortName}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@company.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="0123456789"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            {/* Người đại diện */}
            <div className="space-y-2">
              <Label htmlFor="representative">Người đại diện *</Label>
              <Input
                id="representative"
                value={formData.representative}
                onChange={(e) => handleInputChange("representative", e.target.value)}
                placeholder="Họ tên người đại diện"
                className={errors.representative ? "border-red-500" : ""}
              />
              {errors.representative && <p className="text-sm text-red-500">{errors.representative}</p>}
            </div>

            {/* Mã số thuế */}
            <div className="space-y-2">
              <Label htmlFor="taxCode">Mã số thuế *</Label>
              <Input
                id="taxCode"
                value={formData.taxCode}
                onChange={(e) => handleInputChange("taxCode", e.target.value)}
                placeholder="0123456789"
                className={errors.taxCode ? "border-red-500" : ""}
              />
              {errors.taxCode && <p className="text-sm text-red-500">{errors.taxCode}</p>}
            </div>

            {/* Loại hình kinh doanh */}
            <div className="space-y-2">
              <Label htmlFor="businessType">Loại hình kinh doanh *</Label>
              <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
                <SelectTrigger className={errors.businessType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sản xuất dược phẩm">Sản xuất dược phẩm</SelectItem>
                  <SelectItem value="Phân phối dược phẩm">Phân phối dược phẩm</SelectItem>
                  <SelectItem value="Nhập khẩu dược phẩm">Nhập khẩu dược phẩm</SelectItem>
                  <SelectItem value="Bán lẻ dược phẩm">Bán lẻ dược phẩm</SelectItem>
                </SelectContent>
              </Select>
              {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
            </div>

            {/* Điều kiện thanh toán */}
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Điều kiện thanh toán *</Label>
              <Select value={formData.paymentTerms} onValueChange={(value) => handleInputChange("paymentTerms", value)}>
                <SelectTrigger className={errors.paymentTerms ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn điều kiện" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Thanh toán ngay">Thanh toán ngay</SelectItem>
                  <SelectItem value="15 ngày">15 ngày</SelectItem>
                  <SelectItem value="30 ngày">30 ngày</SelectItem>
                  <SelectItem value="45 ngày">45 ngày</SelectItem>
                  <SelectItem value="60 ngày">60 ngày</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentTerms && <p className="text-sm text-red-500">{errors.paymentTerms}</p>}
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hợp tác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Đánh giá */}
            <div className="space-y-2">
              <Label htmlFor="rating">Đánh giá (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", Number.parseFloat(e.target.value) || 0)}
                placeholder="4.5"
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Địa chỉ đầy đủ của công ty"
              className={errors.address ? "border-red-500" : ""}
              rows={3}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
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
