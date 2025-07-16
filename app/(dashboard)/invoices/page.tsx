"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, DollarSign, Clock, RefreshCw, Plus, Eye } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { PageHeader } from "@/components/ui/page-header";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { InvoiceFilterControls } from "@/components/ui/invoice-filter-controls";
import { InvoiceFormModal } from "@/components/ui/invoice-form-modal";
import { InvoiceDetailsModal } from "@/components/ui/invoice-details-modal";
import { useInvoices, type Invoice } from "@/hooks/use-invoices";
import DataTable from "@/components/ui/data-table";

export default function InvoicesPage() {
  const {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updatePaymentStatus,
    refundInvoice,
    getInvoiceStats,
  } = useInvoices();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [saleTypeFilter, setSaleTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [createdByFilter, setCreatedByFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const stats = getInvoiceStats();

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.invoiceNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerPhone.includes(searchTerm);

      const matchesSaleType =
        saleTypeFilter === "all" || invoice.saleType === saleTypeFilter;
      const matchesStatus =
        statusFilter === "all" || invoice.status === statusFilter;
      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        invoice.paymentStatus === paymentStatusFilter;
      const matchesCreatedBy =
        createdByFilter === "all" || invoice.createdBy === createdByFilter;

      const matchesDateRange =
        (!dateRange.from ||
          new Date(invoice.createdAt) >= new Date(dateRange.from)) &&
        (!dateRange.to ||
          new Date(invoice.createdAt) <= new Date(dateRange.to + "T23:59:59"));

      return (
        matchesSearch &&
        matchesSaleType &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesCreatedBy &&
        matchesDateRange
      );
    });
  }, [
    invoices,
    searchTerm,
    saleTypeFilter,
    statusFilter,
    paymentStatusFilter,
    createdByFilter,
    dateRange,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setSaleTypeFilter("all");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setCreatedByFilter("all");
    setDateRange({ from: "", to: "" });
  };

  const handleAdd = () => {
    setSelectedInvoice(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormModalOpen(true);
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (
    invoiceData: Omit<
      Invoice,
      "id" | "invoiceNumber" | "createdAt" | "updatedAt"
    >
  ) => {
    if (selectedInvoice) {
      await updateInvoice(selectedInvoice.id, invoiceData);
    } else {
      await createInvoice(invoiceData);
    }
    setIsFormModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedInvoice) {
      await deleteInvoice(selectedInvoice.id);
      setIsDeleteModalOpen(false);
      setSelectedInvoice(null);
    }
  };

  const handlePaymentUpdate = async (
    id: string,
    status: Invoice["paymentStatus"]
  ) => {
    await updatePaymentStatus(id, status);
  };

  const handleRefund = async (id: string, amount: number, reason: string) => {
    await refundInvoice(id, amount, reason);
  };

  const handleExport = () => {
    console.log("Export invoices:", filteredInvoices);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const invoiceColumns = [
    {
      key: "invoiceNumber" as const,
      label: "Số hóa đơn",
      sortable: true,
      render: (value: string, row: Invoice) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-blue-600 font-semibold">{value}</span>
          {new Date().getTime() - new Date(row.createdAt).getTime() <
            30 * 60 * 1000 && (
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
              title="Hóa đơn mới"
            />
          )}
        </div>
      ),
    },
    {
      key: "customerName" as const,
      label: "Khách hàng",
      sortable: true,
      render: (value: string, row: Invoice) => (
        <div>
          <span className="font-medium">{value}</span>
          <p className="text-sm text-gray-500">{row.customerPhone}</p>
        </div>
      ),
    },
    {
      key: "saleType" as const,
      label: "Loại bán",
      render: (value: string) => (
        <Badge
          variant="outline"
          className={
            value === "online"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-green-50 text-green-700 border-green-200"
          }
        >
          {value === "online" ? "Online" : "Tại quầy"}
        </Badge>
      ),
    },
    {
      key: "totalAmount" as const,
      label: "Tổng tiền",
      sortable: true,
      render: (value: number) => (
        <span className="font-semibold text-green-600">
          {value.toLocaleString()} ₫
        </span>
      ),
    },
    {
      key: "paymentMethod" as const,
      label: "Thanh toán",
      render: (value: string) => (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          {value === "cash"
            ? "Tiền mặt"
            : value === "card"
            ? "Thẻ"
            : "Chuyển khoản"}
        </Badge>
      ),
    },
    {
      key: "paymentStatus" as const,
      label: "TT Thanh toán",
      render: (value: string) => {
        const statusConfig = {
          paid: {
            label: "Đã thanh toán",
            className: "bg-green-100 text-green-800",
          },
          pending: {
            label: "Chờ thanh toán",
            className: "bg-yellow-100 text-yellow-800",
          },
          failed: { label: "Thất bại", className: "bg-red-100 text-red-800" },
          refunded: {
            label: "Đã hoàn tiền",
            className: "bg-purple-100 text-purple-800",
          },
        };
        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.pending;

        return (
          <Badge variant="secondary" className={config.className}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "status" as const,
      label: "Trạng thái",
      render: (value: string) => {
        const statusConfig = {
          draft: { label: "Nháp", className: "bg-gray-100 text-gray-800" },
          completed: {
            label: "Hoàn thành",
            className: "bg-green-100 text-green-800",
          },
          cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-800" },
          refunded: {
            label: "Đã hoàn tiền",
            className: "bg-purple-100 text-purple-800",
          },
        };
        const config =
          statusConfig[value as keyof typeof statusConfig] ||
          statusConfig.completed;

        return (
          <Badge variant="secondary" className={config.className}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "createdAt" as const,
      label: "Thời gian",
      sortable: true,
      render: (value: string) => (
        <div>
          <span className="text-sm">
            {new Date(value).toLocaleString("vi-VN")}
          </span>
          <p className="text-xs text-gray-500">{getRelativeTime(value)}</p>
        </div>
      ),
    },
  ];

  const statsCards = [
    {
      title: "Tổng hóa đơn",
      value: stats.total.toString(),
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: `${stats.todayCount} hóa đơn hôm nay`,
    },
    {
      title: "Doanh thu hôm nay",
      value: `${stats.todayRevenue.toLocaleString()} ₫`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${stats.completed} đã hoàn thành`,
    },
    {
      title: "Chờ thanh toán",
      value: stats.pending.toString(),
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: `${stats.overdue} quá hạn`,
    },
    {
      title: "Đã hoàn tiền",
      value: stats.refunded.toString(),
      icon: RefreshCw,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: `${stats.cancelled} đã hủy`,
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Quản lý Hóa đơn"
        description="Tạo, chỉnh sửa và theo dõi hóa đơn bán hàng"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo hóa đơn
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Filters */}
      <InvoiceFilterControls
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        saleTypeFilter={saleTypeFilter}
        setSaleTypeFilter={setSaleTypeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        setPaymentStatusFilter={setPaymentStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        createdByFilter={createdByFilter}
        setCreatedByFilter={setCreatedByFilter}
        onReset={resetFilters}
      />

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <DataTable
          title="Danh sách Hóa đơn"
          data={filteredInvoices}
          columns={invoiceColumns}
          searchPlaceholder="Tìm kiếm hóa đơn..."
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
          customActions={(invoice: Invoice) => (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleView(invoice)}
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
          )}
        />
      </motion.div>

      {/* Modals */}
      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleFormSubmit}
        invoice={selectedInvoice}
        isLoading={isLoading}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
        onEdit={handleEdit}
        onUpdatePayment={handlePaymentUpdate}
        onRefund={handleRefund}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedInvoice(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xóa hóa đơn"
        description={`Bạn có chắc chắn muốn xóa hóa đơn ${selectedInvoice?.invoiceNumber}? Hành động này không thể hoàn tác.`}
        isLoading={isLoading}
      />
    </div>
  );
}
