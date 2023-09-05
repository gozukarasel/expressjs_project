const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts); 

router.get('/products/:productId',shopController.getProduct) //tek bir product sayfası

router.post('/cart', isAuth, shopController.postCart)

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/add-to-orders', isAuth, shopController.postOrder);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);



module.exports = router;
