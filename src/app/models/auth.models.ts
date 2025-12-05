export interface LoginRequest {
    username: string; // Correspond au JSON attendu par ConnectLoginDto
    password: string;
}

export interface LoginResponse {
    token: string;    // Correspond à GetLoginConnectDto
}

export interface UserProfile {
    username: string;
    fullName: string;
    roles: string[];
    id: string;
}