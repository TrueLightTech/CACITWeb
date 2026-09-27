export const profileImageBaseUrl = process.env.IMAGE_BASE_URL || "https://pub-78c3b0ef114642b8859d4d64c75e96c3.r2.dev"

/**
 * A stored picture as something an <img> can load. Pictures saved before
 * Cloudflare Images are R2 keys relative to the public bucket; newer ones are
 * full imagedelivery.net URLs and are used as they are.
 */
export function storedImageUrl (stored) {
  if (!stored) { return stored }
  if (/^https?:\/\//i.test(stored)) { return stored }
  return `${profileImageBaseUrl}/${String(stored).replace(/^\/+/, '')}`
}

const systemRoles = [
  {
    id: "1",
    name: "Church Manager"
  },
  {
    id: "2",
    name: "Family Group Manager"
  },
  {
    id: "3",
    name: "Regular Member"
  }
]

export function numberWithCommas(amount) {
  return (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
}
