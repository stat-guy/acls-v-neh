import { Act1OneGrant } from "./Act1OneGrant"
import { Act2TheWave } from "./Act2TheWave"
import { Act3WhoDecided } from "./Act3WhoDecided"
import { Act4TheMap } from "./Act4TheMap"
import { Act5Contradictions } from "./Act5Contradictions"
import { Act6WhatWasLost } from "./Act6WhatWasLost"

export function StoryPage() {
  return (
    <div className="bg-black text-white">
      {/* Hero / Title */}
      <header className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            1,477 Grants.
            <br />
            22 Days.
            <br />
            One Algorithm.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400">
            How DOGE used ChatGPT to terminate half of the National Endowment
            for the Humanities in three weeks.
          </p>
          <p className="mt-8 animate-bounce text-sm text-gray-500">
            Scroll to begin ↓
          </p>
        </div>
      </header>

      {/* Acts */}
      <Act1OneGrant />
      <Act2TheWave />
      <Act3WhoDecided />
      <Act4TheMap />
      <Act5Contradictions />
      <Act6WhatWasLost />
    </div>
  )
}
