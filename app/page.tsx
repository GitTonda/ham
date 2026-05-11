import { GlobalNav } from "@/components/layout/GlobalNav";
import { GlobalSettings } from "@/components/modals/GlobalSettings";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <GlobalNav />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-6xl">
              {siteConfig.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-400">
              {siteConfig.description}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <div className="rounded-md bg-blue-600/10 px-3.5 py-2.5 text-sm font-semibold text-blue-500 shadow-sm border border-blue-600/20">
                System Ready
              </div>
            </div>
          </div>
        </div>
      </main>
      <GlobalSettings />
    </div>
  );
}
