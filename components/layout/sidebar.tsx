"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  UserCog,
  Pill,
  ShoppingCart,
  Receipt,
  Package,
  Truck,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NAVIGATION_ITEMS, PERMISSIONS } from "@/lib/constants"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

const iconMap = {
  LayoutDashboard,
  UserCog,
  Pill,
  ShoppingCart,
  Receipt,
  Package,
  Truck,
  BarChart3,
  Users,
}

// Map navigation items to required permissions
const NAVIGATION_PERMISSIONS = {
  "/": [], // Dashboard - everyone can access
  "/accounts": [PERMISSIONS.ACCOUNT_VIEW],
  "/products": [PERMISSIONS.PRODUCT_VIEW],
  "/sales": [PERMISSIONS.SALES_VIEW],
  "/invoices": [PERMISSIONS.INVOICE_VIEW],
  "/inventory": [PERMISSIONS.INVENTORY_VIEW],
  "/suppliers": [PERMISSIONS.SUPPLIER_VIEW],
  "/reports": [PERMISSIONS.REPORTS_VIEW],
  "/customers": [PERMISSIONS.CUSTOMER_VIEW],
  "/employees": [PERMISSIONS.ACCOUNT_VIEW], // Assuming employees need account view permission
  "/medications": [PERMISSIONS.PRODUCT_VIEW],
  "/orders": [PERMISSIONS.INVOICE_VIEW],
}

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (isOpen: boolean) => void
}

export default function Sidebar({ isCollapsed: propIsCollapsed, setIsCollapsed: propSetIsCollapsed }: SidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false)
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768
  const { hasAnyPermission } = useAuth()

  const isCollapsed = isDesktop ? internalIsCollapsed : propIsCollapsed
  const setIsCollapsed = isDesktop ? setInternalIsCollapsed : propSetIsCollapsed

  const pathname = usePathname()

  // Filter navigation items based on user permissions
  const allowedNavigationItems = NAVIGATION_ITEMS.filter((item) => {
    const requiredPermissions = NAVIGATION_PERMISSIONS[item.href as keyof typeof NAVIGATION_PERMISSIONS] || []

    // If no permissions required (like dashboard), allow access
    if (requiredPermissions.length === 0) return true

    // Check if user has any of the required permissions
    return hasAnyPermission(requiredPermissions)
  })

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gradient-to-b from-blue-600 to-blue-800 text-white flex-shrink-0 h-full relative flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-blue-500">
        <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center")}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Pill className="w-5 h-5 text-blue-600" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-bold text-lg">Long Châu</h1>
                <p className="text-xs text-blue-200">Pharmacy Management</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-2 flex-1">
        {allowedNavigationItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          const isActive = pathname === item.href

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 relative overflow-hidden",
                isActive && "bg-blue-700 shadow-lg",
                isCollapsed && "justify-center px-2",
              )}
              onClick={() => {
                if (!isDesktop) {
                  propSetIsCollapsed(false)
                }
              }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !isCollapsed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-2 h-2 bg-white rounded-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="text-blue-600 bg-white rounded-full shadow-md hidden md:flex items-center justify-center absolute top-1/2 -translate-y-1/2 right-0 transform translate-x-1/2 z-10 w-6 h-6 border border-blue-200 hover:bg-gray-100"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>
    </motion.div>
  )
}
