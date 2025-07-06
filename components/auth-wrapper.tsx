"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Lock, Mail, Shield, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AuthWrapperProps {
  children: React.ReactNode
}

interface User {
  email: string
  passwordHash: string
  createdAt: string
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [resetForm, setResetForm] = useState({
    email: "",
  })

  const [error, setError] = useState("")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Simple hash function (in production, use proper bcrypt)
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + "salt_key_2024")
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // Check authentication status on load
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("goalTrackerUser")
      const sessionToken = localStorage.getItem("goalTrackerSession")

      if (savedUser && sessionToken) {
        const userData = JSON.parse(savedUser)
        const sessionData = JSON.parse(sessionToken)

        // Check if session is still valid (24 hours)
        if (Date.now() - sessionData.timestamp < 24 * 60 * 60 * 1000) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem("goalTrackerSession")
        }
      } else if (!savedUser) {
        setIsFirstTime(true)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowInstallPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (!signupForm.email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    try {
      const passwordHash = await hashPassword(signupForm.password)
      const newUser: User = {
        email: signupForm.email,
        passwordHash,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("goalTrackerUser", JSON.stringify(newUser))
      localStorage.setItem(
        "goalTrackerSession",
        JSON.stringify({
          timestamp: Date.now(),
          email: newUser.email,
        }),
      )

      setUser(newUser)
      setIsAuthenticated(true)
      setIsFirstTime(false)
    } catch (err) {
      setError("Failed to create account. Please try again.")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const savedUser = localStorage.getItem("goalTrackerUser")
    if (!savedUser) {
      setError("No account found. Please create an account first.")
      return
    }

    try {
      const userData: User = JSON.parse(savedUser)
      const passwordHash = await hashPassword(loginForm.password)

      if (userData.email === loginForm.email && userData.passwordHash === passwordHash) {
        localStorage.setItem(
          "goalTrackerSession",
          JSON.stringify({
            timestamp: Date.now(),
            email: userData.email,
          }),
        )

        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const savedUser = localStorage.getItem("goalTrackerUser")
    if (!savedUser) {
      setError("No account found with this email address")
      return
    }

    const userData: User = JSON.parse(savedUser)
    if (userData.email !== resetForm.email) {
      setError("No account found with this email address")
      return
    }

    // Simulate sending reset email
    // In production, this would send an actual email with a reset link
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    localStorage.setItem("goalTrackerResetCode", resetCode)
    localStorage.setItem("goalTrackerResetEmail", resetForm.email)

    console.log(`Password reset code: ${resetCode}`) // In production, this would be sent via email
    alert(
      `Password reset code sent to ${resetForm.email}!\n\nFor demo purposes, your reset code is: ${resetCode}\n\nIn a real app, this would be sent to your email.`,
    )

    setResetEmailSent(true)
  }

  const handlePasswordReset = () => {
    const resetCode = prompt("Enter the reset code sent to your email:")
    const savedResetCode = localStorage.getItem("goalTrackerResetCode")
    const resetEmail = localStorage.getItem("goalTrackerResetEmail")

    if (resetCode === savedResetCode && resetEmail === resetForm.email) {
      const newPassword = prompt("Enter your new password (minimum 6 characters):")
      if (newPassword && newPassword.length >= 6) {
        // Update password
        hashPassword(newPassword).then((passwordHash) => {
          const savedUser = localStorage.getItem("goalTrackerUser")
          if (savedUser) {
            const userData: User = JSON.parse(savedUser)
            userData.passwordHash = passwordHash
            localStorage.setItem("goalTrackerUser", JSON.stringify(userData))

            // Clean up reset data
            localStorage.removeItem("goalTrackerResetCode")
            localStorage.removeItem("goalTrackerResetEmail")

            alert("Password updated successfully! Please log in with your new password.")
            setShowForgotPassword(false)
            setResetEmailSent(false)
            setResetForm({ email: "" })
          }
        })
      } else {
        alert("Password must be at least 6 characters long")
      }
    } else {
      alert("Invalid reset code. Please try again.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("goalTrackerSession")
    setIsAuthenticated(false)
    setUser(null)
    setLoginForm({ email: "", password: "" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div>
        {/* Install App Prompt */}
        {showInstallPrompt && (
          <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                <span className="text-sm">Install this app on your device for the best experience!</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleInstallApp}>
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowInstallPrompt(false)}>
                  ×
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="fixed top-4 right-4 z-40">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <Lock className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className={showInstallPrompt ? "pt-16" : ""}>{children}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{isFirstTime ? "Welcome!" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isFirstTime
              ? "Create your account to start tracking your goals and studies"
              : "Sign in to access your goals and study tracker"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {isFirstTime ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-email">Email Address</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">
                Create Account
              </Button>
              <div className="text-center">
                <Button type="button" variant="link" onClick={() => setIsFirstTime(false)} className="text-sm">
                  Already have an account? Sign in
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
              <div className="text-center space-y-2">
                <Button type="button" variant="link" onClick={() => setShowForgotPassword(true)} className="text-sm">
                  Forgot your password?
                </Button>
                <br />
                <Button type="button" variant="link" onClick={() => setIsFirstTime(true)} className="text-sm">
                  Don't have an account? Create one
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Enter your email address and we'll send you a reset code.</DialogDescription>
          </DialogHeader>
          {!resetEmailSent ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">Email Address</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="your@email.com"
                  value={resetForm.email}
                  onChange={(e) => setResetForm({ email: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reset Code
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Reset code sent to {resetForm.email}! Check your email and click the button below to enter the code.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={handlePasswordReset} className="flex-1">
                  Enter Reset Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResetEmailSent(false)
                    setShowForgotPassword(false)
                    setResetForm({ email: "" })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
