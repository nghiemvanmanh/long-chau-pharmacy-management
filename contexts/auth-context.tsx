"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ROLE_PERMISSIONS } from "@/lib/constants"

interface User {
  id: number
  username: string
  fullName: string
  email: string
  role: string
  permissions: string[]
  status: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  updateLastLogin: (userId: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initial default accounts - sẽ được merge với accounts từ localStorage
const defaultAccounts = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    fullName: "Quản trị viên",
    email: "admin@longchau.com",
    role: "admin",
    permissions: ROLE_PERMISSIONS.admin.permissions,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2023-01-01",
    updatedAt: "2024-01-15",
    lastLogin: "2024-01-15 10:30:00",
  },
  {
    id: 2,
    username: "manager01",
    password: "manager123",
    fullName: "Nguyễn Văn An",
    email: "an.nguyen@longchau.com",
    role: "manager",
    permissions: ROLE_PERMISSIONS.manager.permissions,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2023-02-15",
    updatedAt: "2024-01-15",
    lastLogin: "2024-01-15 09:15:00",
  },
  {
    id: 3,
    username: "pharmacist01",
    password: "pharmacist123",
    fullName: "Trần Thị Bình",
    email: "binh.tran@longchau.com",
    role: "pharmacist",
    permissions: ROLE_PERMISSIONS.pharmacist.permissions,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2023-03-10",
    updatedAt: "2024-01-14",
    lastLogin: "2024-01-14 16:45:00",
  },
  {
    id: 4,
    username: "staff01",
    password: "staff123",
    fullName: "Lê Văn Cường",
    email: "cuong.le@longchau.com",
    role: "staff",
    permissions: ROLE_PERMISSIONS.staff.permissions,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2023-04-20",
    updatedAt: "2024-01-10",
    lastLogin: "2024-01-10 14:20:00",
  },
  {
    id: 5,
    username: "cashier01",
    password: "cashier123",
    fullName: "Phạm Thị Mai",
    email: "mai.pham@longchau.com",
    role: "cashier",
    permissions: ROLE_PERMISSIONS.cashier.permissions,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    createdAt: "2023-05-15",
    updatedAt: "2024-01-12",
    lastLogin: "2024-01-12 11:30:00",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to get all accounts (default + created accounts)
  const getAllAccounts = () => {
    try {
      const storedAccounts = localStorage.getItem("pharmacy-accounts")
      const createdAccounts = storedAccounts ? JSON.parse(storedAccounts) : []

      // Merge default accounts with created accounts
      // Ensure default accounts always exist and are up to date
      const allAccounts = [...defaultAccounts]

      // Add created accounts that don't conflict with default usernames
      createdAccounts.forEach((account: any) => {
        const existsInDefault = defaultAccounts.some((defaultAcc) => defaultAcc.username === account.username)
        if (!existsInDefault) {
          allAccounts.push({
            ...account,
            password: account.password || "123456", // Default password if not set
          })
        }
      })

      return allAccounts
    } catch (error) {
      console.error("Error loading accounts:", error)
      return defaultAccounts
    }
  }

  // Function to update account data in localStorage
  const updateAccountInStorage = (accountId: number, updates: any) => {
    try {
      const storedAccounts = localStorage.getItem("pharmacy-accounts")
      const accounts = storedAccounts ? JSON.parse(storedAccounts) : []

      const accountIndex = accounts.findIndex((acc: any) => acc.id === accountId)
      if (accountIndex >= 0) {
        accounts[accountIndex] = { ...accounts[accountIndex], ...updates }
        localStorage.setItem("pharmacy-accounts", JSON.stringify(accounts))
      } else {
        // If account doesn't exist in storage, add it (for default accounts)
        const allAccounts = getAllAccounts()
        const account = allAccounts.find((acc) => acc.id === accountId)
        if (account) {
          const updatedAccount = { ...account, ...updates }
          accounts.push(updatedAccount)
          localStorage.setItem("pharmacy-accounts", JSON.stringify(accounts))
        }
      }

      // Trigger storage event for real-time updates
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "pharmacy-accounts",
          newValue: localStorage.getItem("pharmacy-accounts"),
        }),
      )
    } catch (error) {
      console.error("Error updating account in storage:", error)
    }
  }

  // Function to update last login time
  const updateLastLogin = (userId: number) => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    updateAccountInStorage(userId, {
      lastLogin: now,
      updatedAt: new Date().toISOString(),
    })
  }

  // Listen for storage changes for real-time updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pharmacy-accounts" && user) {
        // Refresh current user data if accounts were updated
        const allAccounts = getAllAccounts()
        const updatedUser = allAccounts.find((acc) => acc.id === user.id)
        if (updatedUser && updatedUser.status === "active") {
          const { password: _, ...userWithoutPassword } = updatedUser
          setUser(userWithoutPassword)
          localStorage.setItem("pharmacy-user", JSON.stringify(userWithoutPassword))
        } else if (updatedUser && updatedUser.status === "inactive") {
          // User was deactivated, logout
          logout()
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [user])

  useEffect(() => {
    // Kiểm tra localStorage khi component mount
    const savedUser = localStorage.getItem("pharmacy-user")
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Verify user still exists and is active
        const allAccounts = getAllAccounts()
        const currentAccount = allAccounts.find(
          (acc) => acc.username === parsedUser.username && acc.status === "active",
        )

        if (currentAccount) {
          // Update user with latest permissions in case role changed
          const { password: _, ...userWithoutPassword } = currentAccount
          setUser(userWithoutPassword)
        } else {
          // User no longer exists or is inactive
          localStorage.removeItem("pharmacy-user")
        }
      } catch (error) {
        localStorage.removeItem("pharmacy-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const allAccounts = getAllAccounts()
    const foundUser = allAccounts.find(
      (u) => u.username === username && u.password === password && u.status === "active",
    )

    if (foundUser) {
      // Update last login time immediately
      const now = new Date().toISOString().replace("T", " ").substring(0, 19)
      updateAccountInStorage(foundUser.id, {
        lastLogin: now,
        updatedAt: new Date().toISOString(),
      })

      // Update user object with new login time
      const updatedUser = { ...foundUser, lastLogin: now }
      const { password: _, ...userWithoutPassword } = updatedUser

      setUser(userWithoutPassword)
      localStorage.setItem("pharmacy-user", JSON.stringify(userWithoutPassword))
      setIsLoading(false)
      return { success: true }
    } else {
      setIsLoading(false)
      return { success: false, error: "Tên đăng nhập hoặc mật khẩu không đúng" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pharmacy-user")
    router.push("/login")
  }

  const hasPermission = (permission: string) => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]) => {
    if (!user) return false
    return permissions.some((permission) => user.permissions.includes(permission))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission, hasAnyPermission, updateLastLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
