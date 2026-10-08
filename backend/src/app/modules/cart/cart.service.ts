import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import Recipe from '../recipe/recipe.model';
import Cart from './cart.model';

export const addToCart = async (userId: string, recipeId: string, quantity = 1) => {
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw new AppError(404, 'Recipe not found');
  }

  let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });

  if (!cart) {
    cart = new Cart({
      userId: new Types.ObjectId(userId),
      items: [],
      totalAmount: 0
    });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.recipeId.toString() === recipeId
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].price = recipe.price || 0;
  } else {
    cart.items.push({
      recipeId: recipe._id as Types.ObjectId,
      quantity,
      price: recipe.price || 0
    });
  }

  // Recalculate total amount securely from verified database prices
  cart.totalAmount = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  await cart.save();

  return await Cart.findById(cart._id).populate({
    path: 'items.recipeId',
    select: 'recipeName recipeImage category cuisineType price preparationTime'
  });
};

export const getCart = async (userId: string) => {
  let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) }).populate({
    path: 'items.recipeId',
    select: 'recipeName recipeImage category cuisineType price preparationTime'
  });

  if (!cart) {
    cart = await Cart.create({
      userId: new Types.ObjectId(userId),
      items: [],
      totalAmount: 0
    });
  }

  return cart;
};

export const updateCartItemQuantity = async (
  userId: string,
  recipeId: string,
  quantity: number
) => {
  const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.recipeId.toString() === recipeId
  );

  if (itemIndex === -1) {
    throw new AppError(404, 'Item not found in cart');
  }

  const recipe = await Recipe.findById(recipeId);
  if (recipe) {
    cart.items[itemIndex].price = recipe.price || 0;
  }

  cart.items[itemIndex].quantity = quantity;

  cart.totalAmount = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  await cart.save();

  return await Cart.findById(cart._id).populate({
    path: 'items.recipeId',
    select: 'recipeName recipeImage category cuisineType price preparationTime'
  });
};

export const removeFromCart = async (userId: string, recipeId: string) => {
  const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
  if (!cart) {
    throw new AppError(404, 'Cart not found');
  }

  cart.items = cart.items.filter((item) => item.recipeId.toString() !== recipeId);

  cart.totalAmount = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  await cart.save();

  return await Cart.findById(cart._id).populate({
    path: 'items.recipeId',
    select: 'recipeName recipeImage category cuisineType price preparationTime'
  });
};

export const clearCart = async (userId: string) => {
  let cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
  if (cart) {
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();
  }
  return { message: 'Cart cleared successfully' };
};

export const CartService = {
  addToCart,
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
};

export default CartService;
