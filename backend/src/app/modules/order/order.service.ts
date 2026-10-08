import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import Cart from '../cart/cart.model';
import Recipe from '../recipe/recipe.model';
import User from '../user/user.model';
import { IOrder, IOrderItem, OrderStatus, PaymentStatus } from './order.interface';
import Order from './order.model';

export const createOrder = async (
  userId: string,
  userEmail: string,
  payload: { items?: Array<{ recipeId: string; quantity: number }>; fromCart?: boolean }
) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'USER') {
    throw new AppError(403, 'Only customers (USER role) can place orders');
  }

  let itemsToOrder: Array<{ recipeId: string; quantity: number }> = [];

  if (payload.fromCart) {
    const cart = await Cart.findOne({ userId: new Types.ObjectId(userId) });
    if (!cart || cart.items.length === 0) {
      throw new AppError(400, 'Your cart is empty');
    }
    itemsToOrder = cart.items.map((item) => ({
      recipeId: item.recipeId.toString(),
      quantity: item.quantity
    }));
  } else if (payload.items && payload.items.length > 0) {
    itemsToOrder = payload.items;
  } else {
    throw new AppError(400, 'No items provided for order');
  }

  // Strictly verify items and retrieve exact prices from DB to prevent client price tampering
  const validatedOrderItems: IOrderItem[] = [];
  let calculatedTotal = 0;

  for (const item of itemsToOrder) {
    const recipe = await Recipe.findById(item.recipeId);
    if (!recipe) {
      throw new AppError(404, `Recipe with ID ${item.recipeId} not found`);
    }

    const price = recipe.price || 0;
    const quantity = Math.max(1, item.quantity || 1);

    validatedOrderItems.push({
      recipeId: recipe._id as Types.ObjectId,
      recipeName: recipe.recipeName,
      recipeImage: recipe.recipeImage,
      price,
      quantity
    });

    calculatedTotal += price * quantity;
  }

  const orderData: Partial<IOrder> = {
    userId: new Types.ObjectId(userId),
    userEmail,
    items: validatedOrderItems,
    totalAmount: calculatedTotal,
    paymentStatus: 'pending',
    orderStatus: 'pending'
  };

  const order = await Order.create(orderData);

  // If order was created from cart, clear the cart
  if (payload.fromCart) {
    await Cart.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { items: [], totalAmount: 0 }
    );
  }

  return order;
};

export const getMyOrders = async (userId: string, query: any) => {
  const page = parseInt(String(query.page || '1'), 10);
  const limit = parseInt(String(query.limit || '10'), 10);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ userId: new Types.ObjectId(userId) })
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    data: orders
  };
};

export const getOrderById = async (
  orderId: string,
  user: { userId: string; role: string }
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  if (user.role === 'USER' && order.userId.toString() !== user.userId) {
    throw new AppError(403, 'You are not authorized to view this order');
  }

  return order;
};

export const getAllOrdersAdmin = async (query: any) => {
  const page = parseInt(String(query.page || '1'), 10);
  const limit = parseInt(String(query.limit || '10'), 10);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.orderStatus) {
    filter.orderStatus = query.orderStatus;
  }
  if (query.search) {
    filter.userEmail = new RegExp(query.search.trim(), 'i');
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    },
    data: orders
  };
};

export const updateOrderStatus = async (
  orderId: string,
  payload: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  const updatedOrder = await Order.findByIdAndUpdate(orderId, payload, {
    new: true,
    runValidators: true
  });

  return updatedOrder;
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatus
};

export default OrderService;
