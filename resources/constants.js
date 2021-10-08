export const profileImageBaseUrl = "https://caciapi.fra1.digitaloceanspaces.com"

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

export function numberWithCommas(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
