import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, subscriptionId, priceId } = await req.json()

    switch (action) {
      case "cancel":
        const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })
        return NextResponse.json({ subscription: canceledSubscription })

      case "reactivate":
        const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: false,
        })
        return NextResponse.json({ subscription: reactivatedSubscription })

      case "change_plan":
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
          items: [
            {
              id: subscription.items.data[0].id,
              price: priceId,
            },
          ],
          proration_behavior: "create_prorations",
        })
        return NextResponse.json({ subscription: updatedSubscription })

      case "pause":
        const pausedSubscription = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: {
            behavior: "keep_as_draft",
          },
        })
        return NextResponse.json({ subscription: pausedSubscription })

      case "resume":
        const resumedSubscription = await stripe.subscriptions.update(subscriptionId, {
          pause_collection: null,
        })
        return NextResponse.json({ subscription: resumedSubscription })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Subscription management error:", error)
    return NextResponse.json({ error: "Subscription management failed" }, { status: 500 })
  }
}
