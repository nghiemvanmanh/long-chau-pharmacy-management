"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Receipt,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Printer,
  Download,
  RefreshCw,
  DollarSign,
} from "lucide-react"
import type { Invoice } from "@/hooks/use-invoices"

interface InvoiceDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice | null
  onEdit?: (invoice: Invoice) => void
  onUpdatePayment?: (id: string, status: Invoice["paymentStatus"]) => void
  onRefund?: (id: string, amount: number, reason: string) => void
}

export function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
  onEdit,
  onUpdatePayment,
  onRefund,
}: InvoiceDetailsModalProps) {
  if (!invoice) return null

  const getStatusBadge = (status: string, type: "payment" | "invoice") => {
    if (type === "payment") {
      const config = {
        paid: { label: "Đã thanh toán", className: "bg-green-100 text-green-800" },
        pending: { label: "Chờ thanh toán", className: "bg-yellow-100 text-yellow-800" },
        failed: { label: "Thất bại", className: "bg-red-100 text-red-800" },
        refunded: { label: "Đã hoàn tiền", className: "bg-purple-100 text-purple-800" },
      }
      const statusConfig = config[status as keyof typeof config] || config.pending
      return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
    } else {
      const config = {
        draft: { label: "Nháp", className: "bg-gray-100 text-gray-800" },
        completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
        cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
        refunded: { label: "Đã hoàn tiền", className: "bg-purple-100 text-purple-800" },
      }
      const statusConfig = config[status as keyof typeof config] || config.completed
      return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Implement PDF download logic
    console.log("Download invoice:", invoice.id)
  }

  const handlePaymentUpdate = (status: Invoice["paymentStatus"]) => {
    if (onUpdatePayment) {
      onUpdatePayment(invoice.id, status)
    }
  }

  const handleRefund = () => {
    const amount = prompt("Nhập số tiền hoàn:")
    const reason = prompt("Lý do hoàn tiền:")

    if (amount && reason && onRefund) {
      onRefund(invoice.id, Number.parseFloat(amount), reason)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Chi tiết Hóa đơn {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              In
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Tải PDF
            </Button>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(invoice)}>
                Chỉnh sửa
              </Button>
            )}
            {invoice.paymentStatus === "pending" && onUpdatePayment && (
              <Button size="sm" onClick={() => handlePaymentUpdate("paid")}>
                <DollarSign className="w-4 h-4 mr-2" />
                Đánh dấu đã thanh toán
              </Button>
            )}
            {invoice.paymentStatus === "paid" && onRefund && (
              <Button variant="outline" size="sm" onClick={handleRefund}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Hoàn tiền
              </Button>
            )}
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin Khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{invoice.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{invoice.customerPhone}</span>
                </div>
                {invoice.customerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{invoice.customerEmail}</span>
                  </div>
                )}
                {invoice.customerAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{invoice.customerAddress}</span>
                  </div>
                )}
                <div className="pt-2">
                  <Badge
                    variant="outline"
                    className={
                      invoice.saleType === "online"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-green-50 text-green-700 border-green-200"
                    }
                  >
                    {invoice.saleType === "online" ? "Bán Online" : "Bán tại quầy"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Thông tin Hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số hóa đơn:</span>
                  <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span>{formatDate(invoice.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người tạo:</span>
                  <span>{invoice.createdBy}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hạn thanh toán:</span>
                    <span>{formatDate(invoice.dueDate)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  {getStatusBadge(invoice.status, "invoice")}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Thanh toán:</span>
                  {getStatusBadge(invoice.paymentStatus, "payment")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Thông tin Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-600">Phương thức:</span>
                  <p className="font-medium">
                    {invoice.paymentMethod === "cash"
                      ? "Tiền mặt"
                      : invoice.paymentMethod === "card"
                        ? "Thẻ"
                        : "Chuyển khoản"}
                  </p>
                </div>
                {invoice.paidAt && (
                  <div>
                    <span className="text-gray-600">Thời gian thanh toán:</span>
                    <p className="font-medium">{formatDate(invoice.paidAt)}</p>
                  </div>
                )}
                {invoice.refundedAt && (
                  <div>
                    <span className="text-gray-600">Thời gian hoàn tiền:</span>
                    <p className="font-medium">{formatDate(invoice.refundedAt)}</p>
                  </div>
                )}
              </div>
              {invoice.refundAmount && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700 font-medium">Số tiền hoàn:</span>
                    <span className="text-purple-700 font-bold">{invoice.refundAmount.toLocaleString()}₫</span>
                  </div>
                  {invoice.refundReason && (
                    <p className="text-purple-600 text-sm mt-1">Lý do: {invoice.refundReason}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Danh sách Sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Sản phẩm</th>
                      <th className="text-center py-2">SL</th>
                      <th className="text-right py-2">Đơn giá</th>
                      <th className="text-right py-2">Giảm giá</th>
                      <th className="text-right py-2">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-500">Mã: {item.productCode}</p>
                          </div>
                        </td>
                        <td className="text-center py-3">{item.quantity}</td>
                        <td className="text-right py-3">{item.unitPrice.toLocaleString()}₫</td>
                        <td className="text-right py-3">{item.discount}%</td>
                        <td className="text-right py-3 font-semibold">{item.total.toLocaleString()}₫</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{invoice.subtotal.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Giảm giá ({invoice.discountType === "percent" ? "%" : "₫"}):</span>
                  <span>-{invoice.discount.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế ({invoice.taxRate}%):</span>
                  <span>{invoice.tax.toLocaleString()}₫</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span className="text-green-600">{invoice.totalAmount.toLocaleString()}₫</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
