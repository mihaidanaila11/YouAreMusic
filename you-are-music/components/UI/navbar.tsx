import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const Navbar = () => {
    const session = useSession();
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        console.log(session)
        if (session.status === "authenticated") {
            const userData = session.data.user?.email;
            
            if(userData) {
                setUser(userData);
            }
        }
    }, [session]);

    return(
        <nav className="flex justify-end px-6 py-4 gap-3">
            {user ? (
                <p>Welcome, {user}!</p>
            ) : (
                <>
                    <a href="/login" className="">
                        Login
                    </a>
                    <a href="/login" className="">
                        Sign Up
                    </a>
                </>
            )}
        </nav>
    )
};

export default Navbar;