import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { lusitana } from '@/app/ui/fonts';

export default function RootLayout({ children, }: {  children: React.ReactNode;}) {
  return (
    <html lang="en">
      <body className={`${lusitana.className} antialiased`}>{children}</body>
      {/* <p className={`${lusitana.className} antialiased`}>Meow meow meow meow</p> */}
    </html>
  );
}
