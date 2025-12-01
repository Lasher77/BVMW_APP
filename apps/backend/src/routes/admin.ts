import { Router } from 'express';
import { newsAdminPage } from '../views/newsAdminPage.js';

export const adminRouter = Router();

adminRouter.get('/news', (_req, res) => {
  res.type('html').send(newsAdminPage);
});
