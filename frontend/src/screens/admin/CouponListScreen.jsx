import React, { useState } from 'react';
import { useGetCouponsQuery, useCreateCouponMutation, useDeleteCouponMutation } from '../../slices/couponsApiSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { Plus, Trash2, Tag, Percent, IndianRupee } from 'lucide-react';

const CouponListScreen = () => {
  const { data: coupons, refetch, isLoading, error } = useGetCouponsQuery();
  const [createCoupon, { isLoading: loadingCreate }] = useCreateCouponMutation();
  const [deleteCoupon, { isLoading: loadingDelete }] = useDeleteCouponMutation();

  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        refetch();
      } catch (err) {
        alert(err?.data?.message || err.error);
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await createCoupon({
        code: code.toUpperCase(),
        discountType,
        discountAmount: Number(discountAmount),
        minPurchaseAmount: Number(minPurchaseAmount),
        expiryDate,
        isActive,
      }).unwrap();
      setShowModal(false);
      setCode('');
      setDiscountAmount(0);
      setMinPurchaseAmount(0);
      setExpiryDate('');
      refetch();
    } catch (err) {
      alert(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='max-w-7xl mx-auto relative'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-2xl font-extrabold text-gray-900'>Coupons & Offers</h1>
          <p className='text-gray-500 text-sm mt-1'>Create and manage promotional discount codes.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='bg-pe-teal hover:bg-pe-teal-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2'
        >
          <Plus className='w-4 h-4' /> Create Coupon
        </button>
      </div>

      {(loadingCreate || loadingDelete) && <Loader />}

      <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gray-50 border-b border-gray-100'>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Code</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Discount</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Min Purchase</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Expiry Date</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-4 text-xs font-extrabold text-gray-500 uppercase tracking-wider text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {coupons.map((coupon) => (
                <tr key={coupon._id} className='hover:bg-gray-50 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='inline-flex items-center gap-2 px-3 py-1 bg-pe-teal-light text-pe-teal font-mono font-bold rounded-lg border border-pe-teal/20'>
                      <Tag className='w-3 h-3' />
                      {coupon.code}
                    </div>
                  </td>
                  <td className='px-6 py-4 text-sm font-bold text-gray-900 flex items-center gap-1'>
                    {coupon.discountType === 'percentage' ? (
                      <><Percent className='w-4 h-4 text-pe-orange' /> {coupon.discountAmount}%</>
                    ) : (
                      <><IndianRupee className='w-4 h-4 text-pe-teal' /> ₹{coupon.discountAmount}</>
                    )}
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600'>₹{coupon.minPurchaseAmount}</td>
                  <td className='px-6 py-4 text-sm text-gray-600'>
                    {new Date(coupon.expiryDate).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4'>
                    {coupon.isActive && new Date(coupon.expiryDate) > new Date() ? (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800'>Active</span>
                    ) : (
                      <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800'>Expired/Inactive</span>
                    )}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <button
                      className='p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors'
                      onClick={() => deleteHandler(coupon._id)}
                      title='Delete Coupon'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan='6' className='px-6 py-12 text-center text-gray-500'>
                    No coupons created yet. Click "Create Coupon" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal Overlay */}
      {showModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4'>
          <div className='bg-white rounded-2xl shadow-xl max-w-md w-full p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>Create New Coupon</h2>
            <form onSubmit={submitHandler} className='space-y-4'>
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>Coupon Code</label>
                <input
                  type='text'
                  className='w-full border border-gray-300 rounded-lg p-2 focus:ring-pe-teal focus:border-pe-teal uppercase'
                  placeholder='e.g. SUMMER20'
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1'>Discount Type</label>
                  <select
                    className='w-full border border-gray-300 rounded-lg p-2 focus:ring-pe-teal focus:border-pe-teal'
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value='percentage'>Percentage (%)</option>
                    <option value='fixed'>Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1'>Discount Amount</label>
                  <input
                    type='number'
                    className='w-full border border-gray-300 rounded-lg p-2 focus:ring-pe-teal focus:border-pe-teal'
                    placeholder={discountType === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>Min Purchase Amount (₹)</label>
                <input
                  type='number'
                  className='w-full border border-gray-300 rounded-lg p-2 focus:ring-pe-teal focus:border-pe-teal'
                  placeholder='e.g. 1000'
                  value={minPurchaseAmount}
                  onChange={(e) => setMinPurchaseAmount(e.target.value)}
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>Expiry Date</label>
                <input
                  type='date'
                  className='w-full border border-gray-300 rounded-lg p-2 focus:ring-pe-teal focus:border-pe-teal'
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              <div className='flex items-center mt-2'>
                <input
                  type='checkbox'
                  className='mr-2 w-4 h-4 text-pe-teal focus:ring-pe-teal border-gray-300 rounded'
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label className='text-sm font-bold text-gray-700'>Is Active</label>
              </div>

              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={() => setShowModal(false)}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 text-sm font-medium text-white bg-pe-teal hover:bg-pe-teal-dark rounded-lg transition-colors'
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponListScreen;
