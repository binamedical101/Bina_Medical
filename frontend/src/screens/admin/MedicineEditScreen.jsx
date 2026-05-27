import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Tag, FileText, Image as ImageIcon, Box, AlertCircle, IndianRupee, Percent } from 'lucide-react';
import Message from '../../components/Message';
import Loader from '../../components/Loader';
import {
  useGetMedicineDetailsQuery,
  useUpdateMedicineMutation,
  useUploadMedicineImageMutation,
} from '../../slices/medicinesApiSlice';
import { useGetCategoriesQuery } from '../../slices/categoriesApiSlice';

const MedicineEditScreen = () => {
  const { id: medicineId } = useParams();

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [description, setDescription] = useState('');
  const [prescriptionRequired, setPrescriptionRequired] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [batchId, setBatchId] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: medicine, isLoading, error, refetch } = useGetMedicineDetailsQuery(medicineId);
  const [updateMedicine, { isLoading: loadingUpdate }] = useUpdateMedicineMutation();
  const [uploadMedicineImage, { isLoading: loadingUpload }] = useUploadMedicineImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (medicine) {
      setName(medicine.name);
      setGenericName(medicine.genericName);
      setPrice(medicine.price);
      setImages(medicine.images || []);
      setCategory(medicine.category?._id || medicine.category);
      setStockQuantity(medicine.stockQuantity);
      setDescription(medicine.description);
      setPrescriptionRequired(medicine.prescriptionRequired);
      setDiscountPercentage(medicine.discountPercentage);
      setBatchId(medicine.batchId || '');
      setSupplier(medicine.supplier || '');
      // Format expiryDate for input type="date"
      if (medicine.expiryDate) {
        setExpiryDate(new Date(medicine.expiryDate).toISOString().split('T')[0]);
      }
    }
  }, [medicine]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await updateMedicine({
        medicineId,
        name,
        genericName,
        price,
        images,
        category,
        stockQuantity,
        description,
        prescriptionRequired,
        discountPercentage,
        batchId,
        supplier,
        expiryDate,
      }).unwrap();
      refetch();
      navigate('/admin/medicinelist');
    } catch (err) {
      console.log(err);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await uploadMedicineImage(formData).unwrap();
        setImages([res.image]); // Replace image array with uploaded one for now
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant='danger'>{error?.data?.message || error.error}</Message>;

  return (
    <div className='max-w-5xl mx-auto'>
      <Link to='/admin/medicinelist' className='inline-flex items-center text-gray-500 hover:text-pe-teal mb-6 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 transition-colors'>
        <ArrowLeft className='w-4 h-4 mr-2' />
        Back to Products
      </Link>

      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
        <div className='bg-pe-teal px-8 py-6 border-b border-pe-teal/20'>
          <h1 className='text-2xl font-extrabold text-white'>Edit Product Information</h1>
          <p className='text-pe-teal-light text-sm mt-1'>Update medicine details, pricing, and inventory.</p>
        </div>

        <div className='p-8'>
          {loadingUpdate && <Loader />}

          <form onSubmit={submitHandler} className='space-y-8'>
            
            {/* Section: Basic Info */}
            <div>
              <h2 className='text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2'>
                <Tag className='w-5 h-5 mr-2 text-pe-teal' /> Basic Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Product Name</label>
                  <input
                    type='text'
                    className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all'
                    placeholder='e.g. Paracetamol 500mg'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Generic Name / Composition</label>
                  <input
                    type='text'
                    className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal focus:border-transparent transition-all'
                    placeholder='e.g. Acetaminophen'
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section: Pricing & Inventory */}
            <div>
              <h2 className='text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2'>
                <Box className='w-5 h-5 mr-2 text-pe-teal' /> Pricing & Inventory
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Price (₹)</label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <IndianRupee className='w-4 h-4 text-gray-400' />
                    </div>
                    <input
                      type='number'
                      className='appearance-none border border-gray-300 rounded-xl w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                      placeholder='0.00'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Discount (%)</label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Percent className='w-4 h-4 text-gray-400' />
                    </div>
                    <input
                      type='number'
                      className='appearance-none border border-gray-300 rounded-xl w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                      placeholder='0'
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Stock Quantity</label>
                  <input
                    type='number'
                    className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                    placeholder='Available units'
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-6'>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Batch ID</label>
                  <input
                    type='text'
                    className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                    placeholder='e.g. BATCH-001'
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                  />
                </div>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Supplier / Vendor</label>
                  <input
                    type='text'
                    className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                    placeholder='Supplier name'
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                  />
                </div>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Expiry Date</label>
                  <input
                    type='date'
                    className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section: Category & Details */}
            <div>
              <h2 className='text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2'>
                <FileText className='w-5 h-5 mr-2 text-pe-teal' /> Details & Categorization
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-gray-700 text-sm font-bold mb-2'>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className='border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal bg-white transition-all'
                  >
                    <option value=''>Select Category</option>
                    {categoriesData?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex items-center mt-6'>
                  <label className='flex items-center cursor-pointer bg-orange-50 px-4 py-3 rounded-xl border border-orange-100 w-full hover:bg-orange-100 transition-colors'>
                    <input
                      type='checkbox'
                      className='form-checkbox h-5 w-5 text-pe-orange rounded border-gray-300 focus:ring-pe-orange'
                      checked={prescriptionRequired}
                      onChange={(e) => setPrescriptionRequired(e.target.checked)}
                    />
                    <div className='ml-3'>
                      <span className='block text-gray-900 font-bold text-sm'>Requires Prescription</span>
                      <span className='block text-orange-600 text-xs'>Check if this item needs RX verification</span>
                    </div>
                    <AlertCircle className='w-5 h-5 ml-auto text-pe-orange opacity-50' />
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className='block text-gray-700 text-sm font-bold mb-2'>Product Description</label>
              <textarea
                className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                placeholder='Detailed description of the medicine, uses, side effects, etc.'
                rows='5'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Section: Image */}
            <div>
              <h2 className='text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2'>
                <ImageIcon className='w-5 h-5 mr-2 text-pe-teal' /> Product Image
              </h2>
              
              <div className='flex items-start gap-6'>
                {/* Current Image Preview */}
                <div className='w-40 h-40 shrink-0 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center relative group'>
                  {images[0] ? (
                    <img src={images[0]} alt='Product' className='w-full h-full object-cover' />
                  ) : (
                    <ImageIcon className='w-12 h-12 text-gray-300' />
                  )}
                </div>

                <div className='flex-1 space-y-4'>
                  <div>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>Image URL</label>
                    <input
                      type='text'
                      className='appearance-none border border-gray-300 rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pe-teal transition-all'
                      placeholder='https://example.com/image.jpg'
                      value={images[0] || ''}
                      onChange={(e) => setImages([e.target.value])}
                    />
                  </div>
                  
                  <div className='flex items-center w-full'>
                    <div className='relative w-full'>
                      <input
                        type='file'
                        onChange={uploadFileHandler}
                        className='hidden'
                        id='file-upload'
                      />
                      <label htmlFor='file-upload' className='cursor-pointer flex flex-col items-center justify-center w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl py-6 px-4 text-gray-500 hover:bg-gray-100 hover:border-pe-teal hover:text-pe-teal transition-all'>
                        <Upload className='w-8 h-8 mb-2 opacity-50' />
                        <span className='font-medium'>Click to upload an image file</span>
                        <span className='text-xs mt-1 opacity-75'>PNG, JPG up to 5MB</span>
                      </label>
                      {loadingUpload && (
                        <div className='absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center'>
                          <Loader />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className='pt-6 border-t border-gray-100 flex justify-end'>
              <button
                type='submit'
                className='flex items-center justify-center bg-pe-teal text-white font-bold py-3 px-8 rounded-xl hover:bg-pe-teal-dark shadow-md transition-colors disabled:opacity-50'
                disabled={loadingUpdate}
              >
                <Save className='w-5 h-5 mr-2' />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MedicineEditScreen;
