import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function useSignIn() {
  const router = useRouter()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to sign in")
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Signed in successfully!",
      })
      router.push("/")
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export function useSignUp() {
  const router = useRouter()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create account")
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully!",
      })
      router.push("/")
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export function useForgotPassword() {
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to send reset email")
      }
      
      return response.json()
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: result?.message || "Password reset email sent!",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export function useResetPassword() {
  const router = useRouter()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to reset password")
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset successfully!",
      })
      router.push("/")
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    },
  })
}

export function useSignOut() {
  const router = useRouter()
  const { toast } = useToast()
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })
      
      if (!response.ok) {
        throw new Error("Failed to sign out")
      }
      
      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Signed out successfully!",
      })
      router.push("/")
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    },
  })
} 