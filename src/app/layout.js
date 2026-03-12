
import "../styles/globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/app/components/Header";
import AutoLogout from "@/app/hooks/AutoLogout";

export const metadata = {
  title: "App Bets",
  description: "Gestão de apostas esportivas"
};

export default function RootLayout({ children }) {
  
  return (
    <html>
      <body>
        <AutoLogout />
        <Header />
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}


