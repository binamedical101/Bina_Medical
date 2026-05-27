import asyncHandler from 'express-async-handler';
import Medicine from '../models/medicineModel.js';
import Category from '../models/categoryModel.js';

// Helper to escape regex special characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Fetch all medicines with pagination, search & filter
// @route   GET /api/medicines
// @access  Public
const getMedicines = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;

  // Keyword search
  const keyword = req.query.keyword
    ? {
        name: {
          $regex: escapeRegExp(req.query.keyword),
          $options: 'i',
        },
      }
    : {};

  // Category filter
  const category = req.query.category ? { category: req.query.category } : {};

  // Prescription filter
  const prescription = req.query.prescription
    ? { prescriptionRequired: req.query.prescription === 'true' }
    : {};

  // Offer filter
  const isOffer = req.query.isOffer === 'true'
    ? { discountPercentage: { $gt: 0 } }
    : {};

  // Build filter object
  const filter = { ...keyword, ...category, ...prescription, ...isOffer };

  const count = await Medicine.countDocuments(filter);
  const medicines = await Medicine.find(filter)
    .populate('category', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ medicines, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single medicine
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id).populate(
    'category',
    'name'
  );

  if (medicine) {
    res.json(medicine);
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

// @desc    Create a medicine
// @route   POST /api/medicines
// @access  Private/Admin
const createMedicine = asyncHandler(async (req, res) => {
  try {
    // Find a default category, or create one if none exists
    let defaultCategory = await Category.findOne();
    if (!defaultCategory) {
      defaultCategory = await Category.create({
        name: 'Uncategorized',
        description: 'Default category for new items',
      });
    }

    const categoryId = req.body?.categoryId || defaultCategory._id;

    const medicine = new Medicine({
      name: 'Sample name',
      genericName: 'Sample generic name',
      price: 0,
      category: categoryId,
      images: ['/images/sample.jpg'],
      manufacturer: 'Sample manufacturer',
      stockQuantity: 0,
      description: 'Sample description',
      composition: 'Sample composition',
      dosage: 'Sample dosage',
      expiryDate: new Date(),
    });

    const createdMedicine = await medicine.save();
    res.status(201).json(createdMedicine);
  } catch (error) {
    console.error('CREATE MEDICINE ERROR:', error);
    res.status(500);
    throw new Error(`Failed to create medicine: ${error.message}`);
  }
});

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private/Admin
const updateMedicine = asyncHandler(async (req, res) => {
  const {
    name,
    genericName,
    price,
    description,
    images,
    manufacturer,
    category,
    stockQuantity,
    composition,
    dosage,
    sideEffects,
    expiryDate,
    prescriptionRequired,
    discountPercentage,
    batchId,
    supplier,
  } = req.body;

  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    medicine.name = name || medicine.name;
    medicine.genericName = genericName || medicine.genericName;
    medicine.price = price !== undefined ? price : medicine.price;
    medicine.description = description || medicine.description;
    medicine.images = images || medicine.images;
    medicine.manufacturer = manufacturer || medicine.manufacturer;
    medicine.category = category || medicine.category;
    medicine.stockQuantity = stockQuantity !== undefined ? stockQuantity : medicine.stockQuantity;
    medicine.composition = composition || medicine.composition;
    medicine.dosage = dosage || medicine.dosage;
    medicine.sideEffects = sideEffects || medicine.sideEffects;
    medicine.expiryDate = expiryDate || medicine.expiryDate;
    medicine.prescriptionRequired = prescriptionRequired !== undefined ? prescriptionRequired : medicine.prescriptionRequired;
    medicine.discountPercentage = discountPercentage !== undefined ? discountPercentage : medicine.discountPercentage;
    medicine.batchId = batchId || medicine.batchId;
    medicine.supplier = supplier || medicine.supplier;

    const updatedMedicine = await medicine.save();
    res.json(updatedMedicine);
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private/Admin
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    await Medicine.deleteOne({ _id: medicine._id });
    res.json({ message: 'Medicine removed' });
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

// @desc    Create new review
// @route   POST /api/medicines/:id/reviews
// @access  Private
const createMedicineReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const medicine = await Medicine.findById(req.params.id);

  if (medicine) {
    const alreadyReviewed = medicine.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Medicine already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    medicine.reviews.push(review);

    medicine.numReviews = medicine.reviews.length;

    medicine.rating =
      medicine.reviews.reduce((acc, item) => item.rating + acc, 0) /
      medicine.reviews.length;

    await medicine.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Medicine not found');
  }
});

export {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  createMedicineReview,
};
