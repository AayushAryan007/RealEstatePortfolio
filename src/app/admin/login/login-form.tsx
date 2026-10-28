"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createBrowserSupabase } from "@/lib/supabase/browser"
import { authInputClass } from "../auth-card"

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, setPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(
    params.get("error") === "not-admin" ? "This account doesn't have admin access." : "",
  )

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError("")

    const { error } = await createBrowserSupabase().auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    })

    if (error) {
      setPending(false)
      setError(error.message === "Invalid login credentials" ? "Wrong email or password." : error.message)
      return
    }
    // Only allow internal redirects.
    const next = params.get("next")
    router.replace(next?.startsWith("/admin") ? next : "/admin")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs text-cream/80">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className={authInputClass} />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="text-xs text-cream/80">
            Password
          </label>
          <Link href="/admin/forgot-password" className="text-xs text-gold hover:text-gold-light">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${authInputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-taupe hover:text-cream"
          >
            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xs border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2Icon className="animate-spin" aria-hidden="true" />}
        Sign in
      </Button>
    </form>
  )
}
