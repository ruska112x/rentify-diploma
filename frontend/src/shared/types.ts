export interface RegisterResponse {
    accessToken: string;
    userId: string;
}

export interface LoginResponse {
    accessToken: string;
    userId: string;
}

export interface RefreshResponse {
    accessToken: string;
    userId: string;
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

export interface OneRentalListing {
    title: string;
    description: string;
    address: string;
    tariffDescription: string;
    autoRenew: boolean;
}
