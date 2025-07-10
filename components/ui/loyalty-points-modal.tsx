"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Award, Plus, Minus } from "lucide-react"
import type { Customer } from "@/hooks/use-customers"

interface LoyaltyPointsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customerId: number, points: number) => Promise<void>
  customer: Customer | null
  loading?: boolean
}

export function LoyaltyPointsModal({ isOpen, onClose, onSubmit, customer, loading }: LoyaltyPointsModalProps) {
  const [formData, setFormData] = useState({
    action: "add",
    points: "",
    reason: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer) return

    const points = Number.parseInt(formData.points) || 0
    const finalPoints = formData.action === "subtract" ? -points : points

    await onSubmit(customer.id, finalPoints)
    setFormData({ action: "add", points: "", reason: "" })
    onClose()
  }

  if (!customer) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Điều chỉnh điểm tích lũy
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Khách hàng</div>
            <div className="font-semibold">{customer.name}</div>
            <div className="text-sm text-gray-600">
              Điểm hiện tại: <span className="font-semibold text-blue-600">{customer.loyaltyPoints} điểm</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Hành động</Label>
              <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <div className="flex items-center">
                      <Plus className="w-4 h-4 mr-2 text-green-500" />
                      Cộng điểm
                    </div>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <div className="flex items-center">
                      <Minus className="w-4 h-4 mr-2 text-red-500" />
                      Trừ điểm
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Số điểm *</Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Lý do</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Nhập lý do điều chỉnh điểm..."
                rows={3}
              />
            </div>

            {formData.points && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm">
                  <span className="text-gray-600">Điểm sau khi điều chỉnh: </span>
                  <span className="font-semibold text-blue-600">
                    {Math.max(
                      0,
                      customer.loyaltyPoints +
                        (formData.action === "subtract"
                          ? -Number.parseInt(formData.points)
                          : Number.parseInt(formData.points)),
                    )}{" "}
                    điểm
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={loading || !formData.points}>
                {loading ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
