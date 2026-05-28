const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Initiates a new medicine batch production run
 * Allowed: PRODUCTION_MANAGER, ADMIN
 */
const createBatch = async (req, res) => {
  try {
    const { batchNumber, quantity, expiryDate, rawMaterialId } = req.body;

    // 1. Data validation
    if (!batchNumber || !quantity || !expiryDate || !rawMaterialId) {
      return res.status(400).json({ success: false, message: 'Missing required batch fields.' });
    }

    // 2. Business check: Verify if raw material exists and has inventory
    const material = await prisma.rawMaterial.findUnique({ where: { id: rawMaterialId } });
    if (!material) {
      return res.status(404).json({ success: false, message: 'Raw material stock not found.' });
    }

    // 3. Database transaction: Create batch and auto-initialize its QA tracking file
    const newBatch = await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.create({
        data: {
          batchNumber,
          quantity: parseInt(quantity),
          expiryDate: new Date(expiryDate),
          rawMaterialId
        }
      });

      await tx.qualityAssurance.create({
        data: {
          batchId: batch.id,
          status: 'PENDING',
          inspectedBy: 'System Auto-Generated'
        }
      });

      return batch;
    });

    return res.status(201).json({ success: true, data: newBatch });
  } catch (error) {
    console.error('Error creating batch:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during production setup.' });
  }
};

/**
 * Retrieves all items nearing expiration (Critical for Pharmaceutical Compliance)
 * Allowed: STORE_MANAGER, PRODUCTION_MANAGER, ADMIN
 */
const getExpiringStock = async (req, res) => {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 90); // Look ahead window: 90 days

    const criticalBatches = await prisma.batch.findMany({
      where: {
        expiryDate: {
          lte: targetDate,
          gte: new Date() // Must not be already fully expired
        }
      },
      include: {
        rawMaterial: true
      },
      orderBy: { expiryDate: 'asc' }
    });

    return res.status(200).json({ success: true, count: criticalBatches.length, data: criticalBatches });
  } catch (error) {
    console.error('Error querying expiring items:', error);
    return res.status(500).json({ success: false, message: 'Failed to evaluate shelf-life metrics.' });
  }
};

module.exports = { createBatch, getExpiringStock };