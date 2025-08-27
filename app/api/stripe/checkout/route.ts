import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { stripe, PLANS, type PlanType } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planType } = await req.json()

    if (!planType || !(planType in PLANS)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    const plan = PLANS[planType as PlanType]

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer_email: undefined, // Clerk will provide this
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.price,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.nextUrl.origin}/dashboard/billing?success=true`,
      cancel_url: `${req.nextUrl.origin}/dashboard/billing?canceled=true`,
      metadata: {
        userId,
        planType,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Error creating checkout session" }, { status: 500 })
  }
}
