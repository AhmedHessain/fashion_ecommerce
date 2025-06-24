import { z } from "zod";

export const signupFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .min(4, { message: "Name must be at least 4 characters long" })
    .max(40, { message: "Name can't exceed 40 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, {
      message: "Password must include at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must include at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Password must include at least one number" })
    .regex(/[@$!%*#?&]/, {
      message: "Password must include at least one special character",
    }),
});

export const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, {
      message: "Password must include at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must include at least one uppercase letter",
    })
    .regex(/[0-9]/, {
      message: "Password must include at least one number",
    })
    .regex(/[@$!%*#?&]/, {
      message: "Password must include at least one special character",
    }),
});

export const forgetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[a-z]/, {
        message: "Password must include at least one lowercase letter",
      })
      .regex(/[A-Z]/, {
        message: "Password must include at least one uppercase letter",
      })
      .regex(/[0-9]/, {
        message: "Password must include at least one number",
      })
      .regex(/[@$!%*#?&]/, {
        message: "Password must include at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords must match",
        path: ["confirmPassword"], // Error is linked to the confirmPassword field
      });
    }
  });

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9]{10,15}$/, "Please enter a valid phone number"),
  message: z.string().min(1, "Message is required"),
});
