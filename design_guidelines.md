# AIImageForge Design Guidelines

## Brand Identity

**Purpose**: Professional on-device AI image generation tool leveraging CoreML and Metal for high-performance, privacy-focused creative work.

**Aesthetic Direction**: **Technical Luxury** - Dark, sophisticated interface that showcases generated imagery like a premium gallery. Subtle metallic accents reference the Metal framework. Professional yet creative, emphasizing power and precision.

**Memorable Element**: Metal-enhanced image preview with real-time shader effects creating a distinctive "forged" glow around generated images, making them feel precious and carefully crafted.

## Navigation Architecture

**Type**: Stack Navigation with Floating Action Button
- Root: Gallery screen (generated image history)
- Modal: Generation screen (prompt input)
- Modal: Image detail/viewer
- Stack: Settings screen

## Screen Specifications

### 1. Gallery Screen (Root)
**Purpose**: Browse generated image history, quick access to generation.

**Layout**:
- Header: Transparent with title "Gallery", right button (settings gear icon)
- Main: Scrollable grid (2 columns) of generated images with subtle Metal shimmer effect
- Floating: Large circular generate button (bottom-right, 64x64pt)
- Safe Area: Top inset = headerHeight + 24pt, Bottom inset = tabBarHeight + 88pt (accounts for FAB)

**Components**:
- Image cards with timestamp, prompt snippet overlay on press
- Empty state illustration when no images generated yet
- Pull-to-refresh

**Empty State**: Illustration showing abstract AI neural network pattern transforming into an image, centered with "Forge Your First Image" text.

---

### 2. Generation Screen (Modal)
**Purpose**: Input prompt and configure generation parameters.

**Layout**:
- Header: Modal header with "Cancel" (left), "Generate" (right, disabled until prompt entered)
- Main: Scrollable form
- Safe Area: Top inset = 16pt, Bottom inset = insets.bottom + 24pt

**Components**:
- Large text area for prompt (multiline, 120pt height, placeholder: "Describe your vision...")
- Expandable "Advanced" section with sliders:
  - Steps (10-50, default 25)
  - Guidance Scale (1-20, default 7.5)
  - Seed (random button, or manual input)
- Progress bar (appears after Generate pressed, shows step count)
- Generated image preview (appears below progress when complete)

**States**:
- Idle: Show form
- Generating: Disable form, show animated progress bar with step counter "Step 12/25"
- Complete: Show generated image preview, "Save & View" button

---

### 3. Image Detail Screen (Modal)
**Purpose**: Full-screen view of generated image with Metal shader effects, sharing options.

**Layout**:
- Header: Dark translucent with "Done" (left), share icon (right)
- Main: Centered image with Metal tint effect (pinch-to-zoom enabled)
- Bottom: Image metadata drawer (swipe up to expand)
- Safe Area: Top inset = headerHeight, Bottom inset = insets.bottom

**Components**:
- Full Metal-rendered image view
- Metadata drawer showing:
  - Prompt text (full)
  - Generation parameters (steps, seed, guidance)
  - Timestamp
- Delete button (bottom of drawer, destructive red)

---

### 4. Settings Screen (Stack)
**Purpose**: App preferences and model management.

**Layout**:
- Header: Default with back button, title "Settings"
- Main: Scrollable form
- Safe Area: Top inset = 16pt, Bottom inset = insets.bottom + 24pt

**Components**:
- User avatar (customizable, 1 preset avatar)
- Display name field
- Section: Model Management
  - Download model button (if not downloaded)
  - Model status indicator
  - Clear cache
- Section: Rendering
  - Metal tint intensity slider
  - Tint color picker (preset swatches)
- Section: About
  - App version
  - Privacy policy link

---

## Color Palette

**Primary**: Deep Bronze `#CD7F32` (metallic, references Metal framework)
**Background**: Rich Black `#0A0A0F`
**Surface**: Elevated Dark `#1C1C24`
**Surface Variant**: `#2A2A34`
**Text Primary**: Cool White `#F5F5F7`
**Text Secondary**: Silver Gray `#9CA3AF`
**Accent**: Electric Blue `#00D4FF` (for progress, success states)
**Destructive**: Warm Red `#FF3B30`

**Semantic**:
- Success: `#34C759`
- Warning: `#FF9500`
- Error: `#FF3B30`

## Typography

**Font**: SF Pro (System) with Montserrat for headings (bold, distinctive)

**Type Scale**:
- Display: Montserrat Bold, 34pt (screen titles)
- Title: SF Pro Bold, 24pt (section headers)
- Headline: SF Pro Semibold, 18pt (card titles)
- Body: SF Pro Regular, 16pt (main text)
- Caption: SF Pro Regular, 13pt (timestamps, metadata)

## Visual Design

**Touchables**:
- Floating Generate Button: Deep Bronze with white plus icon, subtle drop shadow (offset 0/2, opacity 0.15, radius 8)
- Cards: Pressed state = scale 0.98, opacity 0.8
- Buttons: Pressed state = opacity 0.7

**Metal Effects**:
- Image cards: Subtle bronze shimmer overlay (5% opacity)
- Detail view: Enhanced tint with user-adjustable intensity
- NEVER use blur effects for shadows

**Icons**: Feather icon set from @expo/vector-icons (clean, consistent line weight)

## Assets to Generate

**Required**:
1. **icon.png** - App icon showing abstract "forge" symbol (anvil + neural network nodes), deep bronze on dark gradient
   - WHERE USED: Device home screen

2. **splash-icon.png** - Simplified forge symbol, centered
   - WHERE USED: App launch screen

3. **empty-gallery.png** - Abstract illustration: neural network pattern morphing into image frame, bronze/blue gradient accents
   - WHERE USED: Gallery screen when no images exist

4. **avatar-preset-1.png** - Geometric abstract portrait (circles/triangles), bronze tones
   - WHERE USED: Default user avatar in Settings

**Recommended**:
5. **generation-success.png** - Subtle checkmark with sparkles, appears in generation modal
   - WHERE USED: Generation complete state

6. **model-download.png** - Cloud with downward arrow transforming into chip icon
   - WHERE USED: Settings > Model Management when model needs download

**Asset Style**: Clean, geometric, minimal - avoid photorealistic clipart. Use bronze (#CD7F32) and electric blue (#00D4FF) accent colors. Dark backgrounds (#0A0A0F) to match app theme.