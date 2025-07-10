"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"
import { ROLE_PERMISSIONS } from "@/lib/constants"

interface Account {
  id: number
  username: string
  fullName: string
  email: string
  role: string
  permissions: string[]
  status: string
  phone?: string
  address?: string
  notes?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
  avatar?: string
  password?: string // For login purposes
}

// Initial accounts - these will be merged with localStorage data
const initialAccounts: Account[] = [
  {
    id: 1,
    username: "admin",
    fullName: "Quản trị viên",
    email: "admin@longchau.com",
    role: "admin",
    permissions: ROLE_PERMISSIONS.admin.permissions,
    status: "active",
    phone: "0901234567",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    lastLogin: "2024-01-15 10:30:00",
    createdAt: "2023-01-01",
    updatedAt: "2024-01-15",
    avatar: "/placeholder.svg?height=40&width=40",
    password: "admin123",
  },
  {
    id: 2,
    username: "manager01",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@longchau.com",
    role: "manager",
    permissions: ROLE_PERMISSIONS.manager.permissions,
    status: "active",
    phone: "0912345678",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    lastLogin: "2024-01-15 09:15:00",
    createdAt: "2023-02-15",
    updatedAt: "2024-01-15",
    avatar: "/placeholder.svg?height=40&width=40",
    password: "manager123",
  },
  {
    id: 3,
    username: "pharmacist01",
    fullName: "Trần Thị Bình",
    email: "binh.tran@longchau.com",
    role: "pharmacist",
    permissions: ROLE_PERMISSIONS.pharmacist.permissions,
    status: "active",
    phone: "0923456789",
    address: "789 Hai Bà Trưng, Quận 1, TP.HCM",
    lastLogin: "2024-01-14 16:45:00",
    createdAt: "2023-03-10",
    updatedAt: "2024-01-14",
    avatar: "/placeholder.svg?height=40&width=40",
    password: "pharmacist123",
  },
  {
    id: 4,
    username: "staff01",
    fullName: "Lê Văn Cường",
    email: "cuong.le@longchau.com",
    role: "staff",
    permissions: ROLE_PERMISSIONS.staff.permissions,
    status: "active",
    phone: "0934567890",
    address: "321 Võ Văn Tần, Quận 3, TP.HCM",
    lastLogin: "2024-01-10 14:20:00",
    createdAt: "2023-04-20",
    updatedAt: "2024-01-10",
    avatar: "/placeholder.svg?height=40&width=40",
    password: "staff123",
  },
  {
    id: 5,
    username: "cashier01",
    fullName: "Phạm Thị Mai",
    email: "mai.pham@longchau.com",
    role: "cashier",
    permissions: ROLE_PERMISSIONS.cashier.permissions,
    status: "active",
    phone: "0945678901",
    address: "654 Nguyễn Huệ, Quận 1, TP.HCM",
    lastLogin: "2024-01-12 11:30:00",
    createdAt: "2023-05-15",
    updatedAt: "2024-01-12",
    avatar: "/placeholder.svg?height=40&width=40",
    password: "cashier123",
  },
]

export function useAccounts() {
  const [accounts, setAccounts] = useLocalStorage<Account[]>("pharmacy-accounts", initialAccounts)
  const [loading, setLoading] = useState(false)

  // Listen for real-time updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pharmacy-accounts" && e.newValue) {
        try {
          const updatedAccounts = JSON.parse(e.newValue)
          setAccounts(updatedAccounts)
        } catch (error) {
          console.error("Error parsing updated accounts:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [setAccounts])

  // Ensure initial accounts are always present and up to date
  const ensureInitialAccounts = useCallback(() => {
    const currentAccounts = [...accounts]
    let hasChanges = false

    initialAccounts.forEach((initialAccount) => {
      const existingIndex = currentAccounts.findIndex((acc) => acc.username === initialAccount.username)

      if (existingIndex >= 0) {
        // Update existing account with latest permissions and role info
        const existing = currentAccounts[existingIndex]
        if (
          existing.role !== initialAccount.role ||
          JSON.stringify(existing.permissions) !== JSON.stringify(initialAccount.permissions)
        ) {
          currentAccounts[existingIndex] = {
            ...existing,
            role: initialAccount.role,
            permissions: initialAccount.permissions,
            updatedAt: new Date().toISOString(),
          }
          hasChanges = true
        }
      } else {
        // Add missing initial account
        currentAccounts.push(initialAccount)
        hasChanges = true
      }
    })

    if (hasChanges) {
      setAccounts(currentAccounts)
    }
  }, [accounts, setAccounts])

  // Run on mount to ensure initial accounts exist
  useEffect(() => {
    ensureInitialAccounts()
  }, [])

  const addAccount = useCallback(
    async (accountData: Omit<Account, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Check if username already exists
        const existingAccount = accounts.find((acc) => acc.username === accountData.username)
        if (existingAccount) {
          return { success: false, error: "Tên đăng nhập đã tồn tại" }
        }

        const now = new Date().toISOString()
        const newAccount: Account = {
          ...accountData,
          id: Math.max(...accounts.map((a) => a.id), 0) + 1,
          createdAt: now,
          updatedAt: now,
          password: accountData.password || "123456", // Default password
          lastLogin: undefined, // Will be set on first login
        }

        const updatedAccounts = [...accounts, newAccount]
        setAccounts(updatedAccounts)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-accounts",
            newValue: JSON.stringify(updatedAccounts),
          }),
        )

        return { success: true, data: newAccount }
      } catch (error) {
        return { success: false, error: "Không thể thêm tài khoản" }
      } finally {
        setLoading(false)
      }
    },
    [accounts, setAccounts],
  )

  const updateAccount = useCallback(
    async (id: number, accountData: Partial<Account>) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const updatedAccounts = accounts.map((account) =>
          account.id === id
            ? {
                ...account,
                ...accountData,
                updatedAt: new Date().toISOString(),
                // If password is provided, update it; otherwise keep existing
                password: accountData.password || account.password,
              }
            : account,
        )

        setAccounts(updatedAccounts)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-accounts",
            newValue: JSON.stringify(updatedAccounts),
          }),
        )

        // Update current user session if they updated their own account
        const currentUser = JSON.parse(localStorage.getItem("pharmacy-user") || "null")
        if (currentUser && currentUser.id === id) {
          const updatedAccount = updatedAccounts.find((acc) => acc.id === id)
          if (updatedAccount) {
            const { password: _, ...userWithoutPassword } = updatedAccount
            localStorage.setItem("pharmacy-user", JSON.stringify(userWithoutPassword))
          }
        }

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật tài khoản" }
      } finally {
        setLoading(false)
      }
    },
    [accounts, setAccounts],
  )

  const deleteAccount = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Prevent deleting initial system accounts
        const accountToDelete = accounts.find((acc) => acc.id === id)
        if (accountToDelete && initialAccounts.some((initial) => initial.username === accountToDelete.username)) {
          return { success: false, error: "Không thể xóa tài khoản hệ thống" }
        }

        const updatedAccounts = accounts.filter((account) => account.id !== id)
        setAccounts(updatedAccounts)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-accounts",
            newValue: JSON.stringify(updatedAccounts),
          }),
        )

        // If current user deleted their own account, logout
        const currentUser = JSON.parse(localStorage.getItem("pharmacy-user") || "null")
        if (currentUser && currentUser.id === id) {
          localStorage.removeItem("pharmacy-user")
          window.location.href = "/login"
        }

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể xóa tài khoản" }
      } finally {
        setLoading(false)
      }
    },
    [accounts, setAccounts],
  )

  const exportAccounts = useCallback(() => {
    const dataToExport = accounts.map((account) => ({
      "Tên đăng nhập": account.username,
      "Họ và tên": account.fullName,
      Email: account.email,
      "Vai trò": account.role,
      "Số điện thoại": account.phone || "",
      "Địa chỉ": account.address || "",
      "Trạng thái": account.status === "active" ? "Hoạt động" : "Không hoạt động",
      "Ngày tạo": new Date(account.createdAt).toLocaleDateString("vi-VN"),
      "Đăng nhập cuối": account.lastLogin ? new Date(account.lastLogin).toLocaleString("vi-VN") : "Chưa đăng nhập",
    }))

    const csv = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tai-khoan-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [accounts])

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    exportAccounts,
  }
}
