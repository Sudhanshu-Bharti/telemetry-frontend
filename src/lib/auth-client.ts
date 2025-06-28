import { createAuthClient } from "better-auth/react"
import { config } from "@/config/config"

export const authClient = createAuthClient({
    baseURL: config.apiBaseUrl,
    // Enable credentials for cookie-based authentication
    credentials: 'include'
})