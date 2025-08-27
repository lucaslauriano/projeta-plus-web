import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")!

    let event: any

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        console.log("Checkout session completed:", session.id)
        // Here you would typically save the subscription to your database
        break

      case "customer.subscription.created":
        const subscription = event.data.object
        console.log("Subscription created:", subscription.id)
        // Handle new subscription
        break

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object
        console.log("Subscription updated:", updatedSubscription.id)
        // Handle subscription changes
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object
        console.log("Subscription deleted:", deletedSubscription.id)
        // Handle subscription cancellation
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object
        console.log("Payment succeeded:", invoice.id)
        // Handle successful payment
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object
        console.log("Payment failed:", failedInvoice.id)
        // Handle failed payment
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
