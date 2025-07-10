"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

interface Supplier {
  id: number
  code: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  businessType: string
  paymentTerms: string
  taxCode: string
  bankAccount?: string
  bankName?: string
  website?: string
  notes?: string
  status: "active" | "inactive" | "suspended"
  contractCount: number
  totalPurchases: number
  totalDebt: number
  lastOrderDate?: string
  createdAt: string
  updatedAt: string
  rating: number
  categories: string[]
}

interface Contract {
  id: number
  supplierId: number
  contractNumber: string
  title: string
  startDate: string
  endDate: string
  value: number
  status: "active" | "expired" | "terminated" | "pending"
  paymentTerms: string
  deliveryTerms: string
  products: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  renewalDate?: string
  discountRate: number
}

interface Transaction {
  id: number
  supplierId: number
  contractId?: number
  transactionNumber: string
  type: "purchase" | "payment" | "refund" | "adjustment"
  amount: number
  description: string
  paymentMethod: "cash" | "transfer" | "check" | "credit"
  paymentStatus: "paid" | "pending" | "overdue" | "cancelled"
  dueDate?: string
  paidDate?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  approvedBy?: string
  invoiceNumber?: string
  receiptNumber?: string
}

// Initial suppliers data
const initialSuppliers: Supplier[] = [
  {
    id: 1,
    code: "NCC001",
    name: "Công ty Dược Hà Tây",
    contactPerson: "Nguyễn Văn Minh",
    phone: "024-3856-7890",
    email: "info@duochatay.com",
    address: "123 Đường Láng, Đống Đa, Hà Nội",
    businessType: "Nhà sản xuất",
    paymentTerms: "30 ngày",
    taxCode: "0123456789",
    bankAccount: "1234567890",
    bankName: "Vietcombank",
    website: "https://duochatay.com",
    status: "active",
    contractCount: 2,
    totalPurchases: 125000000,
    totalDebt: 15000000,
    lastOrderDate: "2024-01-15",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-15",
    rating: 4.5,
    categories: ["Thuốc kê đơn", "Thuốc không kê đơn"],
    notes: "Nhà cung cấp uy tín, chất lượng tốt",
  },
  {
    id: 2,
    code: "NCC002",
    name: "Công ty Dược Sài Gòn",
    contactPerson: "Trần Thị Lan",
    phone: "028-3925-6789",
    email: "contact@duocsaigon.com",
    address: "456 Nguyễn Trãi, Quận 5, TP.HCM",
    businessType: "Nhà phân phối",
    paymentTerms: "15 ngày",
    taxCode: "0987654321",
    bankAccount: "0987654321",
    bankName: "Techcombank",
    status: "active",
    contractCount: 1,
    totalPurchases: 89000000,
    totalDebt: 8500000,
    lastOrderDate: "2024-01-12",
    createdAt: "2023-02-20",
    updatedAt: "2024-01-12",
    rating: 4.2,
    categories: ["Kháng sinh", "Vitamin"],
    notes: "Giao hàng nhanh, giá cạnh tranh",
  },
  {
    id: 3,
    code: "NCC003",
    name: "Công ty Dược Miền Trung",
    contactPerson: "Lê Văn Hùng",
    phone: "0236-3567-890",
    email: "sales@duocmientrung.com",
    address: "789 Lê Duẩn, Hải Châu, Đà Nẵng",
    businessType: "Nhà sản xuất",
    paymentTerms: "45 ngày",
    taxCode: "0456789123",
    status: "inactive",
    contractCount: 0,
    totalPurchases: 45000000,
    totalDebt: 0,
    lastOrderDate: "2023-12-20",
    createdAt: "2023-03-10",
    updatedAt: "2023-12-20",
    rating: 3.8,
    categories: ["Thuốc truyền thống"],
    notes: "Tạm ngừng hợp tác",
  },
]

// Initial contracts data
const initialContracts: Contract[] = [
  {
    id: 1,
    supplierId: 1,
    contractNumber: "HD001-2024",
    title: "Hợp đồng cung cấp thuốc kê đơn",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    value: 500000000,
    status: "active",
    paymentTerms: "30 ngày",
    deliveryTerms: "FOB Hà Nội",
    products: ["Paracetamol", "Amoxicillin", "Omeprazole"],
    discountRate: 5,
    createdAt: "2023-12-15",
    updatedAt: "2024-01-01",
    renewalDate: "2024-11-01",
    notes: "Hợp đồng chính, ưu tiên cao",
  },
  {
    id: 2,
    supplierId: 1,
    contractNumber: "HD002-2024",
    title: "Hợp đồng cung cấp vitamin",
    startDate: "2024-02-01",
    endDate: "2024-07-31",
    value: 150000000,
    status: "active",
    paymentTerms: "15 ngày",
    deliveryTerms: "CIF TP.HCM",
    products: ["Vitamin C", "Vitamin D", "Multivitamin"],
    discountRate: 3,
    createdAt: "2024-01-20",
    updatedAt: "2024-02-01",
    notes: "Hợp đồng bổ sung",
  },
  {
    id: 3,
    supplierId: 2,
    contractNumber: "HD003-2024",
    title: "Hợp đồng cung cấp kháng sinh",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    value: 200000000,
    status: "active",
    paymentTerms: "20 ngày",
    deliveryTerms: "FOB TP.HCM",
    products: ["Amoxicillin", "Cephalexin", "Azithromycin"],
    discountRate: 4,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
    notes: "Hợp đồng thử nghiệm",
  },
]

// Initial transactions data
const initialTransactions: Transaction[] = [
  {
    id: 1,
    supplierId: 1,
    contractId: 1,
    transactionNumber: "GD001",
    type: "purchase",
    amount: 25000000,
    description: "Mua thuốc kê đơn tháng 1",
    paymentMethod: "transfer",
    paymentStatus: "paid",
    paidDate: "2024-01-20",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    createdBy: "Nguyễn Văn An",
    approvedBy: "Trần Thị Bình",
    invoiceNumber: "INV001",
    receiptNumber: "REC001",
  },
  {
    id: 2,
    supplierId: 1,
    contractId: 1,
    transactionNumber: "GD002",
    type: "purchase",
    amount: 15000000,
    description: "Mua thuốc bổ sung",
    paymentMethod: "transfer",
    paymentStatus: "pending",
    dueDate: "2024-02-15",
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
    createdBy: "Lê Văn Cường",
    invoiceNumber: "INV002",
  },
  {
    id: 3,
    supplierId: 2,
    contractId: 3,
    transactionNumber: "GD003",
    type: "payment",
    amount: 8500000,
    description: "Thanh toán tiền hàng tháng 12",
    paymentMethod: "transfer",
    paymentStatus: "paid",
    paidDate: "2024-01-10",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-10",
    createdBy: "Phạm Thị Mai",
    approvedBy: "Nguyễn Văn An",
    receiptNumber: "REC002",
  },
]

export function useSuppliers() {
  const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>("pharmacy-suppliers", initialSuppliers)
  const [contracts, setContracts] = useLocalStorage<Contract[]>("pharmacy-contracts", initialContracts)
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("pharmacy-transactions", initialTransactions)
  const [loading, setLoading] = useState(false)

  // Listen for real-time updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pharmacy-suppliers" && e.newValue) {
        try {
          setSuppliers(JSON.parse(e.newValue))
        } catch (error) {
          console.error("Error parsing suppliers:", error)
        }
      }
      if (e.key === "pharmacy-contracts" && e.newValue) {
        try {
          setContracts(JSON.parse(e.newValue))
        } catch (error) {
          console.error("Error parsing contracts:", error)
        }
      }
      if (e.key === "pharmacy-transactions" && e.newValue) {
        try {
          setTransactions(JSON.parse(e.newValue))
        } catch (error) {
          console.error("Error parsing transactions:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [setSuppliers, setContracts, setTransactions])

  // Supplier CRUD operations
  const addSupplier = useCallback(
    async (
      supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt" | "contractCount" | "totalPurchases" | "totalDebt">,
    ) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const existingSupplier = suppliers.find((s) => s.code === supplierData.code)
        if (existingSupplier) {
          return { success: false, error: "Mã nhà cung cấp đã tồn tại" }
        }

        const now = new Date().toISOString()
        const newSupplier: Supplier = {
          ...supplierData,
          id: Math.max(...suppliers.map((s) => s.id), 0) + 1,
          contractCount: 0,
          totalPurchases: 0,
          totalDebt: 0,
          createdAt: now,
          updatedAt: now,
        }

        const updatedSuppliers = [...suppliers, newSupplier]
        setSuppliers(updatedSuppliers)

        return { success: true, data: newSupplier }
      } catch (error) {
        return { success: false, error: "Không thể thêm nhà cung cấp" }
      } finally {
        setLoading(false)
      }
    },
    [suppliers, setSuppliers],
  )

  const updateSupplier = useCallback(
    async (id: number, supplierData: Partial<Supplier>) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 400))

        const updatedSuppliers = suppliers.map((supplier) =>
          supplier.id === id
            ? {
                ...supplier,
                ...supplierData,
                updatedAt: new Date().toISOString(),
              }
            : supplier,
        )

        setSuppliers(updatedSuppliers)
        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật nhà cung cấp" }
      } finally {
        setLoading(false)
      }
    },
    [suppliers, setSuppliers],
  )

  const deleteSupplier = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Delete related contracts and transactions
        const updatedContracts = contracts.filter((contract) => contract.supplierId !== id)
        const updatedTransactions = transactions.filter((transaction) => transaction.supplierId !== id)
        const updatedSuppliers = suppliers.filter((supplier) => supplier.id !== id)

        setContracts(updatedContracts)
        setTransactions(updatedTransactions)
        setSuppliers(updatedSuppliers)

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể xóa nhà cung cấp" }
      } finally {
        setLoading(false)
      }
    },
    [suppliers, contracts, transactions, setSuppliers, setContracts, setTransactions],
  )

  // Contract CRUD operations
  const addContract = useCallback(
    async (contractData: Omit<Contract, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const now = new Date().toISOString()
        const newContract: Contract = {
          ...contractData,
          id: Math.max(...contracts.map((c) => c.id), 0) + 1,
          createdAt: now,
          updatedAt: now,
        }

        const updatedContracts = [...contracts, newContract]
        setContracts(updatedContracts)

        // Update supplier contract count
        const updatedSuppliers = suppliers.map((supplier) =>
          supplier.id === contractData.supplierId
            ? { ...supplier, contractCount: supplier.contractCount + 1, updatedAt: now }
            : supplier,
        )
        setSuppliers(updatedSuppliers)

        return { success: true, data: newContract }
      } catch (error) {
        return { success: false, error: "Không thể thêm hợp đồng" }
      } finally {
        setLoading(false)
      }
    },
    [contracts, suppliers, setContracts, setSuppliers],
  )

  const updateContract = useCallback(
    async (id: number, contractData: Partial<Contract>) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 400))

        const updatedContracts = contracts.map((contract) =>
          contract.id === id
            ? {
                ...contract,
                ...contractData,
                updatedAt: new Date().toISOString(),
              }
            : contract,
        )

        setContracts(updatedContracts)
        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật hợp đồng" }
      } finally {
        setLoading(false)
      }
    },
    [contracts, setContracts],
  )

  const deleteContract = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))

        const contractToDelete = contracts.find((c) => c.id === id)
        if (!contractToDelete) return { success: false, error: "Không tìm thấy hợp đồng" }

        const updatedContracts = contracts.filter((contract) => contract.id !== id)
        const updatedTransactions = transactions.filter((transaction) => transaction.contractId !== id)

        setContracts(updatedContracts)
        setTransactions(updatedTransactions)

        // Update supplier contract count
        const updatedSuppliers = suppliers.map((supplier) =>
          supplier.id === contractToDelete.supplierId
            ? {
                ...supplier,
                contractCount: Math.max(0, supplier.contractCount - 1),
                updatedAt: new Date().toISOString(),
              }
            : supplier,
        )
        setSuppliers(updatedSuppliers)

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể xóa hợp đồng" }
      } finally {
        setLoading(false)
      }
    },
    [contracts, transactions, suppliers, setContracts, setTransactions, setSuppliers],
  )

  // Transaction CRUD operations
  const addTransaction = useCallback(
    async (transactionData: Omit<Transaction, "id" | "createdAt" | "updatedAt" | "transactionNumber">) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 500))

        const now = new Date().toISOString()
        const transactionNumber = `GD${Date.now().toString().slice(-6)}`

        const newTransaction: Transaction = {
          ...transactionData,
          id: Math.max(...transactions.map((t) => t.id), 0) + 1,
          transactionNumber,
          createdAt: now,
          updatedAt: now,
        }

        const updatedTransactions = [...transactions, newTransaction]
        setTransactions(updatedTransactions)

        // Update supplier totals
        const updatedSuppliers = suppliers.map((supplier) => {
          if (supplier.id === transactionData.supplierId) {
            let newTotalPurchases = supplier.totalPurchases
            let newTotalDebt = supplier.totalDebt

            if (transactionData.type === "purchase") {
              newTotalPurchases += transactionData.amount
              if (transactionData.paymentStatus === "pending" || transactionData.paymentStatus === "overdue") {
                newTotalDebt += transactionData.amount
              }
            } else if (transactionData.type === "payment" && transactionData.paymentStatus === "paid") {
              newTotalDebt = Math.max(0, newTotalDebt - transactionData.amount)
            }

            return {
              ...supplier,
              totalPurchases: newTotalPurchases,
              totalDebt: newTotalDebt,
              lastOrderDate: transactionData.type === "purchase" ? now.split("T")[0] : supplier.lastOrderDate,
              updatedAt: now,
            }
          }
          return supplier
        })
        setSuppliers(updatedSuppliers)

        return { success: true, data: newTransaction }
      } catch (error) {
        return { success: false, error: "Không thể thêm giao dịch" }
      } finally {
        setLoading(false)
      }
    },
    [transactions, suppliers, setTransactions, setSuppliers],
  )

  const updateTransaction = useCallback(
    async (id: number, transactionData: Partial<Transaction>) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 400))

        const oldTransaction = transactions.find((t) => t.id === id)
        if (!oldTransaction) return { success: false, error: "Không tìm thấy giao dịch" }

        const updatedTransactions = transactions.map((transaction) =>
          transaction.id === id
            ? {
                ...transaction,
                ...transactionData,
                updatedAt: new Date().toISOString(),
              }
            : transaction,
        )

        setTransactions(updatedTransactions)

        // Update supplier debt if payment status changed
        if (transactionData.paymentStatus && transactionData.paymentStatus !== oldTransaction.paymentStatus) {
          const updatedSuppliers = suppliers.map((supplier) => {
            if (supplier.id === oldTransaction.supplierId) {
              let newTotalDebt = supplier.totalDebt

              if (oldTransaction.paymentStatus === "pending" && transactionData.paymentStatus === "paid") {
                newTotalDebt = Math.max(0, newTotalDebt - oldTransaction.amount)
              } else if (oldTransaction.paymentStatus === "paid" && transactionData.paymentStatus === "pending") {
                newTotalDebt += oldTransaction.amount
              }

              return {
                ...supplier,
                totalDebt: newTotalDebt,
                updatedAt: new Date().toISOString(),
              }
            }
            return supplier
          })
          setSuppliers(updatedSuppliers)
        }

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật giao dịch" }
      } finally {
        setLoading(false)
      }
    },
    [transactions, suppliers, setTransactions, setSuppliers],
  )

  const deleteTransaction = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))

        const transactionToDelete = transactions.find((t) => t.id === id)
        if (!transactionToDelete) return { success: false, error: "Không tìm thấy giao dịch" }

        const updatedTransactions = transactions.filter((transaction) => transaction.id !== id)
        setTransactions(updatedTransactions)

        // Update supplier totals
        const updatedSuppliers = suppliers.map((supplier) => {
          if (supplier.id === transactionToDelete.supplierId) {
            let newTotalPurchases = supplier.totalPurchases
            let newTotalDebt = supplier.totalDebt

            if (transactionToDelete.type === "purchase") {
              newTotalPurchases = Math.max(0, newTotalPurchases - transactionToDelete.amount)
              if (transactionToDelete.paymentStatus === "pending" || transactionToDelete.paymentStatus === "overdue") {
                newTotalDebt = Math.max(0, newTotalDebt - transactionToDelete.amount)
              }
            } else if (transactionToDelete.type === "payment") {
              newTotalDebt += transactionToDelete.amount
            }

            return {
              ...supplier,
              totalPurchases: newTotalPurchases,
              totalDebt: newTotalDebt,
              updatedAt: new Date().toISOString(),
            }
          }
          return supplier
        })
        setSuppliers(updatedSuppliers)

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể xóa giao dịch" }
      } finally {
        setLoading(false)
      }
    },
    [transactions, suppliers, setTransactions, setSuppliers],
  )

  // Statistics
  const getSupplierStats = useCallback(() => {
    const activeSuppliers = suppliers.filter((s) => s.status === "active").length
    const totalContracts = contracts.length
    const activeContracts = contracts.filter((c) => c.status === "active").length
    const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0)
    const totalDebt = suppliers.reduce((sum, s) => sum + s.totalDebt, 0)
    const overdueTransactions = transactions.filter((t) => {
      if (t.paymentStatus !== "overdue") return false
      return t.dueDate && new Date(t.dueDate) < new Date()
    }).length

    return {
      totalSuppliers: suppliers.length,
      activeSuppliers,
      totalContracts,
      activeContracts,
      totalPurchases,
      totalDebt,
      overdueTransactions,
    }
  }, [suppliers, contracts, transactions])

  return {
    suppliers,
    contracts,
    transactions,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addContract,
    updateContract,
    deleteContract,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getSupplierStats,
  }
}
