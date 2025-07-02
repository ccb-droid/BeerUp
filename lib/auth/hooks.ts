import type React from "react";
import { useAuth } from "./context";
import { useToast } from "@/components/layout/toast-provider";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { validateLoginForm, validateRegisterForm } from "@/lib/validations/auth";

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
      showToast("Account created successfully! Welcome to Malty!", "success");
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