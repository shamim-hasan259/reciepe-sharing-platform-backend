import crypto from 'crypto';
import { Types } from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import stripe from '../../utils/stripe.utils';
import Order from '../order/order.model';
import User from '../user/user.model';
import Payment, { IPayment } from './payment.model';

export const createOrderCheckoutSession = async (
  userId: string,
  userEmail: string,
  orderId: string
) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(404, 'Order not found');
  }

  if (order.userId.toString() !== userId) {
    throw new AppError(403, 'You are not authorized to pay for this order');
  }

  if (order.paymentStatus === 'paid') {
    throw new AppError(400, 'Order is already paid');
  }

  if (order.totalAmount <= 0) {
    throw new AppError(400, 'Order total must be greater than zero to checkout');
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.recipeName,
        images: item.recipeImage ? [item.recipeImage] : []
      },
      unit_amount: Math.round(item.price * 100) // in cents
    },
    quantity: item.quantity
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: userEmail,
      success_url: `${config.client_url}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${config.client_url}/payment/cancel?order_id=${order._id}`,
      metadata: {
        type: 'ORDER',
        orderId: order._id.toString(),
        userId: userId.toString(),
        userEmail
      }
    });

    order.stripeSessionId = session.id;
    await order.save();

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error: any) {
    // If stripe mock / invalid keys in test environment, provide fallback mock session
    if (config.stripe.secret_key.startsWith('sk_test_mock')) {
      const mockSessionId = `cs_test_${crypto.randomBytes(16).toString('hex')}`;
      order.stripeSessionId = mockSessionId;
      await order.save();
      return {
        sessionId: mockSessionId,
        url: `${config.client_url}/payment/success?session_id=${mockSessionId}&order_id=${order._id}`
      };
    }
    throw error;
  }
};

export const createPremiumCheckoutSession = async (
  userId: string,
  userEmail: string
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (user.isPremium) {
    throw new AppError(400, 'User is already a Premium member');
  }

  const amountInCents = 1999; // $19.99

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'RecipeHub Premium Membership',
              description: 'Unlimited recipe creation for sellers, premium badge, exclusive access'
            },
            unit_amount: amountInCents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: userEmail,
      success_url: `${config.client_url}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.client_url}/premium/cancel`,
      metadata: {
        type: 'PREMIUM_MEMBERSHIP',
        userId: user._id.toString(),
        userEmail
      }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error: any) {
    if (config.stripe.secret_key.startsWith('sk_test_mock')) {
      const mockSessionId = `cs_test_${crypto.randomBytes(16).toString('hex')}`;
      return {
        sessionId: mockSessionId,
        url: `${config.client_url}/premium/success?session_id=${mockSessionId}`
      };
    }
    throw error;
  }
};

export const verifyAndProcessSession = async (sessionId: string) => {
  let session: any;

  if (config.stripe.secret_key.startsWith('sk_test_mock')) {
    // Look up pending order with session id or process mock
    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (order) {
      session = {
        id: sessionId,
        payment_intent: `pi_mock_${crypto.randomBytes(8).toString('hex')}`,
        amount_total: order.totalAmount * 100,
        currency: 'usd',
        metadata: {
          type: 'ORDER',
          orderId: order._id.toString(),
          userId: order.userId.toString(),
          userEmail: order.userEmail
        }
      };
    } else {
      session = {
        id: sessionId,
        payment_intent: `pi_mock_${crypto.randomBytes(8).toString('hex')}`,
        amount_total: 1999,
        currency: 'usd',
        metadata: {
          type: 'PREMIUM_MEMBERSHIP'
        }
      };
    }
  } else {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  }

  if (!session) {
    throw new AppError(404, 'Stripe session not found');
  }

  const { type, orderId, userId, userEmail } = session.metadata || {};

  if (type === 'ORDER' && orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError(404, 'Associated order not found');
    }

    if (order.paymentStatus !== 'paid') {
      const transactionId = (session.payment_intent as string) || session.id;
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      order.transactionId = transactionId;
      await order.save();

      const paymentExists = await Payment.findOne({ transactionId });
      if (!paymentExists) {
        await Payment.create({
          userId: order.userId,
          userEmail: order.userEmail,
          orderId: order._id,
          type: 'ORDER',
          amount: order.totalAmount,
          currency: session.currency || 'usd',
          transactionId,
          stripeSessionId: session.id,
          paymentStatus: 'paid'
        });
      }
    }

    return {
      type: 'ORDER',
      order
    };
  } else if (type === 'PREMIUM_MEMBERSHIP' && userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    user.isPremium = true;
    await user.save();

    const transactionId = (session.payment_intent as string) || session.id;
    const paymentExists = await Payment.findOne({ transactionId });
    if (!paymentExists) {
      await Payment.create({
        userId: user._id,
        userEmail: user.email,
        type: 'PREMIUM_MEMBERSHIP',
        amount: (session.amount_total || 1999) / 100,
        currency: session.currency || 'usd',
        transactionId,
        stripeSessionId: session.id,
        paymentStatus: 'paid'
      });
    }

    return {
      type: 'PREMIUM_MEMBERSHIP',
      user
    };
  }

  return { message: 'Session processed' };
};

export const handleStripeWebhook = async (
  payload: Buffer,
  signature: string
) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhook_secret
    );
  } catch (err: any) {
    throw new AppError(400, `Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    await verifyAndProcessSession(session.id);
  }

  return { received: true };
};

export const getUserPayments = async (userId: string) => {
  const payments = await Payment.find({ userId: new Types.ObjectId(userId) })
    .populate('orderId')
    .sort({ createdAt: -1 });
  return payments;
};

export const getAllTransactionsAdmin = async (query: any) => {
  const page = parseInt(String(query.page || '1'), 10);
  const limit = parseInt(String(query.limit || '10'), 10);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.type) {
    filter.type = query.type;
  }
  if (query.search) {
    filter.userEmail = new RegExp(query.search.trim(), 'i');
  }

  const [transactions, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments(filter)
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
    data: transactions
  };
};

export const PaymentService = {
  createOrderCheckoutSession,
  createPremiumCheckoutSession,
  verifyAndProcessSession,
  handleStripeWebhook,
  getUserPayments,
  getAllTransactionsAdmin
};

export default PaymentService;
