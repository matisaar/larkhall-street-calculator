import "./globals.css";

export const metadata = {
  title: "100 Larkhall St - Investment Calculator",
  description: "Real estate investment analysis for 100 Larkhall St, St. John's",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
