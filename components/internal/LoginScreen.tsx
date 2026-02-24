"use client";

import { useState } from "react";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError(null);
    const result = await onLogin(username, password);
    if (!result.success) setError(result.error ?? "შეყვანა ვერ მოხერხდა");
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-background">
      <div className="w-full max-w-sm px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto border rounded-xl border-border bg-card">
            <Lock className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">შიდა სისტემა</h1>
          <p className="text-sm text-muted-foreground">შედით თქვენი მონაცემებით</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              მომხმარებლის სახელი
            </label>
            <div className="relative">
              <User className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                autoFocus
                id="email"
                name="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="მომხმარებელი"
                className="h-12 pl-10 text-base bg-card border-border"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">პაროლი</label>
            <div className="relative">
              <Lock className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
              <Input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 pl-10 text-base bg-card border-border"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-center text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={!username || !password || loading}
            className="w-full h-12 text-base font-semibold rounded-xl bg-primary text-primary-foreground disabled:opacity-30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 rounded-full animate-spin border-primary-foreground/30 border-t-primary-foreground" />
                შესვლა...
              </span>
            ) : (
              "შესვლა"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
