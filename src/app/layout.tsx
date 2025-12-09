import type { Metadata } from "next";
import "./globals.css";
import styles from "./page.module.css";
import Link from "next/link";


export const metadata: Metadata = {
  title: "Free Copy Trading",
  description: "Developed by GB Tech",
};

export default function RootLayout({
  children,
  hideHeader = false,
}: Readonly<{
  children: React.ReactNode;
  hideHeader?: boolean;
}>) {
  return (
    <html lang="en">
      <body>
        {!hideHeader && (
          <header className="z-50">
            <nav className="mt-1">
              <div className={styles.navLogo}>
                <h1 className="text-2xl font-bold">CopyTrading</h1>
              </div>

              <ul>
                <li><Link href="/"><button className={styles.navBnt}>Home</button></Link></li>
                <li><a href="#feature"><button className={styles.navBnt}>Features</button></a></li>
                <li><a href="#about"><button className={styles.navBnt}>About</button></a></li>
                <li><a href="#testimonial"><button className={styles.navBnt}>Testimonials</button></a></li>
                <li><a href="#newAcct"><button className={styles.navBnt}>New Account</button></a></li>
                <li><a href="#contact"><button className={styles.navBnt}>Contact</button></a></li>
                <li><Link href="/dashboard"><button className={styles.navBnt}>Dashboard</button></Link></li>
              </ul>
              
            </nav>
          </header>
        )}

        {children}

        <hr></hr>

        <footer>
          <div className='container mx-auto p-4 text-center'>
            <p className='text-sm text-[var( --primary)]'>&copy; {new Date().getFullYear()} CopyTrading. All rights reserved.</p>
          </div>
        </footer>

      </body>
    </html>
  );
}
