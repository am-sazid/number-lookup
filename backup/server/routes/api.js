const express = require('express');
const router = express.Router();
const numberController = require('../controllers/numberController');

router.post('/lookup', numberController.lookupNumber);

module.exports = router;