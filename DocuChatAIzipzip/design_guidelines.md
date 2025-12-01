# Design Guidelines: Dataroom UI

## Design Approach: Productivity-Focused Design System

**Selected Framework:** Fluent Design principles adapted for document-intensive workflows
**Rationale:** This is a utility-focused productivity tool requiring clarity, efficiency, and information density. Design should enhance usability without distraction.

**Core Principles:**
1. Information hierarchy through spatial relationships, not decoration
2. Purposeful whitespace that aids scanning and focus
3. Consistent interaction patterns across views
4. Citation traceability as a first-class design feature

---

## Layout System

**Container Structure:**
- Full viewport height split-panel layout (no scrolling the entire page)
- Left panel: 40% width on desktop (min 320px, max 600px), collapsible to icon bar
- Right panel: 60% width, fixed position for persistent chat access
- Responsive: Stack vertically on mobile with tab navigation between panels

**Spacing Primitives:**
Primary units: `space-2, space-4, space-6, space-8, space-12`
- Micro spacing (within components): 2-4
- Component padding: 4-6
- Section separation: 8-12
- Panel gutters: 6

---

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - body text, UI elements
- Monospace: JetBrains Mono - document paths, technical metadata

**Hierarchy:**
- Panel Headers: 20px, semibold
- Document Titles: 16px, medium
- Body/Chat: 14px, regular
- Metadata/Paths: 12px, regular, reduced opacity
- Citations: 13px, medium

**Line Heights:**
- Headers: 1.3
- Body text: 1.6
- Document content: 1.7 (optimal reading)

---

## Component Library

### Left Panel: Document Browser

**View Toggle:**
- Segmented control (pill-style) at panel top
- Two options: "Outline" | "Cards"
- Active state with solid fill, inactive with border only

**Outline View:**
- Tree structure with 16px indent per level
- Folder icons (chevron for expand/collapse)
- Document icons consistently styled
- Hover: subtle background fill on entire row
- Selected: left border accent (3px) + background tint
- Nested scrolling within panel height

**Card View:**
- Grid: 1 column on narrow, 2 columns when space allows (>500px width)
- Card anatomy: 
  - Document title (truncate with ellipsis)
  - 2-3 line summary preview
  - Bottom metadata bar (path, date)
  - 8px border radius, subtle shadow on hover
- Selected card: persistent border accent

**Document Viewer (Modal/Drawer):**
- Overlay when document selected
- Header: Document title + close button + "Open in Chat" action
- Content area: Full document with proper typography spacing
- Section headers clearly delineated with anchor points
- Scrollable content with position indicator

### Right Panel: Chat Interface

**Chat Container:**
- Message list: reverse-chronological scroll
- User messages: Right-aligned, max-width 80%
- AI responses: Left-aligned, max-width 85%
- Generous message spacing (space-6 between messages)

**Message Bubbles:**
- Distinct visual treatment for user vs AI
- User: Compact, right-aligned
- AI: Left-aligned with more breathing room for citations
- Rounded corners (12px)
- Avoid excessive shadows

**Citations Display:**
- Inline chips immediately after relevant text
- Chip anatomy: `[1 Document Title – Section]`
- Clickable with subtle hover state (underline)
- Multiple citations in sequence spaced with 4px gap
- Wrap naturally within message flow

**Input Area:**
- Fixed at bottom with subtle top border
- Auto-expanding textarea (max 6 lines)
- Send button always visible
- Placeholder: "Ask about your documents..."

### Shared Components

**Loading States:**
- Skeleton screens for document list/cards
- Inline spinner for chat responses
- Smooth transitions when content loads

**Empty States:**
- Centered, light illustrations or simple iconography
- Clear messaging: "No documents yet" / "Start a conversation"
- Single CTA when actionable

---

## Interaction Patterns

**Document Selection Flow:**
1. Click document in outline/card view
2. Left panel highlights selection with persistent indicator
3. Document viewer opens (drawer slides from right or modal overlay)
4. Selection state persists even when viewer closes

**Citation Click Flow:**
1. User clicks citation chip in chat message
2. Left panel automatically scrolls to and selects referenced document
3. If sectionId exists, document viewer opens and scrolls to highlighted section
4. Visual feedback: brief highlight animation on target section

**View Switching:**
- Instant transition between outline/card views
- Preserve scroll position and selection state
- No animation delay - immediate response

---

## Visual Treatment

**Depth & Elevation:**
- Flat design with subtle borders, avoid heavy shadows
- Panel divider: 1px solid separator
- Cards/modals: Minimal shadow (only on hover/active states)
- Focus on content hierarchy through spacing and typography

**Borders & Dividers:**
- 1px borders for structure
- Generous padding to prevent cramped feeling (8-12px minimum)
- Consistent border radius: 6px (small elements), 12px (cards/panels)

**Density:**
- Compact mode option for power users (reduce spacing by 25%)
- Default: Comfortable spacing optimized for extended reading sessions
- Information-dense without feeling cluttered

---

## Accessibility

- Keyboard navigation: Tab through documents, Enter to select, Esc to close
- Focus indicators: Clear 2px outline on all interactive elements
- ARIA labels on all icon-only buttons
- Skip links for panel navigation
- Maintain 4.5:1 contrast ratios for all text

---

## Performance Considerations

- Virtual scrolling for document lists >100 items
- Lazy load document content on selection
- Debounce search/filter inputs
- Optimize chat message rendering for long conversations

---

**No Images Required:** This is a functional productivity tool - no hero images or decorative graphics needed. Focus remains on content clarity and efficient workflows.