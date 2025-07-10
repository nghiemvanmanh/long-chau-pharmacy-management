"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Minus } from "lucide-react"
import type { InventoryItem } from "@/hooks/use-inventory"

interface StockAdjustmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: number, adjustment: number, reason: string) => Promise<{ success: boolean; error?: string }>
  item: InventoryItem | null
}

export function StockAdjustmentModal({ isOpen, onClose, onSubmit, item }: StockAdjustmentModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">("increase")
  const [quantity, setQuantity] = useState(0)
  const [reason, setReason] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!item || quantity <= 0 || !reason.trim()) {
      toast({
        title: "Lỗi validation",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      })
      return
    }

    const adjustment = adjustmentType === "increase" ? quantity : -quantity

    if (adjustmentType === "decrease" && quantity > item.currentStock) {
      toast({
        title: "Lỗi",
        description: "Số lượng giảm không thể lớn hơn tồn kho hiện tại",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const result = await onSubmit(item.id, adjustment, reason)

    if (result.success) {
      toast({
        title: "Thành công",
        description: `Điều chỉnh tồn kho thành công`,
      })
      onClose()
      // Reset form
      setQuantity(0)
      setReason("")
      setAdjustmentType("increase")
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Có lỗi xảy ra",
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const newStock = item
    ? adjustmentType === "increase"
      ? item.currentStock + quantity
      : item.currentStock - quantity
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
        </DialogHeader>

        {item && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <p className="text-sm text-gray-600">Mã: {item.code}</p>
              <p className="text-sm text-gray-600">
                Tồn kho hiện tại: <span className="font-semibold">{item.currentStock}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Loại điều chỉnh</Label>
                <Select
                  value={adjustmentType}
                  onValueChange={(value: "increase" | "decrease") => setAdjustmentType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">
                      <div className="flex items-center">
                        <Plus className="w-4 h-4 mr-2 text-green-600" />
                        Nhập kho
                      </div>
                    </SelectItem>
                    <SelectItem value="decrease">
                      <div className="flex items-center">
                        <Minus className="w-4 h-4 mr-2 text-red-600" />
                        Xuất kho
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Số lượng</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
                  min="1"
                  max={adjustmentType === "decrease" ? item.currentStock : undefined}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reason">Lý do điều chỉnh</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh tồn kho..."
                  rows={3}
                  required
                />
              </div>

              {quantity > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Tồn kho sau điều chỉnh: <span className="font-semibold">{Math.max(0, newStock)}</span>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading || quantity <= 0}>
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
