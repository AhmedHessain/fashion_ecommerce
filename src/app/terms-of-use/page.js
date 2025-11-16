// /app/terms-of-use/page.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const terms = [
  {
    q: "What are these Terms of Use?",
    a: `These Terms of Use (“Terms”) govern your access to and use of Exclusive’s website, products, and services. By visiting or making a purchase from Exclusive, you agree to comply with these Terms. If you do not agree, please discontinue use of our site immediately.`,
  },
  {
    q: "Who can use Exclusive?",
    a: `You must be at least 18 years old or have legal parental consent to use Exclusive. By using our services, you represent that all information you provide is accurate, current, and complete.`,
  },
  {
    q: "How do purchases and payments work?",
    a: `By placing an order, you agree to provide valid payment information and authorize Exclusive to charge the total amount for your purchase, including applicable taxes and shipping fees. Exclusive reserves the right to cancel or refuse any order for reasons including suspected fraud or product availability.`,
  },
  {
    q: "What about prices and product availability?",
    a: `Prices, descriptions, and availability of products are subject to change without notice. Exclusive strives for accuracy but does not guarantee that all product information or pricing is error-free. If an error occurs, we may correct it or cancel affected orders.`,
  },
  {
    q: "What are my responsibilities as a user?",
    a: `You agree not to misuse the site or engage in unlawful, fraudulent, or abusive behavior. This includes interfering with site operations, accessing unauthorized data, or infringing on intellectual property rights.`,
  },
  {
    q: "What about intellectual property?",
    a: `All content on Exclusive—including text, graphics, images, logos, and software—is the property of Exclusive or its licensors. You may not reproduce, distribute, or use any content without prior written permission.`,
  },
  {
    q: "Are third-party links or services included?",
    a: `Exclusive may feature links or integrations with third-party websites or services. These are provided for your convenience only, and Exclusive is not responsible for their content, policies, or actions.`,
  },
  {
    q: "What limitations of liability apply?",
    a: `To the fullest extent permitted by law, Exclusive shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the site, including loss of data, revenue, or profits.`,
  },
  {
    q: "Can these Terms change?",
    a: `Yes. Exclusive reserves the right to update or modify these Terms at any time. Changes take effect once posted on this page. Continued use of our site after changes means you accept the revised Terms.`,
  },
];

export default function TermsOfUsePage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        Terms of Use
      </motion.h1>

      <div className="space-y-4">
        {terms.map((item, i) => (
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
