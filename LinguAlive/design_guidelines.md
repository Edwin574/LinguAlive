# LinguAlive Design Guidelines

## Design Approach

**Selected Framework:** Reference-Based with Accessibility Focus
Drawing inspiration from community-driven platforms like Duolingo (gamified language learning), SoundCloud (audio-first interface), and Archive.org (cultural preservation), while maintaining cultural authenticity and rural accessibility.

**Core Principles:**
- Cultural respect through warm, natural aesthetics
- Simplified interactions for diverse technical literacy
- Audio-centric interface design
- Trust-building through transparency

---

## Color Palette

### Primary Colors
- **Earth Brown:** `#8B6F47` - Primary buttons, headers, active states
- **Forest Green:** `#4A7C59` - Secondary actions, success states
- **Clay Orange:** `#D4915D` - Accent highlights, CTAs

### Neutral Colors
- **Warm White:** `#FAF8F5` - Page backgrounds
- **Sand Beige:** `#E8DCC8` - Card backgrounds, alternate sections
- **Dark Brown:** `#3E2723` - Primary text
- **Medium Gray:** `#6B5D54` - Secondary text

### Semantic Colors
- **Success Green:** `#5C8A6F` - Recording success, confirmations
- **Alert Amber:** `#E8A05D` - Warnings, important notices
- **Error Red:** `#C85F5F` - Error states

---

## Typography

### Font Families
- **Primary:** 'Inter' (Google Fonts) - UI, forms, body text
- **Display:** 'Playfair Display' (Google Fonts) - Hero headlines, section titles

### Type Scale
- **Hero:** text-5xl md:text-6xl, font-bold, Playfair Display
- **H1:** text-4xl md:text-5xl, font-bold, Playfair Display
- **H2:** text-3xl md:text-4xl, font-semibold, Inter
- **H3:** text-2xl md:text-3xl, font-semibold, Inter
- **Body Large:** text-lg md:text-xl, font-normal, Inter
- **Body:** text-base, font-normal, Inter
- **Small:** text-sm, font-normal, Inter

---

## Layout System

### Spacing Primitives
Consistent use of Tailwind units: **2, 4, 6, 8, 12, 16, 20**
- Micro spacing (icons, buttons): p-2, p-4
- Component spacing: p-6, p-8
- Section padding: py-12 md:py-20
- Container gaps: gap-6, gap-8

### Container Strategy
- **Max Width:** max-w-7xl for main content
- **Content Width:** max-w-4xl for text-heavy sections
- **Card Width:** Full-width on mobile, grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for cards

### Grid System
- **Audio Cards:** 1 column mobile, 2-3 columns desktop
- **Features/Steps:** 1 column mobile, 4 columns desktop (How It Works)
- **Forms:** Single column for simplicity

---

## Component Library

### Navigation
- Sticky header with blur backdrop (bg-warm-white/90 backdrop-blur)
- Logo left, navigation center/right
- Mobile: Hamburger menu with slide-in drawer
- Links: Underline animation on hover

### Hero Section
- Full-width with large background image depicting Ogiek culture (elder speaking, community gathering, or natural landscape)
- Semi-transparent overlay (bg-dark-brown/60) for text readability
- Centered content with generous py-20 md:py-32
- Primary CTA button with blurred background (backdrop-blur-md bg-earth-brown/80)
- Tagline in Playfair Display, supporting text in Inter

### Audio Recorder Component
- Large circular record button (w-24 h-24) with pulsing animation when active
- Waveform visualization during recording
- Timer display in large, readable text
- Clear visual states: Ready (earth-brown), Recording (alert-amber with pulse), Stopped (forest-green)

### Audio Player Cards
- Card layout with rounded-2xl, shadow-md
- Play button (circular, earth-brown) prominent top-left
- Theme badge (rounded pill, sand-beige background)
- Transcription text in readable size
- Metadata footer with icons for speaker info
- Hover: Lift effect with shadow-lg

### Form Elements
- Large touch targets (min-h-12) for mobile accessibility
- Rounded-lg inputs with sand-beige backgrounds
- Clear labels above inputs (font-medium)
- Dropdown selectors with custom styling
- Textareas with min-h-32 for context field

### Buttons
- Primary: bg-earth-brown, text-white, rounded-full, px-8 py-4
- Secondary: border-2 border-earth-brown, text-earth-brown, rounded-full, px-8 py-4
- Icon buttons: Circular, p-4, with hover scale
- All buttons: transition-all duration-200

### Cards
- Background: sand-beige or white
- Border radius: rounded-2xl
- Shadow: shadow-md, hover:shadow-xl
- Padding: p-6 md:p-8
- Spacing between elements: space-y-4

---

## Page-Specific Layouts

### Home Page
1. **Hero:** Full-viewport with cultural image, centered text, scroll-down indicator
2. **Mission Section:** 2-column (text + supporting image), py-16
3. **How It Works:** 4-column icon cards (stacked on mobile)
4. **CTA Section:** Centered, warm background gradient
5. **Footer:** 3-column (About, Links, Contact), py-12

### Contribute Page
- Centered recording interface (max-w-2xl)
- Step indicator at top showing progress
- Generous spacing (space-y-8) between recorder and metadata form
- Clear visual hierarchy: Record → Transcribe → Classify → Submit

### Listen/Explore Page
- Search/filter bar sticky below header
- Masonry-style grid for audio cards (Pinterest-inspired)
- Infinite scroll or pagination
- Empty state with encouraging message

---

## Images

### Required Images
1. **Hero Image (Home):** Wide landscape (1920x1080) showing Ogiek community member or cultural scene - warm, authentic photography with natural lighting
2. **About Page:** Supporting image showing language documentation or community gathering (800x600)
3. **How It Works Icons:** Custom illustrated icons for each step (Record, Annotate, Submit, Preserve) - earthy color scheme
4. **Audio Card Placeholders:** Abstract waveform patterns or cultural symbols as fallbacks

### Image Treatment
- Rounded corners (rounded-xl) for all content images
- Subtle sepia or warm filter overlay for cultural authenticity
- Always include alt text for accessibility

---

## Animations

### Framer Motion Patterns
- **Page Transitions:** Fade + slide up (duration: 0.3s)
- **Card Entrance:** Stagger children with fade-in-up
- **Recording Button:** Scale pulse animation when active
- **Hover States:** Subtle scale (1.02) for interactive elements
- **Success Feedback:** Check icon with scale + fade animation

**Animation Budget:** Focused on feedback (recording states, submission success) and smooth page transitions. Avoid gratuitous motion.

---

## Accessibility

- Minimum text size: 16px (text-base)
- Color contrast: WCAG AAA for body text, AA for large text
- Focus indicators: 3px solid earth-brown ring
- ARIA labels on all audio controls
- Keyboard navigation: Tab through all interactive elements
- Screen reader announcements for recording states
- Touch targets: Minimum 44x44px

---

## Responsive Breakpoints

- **Mobile:** Default (< 768px) - Single column, stacked navigation
- **Tablet:** md (768px+) - 2-column grids, horizontal navigation
- **Desktop:** lg (1024px+) - 3-column grids, full feature set
- **Wide:** xl (1280px+) - Max-width containers, optimized spacing

---

This design creates a warm, accessible platform that honors Ogiek culture while providing intuitive tools for language preservation. The earthy palette and cultural imagery establish trust, while clear typography and generous spacing ensure usability across all user groups.