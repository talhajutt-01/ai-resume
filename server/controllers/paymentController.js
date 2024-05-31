const stripe = require('stripe')('your-secret-key-here');
const User = require('../models/User');

const handlePrintCV = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.tokens <= 0) {
            return res.status(400).send({ message: 'Insufficient tokens' });
        }
        user.tokens -= 1;
        await user.save();
        res.send({ tokens: user.tokens });
    } catch (error) {
        console.error("Error handling print CV:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

const createCheckoutSession = async (req, res) => {
    const { email } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Resume Print Token',
                    },
                    unit_amount: 500, // Amount in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
            metadata: {
                email,
            },
        });
        res.send({ sessionId: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

const confirmPayment = async (req, res) => {
    const { email, paymentId } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        user.tokens += 1; // Assuming 1 token per payment
        await user.save();
        res.send({ tokens: user.tokens, message: "Payment successful" });
    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

module.exports = {
    handlePrintCV,
    createCheckoutSession,
    confirmPayment,
};
