"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, DollarSign, Award, TrendingUp } from "lucide-react"

interface CustomerStatsProps {
  stats: {
    total: number
    active: number
    inactive: number
    totalRevenue: number
    avgPurchase: number
    totalLoyaltyPoints: number
    membershipDistribution: Record<string, number>
    genderDistribution: Record<string, number>
  }
}

export function CustomerStats({ stats }: CustomerStatsProps) {
  const membershipColors = {
    bronze: "bg-amber-100 text-amber-800 border-amber-200",
    silver: "bg-gray-100 text-gray-800 border-gray-200",
    gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
    platinum: "bg-purple-100 text-purple-800 border-purple-200",
  }

  const membershipLabels = {
    bronze: "Đồng",
    silver: "Bạc",
    gold: "Vàng",
    platinum: "Bạch Kim",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <UserCheck className="h-3 w-3 text-green-500" />
            <span>{stats.active} hoạt động</span>
            <UserX className="h-3 w-3 text-red-500" />
            <span>{stats.inactive} không hoạt động</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ₫</div>
          <p className="text-xs text-muted-foreground">TB: {stats.avgPurchase.toLocaleString()} ₫/khách</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Điểm tích lũy</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLoyaltyPoints.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            TB: {Math.round(stats.totalLoyaltyPoints / stats.total)} điểm/khách
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hạng thành viên</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(stats.membershipDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={`text-xs ${membershipColors[level as keyof typeof membershipColors]}`}
                >
                  {membershipLabels[level as keyof typeof membershipLabels]}
                </Badge>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
