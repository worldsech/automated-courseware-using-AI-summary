import { AdminSetup } from "@/components/admin-setup"

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Setup</h1>
          <p className="text-muted-foreground">Create the first administrator account for your platform</p>
        </div>
        <AdminSetup />
      </div>
    </div>
  )
}
