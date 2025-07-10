"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  User,
  CreditCard,
  Banknote,
  Monitor,
  Smartphone,
  Trash2,
  Calculator,
  Receipt,
  UserPlus,
  Gift,
} from "lucide-react"
import { useProducts } from "@/hooks/use-products"
import { motion, AnimatePresence } from "framer-motion"

interface CartItem {
  productId: number
  productCode: string
  productName: string
  price: number
  quantity: number
  discount: number
  total: number
  unit: string
  stock: number
}

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  loyaltyPoints: number
  membershipLevel: "bronze" | "silver" | "gold" | "platinum"
}

interface POSInterfaceProps {
  customers: Customer[]
  onCreateSale: (saleData: any) => Promise<{ success: boolean; error?: string }>
  onAddCustomer: (customerData: any) => Promise<{ success: boolean; data?: Customer; error?: string }>
}

export function POSInterface({ customers, onCreateSale, onAddCustomer }: POSInterfaceProps) {
  const { products } = useProducts()
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash")
  const [saleType, setSaleType] = useState<"offline" | "online">("offline")
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount")
  const [cashReceived, setCashReceived] = useState(0)
  const [notes, setNotes] = useState("")
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "", address: "" })
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredProducts = products.filter(
    (product) =>
      product.status === "active" &&
      product.stock > 0 &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)),
  )

  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  total: (item.quantity + 1) * item.price * (1 - item.discount / 100),
                }
              : item,
          ),
        )
      }
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          price: product.price,
          quantity: 1,
          discount: 0,
          total: product.price,
          unit: product.unit,
          stock: product.stock,
        },
      ])
    }
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.productId !== productId))
    } else {
      const item = cart.find((item) => item.productId === productId)
      if (item && newQuantity <= item.stock) {
        setCart(
          cart.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: newQuantity,
                  total: newQuantity * item.price * (1 - item.discount / 100),
                }
              : item,
          ),
        )
      }
    }
  }

  const updateItemDiscount = (productId: number, discountPercent: number) => {
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              discount: Math.max(0, Math.min(100, discountPercent)),
              total: item.quantity * item.price * (1 - Math.max(0, Math.min(100, discountPercent)) / 100),
            }
          : item,
      ),
    )
  }

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const getDiscountAmount = () => {
    const subtotal = getSubtotal()
    return discountType === "percent" ? (subtotal * discount) / 100 : discount
  }

  const getTotalAmount = () => {
    return Math.max(0, getSubtotal() - getDiscountAmount())
  }

  const getChangeAmount = () => {
    return paymentMethod === "cash" ? Math.max(0, cashReceived - getTotalAmount()) : 0
  }

  const getLoyaltyPointsEarned = () => {
    return Math.floor(getTotalAmount() / 1000)
  }

  const getMembershipDiscount = () => {
    if (!selectedCustomer) return 0
    const discountRates = { bronze: 0, silver: 2, gold: 5, platinum: 10 }
    return (getSubtotal() * discountRates[selectedCustomer.membershipLevel]) / 100
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return

    const result = await onAddCustomer(newCustomer)
    if (result.success && result.data) {
      setSelectedCustomer(result.data)
      setNewCustomer({ name: "", phone: "", email: "", address: "" })
      setShowNewCustomerForm(false)
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    setIsProcessing(true)
    try {
      const saleData = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        customerAddress: selectedCustomer?.address,
        saleType,
        items: cart.map((item) => ({
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount,
          total: item.total,
          unit: item.unit,
        })),
        subtotal: getSubtotal(),
        discount: getDiscountAmount() + getMembershipDiscount(),
        tax: 0,
        totalAmount: getTotalAmount() - getMembershipDiscount(),
        paymentMethod,
        paymentStatus: paymentMethod === "cash" && cashReceived >= getTotalAmount() ? "paid" : "pending",
        status: "completed",
        cashReceived: paymentMethod === "cash" ? cashReceived : undefined,
        changeAmount: getChangeAmount(),
        notes,
        createdBy: "Current User", // Should be from auth context
        processedBy: "Current User",
      }

      const result = await onCreateSale(saleData)
      if (result.success) {
        // Reset form
        setCart([])
        setSelectedCustomer(null)
        setDiscount(0)
        setCashReceived(0)
        setNotes("")
        alert(`Đơn hàng ${saleType === "online" ? "online" : "tại quầy"} đã được xử lý thành công!`)
      } else {
        alert(result.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      alert("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsProcessing(false)
    }
  }

  // Auto-calculate change when cash received changes
  useEffect(() => {
    if (paymentMethod === "cash" && cashReceived > 0) {
      // Auto-set cash received to total if it's less
      if (cashReceived < getTotalAmount()) {
        setCashReceived(getTotalAmount())
      }
    }
  }, [paymentMethod, cashReceived])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search & Cart */}
      <div className="lg:col-span-2 space-y-6">
        {/* Sale Type */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
              Loại bán hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={saleType} onValueChange={(value) => setSaleType(value as "offline" | "online")}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="offline" className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4" />
                  <span>Bán tại quầy</span>
                </TabsTrigger>
                <TabsTrigger value="online" className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Bán online</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Product Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-blue-600" />
              Tìm kiếm Sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm theo tên, mã sản phẩm hoặc mã vạch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-all bg-white cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">Mã: {product.code}</p>
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">{product.price.toLocaleString()} ₫</span>
                      <span className="text-sm text-gray-500">Tồn: {product.stock}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Cart Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                Giỏ hàng ({cart.length})
              </span>
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setCart([])}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Giỏ hàng trống</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{item.productName}</h4>
                        <p className="text-xs text-gray-600">
                          {item.price.toLocaleString()} ₫ x {item.quantity} {item.unit}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateItemDiscount(item.productId, Number(e.target.value))}
                            className="w-16 h-6 text-xs"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                          <span className="text-xs text-gray-500">% giảm</span>
                        </div>
                        <p className="text-sm font-semibold text-green-600 mt-1">{item.total.toLocaleString()} ₫</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer & Checkout */}
      <div className="space-y-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin Khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCustomer ? (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-blue-900">{selectedCustomer.name}</p>
                    <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          selectedCustomer.membershipLevel === "platinum"
                            ? "bg-purple-100 text-purple-800"
                            : selectedCustomer.membershipLevel === "gold"
                              ? "bg-yellow-100 text-yellow-800"
                              : selectedCustomer.membershipLevel === "silver"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {selectedCustomer.membershipLevel.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-blue-600">
                        <Gift className="w-3 h-3 inline mr-1" />
                        {selectedCustomer.loyaltyPoints} điểm
                      </span>
                    </div>
                    {getMembershipDiscount() > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Giảm giá thành viên: -{getMembershipDiscount().toLocaleString()} ₫
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)} className="text-blue-600">
                    Thay đổi
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Select
                  onValueChange={(value) => {
                    const customer = customers.find((c) => c.id.toString() === value)
                    setSelectedCustomer(customer || null)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {customer.name} - {customer.phone}
                          </span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {customer.membershipLevel}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!showNewCustomerForm ? (
                  <Button variant="ghost" className="w-full text-blue-600" onClick={() => setShowNewCustomerForm(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Thêm khách hàng mới
                  </Button>
                ) : (
                  <div className="space-y-3 p-3 border rounded-lg">
                    <Input
                      placeholder="Tên khách hàng *"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    />
                    <Input
                      placeholder="Số điện thoại *"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                    <Input
                      placeholder="Địa chỉ"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleAddCustomer} disabled={!newCustomer.name || !newCustomer.phone}>
                        Thêm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowNewCustomerForm(false)
                          setNewCustomer({ name: "", phone: "", email: "", address: "" })
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checkout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-blue-600" />
              Thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Discount */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Giảm giá</Label>
              <div className="flex space-x-2">
                <Select value={discountType} onValueChange={(value) => setDiscountType(value as "amount" | "percent")}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">₫</SelectItem>
                    <SelectItem value="percent">%</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Phương thức thanh toán</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("cash")}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <Banknote className="w-4 h-4 mb-1" />
                  <span className="text-xs">Tiền mặt</span>
                </Button>
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("card")}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span className="text-xs">Thẻ</span>
                </Button>
                <Button
                  variant={paymentMethod === "transfer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("transfer")}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span className="text-xs">Chuyển khoản</span>
                </Button>
              </div>
            </div>

            {/* Cash Received */}
            {paymentMethod === "cash" && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Tiền nhận</Label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  placeholder="0"
                  className="text-right font-semibold"
                />
              </div>
            )}

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Ghi chú</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú đơn hàng..."
                rows={2}
              />
            </div>

            <Separator />

            {/* Calculation Summary */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{getSubtotal().toLocaleString()} ₫</span>
              </div>
              {getDiscountAmount() > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-red-600">-{getDiscountAmount().toLocaleString()} ₫</span>
                </div>
              )}
              {getMembershipDiscount() > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Giảm giá thành viên:</span>
                  <span className="text-green-600">-{getMembershipDiscount().toLocaleString()} ₫</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-lg font-semibold text-gray-900">Tổng cộng:</span>
                <span className="text-xl font-bold text-green-600">
                  {(getTotalAmount() - getMembershipDiscount()).toLocaleString()} ₫
                </span>
              </div>
              {paymentMethod === "cash" && cashReceived > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Tiền thừa:</span>
                  <span className="font-semibold text-blue-600">{getChangeAmount().toLocaleString()} ₫</span>
                </div>
              )}
              {selectedCustomer && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Điểm tích lũy:</span>
                  <span className="font-semibold text-purple-600">+{getLoyaltyPointsEarned()} điểm</span>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              onClick={handleCheckout}
              disabled={
                cart.length === 0 ||
                isProcessing ||
                (paymentMethod === "cash" && cashReceived < getTotalAmount() - getMembershipDiscount())
              }
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </div>
              ) : (
                <>
                  <Receipt className="w-5 h-5 mr-2" />
                  {saleType === "online" ? "Tạo đơn hàng online" : "Thanh toán"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
