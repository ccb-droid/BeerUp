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