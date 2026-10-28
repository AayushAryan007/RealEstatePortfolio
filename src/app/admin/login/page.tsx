import type { Metadata } from "next"
import { Suspense } from "react"

import { AuthCard } from "../auth-card"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Sign in" }

export default function LoginPage() {
  return (
    <AuthCard title="Admin sign in" description="Gupta Properties dashboard">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
