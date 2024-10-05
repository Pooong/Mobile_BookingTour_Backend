const express = require("express");
const router = express.Router();
const PAYMENT_CONTROLLER = require("../../Controllers/PaymentVNPay/PaymentVNPay.Controller");
router.post("/create-payment", PAYMENT_CONTROLLER.createPaymentVnpayUrl);

router.get("/vnpay_return", PAYMENT_CONTROLLER.vnpayReturn);

module.exports = router;
