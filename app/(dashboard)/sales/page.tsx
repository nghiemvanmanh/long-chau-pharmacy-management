"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import DataTable from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Receipt, DollarSign, Users, Clock } from "lucide-react"
import { StatsCard } from "@/components/ui/stats-card"
import { PageHeader } from "@/components/ui/page-header"
import { POSInterface } from "@/components/ui/pos-interface"
import { SalesFilterControls } from "@/components/ui/sales-filter-controls"
import { useSales } from "@/hooks/use-sales"
import { PERMISSIONS } from "@/lib/constants"
import { useAuth } from "@/contexts/auth-context"

function SalesStats({ sales }: { sales: any[] }) {
  const today = new Date().toDateString()
  const todaySales = sales.filter((sale) => new Date(sale.createdAt).toDateString() === today)
  const completedSales = sales.filter((sale) => sale.status === "completed")

  const stats = [
    {
      title: "Tổng đơn hàng",
      value: sales.length.toString(),
      change: `+${todaySales.length} hôm nay`,
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Doanh thu hôm nay",
      value: `${todaySales
        .filter((s) => s.status === "completed")
        .reduce((sum, s) => sum + s.totalAmount, 0)
        .toLocaleString()} ₫`,
      change: `${todaySales.filter((s) => s.status === "completed").length} đơn`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Đơn chờ xử lý",
      value: sales.filter((s) => s.status === "draft" || s.paymentStatus === "pending").length.toString(),
      change: "Cần xử lý",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Khách hàng mới",
      value: new Set(todaySales.map((s) => s.customerId).filter(Boolean)).size.toString(),
      change: "Hôm nay",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  )
}

export default function SalesPage() {
  const { sales, customers, loading, createSale, updateSale, deleteSale, addCustomer, exportSales } = useSales()
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState("pos")
  const [saleTypeFilter, setSaleTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  // Force refresh when sales change (for real-time updates)
  useEffect(() => {
    setRefreshKey((prev) => prev + 1)
  }, [sales])

  const filteredSales = sales.filter((sale) => {
    const matchesSaleType = saleTypeFilter === "all" || sale.saleType === saleTypeFilter
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter
    const matchesPaymentStatus = paymentStatusFilter === "all" || sale.paymentStatus === paymentStatusFilter
    const matchesPaymentMethod = paymentMethodFilter === "all" || sale.paymentMethod === paymentMethodFilter

    let matchesDate = true
    if (dateFrom && dateTo) {
      const saleDate = new Date(sale.createdAt).toISOString().split("T")[0]
      matchesDate = saleDate >= dateFrom && saleDate <= dateTo
    }

    return matchesSaleType && matchesStatus && matchesPaymentStatus && matchesPaymentMethod && matchesDate
  })

  const handleCreateSale = async (saleData: any) => {
    if (!hasPermission(PERMISSIONS.SALES_CREATE)) {
      toast.error("Bạn không có quyền tạo đơn hàng")
      return { success: false, error: "Không có quyền" }
    }

    const result = await createSale(saleData)
    if (result.success) {
      toast.success("Tạo đơn hàng thành công!")
    } else {
      toast.error(result.error || "Có lỗi xảy ra")
    }
    return result
  }

  const handleAddCustomer = async (customerData: any) => {
    if (!hasPermission(PERMISSIONS.CUSTOMER_CREATE)) {
      toast.error("Bạn không có quyền thêm khách hàng")
      return { success: false, error: "Không có quyền" }
    }

    const result = await addCustomer(customerData)
    if (result.success) {
      toast.success("Thêm khách hàng thành công!")
    } else {
      toast.error(result.error || "Có lỗi xảy ra")
    }
    return result
  }

  const handleEdit = (sale: any) => {
    if (!hasPermission(PERMISSIONS.SALES_UPDATE)) {
      toast.error("Bạn không có quyền chỉnh sửa đơn hàng")
      return
    }
    // TODO: Implement edit modal
    console.log("Edit sale:", sale)
  }

  const handleView = (sale: any) => {
    // TODO: Implement view modal
    console.log("View sale:", sale)
  }

  const handleExport = () => {
    if (!hasPermission(PERMISSIONS.REPORTS_EXPORT)) {
      toast.error("Bạn không có quyền xuất dữ liệu")
      return
    }
    exportSales(dateFrom, dateTo)
    toast.success("Xuất dữ liệu thành công!")
  }

  const handleResetAllFilters = () => {
    setSaleTypeFilter("all")
    setStatusFilter("all")
    setPaymentStatusFilter("all")
    setPaymentMethodFilter("all")
    setDateFrom("")
    setDateTo("")
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const saleTime = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - saleTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Vừa xong"
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`

    return saleTime.toLocaleDateString("vi-VN")
  }

  const salesColumns = [
    {
      key: "saleNumber" as const,
      label: "Số hóa đơn",
      sortable: true,
      render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
    },
    {
      key: "customerName" as const,
      label: "Khách hàng",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <span className="font-medium">{value || "Khách lẻ"}</span>
          {row.customerPhone && <p className="text-sm text-gray-500">{row.customerPhone}</p>}
        </div>
      ),
    },
    {
      key: "saleType" as const,
      label: "Loại bán",
      render: (value: string) => (
        <Badge
          variant="outline"
          className={
            value === "online"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-green-50 text-green-700 border-green-200"
          }
        >
          {value === "online" ? "Online" : "Tại quầy"}
        </Badge>
      ),
    },
    {
      key: "items" as const,
      label: "Sản phẩm",
      render: (value: any[]) => (
        <div>
          <span className="font-medium">{value.length} sản phẩm</span>
          <p className="text-sm text-gray-500">
            {value.reduce((sum, item) => sum + item.quantity, 0)} {value[0]?.unit || ""}
          </p>
        </div>
      ),
    },
    {
      key: "totalAmount" as const,
      label: "Tổng tiền",
      sortable: true,
      render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
    },
    {
      key: "paymentMethod" as const,
      label: "Thanh toán",
      render: (value: string) => (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {value === "cash" ? "Tiền mặt" : value === "card" ? "Thẻ" : value === "transfer" ? "Chuyển khoản" : "Hỗn hợp"}
        </Badge>
      ),
    },
    {
      key: "paymentStatus" as const,
      label: "TT Thanh toán",
      render: (value: string) => {
        const statusConfig = {
          paid: { label: "Đã thanh toán", className: "bg-green-100 text-green-800" },
          pending: { label: "Chờ thanh toán", className: "bg-yellow-100 text-yellow-800" },
          partial: { label: "Thanh toán 1 phần", className: "bg-orange-100 text-orange-800" },
        }
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.pending

        return (
          <Badge variant="secondary" className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: "status" as const,
      label: "Trạng thái",
      render: (value: string) => {
        const statusConfig = {
          completed: { label: "Hoàn thành", className: "bg-green-100 text-green-800" },
          draft: { label: "Nháp", className: "bg-gray-100 text-gray-800" },
          cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
          refunded: { label: "Đã hoàn", className: "bg-purple-100 text-purple-800" },
        }
        const config = statusConfig[value as keyof typeof statusConfig] || statusConfig.draft

        return (
          <Badge variant="secondary" className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: "createdAt" as const,
      label: "Thời gian tạo",
      render: (value: string) => {
        const timeAgo = getTimeAgo(value)
        const isRecent = new Date().getTime() - new Date(value).getTime() < 30 * 60 * 1000 // 30 minutes

        return (
          <div className="flex flex-col">
            <span className={`text-sm ${isRecent ? "text-green-600 font-semibold" : ""}`}>
              {timeAgo}
              {isRecent && (
                <span className="ml-1 inline-flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </span>
              )}
            </span>
            <span className="text-xs text-gray-500">{new Date(value).toLocaleString("vi-VN")}</span>
          </div>
        )
      },
    },
    {
      key: "createdBy" as const,
      label: "Người tạo",
      render: (value: string) => <span className="text-sm">{value}</span>,
    },
  ]

  return (
    <div className="p-6" key={refreshKey}>
      <PageHeader title="Quản lý Bán hàng" description="Hệ thống POS và quản lý đơn hàng chuyên nghiệp" />

      <SalesStats sales={sales} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pos" className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Bán hàng (POS)</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <Receipt className="w-4 h-4" />
            <span>Lịch sử đơn hàng</span>
          </TabsTrigger>
        </TabsList>

        {/* POS Interface */}
        <TabsContent value="pos" className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <POSInterface customers={customers} onCreateSale={handleCreateSale} onAddCustomer={handleAddCustomer} />
          </motion.div>
        </TabsContent>

        {/* Sales History */}
        <TabsContent value="history" className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <DataTable
              title="Lịch sử Đơn hàng"
              data={filteredSales}
              columns={salesColumns}
              searchPlaceholder="Tìm theo số HĐ, tên KH, SĐT..."
              onEdit={hasPermission(PERMISSIONS.SALES_UPDATE) ? handleEdit : undefined}
              onExport={hasPermission(PERMISSIONS.REPORTS_EXPORT) ? handleExport : undefined}
              loading={loading}
              filterControls={
                <SalesFilterControls
                  saleTypeFilter={saleTypeFilter}
                  setSaleTypeFilter={setSaleTypeFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  paymentStatusFilter={paymentStatusFilter}
                  setPaymentStatusFilter={setPaymentStatusFilter}
                  paymentMethodFilter={paymentMethodFilter}
                  setPaymentMethodFilter={setPaymentMethodFilter}
                  dateFrom={dateFrom}
                  setDateFrom={setDateFrom}
                  dateTo={dateTo}
                  setDateTo={setDateTo}
                />
              }
              onResetFilters={handleResetAllFilters}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
