import React from 'react';
import { Link, useLoaderData, useLocation, useNavigate, useParams } from "react-router";
import { logoutUser } from "~/appwrite/auth";
import { cn } from "~/lib/utils";

const RootNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const user = useLoaderData();

    const handleLogout = async () => {
        await logoutUser();
        navigate('/sign-in');
    };

    // Provide default values if user is undefined
    const userStatus = user?.status || 'guest';
    const userImage = user?.imageUrl || '/assets/images/david.webp';
    const userName = user?.name || 'Guest';

    return (
        <nav className={cn(location.pathname === `/travel/${params.tripId}` ? 'bg-white' : 'glassmorphism', 'w-full fixed z-50')}>
            <header className="root-nav wrapper">
                <Link to='/' className="link-logo">
                    <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px]" />
                    <h1>Tourvisto</h1>
                </Link>

                <aside>
                    {userStatus === 'admin' && (
                        <Link
                            to="/dashboard"
                            className={cn(
                                'text-base font-normal text-white',
                                { "text-dark-100": location.pathname.startsWith('/travel') }
                            )}
                        >
                            Admin Panel
                        </Link>
                    )}

                    <img src={userImage} alt={userName} referrerPolicy="no-referrer" />

                    <button onClick={handleLogout} className="cursor-pointer">
                        <img
                            src="/assets/icons/logout.svg"
                            alt="logout"
                            className="size-6 rotate-180"
                        />
                    </button>
                </aside>
            </header>
        </nav>
    );
};

export default RootNavbar;
