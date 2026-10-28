"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, PlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { saveSettings } from "@/actions/admin/content"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { SiteSettings } from "@/lib/data/settings"
import type { SettingsKey } from "@/lib/validations/content"
import { cn } from "@/lib/utils"
import { AdminCard, adminInput, adminLabel } from "./ui"

/** Tabbed editor for the editable text blocks on the public site. */
export function ContentEditor({ settings }: { settings: SiteSettings }) {
  return (
    <Tabs defaultValue="contact">
      <TabsList className="mb-6 flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
        {[
          ["contact", "Contact details"],
          ["hero", "Homepage hero"],
          ["about", "About"],
          ["stats", "Stats"],
          ["socials", "Social links"],
        ].map(([value, label]) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-xs border border-input px-4 py-2 data-[state=active]:border-gold data-[state=active]:bg-gold data-[state=active]:text-ink"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="contact">
        <SectionForm settingsKey="contact" initial={settings.contact} fields={[
          { name: "phone", label: "Phone 1 (main)", type: "tel" },
          { name: "phone2", label: "Phone 2 (optional)", type: "tel", hint: "Visitors can pick either number for calls and WhatsApp." },
          { name: "email", label: "Email", type: "email" },
          { name: "address", label: "Office address", multiline: true },
          { name: "hours", label: "Opening hours" },
        ]} />
      </TabsContent>
      <TabsContent value="hero">
        <SectionForm settingsKey="hero" initial={settings.hero} fields={[
          { name: "eyebrow", label: "Small label above the headline" },
          { name: "title", label: "Headline" },
          { name: "subtitle", label: "Sub-heading", multiline: true },
        ]} />
      </TabsContent>
      <TabsContent value="about">
        <SectionForm settingsKey="about" initial={settings.about} fields={[
          { name: "years", label: "Years of experience (badge)", type: "number" },
          { name: "title", label: "Heading" },
          { name: "body", label: "Text", multiline: true, rows: 6 },
        ]} />
      </TabsContent>
      <TabsContent value="stats">
        <StatsForm initial={settings.stats} />
      </TabsContent>
      <TabsContent value="socials">
        <SectionForm settingsKey="socials" initial={settings.socials} fields={[
          { name: "instagram", label: "Instagram URL", type: "url", placeholder: "https://instagram.com/…" },
          { name: "facebook", label: "Facebook URL", type: "url", placeholder: "https://facebook.com/…" },
          { name: "youtube", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/@…" },
          { name: "linkedin", label: "LinkedIn URL", type: "url", placeholder: "https://linkedin.com/…" },
        ]} />
      </TabsContent>
    </Tabs>
  )
}

type FieldDef = { name: string; label: string; type?: string; multiline?: boolean; rows?: number; hint?: string; placeholder?: string }

function useSave(key: SettingsKey) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const save = (value: unknown) =>
    start(async () => {
      const result = await saveSettings(key, value)
      if (result.ok) {
        toast.success("Saved. The website is updated.")
        router.refresh()
      } else toast.error(result.error)
    })
  return { pending, save }
}

function SectionForm({ settingsKey, initial, fields }: { settingsKey: SettingsKey; initial: object; fields: FieldDef[] }) {
  const [values, setValues] = useState<Record<string, string | number>>(initial as Record<string, string | number>)
  const { pending, save } = useSave(settingsKey)

  return (
    <AdminCard>
      <form
        className="max-w-2xl space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          save(values)
        }}
      >
        {fields.map((f) => {
          const id = `${settingsKey}-${f.name}`
          const common = {
            id,
            value: values[f.name] ?? "",
            placeholder: f.placeholder,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [f.name]: e.target.value })),
          }
          return (
            <div key={f.name}>
              <label htmlFor={id} className={adminLabel}>
                {f.label}
              </label>
              {f.multiline ? (
                <textarea {...common} rows={f.rows ?? 3} className={cn(adminInput, "h-auto py-2")} />
              ) : (
                <input {...common} type={f.type ?? "text"} className={adminInput} />
              )}
              {f.hint && <p className="mt-1.5 text-xs text-taupe">{f.hint}</p>}
            </div>
          )
        })}
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <SaveIcon aria-hidden="true" />} Save
        </Button>
      </form>
    </AdminCard>
  )
}

function StatsForm({ initial }: { initial: SiteSettings["stats"] }) {
  const [stats, setStats] = useState(initial)
  const { pending, save } = useSave("stats")
  const update = (i: number, patch: Partial<SiteSettings["stats"][number]>) => setStats((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)))

  return (
    <AdminCard>
      <form
        className="max-w-2xl space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          save(stats)
        }}
      >
        <p className="text-xs text-taupe">Up to 4 numbers shown on the homepage and About page.</p>
        {stats.map((stat, i) => (
          <div key={i} className="grid grid-cols-[1fr_7rem_4rem_auto] items-end gap-2">
            <div>
              <label htmlFor={`stat-label-${i}`} className={adminLabel}>Label</label>
              <input id={`stat-label-${i}`} value={stat.label} onChange={(e) => update(i, { label: e.target.value })} className={adminInput} />
            </div>
            <div>
              <label htmlFor={`stat-value-${i}`} className={adminLabel}>Number</label>
              <input id={`stat-value-${i}`} type="number" value={stat.value} onChange={(e) => update(i, { value: Number(e.target.value) })} className={adminInput} />
            </div>
            <div>
              <label htmlFor={`stat-suffix-${i}`} className={adminLabel}>Suffix</label>
              <input id={`stat-suffix-${i}`} value={stat.suffix} onChange={(e) => update(i, { suffix: e.target.value })} placeholder="+" className={adminInput} />
            </div>
            <button type="button" onClick={() => setStats((s) => s.filter((_, j) => j !== i))} aria-label={`Remove ${stat.label}`} className="grid size-10 place-items-center text-taupe hover:text-destructive">
              <Trash2Icon className="size-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          {stats.length < 4 && (
            <Button type="button" variant="gold" onClick={() => setStats((s) => [...s, { label: "", value: 0, suffix: "+" }])}>
              <PlusIcon aria-hidden="true" /> Add stat
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <SaveIcon aria-hidden="true" />} Save
          </Button>
        </div>
      </form>
    </AdminCard>
  )
}
