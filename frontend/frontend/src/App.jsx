import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import bootSound from "./assets/boot.mp3";


const backgroundPaths = [
  "M120 180 L320 180 L420 260 L700 260",
  "M980 140 L820 140 L760 220 L540 220",
  "M160 620 L340 620 L420 540 L680 540",
  "M1040 580 L860 580 L760 500 L520 500",
  "M260 90 L260 240 L360 320 L360 470",
  "M920 100 L920 240 L820 330 L820 500",
  "M60 300 L240 300 L320 360 L520 360",
  "M1140 300 L940 300 L860 360 L660 360",
  "M180 720 L320 720 L430 640 L620 640",
  "M1020 700 L860 700 L760 620 L560 620",
  "M420 60 L420 180 L500 240 L500 340",
  "M780 60 L780 180 L700 240 L700 340",
];

function App() {

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [booting, setBooting] = useState(false);
  const [showMainUI, setShowMainUI] = useState(false);
  const [isProcessingWake, setIsProcessingWake] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });


  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const bootTimerRef = useRef([]);
  const voiceEnabledRef = useRef(false);
const mainScrollRef = useRef(null);
const [isChatExpanded, setIsChatExpanded] = useState(false);

const [chatInput, setChatInput] = useState("");
const [chatMessages, setChatMessages] = useState([
  {
    role: "assistant",
    content: "Velar online. How can I help?"
  }
]);

const sendMessage = async () => {
  if (!chatInput.trim() || loadingChat) return;

  const userMessage = {
    role: "user",
    content: chatInput
  };

  setChatMessages(prev => [...prev, userMessage]);
  setChatInput("");
  setLoadingChat(true);

  try {

    const res = await fetch(
      "http://localhost:5000/api/chat",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      }
    );

    const data = await res.json();

    setChatMessages(prev => [
      ...prev,
      {
        role:"assistant",
       content: data.reply || data.error || "No reply received from backend."
      }
    ]);

  } catch(err){

    console.error(err);

    setChatMessages(prev => [
      ...prev,
      {
        role:"assistant",
        content:"Backend connection failed."
      }
    ]);

  }

  setLoadingChat(false);
};

const [loadingChat, setLoadingChat] = useState(false);

  const navItems = [
  { id: "ai-chat", label: "AI Chat" },
  { id: "knowledge-vault", label: "Knowledge Vault" },
  { id: "tasks", label: "Tasks" },
  { id: "uploads", label: "Uploads" },
  { id: "credits", label: "Credits" },
];

const scrollToSection = (id) => {
  const container = mainScrollRef.current;
  const section = document.getElementById(id);

  if (!container || !section) {
    console.log("Scroll target missing:", id);
    return;
  }

  const top =
    section.offsetTop -
    container.offsetTop -
    90;

  container.scrollTo({
    top,
    behavior: "smooth",
  });

  console.log("Scrolling to:", id);
};

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      stopBootSound();

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      bootTimerRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(bootSound);
        audioRef.current.volume = 0.45;
        audioRef.current.preload = "auto";
      }

      audioRef.current.muted = true;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = false;
    } catch (error) {
      console.log("Audio unlock failed:", error);
    }
  };

  const playBootSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(bootSound);
        audioRef.current.volume = 0.45;
        audioRef.current.preload = "auto";
      }

      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.log("Boot sound failed:", error);
        });
      }
    } catch (error) {
      console.log("Boot sound setup failed:", error);
    }
  };

  const stopBootSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const clearBootTimers = () => {
    bootTimerRef.current.forEach((timer) => clearTimeout(timer));
    bootTimerRef.current = [];
  };

 const runWakeSequence = () => {
  console.log("runWakeSequence fired");
  if (isProcessingWake || showMainUI) return;

  clearBootTimers();

  setIsProcessingWake(true);
  setBooting(true);
  setShowMainUI(false);
  setIsAlert(true);

  const showUiTimer = setTimeout(() => {
    setShowMainUI(true);
    setBooting(false);
    setIsProcessingWake(false);
    setIsAlert(false);
  }, 2400);

  bootTimerRef.current = [showUiTimer];
};

const handleTranscript = (rawText) => {
  const transcript = rawText.toLowerCase().trim();
  console.log("Heard:", transcript);

  if (
    !isAwake &&
    (transcript.includes("wake velar") || transcript.includes("wake up"))
  ) {
    setIsAwake(true);
    return;
  }

  if (
    transcript.includes("start the app") ||
    transcript.includes("initialize velar")
  ) {
    if (!isAwake) setIsAwake(true);
    runWakeSequence();
    return;
  }

  if (transcript.includes("open workflow") || transcript === "workflow") {
    scrollToSection("workflow");
    return;
  }

  if (transcript.includes("open ai chat") || transcript.includes("ai chat")) {
    scrollToSection("ai-chat");
    return;
  }

  if (
    transcript.includes("open knowledge vault") ||
    transcript.includes("knowledge vault")
  ) {
    scrollToSection("knowledge");
    return;
  }

  if (transcript.includes("open tasks") || transcript === "tasks") {
    scrollToSection("tasks");
    return;
  }

  if (transcript.includes("open uploads") || transcript === "uploads") {
    scrollToSection("uploads");
    return;
  }

  if (transcript.includes("show credits") || transcript.includes("credits")) {
    scrollToSection("credits");
    return;
  }

  if (transcript.includes("go home") || transcript === "home") {
    scrollToSection("hero");
  }
};

  const startListening = async () => {
    await unlockAudio();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);

        if (voiceEnabledRef.current) {
          try {
            recognition.start();
          } catch (error) {
            console.log("Recognition restart blocked:", error);
          }
        }
      };

      recognition.onerror = (event) => {
        console.log("Speech error:", event.error);
      };

      recognition.onresult = (event) => {
        let transcript = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          transcript += event.results[i][0].transcript + " ";
        }

        handleTranscript(transcript);
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
      setVoiceEnabled(true);
    } catch (error) {
      console.log("Recognition start blocked:", error);
    }
  };

  const stopListening = () => {
    setVoiceEnabled(false);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleMouseMove = (event) => {
    const { innerWidth, innerHeight } = window;
    const x = (event.clientX / innerWidth - 0.5) * 5;
    const y = (event.clientY / innerHeight - 0.5) * 5;
    setMousePosition({ x, y });

   

  };
 




   

  return (
    <div
      className="relative h-screen overflow-hidden bg-[#030405] text-white"
      onMouseMove={handleMouseMove}
    >
      {/* ================= INTRO BACKGROUND ================= */}

<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08),transparent_28%),linear-gradient(to_bottom,#050505,#090909)]" />

<svg
  className="absolute inset-0 z-[1] pointer-events-none opacity-45"
  width="100%"
  height="100%"
  viewBox="0 0 1200 800"
  preserveAspectRatio="none"
>
  {backgroundPaths.map((path, index) => (
    <g key={path}>
      <motion.path
        d={path}
        fill="none"
        stroke="rgba(220,38,38,0.18)"
        strokeWidth="1"
        animate={{
          x: mousePosition.x * (10 + index * 2),
          y: mousePosition.y * (10 + index * 2),
        }}
        transition={{
          type:"spring",
          stiffness:45,
          damping:18
        }}
      />

      <motion.path
        d={path}
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1.8"
        initial={{ pathLength:0, opacity:0 }}
        animate={{
          pathLength:[0,.12,.12],
          pathOffset:[0,0,.88],
          opacity:[0,.7,0]
        }}
        transition={{
          duration:6,
          delay:index*.22,
          repeat:Infinity
        }}
      />
    </g>
  ))}
</svg>


<motion.div
 animate={{ x:[0,18,-8,0], y:[0,-10,12,0] }}
 transition={{duration:18,repeat:Infinity}}
 className="absolute left-[8%] top-[12%] h-64 w-64 rounded-full bg-red-500/10 blur-3xl"
/>

<motion.div
 animate={{ x:[0,-16,10,0], y:[0,10,-10,0] }}
 transition={{duration:22,repeat:Infinity}}
 className="absolute right-[10%] bottom-[12%] h-72 w-72 rounded-full bg-white/5 blur-3xl"
/>

      {!showMainUI && (
  <>
    <div className="absolute left-4 top-4 z-30 flex items-center gap-3">
      <button
        onClick={voiceEnabled ? stopListening : startListening}
        className="rounded-md border border-white/15 px-3 py-1.5 text-[10px] tracking-[0.24em] text-white/75 transition-all duration-300 hover:border-white/40 hover:text-white"
      >
        {voiceEnabled ? "VOICE ON" : "ENABLE VOICE"}
      </button>

      <div className="text-[10px] tracking-[0.24em] text-white/35">
        {isListening ? "LISTENING" : "STANDBY"}
      </div>
    </div>

    <button
      onClick={toggleFullscreen}
      className="absolute right-4 top-4 z-30 rounded-md border border-white/15 px-3 py-1.5 text-[10px] tracking-[0.24em] text-white/75 transition-all duration-300 hover:border-white/40 hover:text-white"
    >
      {isFullscreen ? "EXIT" : "FULLSCREEN"}
    </button>
  </>
)}

 

      <AnimatePresence mode="wait">
        {!showMainUI && (
          <motion.div
            key="eyes-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <div className="relative flex items-center justify-center">
              {/* ========= VELAR SPLASH TYPOGRAPHY ========= */}

<div className="absolute z-20 flex flex-col items-center text-center px-6">

  <motion.div
    initial={{opacity:0,y:18}}
    animate={{opacity:1,y:0}}
    transition={{duration:0.8}}
    className="text-[76px] md:text-[110px] font-medium tracking-tight text-white"
  >
    VELAR<span className="text-red-600">.</span>
  </motion.div>

  <motion.p
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{delay:.35}}
    className="mt-2 text-xl md:text-2xl text-white/60"
  >
    Voice-First Intelligent Workspace
  </motion.p>

 <motion.button
  initial={{ opacity:0 }}
  animate={{ opacity:1 }}
  transition={{ delay:.7 }}
  onClick={runWakeSequence}
  className="mt-12 rounded-full border border-white/10 bg-white/[0.03] px-7 py-3 text-sm tracking-[0.25em] text-white/55 backdrop-blur-md transition hover:border-red-500/50 hover:text-white"
>
  {booting
    ? "INITIALIZING INTERFACE..."
    : 'SAY OR CLICK "START THE APP"'}
</motion.button>

  <motion.div
    initial={{opacity:0}}
    animate={{opacity:1}}
    transition={{delay:1}}
    className="mt-8 text-[11px] tracking-[0.35em] text-red-500/70"
  >
    VOICE READY • SYSTEM ONLINE
  </motion.div>

</div>
              {booting && (
                <>
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: [0.82, 1.05, 1], opacity: [0, 0.8, 0.35] }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                    className={`absolute h-48 w-48 rounded-full border ${
                      isAlert ? "border-red-300/30" : "border-cyan-200/20"
                    }`}
                  />

                  <motion.div
                    initial={{ rotate: 0, opacity: 0 }}
                    animate={{ rotate: 180, opacity: [0, 0.65, 0.2] }}
                    transition={{ duration: 2.2, ease: "linear" }}
                    className={`absolute h-64 w-64 rounded-full border ${
                      isAlert ? "border-red-400/20" : "border-cyan-300/15"
                    }`}
                  />

                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: [0.2, 1, 1.15], opacity: [0, 0.45, 0] }}
                    transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                    className={`absolute h-28 w-28 rounded-full blur-2xl ${
                      isAlert ? "bg-red-400/20" : "bg-cyan-300/20"
                    }`}
                  />
                </>
              )}

              <motion.div
               animate={
  isAwake
    ? { scaleY: 1, opacity: isAlert ? 0.55 : 0.34, filter: "blur(0px)" }
    : { scaleY: 0.12, opacity: 0.2, filter: "blur(2px)" }
}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex gap-10"
              >
                <div
                  className={`relative flex h-14 w-28 items-center justify-center overflow-hidden rounded-full border backdrop-blur-md transition-all duration-500 ${
                    isAlert
                      ? "border-red-300/20 bg-red-500/10"
                      : "border-cyan-200/10 bg-cyan-300/5"
                  }`}
                >
                  <div
                    className={`absolute inset-[20%] rounded-full blur-md transition-all duration-500 ${
                      isAlert ? "bg-red-300/25" : "bg-cyan-200/20"
                    }`}
                  />

                  {isAwake && (
                    <motion.div
                      animate={{
                        x: [0, 6, -4, 0],
                        scale: isAlert ? [1, 1.08, 1] : 1,
                      }}
                      transition={{
                        x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                      }}
                      className={`relative h-6 w-6 rounded-full transition-all duration-500 ${
                        isAlert
                          ? "bg-gradient-to-br from-red-300 to-red-600 shadow-[0_0_30px_rgba(255,60,60,0.8)]"
                          : "bg-gradient-to-br from-white to-cyan-400 shadow-[0_0_25px_rgba(120,220,255,0.6)]"
                      }`}
                    />
                  )}
                </div>

                <div
                  className={`relative flex h-14 w-28 items-center justify-center overflow-hidden rounded-full border backdrop-blur-md transition-all duration-500 ${
                    isAlert
                      ? "border-red-300/20 bg-red-500/10"
                      : "border-cyan-200/10 bg-cyan-300/5"
                  }`}
                >
                  <div
                    className={`absolute inset-[20%] rounded-full blur-md transition-all duration-500 ${
                      isAlert ? "bg-red-300/25" : "bg-cyan-200/20"
                    }`}
                  />

                  {isAwake && (
                    <motion.div
                      animate={{
                        x: [0, -6, 4, 0],
                        scale: isAlert ? [1, 1.08, 1] : 1,
                      }}
                      transition={{
                        x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
                      }}
                      className={`relative h-6 w-6 rounded-full transition-all duration-500 ${
                        isAlert
                          ? "bg-gradient-to-br from-red-300 to-red-600 shadow-[0_0_30px_rgba(255,60,60,0.8)]"
                          : "bg-gradient-to-br from-white to-cyan-400 shadow-[0_0_25px_rgba(120,220,255,0.6)]"
                      }`}
                    />
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


<AnimatePresence>
  {showMainUI && (
    <motion.div
      key="main-ui"
      initial={{ opacity: 0, scale: 0.08, borderRadius: "999px" }}
      animate={{ opacity: 1, scale: 1, borderRadius: "0px" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 z-20 overflow-hidden text-white"
    >
      {/* MAIN UI BACKGROUND — matches intro theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08),transparent_30%),linear-gradient(to_bottom,#090909,#111111)]" />

      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute right-[10%] bottom-[12%] h-80 w-80 rounded-full bg-red-400/10 blur-3xl" />
      </div>

      {/* abstract flowing lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.28]">
        <motion.svg
          viewBox="0 0 1440 800"
          className="absolute h-full w-full"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M0,200 C300,300 600,100 900,200 C1200,300 1440,150 1440,150"
            stroke="rgba(220,38,38,0.75)"
            strokeWidth="1.2"
            fill="transparent"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />

          <motion.path
            d="M0,400 C400,500 700,300 1000,420 C1200,480 1440,350 1440,350"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3.5, ease: "easeInOut", delay: 0.4 }}
          />

          <motion.path
            d="M0,600 C300,700 700,500 1000,620 C1300,700 1440,550 1440,550"
            stroke="rgba(220,38,38,0.4)"
            strokeWidth="1"
            fill="transparent"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, ease: "easeInOut", delay: 0.8 }}
          />
        </motion.svg>

        <motion.div
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
        >
          <div className="h-full w-[25%] bg-gradient-to-r from-transparent via-red-500 to-transparent blur-2xl" />
        </motion.div>
      </div>

      {/* wrapper for all visible UI */}
      <div className="relative z-10 h-full w-full">
        {/* top bar */}
        <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between border-b border-white/10 bg-black/25 px-10 py-5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold tracking-tight text-white">
              Velar<span className="text-red-600">.</span>
            </div>
          </div>

          <div className="flex items-center gap-8 text-sm text-white/70">
            <button
              onClick={() => scrollToSection("hero")}
              className="border-b border-transparent pb-1 transition hover:border-red-500 hover:text-white"
            >
              Home
            </button>

            <button
              onClick={() => scrollToSection("workflow")}
              className="border-b border-transparent pb-1 transition hover:border-red-500 hover:text-white"
            >
              Workflow
            </button>

            <button
              onClick={() => scrollToSection("use-cases")}
              className="border-b border-transparent pb-1 transition hover:border-red-500 hover:text-white"
            >
              Use cases
            </button>

            <button
              onClick={() => scrollToSection("credits")}
              className="border-b border-transparent pb-1 transition hover:border-red-500 hover:text-white"
            >
              Credits
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={voiceEnabled ? stopListening : startListening}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 backdrop-blur-md transition hover:border-white/25"
            >
              {voiceEnabled ? "Voice On" : "Enable Voice"}
            </button>

            <button
              onClick={toggleFullscreen}
              className="rounded-xl border border-red-500 bg-red-500 px-4 py-2 text-sm text-white transition hover:bg-red-600"
            >
              {isFullscreen ? "Exit" : "Fullscreen"}
            </button>
          </div>
        </div>

        {/* scrollable page */}
  <div ref={mainScrollRef} className="h-full overflow-y-auto pt-24">
          {/* hero */}
          <section
            id="hero"
            className="mx-auto flex min-h-[78vh] w-full max-w-7xl flex-col items-center justify-center px-10 text-center"
          >
            <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-red-500 shadow-sm backdrop-blur-md">
              Voice-first AI workspace
            </div>

            <h1 className="max-w-5xl text-6xl font-medium leading-[1.05] tracking-tight text-white md:text-7xl">
              Velar, the AI workspace for chat, knowledge, tasks, and intelligent uploads
            </h1>

            <p className="mt-8 max-w-3xl text-xl leading-8 text-white/60">
              Built as a premium operating layer for AI workflows. Clean interface,
              clear modules, voice navigation, and a structure ready for real backend integration.
            </p>

            <div className="mt-10 flex items-center gap-4">
              <button
                onClick={() => scrollToSection("use-cases")}
                className="rounded-xl bg-red-500 px-5 py-3 text-white transition hover:bg-red-600"
              >
                Explore modules
              </button>

              <button
                onClick={() => scrollToSection("credits")}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-white/80 backdrop-blur-md transition hover:border-white/30"
              >
                View credits
              </button>
            </div>
          </section>

          <div className="my-12 h-[1px] w-full bg-white/10" />

          {/* workflow */}
          <section
            id="workflow"
            className="w-full border-b border-white/10 px-0 py-24"
          >
            <div className="mx-auto max-w-7xl px-10">
              <div className="text-sm tracking-[0.22em] text-red-500">
                • HOW VELAR WORKS
              </div>

              <h2 className="mt-6 text-6xl font-medium tracking-tight text-white">
                One Workspace. <span className="text-red-500">Every Step.</span>
              </h2>

              <p className="mt-6 max-w-3xl text-2xl leading-9 text-white/60">
                Velar brings everything together in a seamless flow from your thoughts
                to real-world execution.
              </p>
            </div>

            <div className="mx-auto mt-16 max-w-7xl px-10">
              <div className="rounded-[36px] border border-white/10 bg-white/5 p-10 shadow-sm backdrop-blur-xl">
                <div className="relative mb-12 hidden md:block">
                  <div className="absolute left-[9%] right-[4%] top-1/2 h-[1.5px] -translate-y-1/2 bg-red-400/70" />

                  <div className="grid grid-cols-5 gap-8">
                    {[
                      {
                        title: "Interact",
                        desc: "Chat naturally with AI to get answers, ideas, and guidance.",
                        icon: "💬",
                      },
                      {
                        title: "Store",
                        desc: "Important information is saved in your knowledge vault.",
                        icon: "🗂️",
                      },
                      {
                        title: "Organize",
                        desc: "Structure your knowledge and create tasks, notes, and workflows.",
                        icon: "◫",
                      },
                      {
                        title: "Execute",
                        desc: "Turn plans into action with focused tasks and tracking.",
                        icon: "✓",
                      },
                      {
                        title: "Upload",
                        desc: "Add files and documents to bring everything into one place.",
                        icon: "⤴",
                      },
                    ].map((step, index) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.45, delay: index * 0.08 }}
                        whileHover={{ y: -6 }}
                        className="relative z-10 flex flex-col items-center text-center"
                      >
                        <motion.div
                          whileHover={{ scale: 1.04 }}
                          className="flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-white/8 shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur-md"
                        >
                          <span className="text-5xl text-red-500">{step.icon}</span>
                        </motion.div>

                        <div className="mt-10 text-2xl font-medium tracking-tight text-white">
                          <span className="mr-2 text-red-500">{index + 1}.</span>
                          {step.title}
                        </div>

                        <p className="mt-5 max-w-[250px] text-lg leading-8 text-white/58">
                          {step.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8 md:hidden">
                  {[
                    {
                      title: "Interact",
                      desc: "Chat naturally with AI to get answers, ideas, and guidance.",
                      icon: "💬",
                    },
                    {
                      title: "Store",
                      desc: "Important information is saved in your knowledge vault.",
                      icon: "🗂️",
                    },
                    {
                      title: "Organize",
                      desc: "Structure your knowledge and create tasks, notes, and workflows.",
                      icon: "◫",
                    },
                    {
                      title: "Execute",
                      desc: "Turn plans into action with focused tasks and tracking.",
                      icon: "✓",
                    },
                    {
                      title: "Upload",
                      desc: "Add files and documents to bring everything into one place.",
                      icon: "⤴",
                    },
                  ].map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/8 text-2xl text-red-500">
                          {step.icon}
                        </div>
                        <div className="text-2xl font-medium tracking-tight text-white">
                          <span className="mr-2 text-red-500">{index + 1}.</span>
                          {step.title}
                        </div>
                      </div>

                      <p className="mt-4 text-lg leading-8 text-white/58">
                        {step.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="relative mt-12 hidden md:block">
                  <div className="mx-auto h-[1.5px] w-[82%] bg-red-400/50" />
                  <div className="mt-6 flex justify-center">
                    <div className="rounded-full border border-white/10 bg-white/5 px-8 py-3 text-xl text-red-500 shadow-sm backdrop-blur-md">
                      Continuous Flow
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

         {/* use cases / MVPs */}
<section
  id="use-cases"
  className="mx-auto w-full max-w-7xl px-10 py-24"
>
  <h2 className="text-6xl font-medium tracking-tight text-white">
    Use cases
  </h2>

  <p className="mt-6 max-w-3xl text-2xl leading-9 text-white/60">
    Use Velar to interact with AI, store knowledge, manage workflows,
    and handle uploads through a clean system designed for real product use.
  </p>

  <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
    {/* AI CHAT CARD — custom working module */}
    <motion.div
  id="ai-chat"
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.25 }}
  transition={{ duration: 0.55, ease: "easeOut" }}
  whileHover={{ y: -8, scale: 1.01 }}
  className="min-h-[520px] rounded-[28px] border border-white/10 bg-white/5 p-10 shadow-sm backdrop-blur-xl transition"
>
  <div className="flex items-center justify-between">
    <h3 className="text-4xl font-medium tracking-tight text-white">
      AI Chat
    </h3>

    <button
      onClick={() => setIsChatExpanded(true)}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-red-500/50 hover:text-white"
    >
      Expand
    </button>
  </div>

  <div className="mt-8 h-72 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/20 p-6">
    {chatMessages.map((msg, index) => (
      <div
        key={index}
        className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
          msg.role === "user"
            ? "ml-auto max-w-[80%] bg-red-500 text-white"
            : "max-w-[85%] bg-white/10 text-white"
        }`}
      >
        {msg.content}
      </div>
    ))}

    {loadingChat && (
      <div className="text-sm text-white/50">
        Velar thinking...
      </div>
    )}
  </div>

  <div className="mt-6 flex gap-3">
    <input
      value={chatInput}
      onChange={(e) => setChatInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") sendMessage();
      }}
      placeholder="Ask Velar anything..."
      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35"
    />

    <button
      onClick={sendMessage}
      className="rounded-xl bg-red-500 px-5 py-3 text-white transition hover:bg-red-600"
    >
      Send
    </button>
  </div>
</motion.div>
    {/* OTHER MVP CARDS — easy to edit later */}
    {[
      {
        id: "knowledge",
        title: "Knowledge Vault",
        points: [
          "Store notes, context, and documents",
          "Build the base for semantic search",
          "Organize information for grounded AI replies",
        ],
        cta: "Open Knowledge Vault →",
      },
      {
        id: "tasks",
        title: "Tasks",
        points: [
          "Track actions and execution steps",
          "Structure work into manageable flows",
          "Prepare for future automation workflows",
        ],
        cta: "Open Tasks →",
      },
      {
        id: "uploads",
        title: "Uploads",
        points: [
          "Bring files into the system clearly",
          "Use uploads as future AI input sources",
          "Build pipelines around user documents",
        ],
        cta: "Open Uploads →",
      },
    ].map((card, index) => (
      <motion.div
        key={card.id}
        id={card.id}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: 0.55,
          delay: (index + 1) * 0.06,
          ease: "easeOut",
        }}
        whileHover={{ y: -8, scale: 1.01 }}
        className="min-h-[340px] rounded-[28px] border border-white/10 bg-white/5 p-10 shadow-sm backdrop-blur-xl transition"
      >
        <h3 className="text-4xl font-medium tracking-tight text-white">
          {card.title}
        </h3>

        <div className="mt-8 space-y-4 text-lg leading-8 text-white/60">
          {card.points.map((point) => (
            <p key={point}>- {point}</p>
          ))}
        </div>

        <button className="mt-10 text-lg text-red-500 transition hover:text-red-400">
          {card.cta}
        </button>
      </motion.div>
    ))}
  </div>
</section>

          {/* Credits */}
          <section
            id="credits"
            className="mx-auto w-full max-w-7xl border-t border-white/10 px-10 py-24"
          >
            <h2 className="text-5xl font-medium tracking-tight text-white">
              Credits
            </h2>

            <p className="mt-8 max-w-3xl text-2xl leading-9 text-white/60">
              Built by Punit Bhargava. A developer focused on building clean,
              scalable systems at the intersection of AI and full-stack development.
              Velar is designed as a structured workspace that goes beyond UI,
              aiming to evolve into a real-world intelligent system.
            </p>

            <div className="mt-12 flex flex-col gap-4 text-lg">
              <a
                href="https://www.linkedin.com/in/punit-bhargava-487321311/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/75 transition hover:text-red-500"
              >
                LinkedIn
              </a>

              <a
                href="https://github.com/Punitcodes-16"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/75 transition hover:text-red-500"
              >
                GitHub
              </a>
            </div>
          </section>
        </div>
        <AnimatePresence>
  {isChatExpanded && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-8 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 30 }}
        transition={{ duration: 0.3 }}
        className="flex h-[82vh] w-full max-w-5xl flex-col rounded-[32px] border border-white/10 bg-[#101010]/95 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <h2 className="text-3xl font-medium text-white">
              AI Chat
            </h2>
            <p className="mt-1 text-sm text-white/45">
              Expanded Velar conversation workspace
            </p>
          </div>

          <button
            onClick={() => setIsChatExpanded(false)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-red-500/50 hover:text-white"
          >
            Minimize
          </button>
        </div>

        <div className="mt-6 flex-1 space-y-4 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-6">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-2xl px-5 py-4 text-base leading-8 ${
                msg.role === "user"
                  ? "ml-auto max-w-[70%] bg-red-500 text-white"
                  : "max-w-[75%] bg-white/10 text-white"
              }`}
            >
              {msg.content}
            </div>
          ))}

          {loadingChat && (
            <div className="text-white/50">
              Velar thinking...
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask Velar anything..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-white/35"
          />

          <button
            onClick={sendMessage}
            className="rounded-xl bg-red-500 px-6 py-4 text-white transition hover:bg-red-600"
          >
            Send
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      </div>
      
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}

export default App;