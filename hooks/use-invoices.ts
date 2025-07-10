"use client"

import { useState, useEffect, useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

export interface InvoiceItem {
  id: string
  productId: string
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerAddress?: string
  saleType: "online" | "offline"
  items: InvoiceItem[]
  subtotal: number
  discount: number
  discountType: "amount" | "percent"
  tax: number
  taxRate: number
  totalAmount: number
  paymentMethod: "cash" | "card" | "transfer"
  paymentStatus: "paid" | "pending" | "failed" | "refunded"
  status: "draft" | "completed" | "cancelled" | "refunded"
  createdAt: string
  updatedAt: string
  createdBy: string
  notes?: string
  dueDate?: string
  paidAt?: string
  refundedAt?: string
  refundAmount?: number
  refundReason?: string
}

const initialInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "HD001",
    customerId: "1",
    customerName: "Phạm Thị Dung",
    customerPhone: "0987654321",
    customerEmail: "dungpham@email.com",
    customerAddress: "123 Nguyễn Trãi, Q.1, TP.HCM",
    saleType: "offline",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "Paracetamol 500mg",
        productCode: "PAR500",
        quantity: 20,
        unitPrice: 2500,
        discount: 0,
        total: 50000,
      },
      {
        id: "2",
        productId: "2",
        productName: "Amoxicillin 250mg",
        productCode: "AMO250",
        quantity: 15,
        unitPrice: 3500,
        discount: 0,
        total: 52500,
      },
    ],
    subtotal: 102500,
    discount: 2500,
    discountType: "amount",
    tax: 0,
    taxRate: 0,
    totalAmount: 100000,
    paymentMethod: "cash",
    paymentStatus: "paid",
    status: "completed",
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00",
    createdBy: "Nguyễn Văn An",
    notes: "Khách hàng thân thiết",
    paidAt: "2024-01-15T10:30:00",
  },
  {
    id: "2",
    invoiceNumber: "HD002",
    customerName: "Hoàng Văn Minh",
    customerPhone: "0976543210",
    customerEmail: "minhhv@email.com",
    saleType: "online",
    items: [
      {
        id: "1",
        productId: "3",
        productName: "Vitamin C 1000mg",
        productCode: "VTC1000",
        quantity: 10,
        unitPrice: 12000,
        discount: 0,
        total: 120000,
      },
    ],
    subtotal: 120000,
    discount: 0,
    discountType: "amount",
    tax: 0,
    taxRate: 0,
    totalAmount: 120000,
    paymentMethod: "card",
    paymentStatus: "paid",
    status: "completed",
    createdAt: "2024-01-14T15:45:00",
    updatedAt: "2024-01-14T15:45:00",
    createdBy: "Trần Thị Bình",
    notes: "Giao hàng tận nơi",
    paidAt: "2024-01-14T15:45:00",
  },
  {
    id: "3",
    invoiceNumber: "HD003",
    customerName: "Lê Thị Cẩm",
    customerPhone: "0965432109",
    saleType: "offline",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "Paracetamol 500mg",
        productCode: "PAR500",
        quantity: 30,
        unitPrice: 2500,
        discount: 0,
        total: 75000,
      },
    ],
    subtotal: 75000,
    discount: 0,
    discountType: "amount",
    tax: 0,
    taxRate: 0,
    totalAmount: 75000,
    paymentMethod: "cash",
    paymentStatus: "pending",
    status: "completed",
    createdAt: "2024-01-16T09:15:00",
    updatedAt: "2024-01-16T09:15:00",
    createdBy: "Lê Văn Cường",
    dueDate: "2024-01-20T09:15:00",
  },
  {
    id: "4",
    invoiceNumber: "HD004",
    customerName: "Nguyễn Thị Lan",
    customerPhone: "0954321098",
    saleType: "online",
    items: [
      {
        id: "1",
        productId: "4",
        productName: "Ibuprofen 400mg",
        productCode: "IBU400",
        quantity: 25,
        unitPrice: 3000,
        discount: 5,
        total: 71250,
      },
    ],
    subtotal: 75000,
    discount: 3750,
    discountType: "percent",
    tax: 0,
    taxRate: 0,
    totalAmount: 71250,
    paymentMethod: "transfer",
    paymentStatus: "failed",
    status: "cancelled",
    createdAt: "2024-01-13T14:20:00",
    updatedAt: "2024-01-13T16:20:00",
    createdBy: "Phạm Văn Đức",
    notes: "Thanh toán thất bại, đã hủy đơn",
  },
]

export function useInvoices() {
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>("invoices", initialInvoices)
  const [isLoading, setIsLoading] = useState(false)

  // Real-time sync between tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "invoices" && e.newValue) {
        setInvoices(JSON.parse(e.newValue))
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [setInvoices])

  const generateInvoiceNumber = useCallback(() => {
    const lastInvoice = invoices
      .filter((inv) => inv.invoiceNumber.startsWith("HD"))
      .sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber))[0]

    if (!lastInvoice) return "HD001"

    const lastNumber = Number.parseInt(lastInvoice.invoiceNumber.substring(2))
    return `HD${String(lastNumber + 1).padStart(3, "0")}`
  }, [invoices])

  const createInvoice = useCallback(
    async (invoiceData: Omit<Invoice, "id" | "invoiceNumber" | "createdAt" | "updatedAt">) => {
      setIsLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now().toString(),
        invoiceNumber: generateInvoiceNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setInvoices((prev) => [newInvoice, ...prev])
      setIsLoading(false)
      return newInvoice
    },
    [setInvoices, generateInvoiceNumber],
  )

  const updateInvoice = useCallback(
    async (id: string, updates: Partial<Invoice>) => {
      setIsLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === id ? { ...invoice, ...updates, updatedAt: new Date().toISOString() } : invoice,
        ),
      )
      setIsLoading(false)
    },
    [setInvoices],
  )

  const deleteInvoice = useCallback(
    async (id: string) => {
      setIsLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      setInvoices((prev) => prev.filter((invoice) => invoice.id !== id))
      setIsLoading(false)
    },
    [setInvoices],
  )

  const updatePaymentStatus = useCallback(
    async (id: string, paymentStatus: Invoice["paymentStatus"], paidAt?: string) => {
      await updateInvoice(id, {
        paymentStatus,
        paidAt: paymentStatus === "paid" ? paidAt || new Date().toISOString() : undefined,
      })
    },
    [updateInvoice],
  )

  const refundInvoice = useCallback(
    async (id: string, refundAmount: number, refundReason: string) => {
      await updateInvoice(id, {
        paymentStatus: "refunded",
        status: "refunded",
        refundedAt: new Date().toISOString(),
        refundAmount,
        refundReason,
      })
    },
    [updateInvoice],
  )

  const getInvoiceStats = useCallback(() => {
    const today = new Date().toDateString()
    const todayInvoices = invoices.filter((inv) => new Date(inv.createdAt).toDateString() === today)

    return {
      total: invoices.length,
      todayCount: todayInvoices.length,
      todayRevenue: todayInvoices
        .filter((inv) => inv.paymentStatus === "paid")
        .reduce((sum, inv) => sum + inv.totalAmount, 0),
      pending: invoices.filter((inv) => inv.paymentStatus === "pending").length,
      overdue: invoices.filter((inv) => {
        if (!inv.dueDate || inv.paymentStatus === "paid") return false
        return new Date(inv.dueDate) < new Date()
      }).length,
      completed: invoices.filter((inv) => inv.status === "completed").length,
      cancelled: invoices.filter((inv) => inv.status === "cancelled").length,
      refunded: invoices.filter((inv) => inv.status === "refunded").length,
    }
  }, [invoices])

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updatePaymentStatus,
    refundInvoice,
    getInvoiceStats,
    generateInvoiceNumber,
  }
}
