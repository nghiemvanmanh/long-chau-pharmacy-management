"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import DataTable from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Users, Key, Clock } from "lucide-react"
import { StatsCard } from "@/components/ui/stats-card"
import { PageHeader } from "@/components/ui/page-header"
import { AccountFormModal } from "@/components/ui/account-form-modal"
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal"
import { useAccounts } from "@/hooks/use-accounts"
import { AccountFilterControls } from "@/components/ui/account-filter-controls"
import { ROLE_PERMISSIONS, PERMISSION_LABELS, PERMISSIONS } from "@/lib/constants"
import { useAuth } from "@/contexts/auth-context"

function AccountStats({ accounts }: { accounts: any[] }) {
  const stats = [
    {
      title: "Tổng tài khoản",
      value: accounts.length.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Tài khoản hoạt động",
      value: accounts.filter((acc) => acc.status === "active").length.toString(),
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Quản trị viên",
      value: accounts.filter((acc) => acc.role === "admin").length.toString(),
      icon: Key,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Đăng nhập hôm nay",
      value: accounts
        .filter((acc) => {
          if (!acc.lastLogin) return false
          const today = new Date().toDateString()
          const loginDate = new Date(acc.lastLogin).toDateString()
          return today === loginDate
        })
        .length.toString(),
      icon: Clock,
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

export default function AccountsPage() {
  const { accounts, loading, addAccount, updateAccount, deleteAccount, exportAccounts } = useAccounts()
  const { hasPermission } = useAuth()
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [refreshKey, setRefreshKey] = useState(0)

  // Force refresh when accounts change (for real-time updates)
  useEffect(() => {
    setRefreshKey((prev) => prev + 1)
  }, [accounts])

  const filteredAccounts = accounts.filter((account) => {
    const matchesRole = roleFilter === "all" || account.role === roleFilter
    const matchesStatus = statusFilter === "all" || account.status === statusFilter

    return matchesRole && matchesStatus
  })

  const handleAdd = () => {
    if (!hasPermission(PERMISSIONS.ACCOUNT_CREATE)) {
      toast.error("Bạn không có quyền tạo tài khoản mới")
      return
    }
    setSelectedAccount(null)
    setFormMode("create")
    setIsFormModalOpen(true)
  }

  const handleEdit = (account: any) => {
    if (!hasPermission(PERMISSIONS.ACCOUNT_UPDATE)) {
      toast.error("Bạn không có quyền chỉnh sửa tài khoản")
      return
    }
    setSelectedAccount(account)
    setFormMode("edit")
    setIsFormModalOpen(true)
  }

  const handleDelete = (account: any) => {
    if (!hasPermission(PERMISSIONS.ACCOUNT_DELETE)) {
      toast.error("Bạn không có quyền xóa tài khoản")
      return
    }
    setSelectedAccount(account)
    setIsDeleteModal(true)
  }

  const handleFormSubmit = async (accountData: any) => {
    try {
      if (formMode === "create") {
        const result = await addAccount(accountData)
        if (result.success) {
          toast.success("Thêm tài khoản thành công!")
        } else {
          toast.error(result.error || "Có lỗi xảy ra")
        }
      } else {
        const result = await updateAccount(selectedAccount.id, accountData)
        if (result.success) {
          toast.success("Cập nhật tài khoản thành công!")
        } else {
          toast.error(result.error || "Có lỗi xảy ra")
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại")
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteAccount(selectedAccount.id)
      if (result.success) {
        toast.success("Xóa tài khoản thành công!")
        setIsDeleteModal(false)
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
    exportAccounts()
    toast.success("Xuất dữ liệu thành công!")
  }

  const handleResetAllFilters = () => {
    setRoleFilter("all")
    setStatusFilter("all")
  }

  const getTimeAgo = (dateString: string) => {
    if (!dateString) return "Chưa đăng nhập"

    const now = new Date()
    const loginTime = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - loginTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Vừa xong"
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} giờ trước`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ngày trước`

    return loginTime.toLocaleDateString("vi-VN")
  }

  const accountColumns = [
    {
      key: "username" as const,
      label: "Tên đăng nhập",
      sortable: true,
      render: (value: string, row: any) => (
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={
                row.avatar ||
                "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI2NjY2NjYyIvPjwvc3ZnPg==" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
            />
            <AvatarFallback className="bg-blue-600 text-white text-xs">
              {row.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-mono text-blue-600 font-semibold">{value}</span>
            <p className="text-sm text-gray-600">{row.fullName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email" as const,
      label: "Email",
    },
    {
      key: "phone" as const,
      label: "Số điện thoại",
      render: (value: string) => value || "—",
    },
    {
      key: "role" as const,
      label: "Vai trò",
      render: (value: string) => {
        const roleInfo = ROLE_PERMISSIONS[value as keyof typeof ROLE_PERMISSIONS] ?? {
          name: value,
          color: "",
        }

        return (
          <Badge variant="secondary" className={roleInfo.color}>
            {roleInfo.name}
          </Badge>
        )
      },
    },
    {
      key: "permissions" as const,
      label: "Quyền hạn",
      render: (value: string[]) => {
        return (
          <div className="space-y-1">
            {value?.slice(0, 2).map((permission, index) => (
              <Badge key={index} variant="outline" className="text-xs mr-1">
                {PERMISSION_LABELS[permission] || permission}
              </Badge>
            ))}
            {value?.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{value?.length - 2} khác
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: "lastLogin" as const,
      label: "Đăng nhập cuối",
      render: (value: string) => {
        const timeAgo = getTimeAgo(value)
        const isRecent = value && new Date().getTime() - new Date(value).getTime() < 5 * 60 * 1000 // 5 minutes

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
          {value === "active" ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
  ]

  return (
    <div className="p-6" key={refreshKey}>
      <PageHeader title="Quản lý Tài khoản" description="Quản lý người dùng và phân quyền hệ thống" />

      <AccountStats accounts={accounts} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <DataTable
          title="Danh sách Tài khoản"
          data={filteredAccounts}
          columns={accountColumns}
          searchPlaceholder="Tìm kiếm tài khoản..."
          onAdd={hasPermission(PERMISSIONS.ACCOUNT_CREATE) ? handleAdd : undefined}
          onEdit={hasPermission(PERMISSIONS.ACCOUNT_UPDATE) ? handleEdit : undefined}
          onDelete={hasPermission(PERMISSIONS.ACCOUNT_DELETE) ? handleDelete : undefined}
          onExport={hasPermission(PERMISSIONS.REPORTS_EXPORT) ? handleExport : undefined}
          loading={loading}
          filterControls={
            <AccountFilterControls
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
            />
          }
          onResetFilters={handleResetAllFilters}
        />
      </motion.div>

      <AccountFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        account={selectedAccount}
        mode={formMode}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Xóa tài khoản"
        description="Bạn có chắc chắn muốn xóa tài khoản này?"
        itemName={selectedAccount?.fullName}
      />
    </div>
  )
}
