"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvoiceDetails } from "@/components/invoice-details"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Search, Filter, Download, Eye, Plus } from "lucide-react"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock invoice data
  const mockInvoices = [
    {
      id: "in_mock_1",
      number: "INV-001",
      status: "paid" as const,
      amount: 29900,
      currency: "usd",
      created: "Dec 15, 2024",
      dueDate: "Dec 30, 2024",
      paidAt: "Dec 16, 2024",
      description: "Pro Plan Subscription",
      customerEmail: "user@example.com",
      lineItems: [
        {
          description: "Pro Plan - Monthly Subscription",
          quantity: 1,
          unitAmount: 29900,
          amount: 29900,
        },
      ],
    },
    {
      id: "in_mock_2",
      number: "INV-002",
      status: "open" as const,
      amount: 29900,
      currency: "usd",
      created: "Nov 15, 2024",
      dueDate: "Nov 30, 2024",
      description: "Pro Plan Subscription",
      customerEmail: "user@example.com",
      lineItems: [
        {
          description: "Pro Plan - Monthly Subscription",
          quantity: 1,
          unitAmount: 29900,
          amount: 29900,
        },
      ],
    },
    {
      id: "in_mock_3",
      number: "INV-003",
      status: "paid" as const,
      amount: 29900,
      currency: "usd",
      created: "Oct 15, 2024",
      dueDate: "Oct 30, 2024",
      paidAt: "Oct 16, 2024",
      description: "Pro Plan Subscription",
      customerEmail: "user@example.com",
      lineItems: [
        {
          description: "Pro Plan - Monthly Subscription",
          quantity: 1,
          unitAmount: 29900,
          amount: 29900,
        },
      ],
    },
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInvoices(mockInvoices)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "open":
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "void":
        return <Badge variant="destructive">Void</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100)
  }

  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-sans">Invoices</h1>
            <p className="text-muted-foreground font-serif">Manage your billing history and invoices</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">{invoices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Paid Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {invoices.filter((inv: any) => inv.status === "paid").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Outstanding</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {invoices.filter((inv: any) => inv.status === "open").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Total Revenue</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">
                {formatCurrency(invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Invoice History</CardTitle>
            <CardDescription className="font-serif">Filter and search your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoice List */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground font-serif">Loading invoices...</p>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground font-serif">No invoices found</p>
                </div>
              ) : (
                filteredInvoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium font-serif">{invoice.number}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">Created: {invoice.created}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium font-sans">{formatCurrency(invoice.amount)}</p>
                        <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="font-sans">Invoice Details</DialogTitle>
                              <DialogDescription className="font-serif">
                                Complete invoice information and actions
                              </DialogDescription>
                            </DialogHeader>
                            {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} />}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
