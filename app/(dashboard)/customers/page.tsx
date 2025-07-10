"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCustomers, type Customer } from "@/hooks/use-customers"
import { CustomerStats } from "@/components/ui/customer-stats"
import { CustomerFilterControls } from "@/components/ui/customer-filter-controls"
import { CustomerFormModal } from "@/components/ui/customer-form-modal"
import { LoyaltyPointsModal } from "@/components/ui/loyalty-points-modal"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import DataTable from "@/components/ui/data-table"
import { Award, Phone, Mail, MapPin } from "lucide-react"

interface FilterState {
  search: string
  status: string
  membershipLevel: string
  gender: string
  minPurchase: string
  maxPurchase: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
}

export default function CustomersPage() {
  const {
    customers,
    stats,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateLoyaltyPoints,
    exportCustomers,
  } = useCustomers()

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    membershipLevel: "",
    gender: "",
    minPurchase: "",
    maxPurchase: "",
    dateFrom: undefined,
    dateTo: undefined,
  })

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Filter customers based on current filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.phone.includes(searchLower) ||
          customer.code.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status && customer.status !== filters.status) return false

      // Membership level filter
      if (filters.membershipLevel && customer.membershipLevel !== filters.membershipLevel) return false

      // Gender filter
      if (filters.gender && customer.gender !== filters.gender) return false

      // Purchase amount filter
      if (filters.minPurchase && customer.totalPurchases < Number.parseInt(filters.minPurchase)) return false
      if (filters.maxPurchase && customer.totalPurchases > Number.parseInt(filters.maxPurchase)) return false

      // Date filter (last purchase)
      if (filters.dateFrom || filters.dateTo) {
        const lastPurchaseDate = new Date(customer.lastPurchase)
        if (filters.dateFrom && lastPurchaseDate < filters.dateFrom) return false
        if (filters.dateTo && lastPurchaseDate > filters.dateTo) return false
      }

      return true
    })
  }, [customers, filters])

  const membershipColors = {
    bronze: "bg-amber-100 text-amber-800 border-amber-200",
    silver: "bg-gray-100 text-gray-800 border-gray-200",
    gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
    platinum: "bg-purple-100 text-purple-800 border-purple-200",
  }

  const membershipLabels = {
    bronze: "Đồng",
    silver: "Bạc",
    gold: "Vàng",
    platinum: "Bạch Kim",
  }

  const customerColumns = [
    {
      key: "code" as const,
      label: "Mã KH",
      sortable: true,
      render: (value: string) => <span className="font-mono text-blue-600 font-semibold">{value}</span>,
    },
    {
      key: "name" as const,
      label: "Thông tin khách hàng",
      sortable: true,
      render: (value: string, customer: Customer) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Phone className="w-3 h-3" />
            <span>{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Mail className="w-3 h-3" />
              <span>{customer.email}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "address" as const,
      label: "Địa chỉ",
      render: (value: string) => (
        <div className="flex items-start space-x-2 max-w-xs">
          <MapPin className="w-3 h-3 mt-1 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600 truncate" title={value}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "totalPurchases" as const,
      label: "Tổng mua hàng",
      sortable: true,
      render: (value: number) => <span className="font-semibold text-green-600">{value.toLocaleString()} ₫</span>,
    },
    {
      key: "loyaltyPoints" as const,
      label: "Điểm tích lũy",
      sortable: true,
      render: (value: number, customer: Customer) => (
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            {value} điểm
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCustomer(customer)
              setShowLoyaltyModal(true)
            }}
          >
            <Award className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
    {
      key: "membershipLevel" as const,
      label: "Hạng thành viên",
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline" className={membershipColors[value as keyof typeof membershipColors]}>
          {membershipLabels[value as keyof typeof membershipLabels]}
        </Badge>
      ),
    },
    {
      key: "status" as const,
      label: "Trạng thái",
      sortable: true,
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

  const handleAdd = () => {
    setSelectedCustomer(null)
    setShowFormModal(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowFormModal(true)
  }

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  const handleFormSubmit = async (data: any) => {
    if (selectedCustomer) {
      await updateCustomer(selectedCustomer.id, data)
    } else {
      await addCustomer(data)
    }
  }

  const handleDeleteConfirm = async () => {
    if (selectedCustomer) {
      await deleteCustomer(selectedCustomer.id)
    }
  }

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "",
      membershipLevel: "",
      gender: "",
      minPurchase: "",
      maxPurchase: "",
      dateFrom: undefined,
      dateTo: undefined,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Statistics */}
      <CustomerStats stats={stats} />

      {/* Filters */}
      <CustomerFilterControls onFilterChange={setFilters} onReset={resetFilters} />

      {/* Data Table */}
      <DataTable
        title={`Quản lý Khách hàng (${filteredCustomers.length})`}
        data={filteredCustomers}
        columns={customerColumns}
        searchPlaceholder="Tìm kiếm khách hàng..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={exportCustomers}
        customActions={(customer: Customer) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedCustomer(customer)
              setShowLoyaltyModal(true)
            }}
            title="Điều chỉnh điểm tích lũy"
          >
            <Award className="w-4 h-4 text-purple-600" />
          </Button>
        )}
      />

      {/* Modals */}
      <CustomerFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        customer={selectedCustomer}
        loading={loading}
      />

      <LoyaltyPointsModal
        isOpen={showLoyaltyModal}
        onClose={() => setShowLoyaltyModal(false)}
        onSubmit={updateLoyaltyPoints}
        customer={selectedCustomer}
        loading={loading}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa khách hàng"
        description={`Bạn có chắc chắn muốn xóa khách hàng "${selectedCustomer?.name}"? Hành động này không thể hoàn tác.`}
        loading={loading}
      />
    </motion.div>
  )
}
