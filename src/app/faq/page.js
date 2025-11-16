// /app/faq/page.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What is Exclusive?",
    a: `Exclusive is a premium online store offering high-quality products and a seamless shopping experience. Our goal is to make online shopping secure, enjoyable, and reliable.`,
  },
  {
    q: "How can I create an account?",
    a: `You can create an account by clicking the “Sign Up” or “Create Account” button on the top right of the homepage. Enter your name, email, and password to get started. You’ll receive a confirmation email once registration is complete.`,
  },
  {
    q: "How do I place an order?",
    a: `Simply browse our products, add your desired items to the cart, and proceed to checkout. Follow the on-screen instructions to enter your shipping details and complete payment.`,
  },
  {
    q: "What payment methods do you accept?",
    a: `Exclusive accepts major payment methods including credit/debit cards, digital wallets, and other secure payment gateways. All transactions are encrypted to protect your information.`,
  },
  {
    q: "Can I track my order?",
    a: `Yes! Once your order is confirmed, you’ll receive an email with tracking information. You can also check your order status in your account under “My Orders.”`,
  },
  {
    q: "How do I cancel or modify an order?",
    a: `If your order has not yet been shipped, you can request a cancellation or modification by contacting our support team at support@exclusive.com. Once shipped, cancellations are no longer possible.`,
  },
  {
    q: "What is your return policy?",
    a: `We offer a 14-day return window from the delivery date. Returned items must be unused and in their original packaging. Visit our Return Policy page or contact customer support for detailed instructions.`,
  },
  {
    q: "Do you offer international shipping?",
    a: `Yes, Exclusive ships worldwide. Shipping fees and delivery times vary depending on your location and chosen courier service.`,
  },
  {
    q: "How can I contact customer support?",
    a: `You can reach our customer support team by email at support@exclusive.com or through the Contact Us form on our website. Our team responds within 24–48 business hours.`,
  },
  {
    q: "Is my information safe with Exclusive?",
    a: `Absolutely. We take data security seriously and follow strict protocols to safeguard your personal information. Please refer to our Privacy Policy for full details.`,
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        Frequently Asked Questions
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-gray-500 mb-12"
      >
        Find answers to the most common questions about shopping with Exclusive.
      </motion.p>

      <div className="space-y-4">
        {faqs.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className={`w-full text-left px-6 py-4 bg-primary bg-opacity-60 hover:bg-opacity-100 transition-colors ${
                openIndex === i ? "bg-opacity-100" : ""
              }`}
            >
              <h2 className="font-semibold text-lg flex justify-between items-center text-white">
                {item.q}
                <motion.span
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white text-opacity-80"
                >
                  {openIndex === i ? "−" : "+"}
                </motion.span>
              </h2>
            </motion.button>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 bg-white text-gray-700 text-lg leading-relaxed">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
