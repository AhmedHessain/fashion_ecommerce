export const passwordCriteria = [
  { test: /.{8,}/, message: "Password must be at least 8 characters long" },
  {
    test: /[a-z]/,
    message: "Password must include at least one lowercase letter",
  },
  {
    test: /[A-Z]/,
    message: "Password must include at least one uppercase letter",
  },
  { test: /[0-9]/, message: "Password must include at least one number" },
  {
    test: /[@$!%*#?&]/,
    message: "Password must include at least one special character",
  },
];
