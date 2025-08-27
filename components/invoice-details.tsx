"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Mail, CreditCard, Calendar, DollarSign } from "lucide-react"

interface InvoiceDetailsProps {
  invoice: {
    id: string
    number: string
    status: "paid" | "open" | "draft" | "void"
    amount: number
    currency: string
    created: string
    dueDate: string
    paidAt?: string
    description: string
    customerEmail: string
    lineItems: Array<{
      description: string
      quantity: number
      unitAmount: number
      amount: number
    }>
  }
}

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch("/api/stripe/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "download",
          invoiceId: invoice.id,
        }),
      })

      const { downloadUrl } = await response.json()
      window.open(downloadUrl, "_blank")
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  const handleRetryPayment = async () => {
    try {
      await fetch("/api/stripe/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "retry_payment",
          invoiceId: invoice.id,
        }),
      })
      // Refresh or update state
      window.location.reload()
    } catch (error) {
      console.error("Retry payment error:", error)
    }
  }

  const getStatusBadge = () => {
    switch (invoice.status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "open":
        return <Badge className="bg-yellow-100 text-yellow-800">Open</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "void":
        return <Badge variant="destructive">Void</Badge>
      default:
        return <Badge variant="secondary">{invoice.status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency.toUpperCase(),
    }).format(amount / 100)
  }

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-sans">Invoice {invoice.number}</CardTitle>
              <CardDescription className="font-serif">{invoice.description}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium font-serif">Created</p>
                <p className="text-sm text-muted-foreground">{invoice.created}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium font-serif">Due Date</p>
                <p className="text-sm text-muted-foreground">{invoice.dueDate}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium font-serif">Amount</p>
                <p className="text-lg font-bold font-sans">{formatCurrency(invoice.amount)}</p>
              </div>
            </div>
          </div>

          {invoice.paidAt && (
            <div className="flex items-center space-x-2 text-green-600">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-serif">Paid on {invoice.paidAt}</span>
            </div>
          )}

          <div className="flex space-x-2 pt-4 border-t">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>

            {invoice.status === "open" && (
              <Button variant="outline" onClick={handleRetryPayment}>
                <CreditCard className="mr-2 h-4 w-4" />
                Retry Payment
              </Button>
            )}

            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sans">Invoice Details</CardTitle>
          <CardDescription className="font-serif">Breakdown of charges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoice.lineItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium font-serif">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitAmount)}
                  </p>
                </div>
                <p className="font-medium font-sans">{formatCurrency(item.amount)}</p>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between py-2 font-bold">
              <p className="font-sans">Total</p>
              <p className="text-lg font-sans">{formatCurrency(invoice.amount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sans">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-serif">{invoice.customerEmail}</p>
        </CardContent>
      </Card>
    </div>
  )
}
