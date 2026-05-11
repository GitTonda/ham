import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-400">
          {siteConfig.description}
        </p>
      </div>
    </main>
  );
}
