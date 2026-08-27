
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = Number(payload.exp);

    if (!Number.isFinite(exp)) {
      return false;
    }

    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
