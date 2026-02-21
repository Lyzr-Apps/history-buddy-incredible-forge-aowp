'use client'

import React from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import type { AIAgentResponse } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { FiPlus, FiSearch, FiClock, FiChevronDown, FiChevronUp, FiCopy, FiSave, FiRefreshCw, FiArrowLeft, FiMenu, FiX, FiHome, FiFileText, FiFolder, FiPlay, FiCheck, FiAlertCircle, FiEye, FiTrash2, FiTag, FiStar, FiBookOpen, FiTarget, FiZap, FiGlobe, FiHelpCircle, FiLoader } from 'react-icons/fi'

// ─── TypeScript Interfaces ─────────────────────────────────────────────────────

interface InteractiveElement {
  type: string
  content: string
}

interface Scene {
  scene_number: number
  scene_title: string
  narration: string
  visual_suggestions: string
  duration_estimate: string
  interactive_elements: InteractiveElement[]
}

interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: string
  scene_placement: number
}

interface FunFact {
  fact: string
  why_its_cool: string
  scene_placement: number
}

interface ModernConnection {
  historical_element: string
  modern_link: string
  scene_placement: number
}

interface KeyEvent {
  date: string
  event: string
  significance: string
}

interface KeyFigure {
  name: string
  role: string
  detail: string
}

interface ResearchSummary {
  overview: string
  key_events: KeyEvent[]
  key_figures: KeyFigure[]
}

interface ScriptData {
  script_title: string
  topic: string
  target_age_range: string
  video_length: string
  style_tags: string[]
  research_summary: ResearchSummary
  scenes: Scene[]
  quiz_questions: QuizQuestion[]
  fun_facts: FunFact[]
  modern_connections: ModernConnection[]
  intro_hook: string
  outro_cta: string
  production_notes: string
}

interface SavedScript extends ScriptData {
  id: string
  created_at: string
}

type ScreenType = 'dashboard' | 'new-script' | 'script-viewer'

// ─── Constants ──────────────────────────────────────────────────────────────────

const MANAGER_AGENT_ID = '6999cf0e6be0a645ebe7f78e'

const AGENTS = [
  { id: '6999cf0e6be0a645ebe7f78e', name: 'Script Production Manager', role: 'Coordinates research and script creation' },
  { id: '6999cef2b6d5f732116819e2', name: 'History Research Agent', role: 'Deep historical research and fact gathering' },
  { id: '6999cef22b9e1319f70b1541', name: 'Script & Visual Creator Agent', role: 'Script writing and visual direction' },
]

const LOADING_MESSAGES = [
  'Traveling back in time...',
  'Researching ancient archives...',
  'Interviewing historical figures...',
  'Gathering fun facts...',
  'Writing the script...',
  'Adding visual magic...',
  'Crafting quiz questions...',
  'Connecting past to present...',
  'Polishing the final draft...',
]

const SAMPLE_SCRIPTS: SavedScript[] = [
  {
    id: 'sample-1',
    created_at: '2026-02-20T10:30:00Z',
    script_title: 'The Wonders of Ancient Egypt',
    topic: 'Ancient Egypt',
    target_age_range: '6-10',
    video_length: '10 min',
    style_tags: ['Story-driven', 'Fun Facts'],
    research_summary: {
      overview: 'Ancient Egypt was one of the longest-lasting civilizations in history, spanning over 3,000 years along the Nile River in northeastern Africa.',
      key_events: [
        { date: '3100 BCE', event: 'Unification of Upper and Lower Egypt', significance: 'Created the first Egyptian dynasty and established one of the earliest nation-states.' },
        { date: '2560 BCE', event: 'Construction of the Great Pyramid of Giza', significance: 'Built as a tomb for Pharaoh Khufu, it remains one of the Seven Wonders of the Ancient World.' },
        { date: '1332 BCE', event: 'Tutankhamun becomes Pharaoh', significance: 'The boy king whose intact tomb was discovered in 1922, teaching us volumes about Egyptian burial practices.' },
      ],
      key_figures: [
        { name: 'Cleopatra VII', role: 'Last active ruler of the Ptolemaic Kingdom of Egypt', detail: 'She could speak nine languages and was known for her intelligence more than her beauty.' },
        { name: 'Ramesses II', role: 'Pharaoh of the Nineteenth Dynasty', detail: 'Often called Ramesses the Great, he lived to be 90 years old in an era when most people barely reached 40.' },
      ],
    },
    scenes: [
      {
        scene_number: 1,
        scene_title: 'The Land of the Nile',
        narration: 'Imagine a river so powerful it created an entire civilization! The Nile River flows through the desert like a green ribbon, bringing life to everything it touches. Every year, the Nile would flood, leaving behind rich, dark soil perfect for growing food.',
        visual_suggestions: 'Aerial shot of the Nile River cutting through golden desert. Animated transition showing the flood cycle with water rising and receding, leaving green fields.',
        duration_estimate: '2 minutes',
        interactive_elements: [
          { type: 'poll', content: 'Can you guess how long the Nile River is? A) 1,000 miles B) 4,132 miles C) 2,500 miles' },
        ],
      },
      {
        scene_number: 2,
        scene_title: 'Building the Pyramids',
        narration: 'The Great Pyramid of Giza took about 20 years to build. Thousands of workers moved more than 2 million stone blocks, each weighing as much as a small car! But how did they do it without modern machines?',
        visual_suggestions: '3D reconstruction of pyramid construction. Workers moving limestone blocks on wooden sledges. Cross-section animation showing internal chambers.',
        duration_estimate: '3 minutes',
        interactive_elements: [
          { type: 'quiz', content: 'How many blocks were used to build the Great Pyramid?' },
          { type: 'clickable', content: 'Tap to explore inside the pyramid chambers' },
        ],
      },
      {
        scene_number: 3,
        scene_title: 'Life as an Egyptian Kid',
        narration: 'What was it like being a kid in Ancient Egypt? Well, kids played with toys, had pets, and even went to school! Egyptian children played with dolls, toy animals, and balls. They also loved board games.',
        visual_suggestions: 'Animated scene of Egyptian children playing Senet board game. Split screen comparing ancient toys with modern equivalents.',
        duration_estimate: '2.5 minutes',
        interactive_elements: [
          { type: 'comparison', content: 'Ancient Senet vs Modern Board Games' },
        ],
      },
    ],
    quiz_questions: [
      { question: 'What river was essential to Ancient Egyptian civilization?', options: ['The Amazon', 'The Nile', 'The Mississippi', 'The Danube'], correct_answer: 'The Nile', scene_placement: 1 },
      { question: 'How long did it take to build the Great Pyramid?', options: ['5 years', '10 years', '20 years', '50 years'], correct_answer: '20 years', scene_placement: 2 },
    ],
    fun_facts: [
      { fact: 'Ancient Egyptians invented toothpaste! They made it from crushed eggshells and ox hooves.', why_its_cool: 'Next time you brush your teeth, thank the Egyptians!', scene_placement: 3 },
      { fact: 'Egyptian kids shaved their heads except for one long braid called the "sidelock of youth."', why_its_cool: 'It was their version of a cool hairstyle that showed everyone they were young.', scene_placement: 3 },
    ],
    modern_connections: [
      { historical_element: 'Egyptian hieroglyphs as a writing system', modern_link: 'Just like emojis today, hieroglyphs used pictures to communicate ideas and feelings!', scene_placement: 1 },
      { historical_element: 'The ancient Egyptian calendar', modern_link: 'Our 365-day calendar is based on the one Egyptians created thousands of years ago.', scene_placement: 2 },
    ],
    intro_hook: 'What if I told you that kids your age once played with toys, went to school, and had pets -- but they did it all 4,000 years ago? Welcome to Ancient Egypt!',
    outro_cta: 'Now you know the secrets of Ancient Egypt! Hit that subscribe button to travel through time with us every week. Next stop: Ancient Rome!',
    production_notes: 'Use warm, golden color palette throughout. Keep narration pace moderate for younger audience. Include pronunciation guides for Egyptian names.',
  },
  {
    id: 'sample-2',
    created_at: '2026-02-19T14:15:00Z',
    script_title: 'The Space Race: To the Moon and Beyond',
    topic: 'The Space Race',
    target_age_range: '11-14',
    video_length: '15 min',
    style_tags: ['Story-driven', 'Modern Connections', 'Quiz-heavy'],
    research_summary: {
      overview: 'The Space Race was a 20th-century competition between the USA and USSR to achieve spaceflight supremacy, culminating in the Apollo 11 moon landing.',
      key_events: [
        { date: '1957', event: 'Sputnik Launch', significance: 'The USSR launched the first artificial satellite, shocking the world and igniting the Space Race.' },
        { date: '1969', event: 'Apollo 11 Moon Landing', significance: 'Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon.' },
      ],
      key_figures: [
        { name: 'Neil Armstrong', role: 'First human to walk on the Moon', detail: 'He was so calm during the landing that his heart rate only reached 150 bpm.' },
      ],
    },
    scenes: [
      {
        scene_number: 1,
        scene_title: 'The Starting Gun',
        narration: 'It all started with a beep. On October 4, 1957, a small metal sphere orbiting Earth changed everything.',
        visual_suggestions: 'Dark space background with Sputnik model orbiting. Radio beep sound overlay. Cold War era newsreel footage.',
        duration_estimate: '3 minutes',
        interactive_elements: [
          { type: 'audio', content: 'Listen to the actual Sputnik signal' },
        ],
      },
    ],
    quiz_questions: [
      { question: 'Which country launched Sputnik?', options: ['USA', 'USSR', 'UK', 'France'], correct_answer: 'USSR', scene_placement: 1 },
    ],
    fun_facts: [
      { fact: 'Astronauts grow up to 2 inches taller in space because their spines decompress without gravity!', why_its_cool: 'Imagine coming back from a trip and being taller than when you left.', scene_placement: 1 },
    ],
    modern_connections: [
      { historical_element: 'NASA technology from the Space Race', modern_link: 'Memory foam in your mattress, scratch-resistant lenses, and even water filters all came from NASA research!', scene_placement: 1 },
    ],
    intro_hook: 'Two superpowers. One Moon. And a race that changed humanity forever.',
    outro_cta: 'The Space Race may be over, but the adventure continues. Subscribe to explore more history!',
    production_notes: 'Use dramatic orchestral music. Fast-paced editing for older audience.',
  },
]

const STORAGE_KEY = 'historyquest_scripts'

// ─── Helpers ────────────────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-[1.55]">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  )
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// ─── ErrorBoundary ──────────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(30,40%,98%)] text-[hsl(20,40%,10%)]">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-[hsl(20,25%,45%)] mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] rounded-[0.875rem] text-sm font-medium">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Sub-Components ─────────────────────────────────────────────────────────────

function Sidebar({ currentScreen, onNavigate, sidebarOpen, onClose }: {
  currentScreen: ScreenType
  onNavigate: (s: ScreenType) => void
  sidebarOpen: boolean
  onClose: () => void
}) {
  const navItems: { screen: ScreenType; icon: React.ReactNode; label: string }[] = [
    { screen: 'dashboard', icon: <FiHome className="w-5 h-5" />, label: 'Dashboard' },
    { screen: 'new-script', icon: <FiPlus className="w-5 h-5" />, label: 'New Script' },
    { screen: 'dashboard', icon: <FiFolder className="w-5 h-5" />, label: 'My Scripts' },
  ]

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[hsl(30,40%,96%)] border-r border-[hsl(30,35%,88%)] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-[hsl(30,35%,88%)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[0.875rem] bg-[hsl(24,95%,53%)] flex items-center justify-center">
                <FiBookOpen className="w-5 h-5 text-[hsl(30,40%,98%)]" />
              </div>
              <h1 className="text-lg font-serif font-semibold text-[hsl(20,40%,10%)] tracking-[-0.01em]">HistoryQuest</h1>
            </div>
            <button onClick={onClose} className="lg:hidden p-1 text-[hsl(20,25%,45%)] hover:text-[hsl(20,40%,10%)]">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, idx) => {
            const isActive = item.screen === currentScreen && !(idx === 2 && currentScreen === 'new-script')
            return (
              <button
                key={idx}
                onClick={() => { onNavigate(item.screen); onClose() }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[0.875rem] text-sm font-medium transition-all duration-200 ${isActive ? 'bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] shadow-md shadow-[hsl(24,95%,53%)]/20' : 'text-[hsl(20,25%,45%)] hover:bg-[hsl(30,35%,92%)] hover:text-[hsl(20,40%,10%)]'}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[hsl(30,35%,88%)]">
          <div className="bg-[hsl(30,35%,92%)] rounded-[0.875rem] p-4">
            <p className="text-xs font-medium text-[hsl(20,25%,45%)] mb-1">Powered by</p>
            <p className="text-xs text-[hsl(20,25%,45%)]">AI Script Production Manager</p>
          </div>
        </div>
      </aside>
    </>
  )
}

function TopHeader({ onToggleSidebar, title }: { onToggleSidebar: () => void; title: string }) {
  return (
    <header className="sticky top-0 z-30 bg-[hsl(30,40%,98%)]/80 backdrop-blur-[16px] border-b border-[hsl(30,35%,88%)]">
      <div className="flex items-center gap-4 px-4 py-3 lg:px-8">
        <button onClick={onToggleSidebar} className="lg:hidden p-2 text-[hsl(20,25%,45%)] hover:text-[hsl(20,40%,10%)] rounded-[0.875rem] hover:bg-[hsl(30,35%,92%)]">
          <FiMenu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-serif font-semibold text-[hsl(20,40%,10%)] tracking-[-0.01em]">{title}</h2>
      </div>
    </header>
  )
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[0.875rem] border border-[hsl(30,35%,88%)] text-[hsl(20,25%,45%)] hover:bg-[hsl(30,35%,92%)] hover:text-[hsl(20,40%,10%)] transition-all duration-200">
      {copied ? <FiCheck className="w-3.5 h-3.5 text-green-600" /> : <FiCopy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : (label ?? 'Copy')}
    </button>
  )
}

function SceneAccordion({ scene, quizQuestions, funFacts, modernConnections }: {
  scene: Scene
  quizQuestions: QuizQuestion[]
  funFacts: FunFact[]
  modernConnections: ModernConnection[]
}) {
  const [expanded, setExpanded] = useState(false)
  const [visualExpanded, setVisualExpanded] = useState(false)

  const sceneQuiz = quizQuestions.filter(q => q?.scene_placement === scene?.scene_number)
  const sceneFacts = funFacts.filter(f => f?.scene_placement === scene?.scene_number)
  const sceneConnections = modernConnections.filter(c => c?.scene_placement === scene?.scene_number)

  return (
    <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] overflow-hidden transition-all duration-300">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-5 text-left hover:bg-[hsl(30,35%,92%)]/50 transition-colors duration-200">
        <div className="flex items-center gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] flex items-center justify-center text-sm font-semibold">
            {scene?.scene_number ?? '?'}
          </span>
          <div>
            <h4 className="font-semibold text-[hsl(20,40%,10%)] tracking-[-0.01em]">{scene?.scene_title ?? 'Untitled Scene'}</h4>
            <span className="text-xs text-[hsl(20,25%,45%)] flex items-center gap-1 mt-0.5">
              <FiClock className="w-3 h-3" />
              {scene?.duration_estimate ?? 'Unknown'}
            </span>
          </div>
        </div>
        {expanded ? <FiChevronUp className="w-5 h-5 text-[hsl(20,25%,45%)]" /> : <FiChevronDown className="w-5 h-5 text-[hsl(20,25%,45%)]" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          <div className="pl-12">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold text-[hsl(20,25%,45%)] uppercase tracking-wide">Narration</h5>
              <CopyButton text={scene?.narration ?? ''} label="Copy Narration" />
            </div>
            <div className="bg-[hsl(30,40%,98%)] rounded-[0.875rem] p-4 border border-[hsl(30,35%,88%)] text-sm text-[hsl(20,40%,10%)] leading-[1.55]">
              {renderMarkdown(scene?.narration ?? '')}
            </div>
          </div>

          <div className="pl-12">
            <button onClick={() => setVisualExpanded(!visualExpanded)} className="flex items-center gap-2 text-xs font-semibold text-[hsl(24,95%,53%)] hover:text-[hsl(12,80%,50%)] transition-colors">
              <FiEye className="w-3.5 h-3.5" />
              Visual & Animation Suggestions
              {visualExpanded ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            </button>
            {visualExpanded && (
              <div className="mt-2 bg-[hsl(24,95%,53%)]/5 rounded-[0.875rem] p-4 border border-[hsl(24,95%,53%)]/20 text-sm text-[hsl(20,40%,10%)] leading-[1.55]">
                {renderMarkdown(scene?.visual_suggestions ?? '')}
              </div>
            )}
          </div>

          {Array.isArray(scene?.interactive_elements) && scene.interactive_elements.length > 0 && (
            <div className="pl-12">
              <h5 className="text-xs font-semibold text-[hsl(20,25%,45%)] uppercase tracking-wide mb-2">Interactive Elements</h5>
              <div className="space-y-2">
                {scene.interactive_elements.map((el, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[hsl(30,35%,92%)] rounded-[0.875rem] p-3">
                    <span className="flex-shrink-0 px-2 py-0.5 bg-[hsl(24,95%,53%)]/10 text-[hsl(24,95%,53%)] text-[10px] font-semibold uppercase rounded-full mt-0.5">{el?.type ?? 'element'}</span>
                    <p className="text-xs text-[hsl(20,40%,10%)] leading-[1.55]">{el?.content ?? ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sceneQuiz.length > 0 && (
            <div className="pl-12 space-y-3">
              {sceneQuiz.map((q, idx) => (
                <QuizCard key={idx} quiz={q} />
              ))}
            </div>
          )}

          {sceneFacts.length > 0 && (
            <div className="pl-12 space-y-3">
              {sceneFacts.map((f, idx) => (
                <FunFactCard key={idx} fact={f} />
              ))}
            </div>
          )}

          {sceneConnections.length > 0 && (
            <div className="pl-12 space-y-3">
              {sceneConnections.map((c, idx) => (
                <ModernConnectionCard key={idx} connection={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function QuizCard({ quiz }: { quiz: QuizQuestion }) {
  const [revealed, setRevealed] = useState(false)
  const options = Array.isArray(quiz?.options) ? quiz.options : []
  return (
    <div className="bg-[hsl(260,60%,98%)] border border-[hsl(260,40%,88%)] rounded-[0.875rem] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[hsl(260,50%,60%)] flex items-center justify-center">
          <FiHelpCircle className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-[hsl(260,50%,40%)] uppercase tracking-wide">Quiz Question</span>
      </div>
      <p className="text-sm font-medium text-[hsl(20,40%,10%)] mb-3 leading-[1.55]">{quiz?.question ?? ''}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {options.map((opt, oidx) => (
          <div key={oidx} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${revealed && opt === quiz?.correct_answer ? 'bg-green-50 border-green-300 text-green-800' : 'bg-white border-[hsl(30,35%,88%)] text-[hsl(20,40%,10%)]'}`}>
            {String.fromCharCode(65 + oidx)}. {opt}
          </div>
        ))}
      </div>
      <button onClick={() => setRevealed(!revealed)} className="text-xs text-[hsl(260,50%,60%)] font-medium hover:text-[hsl(260,50%,40%)] transition-colors">
        {revealed ? 'Hide Answer' : 'Reveal Answer'}
      </button>
    </div>
  )
}

function FunFactCard({ fact }: { fact: FunFact }) {
  return (
    <div className="bg-[hsl(45,90%,96%)] border border-[hsl(45,70%,80%)] rounded-[0.875rem] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[hsl(45,80%,55%)] flex items-center justify-center">
          <FiStar className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-[hsl(45,60%,35%)] uppercase tracking-wide">Did You Know?</span>
      </div>
      <p className="text-sm font-medium text-[hsl(20,40%,10%)] leading-[1.55] mb-1">{fact?.fact ?? ''}</p>
      {fact?.why_its_cool && (
        <p className="text-xs text-[hsl(20,25%,45%)] italic leading-[1.55]">{fact.why_its_cool}</p>
      )}
    </div>
  )
}

function ModernConnectionCard({ connection }: { connection: ModernConnection }) {
  return (
    <div className="bg-[hsl(200,60%,97%)] border border-[hsl(200,40%,85%)] rounded-[0.875rem] p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-[hsl(200,60%,50%)] flex items-center justify-center">
          <FiGlobe className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-[hsl(200,50%,35%)] uppercase tracking-wide">Today's Link</span>
      </div>
      <p className="text-sm text-[hsl(20,40%,10%)] leading-[1.55] mb-1"><strong className="font-semibold">{connection?.historical_element ?? ''}</strong></p>
      <p className="text-xs text-[hsl(20,25%,45%)] leading-[1.55]">{connection?.modern_link ?? ''}</p>
    </div>
  )
}

function AgentStatusPanel({ activeAgentId }: { activeAgentId: string | null }) {
  return (
    <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-4">
      <h4 className="text-xs font-semibold text-[hsl(20,25%,45%)] uppercase tracking-wide mb-3">Agent Pipeline</h4>
      <div className="space-y-2">
        {AGENTS.map((agent) => {
          const isActive = activeAgentId === agent.id
          return (
            <div key={agent.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${isActive ? 'bg-[hsl(24,95%,53%)]/10 border border-[hsl(24,95%,53%)]/30' : ''}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-[hsl(24,95%,53%)] animate-pulse' : 'bg-[hsl(30,30%,80%)]'}`} />
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate ${isActive ? 'text-[hsl(24,95%,53%)]' : 'text-[hsl(20,40%,10%)]'}`}>{agent.name}</p>
                <p className="text-[10px] text-[hsl(20,25%,45%)] truncate">{agent.role}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DashboardScreen({ savedScripts, onViewScript, onDeleteScript, onNavigate, showSampleData, onToggleSample }: {
  savedScripts: SavedScript[]
  onViewScript: (s: SavedScript) => void
  onDeleteScript: (id: string) => void
  onNavigate: (s: ScreenType) => void
  showSampleData: boolean
  onToggleSample: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [ageFilter, setAgeFilter] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const displayScripts = showSampleData ? [...savedScripts, ...SAMPLE_SCRIPTS] : savedScripts

  const filteredScripts = useMemo(() => {
    return displayScripts.filter(s => {
      const matchesSearch = !searchQuery || (s?.script_title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) || (s?.topic ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAge = ageFilter === 'all' || (s?.target_age_range ?? '') === ageFilter
      return matchesSearch && matchesAge
    })
  }, [displayScripts, searchQuery, ageFilter])

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDeleteScript(id)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-[hsl(20,40%,10%)] tracking-[-0.01em]">Dashboard</h2>
          <p className="text-sm text-[hsl(20,25%,45%)] mt-1">Create educational history video scripts</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-medium text-[hsl(20,25%,45%)]">Sample Data</span>
          <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${showSampleData ? 'bg-[hsl(24,95%,53%)]' : 'bg-[hsl(30,30%,80%)]'}`} onClick={onToggleSample}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${showSampleData ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </label>
      </div>

      <button onClick={() => onNavigate('new-script')} className="w-full bg-gradient-to-r from-[hsl(24,95%,53%)] to-[hsl(12,80%,50%)] text-[hsl(30,40%,98%)] rounded-[0.875rem] p-6 flex items-center justify-between shadow-lg shadow-[hsl(24,95%,53%)]/20 hover:shadow-xl hover:shadow-[hsl(24,95%,53%)]/30 transition-all duration-300 group">
        <div className="text-left">
          <h3 className="text-xl font-serif font-semibold tracking-[-0.01em]">Create New Video Script</h3>
          <p className="text-sm opacity-90 mt-1">Transform any history topic into an engaging educational video</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <FiPlus className="w-6 h-6" />
        </div>
      </button>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(20,25%,45%)]" />
          <input
            type="text"
            placeholder="Search scripts by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[hsl(30,40%,96%)] border border-[hsl(30,35%,88%)] rounded-[0.875rem] text-sm text-[hsl(20,40%,10%)] placeholder:text-[hsl(20,25%,45%)]/60 focus:outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]/30 focus:border-[hsl(24,95%,53%)] transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', '6-10', '11-14', 'Mixed'].map(age => (
            <button
              key={age}
              onClick={() => setAgeFilter(age)}
              className={`px-3 py-2 rounded-[0.875rem] text-xs font-medium border transition-all duration-200 ${ageFilter === age ? 'bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] border-[hsl(24,95%,53%)]' : 'bg-[hsl(30,40%,96%)] text-[hsl(20,25%,45%)] border-[hsl(30,35%,88%)] hover:border-[hsl(24,95%,53%)]/50'}`}
            >
              {age === 'all' ? 'All Ages' : `Ages ${age}`}
            </button>
          ))}
        </div>
      </div>

      {filteredScripts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-[hsl(30,35%,92%)] flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-7 h-7 text-[hsl(20,25%,45%)]" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-[hsl(20,40%,10%)] mb-2">
            {savedScripts.length === 0 && !showSampleData ? 'Create your first history script!' : 'No scripts match your search'}
          </h3>
          <p className="text-sm text-[hsl(20,25%,45%)] max-w-md mx-auto mb-4">
            {savedScripts.length === 0 && !showSampleData
              ? 'Pick any history topic and our AI agents will research, write, and design a complete video script for you.'
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {savedScripts.length === 0 && !showSampleData && (
            <button onClick={() => onNavigate('new-script')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] rounded-[0.875rem] text-sm font-medium shadow-md shadow-[hsl(24,95%,53%)]/20 hover:shadow-lg transition-all">
              <FiPlus className="w-4 h-4" />
              Create Script
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredScripts.map(script => {
            const styleTags = Array.isArray(script?.style_tags) ? script.style_tags : []
            const scenes = Array.isArray(script?.scenes) ? script.scenes : []
            const isSample = script?.id?.startsWith('sample-')
            return (
              <div key={script.id} className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] overflow-hidden hover:shadow-lg hover:shadow-[hsl(24,95%,53%)]/10 hover:border-[hsl(24,95%,53%)]/30 transition-all duration-300 group cursor-pointer" onClick={() => onViewScript(script)}>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-serif font-semibold text-[hsl(20,40%,10%)] tracking-[-0.01em] leading-tight line-clamp-2 pr-2">{script?.script_title ?? 'Untitled'}</h3>
                    {!isSample && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(script.id) }}
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${deleteConfirm === script.id ? 'bg-red-100 text-red-600' : 'text-[hsl(20,25%,45%)] hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}
                        title={deleteConfirm === script.id ? 'Click again to confirm delete' : 'Delete script'}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-[hsl(24,95%,53%)]/10 text-[hsl(24,95%,53%)] text-[10px] font-semibold rounded-full">Ages {script?.target_age_range ?? '?'}</span>
                    <span className="px-2 py-0.5 bg-[hsl(30,35%,92%)] text-[hsl(20,25%,45%)] text-[10px] font-medium rounded-full flex items-center gap-1">
                      <FiClock className="w-2.5 h-2.5" />
                      {script?.video_length ?? '?'}
                    </span>
                    {isSample && (
                      <span className="px-2 py-0.5 bg-[hsl(200,60%,92%)] text-[hsl(200,60%,40%)] text-[10px] font-medium rounded-full">Sample</span>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(20,25%,45%)] leading-[1.55] line-clamp-2 mb-3">
                    {scenes[0]?.narration ? scenes[0].narration.substring(0, 120) + '...' : 'No preview available'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {styleTags.slice(0, 3).map((tag, tidx) => (
                      <span key={tidx} className="px-2 py-0.5 bg-[hsl(30,35%,92%)] text-[hsl(20,25%,45%)] text-[10px] font-medium rounded-full flex items-center gap-1">
                        <FiTag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-5 py-3 bg-[hsl(30,35%,92%)]/50 border-t border-[hsl(30,35%,88%)] flex items-center justify-between">
                  <span className="text-[10px] text-[hsl(20,25%,45%)]">
                    {script?.created_at ? new Date(script.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                  <span className="text-[10px] text-[hsl(20,25%,45%)]">{scenes.length} scene{scenes.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NewScriptScreen({ onGenerate, isGenerating, loadingMessageIndex, error }: {
  onGenerate: (topic: string, ageRange: string, videoLength: string, styles: string[], focus: string) => void
  isGenerating: boolean
  loadingMessageIndex: number
  error: string | null
}) {
  const [topic, setTopic] = useState('')
  const [ageRange, setAgeRange] = useState('6-10')
  const [videoLength, setVideoLength] = useState('10 min')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [specificFocus, setSpecificFocus] = useState('')

  const ageOptions = ['6-10', '11-14', 'Mixed']
  const lengthOptions = ['5 min', '10 min', '15 min']
  const styleOptions = ['Story-driven', 'Quiz-heavy', 'Fun Facts', 'Modern Connections']

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style])
  }

  const handleSubmit = () => {
    if (!topic.trim()) return
    onGenerate(topic.trim(), ageRange, videoLength, selectedStyles, specificFocus.trim())
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-semibold text-[hsl(20,40%,10%)] tracking-[-0.01em]">Create New Script</h2>
        <p className="text-sm text-[hsl(20,25%,45%)] mt-1">Fill in the details and our AI will craft a complete video script</p>
      </div>

      {isGenerating ? (
        <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-[hsl(30,35%,88%)]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[hsl(24,95%,53%)] animate-spin" />
            <div className="absolute inset-3 rounded-full bg-[hsl(24,95%,53%)]/10 flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-[hsl(24,95%,53%)]" />
            </div>
          </div>
          <h3 className="text-lg font-serif font-semibold text-[hsl(20,40%,10%)] mb-2 tracking-[-0.01em]">Generating Your Script</h3>
          <p className="text-sm text-[hsl(24,95%,53%)] font-medium animate-pulse">{LOADING_MESSAGES[loadingMessageIndex % LOADING_MESSAGES.length]}</p>
          <p className="text-xs text-[hsl(20,25%,45%)] mt-4">This may take a minute or two as our agents research and write...</p>
        </div>
      ) : (
        <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-[0.875rem] p-4">
              <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Generation Failed</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-2">History Topic *</label>
            <input
              type="text"
              placeholder="e.g., Ancient Egypt, The Moon Landing, Medieval Knights"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 bg-[hsl(30,40%,98%)] border border-[hsl(30,35%,88%)] rounded-[0.875rem] text-sm text-[hsl(20,40%,10%)] placeholder:text-[hsl(20,25%,45%)]/50 focus:outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]/30 focus:border-[hsl(24,95%,53%)] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-2">Target Age Range</label>
            <div className="flex rounded-[0.875rem] border border-[hsl(30,35%,88%)] overflow-hidden">
              {ageOptions.map(age => (
                <button
                  key={age}
                  onClick={() => setAgeRange(age)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${ageRange === age ? 'bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)]' : 'bg-[hsl(30,40%,98%)] text-[hsl(20,25%,45%)] hover:bg-[hsl(30,35%,92%)]'}`}
                >
                  {age === 'Mixed' ? 'Mixed' : `Ages ${age}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-2">Video Length</label>
            <div className="flex rounded-[0.875rem] border border-[hsl(30,35%,88%)] overflow-hidden">
              {lengthOptions.map(len => (
                <button
                  key={len}
                  onClick={() => setVideoLength(len)}
                  className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 ${videoLength === len ? 'bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)]' : 'bg-[hsl(30,40%,98%)] text-[hsl(20,25%,45%)] hover:bg-[hsl(30,35%,92%)]'}`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-2">Style Preferences</label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map(style => (
                <button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`px-4 py-2 rounded-[0.875rem] text-sm font-medium border transition-all duration-200 ${selectedStyles.includes(style) ? 'bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] border-[hsl(24,95%,53%)] shadow-md shadow-[hsl(24,95%,53%)]/20' : 'bg-[hsl(30,40%,98%)] text-[hsl(20,25%,45%)] border-[hsl(30,35%,88%)] hover:border-[hsl(24,95%,53%)]/50'}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[hsl(20,40%,10%)] mb-2">Specific Focus (Optional)</label>
            <textarea
              placeholder="e.g., Focus on daily life, not just wars. Include information about food and clothing."
              value={specificFocus}
              onChange={(e) => setSpecificFocus(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-[hsl(30,40%,98%)] border border-[hsl(30,35%,88%)] rounded-[0.875rem] text-sm text-[hsl(20,40%,10%)] placeholder:text-[hsl(20,25%,45%)]/50 focus:outline-none focus:ring-2 focus:ring-[hsl(24,95%,53%)]/30 focus:border-[hsl(24,95%,53%)] transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!topic.trim()}
            className="w-full py-3 bg-gradient-to-r from-[hsl(24,95%,53%)] to-[hsl(12,80%,50%)] text-[hsl(30,40%,98%)] rounded-[0.875rem] text-sm font-semibold shadow-lg shadow-[hsl(24,95%,53%)]/20 hover:shadow-xl hover:shadow-[hsl(24,95%,53%)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            <FiPlay className="w-4 h-4" />
            Generate Script
          </button>
        </div>
      )}
    </div>
  )
}

function ScriptViewerScreen({ script, onSave, onRegenerate, onBack, isGenerating, activeAgentId }: {
  script: ScriptData
  onSave: () => void
  onRegenerate: () => void
  onBack: () => void
  isGenerating: boolean
  activeAgentId: string | null
}) {
  const scenes = Array.isArray(script?.scenes) ? script.scenes : []
  const quizQuestions = Array.isArray(script?.quiz_questions) ? script.quiz_questions : []
  const funFacts = Array.isArray(script?.fun_facts) ? script.fun_facts : []
  const modernConnections = Array.isArray(script?.modern_connections) ? script.modern_connections : []
  const styleTags = Array.isArray(script?.style_tags) ? script.style_tags : []
  const keyEvents = Array.isArray(script?.research_summary?.key_events) ? script.research_summary.key_events : []
  const keyFigures = Array.isArray(script?.research_summary?.key_figures) ? script.research_summary.key_figures : []

  const unplacedQuiz = quizQuestions.filter(q => !scenes.some(s => s?.scene_number === q?.scene_placement))
  const unplacedFacts = funFacts.filter(f => !scenes.some(s => s?.scene_number === f?.scene_placement))
  const unplacedConnections = modernConnections.filter(c => !scenes.some(s => s?.scene_number === c?.scene_placement))

  const allText = useMemo(() => {
    let text = `# ${script?.script_title ?? 'Untitled'}\n\n`
    text += `Topic: ${script?.topic ?? ''}\nAge Range: ${script?.target_age_range ?? ''}\nLength: ${script?.video_length ?? ''}\n\n`
    if (script?.intro_hook) text += `## Intro Hook\n${script.intro_hook}\n\n`
    scenes.forEach(s => {
      text += `## Scene ${s?.scene_number}: ${s?.scene_title ?? ''}\n`
      text += `Duration: ${s?.duration_estimate ?? ''}\n\n`
      text += `${s?.narration ?? ''}\n\n`
      text += `Visual Suggestions: ${s?.visual_suggestions ?? ''}\n\n`
    })
    if (script?.outro_cta) text += `## Outro CTA\n${script.outro_cta}\n\n`
    if (script?.production_notes) text += `## Production Notes\n${script.production_notes}\n`
    return text
  }, [script, scenes])

  const [activeTab, setActiveTab] = useState<'scenes' | 'research' | 'extras'>('scenes')

  return (
    <div className="space-y-6">
      <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={onBack} className="mt-1 p-1.5 text-[hsl(20,25%,45%)] hover:text-[hsl(20,40%,10%)] hover:bg-[hsl(30,35%,92%)] rounded-lg transition-all">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-serif font-semibold text-[hsl(20,40%,10%)] tracking-[-0.01em] leading-tight">{script?.script_title ?? 'Untitled Script'}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 bg-[hsl(24,95%,53%)]/10 text-[hsl(24,95%,53%)] text-xs font-semibold rounded-full">Ages {script?.target_age_range ?? '?'}</span>
                <span className="px-2.5 py-0.5 bg-[hsl(30,35%,92%)] text-[hsl(20,25%,45%)] text-xs font-medium rounded-full flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {script?.video_length ?? '?'}
                </span>
                {styleTags.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 bg-[hsl(30,35%,92%)] text-[hsl(20,25%,45%)] text-xs font-medium rounded-full flex items-center gap-1">
                    <FiTag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyButton text={allText} label="Copy All" />
            <button onClick={onSave} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[0.875rem] bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] hover:bg-[hsl(12,80%,50%)] transition-all duration-200 shadow-sm">
              <FiSave className="w-3.5 h-3.5" />
              Save Script
            </button>
            <button onClick={onRegenerate} disabled={isGenerating} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[0.875rem] border border-[hsl(30,35%,88%)] text-[hsl(20,25%,45%)] hover:bg-[hsl(30,35%,92%)] transition-all duration-200 disabled:opacity-50">
              <FiRefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {script?.intro_hook && (
        <div className="bg-gradient-to-r from-[hsl(24,95%,53%)]/10 to-[hsl(12,80%,50%)]/10 border border-[hsl(24,95%,53%)]/20 rounded-[0.875rem] p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiZap className="w-4 h-4 text-[hsl(24,95%,53%)]" />
            <span className="text-xs font-semibold text-[hsl(24,95%,53%)] uppercase tracking-wide">Intro Hook</span>
          </div>
          <p className="text-sm text-[hsl(20,40%,10%)] leading-[1.55] italic">{script.intro_hook}</p>
        </div>
      )}

      <div className="flex gap-1 bg-[hsl(30,35%,92%)] rounded-[0.875rem] p-1">
        {(['scenes', 'research', 'extras'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize ${activeTab === tab ? 'bg-white text-[hsl(20,40%,10%)] shadow-sm' : 'text-[hsl(20,25%,45%)] hover:text-[hsl(20,40%,10%)]'}`}
          >
            {tab === 'scenes' ? `Scenes (${scenes.length})` : tab === 'research' ? 'Research' : 'Extras'}
          </button>
        ))}
      </div>

      {activeTab === 'scenes' && (
        <div className="space-y-3">
          {scenes.map((scene, idx) => (
            <SceneAccordion key={idx} scene={scene} quizQuestions={quizQuestions} funFacts={funFacts} modernConnections={modernConnections} />
          ))}
          {scenes.length === 0 && (
            <div className="text-center py-8 text-sm text-[hsl(20,25%,45%)]">No scenes found in this script.</div>
          )}
        </div>
      )}

      {activeTab === 'research' && (
        <div className="space-y-4">
          {script?.research_summary?.overview && (
            <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-5">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-2 flex items-center gap-2">
                <FiBookOpen className="w-4 h-4 text-[hsl(24,95%,53%)]" />
                Research Overview
              </h4>
              <div className="text-sm text-[hsl(20,40%,10%)] leading-[1.55]">
                {renderMarkdown(script.research_summary.overview)}
              </div>
            </div>
          )}

          {keyEvents.length > 0 && (
            <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-5">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-3 flex items-center gap-2">
                <FiClock className="w-4 h-4 text-[hsl(24,95%,53%)]" />
                Key Events Timeline
              </h4>
              <div className="space-y-3">
                {keyEvents.map((evt, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-[hsl(24,95%,53%)] mt-1" />
                      {idx < keyEvents.length - 1 && <div className="w-0.5 h-full min-h-[2rem] bg-[hsl(30,35%,88%)]" />}
                    </div>
                    <div className="pb-3">
                      <span className="text-xs font-semibold text-[hsl(24,95%,53%)]">{evt?.date ?? ''}</span>
                      <p className="text-sm font-medium text-[hsl(20,40%,10%)] mt-0.5">{evt?.event ?? ''}</p>
                      <p className="text-xs text-[hsl(20,25%,45%)] mt-1 leading-[1.55]">{evt?.significance ?? ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {keyFigures.length > 0 && (
            <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-5">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-3 flex items-center gap-2">
                <FiTarget className="w-4 h-4 text-[hsl(24,95%,53%)]" />
                Key Historical Figures
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {keyFigures.map((fig, idx) => (
                  <div key={idx} className="bg-[hsl(30,40%,98%)] border border-[hsl(30,35%,88%)] rounded-lg p-4">
                    <p className="text-sm font-semibold text-[hsl(20,40%,10%)]">{fig?.name ?? ''}</p>
                    <p className="text-xs text-[hsl(24,95%,53%)] font-medium mt-0.5">{fig?.role ?? ''}</p>
                    <p className="text-xs text-[hsl(20,25%,45%)] mt-2 leading-[1.55]">{fig?.detail ?? ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'extras' && (
        <div className="space-y-4">
          {unplacedQuiz.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] flex items-center gap-2">
                <FiHelpCircle className="w-4 h-4 text-[hsl(260,50%,60%)]" />
                Quiz Questions
              </h4>
              {unplacedQuiz.map((q, idx) => <QuizCard key={idx} quiz={q} />)}
            </div>
          )}
          {quizQuestions.length > 0 && unplacedQuiz.length === 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] flex items-center gap-2">
                <FiHelpCircle className="w-4 h-4 text-[hsl(260,50%,60%)]" />
                All Quiz Questions ({quizQuestions.length})
              </h4>
              {quizQuestions.map((q, idx) => <QuizCard key={idx} quiz={q} />)}
            </div>
          )}

          {unplacedFacts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] flex items-center gap-2">
                <FiStar className="w-4 h-4 text-[hsl(45,80%,55%)]" />
                Fun Facts
              </h4>
              {unplacedFacts.map((f, idx) => <FunFactCard key={idx} fact={f} />)}
            </div>
          )}
          {funFacts.length > 0 && unplacedFacts.length === 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] flex items-center gap-2">
                <FiStar className="w-4 h-4 text-[hsl(45,80%,55%)]" />
                All Fun Facts ({funFacts.length})
              </h4>
              {funFacts.map((f, idx) => <FunFactCard key={idx} fact={f} />)}
            </div>
          )}

          {unplacedConnections.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] flex items-center gap-2">
                <FiGlobe className="w-4 h-4 text-[hsl(200,60%,50%)]" />
                Modern Connections
              </h4>
              {unplacedConnections.map((c, idx) => <ModernConnectionCard key={idx} connection={c} />)}
            </div>
          )}
          {modernConnections.length > 0 && unplacedConnections.length === 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] flex items-center gap-2">
                <FiGlobe className="w-4 h-4 text-[hsl(200,60%,50%)]" />
                All Modern Connections ({modernConnections.length})
              </h4>
              {modernConnections.map((c, idx) => <ModernConnectionCard key={idx} connection={c} />)}
            </div>
          )}

          {script?.production_notes && (
            <div className="bg-[hsl(30,40%,96%)]/80 backdrop-blur-[16px] border border-[hsl(30,35%,88%)] rounded-[0.875rem] p-5">
              <h4 className="text-sm font-semibold text-[hsl(20,40%,10%)] mb-2 flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-[hsl(24,95%,53%)]" />
                Production Notes
              </h4>
              <div className="text-sm text-[hsl(20,40%,10%)] leading-[1.55]">
                {renderMarkdown(script.production_notes)}
              </div>
            </div>
          )}
        </div>
      )}

      {script?.outro_cta && (
        <div className="bg-gradient-to-r from-[hsl(12,80%,50%)]/10 to-[hsl(24,95%,53%)]/10 border border-[hsl(12,80%,50%)]/20 rounded-[0.875rem] p-5">
          <div className="flex items-center gap-2 mb-2">
            <FiPlay className="w-4 h-4 text-[hsl(12,80%,50%)]" />
            <span className="text-xs font-semibold text-[hsl(12,80%,50%)] uppercase tracking-wide">Outro CTA</span>
          </div>
          <p className="text-sm text-[hsl(20,40%,10%)] leading-[1.55] italic">{script.outro_cta}</p>
        </div>
      )}

      <AgentStatusPanel activeAgentId={activeAgentId} />
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────────

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard')
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([])
  const [currentScript, setCurrentScript] = useState<ScriptData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [showSampleData, setShowSampleData] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const loadingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load saved scripts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setSavedScripts(parsed)
        }
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Save scripts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScripts))
    } catch {
      // ignore storage errors
    }
  }, [savedScripts])

  // Rotate loading messages
  useEffect(() => {
    if (isGenerating) {
      setLoadingMessageIndex(0)
      loadingIntervalRef.current = setInterval(() => {
        setLoadingMessageIndex(prev => prev + 1)
      }, 3000)
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
        loadingIntervalRef.current = null
      }
    }
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current)
      }
    }
  }, [isGenerating])

  const handleGenerate = useCallback(async (topic: string, ageRange: string, videoLength: string, styles: string[], focus: string) => {
    setIsGenerating(true)
    setError(null)
    setActiveAgentId(MANAGER_AGENT_ID)

    const message = `Create a ${videoLength} educational history video script about "${topic}" for ages ${ageRange}. Style preferences: ${styles.length > 0 ? styles.join(', ') : 'General'}.${focus ? ` Specific focus: ${focus}` : ''}`

    try {
      const result = await callAIAgent(message, MANAGER_AGENT_ID)

      if (result.success && result?.response?.result) {
        const data = result.response.result
        const scriptData: ScriptData = {
          script_title: data?.script_title ?? `Script: ${topic}`,
          topic: data?.topic ?? topic,
          target_age_range: data?.target_age_range ?? ageRange,
          video_length: data?.video_length ?? videoLength,
          style_tags: Array.isArray(data?.style_tags) ? data.style_tags : styles,
          research_summary: {
            overview: data?.research_summary?.overview ?? '',
            key_events: Array.isArray(data?.research_summary?.key_events) ? data.research_summary.key_events : [],
            key_figures: Array.isArray(data?.research_summary?.key_figures) ? data.research_summary.key_figures : [],
          },
          scenes: Array.isArray(data?.scenes) ? data.scenes : [],
          quiz_questions: Array.isArray(data?.quiz_questions) ? data.quiz_questions : [],
          fun_facts: Array.isArray(data?.fun_facts) ? data.fun_facts : [],
          modern_connections: Array.isArray(data?.modern_connections) ? data.modern_connections : [],
          intro_hook: data?.intro_hook ?? '',
          outro_cta: data?.outro_cta ?? '',
          production_notes: data?.production_notes ?? '',
        }
        setCurrentScript(scriptData)
        setCurrentScreen('script-viewer')
      } else {
        setError(result?.error ?? result?.response?.message ?? 'Failed to generate script. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setIsGenerating(false)
      setActiveAgentId(null)
    }
  }, [])

  const handleSaveScript = useCallback(() => {
    if (!currentScript) return
    const newSaved: SavedScript = {
      ...currentScript,
      id: generateId(),
      created_at: new Date().toISOString(),
    }
    setSavedScripts(prev => [newSaved, ...prev])
    setSaveMessage('Script saved successfully!')
    setTimeout(() => setSaveMessage(null), 3000)
  }, [currentScript])

  const handleDeleteScript = useCallback((id: string) => {
    setSavedScripts(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleViewScript = useCallback((script: SavedScript) => {
    setCurrentScript(script)
    setCurrentScreen('script-viewer')
  }, [])

  const handleRegenerate = useCallback(() => {
    if (!currentScript) return
    const styles = Array.isArray(currentScript.style_tags) ? currentScript.style_tags : []
    handleGenerate(currentScript.topic, currentScript.target_age_range, currentScript.video_length, styles, '')
  }, [currentScript, handleGenerate])

  const navigate = useCallback((screen: ScreenType) => {
    setCurrentScreen(screen)
    setError(null)
    if (screen !== 'script-viewer') {
      setSaveMessage(null)
    }
  }, [])

  const screenTitle = currentScreen === 'dashboard' ? 'Dashboard' : currentScreen === 'new-script' ? 'New Script' : 'Script Viewer'

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[hsl(30,40%,98%)] text-[hsl(20,40%,10%)] font-sans">
        <Sidebar currentScreen={currentScreen} onNavigate={navigate} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64 min-h-screen flex flex-col">
          <TopHeader onToggleSidebar={() => setSidebarOpen(true)} title={screenTitle} />

          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {saveMessage && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-[0.875rem] px-4 py-3 text-sm text-green-800">
                <FiCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                {saveMessage}
              </div>
            )}

            {currentScreen === 'dashboard' && (
              <DashboardScreen
                savedScripts={savedScripts}
                onViewScript={handleViewScript}
                onDeleteScript={handleDeleteScript}
                onNavigate={navigate}
                showSampleData={showSampleData}
                onToggleSample={() => setShowSampleData(prev => !prev)}
              />
            )}

            {currentScreen === 'new-script' && (
              <NewScriptScreen
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                loadingMessageIndex={loadingMessageIndex}
                error={error}
              />
            )}

            {currentScreen === 'script-viewer' && currentScript && (
              <ScriptViewerScreen
                script={currentScript}
                onSave={handleSaveScript}
                onRegenerate={handleRegenerate}
                onBack={() => navigate('dashboard')}
                isGenerating={isGenerating}
                activeAgentId={activeAgentId}
              />
            )}

            {currentScreen === 'script-viewer' && !currentScript && (
              <div className="text-center py-16">
                <p className="text-sm text-[hsl(20,25%,45%)]">No script selected.</p>
                <button onClick={() => navigate('dashboard')} className="mt-4 px-4 py-2 bg-[hsl(24,95%,53%)] text-[hsl(30,40%,98%)] rounded-[0.875rem] text-sm font-medium">
                  Go to Dashboard
                </button>
              </div>
            )}

            {currentScreen === 'dashboard' && (
              <div className="mt-8">
                <AgentStatusPanel activeAgentId={activeAgentId} />
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
