export type UserRole =
  | 'ADMIN'
  | 'AGENT';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

interface JwtPayload {
  sub?: string;
  id?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
  name?: string;
}

export function getAccessToken():
  string | null {
  return localStorage.getItem(
    'accessToken',
  );
}

export function decodeToken(
  token: string,
): JwtPayload | null {
  try {
    const parts =
      token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const base64 =
      parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const decoded =
      decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map(
            (char) =>
              `%${(
                '00' +
                char
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)}`,
          )
          .join(''),
      );

    return JSON.parse(
      decoded,
    ) as JwtPayload;
  } catch {
    return null;
  }
}

export function getCurrentUser():
  AuthUser | null {
  const token =
    getAccessToken();

  if (!token) {
    return null;
  }

  const payload =
    decodeToken(token);

  if (!payload) {
    return null;
  }

  if (
    payload.exp &&
    payload.exp * 1000 <
      Date.now()
  ) {
    return null;
  }

  const id =
    payload.sub ??
    payload.id;

  if (
    !id ||
    !payload.email ||
    !payload.role
  ) {
    return null;
  }

  return {
    id,
    email:
      payload.email,
    role:
      payload.role,
    name:
      payload.name,
  };
}

export function isAuthenticated():
  boolean {
  return getCurrentUser() !== null;
}

export function logout(): void {
  localStorage.removeItem(
    'accessToken',
  );
}
