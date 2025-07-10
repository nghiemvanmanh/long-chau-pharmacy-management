"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DataTable from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { FAKE_MEDICATIONS } from "@/lib/fake-data"

const medicationColumns = [
  {
    key: "code" as const,
    label: "Mã thuốc",
    sortable: true,
    render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
  },
  {
    key: "name" as const,
    label: "Tên thuốc",
    sortable: true,
    render: (value: string) => <span className="font-medium">{value}</span>,
  },
  {
    key: "category" as const,
    label: "Danh mục",
    render: (value: string) => (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        {value}
      </Badge>
    ),
  },
  {
    key: "manufacturer" as const,
    label: "Nhà sản xuất",
  },
  {
    key: "dosage" as const,
    label: "Liều lượng",
    render: (value: string) => <Badge variant="secondary">{value}</Badge>,
  },
  {
    key: "price" as const,
    label: "Giá bán",
    render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
  },
  {
    key: "stock" as const,
    label: "Tồn kho",
    render: (value: number, row: any) => {
      const isLowStock = value <= row.minStock
      return (
        <div className="flex items-center space-x-2">
          <span className={`font-semibold ${isLowStock ? "text-red-600" : "text-gray-900"}`}>{value}</span>
          {isLowStock && (
            <Badge variant="destructive" className="text-xs">
              Sắp hết
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    key: "expiryDate" as const,
    label: "Hạn sử dụng",
    render: (value: string) => {
      const expiryDate = new Date(value)
      const now = new Date()
      const monthsUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
      const isExpiringSoon = monthsUntilExpiry <= 6

      return (
        <div className="flex items-center space-x-2">
          <span className={isExpiringSoon ? "text-orange-600 font-semibold" : ""}>
            {new Date(value).toLocaleDateString("vi-VN")}
          </span>
          {isExpiringSoon && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
              Sắp hết hạn
            </Badge>
          )}
        </div>
      )
    },
  },
]

export default function MedicationsPage() {
  const [medications] = useState(FAKE_MEDICATIONS)

  const handleAdd = () => {
    console.log("Add medication")
  }

  const handleEdit = (medication: any) => {
    console.log("Edit medication:", medication)
  }

  const handleDelete = (medication: any) => {
    console.log("Delete medication:", medication)
  }

  const handleExport = () => {
    console.log("Export medications")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <DataTable
        title="Quản lý Thuốc"
        data={medications}
        columns={medicationColumns}
        searchPlaceholder="Tìm kiếm thuốc..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />
    </motion.div>
  )
}
