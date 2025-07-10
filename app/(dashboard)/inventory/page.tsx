"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { InventoryStats } from "@/components/ui/inventory-stats"
import { InventoryFilterControls } from "@/components/ui/inventory-filter-controls"
import { InventoryFormModal } from "@/components/ui/inventory-form-modal"
import { StockAdjustmentModal } from "@/components/ui/stock-adjustment-modal"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useInventory, type InventoryItem } from "@/hooks/use-inventory"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const { toast } = useToast()
  const {
    inventory,
    loading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    getInventoryStats,
    getCategories,
    getSuppliers,
  } = useInventory()

  // Filter states
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSupplier, setFilterSupplier] = useState("all")

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Get stats and filter options
  const stats = getInventoryStats()
  const categories = getCategories()
  const suppliers = getSuppliers()

  // Filter inventory data
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const categoryMatch = filterCategory === "all" || item.category === filterCategory
      const statusMatch = filterStatus === "all" || item.status === filterStatus
      const supplierMatch = filterSupplier === "all" || item.supplier === filterSupplier
      return categoryMatch && statusMatch && supplierMatch
    })
  }, [inventory, filterCategory, filterStatus, filterSupplier])

  // Table columns
  const inventoryColumns = [
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
      key: "currentStock" as const,
      label: "Tồn kho",
      sortable: true,
      render: (value: number, row: InventoryItem) => {
        const isLow = row.status === "low"
        const isOverstock = row.status === "overstock"
        const isOutOfStock = row.status === "out_of_stock"

        return (
          <div className="flex items-center space-x-2">
            <span
              className={`font-semibold ${
                isOutOfStock
                  ? "text-red-700"
                  : isLow
                    ? "text-red-600"
                    : isOverstock
                      ? "text-orange-600"
                      : "text-gray-900"
              }`}
            >
              {value}
            </span>
            {isOutOfStock && (
              <Badge variant="destructive" className="text-xs">
                Hết hàng
              </Badge>
            )}
            {isLow && !isOutOfStock && (
              <Badge variant="destructive" className="text-xs">
                Thấp
              </Badge>
            )}
            {isOverstock && (
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">
                Dư thừa
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: "location" as const,
      label: "Vị trí",
      render: (value: string) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: "supplier" as const,
      label: "Nhà cung cấp",
      sortable: true,
    },
    {
      key: "value" as const,
      label: "Giá trị tồn kho",
      sortable: true,
      render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
    },
    {
      key: "lastRestocked" as const,
      label: "Nhập kho cuối",
      sortable: true,
      render: (value: string) => <span>{new Date(value).toLocaleDateString("vi-VN")}</span>,
    },
  ]

  // Event handlers
  const handleResetFilters = () => {
    setFilterCategory("all")
    setFilterStatus("all")
    setFilterSupplier("all")
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setIsFormModalOpen(true)
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setIsFormModalOpen(true)
  }

  const handleDeleteItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const handleStockAdjustment = (item: InventoryItem) => {
    setSelectedItem(item)
    setIsStockModalOpen(true)
  }

  const handleFormSubmit = async (data: Omit<InventoryItem, "id">) => {
    if (editingItem) {
      return await updateInventoryItem(editingItem.id, data)
    } else {
      return await addInventoryItem(data)
    }
  }

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      const result = await deleteInventoryItem(selectedItem.id)
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Xóa sản phẩm thành công",
          variant: "success",
        })
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Có lỗi xảy ra",
          variant: "destructive",
        })
      }
    }
  }

  const handleExport = () => {
    // Simulate export functionality
    toast({
      title: "Xuất file thành công",
      description: "Dữ liệu kho hàng đã được xuất ra file Excel",
      variant: "success",
    })
  }

  // Custom actions for each row
  const customActions = (item: InventoryItem) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleStockAdjustment(item)}
      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
      title="Điều chỉnh tồn kho"
    >
      <Package2 className="w-4 h-4" />
    </Button>
  )

  return (
    <div className="p-6">
      <PageHeader title="Quản lý Kho hàng" description="Theo dõi tồn kho và quản lý hàng hóa" />

      <InventoryStats stats={stats} />

      <InventoryFilterControls
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterSupplier={filterSupplier}
        setFilterSupplier={setFilterSupplier}
        categories={categories}
        suppliers={suppliers}
        onResetFilters={handleResetFilters}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <DataTable
          title="Danh sách Tồn kho"
          data={filteredInventory}
          columns={inventoryColumns}
          searchPlaceholder="Tìm kiếm sản phẩm..."
          loading={loading}
          onAdd={handleAddItem}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onExport={handleExport}
          customActions={customActions}
        />
      </motion.div>

      {/* Modals */}
      <InventoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        categories={categories}
        suppliers={suppliers}
      />

      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSubmit={adjustStock}
        item={selectedItem}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa sản phẩm"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedItem?.name}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  )
}
