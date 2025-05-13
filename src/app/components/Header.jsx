"use client"
import React, { useState, useRef } from 'react'
import { Sun, Moon } from 'lucide-react'

const defaultAvatars = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/65.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/85.jpg",
  "https://randomuser.me/api/portraits/women/2.jpg",
];

const Header = () => {
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined" ? document.documentElement.classList.contains('dark') : false
  );
  const [profilePhoto, setProfilePhoto] = useState(defaultAvatars[0]);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    setDarkMode(!darkMode)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setShowMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    setShowMenu(!showMenu);
  };

  const handleChooseAvatar = (avatar) => {
    setProfilePhoto(avatar);
    setShowMenu(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <header className="bg-white border-black border-2 dark:border-white dark:bg-gray-900 rounded-lg py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My App</h1>
          <nav>
            <ul className="flex space-x-4 items-center">
              <li>
                <button onClick={toggleDarkMode} className="ml-4 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </li>
              <li className="relative">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
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
    </div>
  )
}

export default Header