'use client'

import { useState } from 'react'
import { Menu, Moon, Sun } from 'lucide-react'
import { IoHomeOutline, IoDocumentOutline } from "react-icons/io5";



export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const [darkMode, setDarkMode] = useState(false)

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark')
        setDarkMode(!darkMode)
    }

    return (
        <div className="flex">
            <div
                className={`
      h-screen
      border-2
      rounded-b-lg
      transition-all duration-300
      bg-white
      dark:bg-gray-900
      border-black
      dark:border-white
      text-black
      dark:text-white
      rounded-lg
      relative
      ${collapsed ? 'w-16' : 'w-64'}
   `}
            >
                <div className="flex justify-between items-center p-4">
                    {!collapsed && <span className="font-bold text-lg">Dashboard</span>}
                    <button  onClick={() => setCollapsed(!collapsed)}>
                        <Menu className='cursor-pointer' size={24} />
                    </button>
                </div>

                {/*  */}

                {!collapsed ? (
                    <nav className="px-4 space-y-4">
                        <a href="#" className="block p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500">Home</a>
                        <a href="#" className="block p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500">Reports</a>
                    </nav>
                ) : (
                    <div className='p-1'>
                        <a href='#' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='Home'><IoHomeOutline /></a>
                        <a href='#' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='Reports'><IoDocumentOutline /></a>
                    </div>
                )}

                <div className="absolute bottom-4 left-4">
                    <button onClick={toggleDarkMode}>
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </div>
    )
}
