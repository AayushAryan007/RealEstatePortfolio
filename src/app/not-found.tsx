import SiteNotFound from "./(site)/not-found"

/** Unmatched URLs anywhere get the same branded 404 as the public site. */
export default function NotFound() {
  return <SiteNotFound />
}
