import { Request, Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { ApiResponse } from '../../utils/api-response';
import { asyncHandler } from '../../utils/async-handler';

export class PortfolioController {
  static getPortfolios = asyncHandler(async (req: Request, res: Response) => {
    const portfolios = await PortfolioService.getPortfolios(req.user!.id);
    return ApiResponse.success(res, portfolios, 'Portfolios retrieved successfully');
  });

  static getPortfolioById = asyncHandler(async (req: Request, res: Response) => {
    const portfolio = await PortfolioService.getPortfolioById(req.user!.id, req.user!.role, req.params.id as string);
    return ApiResponse.success(res, portfolio, 'Portfolio details retrieved successfully');
  });

  static getPortfolioBySlug = asyncHandler(async (req: Request, res: Response) => {
    const portfolio = await PortfolioService.getPortfolioBySlug(req.params.slug as string);
    return ApiResponse.success(res, portfolio, 'Public portfolio retrieved successfully');
  });

  static createPortfolio = asyncHandler(async (req: Request, res: Response) => {
    const portfolio = await PortfolioService.createPortfolio(req.user!.id, req.body);
    return ApiResponse.success(res, portfolio, 'Portfolio created successfully. Awaiting verification check.', 201);
  });

  static updatePortfolio = asyncHandler(async (req: Request, res: Response) => {
    const portfolio = await PortfolioService.updatePortfolio(req.user!.id, req.params.id as string, req.body);
    return ApiResponse.success(res, portfolio, 'Portfolio updated successfully. Awaiting re-verification.');
  });

  static deletePortfolio = asyncHandler(async (req: Request, res: Response) => {
    await PortfolioService.deletePortfolio(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, null, 'Portfolio deleted successfully');
  });
}
export default PortfolioController;
