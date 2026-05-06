import * as z from "zod";

const User = z.object({
    email: z.email(),
    password: z.string().min(6, "Password must be at least 6 characters long")
    .and(z.string().regex(/[A-Z]/, "Password must contain at least one uppercase letter"))
    .and(z.string().regex(/[a-z]/, "Password must contain at least one lowercase letter"))
    .and(z.string().regex(/[0-9]/, "Password must contain at least one number"))
    .and(z.string().regex(/[@$!%*?&.,]/, "Password must contain at least one special character")),
})

export default User;