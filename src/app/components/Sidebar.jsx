// 'use client'

// import { useEffect, useState } from 'react'
// import { Menu, Moon, Sun } from 'lucide-react'
// import { IoHomeOutline, IoDocumentOutline } from "react-icons/io5";
// import { FaUserDoctor, FaFileWaveform } from "react-icons/fa6";
// import { TbReportSearch } from "react-icons/tb";
// import { PiEyedropperSampleFill } from "react-icons/pi";
// import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
// import { GiArchiveRegister } from "react-icons/gi";
// import { GrPowerCycle } from "react-icons/gr";




// export default function Sidebar({ collapsed, setCollapsed }) {
//     // const [collapsed, setCollapsed] = useState(false)
//     const [darkMode, setDarkMode] = useState(
//         typeof window !== "undefined" ? document.documentElement.classList.contains('dark') : false
//     );
//     const [trfOpen, setTrfOpen] = useState(false)

//     const toggleDarkMode = () => {
//         document.documentElement.classList.toggle('dark')
//         setDarkMode(!darkMode)
//     }

//     useEffect(() => {
//         const observer = new MutationObserver(() => {
//             setDarkMode(document.documentElement.classList.contains('dark'));
//         });
//         observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
//         return () => observer.disconnect();
//     }, []);

//     return (
//         <div className="flex">
//             <div
//                 className={`
//     fixed
//     top-0
//     left-0
//     h-screen
//     border-2
//     rounded-b-lg
//     transition-all duration-300
//     bg-white
//     dark:bg-gray-900
//     border-black
//     dark:border-white
//     text-black
//     dark:text-white
//     rounded-lg
//     z-40
//     ${collapsed ? 'w-16' : 'w-64'}
//   `}
//             >
//                 <div className="flex justify-between items-center p-4">
//                     {!collapsed &&
//                         <div>
//                             <a href="/" className="flex items-center">
//                                 <img src="logo.png" alt="Logo" className="w-8 h-8 mr-2" />
//                                 <span className="font-bold text-lg text-orange-500">VIDE</span>
//                             </a>
//                         </div>
//                     }
//                     <button onClick={() => setCollapsed(!collapsed)}>
//                         <Menu className='cursor-pointer' size={24} />
//                     </button>
//                 </div>

//                 {/*  */}

//                 {!collapsed ? (
//                     <nav className="px-4 space-y-4">
//                         {/* home */}
//                         <a href="/" className="block p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500">Home</a>

//                         {/* profile */}
//                         <a href="/profile" className="block p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500">Profile</a>



//                         {/* sample registration */}
//                         <a href="/sample-registration" className="block p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500">Sample Registration</a>

//                         {/* sample processing */}
//                         <a href="/processing" className="block p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500">
//                             Processing
//                         </a>

//                         {/* TRFs */}
//                         <div>
//                             <button
//                                 className="w-full flex items-center justify-between p-2 border-2 border-black dark:border-white rounded-lg font-bold text-orange-500"
//                                 onClick={() => setTrfOpen(!trfOpen)}
//                             >
//                                 <span className="flex-1 text-center">TRFs</span>
//                                 {trfOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
//                             </button>
//                             {trfOpen && (
//                                 <div className="ml-4 mt-2 space-y-2 ">
//                                     <a href="#" className="block p-2 rounded hover:bg-orange-100 dark:hover:bg-gray-800">Myeloid</a>
//                                     <a href="#" className="block p-2 rounded hover:bg-orange-100 dark:hover:bg-gray-800">HLA</a>
//                                     <a href="#" className="block p-2 rounded hover:bg-orange-100 dark:hover:bg-gray-800">SHS</a>
//                                     <a href="#" className="block p-2 rounded hover:bg-orange-100 dark:hover:bg-gray-800">SolidTumor Panel</a>
//                                     <a href="#" className="block p-2 rounded hover:bg-orange-100 dark:hover:bg-gray-800">CS</a>
//                                 </div>
//                             )}
//                         </div>


//                         {/* reports */}
//                         <a href="/reports" className="block p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500">Reports</a>
//                     </nav>
//                 ) : (
//                     <div className='p-1'>
//                         {/* home */}
//                         <a href='/' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='Home' onClick={() => setCollapsed(true)}>
//                             <IoHomeOutline />
//                         </a>

//                         {/* profile */}
//                         <a href='/profile' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='Profile' onClick={() => setCollapsed(true)}>
//                             <FaUserDoctor />
//                         </a>



//                         {/* sample registration */}
//                         <a href='/sample-registration' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='Sample Registration' onClick={() => setCollapsed(true)}>
//                             <GiArchiveRegister />
//                         </a>

//                         {/* sample processing */}
//                         <a href='/processing' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='Processing' onClick={() => setCollapsed(true)}>
//                             <GrPowerCycle />
//                         </a>

//                         {/* TRFs */}
//                         <a href='#' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='TRFs' onClick={() => { setCollapsed(!collapsed); setTrfOpen(true) }}>
//                             <TbReportSearch />
//                         </a>


//                         {/* reports */}
//                         <a href='/reports' className='block mx-auto p-3 m-2 text-2xl border-2 border-black dark:border-2 dark:border-white rounded-lg text-center font-bold text-orange-500' title='Reports' onClick={() => setCollapsed(true)}>
//                             <FaFileWaveform />
//                         </a>
//                     </div>
//                 )}

//                 <div className="absolute bottom-4 right-4 hover:scale-110 transition-transform duration-300">
//                     <button onClick={toggleDarkMode} className='p-2 border-2 border-black dark:border-2 dark:border-white rounded-lg cursor-pointer'>
//                         {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }
