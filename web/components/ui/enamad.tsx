import React from "react";

interface EnamadProps {
  className?: string;
}

export function Enamad({ className = "" }: EnamadProps) {
  return (
    <div
      className={`inline-flex items-center justify-center p-2.5 bg-surface border border-border rounded-xl shadow-xs hover:border-brand-primary transition-all duration-200 ${className}`}
    >
      {/* eslint-disable-next-line react/jsx-no-target-blank */}
      <a
        referrerPolicy="origin"
        target="_blank"
        href="https://trustseal.enamad.ir/?id=7474898&Code=lLhtJMGdpIcuACC8zhPQztLohRegCbbi"
        className="block"
        title="نماد اعتماد الکترونیکی EPD"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          referrerPolicy="origin"
          src="https://trustseal.enamad.ir/logo.aspx?id=7474898&Code=lLhtJMGdpIcuACC8zhPQztLohRegCbbi"
          alt="نماد اعتماد الکترونیکی"
          style={{ cursor: "pointer" }}
          // @ts-expect-error enamad custom verification attribute
          code="lLhtJMGdpIcuACC8zhPQztLohRegCbbi"
          className="h-20 sm:h-24 w-auto object-contain"
        />
      </a>
    </div>
  );
}
