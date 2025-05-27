"use client";

import { store } from "@/lib/redux/store";
import { Provider } from "react-redux";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import { useState } from "react";
import Processing from "./Tabs/Processing";
import Reports from "./Tabs/Reports";
import { SampleRegistration } from "./Tabs/SampleRegistration";
import RunSetup from "./Tabs/RunSetup";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/login";
  const [activeTab, setActiveTab] = useState("processing");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex min-h-screen">
          <main className={`flex-grow transition-all duration-300 `}>
            {showSidebar && <Header activeTab={activeTab} setActiveTab={setActiveTab} />}
            <Provider store={store}>
              <div className="p-2">
                {/* Render login page if on /login */}
                {pathname === "/login" ? (
                  children
                ) : (
                  <>
                    {activeTab === "dashboard" && children}
                    {activeTab === "sample-register" && <SampleRegistration />}
                    {activeTab === "processing" && <Processing />}
                    {activeTab === "reports" && <Reports />}
                    {activeTab === "run-setup" && <RunSetup/>}
                  </>
                )}
              </div>
            </Provider>
          </main>
        </div>
      </body>
    </html>
  )
}