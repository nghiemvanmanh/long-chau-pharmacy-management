"use client"

import { useState, useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

export interface InventoryItem {
  id: number
  code: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  avgMonthlyUsage: number
  lastRestocked: string
  supplier: string
  location: string
  status: "normal" | "low" | "overstock" | "out_of_stock"
  value: number
  costPrice: number
  sellingPrice: number
  expiryDate?: string
  batchNumber?: string
  description?: string
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 1,
    code: "TH001",
    name: "Paracetamol 500mg",
    category: "Giảm đau, hạ sốt",
    currentStock: 150,
    minStock: 50,
    maxStock: 500,
    avgMonthlyUsage: 45,
    lastRestocked: "2024-01-10",
    supplier: "Dược Hà Tây",
    location: "Kệ A1-01",
    status: "normal",
    value: 375000,
    costPrice: 2000,
    sellingPrice: 2500,
    expiryDate: "2025-12-31",
    batchNumber: "LOT001",
    description: "Thuốc giảm đau, hạ sốt",
  },
  {
    id: 2,
    code: "TH002",
    name: "Amoxicillin 250mg",
    category: "Kháng sinh",
    currentStock: 25,
    minStock: 30,
    maxStock: 200,
    avgMonthlyUsage: 35,
    lastRestocked: "2024-01-05",
    supplier: "Dược Sài Gòn",
    location: "Kệ B2-03",
    status: "low",
    value: 87500,
    costPrice: 3000,
    sellingPrice: 3500,
    expiryDate: "2025-08-15",
    batchNumber: "LOT002",
    description: "Kháng sinh điều trị nhiễm khuẩn",
  },
  {
    id: 3,
    code: "TH003",
    name: "Vitamin C 1000mg",
    category: "Vitamin & Khoáng chất",
    currentStock: 200,
    minStock: 50,
    maxStock: 300,
    avgMonthlyUsage: 25,
    lastRestocked: "2024-01-12",
    supplier: "Dược Hà Tây",
    location: "Kệ C1-05",
    status: "overstock",
    value: 2400000,
    costPrice: 10000,
    sellingPrice: 12000,
    expiryDate: "2025-06-30",
    batchNumber: "LOT003",
    description: "Vitamin C tăng cường sức đề kháng",
  },
  {
    id: 4,
    code: "TH004",
    name: "Ibuprofen 400mg",
    category: "Giảm đau, hạ sốt",
    currentStock: 0,
    minStock: 20,
    maxStock: 150,
    avgMonthlyUsage: 30,
    lastRestocked: "2023-12-20",
    supplier: "Dược Sài Gòn",
    location: "Kệ A1-02",
    status: "out_of_stock",
    value: 0,
    costPrice: 3500,
    sellingPrice: 4000,
    expiryDate: "2025-10-15",
    batchNumber: "LOT004",
    description: "Thuốc giảm đau, chống viêm",
  },
]

export function useInventory() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>("inventory", INITIAL_INVENTORY)
  const [loading, setLoading] = useState(false)

  const addInventoryItem = useCallback(
    async (item: Omit<InventoryItem, "id">) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const newItem: InventoryItem = {
          ...item,
          id: Math.max(...inventory.map((i) => i.id), 0) + 1,
          value: item.currentStock * item.costPrice,
          status: getStockStatus(item.currentStock, item.minStock, item.maxStock),
        }

        setInventory([...inventory, newItem])
        return { success: true, data: newItem }
      } catch (error) {
        return { success: false, error: "Không thể thêm sản phẩm" }
      } finally {
        setLoading(false)
      }
    },
    [inventory, setInventory],
  )

  const updateInventoryItem = useCallback(
    async (id: number, updates: Partial<InventoryItem>) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const updatedInventory = inventory.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, ...updates }
            updatedItem.value = updatedItem.currentStock * updatedItem.costPrice
            updatedItem.status = getStockStatus(updatedItem.currentStock, updatedItem.minStock, updatedItem.maxStock)
            return updatedItem
          }
          return item
        })

        setInventory(updatedInventory)
        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật sản phẩm" }
      } finally {
        setLoading(false)
      }
    },
    [inventory, setInventory],
  )

  const deleteInventoryItem = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        setInventory(inventory.filter((item) => item.id !== id))
        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể xóa sản phẩm" }
      } finally {
        setLoading(false)
      }
    },
    [inventory, setInventory],
  )

  const adjustStock = useCallback(
    async (id: number, adjustment: number, reason: string) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const updatedInventory = inventory.map((item) => {
          if (item.id === id) {
            const newStock = Math.max(0, item.currentStock + adjustment)
            const updatedItem = {
              ...item,
              currentStock: newStock,
              value: newStock * item.costPrice,
              status: getStockStatus(newStock, item.minStock, item.maxStock),
              lastRestocked: adjustment > 0 ? new Date().toISOString().split("T")[0] : item.lastRestocked,
            }
            return updatedItem
          }
          return item
        })

        setInventory(updatedInventory)
        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể điều chỉnh tồn kho" }
      } finally {
        setLoading(false)
      }
    },
    [inventory, setInventory],
  )

  const getInventoryStats = useCallback(() => {
    const totalItems = inventory.length
    const lowStockItems = inventory.filter((item) => item.status === "low" || item.status === "out_of_stock").length
    const overstockItems = inventory.filter((item) => item.status === "overstock").length
    const totalValue = inventory.reduce((sum, item) => sum + item.value, 0)
    const outOfStockItems = inventory.filter((item) => item.status === "out_of_stock").length

    return {
      totalItems,
      lowStockItems,
      overstockItems,
      outOfStockItems,
      totalValue,
    }
  }, [inventory])

  const getCategories = useCallback(() => {
    const categories = [...new Set(inventory.map((item) => item.category))]
    return categories.sort()
  }, [inventory])

  const getSuppliers = useCallback(() => {
    const suppliers = [...new Set(inventory.map((item) => item.supplier))]
    return suppliers.sort()
  }, [inventory])

  return {
    inventory,
    loading,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    adjustStock,
    getInventoryStats,
    getCategories,
    getSuppliers,
  }
}

function getStockStatus(currentStock: number, minStock: number, maxStock: number): InventoryItem["status"] {
  if (currentStock === 0) return "out_of_stock"
  if (currentStock <= minStock) return "low"
  if (currentStock >= maxStock * 0.9) return "overstock"
  return "normal"
}
