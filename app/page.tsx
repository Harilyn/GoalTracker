"use client"

import { useState, useEffect } from "react"
import { Plus, Target, Calendar, CheckCircle2, Circle, Search, TrendingUp, BookOpen, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import StudyTimetable from "@/components/study-timetable"
import AuthWrapper from "@/components/auth-wrapper"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed"
  progress: number
  targetDate?: string
  createdAt: string
  completedAt?: string
}

const categories = [
  { value: "career", label: "Career", color: "bg-blue-500" },
  { value: "health", label: "Health & Fitness", color: "bg-green-500" },
  { value: "travel", label: "Travel & Adventure", color: "bg-purple-500" },
  { value: "learning", label: "Learning & Skills", color: "bg-orange-500" },
  { value: "relationships", label: "Relationships", color: "bg-pink-500" },
  { value: "finance", label: "Financial", color: "bg-emerald-500" },
  { value: "personal", label: "Personal Growth", color: "bg-indigo-500" },
  { value: "creative", label: "Creative", color: "bg-yellow-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
]

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

function LifeGoalsApp() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
    targetDate: "",
  })
  const [activeTab, setActiveTab] = useState<"goals" | "study">("goals")

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
    targetDate: "",
  })

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem("lifeGoals")
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [])

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem("lifeGoals", JSON.stringify(goals))
  }, [goals])

  const addGoal = () => {
    if (!newGoal.title.trim()) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      status: "not-started",
      progress: 0,
      targetDate: newGoal.targetDate || undefined,
      createdAt: new Date().toISOString(),
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      targetDate: "",
    })
    setIsAddGoalOpen(false)
  }

  const updateGoalProgress = (id: string, progress: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const updatedGoal = { ...goal, progress }
          if (progress === 100 && goal.status !== "completed") {
            updatedGoal.status = "completed"
            updatedGoal.completedAt = new Date().toISOString()
          } else if (progress > 0 && progress < 100) {
            updatedGoal.status = "in-progress"
          } else if (progress === 0) {
            updatedGoal.status = "not-started"
          }
          return updatedGoal
        }
        return goal
      }),
    )
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const startEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setEditForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.targetDate || "",
    })
    setIsEditGoalOpen(true)
  }

  const saveEditGoal = () => {
    if (!editingGoal || !editForm.title.trim()) return

    setGoals(
      goals.map((goal) =>
        goal.id === editingGoal.id
          ? {
              ...goal,
              title: editForm.title,
              description: editForm.description,
              category: editForm.category,
              priority: editForm.priority,
              targetDate: editForm.targetDate || undefined,
            }
          : goal,
      ),
    )

    setEditingGoal(null)
    setIsEditGoalOpen(false)
    setEditForm({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      targetDate: "",
    })
  }

  const cancelEditGoal = () => {
    setEditingGoal(null)
    setIsEditGoalOpen(false)
    setEditForm({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      targetDate: "",
    })
  }

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || goal.category === filterCategory
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    total: goals.length,
    completed: goals.filter((g) => g.status === "completed").length,
    inProgress: goals.filter((g) => g.status === "in-progress").length,
    notStarted: goals.filter((g) => g.status === "not-started").length,
    averageProgress: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0,
  }

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find((cat) => cat.value === categoryValue) || categories[categories.length - 1]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Life Goals & Study Tracker</h1>
          <p className="text-gray-600">Track your dreams, achieve your goals, and manage your studies</p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "goals" | "study")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Life Goals
            </TabsTrigger>
            <TabsTrigger value="study" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Study Timetable
            </TabsTrigger>
          </TabsList>

          <TabsContent value="goals">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Goals</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                    </div>
                    <Circle className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Not Started</p>
                      <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
                    </div>
                    <Circle className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Progress</p>
                      <p className="text-2xl font-bold text-indigo-600">{stats.averageProgress}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search goals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Goal</DialogTitle>
                    <DialogDescription>
                      Create a new life goal or bucket list item to track your progress.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Goal Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Learn to play guitar"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your goal in detail..."
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newGoal.category}
                          onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newGoal.priority}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setNewGoal({ ...newGoal, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="targetDate">Target Date (Optional)</Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addGoal} className="flex-1">
                        Add Goal
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Goal</DialogTitle>
                    <DialogDescription>Update your goal details and track your progress.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Goal Title</Label>
                      <Input
                        id="edit-title"
                        placeholder="e.g., Learn to play guitar"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        placeholder="Describe your goal in detail..."
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-category">Category</Label>
                        <Select
                          value={editForm.category}
                          onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-priority">Priority</Label>
                        <Select
                          value={editForm.priority}
                          onValueChange={(value: "low" | "medium" | "high") =>
                            setEditForm({ ...editForm, priority: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="edit-targetDate">Target Date (Optional)</Label>
                      <Input
                        id="edit-targetDate"
                        type="date"
                        value={editForm.targetDate}
                        onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveEditGoal} className="flex-1">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={cancelEditGoal}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.map((goal) => {
                const categoryInfo = getCategoryInfo(goal.category)
                const isOverdue =
                  goal.targetDate && new Date(goal.targetDate) < new Date() && goal.status !== "completed"

                return (
                  <Card
                    key={goal.id}
                    className={`transition-all hover:shadow-lg ${goal.status === "completed" ? "ring-2 ring-green-200" : ""}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle
                            className={`text-lg ${goal.status === "completed" ? "line-through text-gray-500" : ""}`}
                          >
                            {goal.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className={`${categoryInfo.color} text-white text-xs`}>
                              {categoryInfo.label}
                            </Badge>
                            <Badge variant="secondary" className={`${priorityColors[goal.priority]} text-xs`}>
                              {goal.priority}
                            </Badge>
                            {goal.status === "completed" && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                ✓ Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {goal.description && <CardDescription className="mt-2">{goal.description}</CardDescription>}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                              disabled={goal.progress === 0}
                            >
                              -10%
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                              disabled={goal.progress === 100}
                            >
                              +10%
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEditGoal(goal)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteGoal(goal.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>

                        {goal.targetDate && (
                          <div
                            className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}
                          >
                            <Calendar className="h-3 w-3" />
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                            {isOverdue && <span className="font-medium">(Overdue)</span>}
                          </div>
                        )}

                        {goal.completedAt && (
                          <div className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed: {new Date(goal.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredGoals.length === 0 && (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
                <p className="text-gray-500 mb-4">
                  {goals.length === 0
                    ? "Start by adding your first life goal or bucket list item!"
                    : "Try adjusting your search or filters to find your goals."}
                </p>
                <Button onClick={() => setIsAddGoalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Goal
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="study">
            <StudyTimetable />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function LifeGoalsTracker() {
  return (
    <AuthWrapper>
      <LifeGoalsApp />
    </AuthWrapper>
  )
}
