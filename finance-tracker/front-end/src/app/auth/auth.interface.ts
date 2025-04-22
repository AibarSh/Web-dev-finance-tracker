export interface TokenResponse {
    access: string;
    refresh: string;
}

export interface UserLogin {
        email: string | null | undefined; // Разрешаем null и undefined
        password: string | null | undefined; // Разрешаем null и undefined
}

export interface UserRegistration extends UserLogin {
    email: string
    password: string
    username: string
}
