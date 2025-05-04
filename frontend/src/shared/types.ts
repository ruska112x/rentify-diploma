export interface AccessToken {
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

export interface PartialUser {
    firstName: string;
    lastName: string;
    photoLink: string;
}

export interface PartialRentalListing {
    id: string;
    title: string;
    description: string;
    address: string;
    tariffDescription: string;
    autoRenew: boolean;
    mainPhotoLink: string;
    additionalPhotoLinks: string[];
    userId: string;
}

export interface ExtendedUser {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    roleName: string;
    photoLink: string;
}

export interface ExtendedRentalListing {
    id: string;
    title: string;
    description: string;
    address: string;
    tariffDescription: string;
    autoRenew: boolean;
    mainPhotoLink: string;
    additionalPhotoLinks: string[];
    userId: string;
}
