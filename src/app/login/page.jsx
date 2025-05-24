// import React from 'react'

// const Login = () => {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
//         <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm">
//             <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Login</h2>
//             <form>
//             <div className="mb-4">
//                 <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
//                 <input type="email" id="email" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500" required />
//             </div>
//             <div className="mb-4">
//                 <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
//                 <input type="password" id="password" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500" required />
//             </div>
//             <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">Login</button>
//             </form>
//         </div>

//     </div>
//   )
// }

// export default Login

"use client"
import { useState } from 'react'
import SideImage from "../../../public/NEOM.png"
import Image from 'next/image'
import Request from '../components/Request'
import Login from '../components/Login'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import AssignUser from '../components/AssignUser'

const page = () => {
  const [SignIn, setSignIn] = useState(true)
  const handleSignIn = () => {
    setSignIn(!SignIn)
  }

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-12">
      {/* Left Section (Hidden on Mobile) */}
      <div className="hidden md:block md:col-span-8">
        <Image
          src={SideImage}
          className="w-full h-full"
          alt="side image"
        />
      </div>

      {/* Right Section */}
      <div className="col-span-1 md:col-span-4 bg-white p-5 md:p-10 flex flex-col justify-center items-center relative">
        {/* Image at Top-Left or Top-Right for Mobile View */}
        <div className="absolute top-2 left-2 md:hidden">
          <Image
            src={SideImage}
            alt="side image"
            width={100} // Adjust size for mobile
            height={100}
            className="object-contain"
          />
        </div>

        {/* Sign In / Sign Up Form */}
        {/* <div className="w-full max-w-sm">
          {SignIn ? <Login/> : <Request/>}
        </div> */}
        <Tabs defaultValue='login' className="w-full max-w-sm">
          <TabsList className="flex justify-center mb-4 border-none rounded-lg ">
            <TabsTrigger value='login' className='p-2 bg-orange-500 cursor-pointer text-white font-bold border rounded-lg'> Login </TabsTrigger>
            <TabsTrigger value='request' className='p-2 bg-orange-500 text-white cursor-pointer font-bold border border-white rounded-lg'> Request </TabsTrigger>
            <TabsTrigger value='Assign-User' className='p-2 bg-orange-500 text-white cursor-pointer font-bold border border-white rounded-lg'> Assign User </TabsTrigger>
          </TabsList>
          <TabsContent value='login'>
            <Login />
          </TabsContent>
          <TabsContent value='request'>
            <Request />
          </TabsContent>
          <TabsContent value='Assign-User'>
            <AssignUser />
          </TabsContent>
        </Tabs>

        {/* Toggle Between login and request
        <div className="flex justify-center mt-5">
          {SignIn ? (
            <p className="text-sm text-center">
              Don't have an Username and Password?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={handleSignIn}
              >
                Request
              </span>
            </p>
          ) : (
            <p className="text-sm text-center">
              Already have Username and password?{" "}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={handleSignIn}
              >
                LogIn
              </span>
            </p>
          )} 
        </div>*/}
      </div>
    </div>
  )
}

export default page