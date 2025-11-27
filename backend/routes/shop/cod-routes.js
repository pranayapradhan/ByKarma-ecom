const express = require('express');
const createCodOrder = require('../../controllers/shop/cod-controller');

const codRouter = express.Router();

codRouter.post('/proceed-order', createCodOrder);

module.exports = codRouter;