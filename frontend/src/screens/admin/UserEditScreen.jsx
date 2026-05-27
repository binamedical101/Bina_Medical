import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import FormContainer from '../../components/FormContainer';
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from '../../slices/usersApiSlice';

const UserEditScreen = () => {
  const { id: userId } = useParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: user, isLoading, error, refetch } = useGetUserDetailsQuery(userId);

  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setIsAdmin(user.role === 'Admin');
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateUser({ userId, name, email, role: isAdmin ? 'Admin' : 'Customer' }).unwrap();
      refetch();
      navigate('/admin/userlist');
    } catch (err) {
      console.log(err);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <FormContainer>
      <Link to='/admin/userlist' className='inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Go Back
      </Link>

      <div className='bg-white p-8 rounded-2xl shadow-xl border border-gray-100'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit User</h1>

        {loadingUpdate && <Loader />}

        <form onSubmit={submitHandler}>
          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Name</label>
            <input
              type='text'
              className='shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2'>Email Address</label>
            <input
              type='email'
              className='shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='mb-6'>
            <label className='flex items-center cursor-pointer'>
              <input
                type='checkbox'
                className='form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500'
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
              <span className='ml-2 text-gray-700 font-bold text-sm'>Is Admin?</span>
            </label>
          </div>

          <button
            type='submit'
            className='w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
            disabled={loadingUpdate}
          >
            <Save className='w-5 h-5 mr-2' />
            Update User
          </button>
        </form>
      </div>
    </FormContainer>
  );
};

export default UserEditScreen;
