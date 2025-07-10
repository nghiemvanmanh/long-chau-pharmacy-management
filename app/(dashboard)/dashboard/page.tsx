"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Activity,
  Clock,
  ArrowRight,
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const stats = [
  {
    title: "Tổng Nhân viên",
    value: "24",
    change: "+2 từ tháng trước",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Sản phẩm trong Kho",
    value: "1,247",
    change: "+15% so với tháng trước",
    icon: Package,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Doanh thu Tháng",
    value: "125,450,000 ₫",
    change: "+12% so với tháng trước",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Đơn hàng Hôm nay",
    value: "89",
    change: "+5 so với hôm qua",
    icon: ShoppingCart,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "sale",
    message: "Bán 15 sản phẩm cho khách hàng KH001",
    time: "10 phút trước",
    icon: ShoppingCart,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "inventory",
    message: "Nhập kho 100 hộp Paracetamol 500mg",
    time: "25 phút trước",
    icon: Package,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "alert",
    message: "Cảnh báo: 5 loại thuốc sắp hết hạn",
    time: "1 giờ trước",
    icon: AlertTriangle,
    color: "text-orange-600",
  },
  {
    id: 4,
    type: "employee",
    message: "Nhân viên NV003 đã hoàn thành ca làm việc",
    time: "2 giờ trước",
    icon: Users,
    color: "text-purple-600",
  },
  {
    id: 5,
    type: "customer",
    message: "Thêm khách hàng mới: Nguyễn Thị Hoa",
    time: "3 giờ trước",
    icon: Users,
    color: "text-cyan-600",
  },
]

const topProducts = [
  { name: "Paracetamol 500mg", sold: 125, revenue: "312,500 ₫" },
  { name: "Amoxicillin 250mg", sold: 98, revenue: "343,000 ₫" },
  { name: "Vitamin C 1000mg", sold: 87, revenue: "1,044,000 ₫" },
  { name: "Aspirin 100mg", sold: 76, revenue: "228,000 ₫" },
  { name: "Omeprazole 20mg", sold: 65, revenue: "390,000 ₫" },
]

export default function Dashboard() {
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng đến với Hệ Thống Quản Lý Long Châu</h1>
        <p className="text-gray-600">Tổng quan về hoạt động kinh doanh và quản lý nhà thuốc</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 min-h-[120px]">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-xs text-green-600">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Hoạt động Gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className={`p-2 rounded-full bg-gray-100`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-6 text-right">
              <Button variant="ghost" asChild>
                <Link href="/reports" className="text-blue-600 hover:text-blue-700">
                  Xem tất cả hoạt động <ArrowRight className="ml-2 w-4 h-4 inline-block" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Sản phẩm Bán chạy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sold} đã bán</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <Button variant="ghost" asChild>
                <Link href="/products" className="text-blue-600 hover:text-blue-700">
                  Xem tất cả sản phẩm <ArrowRight className="ml-2 w-4 h-4 inline-block" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
