# WeighsoftAnimalWeigherV2 - Theme & Color System

## Design Philosophy

The WeighsoftAnimalWeigherV2 app follows a **Business Professional** design aesthetic:

- **Clean & Minimal**: Focus on content, reduce visual clutter
- **Trust & Reliability**: Colors that convey professionalism and stability
- **Functional First**: Every design element serves a purpose
- **Accessible**: WCAG AA compliant (4.5:1 contrast ratio minimum)
- **Consistent**: Unified design language across all screens

---

## Color Palette

### Primary Brand Color - Professional Blue

Our primary color conveys trust, reliability, and professionalism.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#E3F2FD` | Light backgrounds, selected states |
| 100 | `#BBDEFB` | Hover backgrounds |
| 200 | `#90CAF9` | Disabled buttons (light mode) |
| 300 | `#64B5F6` | Links (dark mode) |
| 400 | `#42A5F5` | Secondary interactive |
| **500** | **`#1976D2`** | **Primary buttons, links, active states** |
| 600 | `#1565C0` | Hover state |
| 700 | `#0D47A1` | Active/pressed state |
| 800 | `#0A3D91` | Dark accents |
| 900 | `#062A6E` | Darkest shade |

### Secondary - Warm Gray

Used for borders, backgrounds, and subtle UI elements.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#FAFAFA` | Page background (light) |
| 100 | `#F5F5F5` | Card backgrounds |
| 200 | `#EEEEEE` | Dividers, borders |
| 300 | `#E0E0E0` | Strong borders |
| 400 | `#BDBDBD` | Disabled text |
| **500** | **`#757575`** | **Secondary text** |
| 600 | `#616161` | Body text |
| 700 | `#424242` | Dark mode cards |
| 800 | `#303030` | Dark mode backgrounds |
| 900 | `#212121` | Primary text (light mode) |

### Accent - Teal

Used sparingly for highlights and secondary call-to-actions.

| Shade | Hex | Usage |
|-------|-----|-------|
| 50 | `#E0F2F1` | Success-adjacent backgrounds |
| 100 | `#B2DFDB` | Subtle highlights |
| **500** | **`#00897B`** | **Accent buttons, badges** |
| 700 | `#00695C` | Hover state |
| 900 | `#004D40` | Active state |

---

## Semantic Colors

### Status Colors

| Status | Light Mode | Dark Mode | Background (Light) | Background (Dark) |
|--------|------------|-----------|-------------------|-------------------|
| **Success** | `#2E7D32` | `#66BB6A` | `#E8F5E9` | `#1B3D1F` |
| **Warning** | `#F9A825` | `#FFB74D` | `#FFF8E1` | `#3D3012` |
| **Error** | `#C62828` | `#EF5350` | `#FFEBEE` | `#3D1B1B` |
| **Info** | `#1565C0` | `#42A5F5` | `#E3F2FD` | `#12283D` |

### Usage Guidelines

```
✅ Success: Weight saved, animal created, export complete
⚠️ Warning: Low storage, data needs review, sync pending
❌ Error: Save failed, validation errors, connection lost
ℹ️ Info: Tips, hints, informational messages
```

---

## Light Theme

### Backgrounds
| Purpose | Color | Hex |
|---------|-------|-----|
| Primary (screen) | White | `#FFFFFF` |
| Secondary (sections) | Light Gray | `#F8F9FA` |
| Tertiary (subtle) | Lighter Gray | `#F1F3F5` |
| Elevated (modals) | White | `#FFFFFF` |

### Text
| Purpose | Color | Hex | Contrast |
|---------|-------|-----|----------|
| Primary | Dark Gray | `#212121` | 16:1 ✓ |
| Secondary | Medium Gray | `#616161` | 5.9:1 ✓ |
| Tertiary | Light Gray | `#9E9E9E` | 3:1 (large text only) |
| Disabled | Lighter Gray | `#BDBDBD` | 2:1 |
| Link | Blue | `#1976D2` | 4.5:1 ✓ |

### Borders
| Purpose | Color | Hex |
|---------|-------|-----|
| Default | Light | `#E0E0E0` |
| Strong | Medium | `#BDBDBD` |
| Focus | Primary Blue | `#1976D2` |

---

## Dark Theme

### Backgrounds
| Purpose | Color | Hex |
|---------|-------|-----|
| Primary (screen) | Dark | `#121212` |
| Secondary (sections) | Slightly Lighter | `#1E1E1E` |
| Tertiary (subtle) | Card Background | `#252525` |
| Elevated (modals) | Raised | `#2D2D2D` |

### Text
| Purpose | Color | Hex | Contrast |
|---------|-------|-----|----------|
| Primary | White | `#FFFFFF` | 15.8:1 ✓ |
| Secondary | Light Gray | `#B0B0B0` | 8.6:1 ✓ |
| Tertiary | Gray | `#757575` | 4.6:1 ✓ |
| Disabled | Dark Gray | `#505050` | 2.3:1 |
| Link | Light Blue | `#64B5F6` | 7.5:1 ✓ |

### Borders
| Purpose | Color | Hex |
|---------|-------|-----|
| Default | Dark | `#333333` |
| Strong | Medium | `#505050` |
| Focus | Light Blue | `#64B5F6` |

---

## Interactive Elements

### Buttons - Light Theme

| State | Background | Text |
|-------|------------|------|
| Primary | `#1976D2` | `#FFFFFF` |
| Primary Hover | `#1565C0` | `#FFFFFF` |
| Primary Active | `#0D47A1` | `#FFFFFF` |
| Primary Disabled | `#90CAF9` | `#FFFFFF` |
| Secondary | `#F5F5F5` | `#212121` |
| Secondary Hover | `#EEEEEE` | `#212121` |

### Buttons - Dark Theme

| State | Background | Text |
|-------|------------|------|
| Primary | `#1E88E5` | `#FFFFFF` |
| Primary Hover | `#42A5F5` | `#FFFFFF` |
| Primary Active | `#1565C0` | `#FFFFFF` |
| Primary Disabled | `#0D47A1` | `#FFFFFF` |
| Secondary | `#2D2D2D` | `#FFFFFF` |
| Secondary Hover | `#3D3D3D` | `#FFFFFF` |

---

## Typography

### Font Family
- **Primary**: System Default (San Francisco on iOS, Roboto on Android)
- **Alternative**: Inter, Roboto, or similar professional sans-serif

### Font Sizes
| Name | Size | Line Height | Use Case |
|------|------|-------------|----------|
| xs | 12px | 16px | Captions, badges |
| sm | 14px | 20px | Secondary text, labels |
| **md** | **16px** | **24px** | **Body text (default)** |
| lg | 18px | 26px | Large body, subtitles |
| xl | 20px | 28px | H4 headings |
| 2xl | 24px | 32px | H3 headings |
| 3xl | 30px | 36px | H2 headings |
| 4xl | 36px | 42px | H1 headings |

### Font Weights
| Weight | Value | Use Case |
|--------|-------|----------|
| Regular | 400 | Body text |
| Medium | 500 | Emphasis, labels |
| Semibold | 600 | Subheadings |
| Bold | 700 | Headings, CTAs |

---

## Spacing System

Based on 4px grid:

| Token | Value | Use Case |
|-------|-------|----------|
| 1 | 4px | Tight spacing |
| 2 | 8px | Small gaps |
| 3 | 12px | Medium gaps |
| **4** | **16px** | **Standard padding** |
| 5 | 20px | Section gaps |
| 6 | 24px | Large gaps |
| 8 | 32px | Section spacing |
| 10 | 40px | Large section spacing |
| 12 | 48px | Page margins |

---

## Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| sm | 4px | Badges, tags |
| **md** | **8px** | **Buttons, inputs** |
| lg | 12px | Cards |
| xl | 16px | Large cards, modals |
| full | 9999px | Circular elements |

---

## Shadows

### Light Theme
| Name | CSS | Use Case |
|------|-----|----------|
| Small | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| Medium | `0 4px 6px rgba(0,0,0,0.07)` | Cards |
| Large | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |

### Dark Theme
| Name | CSS | Use Case |
|------|-----|----------|
| Small | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation |
| Medium | `0 4px 6px rgba(0,0,0,0.4)` | Cards |
| Large | `0 10px 15px rgba(0,0,0,0.5)` | Modals, dropdowns |

---

## Accessibility Checklist

- [x] All text meets WCAG AA contrast ratio (4.5:1 for normal text)
- [x] Large text meets 3:1 contrast ratio
- [x] Interactive elements have 3:1 contrast ratio
- [x] Focus states are clearly visible
- [x] Colors are not the only indicator of meaning
- [x] Dark mode provides equivalent contrast

---

## Quick Reference

### Most Used Colors

```typescript
// Light Mode
background: '#FFFFFF'
text: '#212121'
primary: '#1976D2'
border: '#E0E0E0'
success: '#2E7D32'
error: '#C62828'

// Dark Mode
background: '#121212'
text: '#FFFFFF'
primary: '#1E88E5'
border: '#333333'
success: '#66BB6A'
error: '#EF5350'
```

---

*Last Updated: December 2024*
*Version: 1.0*

