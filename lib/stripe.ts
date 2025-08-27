import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
})

export const PLANS = {
  basic: {
    name: "Basic",
    description: "Perfect for small teams",
    price: 9900, // $99.00 in cents
    priceId: "price_basic", // Replace with actual Stripe price ID
    features: ["Up to 5 users", "10GB storage", "Basic support"],
  },
  pro: {
    name: "Pro",
    description: "Best for growing businesses",
    price: 29900, // $299.00 in cents
    priceId: "price_pro", // Replace with actual Stripe price ID
    features: ["Up to 25 users", "100GB storage", "Priority support", "Advanced analytics"],
  },
  enterprise: {
    name: "Enterprise",
    description: "For large organizations",
    price: 99900, // $999.00 in cents
    priceId: "price_enterprise", // Replace with actual Stripe price ID
    features: ["Unlimited users", "1TB storage", "24/7 support", "Custom integrations"],
  },
} as const

export type PlanType = keyof typeof PLANS
