import React from "react";
import Image from "next/image";
import { Inter } from "next/font/google";
import { Poppins } from "next/font/google";
import InstagramIcon from "@/../public/icon-instagram.svg";
import FacebookIcon from "@/../public/icon-Facebook.svg";
import TwitterIcon from "@/../public/icon-Twitter.svg";
import LinkedInIcon from "@/../public/icon-Linkedin.svg";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
import Services from "@/Components/Services";
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const About = () => {
  return (
    <section className="flex flex-col gap-36">
      <div className="flex h-[512px]">
        <div className="flex justify-center items-center flex-1">
          <div className="flex flex-col gap-10">
            <h1 className={`text-xxxl font-semibold ${inter.className}`}>
              Our Story
            </h1>
            <div
              className={`flex flex-col text-base ${poppins.className} w-[525px] gap-6`}
            >
              <p>
                Launced in 2015, Exclusive is South Asia’s premier online
                shopping makterplace with an active presense in Bangladesh.
                Supported by wide range of tailored marketing, data and service
                solutions, Exclusive has 10,500 sallers and 300 brands and
                serves 3 millioons customers across the region.
              </p>
              <p>
                Exclusive has more than 1 Million products to offer, growing at
                a very fast. Exclusive offers a diverse assotment in categories
                ranging from consumer.
              </p>
            </div>
          </div>
        </div>
        <div className=" flex-1 bg-primary rounded shadow-[inset_0_0_30px_5px_rgba(0,0,0,0.25)] flex justify-center items-end overflow-hidden min-w-[500px]  max-lg:min-w-0">
          <div className="w-[70%] pt-5">
            <Image
              src="/about_image.png"
              alt="about_image"
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="w-full h-full"
              priority
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-10">
        <Box
          image="/services_image.png"
          header="10.5K"
          text="Sallers active our site"
        />
        <Box
          image="/services2_image.png"
          header="33k"
          text="Monthly Product Sale"
        />
        <Box
          image="/services3_image.png"
          header="45.5k"
          text="Customer active in our site"
        />
        <Box
          image="/services4_image.png"
          header="10.25k"
          text="Anual gross sale in our site"
        />
      </div>
      <div className="flex gap-8 flex-wrap justify-center items-center">
        <Social
          name="Shin'ichi Kudo"
          image="/kudo.png"
          position="Founder & Chairman"
          facebook="https://www.facebook.com"
          linkedin="https://www.linkedin.com/"
          twitter="https://www.twitter.com"
          instagram="https://www.instagram.com"
        />
      </div>
      <Services />
    </section>
  );
};

export default About;

const Box = ({ image, header, text }) => {
  return (
    <div className="flex flex-col w-64 h-64 justify-center rounded-md items-center border border-solid border-black border-opacity-30 rounded] hover:text-white hover:bg-primary">
      <div className="w-20 h-20 rounded-full bg-primary">
        <Image
          src={image}
          alt="services_image"
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="w-full h-full"
          priority
        />
      </div>
      <h2 className={`text-xxl font-bold ${inter.className} mt-6 mb-3`}>
        {header}
      </h2>
      <p className={`text-base ${poppins.className}`}>{text}</p>
    </div>
  );
};
const Social = ({
  image,
  name,
  position,
  facebook,
  twitter,
  linkedin,
  instagram,
}) => {
  return (
    <div className="flex flex-col">
      <div className="w-96 relative">
        <Image
          src="/MagicPatternDesign_image.png"
          alt="Magic Pattern Design"
          width={0}
          height={0}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="w-full h-full"
          priority
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <Image
            src={image}
            alt="Magic Pattern Design 2"
            width={0}
            height={0}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="w-full h-full"
            priority
          />
        </div>
      </div>
      <div className="pl-4">
        <div>
          <h2 className={`text-xl ${inter.className} font-medium`}>{name}</h2>
          <p className={`text-base ${poppins.className}`}>{position}</p>
        </div>
        <div className="flex gap-2 mt-2">
          {facebook && (
            <Link href={facebook} target="_blank" rel="noopener noreferrer">
              <FacebookIcon />
            </Link>
          )}
          {twitter && (
            <Link href={twitter} target="_blank" rel="noopener noreferrer">
              <TwitterIcon />
            </Link>
          )}
          {instagram && (
            <Link href={instagram} target="_blank" rel="noopener noreferrer">
              <InstagramIcon />
            </Link>
          )}
          {linkedin && (
            <Link href={linkedin} target="_blank" rel="noopener noreferrer">
              <LinkedInIcon />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
