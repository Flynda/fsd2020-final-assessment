export interface Login {
    username: string
    password: string
}

export interface SignUp extends Login{
    email: string
}

export interface CanLeaveRoute {
    canILeave(): boolean | Promise<boolean>
}

export interface SocialUsers {
    provider: string
    id: string
    email: string
    name: string
    image: string
    token?: string
    idToken?: string
}
