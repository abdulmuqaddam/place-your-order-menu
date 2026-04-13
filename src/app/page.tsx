export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold mb-3">Order Verse</h1>
        <p className="text-gray-400 text-sm mb-8">
          Customer ke liye flow simple hai: table par laga QR scan karein aur menu open ho jayega.
        </p>

        <div className="rounded-2xl border border-[#2f2f2f] bg-[#1a1a1a] p-6 text-left">
          <h2 className="text-[#E4A11B] font-semibold text-lg mb-3">Professional QR Flow</h2>
          <ol className="text-sm text-gray-300 space-y-2 list-decimal pl-5">
            <li>Owner app me Table QR Management se table QRs generate karein.</li>
            <li>Generated QR print karke tables par chipkayein.</li>
            <li>Customer apne phone camera se table QR scan kare.</li>
            <li>Menu path auto open hota hai: /stallId/tableNo</li>
          </ol>
          <p className="text-xs text-gray-500 mt-4">
            Table-wise generated QR preview dekhne ke liye path use karein:
            <span className="text-[#E4A11B]"> /YOUR_STALL_ID/qrs</span>
          </p>
        </div>
      </div>

      <p className="text-gray-700 text-[10px] mt-12 text-center">Powered by IT Verse Solutions</p>
    </div>
  );
}
