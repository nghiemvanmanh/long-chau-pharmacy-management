"use client"

import { useState, useCallback, useEffect } from "react"
import { useProducts } from "./use-products"
import { useSales } from "./use-sales"
import { useInvoices } from "./use-invoices"
import { useSuppliers } from "./use-suppliers"
import { useAccounts } from "./use-accounts"

interface ReportData {
  // Sales Analytics
  dailySales: { date: string; revenue: number; orders: number; customers: number }[]
  monthlySales: { month: string; revenue: number; orders: number; customers: number }[]
  topProducts: { name: string; sold: number; revenue: number; growth: number }[]
  customerSegments: { segment: string; count: number; percentage: number; revenue: number }[]

  // Inventory Analytics
  stockLevels: { category: string; total: number; lowStock: number; outOfStock: number }[]
  expiringProducts: { name: string; expiryDate: string; stock: number; daysLeft: number }[]
  topSuppliers: { name: string; totalPurchases: number; activeContracts: number; rating: number }[]

  // Financial Analytics
  revenueByPaymentMethod: { method: string; amount: number; percentage: number }[]
  profitMargins: { category: string; revenue: number; cost: number; profit: number; margin: number }[]
  outstandingPayments: { supplier: string; amount: number; daysOverdue: number }[]

  // Performance Metrics
  kpis: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    customerRetentionRate: number
    inventoryTurnover: number
    grossProfitMargin: number
    operatingExpenses: number
    netProfit: number
  }
}

export function useReports() {
  const { products } = useProducts()
  const { sales, customers } = useSales()
  const { invoices } = useInvoices()
  const { suppliers, contracts, transactions } = useSuppliers()
  const { accounts } = useAccounts()

  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)

  const generateReports = useCallback(
    async (startDate?: string, endDate?: string) => {
      setLoading(true)

      try {
        // Simulate API processing time
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        // Filter data by date range if provided
        const filteredSales = sales.filter((sale) => {
          const saleDate = new Date(sale.createdAt)
          const start = startDate ? new Date(startDate) : thirtyDaysAgo
          const end = endDate ? new Date(endDate) : now
          return saleDate >= start && saleDate <= end
        })

        const filteredInvoices = invoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt)
          const start = startDate ? new Date(startDate) : thirtyDaysAgo
          const end = endDate ? new Date(endDate) : now
          return invoiceDate >= start && invoiceDate <= end
        })

        // Generate daily sales data
        const dailySalesMap = new Map<string, { revenue: number; orders: number; customers: Set<string> }>()

        filteredSales.forEach((sale) => {
          const date = new Date(sale.createdAt).toISOString().split("T")[0]
          const existing = dailySalesMap.get(date) || { revenue: 0, orders: 0, customers: new Set() }

          existing.revenue += sale.totalAmount
          existing.orders += 1
          if (sale.customerId) existing.customers.add(sale.customerId.toString())

          dailySalesMap.set(date, existing)
        })

        const dailySales = Array.from(dailySalesMap.entries())
          .map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders,
            customers: data.customers.size,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))

        // Generate monthly sales data
        const monthlySalesMap = new Map<string, { revenue: number; orders: number; customers: Set<string> }>()

        filteredSales.forEach((sale) => {
          const month = new Date(sale.createdAt).toISOString().slice(0, 7) // YYYY-MM
          const existing = monthlySalesMap.get(month) || { revenue: 0, orders: 0, customers: new Set() }

          existing.revenue += sale.totalAmount
          existing.orders += 1
          if (sale.customerId) existing.customers.add(sale.customerId.toString())

          monthlySalesMap.set(month, existing)
        })

        const monthlySales = Array.from(monthlySalesMap.entries())
          .map(([month, data]) => ({
            month,
            revenue: data.revenue,
            orders: data.orders,
            customers: data.customers.size,
          }))
          .sort((a, b) => a.month.localeCompare(b.month))

        // Calculate top products
        const productSalesMap = new Map<string, { sold: number; revenue: number }>()

        filteredSales.forEach((sale) => {
          sale.items.forEach((item) => {
            const existing = productSalesMap.get(item.productName) || { sold: 0, revenue: 0 }
            existing.sold += item.quantity
            existing.revenue += item.total
            productSalesMap.set(item.productName, existing)
          })
        })

        const topProducts = Array.from(productSalesMap.entries())
          .map(([name, data]) => ({
            name,
            sold: data.sold,
            revenue: data.revenue,
            growth: Math.random() * 20 - 5, // Simulated growth rate
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10)

        // Customer segments analysis
        const customerSegments = [
          {
            segment: "Khách hàng VIP",
            count: customers.filter((c) => c.membershipLevel === "platinum" || c.membershipLevel === "gold").length,
            percentage: 0,
            revenue: 0,
          },
          {
            segment: "Khách hàng thường xuyên",
            count: customers.filter((c) => c.membershipLevel === "silver").length,
            percentage: 0,
            revenue: 0,
          },
          {
            segment: "Khách hàng mới",
            count: customers.filter((c) => c.membershipLevel === "bronze").length,
            percentage: 0,
            revenue: 0,
          },
        ]

        const totalCustomers = customers.length
        customerSegments.forEach((segment) => {
          segment.percentage = totalCustomers > 0 ? Math.round((segment.count / totalCustomers) * 100) : 0
          segment.revenue = segment.count * 1500000 // Simulated average revenue per segment
        })

        // Stock levels by category
        const categoryStockMap = new Map<string, { total: number; lowStock: number; outOfStock: number }>()

        products.forEach((product) => {
          const existing = categoryStockMap.get(product.category) || { total: 0, lowStock: 0, outOfStock: 0 }
          existing.total += 1
          if (product.stock <= 0) existing.outOfStock += 1
          else if (product.stock <= product.minStock) existing.lowStock += 1
          categoryStockMap.set(product.category, existing)
        })

        const stockLevels = Array.from(categoryStockMap.entries()).map(([category, data]) => ({
          category,
          ...data,
        }))

        // Expiring products (within 90 days)
        const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
        const expiringProducts = products
          .filter((product) => new Date(product.expiryDate) <= ninetyDaysFromNow && product.stock > 0)
          .map((product) => ({
            name: product.name,
            expiryDate: product.expiryDate,
            stock: product.stock,
            daysLeft: Math.ceil((new Date(product.expiryDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
          }))
          .sort((a, b) => a.daysLeft - b.daysLeft)
          .slice(0, 10)

        // Top suppliers
        const topSuppliers = suppliers
          .filter((supplier) => supplier.status === "active")
          .map((supplier) => ({
            name: supplier.name,
            totalPurchases: supplier.totalPurchases,
            activeContracts: contracts.filter((c) => c.supplierId === supplier.id && c.status === "active").length,
            rating: supplier.rating,
          }))
          .sort((a, b) => b.totalPurchases - a.totalPurchases)
          .slice(0, 10)

        // Revenue by payment method
        const paymentMethodMap = new Map<string, number>()
        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0)

        filteredSales.forEach((sale) => {
          const existing = paymentMethodMap.get(sale.paymentMethod) || 0
          paymentMethodMap.set(sale.paymentMethod, existing + sale.totalAmount)
        })

        const revenueByPaymentMethod = Array.from(paymentMethodMap.entries()).map(([method, amount]) => ({
          method: method === "cash" ? "Tiền mặt" : method === "card" ? "Thẻ" : "Chuyển khoản",
          amount,
          percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
        }))

        // Profit margins by category
        const categoryProfitMap = new Map<string, { revenue: number; cost: number }>()

        filteredSales.forEach((sale) => {
          sale.items.forEach((item) => {
            const product = products.find((p) => p.name === item.productName)
            if (product) {
              const existing = categoryProfitMap.get(product.category) || { revenue: 0, cost: 0 }
              existing.revenue += item.total
              existing.cost += product.costPrice * item.quantity
              categoryProfitMap.set(product.category, existing)
            }
          })
        })

        const profitMargins = Array.from(categoryProfitMap.entries()).map(([category, data]) => ({
          category,
          revenue: data.revenue,
          cost: data.cost,
          profit: data.revenue - data.cost,
          margin: data.revenue > 0 ? Math.round(((data.revenue - data.cost) / data.revenue) * 100) : 0,
        }))

        // Outstanding payments
        const outstandingPayments = transactions
          .filter((t) => t.paymentStatus === "overdue" && t.dueDate)
          .map((transaction) => {
            const supplier = suppliers.find((s) => s.id === transaction.supplierId)
            const daysOverdue = Math.ceil(
              (now.getTime() - new Date(transaction.dueDate!).getTime()) / (24 * 60 * 60 * 1000),
            )
            return {
              supplier: supplier?.name || "Unknown",
              amount: transaction.amount,
              daysOverdue,
            }
          })
          .sort((a, b) => b.daysOverdue - a.daysOverdue)

        // Calculate KPIs
        const totalOrders = filteredSales.length
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
        const totalCost = profitMargins.reduce((sum, pm) => sum + pm.cost, 0)
        const grossProfit = totalRevenue - totalCost
        const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
        const operatingExpenses = totalRevenue * 0.15 // Simulated 15% operating expenses
        const netProfit = grossProfit - operatingExpenses

        const kpis = {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          customerRetentionRate: 75, // Simulated
          inventoryTurnover: 6.5, // Simulated
          grossProfitMargin,
          operatingExpenses,
          netProfit,
        }

        const newReportData: ReportData = {
          dailySales,
          monthlySales,
          topProducts,
          customerSegments,
          stockLevels,
          expiringProducts,
          topSuppliers,
          revenueByPaymentMethod,
          profitMargins,
          outstandingPayments,
          kpis,
        }

        setReportData(newReportData)
        return newReportData
      } catch (error) {
        console.error("Error generating reports:", error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [products, sales, customers, invoices, suppliers, contracts, transactions],
  )

  // Auto-generate reports when data changes
  useEffect(() => {
    generateReports()
  }, [generateReports])

  const exportReport = useCallback((reportType: string, data: any[]) => {
    const csv = [Object.keys(data[0] || {}).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return {
    reportData,
    loading,
    generateReports,
    exportReport,
  }
}
