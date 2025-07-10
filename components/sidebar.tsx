"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Users,
  Package,
  Pill,
  UserCheck,
  Truck,
  BarChart3,
  Settings,
  ShoppingCart,
  ClipboardList,
  Home,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: Home, label: "Tổng Quan", href: "/" },
  { icon: Users, label: "Quản lý Nhân viên", href: "/employees" },
  { icon: Package, label: "Quản lý Kho", href: "/inventory" },
  { icon: Pill, label: "Quản lý Thuốc", href: "/medications" },
  { icon: UserCheck, label: "Quản lý Khách hàng", href: "/customers" },
  { icon: Truck, label: "Nhà Cung cấp", href: "/suppliers" },
  { icon: BarChart3, label: "Báo cáo Thống kê", href: "/reports" },
  { icon: Settings, label: "Quản lý Tài khoản", href: "/accounts" },
  { icon: ShoppingCart, label: "Bán hàng", href: "/sales" },
  { icon: ClipboardList, label: "Đơn hàng", href: "/orders" },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-green-800 to-green-900 text-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-green-800" />
            </div>
            {!isCollapsed && <span className="font-bold text-lg">Nhà Thuốc</span>}
          </div>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded hover:bg-green-700">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-green-700",
                isActive && "bg-green-700 border-r-4 border-white",
                isCollapsed && "justify-center px-2",
              )}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
