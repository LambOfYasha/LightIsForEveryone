import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header/header";
import { SettingsProvider } from "@/contexts/settings-context";
import Footer from "@/components/ui/footer";
import "../globals.css";
import "../themes.css";

export const metadata: Metadata = {
  title: "Light Is For Everyone",
  description: "Ask questions, get answers, and grow spiritually together",
  icons: {
    icon: [
      { url: '/assets/logo_light.png', type: 'image/png' },
      { url: '/assets/logo_dark.png', type: 'image/png', media: '(prefers-color-scheme: dark)' }
    ],
    apple: '/assets/logo_light.png',
    shortcut: '/assets/logo_light.png'
  },
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <ClerkProvider>
          <SettingsProvider>
            <SidebarProvider>
              <Sidebar className="hidden md:block" collapsible="offcanvas">
                <AppSidebar />
              </Sidebar>
              <SidebarInset>
                <Header />
                <div className="flex flex-col min-h-screen">{children}</div>
                <Footer />
              </SidebarInset>
            </SidebarProvider>
          </SettingsProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}