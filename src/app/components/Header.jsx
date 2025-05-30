"use client"
import React, { useState, useRef, useEffect, use } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  useEffect(() => {
    const user = JSON.parse(Cookies.get('user') || '{}');
    console.log('user', user);
    if(Object.keys(user).length === 0){ // Check if user object is empty
      router.push('/login'); // Redirect to login if user is not logged in
    }
  },[]);
  
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  const fileInputRef = useRef(null); // Define the file input reference
  const [profilePhoto, setProfilePhoto] = useState(defaultAvatars[0]); // Default profile photo
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
    <header className="max-w-full bg-white border-2 sticky top-0 z-50 dark:bg-gray-900 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-500">
          Visualization Index and Dashboard Execution
        </a>
        <nav>
          <ul className="flex space-x-4 items-center m-0 p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white dark:bg-gray-900 flex items-center space-x-4 overflow-x-auto max-w-full">
                <li className="p-0 m-0">
                  <TabsTrigger className="cursor-pointer" value="dashboard">
                    Dashboard
                  </TabsTrigger>
                </li>
                <li className="p-0 m-0">
                  <TabsTrigger
                    className="cursor-pointer"
                    value="sample-register"
                  >
                    Sample Registration
                  </TabsTrigger>
                </li>
                <li className="p-0 m-0">
                  <TabsTrigger className="cursor-pointer" value="processing">
                    Processing
                  </TabsTrigger>
                </li>
                <li className="p-0 m-0">
                  <TabsTrigger
                    className="cursor-pointer"
                    value="library-prepration"
                  >
                    Library Preparation
                  </TabsTrigger>
                </li>
                <li className="p-0 m-0">
                  <TabsTrigger className="cursor-pointer" value="run-setup">
                    Run Setup
                  </TabsTrigger>
                </li>
                <li className="p-0 m-0">
                  <TabsTrigger className="cursor-pointer" value="reports">
                    Reports
                  </TabsTrigger>
                </li>
              </TabsList>
            </Tabs>
            <li>
              <button
                onClick={toggleDarkMode}
                className="p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg cursor-pointer"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </li>
            <li className="relative flex-shrink-0">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef} // Attach the ref to the input
                className="hidden"
                onChange={handlePhotoChange} // Handle file selection
              />
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-300 dark:border-white"
                onClick={handleAvatarClick}
                title="Click to change profile photo"
              />
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {defaultAvatars.map((avatar, idx) => (
                      <img
                        key={idx}
                        src={avatar}
                        alt={`Avatar ${idx}`}
                        className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500"
                        onClick={() => handleChooseAvatar(avatar)}
                      />
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <button
                    onClick={handleUploadClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    Upload from device
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;