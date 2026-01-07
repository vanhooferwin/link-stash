# Bookmark Dashboard Design Guidelines

## Design Approach: Modern Productivity System
**Selected System**: Linear/Notion-inspired modern productivity aesthetic
**Rationale**: Dashboard-focused application requiring clean data display, clear hierarchy, and efficient interaction patterns. Prioritizes usability and visual clarity over decorative elements.

## Typography
- **Primary Font**: Inter (Google Fonts)
- **Display/Headers**: Font weight 600-700, tracking tight (-0.02em)
- **Body Text**: Font weight 400-500, optimal line height (1.6)
- **Code/URLs**: Font family 'JetBrains Mono' for technical content
- **Scale**: text-sm (cards), text-base (forms), text-lg (section headers), text-2xl (page titles)

## Layout System
**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section spacing: gap-6, gap-8
- Container margins: m-8, m-12
- Grid gaps: gap-4 (cards), gap-6 (sections)

## Core Components

### Dashboard Layout
- **Sidebar Navigation** (w-64, fixed): Category/tab list with active states, add button at bottom
- **Main Content** (ml-64): Grid of bookmark cards (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- **Top Bar**: Search input, filter controls, "Add Bookmark" CTA button

### Bookmark Cards
- **Structure**: Compact card (rounded-lg, border, p-4)
- **Content Layout**:
  - Icon (top-left, size-8) + Health indicator dot (absolute top-right, size-3, rounded-full, green/red)
  - Title (font-semibold, text-base, truncate)
  - Description (text-sm, text-gray-600, line-clamp-2)
  - URL (text-xs, font-mono, truncate)
- **Hover State**: Subtle elevation (shadow-md), scale-102 transform
- **Click**: Opens link in new tab, no visual feedback needed

### API Call Cards
- **Distinctive Badge**: HTTP method badge (GET/POST/PUT) with method-specific styling
- **Execute Button**: Small icon button (play/arrow) in card footer
- **Visual Distinction**: Subtle border accent to differentiate from bookmark cards

### Admin Panel
- **Modal Overlay**: Full-screen backdrop (bg-black/50)
- **Form Container**: Centered modal (max-w-2xl, rounded-xl, p-8)
- **Form Layout**:
  - Input fields (h-12, rounded-lg, border focus ring)
  - Icon selector: Grid of icon options (grid-cols-8, gap-2)
  - Health check toggle switch
  - Category dropdown with search
- **Action Buttons**: Cancel (ghost), Save (primary, full-width on mobile)

### Response Modal
- **Layout**: Similar to admin modal but max-w-4xl
- **Content**: JSON/response viewer with syntax highlighting
- **Header**: Request details (method, URL, status code with badge)
- **Body**: Monospace code block with copy button

### Category Tabs
- **Implementation**: Horizontal scrollable tab bar (flex, overflow-x-auto)
- **Tab Style**: Pill-shaped (rounded-full, px-4, py-2), active state with border
- **Add Category**: "+" icon button at end of tabs

## Visual Hierarchy
- **Primary Actions**: Medium button size (h-10), prominent placement
- **Health Indicators**: Bold, unmistakable (size-3 dot with subtle pulse animation for red/offline)
- **Icons**: Consistent sizing (size-6 to size-8 depending on context)
- **Borders**: Subtle throughout (border-gray-200), stronger on hover/active

## Interaction Patterns
- **Card Interactions**: Entire card is clickable (cursor-pointer), opens in new tab
- **API Cards**: Separate button for execution to avoid accidental triggers
- **Forms**: Instant validation feedback, error states in red text below inputs
- **Modals**: Click outside or ESC to close, smooth fade-in/out transitions

## Icons
**Library**: Heroicons (via CDN)
- Navigation: Outline style
- Actions: Solid style for CTAs
- Status: Custom health indicator dots (CSS)
- Bookmark icons: User-selectable from Heroicons set

## Accessibility
- Focus indicators on all interactive elements (ring-2 ring-blue-500)
- Keyboard navigation support (Tab through cards, Enter to open)
- ARIA labels for icon-only buttons
- Skip to content link for keyboard users
- Screen reader announcements for health status changes

## Performance Considerations
- Lazy load bookmark cards as user scrolls
- Debounce search input (300ms)
- Cache health check results (refresh every 5 minutes)
- Virtualize category list if >50 categories