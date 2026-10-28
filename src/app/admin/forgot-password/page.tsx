"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2Icon, MailCheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { AuthCard, authInputClass } from "../auth-card"

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")
    const email = String(new FormData(event.currentTarget).get("email")).trim()
    const { error } = await createBrowserSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/reset-password`,
    })
    setPending(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <AuthCard title="Reset password" description="We'll email you a secure link.">
      {sent ? (
        <div className="text-center" role="status">
          <MailCheckIcon className="mx-auto size-10 text-gold" strokeWidth={1.25} aria-hidden="true" />
          <p className="mt-3 text-sm text-cream/85">If that email belongs to an admin, a reset link is on its way.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs text-cream/80">
              Admin email
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required className={authInputClass} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2Icon className="animate-spin" aria-hidden="true" />}
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/admin/login" className="text-gold hover:text-gold-light">
          ← Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}
