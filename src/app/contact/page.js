"use client";
import React, { useState } from "react";
import PhoneIcon from "@/../public/icons-phone.svg";
import MailIcon from "@/../public/icons-mail.svg";
import { Poppins } from "next/font/google";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema } from "@/utils/schema";
import CustomInput from "@/Components/CustomInput";
import { sendContactFormMessage } from "../actions";
import { motion, AnimatePresence } from "framer-motion";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useUser } from "@/context/userContext";
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const Contact = () => {
  const user = useUser();
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [error, setError] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.name || "", // Pre-fill with user's name if available
      email: user?.email || "", // Pre-fill with user's email if available
      phone: "",
      message: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data) => {
    try {
      error && setError(false); // Reset error state if it was previously set
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("message", data.message);

      const emailError = await sendContactFormMessage(formData);
      console.log(emailError);
      if (emailError) {
        setError(true);
      } else {
        setShowEnvelope(true);
      }

      // setTimeout(() => {
      //   location.reload();
      // }, 3000); // Adjust timing if animation changes
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="flex items-center justify-center pt-16">
      <div className="bg-primary bg-opacity-10 flex justify-between p-5 pb-2 gap-20 max-md:flex-col max-md:gap-10 max-md:p-3 max-md:items-center">
        {/* Contact Info Section */}
        <div className="flex flex-col bg-primary bg-opacity-25  p-10 max-w-[380px]">
          <div className="flex flex-col gap-4">
            <p
              className={`${poppins.className} text-base m-0 flex items-center gap-4`}
            >
              <PhoneIcon />
              call to us
            </p>
            <p>We are available 24/7, 7 days a week.</p>
            <p>Phone: +8801611112222</p>
          </div>
          <div className="py-8 flex">
            <div className="flex-1 border border-black"></div>
          </div>
          <div className="flex flex-col gap-4">
            <p
              className={`${poppins.className} text-base m-0 flex items-center gap-4`}
            >
              <MailIcon />
              Write to us
            </p>
            <p>Fill out our form and we will contact you within 24 hours.</p>
            <p>Emails: customer@exclusive.com</p>
            <p>Emails: support@exclusive.com</p>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative flex flex-col gap-4 bg-primary bg-opacity-25 p-10 max-lg:max-w-[380px] w-full"
        >
          <div className="flex flex-wrap gap-4 max-w-3xl">
            <CustomInput
              name="name"
              label="Your Name"
              control={control}
              errors={errors}
              showError={true}
              showSuccess={false} // No success state for name input
              variant="outlined"
              disabled={showEnvelope}
            />
            <CustomInput
              name="email"
              label="Your Email"
              control={control}
              errors={errors}
              showError={true}
              showSuccess={false} // No success state for email input
              variant="outlined"
              disabled={showEnvelope}
            />
            <CustomInput
              name="phone"
              label="Your Phone"
              control={control}
              errors={errors}
              showError={true}
              showSuccess={false} // No success state for phone input
              variant="outlined"
              disabled={showEnvelope}
            />
          </div>
          <CustomInput
            name="message"
            label="Your Message"
            disabled={showEnvelope}
            control={control}
            errors={errors}
            showError={true}
            multiline={true}
            rows={8}
            showSuccess={false} // No success state for message input
            variant="outlined"
          />
          {error && (
            <p className="text-red-500 text-base self-end">
              An error occurred while sending your message. Please try again.
            </p>
          )}
          <button
            type="submit"
            disabled={showEnvelope || isSubmitting}
            className="bg-primary px-12 h-[50px] rounded text-white text-l self-end max-md:self-center hover:bg-primary hover:bg-opacity-75 mt-4"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
          <AnimatePresence>
            {showEnvelope && (
              <div className="absolute top-0 flex flex-col items-center justify-center  text-[#B487C9] self-center justify-self-center w-full h-full bg-black bg-opacity-10">
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 1 }}
                  animate={{ opacity: 1, y: 0, scale: 1.7 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  style={{ textShadow: "0 1px 1px rgba(0, 0, 0, 0.1)" }}
                >
                  <MailOutlineIcon sx={{ fontSize: 60, color: "#B487C9" }} />
                  Message sent successfully!
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

export default Contact;
