"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Play, Pause, SkipForward, Clock } from "lucide-react"
import { saveDebateResults } from "@/lib/firebase"

type DebatePair = {
  teamA: string
  teamB: string
  topic: string
}

// Function to shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function createTeamsAndPairs(users: string[]) {
  const topics = [
    
    "Work from Home vs. Office Work – Which is more productive?",
"RCB vs CSK - which is a better team?",
"Cats vs. Dogs – Which makes a better pet?",
"Android vs. iOS – Which is the superior mobile platform?",
"Paper Notes vs. Digital Notes – Which helps you retain better?",
"Sweet Snacks vs. Savory Snacks – Which satisfies better?",
"Morning Person vs. Night Owl – Which is more productive?",
"Meetings: Essential or Overused?",
"Social Media: Connecting or Distracting?",
"Electric Cars vs. Traditional Cars - Which is better?",
"Morning Showers vs. Night Showers – Which is better?",
"Batman vs. Iron Man – Who’s more effective?",
"Solo Travel vs. Group Travel – What’s more enjoyable?",
"Dev Vs Sreedhar - Who is better?"

  ]

  const shuffledUsers = shuffleArray(users)
  const midpoint = Math.ceil(shuffledUsers.length / 2)

  const teamA = shuffledUsers.slice(0, midpoint)
  const teamB = shuffledUsers.slice(midpoint)

  // If odd number of users, duplicate one user from team A to team B
  if (teamA.length > teamB.length && teamA.length > 0) {
    teamB.push(teamA[0] + " (repeat)")
  }

  const pairs = []
  const shuffledTopics = shuffleArray([...topics])

  for (let i = 0; i < Math.min(teamA.length, teamB.length); i++) {
    pairs.push({
      teamA: teamA[i],
      teamB: teamB[i],
      topic: shuffledTopics[i % shuffledTopics.length],
    })
  }

  return {
    pairs,
    teamAssignments: { teamA, teamB },
  }
}

export default function DebatePage() {
  const router = useRouter()
  const [debatePairs, setDebatePairs] = useState<DebatePair[]>([])
  const [currentPairIndex, setCurrentPairIndex] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [teamAVotes, setTeamAVotes] = useState("")
  const [teamBVotes, setTeamBVotes] = useState("")
  const [results, setResults] = useState<{ teamA: string; teamB: string; votesA: number; votesB: number }[]>([])
  const [allDebatesCompleted, setAllDebatesCompleted] = useState(false)

  useEffect(() => {
    // Get users from localStorage and create teams and pairs
    const storedUsers = localStorage.getItem("debateUsers")
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers)
      const { pairs, teamAssignments } = createTeamsAndPairs(parsedUsers)
      setDebatePairs(pairs)
      // Store team assignments for results page
      localStorage.setItem("teamAssignments", JSON.stringify(teamAssignments))
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isTimerRunning && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [isTimerRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimeLeft(120)
  }

  const saveResults = async () => {
    if (!teamAVotes || !teamBVotes) return

    const currentPair = debatePairs[currentPairIndex]
    const newResult = {
      teamA: currentPair.teamA,
      teamB: currentPair.teamB,
      votesA: Number.parseInt(teamAVotes),
      votesB: Number.parseInt(teamBVotes),
    }

    const updatedResults = [...results, newResult]
    setResults(updatedResults)

    try {
      // Save to Firestore
      await saveDebateResults({
        debater1: currentPair.teamA,
        debater2: currentPair.teamB,
        topic: currentPair.topic,
        votes1: Number.parseInt(teamAVotes),
        votes2: Number.parseInt(teamBVotes),
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error saving to Firestore:", error)
    }

    // Move to next pair or finish
    if (currentPairIndex < debatePairs.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1)
      setTeamAVotes("")
      setTeamBVotes("")
      resetTimer()
    } else {
      // All debates completed
      setAllDebatesCompleted(true)
      localStorage.setItem("debateResults", JSON.stringify(updatedResults))
      router.push("/results")
    }
  }

  if (debatePairs.length === 0) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>
  }

  const currentPair = debatePairs[currentPairIndex]

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">
        Debate Round {currentPairIndex + 1}/{debatePairs.length}
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Debate</CardTitle>
          <CardDescription>Topic: {currentPair.topic}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Debater 1</h3>
              <p className="text-xl">{currentPair.teamA}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Debater 2</h3>
              <p className="text-xl">{currentPair.teamB}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Debate Timer
          </CardTitle>
          <CardDescription>Each debate lasts for 2 minutes</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-mono mb-6">{formatTime(timeLeft)}</div>
          <div className="flex justify-center gap-4">
            <Button onClick={toggleTimer} size="lg" variant={isTimerRunning ? "destructive" : "default"}>
              {isTimerRunning ? (
                <>
                  <Pause className="mr-2 h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" /> Start
                </>
              )}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg">
              <SkipForward className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vote Results</CardTitle>
          <CardDescription>Enter the number of votes for each debater</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium mb-2">Votes for {currentPair.teamA}</label>
              <Input
                type="number"
                min="0"
                value={teamAVotes}
                onChange={(e) => setTeamAVotes(e.target.value)}
                placeholder="Enter number of votes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Votes for {currentPair.teamB}</label>
              <Input
                type="number"
                min="0"
                value={teamBVotes}
                onChange={(e) => setTeamBVotes(e.target.value)}
                placeholder="Enter number of votes"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={saveResults} disabled={!teamAVotes || !teamBVotes}>
            {currentPairIndex < debatePairs.length - 1 ? "Save & Next Debate" : "Complete & View Results"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
