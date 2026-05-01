// React Theme — extracted from https://www.zonnic.ca/ca/en
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    neutral700: string;
    neutral800: string;
    neutral900: string;
 *   };
 *   fonts: {
    body: string;
 *   };
 *   fontSizes: {
    '14': string;
    '15': string;
    '16': string;
    '20': string;
    '22': string;
    '24': string;
    '30': string;
    '32': string;
    '34': string;
    '42': string;
    '14.4': string;
    '13.6': string;
 *   };
 *   space: {
    '0': string;
    '38': string;
    '48': string;
    '55': string;
    '60': string;
    '70': string;
    '80': string;
    '95': string;
    '102': string;
    '120': string;
    '123': string;
    '140': string;
    '203': string;
    '207': string;
    '236': string;
    '256': string;
 *   };
 *   radii: {
    xs: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
 *   };
 *   shadows: {
    sm: string;
    md: string;
    lg: string;
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  "colors": {
    "primary": "#182465",
    "secondary": "#3860be",
    "accent": "#e3ffe2",
    "background": "#ffffff",
    "foreground": "#000000",
    "neutral50": "#616069",
    "neutral100": "#ffffff",
    "neutral200": "#000000",
    "neutral300": "#2f2f2f",
    "neutral400": "#f6f6f6",
    "neutral500": "#555555",
    "neutral600": "#3a3a3f",
    "neutral700": "#ebecf1",
    "neutral800": "#dedede",
    "neutral900": "#808080"
  },
  "fonts": {
    "body": "'sans-serif', sans-serif"
  },
  "fontSizes": {
    "14": "14px",
    "15": "15px",
    "16": "16px",
    "20": "20px",
    "22": "22px",
    "24": "24px",
    "30": "30px",
    "32": "32px",
    "34": "34px",
    "42": "42px",
    "14.4": "14.4px",
    "13.6": "13.6px"
  },
  "space": {
    "0": "0px",
    "38": "38px",
    "48": "48px",
    "55": "55px",
    "60": "60px",
    "70": "70px",
    "80": "80px",
    "95": "95px",
    "102": "102px",
    "120": "120px",
    "123": "123px",
    "140": "140px",
    "203": "203px",
    "207": "207px",
    "236": "236px",
    "256": "256px"
  },
  "radii": {
    "xs": "1px",
    "md": "6px",
    "lg": "14px",
    "xl": "20px",
    "full": "100px"
  },
  "shadows": {
    "sm": "rgba(47, 47, 47, 0.3) 0px 2px 5px 0px",
    "md": "rgb(97, 96, 105) 0px 5px 10px 0px",
    "lg": "rgba(0, 0, 0, 0.2) 0px 0px 18px 0px"
  },
  "states": {
    "hover": {
      "opacity": 0.08
    },
    "focus": {
      "opacity": 0.12
    },
    "active": {
      "opacity": 0.16
    },
    "disabled": {
      "opacity": 0.38
    }
  }
};

// MUI v5 theme
export const muiTheme = {
  "palette": {
    "primary": {
      "main": "#182465",
      "light": "hsl(231, 62%, 40%)",
      "dark": "hsl(231, 62%, 10%)"
    },
    "secondary": {
      "main": "#3860be",
      "light": "hsl(222, 54%, 63%)",
      "dark": "hsl(222, 54%, 33%)"
    },
    "background": {
      "default": "#ffffff",
      "paper": "#182465"
    },
    "text": {
      "primary": "#000000",
      "secondary": "#616069"
    }
  },
  "typography": {
    "fontFamily": "'Arial', sans-serif",
    "h1": {
      "fontSize": "32px",
      "fontWeight": "800",
      "lineHeight": "40px"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "normal"
    },
    "h3": {
      "fontSize": "22px",
      "fontWeight": "800",
      "lineHeight": "26px"
    }
  },
  "shape": {
    "borderRadius": 6
  },
  "shadows": [
    "rgba(47, 47, 47, 0.3) 0px 2px 5px 0px",
    "rgb(199, 197, 199) -3px -3px 5px -2px",
    "rgba(0, 0, 0, 0.3) 0px 0px 10px 0px",
    "rgb(153, 153, 153) 0px 2px 10px -3px",
    "rgb(199, 197, 199) 0px 0px 12px 2px"
  ]
};

export default theme;
