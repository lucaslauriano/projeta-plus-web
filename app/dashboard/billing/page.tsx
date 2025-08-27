"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PricingPlans } from "@/components/pricing-plans"
import { CreditCard, ExternalLink, CheckCircle, XCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<"basic" | "pro" | "enterprise" | null>("pro") // Mock current plan
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")

  const handleManageBilling = async () => {
    try {
      setLoading(true)

      // In a real app, you'd get the customer ID from your database
      const mockCustomerId = "cus_mock_customer_id"

      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: mockCustomerId }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-sans">Billing</h1>
            <p className="text-muted-foreground font-serif">Manage your subscription and billing information</p>
          </div>
        </div>

        {/* Success/Cancel Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment successful! Your subscription has been activated.
            </AlertDescription>
          </Alert>
        )}

        {canceled && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <XCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Payment was canceled. You can try again anytime.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Current Subscription</CardTitle>
            <CardDescription className="font-serif">Your active billing plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-primary">
                    {currentPlan ? currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1) : "Free"} Plan
                  </Badge>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground font-serif">
                  {currentPlan === "pro" && "Next billing date: January 15, 2025"}
                  {currentPlan === "basic" && "Next billing date: January 15, 2025"}
                  {currentPlan === "enterprise" && "Next billing date: January 15, 2025"}
                  {!currentPlan && "No active subscription"}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleManageBilling} disabled={loading}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Billing
                </Button>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Payment Method</CardTitle>
            <CardDescription className="font-serif">Your default payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-16 items-center justify-center rounded border bg-muted">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium font-serif">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleManageBilling} disabled={loading}>
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Billing History</CardTitle>
            <CardDescription className="font-serif">Your recent invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Dec 15, 2024", amount: "$299.00", status: "Paid", invoice: "INV-001" },
                { date: "Nov 15, 2024", amount: "$299.00", status: "Paid", invoice: "INV-002" },
                { date: "Oct 15, 2024", amount: "$299.00", status: "Paid", invoice: "INV-003" },
                { date: "Sep 15, 2024", amount: "$299.00", status: "Paid", invoice: "INV-004" },
              ].map((payment, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium font-serif">{payment.date}</p>
                    <p className="text-sm text-muted-foreground">{payment.invoice}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-medium font-sans">{payment.amount}</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {payment.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div>
          <h2 className="text-2xl font-bold font-sans mb-4">Available Plans</h2>
          <p className="text-muted-foreground font-serif mb-6">Upgrade or downgrade your plan anytime</p>
          <PricingPlans currentPlan={currentPlan || undefined} />
        </div>
      </div>
    </DashboardLayout>
  )
}
