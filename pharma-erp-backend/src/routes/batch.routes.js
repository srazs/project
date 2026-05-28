const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

// Route: Initiate batch production run
router.post(
  '/production/initiate',
  authenticateToken,
  authorizeRoles('PRODUCTION_MANAGER', 'ADMIN'),
  batchController.createBatch
);

// Route: Pull real-time inventory risk monitoring (Expiry < 90 Days)
router.get(
  '/compliance/expiring-stock',
  authenticateToken,
  authorizeRoles('STORE_MANAGER', 'PRODUCTION_MANAGER', 'ADMIN'),
  batchController.getExpiringStock
);

module.exports = router;