"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataTable from "@/components/data-table"
import { SupplierStats } from "@/components/ui/supplier-stats"
import { SupplierFilterControls } from "@/components/ui/supplier-filter-controls"
import { SupplierFormModal } from "@/components/ui/supplier-form-modal"
import { ContractFormModal } from "@/components/ui/contract-form-modal"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useSuppliers } from "@/hooks/use-suppliers"
import { useToast } from "@/hooks/use-toast"

export default function SuppliersPage() {
  const {
    suppliers,
    contracts,
    transactions,
    loading,
    stats,
    businessTypes,
    paymentTerms,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addContract,
    updateContract,
    deleteContract,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useSuppliers()

  const { toast } = useToast()

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all")
  const [paymentTermsFilter, setPaymentTermsFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("suppliers")

  // Modal states
  const [supplierModal, setSupplierModal] = useState({
    isOpen: false,
    supplier: null as any,
    mode: "add" as "add" | "edit",
  })
  const [contractModal, setContractModal] = useState({
    isOpen: false,
    contract: null as any,
    mode: "add" as "add" | "edit",
  })
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null as any, type: "" })

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.representative.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || supplier.status === statusFilter
    const matchesBusinessType = businessTypeFilter === "all" || supplier.businessType === businessTypeFilter
    const matchesPaymentTerms = paymentTermsFilter === "all" || supplier.paymentTerms === paymentTermsFilter

    return matchesSearch && matchesStatus && matchesBusinessType && matchesPaymentTerms
  })

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setBusinessTypeFilter("all")
    setPaymentTermsFilter("all")
  }

  // Supplier columns
  const supplierColumns = [
    {
      key: "code" as const,
      label: "Mã NCC",
      sortable: true,
      render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
    },
    {
      key: "name" as const,
      label: "Tên Nhà cung cấp",
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <span className="font-medium">{value}</span>
          <p className="text-sm text-gray-500">{row.shortName}</p>
        </div>
      ),
    },
    {
      key: "representative" as const,
      label: "Người đại diện",
    },
    {
      key: "phone" as const,
      label: "Số điện thoại",
    },
    {
      key: "businessType" as const,
      label: "Loại hình KD",
      render: (value: string) => (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {value}
        </Badge>
      ),
    },
    {
      key: "contractCount" as const,
      label: "Số HĐ",
      render: (value: number) => (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {value} hợp đồng
        </Badge>
      ),
    },
    {
      key: "totalPurchases" as const,
      label: "Tổng mua hàng",
      render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
    },
    {
      key: "totalDebt" as const,
      label: "Công nợ",
      render: (value: number) => (
        <span className={`font-semibold ${value > 0 ? "text-red-600" : "text-green-600"}`}>
          {value.toLocaleString()} ₫
        </span>
      ),
    },
    {
      key: "rating" as const,
      label: "Đánh giá",
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <span className="text-yellow-500">★</span>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "status" as const,
      label: "Trạng thái",
      render: (value: string) => (
        <Badge
          variant={value === "active" ? "default" : "secondary"}
          className={value === "active" ? "bg-green-100 text-green-800" : ""}
        >
          {value === "active" ? "Hoạt động" : "Ngừng hợp tác"}
        </Badge>
      ),
    },
  ]

  // Contract columns
  const contractColumns = [
    {
      key: "contractNumber" as const,
      label: "Số hợp đồng",
      sortable: true,
      render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
    },
    {
      key: "supplierName" as const,
      label: "Nhà cung cấp",
      sortable: true,
    },
    {
      key: "title" as const,
      label: "Tiêu đề",
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "startDate" as const,
      label: "Ngày bắt đầu",
      render: (value: string) => <span>{new Date(value).toLocaleDateString("vi-VN")}</span>,
    },
    {
      key: "endDate" as const,
      label: "Ngày kết thúc",
      render: (value: string) => <span>{new Date(value).toLocaleDateString("vi-VN")}</span>,
    },
    {
      key: "value" as const,
      label: "Giá trị",
      render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
    },
    {
      key: "status" as const,
      label: "Trạng thái",
      render: (value: string) => {
        const statusConfig = {
          active: { label: "Đang hiệu lực", className: "bg-green-100 text-green-800" },
          expired: { label: "Hết hạn", className: "bg-red-100 text-red-800" },
          pending: { label: "Chờ ký", className: "bg-yellow-100 text-yellow-800" },
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

  // Transaction columns
  const transactionColumns = [
    {
      key: "transactionNumber" as const,
      label: "Mã giao dịch",
      sortable: true,
      render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
    },
    {
      key: "supplierName" as const,
      label: "Nhà cung cấp",
      sortable: true,
    },
    {
      key: "type" as const,
      label: "Loại GD",
      render: (value: string) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {value === "purchase" ? "Mua hàng" : "Trả hàng"}
        </Badge>
      ),
    },
    {
      key: "amount" as const,
      label: "Số tiền",
      render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
    },
    {
      key: "date" as const,
      label: "Ngày GD",
      render: (value: string) => <span>{new Date(value).toLocaleDateString("vi-VN")}</span>,
    },
    {
      key: "paymentStatus" as const,
      label: "TT Thanh toán",
      render: (value: string) => {
        const statusConfig = {
          paid: { label: "Đã thanh toán", className: "bg-green-100 text-green-800" },
          pending: { label: "Chờ thanh toán", className: "bg-yellow-100 text-yellow-800" },
          overdue: { label: "Quá hạn", className: "bg-red-100 text-red-800" },
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Nhà cung cấp</h1>
        <p className="text-gray-600">Quản lý hợp đồng, theo dõi giao dịch và gửi yêu cầu báo giá</p>
      </div>

      {/* Stats */}
      <SupplierStats stats={stats} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="suppliers">Nhà cung cấp</TabsTrigger>
          <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
          <TabsTrigger value="transactions">Lịch sử GD</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          {/* Filters */}
          <SupplierFilterControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            businessTypeFilter={businessTypeFilter}
            onBusinessTypeFilterChange={setBusinessTypeFilter}
            paymentTermsFilter={paymentTermsFilter}
            onPaymentTermsFilterChange={setPaymentTermsFilter}
            businessTypes={businessTypes}
            paymentTerms={paymentTerms}
            onReset={resetFilters}
          />

          {/* Suppliers Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <DataTable
              title="Danh sách Nhà cung cấp"
              data={filteredSuppliers}
              columns={supplierColumns}
              searchPlaceholder="Tìm kiếm nhà cung cấp..."
              onAdd={() => setSupplierModal({ isOpen: true, supplier: null, mode: "add" })}
              onEdit={(supplier) => setSupplierModal({ isOpen: true, supplier, mode: "edit" })}
              onDelete={(supplier) => setDeleteModal({ isOpen: true, item: supplier, type: "supplier" })}
              onExport={() => {
                toast({
                  variant: "success",
                  title: "Xuất dữ liệu",
                  description: "Đang xuất danh sách nhà cung cấp...",
                })
              }}
            />
          </motion.div>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <DataTable
              title="Danh sách Hợp đồng"
              data={contracts}
              columns={contractColumns}
              searchPlaceholder="Tìm kiếm hợp đồng..."
              onAdd={() => setContractModal({ isOpen: true, contract: null, mode: "add" })}
              onEdit={(contract) => setContractModal({ isOpen: true, contract, mode: "edit" })}
              onDelete={(contract) => setDeleteModal({ isOpen: true, item: contract, type: "contract" })}
              onExport={() => {
                toast({
                  variant: "success",
                  title: "Xuất dữ liệu",
                  description: "Đang xuất danh sách hợp đồng...",
                })
              }}
            />
          </motion.div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <DataTable
              title="Lịch sử Giao dịch"
              data={transactions}
              columns={transactionColumns}
              searchPlaceholder="Tìm kiếm giao dịch..."
              onAdd={() => {
                toast({
                  title: "Thông báo",
                  description: "Giao dịch sẽ được tạo tự động khi có đơn hàng mới",
                })
              }}
              onEdit={(transaction) => {
                // Handle payment status update
                const newStatus = transaction.paymentStatus === "pending" ? "paid" : "pending"
                updateTransaction(transaction.id, { paymentStatus: newStatus })
              }}
              onDelete={(transaction) => setDeleteModal({ isOpen: true, item: transaction, type: "transaction" })}
              onExport={() => {
                toast({
                  variant: "success",
                  title: "Xuất dữ liệu",
                  description: "Đang xuất lịch sử giao dịch...",
                })
              }}
            />
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SupplierFormModal
        isOpen={supplierModal.isOpen}
        onClose={() => setSupplierModal({ isOpen: false, supplier: null, mode: "add" })}
        onSubmit={(data) => {
          if (supplierModal.mode === "add") {
            addSupplier(data)
          } else {
            updateSupplier(supplierModal.supplier.id, data)
          }
        }}
        supplier={supplierModal.supplier}
        mode={supplierModal.mode}
      />

      <ContractFormModal
        isOpen={contractModal.isOpen}
        onClose={() => setContractModal({ isOpen: false, contract: null, mode: "add" })}
        onSubmit={(data) => {
          if (contractModal.mode === "add") {
            addContract(data)
          } else {
            updateContract(contractModal.contract.id, data)
          }
        }}
        contract={contractModal.contract}
        suppliers={suppliers}
        mode={contractModal.mode}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null, type: "" })}
        onConfirm={() => {
          if (deleteModal.type === "supplier") {
            deleteSupplier(deleteModal.item.id)
          } else if (deleteModal.type === "contract") {
            deleteContract(deleteModal.item.id)
          } else if (deleteModal.type === "transaction") {
            deleteTransaction(deleteModal.item.id)
          }
          setDeleteModal({ isOpen: false, item: null, type: "" })
        }}
        title={`Xóa ${deleteModal.type === "supplier" ? "nhà cung cấp" : deleteModal.type === "contract" ? "hợp đồng" : "giao dịch"}`}
        description={`Bạn có chắc chắn muốn xóa ${deleteModal.item?.name || deleteModal.item?.contractNumber || deleteModal.item?.transactionNumber}?`}
      />
    </div>
  )
}
