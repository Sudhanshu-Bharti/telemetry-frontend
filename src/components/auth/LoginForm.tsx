import { useState } from "react";
import { authClient } from "../../lib/auth-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { config } from "@/config/config";

// Simple spinner component
const Spinner = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// GitHub icon component
const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result?.error) {
        setError(result.error?.message || String(result.error));
      } else {
        // Redirect to dashboard on success
        window.location.href = "/analytics";
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${config.apiBaseUrl}/api/auth/sign-in/social`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: window.location.origin,
          },
          credentials: "include",
          body: JSON.stringify({
            provider: "github",
            callbackURL: `${config.basefrontend}/analytics`,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        throw new Error("Failed to get GitHub authorization URL");
      }
    } catch (err) {
      setError("Failed to initiate GitHub login. Please try again.");
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-slate-200 shadow-sm p-8 mt-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Sign In
        </h2>
        <p className="text-slate-600 mt-2 text-base">
          Welcome back to your dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-slate-700 uppercase tracking-wide"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-slate-200 focus:border-slate-900 transition-colors"
            placeholder="Enter your email"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-xs font-bold text-slate-700 uppercase tracking-wide"
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-slate-200 focus:border-slate-900 transition-colors"
            placeholder="Enter your password"
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 transition-colors"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-slate-500 uppercase tracking-wide font-medium">
            Or continue with
          </span>
        </div>
      </div>

      {/* GitHub OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGitHubLogin}
        disabled={isGitHubLoading}
        className="w-full border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold py-3 transition-colors"
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
        <p className="text-sm text-slate-600">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="font-bold text-slate-900 hover:text-slate-700 transition-colors"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
