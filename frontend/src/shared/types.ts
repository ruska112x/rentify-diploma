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

export interface ImageData {
    key: string | null,
    link: string
}

export interface ImageAction {
    key: string,
    action: string,
    newFileName: string | null
}

export interface PartialUser {
    firstName: string;
    lastName: string;
    imageData: ImageData;
}

export interface ExtendedUser {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    roleName: string;
    imageData: ImageData;
}

export interface RentalListingAddress {
  district?: string | null;
  locality: string;
  street: string;
  houseNumber: string;
  additionalInfo?: string | null;
}

export interface PartialRentalListing {
  id: string;
  title: string;
  description: string;
  address: string;
  tariffDescription: string;
  autoRenew: boolean;
  mainImageData: ImageData;
  additionalImagesData: ImageData[];
  userId: string;
}

export interface ExtendedRentalListing {
  id: string;
  title: string;
  description: string;
  address: RentalListingAddress | string;
  tariffDescription: string;
  autoRenew: boolean;
  mainImageData: ImageData;
  additionalImagesData: ImageData[];
  userId: string;
}
