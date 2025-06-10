'use client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const AssignUser = () => {
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const cookieUser = Cookies.get('user');
    const fetchData = async () => {
      if (cookieUser) {

        try {
          const parsedUser = JSON.parse(cookieUser);
          setAdmin(parsedUser);
          const data = await axios.get(`/api/request-insert?role=${parsedUser.role}&username=${parsedUser.username}`);
          console.log('data', data);
          if (data.status === 200) {
            setUsers(data.data[0].data);
          } else {
            console.error('Failed to fetch data:', data.statusText);
          }
        } catch (e) {
          console.error('Error in AssignUser component:', e);
        }
      };
    }
    fetchData();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      const response = await axios.put('/api/request-insert', { id, status });
      if (response.data[0].status === 200) {
        console.log('data', response.data[0]);
        toast.success('User status changed successfully');
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, status: status === 'disable' ? 'enable' : 'disable' } : user
          )
        );
      }
      if (response.data[0].status === 400) {
        toast.error(response.data[0].message);
      }
    }
    catch (error) {
      toast.error('Error changing user status');
      console.error('Error updating user status:', error);
    }
  }

  const handleRole = async (id, role) => {
    console.log('id and role', id, role);
    try {
      const response = await axios.put('/api/request-insert', { id, role });
      if (response.data[0].status === 200) {
        console.log('data', response.data[0]);
        toast.success('User role changed successfully');
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...user, role: role } : user
          )
        );
      }
      if (response.data[0].status === 400) {
        toast.error(response.data[0].message);
      }
    } catch (error) {
      toast.error('Error changing user role');
      console.error('Error updating user role:', error);
    }
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone No</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization Name</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Current Role</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>

              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</TableHead>

            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.filter(user => user.role !== 'SuperAdmin').length > 0 ? (
              users
                .filter(user => user.role !== 'SuperAdmin') // Exclude users with the role 'SuperAdmin'
                .map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-100">

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.username}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phone_no}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.hospital_name}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <select className='bg-gray-50 border border-black text-gray-900 text-sm rounded-lg p-2'
                        onChange={(e) => handleRole(user.id, e.target.value)}
                      >
                        <option value="NormalUser">NormalUser</option>
                        <option value="AdminUser">AdminUser</option>
                      </select>
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.status}
                    </TableCell>

                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        className={`text-white ${user.status === 'disable' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                        onClick={() => handleStatus(user.id, user.status)}
                      >
                        {user.status === 'disable' ? 'Enable' : 'Disable'}
                      </Button>

                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan="8" className="py-4 text-gray-500">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {admin && admin.role === 'SuperAdmin' && (
          <Button className="mt-4 bg-orange-500 text-white hover:bg-orange-600 ">
            <a href="/" className="text-white font-bold">Dashboard</a>
          </Button>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AssignUser;