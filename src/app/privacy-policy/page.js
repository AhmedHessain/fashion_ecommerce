// /app/privacy-policy/page.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What is this Privacy Policy about?",
    a: `This Privacy Policy explains how Exclusive collects, uses, and protects your personal information when you visit our website or use our services. By accessing or purchasing from Exclusive, you agree to the practices described here.`,
  },
  {
    q: "What personal information do we collect?",
    a: `We collect information that you provide directly, such as your name, email address, phone number, billing and shipping addresses, and payment details. We also automatically collect certain data, including IP address, browser type, device information, and interaction data through cookies and analytics tools.`,
  },
  {
    q: "How do we use your information?",
    a: `Your information is used to process orders, manage your account, communicate updates, provide customer support, and improve your shopping experience. We may also use it for legal compliance, fraud prevention, and marketing communications (if you’ve consented).`,
  },
  {
    q: "Do we share your information with others?",
    a: `Exclusive does not sell your personal information. We may share your data only with trusted third parties, such as payment processors, shipping providers, and analytics services, strictly for operational purposes. Each partner is obligated to maintain confidentiality and comply with applicable privacy laws.`,
  },
  {
    q: "How do cookies work on our site?",
    a: `Cookies are small text files used to improve your browsing experience. They help remember your preferences, analyze traffic, and enable personalized content. You can manage or disable cookies in your browser settings, but some site features may not function properly without them.`,
  },
  {
    q: "How do we protect your data?",
    a: `We implement appropriate technical and organizational security measures, including encryption, secure servers, and limited access to personal data. However, please note that no online transmission is entirely secure, and you share information at your own risk.`,
  },
  {
    q: "How long do we retain your data?",
    a: `We retain your information as long as your account is active or as needed to fulfill orders, comply with legal obligations, resolve disputes, and enforce agreements. Once no longer required, your data is securely deleted or anonymized.`,
  },
  {
    q: "What are your rights regarding your information?",
    a: `You have the right to access, correct, or delete your personal information. You may also withdraw consent for marketing emails at any time. For any requests, please contact our privacy team at privacy@exclusive.com.`,
  },
  {
    q: "Do we transfer your data internationally?",
    a: `If you access Exclusive from outside your country, your data may be transferred and processed in regions with different data protection laws. We ensure such transfers comply with applicable legal safeguards.`,
  },
  {
    q: "Updates to this Privacy Policy",
    a: `Exclusive reserves the right to modify this Privacy Policy at any time. Changes will be posted on this page with an updated “Last Updated” date. Continued use of our services after any updates signifies your acceptance of the revised terms.`,
  },
];

export default function PrivacyPolicyPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        Privacy Policy
      </motion.h1>

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
              <h2 className="font-semibold text-lg flex justify-between items-center text-white text-opacity-90">
                {item.q}
                <motion.span
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white text-opacity-60"
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
