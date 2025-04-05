export interface TokenResponse {
    access: string,
    refresh: string
}

export interface UserLogin {
    username: string,
    password: string
}

export interface UserRegistration extends UserLogin {
    email: string
}