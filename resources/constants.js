export const profileImageBaseUrl = process.env.IMAGE_BASE_URL || "https://pub-78c3b0ef114642b8859d4d64c75e96c3.r2.dev"

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
