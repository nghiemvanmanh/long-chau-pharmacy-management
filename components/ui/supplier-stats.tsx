"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Truck, FileText, DollarSign, Calendar, AlertTriangle, TrendingUp } from "lucide-react"

interface SupplierStatsProps {
  stats: {
    totalSuppliers: number
    activeSuppliers: number
    activeContracts: number
    totalPurchases: number
    totalDebt: number
    pendingTransactions: number
  }
}

export function SupplierStats({ stats }: SupplierStatsProps) {
  const statItems = [
    {
      title: "Tổng nhà cung cấp",
      value: stats.totalSuppliers.toString(),
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `${stats.activeSuppliers} đang hoạt động`,
    },
    {
      title: "Hợp đồng hiệu lực",
      value: stats.activeContracts.toString(),
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Hợp đồng đang có hiệu lực",
    },
    {
      title: "Tổng mua hàng",
      value: `${stats.totalPurchases.toLocaleString()} ₫`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Tổng giá trị đã mua",
    },
    {
      title: "Công nợ",
      value: `${stats.totalDebt.toLocaleString()} ₫`,
      icon: DollarSign,
      color: stats.totalDebt > 0 ? "text-red-600" : "text-green-600",
      bgColor: stats.totalDebt > 0 ? "bg-red-100" : "bg-green-100",
      description: "Tổng công nợ hiện tại",
    },
    {
      title: "GD chờ thanh toán",
      value: stats.pendingTransactions.toString(),
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Giao dịch chưa thanh toán",
    },
    {
      title: "Cảnh báo",
      value: (stats.totalSuppliers - stats.activeSuppliers).toString(),
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "NCC ngừng hợp tác",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statItems.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-lg font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
