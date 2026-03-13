import "./globals.css";

export const metadata = {
  title: "23 Hamel St - Investment Calculator",
  description: "Real estate investment analysis for 23 Hamel St, St. John's",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
