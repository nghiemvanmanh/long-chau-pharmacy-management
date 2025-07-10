"use client"

import { useState, useCallback, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

interface Product {
  id: number
  code: string
  name: string
  category: string
  manufacturer: string
  dosage: string
  unit: string
  price: number
  costPrice: number
  stock: number
  minStock: number
  maxStock: number
  expiryDate: string
  batchNumber: string
  barcode: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  lastRestocked?: string
  location?: string
  supplier?: string
}

// Initial products data
const initialProducts: Product[] = [
  {
    id: 1,
    code: "SP001",
    name: "Paracetamol 500mg",
    category: "Giảm đau, hạ sốt",
    manufacturer: "Công ty Dược Hà Tây",
    dosage: "500mg",
    unit: "Viên",
    price: 2500,
    costPrice: 1800,
    stock: 500,
    minStock: 50,
    maxStock: 1000,
    expiryDate: "2025-12-31",
    batchNumber: "LOT001",
    barcode: "8936001234567",
    description: "Thuốc giảm đau, hạ sốt",
    status: "active",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    lastRestocked: "2024-01-10",
    location: "Kệ A1-01",
    supplier: "Dược Hà Tây",
  },
  {
    id: 2,
    code: "SP002",
    name: "Amoxicillin 250mg",
    category: "Kháng sinh",
    manufacturer: "Công ty Dược Sài Gòn",
    dosage: "250mg",
    unit: "Viên",
    price: 3500,
    costPrice: 2500,
    stock: 25,
    minStock: 30,
    maxStock: 500,
    expiryDate: "2025-08-15",
    batchNumber: "LOT002",
    barcode: "8936001234568",
    description: "Kháng sinh điều trị nhiễm khuẩn",
    status: "active",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-16",
    lastRestocked: "2024-01-05",
    location: "Kệ B2-03",
    supplier: "Dược Sài Gòn",
  },
  {
    id: 3,
    code: "SP003",
    name: "Vitamin C 1000mg",
    category: "Vitamin & Khoáng chất",
    manufacturer: "Công ty Dược Hà Tây",
    dosage: "1000mg",
    unit: "Viên",
    price: 12000,
    costPrice: 8000,
    stock: 50,
    minStock: 100,
    maxStock: 300,
    expiryDate: "2024-06-30",
    batchNumber: "LOT003",
    barcode: "8936001234569",
    description: "Vitamin C tăng cường sức đề kháng",
    status: "active",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-17",
    lastRestocked: "2024-01-12",
    location: "Kệ C1-05",
    supplier: "Dược Hà Tây",
  },
  {
    id: 4,
    code: "SP004",
    name: "Aspirin 100mg",
    category: "Giảm đau, hạ sốt",
    manufacturer: "Công ty Dược Miền Trung",
    dosage: "100mg",
    unit: "Viên",
    price: 1500,
    costPrice: 1000,
    stock: 200,
    minStock: 50,
    maxStock: 400,
    expiryDate: "2025-10-20",
    batchNumber: "LOT004",
    barcode: "8936001234570",
    description: "Thuốc giảm đau, chống viêm",
    status: "active",
    createdAt: "2024-01-04",
    updatedAt: "2024-01-18",
    lastRestocked: "2024-01-08",
    location: "Kệ A2-02",
    supplier: "Dược Miền Trung",
  },
  {
    id: 5,
    code: "SP005",
    name: "Omeprazole 20mg",
    category: "Tiêu hóa",
    manufacturer: "Công ty Dược Sài Gòn",
    dosage: "20mg",
    unit: "Viên",
    price: 4500,
    costPrice: 3200,
    stock: 150,
    minStock: 40,
    maxStock: 300,
    expiryDate: "2025-09-15",
    batchNumber: "LOT005",
    barcode: "8936001234571",
    description: "Thuốc điều trị loét dạ dày",
    status: "active",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-19",
    lastRestocked: "2024-01-15",
    location: "Kệ D1-03",
    supplier: "Dược Sài Gòn",
  },
]

export function useProducts() {
  const [products, setProducts] = useLocalStorage<Product[]>("pharmacy-products", initialProducts)
  const [loading, setLoading] = useState(false)

  // Listen for real-time updates from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pharmacy-products" && e.newValue) {
        try {
          const updatedProducts = JSON.parse(e.newValue)
          setProducts(updatedProducts)
        } catch (error) {
          console.error("Error parsing updated products:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [setProducts])

  // Ensure initial products are always present
  const ensureInitialProducts = useCallback(() => {
    if (products.length === 0) {
      setProducts(initialProducts)
    }
  }, [products, setProducts])

  useEffect(() => {
    ensureInitialProducts()
  }, [])

  const addProduct = useCallback(
    async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Check if code already exists
        const existingProduct = products.find((prod) => prod.code === productData.code)
        if (existingProduct) {
          return { success: false, error: "Mã sản phẩm đã tồn tại" }
        }

        // Check if barcode already exists
        const existingBarcode = products.find((prod) => prod.barcode === productData.barcode)
        if (existingBarcode) {
          return { success: false, error: "Mã vạch đã tồn tại" }
        }

        const now = new Date().toISOString()
        const newProduct: Product = {
          ...productData,
          id: Math.max(...products.map((p) => p.id), 0) + 1,
          createdAt: now,
          updatedAt: now,
          lastRestocked: now,
        }

        const updatedProducts = [...products, newProduct]
        setProducts(updatedProducts)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-products",
            newValue: JSON.stringify(updatedProducts),
          }),
        )

        return { success: true, data: newProduct }
      } catch (error) {
        return { success: false, error: "Không thể thêm sản phẩm" }
      } finally {
        setLoading(false)
      }
    },
    [products, setProducts],
  )

  const updateProduct = useCallback(
    async (id: number, productData: Partial<Product>) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600))

        // Check if code already exists (excluding current product)
        if (productData.code) {
          const existingProduct = products.find((prod) => prod.code === productData.code && prod.id !== id)
          if (existingProduct) {
            return { success: false, error: "Mã sản phẩm đã tồn tại" }
          }
        }

        // Check if barcode already exists (excluding current product)
        if (productData.barcode) {
          const existingBarcode = products.find((prod) => prod.barcode === productData.barcode && prod.id !== id)
          if (existingBarcode) {
            return { success: false, error: "Mã vạch đã tồn tại" }
          }
        }

        const updatedProducts = products.map((product) =>
          product.id === id
            ? {
                ...product,
                ...productData,
                updatedAt: new Date().toISOString(),
                // Update lastRestocked if stock is increased
                lastRestocked:
                  productData.stock && productData.stock > product.stock
                    ? new Date().toISOString()
                    : product.lastRestocked,
              }
            : product,
        )

        setProducts(updatedProducts)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-products",
            newValue: JSON.stringify(updatedProducts),
          }),
        )

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật sản phẩm" }
      } finally {
        setLoading(false)
      }
    },
    [products, setProducts],
  )

  const deleteProduct = useCallback(
    async (id: number) => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        const updatedProducts = products.filter((product) => product.id !== id)
        setProducts(updatedProducts)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-products",
            newValue: JSON.stringify(updatedProducts),
          }),
        )

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể xóa sản phẩm" }
      } finally {
        setLoading(false)
      }
    },
    [products, setProducts],
  )

  const updateStock = useCallback(
    async (id: number, newStock: number, reason = "Điều chỉnh kho") => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400))

        const updatedProducts = products.map((product) =>
          product.id === id
            ? {
                ...product,
                stock: newStock,
                updatedAt: new Date().toISOString(),
                lastRestocked: newStock > product.stock ? new Date().toISOString() : product.lastRestocked,
              }
            : product,
        )

        setProducts(updatedProducts)

        // Trigger real-time update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "pharmacy-products",
            newValue: JSON.stringify(updatedProducts),
          }),
        )

        return { success: true }
      } catch (error) {
        return { success: false, error: "Không thể cập nhật tồn kho" }
      } finally {
        setLoading(false)
      }
    },
    [products, setProducts],
  )

  const exportProducts = useCallback(() => {
    const dataToExport = products.map((product) => ({
      "Mã sản phẩm": product.code,
      "Tên sản phẩm": product.name,
      "Danh mục": product.category,
      "Nhà sản xuất": product.manufacturer,
      "Liều lượng": product.dosage,
      "Đơn vị": product.unit,
      "Giá bán": product.price,
      "Giá vốn": product.costPrice,
      "Tồn kho": product.stock,
      "Tồn kho tối thiểu": product.minStock,
      "Tồn kho tối đa": product.maxStock,
      "Hạn sử dụng": new Date(product.expiryDate).toLocaleDateString("vi-VN"),
      "Số lô": product.batchNumber,
      "Mã vạch": product.barcode,
      "Vị trí": product.location || "",
      "Nhà cung cấp": product.supplier || "",
      "Trạng thái": product.status === "active" ? "Hoạt động" : "Ngừng bán",
      "Ngày tạo": new Date(product.createdAt).toLocaleDateString("vi-VN"),
      "Nhập kho cuối": product.lastRestocked
        ? new Date(product.lastRestocked).toLocaleDateString("vi-VN")
        : "Chưa nhập",
    }))

    const csv = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map((row) => Object.values(row).join(",")),
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `san-pham-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [products])

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    exportProducts,
  }
}
