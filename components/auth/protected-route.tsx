"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PERMISSIONS } from "@/lib/constants"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
}

// Map routes to required permissions
const ROUTE_PERMISSIONS = {
  "/accounts": [PERMISSIONS.ACCOUNT_VIEW],
  "/products": [PERMISSIONS.PRODUCT_VIEW],
  "/sales": [PERMISSIONS.SALES_VIEW],
  "/invoices": [PERMISSIONS.INVOICE_VIEW],
  "/inventory": [PERMISSIONS.INVENTORY_VIEW],
  "/suppliers": [PERMISSIONS.SUPPLIER_VIEW],
  "/reports": [PERMISSIONS.REPORTS_VIEW],
  "/customers": [PERMISSIONS.CUSTOMER_VIEW],
  "/employees": [PERMISSIONS.ACCOUNT_VIEW],
  "/medications": [PERMISSIONS.PRODUCT_VIEW],
  "/orders": [PERMISSIONS.INVOICE_VIEW],
}

export function ProtectedRoute({ children, requiredPermissions }: ProtectedRouteProps) {
  const { user, isLoading, hasAnyPermission } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user && requiredPermissions) {
      if (!hasAnyPermission(requiredPermissions)) {
        // Redirect to dashboard if no permission
        router.push("/")
        return
      }
    }

    // Check route-specific permissions
    if (user && pathname) {
      const routePermissions = ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]
      if (routePermissions && !hasAnyPermission(routePermissions)) {
        router.push("/")
        return
      }
    }
  }, [user, isLoading, router, pathname, requiredPermissions, hasAnyPermission])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span>Đang tải...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Check permissions for current route
  if (pathname) {
    const routePermissions = ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]
    if (routePermissions && !hasAnyPermission(routePermissions)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này.</p>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
