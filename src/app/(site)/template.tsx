/**
 * Subtle fade between pages. Templates re-mount on every navigation, so this
 * CSS animation replays each time. Being CSS-only, it runs before JavaScript
 * loads and never delays the first paint.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>
}
