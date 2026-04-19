import type { ChangeEvent, KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { initAudio, playClick, playDelete, playSuccess, playWarning, startHeartbeat, stopHeartbeat, setHeartbeatRate } from './lib/audio';

type ScreenState = 'start' | 'writing' | 'end' | 'gameover';
type Strictness = 'forgiving' | 'standard' | 'brutal';
type AppMode = 'shrink' | 'erase';

const STRICTNESS_THRESHOLDS = {
  forgiving: { warn: 5000, decay: 10000 },
  standard: { warn: 3000, decay: 6000 },
  brutal: { warn: 1500, decay: 3000 }
};

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('start');
  const [strictness, setStrictness] = useState<Strictness>('standard');
  const [appMode, setAppMode] = useState<AppMode>('shrink');
  
  const [topic, setTopic] = useState('');
  const [finalText, setFinalText] = useState('');
  const [finalWordCount, setFinalWordCount] = useState(0);
  const [finalElapsed, setFinalElapsed] = useState(0);
  const [finalDecayCount, setFinalDecayCount] = useState(0);

  const startSession = (t: string) => {
    setTopic(t);
    setScreen('writing');
  };

  const endSession = (text: string, wordCount: number, elapsed: number, decayCount: number) => {
    setFinalText(text);
    setFinalWordCount(wordCount);
    setFinalElapsed(elapsed);
    setFinalDecayCount(decayCount);
    setScreen('end');
  };

  const gameOverSession = (text: string, wordCount: number, elapsed: number, decayCount: number) => {
    setFinalText(text);
    setFinalWordCount(wordCount);
    setFinalElapsed(elapsed);
    setFinalDecayCount(decayCount);
    setScreen('gameover');
  };

  const restart = () => {
    setScreen('start');
    setTopic('');
  };

  return (
    <div className="min-h-screen font-mono text-[#d4d4d4] bg-[#0d0d0d] flex flex-col selection:bg-[#444] selection:text-white">
      {screen === 'start' && (
        <StartScreen 
          onStart={startSession} 
          topic={topic} 
          setTopic={setTopic} 
          strictness={strictness}
          setStrictness={setStrictness}
          appMode={appMode}
          setAppMode={setAppMode}
        />
      )}
      {screen === 'writing' && <WritingScreen topic={topic} strictness={strictness} appMode={appMode} onEnd={endSession} onGameOver={gameOverSession} />}
      {screen === 'end' && (
        <EndScreen 
          text={finalText} 
          wordCount={finalWordCount} 
          elapsed={finalElapsed} 
          decayCount={finalDecayCount}
          strictness={strictness}
          onRestart={restart}
        />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          text={finalText}
          wordCount={finalWordCount}
          elapsed={finalElapsed}
          onRestart={restart}
          onSeeDump={() => setScreen('end')}
        />
      )}
    </div>
  );
}

function StartScreen({ 
  onStart, 
  topic, 
  setTopic,
  strictness,
  setStrictness,
  appMode,
  setAppMode
}: { 
  onStart: (t: string) => void, 
  topic: string, 
  setTopic: (t: string) => void,
  strictness: Strictness,
  setStrictness: (s: Strictness) => void,
  appMode: AppMode,
  setAppMode: (m: AppMode) => void
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      initAudio();
      onStart(topic);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full relative z-10 font-sans">
      
      <div className="w-full max-w-[460px] flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-[#111] border border-solid border-[#222] rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <div className="w-3 h-3 rounded-sm bg-[#555] animate-pulse"></div>
        </div>
        
        <h1 className="text-[40px] font-semibold text-[#f0f0f0] tracking-tight font-sans leading-[1.1] mb-3">
          Brain Dump
        </h1>
        
        <p className="text-[#777] text-[16px] leading-[1.6]">
          Stop thinking. Start writing.
        </p>
      </div>

      <div className="w-full max-w-[460px] flex flex-col gap-6 mt-10">
        <input
          type="text"
          placeholder="What's your topic? (optional)"
          className="w-full bg-[#0a0a0a] border border-solid border-[#222] p-[16px_20px] text-[15px] text-[#eee] rounded-2xl focus:outline-none focus:border-[#444] transition-all placeholder:text-[#444] shadow-[0_2px_15px_rgba(0,0,0,0.5)] font-sans"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />

        <div className="bg-[#0a0a0a] border border-solid border-[#222] rounded-[18px] p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col gap-1">
          
          <div className="flex gap-1 relative">
            <button
              onClick={() => setAppMode('shrink')}
              className={`flex-1 flex justify-between items-center p-[14px_16px] rounded-2xl border border-solid cursor-pointer transition-all duration-200 text-left ${
                appMode === 'shrink' ? 'bg-[#1c1c1c] border-[#3a3a3a] shadow-md' : 'bg-transparent border-transparent hover:bg-[#111]'
              }`}
            >
              <div className="flex flex-col gap-1">
                 <div className={`text-[14px] font-medium leading-none ${appMode === 'shrink' ? 'text-[#f0f0f0]' : 'text-[#777]'}`}>Shrink Mode</div>
                 <div className={`text-[12px] leading-none ${appMode === 'shrink' ? 'text-[#888]' : 'text-[#555]'}`}>Canvas crushes you</div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full border border-solid ${appMode === 'shrink' ? 'bg-[#eee] border-[#fff]' : 'bg-transparent border-[#444]'}`}></div>
            </button>
            <button
              onClick={() => setAppMode('erase')}
              className={`flex-1 flex justify-between items-center p-[14px_16px] rounded-2xl border border-solid cursor-pointer transition-all duration-200 text-left ${
                appMode === 'erase' ? 'bg-[#1c1c1c] border-[#3a3a3a] shadow-md' : 'bg-transparent border-transparent hover:bg-[#111]'
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className={`text-[14px] font-medium leading-none ${appMode === 'erase' ? 'text-[#f0f0f0]' : 'text-[#777]'}`}>Erase Mode</div>
                <div className={`text-[12px] leading-none ${appMode === 'erase' ? 'text-[#888]' : 'text-[#555]'}`}>Thoughts vanish</div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full border border-solid ${appMode === 'erase' ? 'bg-[#eee] border-[#fff]' : 'bg-transparent border-[#444]'}`}></div>
            </button>
          </div>

          <div className="h-[1px] bg-[#1a1a1a] mx-4 my-1"></div>

          <div className="flex gap-1">
            {(['forgiving', 'standard', 'brutal'] as Strictness[]).map(level => {
              const isActive = strictness === level;
              const config = {
                forgiving: { dot: 'bg-[#5aaa6a]', color: 'text-[#5aaa6a]' },
                standard: { dot: 'bg-[#c4a87a]', color: 'text-[#c4a87a]' },
                brutal: { dot: 'bg-[#c47a7a]', color: 'text-[#c47a7a]' }
              }[level];

              return (
                <button
                  key={level}
                  onClick={() => setStrictness(level)}
                  className={`flex-1 py-[12px] px-2 rounded-xl text-[13px] font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-solid ${
                    isActive ? `bg-[#1c1c1c] border-[#3a3a3a] ${config.color} shadow-md` : 'bg-transparent border-transparent text-[#666] hover:bg-[#111] hover:text-[#888]'
                  }`}
                >
                  <div className={`w-[5px] h-[5px] rounded-full ${isActive ? config.dot : 'bg-[#444]'}`}></div>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="text-center">
          <p className="text-[12px] text-[#444] font-mono tracking-[0.05em]">
            {STRICTNESS_THRESHOLDS[strictness].warn / 1000}s warn → {STRICTNESS_THRESHOLDS[strictness].decay / 1000}s penalty
          </p>
        </div>

        <button 
          onClick={() => {
            initAudio();
            onStart(topic);
          }}
          className="group w-full bg-[#f0f0f0] text-[#0a0a0a] font-medium py-[16px] rounded-2xl cursor-pointer text-[16px] hover:bg-white transition-all transform active:scale-[0.98] border-none mt-2 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
        >
          Start Session 
          <span className="text-[#666] group-hover:text-[#0a0a0a] group-hover:translate-x-[4px] transition-all duration-300">&rarr;</span>
        </button>
      </div>
    </div>
  );
}

function WritingScreen({ 
  topic, 
  strictness,
  appMode,
  onEnd,
  onGameOver
}: { 
  topic: string, 
  strictness: Strictness,
  appMode: AppMode,
  onEnd: (text: string, words: number, elapsed: number, decay: number) => void,
  onGameOver: (text: string, words: number, elapsed: number, decay: number) => void
}) {
  const { warn, decay } = STRICTNESS_THRESHOLDS[strictness];
  const MAX_H = 360;
  const MIN_H = 44;

  const [text, setText] = useState('');
  const textRef = useRef(text);
  const dumpAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { textRef.current = text; }, [text]);

  const [now, setNow] = useState(Date.now());
  const [startTime] = useState(Date.now());
  const lastKeyTimeRef = useRef(Date.now());
  
  const [decayCount, setDecayCount] = useState(0);
  const inDangerRef = useRef(false);
  const lastDeleteTimeRef = useRef(0);
  const hasWarnedRef = useRef(false);
  
  const [currentH, setCurrentH] = useState(MAX_H);
  const [isGameoverPhase, setIsGameoverPhase] = useState(false);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      // Don't update timers while in the game over animation
      if (isGameoverPhase) return;
      const currentTime = Date.now();
      setNow(currentTime);

      const idleTime = currentTime - lastKeyTimeRef.current;
      const isEraseMode = appMode === 'erase';

      if (idleTime < warn) {
        // Calm - smoothly recover height instead of snapping instantly (if shrink mode)
        if (!isEraseMode) {
          setCurrentH(prev => {
            if (prev >= MAX_H) return MAX_H;
            return Math.min(MAX_H, prev + (MAX_H - prev) * 0.2 + 2);
          });
        } else {
          setCurrentH(MAX_H);
        }
        hasWarnedRef.current = false;
        inDangerRef.current = false;
        stopHeartbeat();
      } else if (idleTime < decay) {
        // Warning/Squeezing
        if (!hasWarnedRef.current) {
          playWarning();
          hasWarnedRef.current = true;
        }
        
        if (!isEraseMode) {
          startHeartbeat();
          const ratio = (idleTime - warn) / (decay - warn);
          setHeartbeatRate(1.0 + (ratio * 3.0));
          const raw = Math.min(ratio, 1);
          if (raw > 0.05 && !inDangerRef.current) {
            inDangerRef.current = true;
            setDecayCount(prev => prev + 1);
          }
          const eased = 1 - Math.pow(1 - raw, 2);
          const targetH = MAX_H - (MAX_H - MIN_H) * eased;
          setCurrentH(targetH);

          if (dumpAreaRef.current) {
            dumpAreaRef.current.scrollTop = dumpAreaRef.current.scrollHeight;
          }
        }
      } else {
        // Panic Phase
        if (!isEraseMode) {
          stopHeartbeat();
          // CRT Game Over trigger
          setIsGameoverPhase(true);
          import('./lib/audio').then(({ playGameOver }) => playGameOver());
          
          setTimeout(() => {
            const finalWordCount = textRef.current.trim().split(/\s+/).filter(w => w.length > 0).length;
            const finalElapsed = Math.floor((Date.now() - startTime) / 1000);
            onGameOver(textRef.current, finalWordCount, finalElapsed, decayCount);
          }, 500); // Wait for the CRT animation to finish
        } else {
          // Erase Mode logic: Start deleting letters backwards
          if (!hasWarnedRef.current) {
            playWarning();
            hasWarnedRef.current = true;
          }
          if (!inDangerRef.current) {
            inDangerRef.current = true;
            setDecayCount(prev => prev + 1);
          }
          
          setCurrentH(MAX_H); // No physical crush
          
          if (currentTime - lastDeleteTimeRef.current >= 80) {
            if (textRef.current.length > 0) {
              playDelete();
              textRef.current = textRef.current.slice(0, -1);
              setText(textRef.current);
              lastDeleteTimeRef.current = currentTime;
            }
          }
        }
      }
      
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      stopHeartbeat();
    };
  }, [warn, decay, isGameoverPhase, onEnd, startTime, decayCount, appMode, onGameOver]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Reset idle timer on actual value change
    lastKeyTimeRef.current = Date.now();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Also reset timer on any keydown (e.g. arrows, backspace, modifiers) to ensure they aren't penalized for editing
    lastKeyTimeRef.current = Date.now();
    
    // Only play click sound on actual character insertion or backspace, ignore modifiers/arrows to prevent spam
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      playClick();
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const elapsed = Math.floor((now - startTime) / 1000);

  const idleTime = now - lastKeyTimeRef.current;
  let barWidth = '100%';
  
  // Base visual styling for the squeeze container
  let containerBorder = '#222';
  let squeezeBarColor = '#1a1a1a';
  let pressureColor = "transparent";
  let pressureMsg = "";
  let isDanger = false;
  let textScaleColor = '#d4d4d4';
  let progressRatio = 0;

  if (idleTime < warn) {
    // safe
    pressureMsg = "";
  } else if (idleTime < decay) {
    progressRatio = (idleTime - warn) / (decay - warn);
    barWidth = `${Math.max(0, (1 - progressRatio) * 100)}%`;
    
    // Warn colors
    if (strictness === 'forgiving') {
      containerBorder = '#1a4a2a';
      squeezeBarColor = '#1a5a2a';
      pressureColor = '#5aaa6a';
    } else if (strictness === 'standard') {
      containerBorder = '#4a3a1a';
      squeezeBarColor = '#7a5a1a';
      pressureColor = '#c4a87a';
    } else {
      containerBorder = '#4a1a1a';
      squeezeBarColor = '#7a1a1a';
      pressureColor = '#c47a7a';
    }
    
    if (appMode === 'erase') {
      pressureMsg = strictness === 'brutal' ? 'thoughts fading...' : 'words are fading...';
    } else {
      pressureMsg = strictness === 'brutal' ? 'shrinking fast...' : 'canvas is shrinking...';
    }
    textScaleColor = '#e0e0e0';
  } else {
    // Danger
    barWidth = '0%';
    isDanger = true;
    
    if (strictness === 'forgiving') {
      containerBorder = '#2a7a3a';
      squeezeBarColor = '#2a8a3a';
      pressureColor = '#5aaa6a';
      pressureMsg = appMode === 'erase' ? 'erasing...' : 'keep writing...';
    } else if (strictness === 'standard') {
      containerBorder = '#7a5a1a';
      squeezeBarColor = '#9a6a1a';
      pressureColor = '#c4a87a';
      pressureMsg = appMode === 'erase' ? 'erasing words...' : 'running out of space...';
    } else {
      containerBorder = '#8a1a1a';
      squeezeBarColor = '#cc2222';
      pressureColor = '#c47a7a';
      pressureMsg = appMode === 'erase' ? 'LOSING THOUGHTS.' : 'WRITE. NOW.';
    }
    
    textScaleColor = '#ffffff';
  }

  // Calculate the physical size of the bottom squeeze bar overlay
  const squeezeBarHeight = Math.round((1 - (currentH - MIN_H) / (MAX_H - MIN_H)) * 5);
  const isSqueezing = currentH < MAX_H - 20;

  // Determine hidden lines
  let hiddenLinesCount = 0;
  if (isSqueezing && dumpAreaRef.current) {
    const hiddenPx = dumpAreaRef.current.scrollHeight - currentH;
    if (hiddenPx > 10) {
      hiddenLinesCount = Math.ceil(hiddenPx / 27);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center w-full max-w-[640px] mx-auto p-4 relative bg-[#0d0d0d] font-sans">
      
      <div className="flex flex-col gap-3 w-full">
        <header className="flex justify-between items-center bg-[#0d0d0d]">
          <span className="text-[12px] font-mono text-[#555] tracking-[0.1em] lowercase">{topic || 'brain dump'}</span>
          <div className="flex items-center gap-4">
            <span className="text-[12px] font-mono text-[#444]">words: <span className="text-[#777]">{wordCount}</span></span>
            <span className="text-[12px] font-mono text-[#444]">time: <span className="text-[#777]">{formatTime(elapsed)}</span></span>
            
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] border border-solid tracking-[0.08em]
              ${strictness === 'forgiving' ? 'text-[#5aaa6a] border-[#1a3a22] bg-[#0d1f11]' : ''}
              ${strictness === 'standard' ? 'text-[#c4a87a] border-[#3a2e0a] bg-[#1a1508]' : ''}
              ${strictness === 'brutal' ? 'text-[#c47a7a] border-[#3a0f0f] bg-[#1a0808]' : ''}
            `}>
              {strictness}
            </span>
          </div>
        </header>

        <div className="w-full h-[2px] bg-[#1a1a1a] rounded-[2px] overflow-hidden">
          <div 
            className="h-full rounded-[2px] bg-[#2a2a2a] transition-all duration-300 ease-linear"
            style={{ 
              width: barWidth,
              backgroundColor: isDanger ? '#cc2222' : (idleTime >= warn ? squeezeBarColor : '#2a2a2a') 
            }} 
          ></div>
        </div>

        <div 
          className={`relative rounded-lg overflow-hidden border border-solid ${isGameoverPhase ? 'animate-crt-off' : 'transition-[height_border-color] duration-[120px_400ms]'} ${isDanger ? 'bg-[#1a0808]' : 'bg-[#111]'} ${(idleTime - warn) / (decay - warn) >= 0.85 && !isGameoverPhase && appMode !== 'erase' ? 'animate-panic-shake' : ''}`}
          style={{ 
            height: `${currentH}px`,
            borderColor: isDanger ? '#cc2222' : containerBorder
          }}
        >
          <textarea
            ref={dumpAreaRef}
            autoFocus
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="just start writing what's in your head..."
            className="w-full h-full bg-transparent border-none text-[#d4d4d4] font-mono text-[15px] leading-[1.8] resize-none outline-none overflow-y-auto block transition-[background_color] duration-300"
            style={{
              padding: `${Math.max(8, Math.min(20, (currentH / MAX_H) * 20))}px 20px`,
              color: textScaleColor,
            }}
          />
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none rounded-b-lg transition-colors duration-400"
            style={{ 
              height: `${squeezeBarHeight}px`,
              backgroundColor: squeezeBarColor
            }}
          ></div>
          <div 
            className={`absolute bottom-[8px] right-[12px] text-[10px] font-mono pointer-events-none transition-colors duration-300 ${isSqueezing ? 'text-[#555]' : 'text-transparent'}`}
          >
            {hiddenLinesCount > 0 ? `+${hiddenLinesCount} lines hidden` : ''}
          </div>
        </div>

        <footer className="flex justify-between items-center pt-2">
          <span 
            className="text-[12px] font-mono transition-colors duration-300"
            style={{ color: pressureColor }}
          >
            {pressureMsg}
          </span>
          <button 
            onClick={() => {
              playSuccess();
              onEnd(text, wordCount, elapsed, decayCount);
            }}
            className="bg-transparent border-[0.5px] border-solid border-[#2e2e2e] hover:border-[#555] text-[#555] hover:text-[#888] px-5 py-2 rounded-lg text-[13px] font-mono cursor-pointer transition-colors duration-200"
          >
            i'm done &rarr;
          </button>
        </footer>
      </div>
    </div>
  );
}

function EndScreen({ text, wordCount, elapsed, decayCount, strictness, onRestart }: { text: string, wordCount: number, elapsed: number, decayCount: number, strictness: Strictness, onRestart: () => void }) {
  let headline = '';
  if (wordCount === 0) headline = "Nothing yet.";
  else if (wordCount < 30) headline = "A start.";
  else if (wordCount < 80) headline = "Getting there.";
  else if (wordCount < 150) headline = "Solid dump.";
  else headline = "That's a brain.";

  const wpm = elapsed > 0 ? Math.round((wordCount / (elapsed / 60))) : 0;

  return (
    <div className="flex-1 flex flex-col justify-center max-w-[640px] mx-auto w-full p-4 relative font-sans">
      <p className="text-[12px] font-mono text-[#555] tracking-[0.15em] uppercase mb-1.5">session complete</p>
      <h2 className="text-[26px] font-medium text-[#f0f0f0] mb-1">{headline}</h2>
      <p className="text-[12px] font-mono text-[#444] mb-6">completed on {strictness} mode</p>
      
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-[#161616] border border-solid border-[#222] rounded-lg p-3 pt-3.5">
          <div className="text-[22px] font-medium text-[#f0f0f0] font-mono mb-1 leading-none">{wordCount}</div>
          <div className="text-[10px] text-[#555] font-mono">words</div>
        </div>
        <div className="bg-[#161616] border border-solid border-[#222] rounded-lg p-3 pt-3.5">
          <div className="text-[22px] font-medium text-[#f0f0f0] font-mono mb-1 leading-none">{formatTime(elapsed)}</div>
          <div className="text-[10px] text-[#555] font-mono">time</div>
        </div>
        <div className="bg-[#161616] border border-solid border-[#222] rounded-lg p-3 pt-3.5">
          <div className="text-[22px] font-medium text-[#f0f0f0] font-mono mb-1 leading-none">{decayCount}</div>
          <div className="text-[10px] text-[#555] font-mono">squeezes</div>
        </div>
        <div className="bg-[#161616] border border-solid border-[#222] rounded-lg p-3 pt-3.5">
          <div className="text-[22px] font-medium text-[#f0f0f0] font-mono mb-1 leading-none">{wpm}</div>
          <div className="text-[10px] text-[#555] font-mono">wpm</div>
        </div>
      </div>

      <p className="text-[11px] font-mono text-[#444] tracking-[0.1em] uppercase mb-2">your full dump — nothing was deleted</p>
      
      <div className="bg-[#111] border border-solid border-[#1e1e1e] rounded-lg p-5 font-mono text-[13px] text-[#777] leading-[1.8] max-h-[200px] overflow-y-auto whitespace-pre-wrap break-words mb-5">
        {text || <span className="italic text-[#444]">(nothing written)</span>}
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => {
            initAudio();
            onRestart();
          }}
          className="flex-1 bg-[#f0f0f0] text-[#0d0d0d] border-none p-3.5 rounded-lg text-[14px] font-medium cursor-pointer font-mono hover:opacity-85 transition-opacity"
        >
          dump again
        </button>
      </div>
    </div>
  );
}

function GameOverScreen({ wordCount, elapsed, onRestart, onSeeDump }: { wordCount: number, elapsed: number, text: string, onRestart: () => void, onSeeDump: () => void }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-6 w-full relative z-10 font-sans">
      <p className="font-mono text-[11px] text-[#5a1a1a] tracking-[0.3em] uppercase mb-4">canvas crushed</p>
      <h2 className="text-[52px] font-medium text-[#cc2222] font-mono leading-none mb-2 tracking-[-0.02em]">game over.</h2>
      <p className="font-mono text-[14px] text-[#555] mb-8">you stopped writing.</p>

      <div className="flex gap-3 justify-center mb-8">
        <div className="bg-[#111] border border-solid border-[#2a2a2a] rounded-lg p-[14px_24px] min-w-[110px]">
          <div className="text-[24px] font-medium text-[#f0f0f0] font-mono mb-1 leading-none">{wordCount}</div>
          <div className="text-[10px] text-[#555] font-mono tracking-[0.1em]">words written</div>
        </div>
        <div className="bg-[#111] border border-solid border-[#2a2a2a] rounded-lg p-[14px_24px] min-w-[110px]">
          <div className="text-[24px] font-medium text-[#f0f0f0] font-mono mb-1 leading-none">{formatTime(elapsed)}</div>
          <div className="text-[10px] text-[#555] font-mono tracking-[0.1em]">time survived</div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <button
           onClick={() => {
             initAudio();
             onRestart();
           }}
           className="w-[280px] bg-[#cc2222] text-white border-none p-[14px] rounded-lg text-[15px] font-medium cursor-pointer font-mono tracking-[0.03em] hover:opacity-85 transition-opacity"
        >
           try again
        </button>
        <button
           onClick={onSeeDump}
           className="bg-transparent border-[0.5px] border-solid border-[#2a2a2a] text-[#555] p-[10px_24px] rounded-lg text-[13px] cursor-pointer font-mono transition-colors hover:border-[#555] hover:text-[#888]"
        >
           see what i wrote anyway &rarr;
        </button>
      </div>
    </div>
  );
}
