"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Minus, X, Search, Package } from "lucide-react"
import type { Invoice, InvoiceItem } from "@/hooks/use-invoices"
import { useProducts } from "@/hooks/use-products"

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">) => void
  invoice?: Invoice
  isLoading?: boolean
}

export function InvoiceFormModal({ isOpen, onClose, onSubmit, invoice, isLoading }: InvoiceFormModalProps) {
  const { products } = useProducts()
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    saleType: "offline" as "online" | "offline",
    paymentMethod: "cash" as "cash" | "card" | "transfer",
    paymentStatus: "pending" as "paid" | "pending" | "failed",
    status: "completed" as "draft" | "completed" | "cancelled",
    notes: "",
    dueDate: "",
    discountType: "amount" as "amount" | "percent",
    discount: 0,
    taxRate: 0,
  })

  const [items, setItems] = useState<InvoiceItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [showProductSearch, setShowProductSearch] = useState(false)

  useEffect(() => {
    if (invoice) {
      setFormData({
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        customerEmail: invoice.customerEmail || "",
        customerAddress: invoice.customerAddress || "",
        saleType: invoice.saleType,
        paymentMethod: invoice.paymentMethod,
        paymentStatus: invoice.paymentStatus,
        status: invoice.status,
        notes: invoice.notes || "",
        dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
        discountType: invoice.discountType,
        discount: invoice.discount,
        taxRate: invoice.taxRate,
      })
      setItems(invoice.items)
    } else {
      // Reset form for new invoice
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        customerAddress: "",
        saleType: "offline",
        paymentMethod: "cash",
        paymentStatus: "pending",
        status: "completed",
        notes: "",
        dueDate: "",
        discountType: "amount",
        discount: 0,
        taxRate: 0,
      })
      setItems([])
    }
  }, [invoice, isOpen])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.code.toLowerCase().includes(productSearch.toLowerCase()),
  )

  const addProduct = (product: any) => {
    const existingItem = items.find((item) => item.productId === product.id)

    if (existingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice * (1 - item.discount / 100),
              }
            : item,
        ),
      )
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        total: product.price,
      }
      setItems((prev) => [...prev, newItem])
    }

    setProductSearch("")
    setShowProductSearch(false)
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice" || field === "discount") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice * (1 - updatedItem.discount / 100)
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = formData.discountType === "percent" ? (subtotal * formData.discount) / 100 : formData.discount
  const taxAmount = (subtotal - discountAmount) * (formData.taxRate / 100)
  const totalAmount = subtotal - discountAmount + taxAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất một sản phẩm")
      return
    }

    const invoiceData = {
      ...formData,
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      totalAmount,
      createdBy: "Current User", // Should come from auth context
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      paidAt: formData.paymentStatus === "paid" ? new Date().toISOString() : undefined,
    }

    onSubmit(invoiceData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? "Chỉnh sửa Hóa đơn" : "Tạo Hóa đơn mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Tên khách hàng *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Số điện thoại *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="saleType">Loại bán hàng</Label>
                <Select
                  value={formData.saleType}
                  onValueChange={(value: "online" | "offline") => setFormData({ ...formData, saleType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Tại quầy</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customerAddress">Địa chỉ</Label>
                <Input
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Sản phẩm
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSearch(!showProductSearch)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm sản phẩm
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showProductSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm sản phẩm theo tên hoặc mã..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                  {productSearch && (
                    <div className="absolute top-full left-0 right-0 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                          onClick={() => addProduct(product)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">Mã: {product.code}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{product.price.toLocaleString()}₫</p>
                              <p className="text-sm text-gray-500">Tồn: {product.stock}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="p-3 text-center text-gray-500">Không tìm thấy sản phẩm</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có sản phẩm nào</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">Mã: {item.productCode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                          min="1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateItem(item.id, "quantity", item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                          className="text-right"
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
                          className="text-right"
                          placeholder="0"
                          max="100"
                        />
                      </div>
                      <div className="w-24 text-right font-semibold">{item.total.toLocaleString()}₫</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thanh toán & Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value: "cash" | "card" | "transfer") =>
                        setFormData({ ...formData, paymentMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tiền mặt</SelectItem>
                        <SelectItem value="card">Thẻ</SelectItem>
                        <SelectItem value="transfer">Chuyển khoản</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: "paid" | "pending" | "failed") =>
                        setFormData({ ...formData, paymentStatus: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Chờ thanh toán</SelectItem>
                        <SelectItem value="paid">Đã thanh toán</SelectItem>
                        <SelectItem value="failed">Thất bại</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Trạng thái hóa đơn</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: "draft" | "completed" | "cancelled") =>
                        setFormData({ ...formData, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Nháp</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Hạn thanh toán</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tổng kết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString()}₫</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Giảm giá:</span>
                    <div className="flex items-center gap-2 ml-auto">
                      <Input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })}
                        className="w-20 text-right"
                      />
                      <Select
                        value={formData.discountType}
                        onValueChange={(value: "amount" | "percent") =>
                          setFormData({ ...formData, discountType: value })
                        }
                      >
                        <SelectTrigger className="w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amount">₫</SelectItem>
                          <SelectItem value="percent">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between text-red-600">
                    <span>Số tiền giảm:</span>
                    <span>-{discountAmount.toLocaleString()}₫</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Thuế:</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: Number.parseFloat(e.target.value) || 0 })}
                        className="w-16 text-right"
                        max="100"
                      />
                      <span>%</span>
                      <span className="ml-2">{taxAmount.toLocaleString()}₫</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">{totalAmount.toLocaleString()}₫</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading || items.length === 0}>
              {isLoading ? "Đang xử lý..." : invoice ? "Cập nhật" : "Tạo hóa đơn"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
