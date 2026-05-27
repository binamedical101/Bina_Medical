import React, { useState } from 'react';
import { useGetInventoryStatsQuery } from '../../slices/adminApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, Package, Edit, Search } from 'lucide-react';

const InventoryScreen = () => {
  const { data, isLoading, error } = useGetInventoryStatsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('low-stock');

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  const filterItems = (items) => {
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.batchId && item.batchId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const displayItems = activeTab === 'low-stock' ? filterItems(data.lowStockItems) : filterItems(data.expiringSoon);

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900'>Inventory Management</h1>
          <p className='text-gray-500 text-sm mt-1'>Monitor stock levels, batches, and expiry dates.</p>
        </div>
        <Link 
          to='/admin/medicinelist'
          className='bg-pe-teal hover:bg-pe-teal-dark text-white px-4 py-2 rounded-lg font-medium transition-colors'
        >
          Manage Products
        </Link>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between'>
          <div>
            <p className='text-sm font-bold text-gray-500 mb-1'>Total Tracked Items</p>
            <h3 className='text-3xl font-extrabold text-gray-900'>{data.totalItems}</h3>
          </div>
          <div className='bg-blue-50 p-4 rounded-full'>
            <Package className='w-8 h-8 text-blue-500' />
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-red-100 p-6 flex items-center justify-between relative overflow-hidden'>
          <div className='absolute left-0 top-0 bottom-0 w-1 bg-red-500'></div>
          <div>
            <p className='text-sm font-bold text-red-500 mb-1'>Low Stock Alerts</p>
            <h3 className='text-3xl font-extrabold text-gray-900'>{data.lowStockCount}</h3>
          </div>
          <div className='bg-red-50 p-4 rounded-full'>
            <AlertTriangle className='w-8 h-8 text-red-500' />
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-orange-100 p-6 flex items-center justify-between relative overflow-hidden'>
          <div className='absolute left-0 top-0 bottom-0 w-1 bg-orange-500'></div>
          <div>
            <p className='text-sm font-bold text-orange-500 mb-1'>Expiring Soon (3 Mos)</p>
            <h3 className='text-3xl font-extrabold text-gray-900'>{data.expiringCount}</h3>
          </div>
          <div className='bg-orange-50 p-4 rounded-full'>
            <Clock className='w-8 h-8 text-orange-500' />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        
        {/* Toolbar */}
        <div className='p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50'>
          
          <div className='flex items-center gap-2 bg-gray-200/50 p-1 rounded-lg'>
            <button 
              className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'low-stock' ? 'bg-white text-pe-teal shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setActiveTab('low-stock')}
            >
              Low Stock Items ({data.lowStockCount})
            </button>
            <button 
              className={`px-4 py-2 rounded-md font-bold text-sm transition-colors ${activeTab === 'expiring' ? 'bg-white text-pe-teal shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => setActiveTab('expiring')}
            >
              Expiring Soon ({data.expiringCount})
            </button>
          </div>

          <div className='relative w-full md:w-64'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input 
              type='text' 
              placeholder='Search by name or batch...' 
              className='w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pe-teal focus:border-transparent'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Product</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Batch ID</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Supplier</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Stock</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Expiry Date</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center text-gray-500'>
                    No items found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayItems.map((item) => {
                  const isExpiring = new Date(item.expiryDate) < new Date(new Date().setMonth(new Date().getMonth() + 3));
                  const isLowStock = item.stockQuantity < 10;
                  
                  return (
                    <tr key={item._id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <div className='font-bold text-gray-900'>{item.name}</div>
                        <div className='text-xs text-gray-500'>{item.genericName}</div>
                      </td>
                      <td className='px-6 py-4 font-mono text-sm text-gray-600'>{item.batchId || 'N/A'}</td>
                      <td className='px-6 py-4 text-sm text-gray-600'>{item.supplier || 'N/A'}</td>
                      <td className='px-6 py-4'>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.stockQuantity} units
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span className={`text-sm font-medium ${isExpiring ? 'text-orange-600' : 'text-gray-600'}`}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <Link 
                          to={`/admin/medicine/${item._id}/edit`}
                          className='inline-flex items-center justify-center p-2 text-pe-teal hover:bg-pe-teal-light hover:text-pe-teal-dark rounded-lg transition-colors'
                          title='Update Stock/Batch'
                        >
                          <Edit className='w-4 h-4' />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;
