import yup from "yup";

export const signupSchema = yup.object().shape({
  name: yup
    .string()
    .required("firstName is required")
    .min(2, "firstName must be at least 2 characters long"),
  email: yup.string().required("Email is required").email("Email is not valid"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters long"),
});

export const expenseSchema = yup.object().shape({
  price: yup.number().min(5).required(),
  description: yup.string().required(),
  category: yup.string().required(),
});
