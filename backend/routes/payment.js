// routes/payment.js
const express = require('express');
const router = express.Router();
const errorMiddleware = require('../middleware/errorMiddleware');
const ApiError = require('../errors/ApiError');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const verifyToken = require('../middleware/authMiddleware');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const { sendEmail } = require('../utils/sendMail');
router.post('/create-checkout-session', verifyToken, errorMiddleware(async (req, res) => {
    const {
        amount,
        currency,

    } = req.body;
    const { type,
        propertyId,
        roomId,
        checkIn,
        checkOut,
        guestCount,
        specialRequests,
        listingType } = req.body.metadata;
        
    console.log(req.body, "========req.body");
    const user = await User.findById(req.user._id);

    const session = await stripe.checkout.sessions.create({
        mode: listingType === 'rent' ? 'subscription' : 'payment',
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [{
            price_data: {
                currency,
                unit_amount: amount,
                product_data: {
                    name: type === 'hotel' ? 'Hotel Booking' : 'Property Booking',
                },
                ...(listingType === 'rent' ? { recurring: { interval: 'month' } } : {})
            },
            quantity: listingType === 'rent' ? Math.floor(
                (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24 * 30)
            ) : 1,
        }],
        metadata: {
            userId: req.user._id.toString(),
            type: String(type),
            propertyId: String(propertyId),
            roomId: String(roomId),
            checkIn: String(checkIn),
            checkOut: String(checkOut),
            guestCount: String(guestCount),
            specialRequests: String(specialRequests),
            paymentType: listingType === 'rent' ? 'recurring' : 'one_time',
        },

        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    });

    return { sessionId: session.id };
}));

router.post('/refund', errorMiddleware(async (req, res) => {
    const { session_id } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const paymentIntentId = session.payment_intent;
    const refund = await stripe.refunds.create({ payment_intent: paymentIntentId });

    const user = await User.findOne({ email: session.customer_email });
    if (user) {
        await sendEmail(user.email, 'Booking Refund Issued', `Your payment has been refunded due to booking failure.`);
    }

    return { message: 'Refund issued', refund };
}));


// Backend: server.js
router.get('/session/:id', errorMiddleware(async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    console.log(session, "============sesions");
    return session;
}));


module.exports = router;