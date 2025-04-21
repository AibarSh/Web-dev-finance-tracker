export interface TokenResponse {
    access: string;
    refresh: string;
}
export interface UserData {
  id: number;
  email: string;
  username: string;
  date_joined: string; // or Date, if you plan to parse it
  assets: any[]; // Replace `any` with a more specific type if you know the structure
  transactions: any[]; // Same here
  goals: any[]; // And here
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
