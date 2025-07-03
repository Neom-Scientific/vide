"use client"

import { use, useEffect, useState } from 'react'
import SideImage from "../../../public/NEOM.png"
import Image from 'next/image'
import Request from '../components/Request'
import Login from '../components/Login'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import AssignUser from '../components/AssignUser'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { set } from 'react-hook-form'

const page = () => {
  const [user, setUser] = useState(null);
  const [isUserLoaded, setIsUserLoaded] = useState(false); // Track if user is loaded
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(user && user.role === 'SuperAdmin' ? 'Assign-User' : 'login');

  useEffect(() => {
    const cookieUser = Cookies.get('user');
    if (cookieUser) {
      const parsedUser = JSON.parse(cookieUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'SuperAdmin') {
        router.push('/');
      }
      if(parsedUser.role === 'SuperAdmin') {
        setActiveTab('Assign-User');
      }
    }
    setIsUserLoaded(true); // Mark user as loaded
  }, []);

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

        {/* Render Tabs only after user is loaded */}
        {isUserLoaded && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full max-w-sm"
          >
            <TabsList className="flex justify-center mb-4 border-none rounded-lg ">
              <TabsTrigger
                value="login"
                className="p-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white cursor-pointer font-bold border border-white rounded-lg"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="request"
                className="p-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white cursor-pointer font-bold border border-white rounded-lg"
              >
                Request
              </TabsTrigger>
              {user && user.role === 'SuperAdmin' && (
                <TabsTrigger
                  value="Assign-User"
                  className="p-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white cursor-pointer font-bold border border-white rounded-lg"
                >
                  Assign User
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="login">
              <Login />
            </TabsContent>
            <TabsContent value="request">
              <Request />
            </TabsContent>
            {user && user.role === 'SuperAdmin' && (
              <TabsContent value="Assign-User">
                <AssignUser />
              </TabsContent>
            )}
          </Tabs>
        )}

        {activeTab && activeTab === 'login' && (
          <p className='mt-2 text-sm'>
            Don't have Username and password?{' '}
            <span
              className="text-blue-500 cursor-pointer underline"
              onClick={() => {
                setActiveTab('request');
              }}
            >
              Request for Username and Password.
            </span>
          </p>
        )}

        {activeTab && activeTab === 'request' && (
          <p className='mt-2 text-sm'>
            Already have an account?{' '}
            <span
              className="text-blue-500 cursor-pointer underline"
              onClick={() => setActiveTab('login')}
            >
              Login to your account.
            </span>
          </p>
        )}

      </div>
    </div>
  );
};

export default page;