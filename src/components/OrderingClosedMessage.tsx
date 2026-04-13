interface Props {
  businessName: string;
}

export default function OrderingClosedMessage({ businessName }: Props) {
  return (
    <div className="min-h-screen bg-[#121212] px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#3a2f2f] bg-[#1a1515] p-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{businessName}</h1>
        <p className="text-[#FF9C9C] text-lg font-semibold mb-3">Online ordering is currently closed</p>
        <p className="text-gray-300 text-sm">
          We have not started taking online orders yet. Please check again in a little while.
        </p>
      </div>
    </div>
  );
}
