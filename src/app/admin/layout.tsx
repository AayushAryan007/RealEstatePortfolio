import type { Metadata } from "next"

import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Gupta Properties" },
  robots: { index: false, follow: false },
}

/** Admin area: no public chrome, no cursor effects, no animations. */
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
