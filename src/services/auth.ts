import { config } from "../config/config";

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async signup(email: string, password: string, name: string) {
    const response = await fetch(`${this.baseUrl}/api/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    return response.json();
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/api/auth/get-session`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get user data');
    }

    return response.json();
  }

  async logout() {
    try {
      await fetch(`${this.baseUrl}/api/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Helper method to check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/session`, {
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // GitHub OAuth
  async getGitHubAuthUrl() {
    const response = await fetch(`${this.baseUrl}/api/auth/signInSocial?provider=github`, {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.url;
    }
    
    throw new Error('Failed to get GitHub auth URL');
  }
}

export const authService = new AuthService(); 