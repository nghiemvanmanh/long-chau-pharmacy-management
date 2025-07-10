"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import DataTable from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, Calendar, TrendingUp, RotateCcw } from "lucide-react"
import { StatsCard } from "@/components/ui/stats-card"
import { PageHeader } from "@/components/ui/page-header"
import { ProductFormModal } from "@/components/ui/product-form-modal"
import { StockUpdateModal } from "@/components/ui/stock-update-modal"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useProducts } from "@/hooks/use-products"
import { ProductFilterControls } from "@/components/ui/product-filter-controls"
import { PERMISSIONS } from "@/lib/constants"
import { useAuth } from "@/contexts/auth-context"

function ProductStats({ products }: { products: any[] }) {
  const stats = [
    {
      title: "Tổng sản phẩm",
      value: products.length.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Sản phẩm sắp hết",
      value: products.filter((p) => p.stock <= p.minStock).length.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Sắp hết hạn",
      value: products
        .filter((p) => {
          const monthsUntilExpiry =
            (new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
          return monthsUntilExpiry <= 6 && monthsUntilExpiry > 0
        })
        .length.toString(),
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Cập nhật hôm nay",
      value: products
        .filter((p) => {
          if (!p.lastRestocked) return false
          const today = new Date().toDateString()
          const restockDate = new Date(p.lastRestocked).toDateString()
          return today === restockDate
        })
        .length.toString(),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
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

export default function ProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct, updateStock, exportProducts } = useProducts()
  const { hasPermission } = useAuth()
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [refreshKey, setRefreshKey] = useState(0)

  // Force refresh when products change (for real-time updates)
  useEffect(() => {
    setRefreshKey((prev) => prev + 1)
  }, [products])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter

    let matchesStock = true
    if (stockFilter === "low") {
      matchesStock = product.stock <= product.minStock
    } else if (stockFilter === "normal") {
      matchesStock = product.stock > product.minStock && product.stock < product.maxStock * 0.9
    } else if (stockFilter === "overstock") {
      matchesStock = product.stock >= product.maxStock * 0.9
    }

    return matchesCategory && matchesStatus && matchesStock
  })

  const handleAdd = () => {
    if (!hasPermission(PERMISSIONS.PRODUCT_CREATE)) {
      toast.error("Bạn không có quyền tạo sản phẩm mới")
      return
    }
    setSelectedProduct(null)
    setFormMode("create")
    setIsFormModalOpen(true)
  }

  const handleEdit = (product: any) => {
    if (!hasPermission(PERMISSIONS.PRODUCT_UPDATE)) {
      toast.error("Bạn không có quyền chỉnh sửa sản phẩm")
      return
    }
    setSelectedProduct(product)
    setFormMode("edit")
    setIsFormModalOpen(true)
  }

  const handleDelete = (product: any) => {
    if (!hasPermission(PERMISSIONS.PRODUCT_DELETE)) {
      toast.error("Bạn không có quyền xóa sản phẩm")
      return
    }
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleUpdateStock = (product: any) => {
    if (!hasPermission(PERMISSIONS.INVENTORY_UPDATE)) {
      toast.error("Bạn không có quyền cập nhật tồn kho")
      return
    }
    setSelectedProduct(product)
    setIsStockModalOpen(true)
  }

  const handleFormSubmit = async (productData: any) => {
    try {
      if (formMode === "create") {
        const result = await addProduct(productData)
        if (result.success) {
          toast.success("Thêm sản phẩm thành công!")
        } else {
          toast.error(result.error || "Có lỗi xảy ra")
        }
      } else {
        const result = await updateProduct(selectedProduct.id, productData)
        if (result.success) {
          toast.success("Cập nhật sản phẩm thành công!")
        } else {
          toast.error(result.error || "Có lỗi xảy ra")
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại")
    }
  }

  const handleStockSubmit = async (productId: number, newStock: number, reason: string) => {
    try {
      const result = await updateStock(productId, newStock, reason)
      if (result.success) {
        toast.success("Cập nhật tồn kho thành công!")
      } else {
        toast.error(result.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại")
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteProduct(selectedProduct.id)
      if (result.success) {
        toast.success("Xóa sản phẩm thành công!")
        setIsDeleteModalOpen(false)
      } else {
        toast.error(result.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại")
    }
  }

  const handleExport = () => {
    if (!hasPermission(PERMISSIONS.REPORTS_EXPORT)) {
      toast.error("Bạn không có quyền xuất dữ liệu")
      return
    }
    exportProducts()
    toast.success("Xuất dữ liệu thành công!")
  }

  const handleResetAllFilters = () => {
    setCategoryFilter("all")
    setStatusFilter("all")
    setStockFilter("all")
  }

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật"

    const now = new Date()
    const updateTime = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Vừa xong"
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`

    return updateTime.toLocaleDateString("vi-VN")
  }

  const productColumns = [
    {
      key: "code" as const,
      label: "Mã sản phẩm",
      sortable: true,
      render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
    },
    {
      key: "name" as const,
      label: "Tên sản phẩm",
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
      render: (value: string) => <span className="text-sm">{value}</span>,
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
        const isLow = value <= row.minStock
        const isOverstock = value >= row.maxStock * 0.9
        const isRecent =
          row.lastRestocked && new Date().getTime() - new Date(row.lastRestocked).getTime() < 24 * 60 * 60 * 1000 // 24 hours

        return (
          <div className="flex items-center space-x-2">
            <div className="flex flex-col">
              <span
                className={`font-semibold ${isLow ? "text-red-600" : isOverstock ? "text-orange-600" : "text-gray-900"}`}
              >
                {value} {row.unit}
                {isRecent && (
                  <span className="ml-1 inline-flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </span>
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUpdateStock(row)}
                className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto justify-start"
                disabled={!hasPermission(PERMISSIONS.INVENTORY_UPDATE)}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Cập nhật
              </Button>
            </div>
            <div className="flex flex-col space-y-1">
              {isLow && (
                <Badge variant="destructive" className="text-xs">
                  Sắp hết
                </Badge>
              )}
              {isOverstock && (
                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">
                  Dư thừa
                </Badge>
              )}
            </div>
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
        const isExpiringSoon = monthsUntilExpiry <= 6 && monthsUntilExpiry > 0
        const isExpired = expiryDate <= now

        return (
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm ${isExpired ? "text-red-600 font-semibold" : isExpiringSoon ? "text-orange-600 font-semibold" : ""}`}
            >
              {expiryDate.toLocaleDateString("vi-VN")}
            </span>
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Hết hạn
              </Badge>
            )}
            {isExpiringSoon && !isExpired && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">
                Sắp hết hạn
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: "lastRestocked" as const,
      label: "Cập nhật cuối",
      render: (value: string) => {
        const timeAgo = getTimeAgo(value)
        const isRecent = value && new Date().getTime() - new Date(value).getTime() < 24 * 60 * 60 * 1000 // 24 hours

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
            {value && <span className="text-xs text-gray-500">{new Date(value).toLocaleString("vi-VN")}</span>}
          </div>
        )
      },
    },
    {
      key: "status" as const,
      label: "Trạng thái",
      render: (value: string) => (
        <Badge
          variant={value === "active" ? "default" : "secondary"}
          className={value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {value === "active" ? "Hoạt động" : "Ngừng bán"}
        </Badge>
      ),
    },
  ]

  return (
    <div className="p-6" key={refreshKey}>
      <PageHeader title="Quản lý Sản phẩm" description="Quản lý thông tin thuốc, theo dõi hạn sử dụng và tồn kho" />

      <ProductStats products={products} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <DataTable
          title="Danh sách Sản phẩm"
          data={filteredProducts}
          columns={productColumns}
          searchPlaceholder="Tìm kiếm sản phẩm..."
          onAdd={hasPermission(PERMISSIONS.PRODUCT_CREATE) ? handleAdd : undefined}
          onEdit={hasPermission(PERMISSIONS.PRODUCT_UPDATE) ? handleEdit : undefined}
          onDelete={hasPermission(PERMISSIONS.PRODUCT_DELETE) ? handleDelete : undefined}
          onExport={hasPermission(PERMISSIONS.REPORTS_EXPORT) ? handleExport : undefined}
          loading={loading}
          filterControls={
            <ProductFilterControls
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
            />
          }
          onResetFilters={handleResetAllFilters}
        />
      </motion.div>

      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        product={selectedProduct}
        mode={formMode}
      />

      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSubmit={handleStockSubmit}
        product={selectedProduct}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này?"
        itemName={selectedProduct?.name}
      />
    </div>
  )
}
