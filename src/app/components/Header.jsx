"use client"
import React, { useState, useRef, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const defaultAvatars = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/65.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/85.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
];

const Header = ({ activeTab, setActiveTab }) => {
  const router = useRouter();
  const [user, setUser] = useState(null); // State to hold user data

  useEffect(() => {
    const cookieUser = Cookies.get('user');
    if (cookieUser) {
      setUser(JSON.parse(cookieUser));
    }
    else {
      router.push('/login'); // Redirect to login if no user cookie found
    }
  }, []);


  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  const fileInputRef = useRef(null); // Define the file input reference
  const [profilePhoto, setProfilePhoto] = useState(); // Default profile photo
  const [showMenu, setShowMenu] = useState(false); // State for avatar menu

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setDarkMode(!darkMode);
  };

  const handleAvatarClick = () => {
    setShowMenu(!showMenu); // Toggle the avatar menu
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhoto(e.target.result); // Update the profile photo
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseAvatar = (avatar) => {
    setProfilePhoto(avatar); // Set the selected avatar
    setShowMenu(false); // Close the menu
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger the file input click
    }
  };

  return (
    <header className="max-w-full bg-white border-2 sticky top-0 z-50 dark:bg-gray-900 py-4 shadow-md transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">
          Visualization Index and Dashboard Execution
        </a>
        <nav>
          <ul className="flex space-x-4 items-center m-0 p-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
              <TabsList className={`bg-white dark:bg-gray-900 flex items-center space-x-4 overflow-x-auto max-w-full transition-colors duration-300`}>

                <TabsTrigger
                  value="dashboard"
                  className="cursor-pointer data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                >
                  Dashboard
                </TabsTrigger>

                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                  value="sample-register"
                >
                  Sample Registration
                </TabsTrigger>

                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                  value="processing"
                >
                  Processing
                </TabsTrigger>

                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                  value="library-prepration"
                >
                  Library Preparation
                </TabsTrigger>

                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                  value="run-setup"
                >
                  Run Setup
                </TabsTrigger>


                <TabsTrigger
                  className="cursor-pointer data-[state=active]:bg-orange-400 data-[state=active]:text-white"
                  value="reports"
                >
                  Reports
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <li>
              <button
                onClick={toggleDarkMode}
                className="p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg cursor-pointer transition-colors duration-300"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </li>
            <li className="relative flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handlePhotoChange}
              />
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300 dark:border-white transition-colors duration-300"
                  onClick={handleAvatarClick}
                  title="Click to change profile photo"
                />
              ) : user && user.username ? (
                <div
                  className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold cursor-pointer border-2 border-gray-300 dark:border-white transition-colors duration-300"
                  onClick={handleAvatarClick}
                  title="Click to change profile photo"
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-xl font-bold cursor-pointer border-2 border-gray-300 dark:border-white transition-colors duration-300"
                  onClick={handleAvatarClick}
                  title="Click to change profile photo"
                >
                  ?
                </div>
              )}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 p-2 transition-colors duration-300">
                  <div className="grid grid-cols-3 gap-2">
                    {defaultAvatars.map((avatar, idx) => (
                      <img
                        key={idx}
                        src={avatar}
                        alt={`Avatar ${idx}`}
                        className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors duration-300"
                        onClick={() => handleChooseAvatar(avatar)}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <button
                    onClick={handleUploadClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  >
                    Upload from device
                  </button>
                </div>
              )}
            </li>
            <li>
              <button
                onClick={() => {
                  Cookies.remove('user'); // Clear user cookie
                  localStorage.removeItem('searchData'); // Clear search data from local storage
                  localStorage.removeItem('libraryPreparationData')
                  router.push('/login'); // Redirect to login page
                }}
                className="p-2 bg-red-500 text-white font-bold rounded-lg cursor-pointer transition-colors duration-300"
              >
                Logout
              </button>
            </li>
            {user && user.role === "SuperAdmin" && (
              <li>
                <button
                  onClick={() => router.push('/login')}
                  className="p-2 bg-blue-500 text-white font-bold  rounded-lg cursor-pointer transition-colors duration-300"
                >
                  Login
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;