"use client";

import { store } from "@/lib/redux/store";
import { Provider } from "react-redux";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";
import Header from "./components/Header";


export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/login";
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex min-h-screen">
          {showSidebar && <Sidebar />}
          <main className="flex-grow">
            {showSidebar && <Header />}
            <Provider store={store}>
              <div className="p-2">
                {children}
              </div>
            </Provider>
          </main>
        </div>
      </body>
    </html>
  )
}