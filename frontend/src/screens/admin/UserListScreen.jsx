import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Check, X, Edit } from 'lucide-react';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetUsersQuery, useDeleteUserMutation } from '../../slices/usersApiSlice';

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        refetch();
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900'>Users Management</h1>
          <p className='text-gray-500 text-sm mt-1'>Manage user accounts, roles, and access.</p>
        </div>
      </div>

      {loadingDelete && <Loader />}

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>User ID</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Name</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Email</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Role</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {users.map((user) => (
                <tr key={user._id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4 font-mono text-sm text-gray-600'>{user._id}</td>
                  <td className='px-6 py-4 text-sm font-bold text-gray-900 flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-pe-teal-light text-pe-teal flex items-center justify-center font-bold'>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600'>
                    <a href={`mailto:${user.email}`} className='hover:text-pe-teal transition-colors'>{user.email}</a>
                  </td>
                  <td className='px-6 py-4'>
                    {user.role === 'Admin' ? (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200'>
                        Administrator
                      </span>
                    ) : (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200'>
                        Customer
                      </span>
                    )}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex justify-end gap-2'>
                      <Link to={`/admin/user/${user._id}/edit`}>
                        <button className='p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors' title='Edit user'>
                          <Edit className='w-4 h-4' />
                        </button>
                      </Link>
                      <button
                        className='p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors'
                        onClick={() => deleteHandler(user._id)}
                        disabled={user.role === 'Admin'} // Prevent deleting admins for now
                        title={user.role === 'Admin' ? 'Cannot delete admin' : 'Delete user'}
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserListScreen;
