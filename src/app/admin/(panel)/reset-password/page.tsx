"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { authInputClass } from "../../auth-card"

/** Choose a new password (reached from the reset email, or the sidebar). */
export default function ResetPasswordPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get("password"))
    if (password.length < 10) return setError("Use at least 10 characters.")
    if (password !== form.get("confirm")) return setError("Passwords don't match.")

    setPending(true)
    const { error } = await createBrowserSupabase().auth.updateUser({ password })
    setPending(false)
    if (error) return setError(error.message)
    toast.success("Password updated")
    router.push("/admin")
  }

  return (
    <div className="max-w-md">
      <h1 className="font-heading text-4xl text-cream">Change password</h1>
      <p className="mt-2 text-sm text-taupe">Use at least 10 characters. A passphrase is best.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-md border border-gold/15 bg-card p-6">
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs text-cream/80">
            New password
          </label>
          <input id="password" name="password" type="password" autoComplete="new-password" required className={authInputClass} />
        </div>
        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-xs text-cream/80">
            Confirm new password
          </label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className={authInputClass} />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" aria-hidden="true" />}
          Update password
        </Button>
      </form>
    </div>
  )
}
