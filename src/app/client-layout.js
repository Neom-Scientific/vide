"use client";

import { store } from "@/lib/redux/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import Header from "./components/Header";
import Processing from "./Tabs/Processing";
import Reports from "./Tabs/Reports";
import { SampleRegistration } from "./Tabs/SampleRegistration";
import RunSetup from "./Tabs/RunSetup";
import LibraryPrepration from "./Tabs/LibraryPrepration";
import { setActiveTab } from "@/lib/redux/slices/tabslice";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const showSidebar = pathname !== "/login" && pathname !== "/reset-password";

  return (
      <div className="bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <div className="flex min-h-screen">
          <main className={`flex-grow transition-all duration-300`}>
            <Provider store={store}>
              <ReduxWrapper showSidebar={showSidebar} pathname={pathname}>
                {children}
              </ReduxWrapper>
            </Provider>
          </main>
        </div>
      </div>
  );
}

function ReduxWrapper({ children, showSidebar, pathname }) {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.tab.activeTab);

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab)); // Dispatch action to change the tab
  };

  return (
    <>
      {showSidebar && (
        <Header activeTab={activeTab} setActiveTab={handleTabChange} />
      )}
      <div className="p-1">
        {/* Render login page if on /login */}
        {pathname === "/login" || pathname === "/reset-password" ? (
          children
        ) : (
          <ReduxContent activeTab={activeTab} children={children} />
        )}
      </div>
    </>
  );
}

function ReduxContent({ children, activeTab }) {
  return (
    <>
      {/* Render the appropriate tab content */}
      {activeTab === "dashboard" && children}
      {activeTab === "sample-register" && <SampleRegistration />}
      {activeTab === "processing" && <Processing />}
      {activeTab === "reports" && <Reports />}
      {activeTab === "library-prepration" && <LibraryPrepration />}
      {activeTab === "run-setup" && <RunSetup />}
    </>
  );
}