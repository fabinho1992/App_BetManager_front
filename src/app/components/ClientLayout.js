"use client";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Header from "@/app/components/Header";
import AutoLogout from "@/app/hooks/AutoLogout";


export default function RootLayout({ children }) {
    const pathname = usePathname();

    const hiddenRoutes = ["/", "/register", "/redefinir-senha", "/resetsenha"];

    const showHeader =
        pathname !== "/" &&
        !hiddenRoutes.includes(pathname);


    return (
        <html>
            <body>
                <AutoLogout />

                {showHeader && <Header />}

                <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

                {children}
            </body>
        </html>
    );
}


