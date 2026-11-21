import "./globals.css";
import NavBar from "./NavBar";

export const metadata = {
  title: "AYCF Logistics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
