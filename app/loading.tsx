/**
 * LSUS Connect - Global Loading Page
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#461D7C] flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#3a1364] border-4 border-[#5a2d8c] relative">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#FDD023] animate-spin"></div>
            <span className="text-[#FDD023] text-3xl font-bold">LS</span>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-white text-2xl font-bold mb-2">
          Loading...
        </h2>
        <p className="text-gray-400 text-sm">
          Please wait while we load your content
        </p>

        {/* Loading Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-[#3a1364] rounded-full overflow-hidden">
            <div className="h-full bg-[#FDD023] rounded-full animate-pulse" style={{ width: "60%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}