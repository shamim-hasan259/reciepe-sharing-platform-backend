import AppError from '../../errors/AppError';
import Category, { ICategory } from './category.model';

export const createCategory = async (payload: ICategory) => {
  const isExist = await Category.findOne({ name: payload.name.trim() });
  if (isExist) {
    throw new AppError(400, 'Category already exists');
  }
  return await Category.create(payload);
};

export const getAllCategories = async () => {
  return await Category.find().sort({ name: 1 });
};

export const getSingleCategory = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }
  return category;
};

export const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }

  if (payload.name && payload.name !== category.name) {
    const isExist = await Category.findOne({ name: payload.name.trim() });
    if (isExist) {
      throw new AppError(400, 'Another category with this name already exists');
    }
  }

  return await Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

export const deleteCategory = async (id: string) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(404, 'Category not found');
  }
  await Category.findByIdAndDelete(id);
  return null;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory
};

export default CategoryService;
