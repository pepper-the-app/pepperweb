# PepperWeb

A modern web application built with Next.js 15, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Deployment:** [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd pepperweb
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Project Structure

```
pepperweb/
├── app/              # App Router pages and layouts
├── public/           # Static assets
├── node_modules/     # Dependencies
├── .gitignore       # Git ignore file
├── next.config.ts   # Next.js configuration
├── package.json     # Project dependencies
├── tsconfig.json    # TypeScript configuration
├── tailwind.config.ts # Tailwind CSS configuration
└── vercel.json      # Vercel deployment configuration
```

## Deployment

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Deploy with zero configuration

## License

MIT
