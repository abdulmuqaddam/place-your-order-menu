export default function Footer() {
  return (
    <footer className="bg-white border-t border-blue-100 mt-8 py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-3 text-center">
        {/* Brand */}
        <p className="text-[#E4A11B] font-bold text-base tracking-wide">
          Order Verse
        </p>
        <p className="text-gray-500 text-xs">
          by{" "}
          <a
            href="https://itversesolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E4A11B] hover:text-[#f5c842] underline underline-offset-2 transition-colors"
          >
            IT Verse Solutions
          </a>
        </p>

        {/* Divider */}
        <div className="w-16 h-px bg-blue-100 my-1" />

        {/* Address & Contact */}
        <div className="text-slate-400 text-xs space-y-1">
          <p>📍 Farid Town, Sahiwal</p>
          <p>
            📞{" "}
            <a
              href="tel:+923001234567"
              className="hover:text-gray-400 transition-colors"
            >
              +92 300 1234567
            </a>
          </p>
        </div>

        <p className="text-slate-400 text-[10px] mt-2">
          © {new Date().getFullYear()} Order Verse · All rights reserved
        </p>
      </div>
    </footer>
  );
}
