export interface RegisterResponse {
    accessToken: string;
}

export interface LoginResponse {
    accessToken: string;
}

export interface RefreshResponse {
    accessToken: string;
}

export interface ErrorRegisterResponse {
    error?: string;
}

export interface JwtPayload {
    sub: string;
    isAdmin: boolean;
    iat?: number;
    exp?: number;
}

export interface User {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    roleName: string;
}
