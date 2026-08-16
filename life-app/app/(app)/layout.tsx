import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header/header";
import { SettingsProvider } from "@/contexts/settings-context";
import Footer from "@/components/ui/footer";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
