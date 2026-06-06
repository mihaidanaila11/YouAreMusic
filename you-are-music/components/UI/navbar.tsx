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
                <div>
                    <a href="/api/auth/signout"> Sign Out </a>
                    <p>Welcome, {user}!</p>
                </div>
                
            ) : (
                <>
                    <a href="/login" className="">
                        Login
                    </a>
                    <a href="/signup" className="">
                        Sign Up
                    </a>
                </>
            )}
        </nav>
    )
};

export default Navbar;