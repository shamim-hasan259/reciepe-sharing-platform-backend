import { Types } from 'mongoose';
import Cart from '../app/modules/cart/cart.model';
import CartService from '../app/modules/cart/cart.service';
import Order from '../app/modules/order/order.model';
import OrderService from '../app/modules/order/order.service';
import Recipe from '../app/modules/recipe/recipe.model';
import User from '../app/modules/user/user.model';

jest.mock('../app/modules/cart/cart.model');
jest.mock('../app/modules/order/order.model');
jest.mock('../app/modules/recipe/recipe.model');
jest.mock('../app/modules/user/user.model');

describe('Cart & Order Security Suite', () => {
  const userId = new Types.ObjectId().toString();
  const recipeId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cart Database Price Integrity', () => {
    it('should add item using database price and calculate correct total', async () => {
      const mockRecipe = {
        _id: new Types.ObjectId(recipeId),
        recipeName: 'Pizza',
        price: 20
      };

      const mockCartInstance = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        items: [] as any[],
        totalAmount: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      (Recipe.findById as jest.Mock).mockResolvedValue(mockRecipe);
      (Cart.findOne as jest.Mock).mockResolvedValue(mockCartInstance);
      (Cart.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          ...mockCartInstance,
          items: [{ recipeId: mockRecipe._id, quantity: 2, price: 20 }],
          totalAmount: 40
        })
      });

      const result = await CartService.addToCart(userId, recipeId, 2);

      expect(mockCartInstance.totalAmount).toBe(40);
      expect(mockCartInstance.save).toHaveBeenCalled();
    });
  });

  describe('Order Creation & Price Verification', () => {
    it('should calculate total amount strictly from database prices', async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: userId, role: 'USER' });
      (Recipe.findById as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(recipeId),
        recipeName: 'Pizza',
        recipeImage: 'img.jpg',
        price: 25.0
      });

      (Order.create as jest.Mock).mockImplementation((data) => Promise.resolve({ ...data, _id: 'order123' }));

      const order = await OrderService.createOrder(userId, 'user@example.com', {
        items: [{ recipeId, quantity: 2 }]
      });

      expect(order.totalAmount).toBe(50.0);
      expect(order.paymentStatus).toBe('pending');
    });
  });
});
