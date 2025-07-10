"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Package } from "lucide-react"

interface Product {
  id: number
  code: string
  name: string
  stock: number
  minStock: number
  maxStock: number
  unit: string
}

interface StockUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (productId: number, newStock: number, reason: string) => void
  product?: Product | null
}

const STOCK_REASONS = [
  "Nhập kho mới",
  "Điều chỉnh kiểm kê",
  "Hàng hỏng/hết hạn",
  "Bán hàng",
  "Trả hàng nhà cung cấp",
  "Khác",
]

export function StockUpdateModal({ isOpen, onClose, onSubmit, product }: StockUpdateModalProps) {
  const [newStock, setNewStock] = useState(0)
  const [reason, setReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (product && isOpen) {
      setNewStock(product.stock)
      setReason("")
      setCustomReason("")
      setNotes("")
    }
  }, [product, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (product) {
      const finalReason = reason === "Khác" ? customReason : reason
      onSubmit(product.id, newStock, finalReason || "Điều chỉnh kho")
      onClose()
    }
  }

  const adjustStock = (amount: number) => {
    const adjusted = Math.max(0, newStock + amount)
    setNewStock(adjusted)
  }

  const getStockStatus = () => {
    if (!product) return { label: "", color: "" }

    if (newStock <= product.minStock) {
      return { label: "Sắp hết", color: "bg-red-100 text-red-800" }
    }
    if (newStock >= product.maxStock * 0.9) {
      return { label: "Dư thừa", color: "bg-orange-100 text-orange-800" }
    }
    return { label: "Bình thường", color: "bg-green-100 text-green-800" }
  }

  const stockStatus = getStockStatus()
  const stockDifference = product ? newStock - product.stock : 0

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Cập nhật tồn kho
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-600">Mã: {product.code}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Tồn kho hiện tại:</span>
              <span className="font-semibold">
                {product.stock} {product.unit}
              </span>
            </div>
          </div>

          {/* Stock Adjustment */}
          <div className="space-y-2">
            <Label>Tồn kho mới</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" size="icon" onClick={() => adjustStock(-10)} className="h-8 w-8">
                <Minus className="w-4 h-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => adjustStock(-1)} className="h-8 w-8">
                -1
              </Button>
              <Input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(Math.max(0, Number(e.target.value)))}
                className="text-center font-semibold"
                min="0"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => adjustStock(1)} className="h-8 w-8">
                +1
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={() => adjustStock(10)} className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className={stockStatus.color}>
                {stockStatus.label}
              </Badge>
              {stockDifference !== 0 && (
                <span className={`text-sm font-semibold ${stockDifference > 0 ? "text-green-600" : "text-red-600"}`}>
                  {stockDifference > 0 ? "+" : ""}
                  {stockDifference} {product.unit}
                </span>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Lý do điều chỉnh</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_REASONS.map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Reason */}
          {reason === "Khác" && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Lý do cụ thể</Label>
              <Input
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Nhập lý do cụ thể..."
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Cập nhật tồn kho
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
