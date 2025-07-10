"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DataTable from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { FAKE_ORDERS } from "@/lib/fake-data"

const orderColumns = [
  {
    key: "orderNumber" as const,
    label: "Số đơn hàng",
    sortable: true,
    render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
  },
  {
    key: "customerName" as const,
    label: "Khách hàng",
    sortable: true,
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    key: "orderDate" as const,
    label: "Ngày đặt hàng",
    render: (value: string) => <span>{new Date(value).toLocaleDateString("vi-VN")}</span>,
  },
  {
    key: "totalAmount" as const,
    label: "Tổng tiền",
    render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
  },
  {
    key: "paymentMethod" as const,
    label: "Thanh toán",
    render: (value: string) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {value === "cash" ? "Tiền mặt" : "Thẻ"}
      </Badge>
    ),
  },
  {
    key: "status" as const,
    label: "Trạng thái",
    render: (value: string) => {
      const statusConfig = {
        completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
        pending: { label: "Đang xử lý", className: "bg-yellow-100 text-yellow-800" },
        cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
      }
      const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending

      return (
        <Badge variant="secondary" className={config.className}>
          {config.label}
        </Badge>
      )
    },
  },
]

export default function OrdersPage() {
  const [orders] = useState(FAKE_ORDERS)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <DataTable
        title="Quản lý Đơn hàng"
        data={orders}
        columns={orderColumns}
        searchPlaceholder="Tìm kiếm đơn hàng..."
        onAdd={() => console.log("Add order")}
        onEdit={(order) => console.log("Edit order:", order)}
        onDelete={(order) => console.log("Delete order:", order)}
        onExport={() => console.log("Export orders")}
      />
    </motion.div>
  )
}
