"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Trophy, Clock, MessageSquare } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [users, setUsers] = useState<string[]>([])

  const addUser = () => {
    if (userName.trim() && !users.includes(userName.trim())) {
      setUsers([...users, userName.trim()])
      setUserName("")
    }
  }

  const removeUser = (index: number) => {
    const newUsers = [...users]
    newUsers.splice(index, 1)
    setUsers(newUsers)
  }

  const startGame = () => {
    if (users.length >= 2) {
      // Store users in localStorage for now
      localStorage.setItem("debateUsers", JSON.stringify(users))
      router.push("/debate")
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Debate Game</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Add Participants
            </CardTitle>
            <CardDescription>Enter the names of all participants who will be debating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter participant name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addUser()}
              />
              <Button onClick={addUser}>Add</Button>
            </div>

            {users.length > 0 ? (
              <div className="border rounded-md">
                <div className="p-3 bg-muted font-medium">Participants ({users.length})</div>
                <ul className="divide-y">
                  {users.map((user, index) => (
                    <li key={index} className="flex items-center justify-between p-3">
                      <span>{user}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeUser(index)}>
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">No participants added yet</div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={startGame} disabled={users.length < 2}>
              Start Game
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
            <CardDescription>Follow these steps to play the debate game</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 list-decimal list-inside">
              <li className="flex items-start gap-3">
                <Users className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Add all participant names who will be debating</span>
              </li>
              <li className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>The system will randomly create debate pairs and assign topics</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Each debate lasts for 2 minutes with a countdown timer</span>
              </li>
                <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Win the debate in 2 mins, you get 10 votes - The other person should agree to your statement</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>If the debate isn't conclusive, we will have a voting. Respective votes will go to each person.</span>
              </li>

              <li className="flex items-start gap-3">
                <Trophy className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Vote for each debater and see which team wins at the end</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
