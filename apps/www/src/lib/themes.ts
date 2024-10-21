const _THEMES = {
  ayu: {
    id: 'ayu',
    colors: {
      accent: '35 100% 50% / 0.3', // Semi-transparent version of brand
      accentForeground: '0 0% 9%',
      background: '38 100% 99%', // #FAFAFA
      border: '44 17% 88%', // #E7E8E9
      brand: '35 100% 50%', // #FF9940
      card: '38 100% 99%', // #FAFAFA
      cardForeground: '0 0% 9%', // #171717
      destructive: '0 100% 67%', // #FF3333
      destructiveForeground: '0 0% 100%', // #FFFFFF
      foreground: '0 0% 9%', // #171717
      highlight: '50 100% 60%', // #FFD740
      input: '44 17% 88%', // #E7E8E9
      muted: '44 17% 88%', // #E7E8E9
      mutedForeground: '0 0% 45%', // #737373
      popover: '38 100% 99%', // #FAFAFA
      popoverForeground: '0 0% 9%', // #171717
      primary: '35 100% 50%', // #FF9940
      primaryForeground: '0 0% 100%', // #FFFFFF
      ring: '35 100% 50%', // #FF9940
      secondary: '44 17% 88%', // #E7E8E9
      secondaryForeground: '0 0% 9%', // #171717
    },
    colorsDark: {
      accent: '35 100% 50% / 0.2', // Semi-transparent version of brand
      accentForeground: '0 0% 9%',
      background: '220 27% 18%', // #1F2430
      border: '220 13% 26%', // #33415E
      brand: '35 100% 50%', // #FF9940
      card: '220 27% 18%', // #1F2430
      cardForeground: '0 0% 100%', // #FFFFFF
      destructive: '0 100% 67%', // #FF3333
      destructiveForeground: '0 0% 100%', // #FFFFFF
      foreground: '0 0% 100%', // #FFFFFF
      highlight: '50 100% 60%', // #FFD740
      input: '220 13% 26%', // #33415E
      muted: '220 13% 26%', // #33415E
      mutedForeground: '220 13% 65%', // #8A9199
      popover: '220 27% 18%', // #1F2430
      popoverForeground: '0 0% 100%', // #FFFFFF
      primary: '35 100% 50%', // #FF9940
      primaryForeground: '0 0% 100%', // #FFFFFF
      ring: '35 100% 50%', // #FF9940
      secondary: '220 13% 26%', // #33415E
      secondaryForeground: '0 0% 100%', // #FFFFFF
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'Ayu',
    radius: 0.5,
  },
  catppuccin: {
    id: 'catppuccin',
    colors: {
      accent: '266 85% 58% / 0.2', // Mauve with opacity
      accentForeground: '234 16% 35%', // Text
      background: '220 23% 95%', // Base
      border: '225 14% 77%', // Surface1
      brand: '266 85% 58%', // Mauve
      card: '220 23% 95%', // Base
      cardForeground: '234 16% 35%', // Text
      destructive: '347 87% 44%', // Red
      destructiveForeground: '220 23% 95%', // Base
      foreground: '234 16% 35%', // Text
      highlight: '231 97% 72%', // Lavender
      input: '227 12% 71%', // Surface2
      muted: '223 16% 83%', // Surface0
      mutedForeground: '233 10% 47%', // Subtext0
      popover: '220 23% 95%', // Base
      popoverForeground: '234 16% 35%', // Text
      primary: '266 85% 58%', // Mauve
      primaryForeground: '220 23% 95%', // Base
      ring: '266 85% 58%', // Mauve
      secondary: '231 97% 72%', // Lavender
      secondaryForeground: '234 16% 35%', // Text
    },
    colorsDark: {
      accent: '267 83% 80% / 0.2', // Mauve with opacity
      accentForeground: '227 68% 88%', // Text
      background: '232 23% 18%', // Base
      border: '231 16% 34%', // Surface1
      brand: '267 83% 80%', // Mauve
      card: '232 23% 18%', // Base
      cardForeground: '227 68% 88%', // Text
      destructive: '351 74% 73%', // Red
      destructiveForeground: '227 68% 88%', // Text
      foreground: '227 68% 88%', // Text
      highlight: '234 82% 85%', // Lavender
      input: '230 14% 41%', // Surface2
      muted: '230 19% 26%', // Surface0
      mutedForeground: '228 39% 80%', // Subtext1
      popover: '232 23% 18%', // Base
      popoverForeground: '227 68% 88%', // Text
      primary: '267 83% 80%', // Mauve
      primaryForeground: '232 23% 18%', // Base
      ring: '267 83% 80%', // Mauve
      secondary: '234 82% 85%', // Lavender
      secondaryForeground: '227 68% 88%', // Text
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'Catppuccin',
    radius: 0.5,
  },
  'default-palette': {
    id: 'default-palette',
    colors: {
      accent: '240 4.8% 95.9%',
      'accent-foreground': '240 5.9% 10%',
      background: '0 0% 100%',
      border: '240 5.9% 90%',
      brand: '240 5.9% 10%', // Same as primary
      card: '0 0% 100%',
      'card-foreground': '240 10% 3.9%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      foreground: '240 10% 3.9%',
      highlight: '240 4.8% 95.9%', // Same as secondary
      input: '240 5.9% 90%',
      muted: '240 4.8% 95.9%',
      'muted-foreground': '240 3.8% 46.1%',
      popover: '0 0% 100%',
      'popover-foreground': '240 10% 3.9%',
      primary: '240 5.9% 10%',
      'primary-foreground': '0 0% 98%',
      ring: '240 10% 3.9%',
      secondary: '240 4.8% 95.9%',
      'secondary-foreground': '240 5.9% 10%',
    },
    colorsDark: {
      accent: '240 3.7% 15.9%',
      'accent-foreground': '0 0% 98%',
      background: '240 10% 3.9%',
      border: '240 3.7% 15.9%',
      brand: '0 0% 98%', // Same as primary
      card: '240 10% 3.9%',
      'card-foreground': '0 0% 98%',
      destructive: '0 62.8% 30.6%',
      'destructive-foreground': '0 0% 98%',
      foreground: '0 0% 98%',
      highlight: '240 3.7% 15.9%', // Same as secondary
      input: '240 3.7% 15.9%',
      muted: '240 3.7% 15.9%',
      'muted-foreground': '240 5% 64.9%',
      popover: '240 10% 3.9%',
      'popover-foreground': '0 0% 98%',
      primary: '0 0% 98%',
      'primary-foreground': '240 5.9% 10%',
      ring: '240 4.9% 83.9%',
      secondary: '240 3.7% 15.9%',
      'secondary-foreground': '0 0% 98%',
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'Default Palette',
    radius: 0.5,
  },
  'default-shadcn': {
    id: 'default-shadcn',
    colors: {
      accent: '240 4.8% 95.9%',
      'accent-foreground': '240 5.9% 10%',
      background: '0 0% 100%',
      border: '240 5.9% 90%',
      brand: '217.2 91.2% 59.8%',
      card: '0 0% 100%',
      'card-foreground': '240 10% 3.9%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      foreground: '240 10% 3.9%',
      highlight: '47.9 95.8% 53.1%',
      input: '240 5.9% 90%',
      muted: '240 4.8% 95.9%',
      'muted-foreground': '240 3.8% 46.1%',
      popover: '0 0% 100%',
      'popover-foreground': '240 10% 3.9%',
      primary: '240 5.9% 10%',
      'primary-foreground': '0 0% 98%',
      ring: '240 10% 3.9%',
      secondary: '240 4.8% 95.9%',
      'secondary-foreground': '240 5.9% 10%',
    },
    colorsDark: {
      accent: '240 3.7% 15.9%',
      'accent-foreground': '0 0% 98%',
      background: '240 10% 3.9%',
      border: '240 3.7% 15.9%',
      brand: '213.3 93.9% 67.8%',
      card: '240 10% 3.9%',
      'card-foreground': '0 0% 98%',
      destructive: '0 62.8% 30.6%',
      'destructive-foreground': '0 0% 98%',
      foreground: '0 0% 98%',
      highlight: '48 96% 53%',
      input: '240 3.7% 15.9%',
      muted: '240 3.7% 15.9%',
      'muted-foreground': '240 5% 64.9%',
      popover: '240 10% 3.9%',
      'popover-foreground': '0 0% 98%',
      primary: '0 0% 98%',
      'primary-foreground': '240 5.9% 10%',
      ring: '240 4.9% 83.9%',
      secondary: '240 3.7% 15.9%',
      'secondary-foreground': '0 0% 98%',
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'Default',
    radius: 0.5,
  },
  dune: {
    id: 'dune',
    colors: {
      accent: '36 33% 75% / 0.2',
      accentForeground: '39 14% 22%',
      background: '43 47% 92%',
      border: '43 27% 84%',
      brand: '39 14% 22%', // #3D3A34
      card: '43 47% 92%',
      cardForeground: '39 14% 22%',
      destructive: '0 84% 33%',
      destructiveForeground: '0 0% 100%',
      foreground: '39 14% 22%',
      highlight: '36 33% 75%', // #C9B99B
      input: '43 27% 84%',
      muted: '43 27% 84%',
      mutedForeground: '39 14% 46%',
      popover: '43 47% 92%',
      popoverForeground: '39 14% 22%',
      primary: '39 14% 22%',
      primaryForeground: '43 47% 92%',
      ring: '39 14% 22%',
      secondary: '43 27% 84%',
      secondaryForeground: '39 14% 22%',
    },
    colorsDark: {
      accent: '36 33% 75% / 0.3',
      accentForeground: '39 14% 22%',
      background: '39 14% 12%',
      border: '43 27% 16%',
      brand: '43 47% 88%', // #EBE6D5
      card: '39 14% 14%',
      cardForeground: '43 47% 88%',
      destructive: '0 84% 60%',
      destructiveForeground: '0 0% 100%',
      foreground: '43 47% 88%',
      highlight: '36 33% 25%', // #564F3F
      input: '43 27% 16%',
      muted: '43 27% 16%',
      mutedForeground: '39 14% 64%',
      popover: '39 14% 14%',
      popoverForeground: '43 47% 88%',
      primary: '43 47% 88%',
      primaryForeground: '39 14% 12%',
      ring: '43 47% 88%',
      secondary: '43 27% 16%',
      secondaryForeground: '43 47% 88%',
    },
    fontFamily: {
      body: {
        name: 'Space Mono',
        type: 'monospace',
      },
      heading: {
        name: 'DM Sans',
        type: 'sans-serif',
      },
    },
    name: 'Dune',
  },
  everforest: {
    id: 'everforest',
    colors: {
      accent: '142 40% 46% / 0.2',
      accentForeground: '151 17% 39%',
      background: '44 96% 98%', // #fdf6e3
      border: '44 24% 83%', // #e0dcc7
      brand: '142 40% 46%', // #8DA101
      card: '44 96% 98%', // #fdf6e3
      cardForeground: '151 17% 39%', // #5c6a72
      destructive: '3 89% 65%', // #f85552
      destructiveForeground: '44 96% 98%', // #fdf6e3
      foreground: '151 17% 39%', // #5c6a72
      highlight: '88 23% 63%', // #A7C080
      input: '44 24% 83%', // #e0dcc7
      muted: '44 24% 95%', // #f4f0d9
      mutedForeground: '151 9% 43%',
      popover: '44 96% 98%', // #fdf6e3
      popoverForeground: '151 17% 39%', // #5c6a72
      primary: '142 40% 46%', // #8da101
      primaryForeground: '44 96% 98%', // #fdf6e3
      ring: '142 40% 46%', // #8da101
      secondary: '44 24% 95%', // #f4f0d9
      secondaryForeground: '151 17% 39%',
    },
    colorsDark: {
      accent: '88 23% 63% / 0.2',
      accentForeground: '39 14% 74%',
      background: '220 17% 20%',
      border: '210 9% 33%',
      brand: '88 23% 63%', // #A7C080
      card: '220 17% 24%',
      'card-foreground': '39 14% 74%',
      destructive: '0 43% 70%',
      'destructive-foreground': '39 14% 74%',
      foreground: '39 14% 74%',
      highlight: '142 40% 46%', // #8DA101
      input: '210 9% 33%',
      muted: '210 9% 33%',
      'muted-foreground': '95 8% 53%',
      popover: '220 17% 24%',
      'popover-foreground': '39 14% 74%',
      primary: '88 23% 63%',
      'primary-foreground': '220 17% 20%',
      ring: '88 23% 63%',
      secondary: '210 9% 31%',
      'secondary-foreground': '39 14% 74%',
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'Everforest',
    radius: 0.5,
  },
  github: {
    id: 'github',
    colors: {
      accent: '215 69% 43% / 0.2',
      accentForeground: '215 14% 34%',
      background: '0 0% 100%',
      border: '210 18% 87%',
      brand: '215 69% 43%', // #2F81F7
      card: '0 0% 100%',
      cardForeground: '215 14% 34%',
      destructive: '0 72% 51%',
      destructiveForeground: '0 0% 100%',
      foreground: '215 14% 34%',
      highlight: '212 92% 45%', // #1F6FEB
      input: '210 18% 87%',
      muted: '210 18% 96%',
      mutedForeground: '215 14% 45%',
      popover: '0 0% 100%',
      popoverForeground: '215 14% 34%',
      primary: '215 69% 43%',
      primaryForeground: '0 0% 100%',
      ring: '215 69% 43%',
      secondary: '210 18% 96%',
      secondaryForeground: '215 14% 34%',
    },
    colorsDark: {
      accent: '212 92% 45% / 0.2',
      accentForeground: '210 14% 93%',
      background: '215 28% 17%',
      border: '215 14% 25%',
      brand: '212 92% 45%', // #1F6FEB
      card: '215 28% 17%',
      cardForeground: '210 14% 93%',
      destructive: '0 72% 51%',
      destructiveForeground: '210 14% 93%',
      foreground: '210 14% 93%',
      highlight: '215 69% 43%', // #2F81F7
      input: '215 14% 25%',
      muted: '215 14% 25%',
      mutedForeground: '217 10% 64%',
      popover: '215 28% 17%',
      popoverForeground: '210 14% 93%',
      primary: '212 92% 45%',
      primaryForeground: '210 14% 93%',
      ring: '212 92% 45%',
      secondary: '215 14% 25%',
      secondaryForeground: '210 14% 93%',
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'GitHub',
    radius: 0.375,
  },
  horizon: {
    id: 'horizon',
    colors: {
      accent: '345 80% 70% / 0.2',
      accentForeground: '345 6% 30%',
      background: '345 6% 95%', // #fdf0ed
      border: '345 6% 85%', // #e4d8d4
      brand: '345 80% 70%', // #F075B5
      card: '345 6% 93%', // #f9e8e4
      cardForeground: '345 6% 30%', // #52484e
      destructive: '0 72% 51%', // #e33400
      destructiveForeground: '345 6% 95%', // #fdf0ed
      foreground: '345 6% 30%', // #52484e
      highlight: '344 96% 92%', // #FCEAE5
      input: '345 6% 85%', // #e4d8d4
      muted: '345 6% 90%', // #eee0dc
      mutedForeground: '345 6% 50%', // #8b7b82
      popover: '345 6% 93%', // #f9e8e4
      popoverForeground: '345 6% 30%', // #52484e
      primary: '345 80% 70%', // #f075b5
      primaryForeground: '345 6% 95%', // #fdf0ed
      ring: '345 80% 70%', // #f075b5
      secondary: '345 6% 90%', // #eee0dc
      secondaryForeground: '345 6% 30%', // #52484e
    },
    colorsDark: {
      accent: '345 80% 70% / 0.2',
      accentForeground: '345 6% 80%',
      background: '345 6% 15%', // #1c1e26
      border: '345 6% 25%', // #3d3741
      brand: '345 80% 70%', // #F075B5
      card: '345 6% 17%', // #232530
      cardForeground: '345 6% 80%', // #d5d0d2
      destructive: '0 72% 51%', // #e33400
      destructiveForeground: '345 6% 95%', // #fdf0ed
      foreground: '345 6% 80%', // #d5d0d2
      highlight: '344 96% 92%', // #FCEAE5
      input: '345 6% 25%', // #3d3741
      muted: '345 6% 20%', // #2e3037
      mutedForeground: '345 6% 60%', // #a39fa1
      popover: '345 6% 17%', // #232530
      popoverForeground: '345 6% 80%', // #d5d0d2
      primary: '345 80% 70%', // #f075b5
      primaryForeground: '345 6% 15%', // #1c1e26
      ring: '345 80% 70%', // #f075b5
      secondary: '345 6% 20%', // #2e3037
      secondaryForeground: '345 6% 80%', // #d5d0d2
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'Horizon',
    radius: 0.5,
  },
  linear: {
    id: 'linear',
    colors: {
      accent: '231 62% 63%', // #6e79d6
      'accent-foreground': '0 0% 98%', // #FBFBFB
      background: '0 0% 98%', // #FBFBFB
      border: '220 9% 93%', // #edeef1
      brand: '220 13% 86%', // #E1E3E8
      card: '220 13% 95%', // #f2f3f5
      'card-foreground': '216 14% 43%', // #5d6a7e
      destructive: '0 80% 60%', // #ef4343
      'destructive-foreground': '0 0% 98%', // #FBFBFB
      foreground: '216 14% 43%', // #5d6a7e
      highlight: '220 13% 93%', // #F1F2F4
      input: '220 13% 91%', // #e8eaee
      muted: '220 13% 91%', // #e8eaee
      'muted-foreground': '215 13% 65%', // #8b96a9
      popover: '220 13% 95%', // #f2f3f5
      'popover-foreground': '216 14% 43%', // #5d6a7e
      primary: '231 62% 63%', // #6e79d6
      'primary-foreground': '0 0% 98%', // #FBFBFB
      ring: '231 62% 63%', // #6e79d6
      secondary: '220 13% 91%', // #e8eaee
      'secondary-foreground': '216 14% 43%', // #5d6a7e
    },
    // Linear Dark
    colorsDark: {
      accent: '231 62% 60%', // #5e6ad2
      'accent-foreground': '220 5% 77%', // #c1c3c8
      background: '220 7% 13%', // #1f2023
      border: '225 6% 19%', // #2e2f33
      brand: '220 13% 86%', // #E1E3E8
      card: '225 5% 17%', // #292a2e
      'card-foreground': '220 5% 77%', // #c1c3c8
      destructive: '0 72% 63%', // #eb5757
      'destructive-foreground': '220 5% 77%', // #c1c3c8
      foreground: '220 5% 77%', // #c1c3c8
      highlight: '220 13% 93%', // #F1F2F4
      input: '225 7% 21%', // #323439
      muted: '225 7% 21%', // #323439
      'muted-foreground': '220 5% 57%', // #8b8e98
      popover: '225 5% 17%', // #292a2e
      'popover-foreground': '220 5% 77%', // #c1c3c8
      primary: '231 62% 60%', // #5e6ad2
      'primary-foreground': '220 5% 77%', // #c1c3c8
      ring: '231 62% 60%', // #5e6ad2
      secondary: '225 7% 21%', // #323439
      'secondary-foreground': '220 5% 77%', // #c1c3c8
    },
    fontFamily: {
      body: {
        name: 'Manrope',
        type: 'sans-serif',
      },
      heading: {
        name: 'Manrope',
        type: 'sans-serif',
      },
    },
    name: 'Linear',
    radius: 0.5,
  },
  'one-dark-pro': {
    id: 'one-dark-pro',
    colors: {
      accent: '220 13% 33%',
      'accent-foreground': '220 13% 93%',
      background: '220 13% 18%',
      border: '220 3% 23%',
      brand: '220 13% 86%', // #E1E3E8
      card: '220 13% 16%',
      'card-foreground': '219 14% 76%',
      destructive: '6 97% 49%',
      'destructive-foreground': '0 0% 100%',
      foreground: '219 14% 71%',
      highlight: '220 13% 93%', // #F1F2F4
      input: '220 3% 26%',
      muted: '220 12% 22%',
      'muted-foreground': '220 12% 72%',
      popover: '220 13% 15%',
      'popover-foreground': '219 14% 81%',
      primary: '220 13% 86%',
      'primary-foreground': '220 13% 26%',
      ring: '220 13% 86%',
      secondary: '220 3% 25%',
      'secondary-foreground': '220 3% 85%',
    },
    colorsDark: {
      accent: '220 13% 33%',
      'accent-foreground': '220 13% 93%',
      background: '220 13% 18%',
      border: '220 3% 23%',
      brand: '220 13% 86%', // #E1E3E8
      card: '220 13% 16%',
      'card-foreground': '219 14% 76%',
      destructive: '6 97% 49%',
      'destructive-foreground': '0 0% 100%',
      foreground: '219 14% 71%',
      highlight: '220 13% 93%', // #F1F2F4
      input: '220 3% 26%',
      muted: '220 12% 22%',
      'muted-foreground': '220 12% 72%',
      popover: '220 13% 15%',
      'popover-foreground': '219 14% 81%',
      primary: '220 13% 86%',
      'primary-foreground': '220 13% 26%',
      ring: '220 13% 86%',
      secondary: '220 3% 25%',
      'secondary-foreground': '220 3% 85%',
    },
    fontFamily: {
      body: {
        name: 'Inter',
        type: 'sans-serif',
      },
      heading: {
        name: 'Inter',
        type: 'sans-serif',
      },
    },
    name: 'One Dark Pro',
    radius: 0.5,
  },
};

Object.entries(_THEMES).forEach(([key, theme]) => {
  (_THEMES as any)[key] = {
    ...theme,
    cssVars: {
      dark: themeColorsToCssVariables(theme.colorsDark),
      light: themeColorsToCssVariables(theme.colors),
    },
  };
});

export const THEMES: Record<ThemeId, Theme> = _THEMES as any;

export function themeColorsToCssVariables(
  colors: Record<string, string>
): Record<string, string> {
  const cssVars = colors
    ? Object.fromEntries(
        Object.entries(colors).map(([name, value]) => {
          if (value === undefined) return [];

          const cssName = themeColorNameToCssVariable(name);

          return [cssName, value];
        })
      )
    : {};

  // for (const key of Array.from({ length: 5 }, (_, index) => index)) {
  //   cssVars[`--chart-${key + 1}`] =
  //     cssVars[`--chart-${key + 1}`] ||
  //     `${cssVars["--primary"]} / ${100 - key * 20}%`
  // }

  return cssVars;
}

export function themeColorNameToCssVariable(name: string) {
  return `--${name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

export const THEME_LIST = [
  THEMES['default-shadcn'],
  THEMES.github,
  THEMES.catppuccin,
  // THEMES.linear,
  THEMES.ayu,
  THEMES.horizon,
  THEMES.everforest,
  THEMES.dune,
  THEMES['one-dark-pro'],
];

export type ThemeId = keyof typeof _THEMES;

export type Theme = {
  id: ThemeId;
  cssVars: {
    dark: Record<string, string>;
    light: Record<string, string>;
  };
  fontFamily: {
    body: {
      name: string;
      type: string;
    };
    heading: {
      name: string;
      type: string;
    };
  };
  colors: Record<string, string>;
  colorsDark: Record<string, string>;
  name: string;
  radius?: number;
};
