import React, { useState, useEffect } from 'react';
import { Save, Shield, Settings2, CreditCard, Mail, Globe, Database, Server, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../slices/settingsApiSlice';
import { useProfileMutation } from '../../slices/usersApiSlice';
import { setCredentials } from '../../slices/authSlice';

const SettingsScreen = () => {
  const { data: settingsData, isLoading, refetch } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: isUpdatingProfile }] = useProfileMutation();

  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [shippingFee, setShippingFee] = useState(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Account states
  const [accountName, setAccountName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (settingsData) {
      setStoreName(settingsData.storeName || '');
      setContactEmail(settingsData.contactEmail || '');
      setStoreAddress(settingsData.storeAddress || '');
      setTaxRate(settingsData.taxRate || 18);
      setShippingFee(settingsData.shippingFee || 50);
      setFreeShippingThreshold(settingsData.freeShippingThreshold || 1000);
      setMaintenanceMode(settingsData.maintenanceMode || false);
      setEmailNotifications(settingsData.emailNotifications !== undefined ? settingsData.emailNotifications : true);
    }
    if (userInfo) {
      setAccountName(userInfo.name || '');
      setAccountEmail(userInfo.email || '');
    }
  }, [settingsData, userInfo]);

  const saveSettingsHandler = async (e) => {
    e.preventDefault();
    try {
      await updateSettings({
        storeName,
        contactEmail,
        storeAddress,
        taxRate,
        shippingFee,
        freeShippingThreshold,
        emailNotifications,
        maintenanceMode,
      }).unwrap();
      refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err?.data?.message || err.error);
    }
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const res = await updateProfile({
        _id: userInfo._id,
        name: accountName,
        email: accountEmail,
        password,
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      setProfileSaved(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      alert(err?.data?.message || err.error);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'finance', label: 'Finance & Shipping', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'system', label: 'System Logic', icon: Server },
    { id: 'account', label: 'Admin Account & Security', icon: User },
  ];

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900'>Platform Settings</h1>
          <p className='text-gray-500 text-sm mt-1'>Configure global parameters and preferences for your pharmacy platform.</p>
        </div>
        {activeTab !== 'account' && (
          <button
            onClick={saveSettingsHandler}
            disabled={isUpdating}
            className='bg-pe-teal hover:bg-pe-teal-dark text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-pe-teal/30 transition-all flex items-center gap-2'
          >
            <Save className='w-5 h-5' /> {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {isLoading && <Loader />}
      {saved && <Message variant='success'>Settings saved successfully!</Message>}
      {profileSaved && <Message variant='success'>Admin profile updated successfully!</Message>}

      <div className='flex flex-col lg:flex-row gap-8'>
        
        {/* Sidebar Tabs */}
        <div className='lg:w-1/4'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex flex-col gap-1'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-colors ${
                    isActive 
                      ? 'bg-pe-teal-light text-pe-teal' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-pe-teal' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className='lg:w-3/4'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-8'>
            <form onSubmit={saveSettingsHandler}>
              
              {/* General Tab */}
              {activeTab === 'general' && (
                <div className='space-y-6 animate-fadeIn'>
                  <div className='border-b border-gray-100 pb-4 mb-6'>
                    <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                      <Settings2 className='w-6 h-6 text-pe-teal' /> General Configuration
                    </h2>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>Store Name</label>
                      <input 
                        type='text' 
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>Contact Support Email</label>
                      <input 
                        type='email' 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                      />
                    </div>
                    <div className='md:col-span-2'>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>Store Address</label>
                      <textarea 
                        rows='3'
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* Finance Tab */}
              {activeTab === 'finance' && (
                <div className='space-y-6 animate-fadeIn'>
                  <div className='border-b border-gray-100 pb-4 mb-6'>
                    <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                      <CreditCard className='w-6 h-6 text-pe-orange' /> Finance & Shipping
                    </h2>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>Default Tax Rate (%)</label>
                      <input 
                        type='number' 
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>Base Shipping Fee (₹)</label>
                      <input 
                        type='number' 
                        value={shippingFee}
                        onChange={(e) => setShippingFee(Number(e.target.value))}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                      />
                    </div>
                    <div>
                      <label className='block text-sm font-bold text-gray-700 mb-2'>Free Shipping Threshold (₹)</label>
                      <input 
                        type='number' 
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                        className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className='space-y-6 animate-fadeIn'>
                  <div className='border-b border-gray-100 pb-4 mb-6'>
                    <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                      <Mail className='w-6 h-6 text-blue-500' /> Notifications & Email
                    </h2>
                  </div>

                  <div className='space-y-4'>
                    <label className='flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors'>
                      <input 
                        type='checkbox' 
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        className='w-5 h-5 text-pe-teal focus:ring-pe-teal rounded' 
                      />
                      <div>
                        <p className='font-bold text-gray-900'>Order Placement Emails</p>
                        <p className='text-sm text-gray-500'>Send customers an email receipt immediately after checkout.</p>
                      </div>
                    </label>
                    <label className='flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors'>
                      <input 
                        type='checkbox' 
                        defaultChecked={true}
                        className='w-5 h-5 text-pe-teal focus:ring-pe-teal rounded' 
                      />
                      <div>
                        <p className='font-bold text-gray-900'>Low Stock Alerts</p>
                        <p className='text-sm text-gray-500'>Notify admins when inventory drops below the safe threshold.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* System Tab */}
              {activeTab === 'system' && (
                <div className='space-y-6 animate-fadeIn'>
                  <div className='border-b border-gray-100 pb-4 mb-6'>
                    <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                      <Shield className='w-6 h-6 text-red-500' /> System Logic
                    </h2>
                  </div>

                  <div className='space-y-6'>
                    <div className='p-6 bg-red-50 border border-red-100 rounded-xl'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-lg font-bold text-red-800'>Maintenance Mode</h3>
                          <p className='text-red-600 text-sm mt-1'>Temporarily disable the storefront for users. Only admins can log in.</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                          <input 
                            type='checkbox' 
                            className='sr-only peer' 
                            checked={maintenanceMode}
                            onChange={(e) => setMaintenanceMode(e.target.checked)}
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    </div>

                    <div className='flex justify-between items-center p-4 border border-gray-200 rounded-xl'>
                      <div className='flex items-center gap-3'>
                        <Database className='w-8 h-8 text-gray-400' />
                        <div>
                          <p className='font-bold text-gray-900'>Database Backups</p>
                          <p className='text-sm text-gray-500'>Last backup performed: Today at 03:00 AM</p>
                        </div>
                      </div>
                      <button type='button' className='px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors'>
                        Force Backup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Account Tab (Separate Form) */}
            {activeTab === 'account' && (
              <form onSubmit={updateProfileHandler} className='space-y-6 animate-fadeIn'>
                <div className='border-b border-gray-100 pb-4 mb-6'>
                  <h2 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                    <User className='w-6 h-6 text-pe-teal' /> Admin Account & Security
                  </h2>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>Full Name</label>
                    <input 
                      type='text' 
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>Email Address</label>
                    <input 
                      type='email' 
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>New Password (optional)</label>
                    <input 
                      type='password' 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='Leave blank to keep current'
                      className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>Confirm New Password</label>
                    <input 
                      type='password' 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className='w-full border border-gray-300 rounded-lg p-3 focus:ring-pe-teal focus:border-pe-teal' 
                    />
                  </div>
                </div>

                <div className='pt-4'>
                  <button
                    type='submit'
                    disabled={isUpdatingProfile}
                    className='bg-pe-teal hover:bg-pe-teal-dark text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-pe-teal/30 transition-all flex items-center gap-2'
                  >
                    <Save className='w-5 h-5' /> {isUpdatingProfile ? 'Updating...' : 'Update Admin Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsScreen;
