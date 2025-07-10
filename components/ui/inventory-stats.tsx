"use client"

import { motion } from "framer-motion"
import { Package, AlertTriangle, TrendingUp, TrendingDown, XCircle } from "lucide-react"
import { StatsCard } from "@/components/ui/stats-card"

interface InventoryStatsProps {
  stats: {
    totalItems: number
    lowStockItems: number
    overstockItems: number
    outOfStockItems: number
    totalValue: number
  }
}

export function InventoryStats({ stats }: InventoryStatsProps) {
  const statsData = [
    {
      title: "Tổng sản phẩm",
      value: stats.totalItems.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Sản phẩm sắp hết",
      value: stats.lowStockItems.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Hết hàng",
      value: stats.outOfStockItems.toString(),
      icon: XCircle,
      color: "text-red-700",
      bgColor: "bg-red-200",
    },
    {
      title: "Tổng giá trị kho",
      value: `${stats.totalValue.toLocaleString()} ₫`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Sản phẩm dư thừa",
      value: stats.overstockItems.toString(),
      icon: TrendingDown,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <StatsCard {...stat} index={index} />
        </motion.div>
      ))}
    </div>
  )
}
