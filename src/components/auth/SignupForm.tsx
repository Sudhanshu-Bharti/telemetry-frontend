import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Button } from "../ui/button";
import { Card } from "../ui/Card";
import { config } from "@/config/config";

// Simple spinner component
const Spinner = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// GitHub icon component
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result?.error) {
        setError(result.error?.message || String(result.error));
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setName("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setIsGitHubLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/auth/sign-in/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        credentials: 'include',
        body: JSON.stringify({
          provider: 'github',
          callbackURL: `${config.basefrontend}/analytics`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get GitHub authorization URL');
      }
    } catch (err) {
      setError("Failed to initiate GitHub signup. Please try again.");
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-md p-8 mt-16 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h2>
        <p className="text-gray-500 mt-1 text-base">Join us to start tracking your analytics</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-2">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-2">
            {success}
          </div>
        )}
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 px-0 py-2 bg-transparent text-base placeholder-gray-400 transition"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 px-0 py-2 bg-transparent text-base placeholder-gray-400 transition"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 px-0 py-2 bg-transparent text-base placeholder-gray-400 transition"
            placeholder="Enter your password"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wide">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border-0 border-b border-gray-300 focus:border-blue-600 focus:ring-0 px-0 py-2 bg-transparent text-base placeholder-gray-400 transition"
            placeholder="Confirm your password"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-60 shadow-none"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-gray-400 uppercase tracking-wide">Or continue with</span>
        </div>
      </div>

      {/* GitHub OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubSignup}
        disabled={isGitHubLoading}
        className="w-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold py-2 rounded transition shadow-none"
      >
        {isGitHubLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
            Connecting to GitHub...
          </>
        ) : (
          <>
            <GitHubIcon className="mr-2 h-4 w-4" />
            Continue with GitHub
          </>
        )}
      </Button>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition">Sign in</a>
        </p>
      </div>
      <style>{`.animate-fade-in{animation:fadeIn .18s cubic-bezier(.4,0,.2,1)}`}
      {`@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}`}</style>
    </div>
  );
} 