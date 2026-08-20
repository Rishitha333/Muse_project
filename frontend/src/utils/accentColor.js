/**
 * Accent Color Utilities
 * Use these helpers to apply dynamic accent colors throughout the app
 */

/**
 * Convert hex color to RGB format
 * @param {string} hex - Hex color code (e.g., "#7c3aed")
 * @returns {string} RGB format (e.g., "124, 58, 237")
 */
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
    : "124, 58, 237";
};

/**
 * Get accent color with opacity
 * @param {string} accentColor - Hex color code
 * @param {number} opacity - Opacity value (0-1)
 * @returns {string} RGBA color
 */
export const getAccentWithOpacity = (accentColor, opacity) => {
  const rgb = hexToRgb(accentColor);
  return `rgba(${rgb}, ${opacity})`;
};

/**
 * Get CSS classes for a button with accent color
 * Used for buttons that change style when selected
 * @param {boolean} isSelected - Whether button is selected
 * @param {string} theme - Current theme ('light' or 'dark')
 * @param {string} accentColor - Accent color hex code
 * @returns {object} Style object
 */
export const getAccentButtonStyles = (isSelected, theme, accentColor) => {
  if (!isSelected) return {};
  
  const rgb = hexToRgb(accentColor);
  return {
    backgroundColor: `rgba(${rgb}, 0.3)`,
    borderColor: accentColor,
  };
};

/**
 * Get text color based on accent color for contrast
 * @param {string} accentColor - Hex color code
 * @returns {string} Color code for text
 */
export const getAccentTextColor = (accentColor) => {
  // For now, return the accent color itself
  // Can be enhanced to adjust for better contrast
  return accentColor;
};

/**
 * Apply accent color to document
 * @param {string} accentColor - Hex color code
 */
export const applyAccentColor = (accentColor) => {
  document.documentElement.style.setProperty("--accent-color", accentColor);
};

/**
 * Get accent color from CSS variable
 * @returns {string} Current accent color
 */
export const getAccentColor = () => {
  return getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim();
};
