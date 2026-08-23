import User from "@/backend/model/userModel";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppError from "@/backend/utils/AppError";
import { uploadImageFromUrl } from "@/utils/cloudinary";
import { createSession } from "@/backend/session";
import startAsyncTransaction from "@/backend/utils/startAsyncTransaction";
import dbConnect from "@/backend/db";

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      try {
        await dbConnect();
        // Custom logic (e.g., check if user exists in DB)
        const { email, picture, name } = profile;
        let user = await User.findOne({ email });

        if (!user) {
          await startAsyncTransaction(async function (session) {
            const users = await User.create(
              [
                {
                  name,
                  email,
                  password: "00000000",
                },
              ],
              { session: session },
            );
            user = users[0];
            if (user && picture) {
              const imageUrl = await uploadImageFromUrl(picture);
              if (!imageUrl) {
                throw new AppError(
                  "Problem occured with image upload process",
                  500,
                );
              }
              user.imageUrl = imageUrl;
              await user.save({ session: session });
            }
          });
        }
        await createSession(user._id);
        return "/";
      } catch (err) {
        console.log(err);
        return false;
      }
    },
    async redirect({ url }) {
      return url;
    },
  },
  session: { strategy: "none" },
  pages: {
    error: "/auth/error",
  },
});
export { handler as GET, handler as POST };
