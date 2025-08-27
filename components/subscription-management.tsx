"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PLANS, type PlanType, isStripeConfigured } from "@/lib/stripe"
import { Calendar, Pause, Play, X, ArrowUpDown, AlertTriangle, CheckCircle } from "lucide-react"

interface SubscriptionManagementProps {
  subscription: {
    id: string
    status: "active" | "canceled" | "past_due" | "paused"
    currentPlan: PlanType
    cancelAtPeriodEnd: boolean
    currentPeriodEnd: string
    pausedAt?: string
  }
}

export function SubscriptionManagement({ subscription }: SubscriptionManagementProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(subscription.currentPlan)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false)

  const stripeConfigured = isStripeConfigured()

  const handleSubscriptionAction = async (action: string, additionalData?: any) => {
    if (!stripeConfigured) {
      console.error("Stripe is not configured")
      return
    }

    try {
      setLoading(action)

      const response = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          subscriptionId: subscription.id,
          ...additionalData,
        }),
      })

      if (response.ok) {
        // Refresh the page or update state
        window.location.reload()
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(null)
      setShowCancelDialog(false)
      setShowPlanChangeDialog(false)
    }
  }

  const getStatusBadge = () => {
    switch (subscription.status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "canceled":
        return <Badge variant="destructive">Canceled</Badge>
      case "past_due":
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>
      case "paused":
        return <Badge className="bg-blue-100 text-blue-800">Paused</Badge>
      default:
        return <Badge variant="secondary">{subscription.status}</Badge>
    }
  }

  const currentPlan = PLANS[subscription.currentPlan]

  return (
    <div className="space-y-6">
      {!stripeConfigured && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Stripe is not configured. Subscription management features are disabled.
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-sans">Subscription Details</CardTitle>
              <CardDescription className="font-serif">Manage your current subscription</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium font-serif mb-2">Current Plan</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {currentPlan.name}
                </Badge>
                <span className="text-2xl font-bold font-sans">${currentPlan.price / 100}/mo</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 font-serif">{currentPlan.description}</p>
            </div>

            <div>
              <h4 className="font-medium font-serif mb-2">Billing Cycle</h4>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Next billing: {subscription.currentPeriodEnd}</span>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <Alert className="mt-2 border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Your subscription will cancel on {subscription.currentPeriodEnd}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {subscription.status === "active" && !subscription.cancelAtPeriodEnd && (
              <>
                <Dialog open={showPlanChangeDialog} onOpenChange={setShowPlanChangeDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={!stripeConfigured}>
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Change Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-sans">Change Subscription Plan</DialogTitle>
                      <DialogDescription className="font-serif">
                        Select a new plan. Changes will be prorated and take effect immediately.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={selectedPlan} onValueChange={(value: PlanType) => setSelectedPlan(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PLANS).map(([key, plan]) => (
                            <SelectItem key={key} value={key}>
                              {plan.name} - ${plan.price / 100}/mo
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPlan !== subscription.currentPlan && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            {PLANS[selectedPlan].price > currentPlan.price
                              ? "You'll be charged the prorated difference immediately."
                              : "You'll receive a prorated credit on your next bill."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPlanChangeDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          handleSubscriptionAction("change_plan", { priceId: PLANS[selectedPlan].priceId })
                        }
                        disabled={
                          selectedPlan === subscription.currentPlan || loading === "change_plan" || !stripeConfigured
                        }
                      >
                        {loading === "change_plan" ? "Updating..." : "Change Plan"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => handleSubscriptionAction("pause")}
                  disabled={loading === "pause" || !stripeConfigured}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {loading === "pause" ? "Pausing..." : "Pause Subscription"}
                </Button>

                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive bg-transparent"
                      disabled={!stripeConfigured}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-sans">Cancel Subscription</DialogTitle>
                      <DialogDescription className="font-serif">
                        Are you sure you want to cancel your subscription? You'll continue to have access until{" "}
                        {subscription.currentPeriodEnd}.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                        Keep Subscription
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleSubscriptionAction("cancel")}
                        disabled={loading === "cancel" || !stripeConfigured}
                      >
                        {loading === "cancel" ? "Canceling..." : "Cancel Subscription"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {subscription.cancelAtPeriodEnd && (
              <Button
                variant="default"
                onClick={() => handleSubscriptionAction("reactivate")}
                disabled={loading === "reactivate" || !stripeConfigured}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {loading === "reactivate" ? "Reactivating..." : "Reactivate Subscription"}
              </Button>
            )}

            {subscription.status === "paused" && (
              <Button
                variant="default"
                onClick={() => handleSubscriptionAction("resume")}
                disabled={loading === "resume" || !stripeConfigured}
              >
                <Play className="mr-2 h-4 w-4" />
                {loading === "resume" ? "Resuming..." : "Resume Subscription"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sans">Current Plan Features</CardTitle>
          <CardDescription className="font-serif">What's included in your {currentPlan.name} plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                <span className="font-serif">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
