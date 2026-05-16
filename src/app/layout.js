import "../styles/globals.css";
import ClientLayout from "@/app/components/ClientLayout";

export const metadata = {
  title: "App Bets",
  description: "Gestão de apostas esportivas",
  manifest: "/manifest.json",
};


export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}