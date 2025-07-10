"use client"

import { useState, useEffect } from "react"
import { Trophy, Calendar, CheckCircle2, Target, BookOpen, FolderOpen, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Milestone {
  id: string
  title: string
  description: string
  type: "goal" | "project" | "study" | "daily-todo"
  completedAt: string
  category?: string
  priority?: string
  sourceId: string
}

export default function Milestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([])

  // Load and process milestones from all sources
  useEffect(() => {
    const loadMilestones = () => {
      const allMilestones: Milestone[] = []

      // Load completed goals
      const savedGoals = localStorage.getItem("lifeGoals")
      if (savedGoals) {
        const goals = JSON.parse(savedGoals)
        goals
          .filter((goal: any) => goal.status === "completed" && goal.completedAt)
          .forEach((goal: any) => {
            allMilestones.push({
              id: `goal-${goal.id}`,
              title: goal.title,
              description: goal.description || "Life goal completed",
              type: "goal",
              completedAt: goal.completedAt,
              category: goal.category,
              priority: goal.priority,
              sourceId: goal.id,
            })
          })
      }

      // Load completed projects and their todos
      const savedProjects = localStorage.getItem("projectManagement")
      if (savedProjects) {
        const projects = JSON.parse(savedProjects)

        // Completed projects
        projects
          .filter((project: any) => project.status === "completed" && project.completedAt)
          .forEach((project: any) => {
            allMilestones.push({
              id: `project-${project.id}`,
              title: project.name,
              description: project.description || "Project completed",
              type: "project",
              completedAt: project.completedAt,
              priority: project.priority,
              sourceId: project.id,
            })
          })

        // Completed project todos
        projects.forEach((project: any) => {
          project.todos
            ?.filter((todo: any) => todo.status === "completed" && todo.completedAt)
            .forEach((todo: any) => {
              allMilestones.push({
                id: `project-todo-${todo.id}`,
                title: `${project.name}: ${todo.title}`,
                description: todo.description || "Project task completed",
                type: "project",
                completedAt: todo.completedAt,
                priority: todo.priority,
                sourceId: todo.id,
              })
            })
        })
      }

      // Load completed study topics
      const savedSessions = localStorage.getItem("studySessions")
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions)
        sessions.forEach((session: any) => {
          session.topics
            ?.filter((topic: any) => topic.completed)
            .forEach((topic: any) => {
              allMilestones.push({
                id: `study-${topic.id}`,
                title: `Study: ${topic.name}`,
                description: `Completed study topic in ${session.courseId}`,
                type: "study",
                completedAt: new Date().toISOString(), // Approximate since we don't track completion time
                sourceId: topic.id,
              })
            })
        })
      }

      // Load completed daily todos
      const savedDailyTodos = localStorage.getItem("dailyTodos")
      if (savedDailyTodos) {
        const dailyTodos = JSON.parse(savedDailyTodos)
        dailyTodos
          .filter((todo: any) => todo.status === "completed" && todo.completedAt)
          .forEach((todo: any) => {
            allMilestones.push({
              id: `daily-todo-${todo.id}`,
              title: todo.title,
              description: todo.description || "Daily task completed",
              type: "daily-todo",
              completedAt: todo.completedAt,
              category: todo.category,
              priority: todo.priority,
              sourceId: todo.id,
            })
          })
      }

      // Sort by completion date (newest first)
      allMilestones.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

      setMilestones(allMilestones)
    }

    loadMilestones()

    // Set up interval to refresh milestones every 30 seconds
    const interval = setInterval(loadMilestones, 30000)
    return () => clearInterval(interval)
  }, [])

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "goal":
        return Target
      case "project":
        return FolderOpen
      case "study":
        return BookOpen
      case "daily-todo":
        return CheckCircle2
      default:
        return Star
    }
  }

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case "goal":
        return "bg-blue-500"
      case "project":
        return "bg-purple-500"
      case "study":
        return "bg-green-500"
      case "daily-todo":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "goal":
        return "Life Goal"
      case "project":
        return "Project"
      case "study":
        return "Study"
      case "daily-todo":
        return "Daily Task"
      default:
        return "Achievement"
    }
  }

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }

  const getStats = () => {
    const total = milestones.length
    const goals = milestones.filter((m) => m.type === "goal").length
    const projects = milestones.filter((m) => m.type === "project").length
    const study = milestones.filter((m) => m.type === "study").length
    const dailyTodos = milestones.filter((m) => m.type === "daily-todo").length

    // This week's milestones
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeek = milestones.filter((m) => new Date(m.completedAt) >= oneWeekAgo).length

    // This month's milestones
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const thisMonth = milestones.filter((m) => new Date(m.completedAt) >= oneMonthAgo).length

    return { total, goals, projects, study, dailyTodos, thisWeek, thisMonth }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Milestones & Achievements
        </h2>
        <p className="text-gray-600">Celebrate your completed goals, projects, studies, and daily tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.goals}</p>
              <p className="text-sm text-gray-600">Goals</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.projects}</p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.study}</p>
              <p className="text-sm text-gray-600">Study</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.dailyTodos}</p>
              <p className="text-sm text-gray-600">Daily Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{stats.thisWeek}</p>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{stats.thisMonth}</p>
              <p className="text-sm text-gray-600">This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>All your completed goals, projects, studies, and daily tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="goal">Goals</TabsTrigger>
              <TabsTrigger value="project">Projects</TabsTrigger>
              <TabsTrigger value="study">Study</TabsTrigger>
              <TabsTrigger value="daily-todo">Daily Tasks</TabsTrigger>
            </TabsList>

            {["all", "goal", "project", "study", "daily-todo"].map((filter) => (
              <TabsContent key={filter} value={filter} className="space-y-4">
                {milestones
                  .filter((milestone) => filter === "all" || milestone.type === filter)
                  .map((milestone) => {
                    const Icon = getMilestoneIcon(milestone.type)
                    const color = getMilestoneColor(milestone.type)

                    return (
                      <Card key={milestone.id} className={`border-l-4 ${color.replace("bg-", "border-")}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${color}`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{milestone.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className={`${color} text-white text-xs`}>
                                  {getTypeLabel(milestone.type)}
                                </Badge>
                                {milestone.priority && (
                                  <Badge
                                    variant="secondary"
                                    className={`${priorityColors[milestone.priority as keyof typeof priorityColors]} text-xs`}
                                  >
                                    {milestone.priority}
                                  </Badge>
                                )}
                                {milestone.category && (
                                  <Badge variant="outline" className="text-xs">
                                    {milestone.category}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(milestone.completedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                {milestones.filter((milestone) => filter === "all" || milestone.type === filter).length === 0 && (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No {filter === "all" ? "" : getTypeLabel(filter).toLowerCase()} milestones yet
                    </h3>
                    <p className="text-gray-500">
                      {filter === "all"
                        ? "Complete goals, projects, studies, or daily tasks to see your achievements here!"
                        : `Complete some ${getTypeLabel(filter).toLowerCase()}s to see your milestones here!`}
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
