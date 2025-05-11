import { cookies } from "next/headers"; // For reading cookies server-side
import ClientRedirect from "./ClientRedirect/page";
export default function AuthErrorPage() {
  // Read the callback URL from cookies on the server side
  const cookieStore = cookies();
  const callbackUrl =
    cookieStore.get("next-auth.callback-url")?.value || "/login"; // Default fallback to login page

  // Pass the callback URL to the client-side component
  return <ClientRedirect callbackUrl={callbackUrl} />;
}
