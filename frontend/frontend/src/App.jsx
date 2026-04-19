import { useState } from "react";

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    setIsFullscreen(true);
  } else {
    document.exitFullscreen();
    setIsFullscreen(false);
  }
};

  const [active, setActive] = useState(false);
const [booting, setBooting] = useState(false);
const [isProcessingWake, setIsProcessingWake] = useState(false);
  const startListening = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("You said:", transcript);

  if (
  !isProcessingWake &&
  (
    transcript.includes("jarvis") ||
    transcript.includes("wake up") ||
    transcript.includes("wakeup") ||
    transcript.includes("system wake up")
  )
) {
  setIsProcessingWake(true);
  setBooting(true);

  speak("System waking up");

  setTimeout(() => {
    setBooting(false);
    setActive(true);
    setIsProcessingWake(false);
  }, 4000);
}
  };
};
const speak = (text) => {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 0.8;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
};
  return (
    <div className="relative h-screen flex items-center justify-center bg-black overflow-hidden">
{/* Breathing background */}
<button
  onClick={toggleFullscreen}
  className="absolute top-4 right-4 px-3 py-1.5 text-[10px] tracking-[0.2em] text-white/70 border border-white/15 rounded-md hover:border-white/40 hover:text-white transition-all duration-300"
>
  {isFullscreen ? "EXIT" : "FULLSCREEN"}
</button>
<div
  className={`absolute w-56 h-56 rounded-full blur-2xl
  transition-all duration-700
  ${active
    ? "bg-white opacity-[0.06] scale-110"
    : "bg-white opacity-[0.02] scale-100 animate-pulse"}
  `}
/>
      <div
       onClick={() => {
 
  startListening();
}}
        className="relative flex items-center justify-center cursor-pointer group"
      >

        {/* Glow (hover + active) */}
        <div
        className={`
absolute w-32 h-32 rounded-full blur-3xl transition-all duration-500
${active ? "bg-white opacity-25 scale-110" : "bg-white opacity-0 group-hover:opacity-15 animate-pulse"}
`}
        />
{booting && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
    <div className="absolute w-24 h-24 rounded-full border border-white/30 animate-ping" />
    <div className="absolute w-36 h-36 rounded-full border border-white/20 animate-ping [animation-delay:300ms]" />
    <div className="absolute w-52 h-52 rounded-full border border-white/10 animate-ping [animation-delay:600ms]" />
  </div>
)}
        {/* Mic Button */}
        <div
        className="relative z-20 flex items-center justify-center cursor-pointer group"
        >
          

          {/* Mic SVG */}
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
       

      </div>

    </div>
  );
}

export default App;