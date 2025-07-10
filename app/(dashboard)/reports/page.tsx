"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  FileDown,
  AlertTriangle,
  Calendar,
  Target,
  PieChart,
  Activity,
  Truck,
} from "lucide-react"
import { StatsCard } from "@/components/ui/stats-card"
import { PageHeader } from "@/components/ui/page-header"
import { ChartCard } from "@/components/ui/chart-card"
import { useReports } from "@/hooks/use-reports"
import { useToast } from "@/hooks/use-toast"

function KPISection({ kpis }: { kpis: any }) {
  const kpiCards = [
    {
      title: "Tổng doanh thu",
      value: `${kpis.totalRevenue.toLocaleString()} ₫`,
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Tổng đơn hàng",
      value: kpis.totalOrders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Giá trị đơn TB",
      value: `${Math.round(kpis.averageOrderValue).toLocaleString()} ₫`,
      change: "+5.1%",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Tỷ lệ giữ chân KH",
      value: `${kpis.customerRetentionRate}%`,
      change: "+2.3%",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Vòng quay kho",
      value: `${kpis.inventoryTurnover}x`,
      change: "+0.8x",
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Lợi nhuận gộp",
      value: `${kpis.grossProfitMargin.toFixed(1)}%`,
      change: "+1.2%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {kpiCards.map((kpi, index) => (
        <StatsCard key={kpi.title} {...kpi} index={index} />
      ))}
    </div>
  )
}

function SalesAnalytics({ reportData }: { reportData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Doanh thu theo ngày" icon={BarChart3} iconColor="text-blue-600" delay={0.2}>
          <div className="space-y-4">
            {reportData.dailySales.slice(-7).map((data: any, index: number) => (
              <div key={data.date} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{new Date(data.date).getDate()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{data.revenue.toLocaleString()} ₫</p>
                    <p className="text-sm text-gray-500">{data.orders} đơn hàng</p>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(data.revenue / Math.max(...reportData.dailySales.map((d: any) => d.revenue))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Sản phẩm bán chạy nhất" icon={TrendingUp} iconColor="text-green-600" delay={0.3}>
          <div className="space-y-4">
            {reportData.topProducts.slice(0, 5).map((product: any, index: number) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sold} đã bán</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{product.revenue.toLocaleString()} ₫</p>
                  <p className={`text-sm ${product.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {product.growth >= 0 ? "+" : ""}
                    {product.growth.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Phương thức thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportData.revenueByPaymentMethod.map((method: any, index: number) => (
              <div key={method.method} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="w-full h-full bg-gray-200 rounded-full">
                    <div
                      className="rounded-full transition-all duration-1000 flex items-center justify-center text-white font-semibold"
                      style={{
                        width: "100%",
                        height: "100%",
                        background: `conic-gradient(${
                          index === 0 ? "#3b82f6" : index === 1 ? "#10b981" : "#f59e0b"
                        } 0deg ${method.percentage * 3.6}deg, #e5e7eb ${method.percentage * 3.6}deg 360deg)`,
                      }}
                    >
                      <span className="text-sm">{method.percentage}%</span>
                    </div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{method.method}</h3>
                <p className="text-sm font-semibold text-blue-600">{method.amount.toLocaleString()} ₫</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InventoryAnalytics({ reportData }: { reportData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tình trạng tồn kho theo danh mục" icon={Package} iconColor="text-orange-600" delay={0.2}>
          <div className="space-y-4">
            {reportData.stockLevels.map((category: any) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">{category.total} sản phẩm</span>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Bình thường</span>
                      <span>{category.total - category.lowStock - category.outOfStock}</span>
                    </div>
                    <Progress
                      value={((category.total - category.lowStock - category.outOfStock) / category.total) * 100}
                      className="h-2"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Sắp hết</span>
                      <span>{category.lowStock}</span>
                    </div>
                    <Progress
                      value={(category.lowStock / category.total) * 100}
                      className="h-2 [&>div]:bg-yellow-500"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Hết hàng</span>
                      <span>{category.outOfStock}</span>
                    </div>
                    <Progress value={(category.outOfStock / category.total) * 100} className="h-2 [&>div]:bg-red-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Sản phẩm sắp hết hạn" icon={AlertTriangle} iconColor="text-red-600" delay={0.3}>
          <div className="space-y-3">
            {reportData.expiringProducts.map((product: any) => (
              <div key={product.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">Tồn kho: {product.stock}</p>
                </div>
                <div className="text-right">
                  <Badge variant={product.daysLeft <= 30 ? "destructive" : "secondary"}>{product.daysLeft} ngày</Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(product.expiryDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Nhà cung cấp hàng đầu" icon={Truck} iconColor="text-indigo-600" delay={0.4}>
        <div className="space-y-4">
          {reportData.topSuppliers.map((supplier: any, index: number) => (
            <div key={supplier.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-indigo-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{supplier.name}</p>
                  <p className="text-sm text-gray-500">{supplier.activeContracts} hợp đồng</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-indigo-600">{supplier.totalPurchases.toLocaleString()} ₫</p>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500">Đánh giá:</span>
                  <span className="text-sm font-medium text-yellow-600">{supplier.rating}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
}

function FinancialAnalytics({ reportData }: { reportData: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Lợi nhuận theo danh mục" icon={TrendingUp} iconColor="text-green-600" delay={0.2}>
          <div className="space-y-4">
            {reportData.profitMargins.map((category: any) => (
              <div key={category.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{category.category}</span>
                  <Badge
                    variant={category.margin >= 20 ? "default" : category.margin >= 10 ? "secondary" : "destructive"}
                  >
                    {category.margin}%
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Doanh thu:</span>
                    <span>{category.revenue.toLocaleString()} ₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chi phí:</span>
                    <span>{category.cost.toLocaleString()} ₫</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Lợi nhuận:</span>
                    <span className="text-green-600">{category.profit.toLocaleString()} ₫</span>
                  </div>
                </div>
                <Progress value={category.margin} className="h-2" />
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Công nợ quá hạn" icon={AlertTriangle} iconColor="text-red-600" delay={0.3}>
          <div className="space-y-3">
            {reportData.outstandingPayments.length > 0 ? (
              reportData.outstandingPayments.map((payment: any) => (
                <div key={payment.supplier} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{payment.supplier}</p>
                    <p className="text-sm text-gray-500">Quá hạn {payment.daysOverdue} ngày</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{payment.amount.toLocaleString()} ₫</p>
                    <Badge variant="destructive">Quá hạn</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Không có công nợ quá hạn</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Tổng quan tài chính
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {reportData.kpis.totalRevenue.toLocaleString()} ₫
              </div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {reportData.kpis.grossProfitMargin.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Tỷ suất lợi nhuận gộp</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {reportData.kpis.operatingExpenses.toLocaleString()} ₫
              </div>
              <p className="text-sm text-gray-600">Chi phí hoạt động</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {reportData.kpis.netProfit.toLocaleString()} ₫
              </div>
              <p className="text-sm text-gray-600">Lợi nhuận ròng</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReportsPage() {
  const { reportData, loading, generateReports, exportReport } = useReports()
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState("30days")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Set default date range
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    setEndDate(now.toISOString().split("T")[0])
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0])
  }, [])

  const handlePeriodChange = async (period: string) => {
    setSelectedPeriod(period)

    const now = new Date()
    let start: Date

    switch (period) {
      case "7days":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30days":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90days":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1year":
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startStr = start.toISOString().split("T")[0]
    const endStr = now.toISOString().split("T")[0]

    setStartDate(startStr)
    setEndDate(endStr)

    await generateReports(startStr, endStr)
    toast({
      title: "Báo cáo đã được cập nhật",
      description: `Dữ liệu từ ${start.toLocaleDateString("vi-VN")} đến ${now.toLocaleDateString("vi-VN")}`,
    })
  }

  const handleCustomDateRange = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày bắt đầu và kết thúc",
        variant: "destructive",
      })
      return
    }

    await generateReports(startDate, endDate)
    toast({
      title: "Báo cáo đã được cập nhật",
      description: `Dữ liệu từ ${new Date(startDate).toLocaleDateString("vi-VN")} đến ${new Date(endDate).toLocaleDateString("vi-VN")}`,
    })
  }

  const handleExport = (reportType: string) => {
    if (!reportData) return

    let data: any[] = []
    let filename = ""

    switch (reportType) {
      case "sales":
        data = reportData.dailySales
        filename = "bao-cao-ban-hang"
        break
      case "products":
        data = reportData.topProducts
        filename = "san-pham-ban-chay"
        break
      case "inventory":
        data = reportData.stockLevels
        filename = "ton-kho"
        break
      case "financial":
        data = reportData.profitMargins
        filename = "loi-nhuan"
        break
      default:
        return
    }

    exportReport(filename, data)
    toast({
      title: "Xuất báo cáo thành công",
      description: `File ${filename}.csv đã được tải xuống`,
    })
  }

  if (loading && !reportData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tạo báo cáo...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có dữ liệu báo cáo</h3>
          <p className="text-gray-600 mb-4">Vui lòng thử lại sau</p>
          <Button onClick={() => generateReports()}>Tạo báo cáo</Button>
        </div>
      </div>
    )
  }

  const headerActions = (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="start-date">Từ ngày:</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Label htmlFor="end-date">Đến ngày:</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
      </div>
      <Button onClick={handleCustomDateRange} variant="outline">
        <Calendar className="w-4 h-4 mr-2" />
        Áp dụng
      </Button>
      <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7days">7 ngày</SelectItem>
          <SelectItem value="30days">30 ngày</SelectItem>
          <SelectItem value="90days">90 ngày</SelectItem>
          <SelectItem value="1year">1 năm</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => handleExport(activeTab)} disabled={loading}>
        <FileDown className="w-4 h-4 mr-2" />
        Xuất báo cáo
      </Button>
    </div>
  )

  return (
    <div className="p-6">
      <PageHeader
        title="Báo cáo & Thống kê"
        description="Phân tích dữ liệu kinh doanh và hiệu suất realtime"
        actions={headerActions}
      />

      <KPISection kpis={reportData.kpis} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Tổng quan</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Bán hàng</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center space-x-2">
            <Package className="w-4 h-4" />
            <span>Kho hàng</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Tài chính</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Xu hướng doanh thu" icon={TrendingUp} iconColor="text-blue-600" delay={0.2}>
              <div className="space-y-4">
                {reportData.monthlySales.slice(-6).map((data: any) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">T{data.month.split("-")[1]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{data.revenue.toLocaleString()} ₫</p>
                        <p className="text-sm text-gray-500">{data.orders} đơn hàng</p>
                      </div>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(data.revenue / Math.max(...reportData.monthlySales.map((d: any) => d.revenue))) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Phân khúc khách hàng" icon={Users} iconColor="text-purple-600" delay={0.3}>
              <div className="grid grid-cols-1 gap-4">
                {reportData.customerSegments.map((segment: any, index: number) => (
                  <div key={segment.segment} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{segment.segment}</h3>
                      <p className="text-sm text-gray-600">{segment.count} khách hàng</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{segment.percentage}%</div>
                      <p className="text-sm text-gray-500">{segment.revenue.toLocaleString()} ₫</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <SalesAnalytics reportData={reportData} />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryAnalytics reportData={reportData} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialAnalytics reportData={reportData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
