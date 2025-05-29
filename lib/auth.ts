import type React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/toast-provider";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Validation function
export const validateLoginForm = (email: string, password: string): string[] => {
  const errors: string[] = [];

//   if (!email.trim()) {
//     errors.push("Email is required");
//   } else if (!/\\S+@\\S+\\.\\S+/.test(email)) {
//     errors.push("Email format is invalid");
//   }

  if (!password) {
    errors.push("Password is required");
  }

  return errors;
};

export const handleLoginSubmit = async (
  e: React.FormEvent,
  email: string,
  password: string,
  signIn: ReturnType<typeof useAuth>['signIn'],
  showToast: ReturnType<typeof useToast>['showToast'],
  router: AppRouterInstance,
  redirectTo: string,
  setError: (message: string) => void,
  setValidationErrors: (errors: string[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  e.preventDefault();
  setError("");
  setValidationErrors([]);

  const validationErrors = validateLoginForm(email, password);
  if (validationErrors.length > 0) {
    setValidationErrors(validationErrors);
    return;
  }

  setIsLoading(true);

  try {
    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message || "Invalid email or password");
      throw error;
    }

    showToast("Logged in successfully", "success");

    router.push(redirectTo);
    router.refresh();
  } catch (error: any) {
    console.error("Login error:", error);
    setError(error.message || "Invalid email or password");
  } finally {
    setIsLoading(false);
  }
};

// Validation function
export const validateRegisterForm = (
  username: string,
  email: string,
  password: string,
  dob: string
): string[] => {
  const errors: string[] = [];

  if (!username.trim()) {
    errors.push("Username is required");
  } else if (username.length < 3) {
    errors.push("Username must be at least 3 characters");
  }

//   if (!email.trim()) {
//     errors.push("Email is required");
//   } else if (!/\\S+@\\S+\\.\\S+/.test(email)) {
//     errors.push("Email format is invalid");
//   }

  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (!dob) {
    errors.push("Date of birth is required");
  } else {
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
      errors.push("You must be at least 18 years old");
    }
  }

  return errors;
};

export const handleRegisterSubmit = async (
  e: React.FormEvent,
  username: string,
  email: string,
  password: string,
  dob: string,
  signUp: ReturnType<typeof useAuth>['signUp'],
  showToast: ReturnType<typeof useToast>['showToast'],
  router: AppRouterInstance,
  setError: (message: string) => void,
  setValidationErrors: (errors: string[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  e.preventDefault();
  setError("");
  setValidationErrors([]);

  const validationErrors = validateRegisterForm(username, email, password, dob);
  if (validationErrors.length > 0) {
    setValidationErrors(validationErrors);
    return;
  }

  setIsLoading(true);

  try {
    const { error, user } = await signUp(email, password, username, dob);

    if (error) {
      setError(error.message || "Error creating account");
      throw error;
    }

    if (user) {
      showToast("Account created successfully! Welcome to BeerUp!", "success");
      router.push("/");
      router.refresh();
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    setError(error.message || "Error creating account");
  } finally {
    setIsLoading(false);
  }
};

export const handleForgotPasswordSubmit = async (
  e: React.FormEvent,
  email: string,
  resetPassword: ReturnType<typeof useAuth>['resetPassword'],
  setSubmitted: (submitted: boolean) => void,
  setIsLoading: (loading: boolean) => void
) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    await resetPassword(email);
    setSubmitted(true);
  } catch (error) {
    console.error("Error in reset password flow:", error);
    setSubmitted(true);
  } finally {
    setIsLoading(false);
  }
};
