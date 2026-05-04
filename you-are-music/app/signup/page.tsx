'use client';

import { addUser } from "@/services/db/users";
import { signIn } from "next-auth/react";
import { useState } from "react";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        try{
            const result = await addUser({ email, password });
            signIn("Credentials", {
                email,
                password,
                callbackUrl: "/",
                redirect: false,
            });
        }
        catch (err) {
            setError("Eroare la înregistrare");
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-black/10 bg-white p-6 shadow">
                <h1 className="text-2xl font-semibold">Signup</h1>

                <label className="block space-y-1">
                    <span className="text-sm">Email</span>
                    <input
                        className="w-full rounded border border-black/20 px-3 py-2"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </label>

                <label className="block space-y-1">
                    <span className="text-sm">Parolă</span>
                    <input
                        className="w-full rounded border border-black/20 px-3 py-2"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </label>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}

                <button className="w-full rounded bg-black px-4 py-2 text-white" type="submit">
                    Sign up
                </button>
            </form>
        </main>
    )
};

export default Signup;