import { Hono } from 'hono';
import { rentalCustomerController } from '../controllers/rentalCustomer.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const rentalCustomer = new Hono();

rentalCustomer.get(
  '/',
  rentalCustomerController.getAll
);

rentalCustomer.get(
  '/:id',
  rentalCustomerController.get
);

rentalCustomer.post(
  '/',
  rentalCustomerController.create
);

rentalCustomer.put(
  '/:id',
  rentalCustomerController.update
);

rentalCustomer.delete(
  '/:id',
  rentalCustomerController.delete
);

export default rentalCustomer;