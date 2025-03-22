export const parseJwtHeader = (token: string) => {
    try {
        return JSON.parse(atob(token.split(".")[0]));
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const parseJwtPayload = (token: string) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        console.error(e);
        return null;
    }
};
