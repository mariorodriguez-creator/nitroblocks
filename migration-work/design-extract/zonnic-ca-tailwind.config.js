/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(231, 62%, 97%)',
            '100': 'hsl(231, 62%, 94%)',
            '200': 'hsl(231, 62%, 86%)',
            '300': 'hsl(231, 62%, 76%)',
            '400': 'hsl(231, 62%, 64%)',
            '500': 'hsl(231, 62%, 50%)',
            '600': 'hsl(231, 62%, 40%)',
            '700': 'hsl(231, 62%, 32%)',
            '800': 'hsl(231, 62%, 24%)',
            '900': 'hsl(231, 62%, 16%)',
            '950': 'hsl(231, 62%, 10%)',
            DEFAULT: '#182465'
        },
        secondary: {
            '50': 'hsl(222, 54%, 97%)',
            '100': 'hsl(222, 54%, 94%)',
            '200': 'hsl(222, 54%, 86%)',
            '300': 'hsl(222, 54%, 76%)',
            '400': 'hsl(222, 54%, 64%)',
            '500': 'hsl(222, 54%, 50%)',
            '600': 'hsl(222, 54%, 40%)',
            '700': 'hsl(222, 54%, 32%)',
            '800': 'hsl(222, 54%, 24%)',
            '900': 'hsl(222, 54%, 16%)',
            '950': 'hsl(222, 54%, 10%)',
            DEFAULT: '#3860be'
        },
        accent: {
            '50': 'hsl(118, 100%, 97%)',
            '100': 'hsl(118, 100%, 94%)',
            '200': 'hsl(118, 100%, 86%)',
            '300': 'hsl(118, 100%, 76%)',
            '400': 'hsl(118, 100%, 64%)',
            '500': 'hsl(118, 100%, 50%)',
            '600': 'hsl(118, 100%, 40%)',
            '700': 'hsl(118, 100%, 32%)',
            '800': 'hsl(118, 100%, 24%)',
            '900': 'hsl(118, 100%, 16%)',
            '950': 'hsl(118, 100%, 10%)',
            DEFAULT: '#e3ffe2'
        },
        'neutral-50': '#616069',
        'neutral-100': '#ffffff',
        'neutral-200': '#000000',
        'neutral-300': '#2f2f2f',
        'neutral-400': '#f6f6f6',
        'neutral-500': '#555555',
        'neutral-600': '#3a3a3f',
        'neutral-700': '#ebecf1',
        'neutral-800': '#dedede',
        'neutral-900': '#808080',
        background: '#ffffff',
        foreground: '#000000'
    },
    fontFamily: {
        sans: [
            'Santral',
            'sans-serif'
        ],
        body: [
            'Font Awesome 5 Free',
            'sans-serif'
        ],
        font5: [
            'sans-serif',
            'sans-serif'
        ]
    },
    fontSize: {
        '14': [
            '14px',
            {
                lineHeight: '20px'
            }
        ],
        '15': [
            '15px',
            {
                lineHeight: '15px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '28px'
            }
        ],
        '22': [
            '22px',
            {
                lineHeight: '26px',
                letterSpacing: '0.5px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: 'normal'
            }
        ],
        '30': [
            '30px',
            {
                lineHeight: '25px'
            }
        ],
        '32': [
            '32px',
            {
                lineHeight: '40px'
            }
        ],
        '34': [
            '34px',
            {
                lineHeight: '40px'
            }
        ],
        '42': [
            '42px',
            {
                lineHeight: '46px'
            }
        ],
        '14.4': [
            '14.4px',
            {
                lineHeight: '38px',
                letterSpacing: '0.144px'
            }
        ],
        '13.6': [
            '13.6px',
            {
                lineHeight: '27.2px'
            }
        ],
        '13.3333': [
            '13.3333px',
            {
                lineHeight: 'normal'
            }
        ],
        '13.008': [
            '13.008px',
            {
                lineHeight: '19.512px'
            }
        ],
        '12.992': [
            '12.992px',
            {
                lineHeight: '19.488px'
            }
        ]
    },
    spacing: {
        '0': '0px',
        '19': '38px',
        '24': '48px',
        '30': '60px',
        '35': '70px',
        '40': '80px',
        '51': '102px',
        '60': '120px',
        '70': '140px',
        '118': '236px',
        '128': '256px',
        '160': '320px',
        '55px': '55px',
        '95px': '95px',
        '123px': '123px',
        '203px': '203px',
        '207px': '207px'
    },
    borderRadius: {
        xs: '1px',
        md: '6px',
        lg: '14px',
        xl: '20px',
        full: '100px'
    },
    boxShadow: {
        sm: 'rgba(47, 47, 47, 0.3) 0px 2px 5px 0px',
        md: 'rgb(97, 96, 105) 0px 5px 10px 0px',
        lg: 'rgba(0, 0, 0, 0.2) 0px 0px 18px 0px'
    },
    screens: {
        xs: '320px',
        '400px': '400px',
        sm: '577px',
        md: '769px',
        '890px': '890px',
        '897px': '897px',
        lg: '1025px',
        '1200px': '1200px',
        '1201px': '1201px',
        xl: '1280px',
        '2xl': '1500px'
    },
    transitionDuration: {
        '100': '0.1s',
        '200': '0.2s',
        '250': '0.25s',
        '300': '0.3s',
        '500': '0.5s',
        '600': '0.6s'
    },
    transitionTimingFunction: {
        default: 'ease'
    },
    container: {
        center: true,
        padding: '20px'
    },
    maxWidth: {
        container: '1500px'
    }
},
  },
};
