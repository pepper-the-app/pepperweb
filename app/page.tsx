export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          PepperWeb
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Welcome to your new Next.js project with TypeScript and Tailwind CSS
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="https://nextjs.org/docs"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn Next.js
          </a>
          <a
            href="https://vercel.com/new"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deploy on Vercel
          </a>
        </div>
      </div>
    </main>
  );
}
