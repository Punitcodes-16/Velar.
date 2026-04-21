import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import bootSound from "./assets/boot.mp3";
import { useRef } from "react";
function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [active, setActive] = useState(false);
  const [booting, setBooting] = useState(false);
  const [isProcessingWake, setIsProcessingWake] = useState(false);
  const [showMainUI, setShowMainUI] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const startListening = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    let transcript = "";

    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript.toLowerCase() + " ";
    }

    transcript = transcript.trim();
    console.log("You said:", transcript);

    if (
      !isProcessingWake &&
      (
        transcript.includes("jarvis") ||
        transcript.includes("wake up") ||
        transcript.includes("wakeup") ||
        transcript.includes("jarvis wake up")
      )
    ) {
      recognition.stop();

      setIsProcessingWake(true);
      setBooting(true);
      setShowMainUI(false);
      playBootSound();

      setTimeout(() => {
        setBooting(false);
        setActive(true);
        setShowMainUI(true);
        setIsProcessingWake(false);

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }, 4000);
    }
  };

  recognition.onerror = (event) => {
    console.log("Speech error:", event.error);
    alert("Voice error: " + event.error);
  };
};
const audioRef = useRef(null);

const playBootSound = () => {
  if (!audioRef.current) {
    audioRef.current = new Audio(bootSound);
    audioRef.current.volume = 0.4;
  }

  audioRef.current.currentTime = 0;
  audioRef.current.play();
};
 
  return (
    <div className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
      <button
  onClick={toggleFullscreen}
  className="absolute top-4 right-4 z-30 px-3 py-1.5 text-[10px] tracking-[0.2em] text-white/70 border border-white/15 rounded-md hover:border-white/40 hover:text-white transition-all duration-300"
>
  {isFullscreen ? "EXIT" : "FULLSCREEN"}
</button>
{booting && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.12, 0] }}
    transition={{ duration: 1.2, delay: 2.4, ease: "easeInOut" }}
    className="absolute inset-0 z-20 bg-white pointer-events-none"
  />
)}
<AnimatePresence>
  {!booting && (
    <motion.div
      key="mic"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      onClick={startListening}
      className="relative z-20 flex items-center justify-center cursor-pointer group"
    >
      {/* Glow (hover + active) */}
      <div
        className={`
        absolute w-32 h-32 rounded-full blur-3xl transition-all duration-500
        ${active ? "bg-white opacity-25 scale-110" : "bg-white opacity-0 group-hover:opacity-15 animate-pulse"}
        `}
      />

      {/* Breathing background */}
      <div
        className={`absolute w-56 h-56 rounded-full blur-2xl
        transition-all duration-700
        ${active
          ? "bg-white opacity-[0.06] scale-110"
          : "bg-white opacity-[0.02] scale-100 animate-pulse"}
        `}
      />

      {/* Mic Button */}
      <div
        className={`
        w-16 h-16 rounded-full flex items-center justify-center
        border transition-all duration-300
        ${active
          ? "border-white shadow-[0_0_30px_6px_rgba(255,255,255,0.35)] scale-105"
          : "border-gray-700 group-hover:border-white animate-pulse"}
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`
          w-6 h-6 transition-all duration-300
          ${active ? "text-white" : "text-gray-400 group-hover:text-white"}
          `}
        >
          <path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3z" />
          <path d="M19 10v2a7 7 0 01-14 0v-2" />
          <path d="M12 19v2" />
        </svg>
      </div>
    </motion.div>
  )}
</AnimatePresence>
{booting && (
  <div className="absolute inset-0 z-10 pointer-events-none">
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1200 800"
      className="absolute inset-0"
      preserveAspectRatio="none"
    >
      {/* Center core */}
      <motion.circle
        cx="600"
        cy="400"
        r="4"
        fill="#7dd3fc"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
      />

      {[
  "M600 400 L680 400 L680 260 L1100 260",
  "M600 400 L520 400 L520 200 L100 200",
  "M600 400 L600 480 L750 480 L750 780",
  "M600 400 L600 320 L450 320 L450 40",
  "M600 400 L700 400 L700 520 L1200 520",
  "M600 400 L500 400 L500 580 L0 580",
  "M600 400 L650 400 L650 300 L800 300 L800 0",
  "M600 400 L550 400 L550 480 L350 480 L350 800",
  "M600 400 L720 400 L720 360 L1200 360",
  "M600 400 L480 400 L480 420 L0 420"
].map((path, index) => (
        <g key={index}>
          {/* Base path */}
          <motion.path
            d={path}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.28 }}
          transition={{
  duration: 2.2,
  delay: index * 0.12,
  ease: "easeOut"
}}
          />

          {/* Traveling light pulse */}
          <motion.path
            d={path}
            fill="none"
            stroke="#e0f2fe"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0, pathOffset: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 0.16, 0.16],
              pathOffset: [0, 0, 0.84],
              opacity: [0, 0.95, 0]
            }}
           transition={{
  duration: 1.8,
  delay: 1.2 + index * 0.08,
  ease: "easeInOut"
}}
          />
        </g>
      ))}
    </svg>
  </div>
)}
        </div>
       

     
  );
}

export default App;