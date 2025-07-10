"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

interface SaleItem {
  productId: number
  productCode: string
  productName: string
  price: number
  quantity: number
  discount: number
  total: number
  unit: string
}

interface Sale {
  id: number
  saleNumber: string
  customerId?: number
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  saleType: "offline" | "online"
  items: SaleItem[]
  subtotal: number
  discount: number
  tax: number
  totalAmount: number
  paymentMethod: "cash" | "card" | "transfer" | "mixed"
  paymentStatus: "paid" | "pending" | "partial"
  status: "draft" | "completed" | "cancelled" | "refunded"
  cashReceived?: number
  changeAmount?: number
  notes?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  processedBy?: string
  completedAt?: string
  prescriptionRequired?: boolean
  prescriptionNumber?: string
  deliveryInfo?: {
    address: string
    phone: string
    deliveryFee: number
    deliveryTime?: string
    deliveryStatus: "pending" | "confirmed" | "shipping" | "delivered"
  }
}

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  loyaltyPoints: number
  totalPurchases: number
  membershipLevel: "bronze" | "silver" | "gold" | "platinum"
}

// Initial sales data
const initialSales: Sale[] = [
  {
    id: 1,
    saleNumber: "HD001",
    customerId: 1,
    customerName: "Phạm Thị Dung",
    customerPhone: "0987654321",
    saleType: "offline",
    items: [
      {
        productId: 1,
        productCode: "SP001",
        productName: "Paracetamol 500mg",
        price: 2500,
        quantity: 20,
        discount: 0,
        total: 50000,
        unit: "Viên",
      },
      {
        productId: 2,
        productCode: "SP002",
        productName: "Amoxicillin 250mg",
        price: 3500,
        quantity: 15,
        discount: 5,
        total: 49875,
        unit: "Viên",
      },
    ],
    subtotal: 99875,
    discount: 2500,
    tax: 0,
    totalAmount: 97375,
    paymentMethod: "cash",
    paymentStatus: "paid",
    status: "completed",
    cashReceived: 100000,
    changeAmount: 2625,
    notes: "Khách hàng thân thiết",
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:35:00",
    createdBy: "Nguyễn Văn An",
    processedBy: "Nguyễn Văn An",
    completedAt: "2024-01-15T10:35:00",
  },
  {
    id: 2,
    saleNumber: "HD002",
    customerId: 2,
    customerName: "Hoàng Văn Minh",
    customerPhone: "0976543210",
    customerAddress: "456 Lê Lợi, Quận 3, TP.HCM",
    saleType: "online",
    items: [
      {
        productId: 3,
        productCode: "SP003",
        productName: "Vitamin C 1000mg",
        price: 12000,
        quantity: 10,
        discount: 10,
        total: 108000,
        unit: "Viên",
      },
    ],
    subtotal: 108000,
    discount: 0,
    tax: 0,
    totalAmount: 108000,
    paymentMethod: "transfer",
    paymentStatus: "paid",
    status: "completed",
    notes: "Giao hàng tận nơi",
    createdAt: "2024-01-14T15:45:00",
    updatedAt: "2024-01-14T16:00:00",
    createdBy: "Trần Thị Bình",
    processedBy: "Trần Thị Bình",
    completedAt: "2024-01-14T16:00:00",
    deliveryInfo: {
      address: "456 Lê Lợi, Quận 3, TP.HCM",
      phone: "0976543210",
      deliveryFee: 25000,
      deliveryTime: "2024-01-15T09:00:00",
      deliveryStatus: "delivered",
    },
  },
  {
    id: 3,
    saleNumber: "HD003",
    customerId: 3,
    customerName: "Lê Thị Cẩm",
    customerPhone: "0965432109",
    saleType: "offline",
    items: [
      {
        productId: 1,
        productCode: "SP001",
        productName: "Paracetamol 500mg",
        price: 2500,
        quantity: 30,
        discount: 0,
        total: 75000,
        unit: "Viên",
      },
    ],
    subtotal: 75000,
    discount: 0,
    tax: 0,
    totalAmount: 75000,
    paymentMethod: "cash",
    paymentStatus: "pending",
    status: "draft",
    notes: "",
    createdAt: "2024-01-16T09:15:00",
    updatedAt: "2024-01-16T09:15:00",
    createdBy: "Lê Văn Cường",
  },
]

// Initial customers data
const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Phạm Thị Dung",
    phone: "0987654321",
    email: "dung.pham@email.com",
    address: "123 Nguyễn Trãi, Quận 1, TP.HCM",
    loyaltyPoints: 250,
    totalPurchases: 2500000,
    membershipLevel: "gold",
  },
  {
    id: 2,
    name: "Hoàng Văn Minh",
    phone: "0976543210",
    email: "minh.hoang@email.com",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    loyaltyPoints: 180,
    totalPurchases: 1800000,
    membershipLevel: "silver",
  },
  {
    id: 3,
    name: "Lê Thị Cẩm",
    phone: "0965432109",
    email: "cam.le@email.com",
    address: "789 Hai Bà Trưng, Quận 1, TP.HCM",
    loyaltyPoints: 95,
    totalPurchases: 950000,
    membershipLevel: "bronze",
  },
]

export function useSales() {
  const [sales, setSales] = useLocalStorage<Sale[]>("pharmacy-sales", initialSales)
  const [customers, setCustomers] = useLocalStorage<Customer[]>("pharmacy-customers", initialCustomers)
  const [loading, setLoading] = useState(false)

  // Listen for real-time updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pharmacy-sales" && e.newValue) {
        try {
          const updatedSales = JSON.parse(e.newValue)
          setSales(updatedSales)
        } catch (error) {
          console.error("Error parsing updated sales:", error)
        }
      }
      if (e.key === "pharmacy-customers" && e.newValue) {
        try {
          const updatedCustomers = JSON.parse(e.newValue)
          setCustomers(updatedCustomers)
        } catch (error) {
          console.error("Error parsing updated customers:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [setSales, setCustomers])

  const generateSaleNumber = () => {
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "")
    const timeStr = today.getHours().toString().padStart(2, "0") + today.getMinutes().toString().padStart(2, "0")
    const randomStr = Math.random().toString(36).substr(2, 3).toUpperCase()
    return `HD${dateStr}${timeStr}${randomStr}`
  }

  const createSale = useCallback(
    async (saleData: Omit<Sale, "id" | "saleNumber" | "createdAt" | "updatedAt">) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800))

        const now = new Date().toISOString()
        const newSale: Sale = {
          ...saleData,
          id: Math.max(...sales.map((s) => s.id), 0) + 1,
          saleNumber: generateSaleNumber(),
          createdAt: now,
          updatedAt: now,
          completedAt: saleData.status === "completed" ? now : undefined,
        }

        const updatedSales = [...sales, newSale]
        setSales(updatedSales)

        // Update customer loyalty points if customer exists
        if (saleData.customerId && saleData.status === "completed") {
          const updatedCustomers = customers.map((customer) =>
            customer.id === saleData.customerId
              ? {
                  ...customer,
                  loyaltyPoints: customer.loyaltyPoints + Math.floor(saleData.totalAmount / 1000),
                  totalPurchases: customer.totalPurchases + saleData.totalAmount,
                }
              : customer,
          )
          setCustomers(updatedCustomers)
        }

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-sales",
            newValue: JSON.stringify(updatedSales),
          }),
        )

        return { success: true, data: newSale }
      } catch (error) {
        return { success: false, error: "Không thể tạo đơn hàng" }
      } finally {
        setLoading(false)
      }
    },
    [sales, customers, setSales, setCustomers],
  )

  const updateSale = useCallback(
    async (id: number, saleData: Partial<Sale>) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 600))

        const updatedSales = sales.map((sale) =>
          sale.id === id
            ? {
                ...sale,
                ...saleData,
                updatedAt: new Date().toISOString(),
                completedAt:
                  saleData.status === "completed" && sale.status !== "completed"
                    ? new Date().toISOString()
                    : sale.completedAt,
              }
            : sale,
        )

        setSales(updatedSales)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-sales",
            newValue: JSON.stringify(updatedSales),
          }),
        )

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật đơn hàng" }
      } finally {
        setLoading(false)
      }
    },
    [sales, setSales],
  )

  const deleteSale = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const updatedSales = sales.filter((sale) => sale.id !== id)
        setSales(updatedSales)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-sales",
            newValue: JSON.stringify(updatedSales),
          }),
        )

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể xóa đơn hàng" }
      } finally {
        setLoading(false)
      }
    },
    [sales, setSales],
  )

  const addCustomer = useCallback(
    async (customerData: Omit<Customer, "id" | "loyaltyPoints" | "totalPurchases" | "membershipLevel">) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 400))

        const newCustomer: Customer = {
          ...customerData,
          id: Math.max(...customers.map((c) => c.id), 0) + 1,
          loyaltyPoints: 0,
          totalPurchases: 0,
          membershipLevel: "bronze",
        }

        const updatedCustomers = [...customers, newCustomer]
        setCustomers(updatedCustomers)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-customers",
            newValue: JSON.stringify(updatedCustomers),
          }),
        )

        return { success: true, data: newCustomer }
      } catch (error) {
        return { success: false, error: "Không thể thêm khách hàng" }
      } finally {
        setLoading(false)
      }
    },
    [customers, setCustomers],
  )

  const exportSales = useCallback(
    (startDate?: string, endDate?: string) => {
      let filteredSales = sales
      if (startDate && endDate) {
        filteredSales = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt).toISOString().split("T")[0]
          return saleDate >= startDate && saleDate <= endDate
        })
      }

      const dataToExport = filteredSales.map((sale) => ({
        "Số hóa đơn": sale.saleNumber,
        "Khách hàng": sale.customerName || "Khách lẻ",
        "Số điện thoại": sale.customerPhone || "",
        "Loại bán": sale.saleType === "online" ? "Online" : "Tại quầy",
        "Tổng tiền": sale.totalAmount,
        "Phương thức TT":
          sale.paymentMethod === "cash" ? "Tiền mặt" : sale.paymentMethod === "card" ? "Thẻ" : "Chuyển khoản",
        "Trạng thái TT": sale.paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán",
        "Trạng thái": sale.status === "completed" ? "Hoàn thành" : sale.status === "draft" ? "Nháp" : "Đã hủy",
        "Ngày tạo": new Date(sale.createdAt).toLocaleString("vi-VN"),
        "Người tạo": sale.createdBy,
        "Ghi chú": sale.notes || "",
      }))

      const csv = [
        Object.keys(dataToExport[0]).join(","),
        ...dataToExport.map((row) => Object.values(row).join(",")),
      ].join("\n")

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `ban-hang-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [sales],
  )

  return {
    sales,
    customers,
    loading,
    createSale,
    updateSale,
    deleteSale,
    addCustomer,
    exportSales,
  }
}
