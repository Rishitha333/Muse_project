# Light & Dark Theme Implementation Guide

## Theme Architecture

### 1. Light Theme (Default & Reference)
- **Background**: Purple gradient on `html` element
- **Text**: Dark grays (text-gray-900, text-gray-700, text-gray-600)
- **Containers**: White backgrounds (bg-white)
- **Borders**: Light grays (border-gray-200)
- **Icons**: Dark shades matching text

### 2. Dark Theme (Optional)
- **Background**: Dark backgrounds (#0a0a14, #000000)
- **Text**: White/light shades (add `dark:text-white`, `dark:text-gray-300`)
- **Containers**: Dark grays (add `dark:bg-gray-800`, `dark:bg-gray-900`)
- **Borders**: Dark grays (add `dark:border-gray-700`)
- **Icons**: Light shades matching dark theme text

## Critical Rules

### Rule 1: Light Theme Must Never Change
- ✅ Add only `dark:` variants to existing classes
- ❌ Never modify light theme classes
- ❌ Never change spacing, layout, or typography
- Light theme appearance must match original exactly

### Rule 2: Color Consistency
- **Brand Colors Stay Consistent**
  - Purple sidebar: `bg-gradient-to-b from-purple-700 to-purple-900` (both themes)
  - Purple accents: `text-purple-600`, `text-violet-600` (both themes)
  - Success/Warning/Error colors maintain same hue, only brightness changes

- **Text Adaptation Only**
  - Dark theme: `text-gray-900` → `dark:text-white`
  - Dark theme: `text-gray-700` → `dark:text-gray-300` or `dark:text-gray-400`
  - Dark theme: `text-gray-600` → `dark:text-gray-400` or `dark:text-gray-500`

### Rule 3: Contrast Requirements
- Minimum 4.5:1 contrast ratio for text
- Dark text on light backgrounds = contrast maintained by Tailwind defaults
- Light text on dark backgrounds = requires explicit `dark:text-*` variants

### Rule 4: Seamless Theme Switching
- Theme toggle changes HTML class and localStorage
- All changes via CSS (no JavaScript conditional rendering)
- No visual flicker or layout shift
- Smooth 300ms transition recommended

## Implementation Checklist

### For Every Component/Page:

1. **Text Elements** - Add dark variants
   - `text-gray-900` → `text-gray-900 dark:text-white`
   - `text-gray-700` → `text-gray-700 dark:text-gray-300`
   - `text-gray-600` → `text-gray-600 dark:text-gray-400`

2. **Background Containers** - Add dark variants
   - `bg-white` → `bg-white dark:bg-gray-800`
   - `bg-gray-50` → `bg-gray-50 dark:bg-gray-700`
   - `bg-gray-100` → `bg-gray-100 dark:bg-gray-600`

3. **Borders** - Add dark variants
   - `border-gray-200` → `border-gray-200 dark:border-gray-700`
   - `border-gray-100` → `border-gray-100 dark:border-gray-600`

4. **Icons/SVGs** - Add dark variants
   - `text-gray-600` → `text-gray-600 dark:text-gray-400`
   - Use same color as adjacent text for consistency

5. **Input Fields & Form Elements** - Add dark variants
   - Background: `bg-gray-200 dark:bg-gray-700`
   - Border: `border-gray-300 dark:border-gray-600`
   - Text: `text-gray-900 dark:text-white`
   - Placeholder: `placeholder-gray-500 dark:placeholder-gray-400`

6. **Hover States** - Add dark variants
   - Light: `hover:bg-gray-100` → `dark:hover:bg-gray-700`
   - Light: `hover:text-gray-700` → `dark:hover:text-gray-300`

## File-by-File Priority

### High Priority (User-Facing Pages)
1. Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx
2. Dashboard.jsx
3. AnalyzeCall.jsx
4. Results.jsx
5. History.jsx
6. Settings.jsx

### Medium Priority (Admin Pages)
1. UserManagement.jsx ✅ (partially done)
2. AdminCallRecords.jsx ✅ (partially done)
3. AdminReports.jsx ✅ (partially done)
4. AdminAlerts.jsx ✅ (partially done)
5. AdminDashboard.jsx
6. AdminSettings.jsx

### Component Files
1. DashboardLayout.jsx
2. AdminLayout.jsx
3. Sidebar.jsx
4. AdminSidebar.jsx
5. ThemeToggle.jsx

## Test Checklist

- [ ] Light Theme: Switch to light mode, verify NO changes from original
- [ ] Dark Theme: Switch to dark mode, verify all text is readable
- [ ] Contrast: Use browser DevTools Lighthouse to check 4.5:1 ratio
- [ ] Transitions: Theme switch is smooth, no flicker
- [ ] Persistence: Refresh page, theme persists correctly
- [ ] All Pages: Test all routes in both light and dark modes
- [ ] Mobile: Test theme switching on mobile viewport
- [ ] Forms: Test input fields in both modes
- [ ] Modals: Test all modals in both modes
- [ ] Tables: Test all table elements visibility

## CSS Classes Reference

### Text Colors
```
Light: text-gray-900      | Dark: dark:text-white
Light: text-gray-700      | Dark: dark:text-gray-300
Light: text-gray-600      | Dark: dark:text-gray-400
Light: text-gray-500      | Dark: dark:text-gray-500
Light: text-gray-400      | Dark: dark:text-gray-600
```

### Background Colors
```
Light: bg-white           | Dark: dark:bg-gray-800
Light: bg-gray-50         | Dark: dark:bg-gray-700
Light: bg-gray-100        | Dark: dark:bg-gray-600
Light: bg-gray-200        | Dark: dark:bg-gray-700
```

### Border Colors
```
Light: border-gray-200    | Dark: dark:border-gray-700
Light: border-gray-100    | Dark: dark:border-gray-600
Light: border-gray-300    | Dark: dark:border-gray-600
```

### Placeholder Text
```
Light: placeholder-gray-500     | Dark: dark:placeholder-gray-400
Light: placeholder-gray-600     | Dark: dark:placeholder-gray-500
```
