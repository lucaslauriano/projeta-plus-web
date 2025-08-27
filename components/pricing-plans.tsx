"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from "lucide-react"
import { PLANS, type PlanType } from "@/lib/stripe"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PricingPlansProps {
  currentPlan?: PlanType
}

export function PricingPlans({ currentPlan }: PricingPlansProps) {
  const [loading, setLoading] = useState<PlanType | null>(null)

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

      const { sessionId } = await response.json()

      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {Object.entries(PLANS).map(([key, plan]) => {
        const planKey = key as PlanType
        const isCurrentPlan = currentPlan === planKey
        const isPopular = planKey === "pro"

        return (
          <Card key={planKey} className={`relative ${isPopular ? "border-primary" : ""}`}>
            {isPopular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">Most Popular</Badge>}
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
  )
}
