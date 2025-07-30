export function isAdminTokenValid() {
  const token = localStorage.getItem("admin-token");
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    console.error("Invalid admin token:", e);
    return false;
  }
}