import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SubscriptionManagement } from "@/components/subscription-management"
import { Users, Plus, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react"

export default function SubscriptionsPage() {
  // Mock current user's subscription data
  const userSubscription = {
    id: "sub_mock_subscription",
    status: "active" as const,
    currentPlan: "pro" as const,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: "January 15, 2025",
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-sans">Subscriptions</h1>
            <p className="text-muted-foreground font-serif">Manage your subscription and view customer data</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>

        {/* User's Subscription Management */}
        <div>
          <h2 className="text-xl font-bold font-sans mb-4">Your Subscription</h2>
          <SubscriptionManagement subscription={userSubscription} />
        </div>

        {/* Subscription Analytics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">1,234</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +8% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Churned This Month</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">23</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                -12% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-serif">Trial Conversions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-sans">67%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +5% from last month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Subscriptions List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-sans">Customer Subscriptions</CardTitle>
            <CardDescription className="font-serif">Overview of all customer subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  customer: "Acme Corp",
                  plan: "Pro",
                  status: "Active",
                  amount: "$299/mo",
                  nextBilling: "Dec 15, 2024",
                  teamMembers: 12,
                },
                {
                  customer: "TechStart Inc",
                  plan: "Basic",
                  status: "Active",
                  amount: "$99/mo",
                  nextBilling: "Dec 18, 2024",
                  teamMembers: 3,
                },
                {
                  customer: "Design Co",
                  plan: "Pro",
                  status: "Past Due",
                  amount: "$299/mo",
                  nextBilling: "Dec 10, 2024",
                  teamMembers: 8,
                },
                {
                  customer: "Dev Agency",
                  plan: "Enterprise",
                  status: "Active",
                  amount: "$999/mo",
                  nextBilling: "Dec 20, 2024",
                  teamMembers: 45,
                },
                {
                  customer: "Startup LLC",
                  plan: "Basic",
                  status: "Trial",
                  amount: "$99/mo",
                  nextBilling: "Dec 25, 2024",
                  teamMembers: 2,
                },
              ].map((subscription, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium font-serif">{subscription.customer}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-muted-foreground">{subscription.plan} Plan</p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">{subscription.teamMembers} members</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium font-sans">{subscription.amount}</p>
                      <p className="text-sm text-muted-foreground">Next: {subscription.nextBilling}</p>
                    </div>
                    <Badge
                      variant={
                        subscription.status === "Active"
                          ? "default"
                          : subscription.status === "Trial"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {subscription.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
