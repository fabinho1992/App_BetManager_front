
import "../styles/globals.css";
import ClientLayout from "@/app/components/ClientLayout";

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