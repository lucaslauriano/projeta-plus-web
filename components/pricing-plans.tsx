"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, ExternalLink, Copy } from "lucide-react"
import { PLANS, type PlanType } from "@/lib/stripe"
import { loadStripe } from "@stripe/stripe-js"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingPlansProps {
  currentPlan?: PlanType
}

export function PricingPlans({ currentPlan }: PricingPlansProps) {
  const [loading, setLoading] = useState<PlanType | null>(null)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)

  const handleSubscribe = async (planType: PlanType) => {
    try {
      setLoading(planType)

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType }),
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { sessionId } = await response.json()
      const fullCheckoutUrl = `https://checkout.stripe.com/c/pay/${sessionId}`

      const stripe = await stripePromise
      if (stripe) {
        try {
          const { error } = await stripe.redirectToCheckout({ sessionId })
          if (error) {
            console.error("Stripe redirect error:", error)
            setCheckoutUrl(fullCheckoutUrl)
            setShowCheckoutDialog(true)
          }
        } catch (redirectError) {
          console.error("Redirect failed, showing checkout URL:", redirectError)
          setCheckoutUrl(fullCheckoutUrl)
          setShowCheckoutDialog(true)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("There was an error processing your request. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert("Checkout URL copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {Object.entries(PLANS).map(([key, plan]) => {
          const planKey = key as PlanType
          const isCurrentPlan = currentPlan === planKey
          const isPopular = planKey === "pro"

          return (
            <Card key={planKey} className={`relative ${isPopular ? "border-primary" : ""}`}>
              {isPopular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="font-sans">{plan.name}</CardTitle>
                <CardDescription className="font-serif">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold font-sans">${plan.price / 100}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm font-serif">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : "default"}
                  disabled={isCurrentPlan || loading === planKey}
                  onClick={() => handleSubscribe(planKey)}
                >
                  {loading === planKey && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrentPlan ? "Current Plan" : `Subscribe to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout URL Ready</DialogTitle>
            <DialogDescription>
              Due to preview environment restrictions, we can't automatically redirect you to Stripe checkout. Please
              copy the URL below and open it in a new tab to complete your subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    readOnly
                    value={checkoutUrl || ""}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button size="sm" onClick={() => checkoutUrl && copyToClipboard(checkoutUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
                Close
              </Button>
              <Button
                onClick={() => checkoutUrl && window.open(checkoutUrl, "_blank")}
                className="flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open Checkout</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
