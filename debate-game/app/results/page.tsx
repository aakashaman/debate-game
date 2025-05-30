"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, ArrowLeft } from "lucide-react"

type DebateResult = {
  teamA: string
  teamB: string
  votesA: number
  votesB: number
}

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<DebateResult[]>([])
  const [teamATotal, setTeamATotal] = useState(0)
  const [teamBTotal, setTeamBTotal] = useState(0)
  const [winner, setWinner] = useState<string>("")
  const [teamAssignments, setTeamAssignments] = useState<{ teamA: string[]; teamB: string[] } | null>(null)

  useEffect(() => {
    // Get results and team assignments from localStorage
    const storedResults = localStorage.getItem("debateResults")
    const storedTeamAssignments = localStorage.getItem("teamAssignments")

    if (storedResults && storedTeamAssignments) {
      const parsedResults = JSON.parse(storedResults)
      const parsedTeamAssignments = JSON.parse(storedTeamAssignments)

      setResults(parsedResults)
      setTeamAssignments(parsedTeamAssignments)

      // Calculate totals
      const teamAScore = parsedResults.reduce((total: number, result: DebateResult) => total + result.votesA, 0)
      const teamBScore = parsedResults.reduce((total: number, result: DebateResult) => total + result.votesB, 0)

      setTeamATotal(teamAScore)
      setTeamBTotal(teamBScore)

      // Determine winner
      if (teamAScore > teamBScore) {
        setWinner("Team A")
      } else if (teamBScore > teamAScore) {
        setWinner("Team B")
      } else {
        setWinner("It's a tie!")
      }
    } else {
      router.push("/")
    }
  }, [router])

  const startNewGame = () => {
    // Clear localStorage
    localStorage.removeItem("debateUsers")
    localStorage.removeItem("debatePairs")
    localStorage.removeItem("debateResults")
    localStorage.removeItem("teamAssignments")

    // Redirect to home
    router.push("/")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Debate Results</h1>

      {teamAssignments && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Team Assignments Revealed!</CardTitle>
            <CardDescription>Here are the teams that were competing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3 text-center">Team A</h3>
                <ul className="space-y-2">
                  {teamAssignments.teamA.map((member, index) => (
                    <li key={index} className="text-center py-1">
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3 text-center">Team B</h3>
                <ul className="space-y-2">
                  {teamAssignments.teamB.map((member, index) => (
                    <li key={index} className="text-center py-1">
                      {member}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Final Scores
          </CardTitle>
          <CardDescription>Total votes for each team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Team A</h3>
              <p className="text-5xl font-bold">{teamATotal}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-lg text-center">
              <h3 className="text-lg font-medium mb-2">Team B</h3>
              <p className="text-5xl font-bold">{teamBTotal}</p>
            </div>
          </div>

          <div className="text-center p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Winner</h3>
            <p className="text-4xl font-bold">{winner}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Individual Debate Results</CardTitle>
          <CardDescription>Results for each debate round</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={index} className="py-4">
                <div className="font-medium mb-1">Round {index + 1}</div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span>{result.teamA}</span>
                    <span className="font-bold">{result.votesA} votes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{result.teamB}</span>
                    <span className="font-bold">{result.votesB} votes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={startNewGame} size="lg" className="px-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Start New Game
        </Button>
      </div>
    </div>
  )
}
