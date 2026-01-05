const express = require('express');
const graphController = require('../controllers/graphController');

const router = express.Router();

router.get('/:type', graphController.getGraphData);

module.exports = router;