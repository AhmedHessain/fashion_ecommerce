import Link from "next/link";
const ResetPasswordError = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 flex-1">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="font-semibold text-2xl mb-4 text-red-600">
          Invalid or Expired Reset Token
        </h2>
        <p className="text-gray-600 mb-6">
          The reset link you used is either invalid or has expired.
        </p>
        <Link href="/" className="text-primary underline w-fit">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordError;
