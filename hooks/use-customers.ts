"use client"

import { useState, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"

export interface Customer {
  id: number
  code: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  totalPurchases: number
  lastPurchase: string
  loyaltyPoints: number
  status: "active" | "inactive"
  membershipLevel: "bronze" | "silver" | "gold" | "platinum"
  notes?: string
  createdAt: string
  updatedAt: string
}

// Extended fake data for customers
const EXTENDED_FAKE_CUSTOMERS: Customer[] = [
  {
    id: 1,
    code: "KH001",
    name: "Phạm Thị Dung",
    email: "dung.pham@email.com",
    phone: "0987654321",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    dateOfBirth: "1985-05-15",
    gender: "female",
    totalPurchases: 2500000,
    lastPurchase: "2024-01-15",
    loyaltyPoints: 250,
    status: "active",
    membershipLevel: "gold",
    notes: "Khách hàng VIP, thường mua thuốc tim mạch",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    code: "KH002",
    name: "Hoàng Văn Minh",
    email: "minh.hoang@email.com",
    phone: "0976543210",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    dateOfBirth: "1990-08-22",
    gender: "male",
    totalPurchases: 1800000,
    lastPurchase: "2024-01-10",
    loyaltyPoints: 180,
    status: "active",
    membershipLevel: "silver",
    notes: "Khách hàng thân thiết",
    createdAt: "2023-02-20",
    updatedAt: "2024-01-10",
  },
  {
    id: 3,
    code: "KH003",
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@email.com",
    phone: "0965432109",
    address: "789 Võ Văn Tần, Quận 3, TP.HCM",
    dateOfBirth: "1978-12-03",
    gender: "female",
    totalPurchases: 3200000,
    lastPurchase: "2024-01-18",
    loyaltyPoints: 320,
    status: "active",
    membershipLevel: "platinum",
    notes: "Khách hàng cao cấp, mua nhiều thực phẩm chức năng",
    createdAt: "2022-11-10",
    updatedAt: "2024-01-18",
  },
  {
    id: 4,
    code: "KH004",
    name: "Trần Văn Hùng",
    email: "hung.tran@email.com",
    phone: "0954321098",
    address: "321 Điện Biên Phủ, Quận Bình Thạnh, TP.HCM",
    dateOfBirth: "1995-03-17",
    gender: "male",
    totalPurchases: 850000,
    lastPurchase: "2024-01-05",
    loyaltyPoints: 85,
    status: "active",
    membershipLevel: "bronze",
    createdAt: "2023-08-15",
    updatedAt: "2024-01-05",
  },
  {
    id: 5,
    code: "KH005",
    name: "Lê Thị Mai",
    email: "mai.le@email.com",
    phone: "0943210987",
    address: "654 Cách Mạng Tháng 8, Quận 10, TP.HCM",
    dateOfBirth: "1982-07-25",
    gender: "female",
    totalPurchases: 450000,
    lastPurchase: "2023-12-20",
    loyaltyPoints: 45,
    status: "inactive",
    membershipLevel: "bronze",
    notes: "Khách hàng ít hoạt động",
    createdAt: "2023-05-10",
    updatedAt: "2023-12-20",
  },
]

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(EXTENDED_FAKE_CUSTOMERS)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Customer statistics
  const stats = useMemo(() => {
    const activeCustomers = customers.filter((c) => c.status === "active")
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalPurchases, 0)
    const avgPurchase = totalRevenue / customers.length || 0
    const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)

    const membershipDistribution = customers.reduce(
      (acc, customer) => {
        acc[customer.membershipLevel] = (acc[customer.membershipLevel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const genderDistribution = customers.reduce(
      (acc, customer) => {
        acc[customer.gender] = (acc[customer.gender] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: customers.length,
      active: activeCustomers.length,
      inactive: customers.length - activeCustomers.length,
      totalRevenue,
      avgPurchase,
      totalLoyaltyPoints,
      membershipDistribution,
      genderDistribution,
    }
  }, [customers])

  const addCustomer = async (customerData: Omit<Customer, "id" | "code" | "createdAt" | "updatedAt">) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newCustomer: Customer = {
        ...customerData,
        id: Math.max(...customers.map((c) => c.id)) + 1,
        code: `KH${String(Math.max(...customers.map((c) => c.id)) + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }

      setCustomers((prev) => [...prev, newCustomer])
      toast({
        title: "Thành công",
        description: "Đã thêm khách hàng mới",
      })
      return newCustomer
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm khách hàng",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateCustomer = async (id: number, customerData: Partial<Customer>) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === id
            ? { ...customer, ...customerData, updatedAt: new Date().toISOString().split("T")[0] }
            : customer,
        ),
      )

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin khách hàng",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật khách hàng",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const deleteCustomer = async (id: number) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCustomers((prev) => prev.filter((customer) => customer.id !== id))
      toast({
        title: "Thành công",
        description: "Đã xóa khách hàng",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa khách hàng",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateLoyaltyPoints = async (id: number, points: number) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === id
            ? {
                ...customer,
                loyaltyPoints: Math.max(0, customer.loyaltyPoints + points),
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : customer,
        ),
      )

      toast({
        title: "Thành công",
        description: `Đã ${points > 0 ? "cộng" : "trừ"} ${Math.abs(points)} điểm tích lũy`,
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật điểm tích lũy",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const exportCustomers = () => {
    const csvContent = [
      [
        "Mã KH",
        "Họ tên",
        "Email",
        "Điện thoại",
        "Địa chỉ",
        "Tổng mua hàng",
        "Điểm tích lũy",
        "Hạng thành viên",
        "Trạng thái",
      ].join(","),
      ...customers.map((customer) =>
        [
          customer.code,
          customer.name,
          customer.email,
          customer.phone,
          `"${customer.address}"`,
          customer.totalPurchases,
          customer.loyaltyPoints,
          customer.membershipLevel,
          customer.status === "active" ? "Hoạt động" : "Không hoạt động",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `customers_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast({
      title: "Thành công",
      description: "Đã xuất danh sách khách hàng",
    })
  }

  return {
    customers,
    stats,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateLoyaltyPoints,
    exportCustomers,
  }
}
