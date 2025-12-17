# UI Update Guide - Earthy Palette Implementation

## Color Palette

- **Sage Green**: `#a5b9a3` (var(--accent-2))
- **Cinnamon**: `#b2724d` (var(--accent))
- **Tan**: `#c2a07f`
- **Cream**: `#f4efde` (var(--bg))

## CSS Variables (in index.css)

```css
--bg: #f4efde;
--surface-0: #faf7f0;
--surface-1: #ede8db;
--surface-2: #e3dcc9;
--text-primary: #2d2416;
--text-secondary: #6b5d48;
--accent: #b2724d;
--accent-2: #a5b9a3;
--border-strong: rgba(194, 160, 127, 0.3);
--border-stronger: rgba(194, 160, 127, 0.5);
```

## Global Components (in App.css)

- `.clay-card` - Main card component
- `.btn-primary` - Primary action button (cinnamon → sage gradient)
- `.btn-ghost` - Secondary button (transparent with hover)
- `.pill` - Badge/tag component
- `.glow-blob` - Background decoration
- `.floating` - Floating animation
- `.rise-in` - Entrance animation
- `.shine` - Shimmer effect

## Pattern for Updating Pages

### 1. Replace dark mode conditional classes with:

```jsx
// OLD (Dark Mode)
className={`... ${darkMode ? "bg-slate-800" : "bg-white"}`}

// NEW (Earthy Palette)
className="clay-card"
// OR
style={{ background: "var(--surface-1)" }}
```

### 2. Replace color-specific classes:

- `bg-blue-*` → `style={{ background: "var(--accent-2)" }}`
- `text-slate-*` → `style={{ color: "var(--text-primary)" }}`
- `border-blue-*` → `style={{ borderColor: "var(--border-strong)" }}`

### 3. Use component classes:

- Old gradient cards → `.clay-card`
- Old buttons → `.btn-primary` or `.btn-ghost`
- Old badges → `.pill`

### 4. Remove dark mode props:

```jsx
// Remove these props from components:
-darkMode - onToggleDarkMode;
```

### 5. Wrap pages in `.app-shell`:

```jsx
<div className="app-shell">
  <Nav ... />
  <main>...</main>
</div>
```

## Pages Updated ✅

1. ✅ LandingPage.jsx
2. ✅ LandingNav.jsx
3. ✅ SignInPage.jsx
4. ✅ DashboardPage.jsx (Recruiter)
5. ✅ RecruiterNav.jsx

## Pages Still Need Update ⏳

1. ❌ SignUpPage.jsx
2. ❌ FindJobsPage.jsx
3. ❌ CandidateDashboardPage.jsx (partially - nav updated)
4. ❌ CandidateNav.jsx (partially - main nav updated, mobile menu needs fix)
5. ❌ ProfilePage.jsx
6. ❌ RecruiterCandidatesPage.jsx
7. ❌ RecruiterInterviewsPage.jsx
8. ❌ RecruiterAnalyticsPage.jsx
9. ❌ InterviewRoomPage.jsx
10. ❌ JobPostsPage.jsx
11. ❌ CandidateDetailsPage.jsx
12. ❌ CandidateInterviewsPage.jsx

## Quick Fix Script Pattern

For each page, replace:

1. Background wrapper with `<div className="app-shell">`
2. Remove dark mode conditionals
3. Use CSS variables for colors
4. Replace custom cards with `.clay-card`
5. Replace custom buttons with `.btn-primary` / `.btn-ghost`
6. Remove `darkMode` and `onToggleDarkMode` props from nav components

## Example Transformation

### Before (Dark Mode):

```jsx
<div className={`min-h-screen ${darkMode ? "bg-slate-900" : "bg-blue-50"}`}>
  <Nav darkMode={darkMode} onToggleDarkMode={setDarkMode} />
  <div
    className={`rounded-xl p-6 ${
      darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
    }`}
  >
    <button
      className={`px-4 py-2 ${
        darkMode ? "bg-indigo-600" : "bg-blue-600"
      } text-white rounded`}
    >
      Click Me
    </button>
  </div>
</div>
```

### After (Earthy Palette):

```jsx
<div className="app-shell">
  <Nav userName={userName} currentPage="dashboard" />
  <div className="clay-card">
    <button className="btn-primary">Click Me</button>
  </div>
</div>
```

## Testing Checklist

- [ ] All pages load without errors
- [ ] Colors are consistent across pages
- [ ] Buttons have proper hover states
- [ ] Cards have proper shadows and borders
- [ ] Text is readable (proper contrast)
- [ ] Mobile navigation works
- [ ] Animations play smoothly
- [ ] Forms are properly styled
