"use client";

import { useEffect, useState } from "react";

export interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetweenWords?: number;
  className?: string;
}

export function Typewriter({
  words,
  typingSpeed = 70,
  deletingSpeed = 40,
  delayBetweenWords = 2000,
  className = "",
}: TypewriterProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const targetWord = words[currentWordIndex % words.length];

    if (!isDeleting) {
      if (currentText.length < targetWord.length) {
        const timer = setTimeout(() => {
          setCurrentText(targetWord.slice(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsDeleting(true);
        }, delayBetweenWords);
        return () => clearTimeout(timer);
      }
    } else {
      if (currentText.length > 0) {
        const timer = setTimeout(() => {
          setCurrentText(targetWord.slice(0, currentText.length - 1));
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, typingSpeed);
        return () => clearTimeout(timer);
      }
    }
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords]);

  const currentWord = words && words.length > 0 ? words[currentWordIndex % words.length] : "";
  const isRtl = /[\u0600-\u06FF]/.test(currentWord);

  return (
    <span
      dir={isRtl ? "rtl" : "ltr"}
      className={`inline-flex items-baseline ${className}`}
    >
      <span>{currentText}</span>
      <span
        aria-hidden="true"
        className="ms-1 font-bold text-brand-accent animate-pulse select-none"
      >
        |
      </span>
    </span>
  );
}
