const defaultTheme = require('tailwindcss/defaultTheme')
const globEntries = require('webpack-glob-entries-extended')

const paths = require("./paths.js")

const pxToRem = (px, base = 16) => {
  return `${px / base}rem`
}

const generateFontSize = (min, max) => {
  const fontSize = {}

  let i = min
  while (i <= max) {
    fontSize[i] = pxToRem(i)
    i += 2
  }

  return fontSize
}

const generateBorderRadius = (max) => {
  const borderRadius = Array.from(Array(max + 1).keys()).reduce((acc, cur) => {
    if (cur % 2 !== 0) {
      return acc
    }

    acc[cur] = pxToRem(cur)
    return acc
  }, {})
  borderRadius["full"] = "9999px"

  return borderRadius
}

module.exports = {
  content: Object.values(globEntries(paths.src + "/**/*.{html,js,jsx,ts,tsx}")),
  darkMode: "class",
  theme: {
    extend: {
      borderRadius: generateBorderRadius(24),
      colors: {
        purple: {
          100: "#928CFF",
          200: "#483EFF",
        },
        red: "#EE374A",
        blue: {
          100: "#BEE2FD",
          200: "#ABBCFF",
          300: "#164A8A",
          400: "#022959",
        },
        gray: {
          100: "#F8F9FF",
          200: "#EFF5FF",
          300: "#D6D9E6",
          400: "#9699AA",
        },
      },
      fontFamily: {
        'sans': ['Ubuntu', ...defaultTheme.fontFamily.sans],
      },
      fontSize: generateFontSize(12, 100),
      spacing: {
        "4.5": pxToRem(18),
      },
      transitionDuration: {
        "DEFAULT": "300ms",
      }
    },
  },
  plugins: [],
}