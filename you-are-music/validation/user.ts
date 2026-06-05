import * as z from "zod";

const User = z.object({
    email: z.email("Invalid email address").toLowerCase().trim(),
    password: z.string().trim().min(8, "Password must be at least 8 characters long")
    .and(z.string().regex(/[A-Z]/, "Password must contain at least one uppercase letter"))
    .and(z.string().regex(/[a-z]/, "Password must contain at least one lowercase letter"))
    .and(z.string().regex(/[0-9]/, "Password must contain at least one number"))
    .and(z.string().regex(/[@$!%*?&.,]/, "Password must contain at least one special character")),
})

export default User;