import { Types } from 'mongoose';
import AdminService from '../app/modules/admin/admin.service';
import Comment from '../app/modules/comment/comment.model';
import Order from '../app/modules/order/order.model';
import Payment from '../app/modules/payment/payment.model';
import Like from '../app/modules/recipe/like.model';
import Recipe from '../app/modules/recipe/recipe.model';
import Report from '../app/modules/report/report.model';
import ReportService from '../app/modules/report/report.service';
import User from '../app/modules/user/user.model';

jest.mock('../app/modules/user/user.model');
jest.mock('../app/modules/recipe/recipe.model');
jest.mock('../app/modules/recipe/like.model');
jest.mock('../app/modules/comment/comment.model');
jest.mock('../app/modules/report/report.model');
jest.mock('../app/modules/order/order.model');
jest.mock('../app/modules/payment/payment.model');

describe('Admin & Report Services Suite', () => {
  const adminId = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  const recipeId = new Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Aggregations & Dashboard Stats', () => {
    it('should aggregate revenue, counts, and platform statistics', async () => {
      (User.countDocuments as jest.Mock).mockResolvedValueOnce(10); // totalUsers
      (User.countDocuments as jest.Mock).mockResolvedValueOnce(3);  // totalSellers
      (Recipe.countDocuments as jest.Mock).mockResolvedValueOnce(25); // totalRecipes
      (User.countDocuments as jest.Mock).mockResolvedValueOnce(5);  // totalPremiumMembers
      (Report.countDocuments as jest.Mock).mockResolvedValueOnce(2); // totalReports
      (Order.countDocuments as jest.Mock).mockResolvedValueOnce(15); // totalOrders
      (Payment.aggregate as jest.Mock).mockResolvedValue([{ totalRevenue: 1540.5 }]);

      (User.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) })
      });
      (Order.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([]) })
      });
      (Report.countDocuments as jest.Mock).mockResolvedValueOnce(1); // pending reports

      const stats = await AdminService.getAdminDashboardStats();

      expect(stats.totalRevenue).toBe(1540.5);
      expect(stats.totalUsers).toBe(10);
      expect(stats.totalSellers).toBe(3);
      expect(stats.totalRecipes).toBe(25);
      expect(stats.totalOrders).toBe(15);
    });
  });

  describe('User Blocking & Role Management', () => {
    it('should block a user', async () => {
      const mockUser = {
        _id: new Types.ObjectId(userId),
        role: 'USER',
        isBlocked: false,
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await AdminService.blockUser(userId, adminId);

      expect(mockUser.isBlocked).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should prevent admin from blocking their own account', async () => {
      await expect(
        AdminService.blockUser(adminId, adminId)
      ).rejects.toThrow('cannot block your own admin account');
    });

    it('should update user role to SELLER', async () => {
      const mockUser = {
        _id: new Types.ObjectId(userId),
        role: 'USER',
        save: jest.fn().mockResolvedValue(true)
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const result = await AdminService.updateUserRole(userId, 'SELLER');

      expect(mockUser.role).toBe('SELLER');
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('Report Moderation', () => {
    it('should resolve report and delete violating recipe if requested', async () => {
      const reportId = new Types.ObjectId().toString();
      const mockReport = {
        _id: reportId,
        recipeId: new Types.ObjectId(recipeId),
        status: 'pending',
        save: jest.fn().mockResolvedValue(true)
      };

      (Report.findById as jest.Mock).mockResolvedValue(mockReport);
      (Recipe.findByIdAndDelete as jest.Mock).mockResolvedValue({});
      (Like.deleteMany as jest.Mock).mockResolvedValue({});
      (Comment.deleteMany as jest.Mock).mockResolvedValue({});

      const result = await ReportService.resolveReport(reportId, true);

      expect(mockReport.status).toBe('resolved');
      expect(Recipe.findByIdAndDelete).toHaveBeenCalledWith(mockReport.recipeId);
      expect(mockReport.save).toHaveBeenCalled();
    });
  });
});
