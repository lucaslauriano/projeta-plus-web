import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { stripe } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")

    // In a real app, you'd get the customer ID from your database using userId
    const mockCustomerId = "cus_mock_customer_id"

    const invoicesParams: any = {
      customer: mockCustomerId,
      limit,
    }

    if (status && status !== "all") {
      invoicesParams.status = status
    }

    const invoices = await stripe.invoices.list(invoicesParams)

    return NextResponse.json({ invoices: invoices.data })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Error fetching invoices" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, invoiceId } = await req.json()

    switch (action) {
      case "download":
        const invoice = await stripe.invoices.retrieve(invoiceId)
        return NextResponse.json({ downloadUrl: invoice.invoice_pdf })

      case "retry_payment":
        const paidInvoice = await stripe.invoices.pay(invoiceId)
        return NextResponse.json({ invoice: paidInvoice })

      case "send_invoice":
        const sentInvoice = await stripe.invoices.sendInvoice(invoiceId)
        return NextResponse.json({ invoice: sentInvoice })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Invoice action error:", error)
    return NextResponse.json({ error: "Invoice action failed" }, { status: 500 })
  }
}
