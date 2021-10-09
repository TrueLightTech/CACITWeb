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

export function numberWithCommas(amount) {
  return (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
}


