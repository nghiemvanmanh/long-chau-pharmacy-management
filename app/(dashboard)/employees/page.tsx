"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DataTable from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FAKE_EMPLOYEES } from "@/lib/fake-data"

const employeeColumns = [
  {
    key: "code" as const,
    label: "Mã NV",
    sortable: true,
  },
  {
    key: "name" as const,
    label: "Họ và Tên",
    sortable: true,
    render: (value: string, row: any) => (
      <div className="flex items-center space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={
              row.avatar ||
              "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2NjY2NjYyIvPjwvc3ZnPg=="
            }
          />
          <AvatarFallback className="bg-blue-600 text-white text-xs">
            {value
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{value}</span>
      </div>
    ),
  },
  {
    key: "position" as const,
    label: "Chức vụ",
    sortable: true,
  },
  {
    key: "department" as const,
    label: "Phòng ban",
    render: (value: string) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {value}
      </Badge>
    ),
  },
  {
    key: "phone" as const,
    label: "Số điện thoại",
  },
  {
    key: "email" as const,
    label: "Email",
  },
  {
    key: "salary" as const,
    label: "Lương",
    render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
  },
  {
    key: "status" as const,
    label: "Trạng thái",
    render: (value: string) => (
      <Badge
        variant={value === "active" ? "default" : "secondary"}
        className={value === "active" ? "bg-green-100 text-green-800" : ""}
      >
        {value === "active" ? "Hoạt động" : "Không hoạt động"}
      </Badge>
    ),
  },
]

export default function EmployeesPage() {
  const [employees] = useState(FAKE_EMPLOYEES)

  const handleAdd = () => {
    console.log("Add employee")
  }

  const handleEdit = (employee: any) => {
    console.log("Edit employee:", employee)
  }

  const handleDelete = (employee: any) => {
    console.log("Delete employee:", employee)
  }

  const handleExport = () => {
    console.log("Export employees")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <DataTable
        title="Quản lý Nhân viên"
        data={employees}
        columns={employeeColumns}
        searchPlaceholder="Tìm kiếm nhân viên..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />
    </motion.div>
  )
}
