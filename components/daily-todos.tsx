"use client"

import { useState, useEffect } from "react"
import { Plus, CheckCircle2, Circle, Clock, Edit, Trash2, Target, ArrowRight, X, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DailyTodo {
  id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "carried-over" | "cancelled" | "on-hold" | "completed"
  priority: "low" | "medium" | "high"
  category: string
  date: string
  createdAt: string
  completedAt?: string
}

const todoStatuses = [
  { value: "not-started", label: "Not Started", color: "bg-gray-100 text-gray-800", icon: Circle },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Clock },
  { value: "carried-over", label: "Carried Over", color: "bg-orange-100 text-orange-800", icon: ArrowRight },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800", icon: X },
  { value: "on-hold", label: "On Hold", color: "bg-yellow-100 text-yellow-800", icon: Pause },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
]

const categories = [
  { value: "work", label: "Work", color: "bg-blue-500" },
  { value: "personal", label: "Personal", color: "bg-green-500" },
  { value: "health", label: "Health", color: "bg-red-500" },
  { value: "learning", label: "Learning", color: "bg-purple-500" },
  { value: "errands", label: "Errands", color: "bg-orange-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
]

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export default function DailyTodos() {
  const [todos, setTodos] = useState<DailyTodo[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false)
  const [isEditTodoOpen, setIsEditTodoOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<DailyTodo | null>(null)

  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    status: "not-started" as const,
    priority: "medium" as const,
    category: "personal",
  })

  const [editTodo, setEditTodo] = useState({
    title: "",
    description: "",
    status: "not-started" as const,
    priority: "medium" as const,
    category: "personal",
  })

  // Load todos from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem("dailyTodos")
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
  }, [])

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem("dailyTodos", JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!newTodo.title.trim()) return

    const todo: DailyTodo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      status: newTodo.status,
      priority: newTodo.priority,
      category: newTodo.category,
      date: selectedDate,
      createdAt: new Date().toISOString(),
    }

    setTodos([...todos, todo])
    setNewTodo({
      title: "",
      description: "",
      status: "not-started",
      priority: "medium",
      category: "personal",
    })
    setIsAddTodoOpen(false)
  }

  const startEditTodo = (todo: DailyTodo) => {
    setEditingTodo(todo)
    setEditTodo({
      title: todo.title,
      description: todo.description,
      status: todo.status,
      priority: todo.priority,
      category: todo.category,
    })
    setIsEditTodoOpen(true)
  }

  const saveEditTodo = () => {
    if (!editingTodo || !editTodo.title.trim()) return

    setTodos(
      todos.map((todo) =>
        todo.id === editingTodo.id
          ? {
              ...todo,
              title: editTodo.title,
              description: editTodo.description,
              status: editTodo.status,
              priority: editTodo.priority,
              category: editTodo.category,
              completedAt:
                editTodo.status === "completed" && todo.status !== "completed"
                  ? new Date().toISOString()
                  : todo.completedAt,
            }
          : todo,
      ),
    )

    setEditingTodo(null)
    setIsEditTodoOpen(false)
  }

  const deleteTodo = (todoId: string) => {
    setTodos(todos.filter((t) => t.id !== todoId))
  }

  const updateTodoStatus = (todoId: string, newStatus: DailyTodo["status"]) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === todoId) {
          return {
            ...todo,
            status: newStatus,
            completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
          }
        }
        return todo
      }),
    )
  }

  const carryOverTodos = () => {
    const incompleteTodos = todos.filter(
      (todo) =>
        todo.date === selectedDate &&
        todo.status !== "completed" &&
        todo.status !== "cancelled" &&
        todo.status !== "carried-over",
    )

    const carriedOverTodos = incompleteTodos.map((todo) => ({
      ...todo,
      id: Date.now().toString() + Math.random().toString(),
      status: "carried-over" as const,
      date: new Date(new Date(selectedDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }))

    setTodos([...todos, ...carriedOverTodos])
  }

  const getTodosForDate = (date: string) => {
    return todos.filter((todo) => todo.date === date)
  }

  const getTodayStats = () => {
    const todayTodos = getTodosForDate(selectedDate)
    const total = todayTodos.length
    const completed = todayTodos.filter((t) => t.status === "completed").length
    const inProgress = todayTodos.filter((t) => t.status === "in-progress").length
    const notStarted = todayTodos.filter((t) => t.status === "not-started").length
    const carriedOver = todayTodos.filter((t) => t.status === "carried-over").length
    const onHold = todayTodos.filter((t) => t.status === "on-hold").length
    const cancelled = todayTodos.filter((t) => t.status === "cancelled").length

    return { total, completed, inProgress, notStarted, carriedOver, onHold, cancelled }
  }

  const getStatusInfo = (status: string) => {
    return todoStatuses.find((s) => s.value === status) || todoStatuses[0]
  }

  const getCategoryInfo = (category: string) => {
    return categories.find((c) => c.value === category) || categories[categories.length - 1]
  }

  const stats = getTodayStats()
  const todayTodos = getTodosForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily To-Dos</h2>
          <p className="text-gray-600">Manage your daily tasks and track progress</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-40" />
          <Button onClick={carryOverTodos} variant="outline">
            <ArrowRight className="h-4 w-4 mr-2" />
            Carry Over
          </Button>
          <Button onClick={() => setIsAddTodoOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add To-Do
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
              <p className="text-sm text-gray-600">Not Started</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.carriedOver}</p>
              <p className="text-sm text-gray-600">Carried Over</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.onHold}</p>
              <p className="text-sm text-gray-600">On Hold</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* To-Dos */}
      <Card>
        <CardHeader>
          <CardTitle>
            To-Dos for{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </CardTitle>
          <CardDescription>Manage your daily tasks and track their progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="not-started">Not Started</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="carried-over">Carried Over</TabsTrigger>
              <TabsTrigger value="on-hold">On Hold</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            {["all", "not-started", "in-progress", "carried-over", "on-hold", "cancelled", "completed"].map(
              (filter) => (
                <TabsContent key={filter} value={filter} className="space-y-4">
                  {todayTodos
                    .filter((todo) => filter === "all" || todo.status === filter)
                    .map((todo) => {
                      const statusInfo = getStatusInfo(todo.status)
                      const categoryInfo = getCategoryInfo(todo.category)
                      const StatusIcon = statusInfo.icon

                      return (
                        <Card key={todo.id} className={todo.status === "completed" ? "opacity-75" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <StatusIcon className="h-5 w-5 mt-0.5 text-gray-500" />
                                <div className="flex-1">
                                  <h4
                                    className={`font-medium ${
                                      todo.status === "completed" || todo.status === "cancelled"
                                        ? "line-through text-gray-500"
                                        : ""
                                    }`}
                                  >
                                    {todo.title}
                                  </h4>
                                  {todo.description && <p className="text-sm text-gray-600 mt-1">{todo.description}</p>}
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className={statusInfo.color}>
                                      {statusInfo.label}
                                    </Badge>
                                    <Badge variant="secondary" className={priorityColors[todo.priority]}>
                                      {todo.priority}
                                    </Badge>
                                    <Badge variant="secondary" className={`${categoryInfo.color} text-white text-xs`}>
                                      {categoryInfo.label}
                                    </Badge>
                                  </div>
                                  <div className="flex gap-1 mt-2">
                                    <Select
                                      value={todo.status}
                                      onValueChange={(value: DailyTodo["status"]) => updateTodoStatus(todo.id, value)}
                                    >
                                      <SelectTrigger className="w-40 h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {todoStatuses.map((status) => (
                                          <SelectItem key={status.value} value={status.value}>
                                            {status.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => startEditTodo(todo)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => deleteTodo(todo.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}

                  {todayTodos.filter((todo) => filter === "all" || todo.status === filter).length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No {filter === "all" ? "" : filter.replace("-", " ")} to-dos
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {filter === "all"
                          ? "Add your first to-do for today!"
                          : `No to-dos in ${filter.replace("-", " ")} status.`}
                      </p>
                      <Button onClick={() => setIsAddTodoOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add To-Do
                      </Button>
                    </div>
                  )}
                </TabsContent>
              ),
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Todo Dialog */}
      <Dialog open={isAddTodoOpen} onOpenChange={setIsAddTodoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Daily To-Do</DialogTitle>
            <DialogDescription>Create a new to-do for {new Date(selectedDate).toLocaleDateString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="todoTitle">To-Do Title</Label>
              <Input
                id="todoTitle"
                placeholder="e.g., Review project proposal"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="todoDescription">Description</Label>
              <Textarea
                id="todoDescription"
                placeholder="Add details about this to-do..."
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="todoStatus">Status</Label>
                <Select
                  value={newTodo.status}
                  onValueChange={(value: DailyTodo["status"]) => setNewTodo({ ...newTodo, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {todoStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="todoPriority">Priority</Label>
                <Select
                  value={newTodo.priority}
                  onValueChange={(value: "low" | "medium" | "high") => setNewTodo({ ...newTodo, priority: value })}
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
              <div>
                <Label htmlFor="todoCategory">Category</Label>
                <Select value={newTodo.category} onValueChange={(value) => setNewTodo({ ...newTodo, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="flex gap-2">
              <Button onClick={addTodo} className="flex-1">
                Add To-Do
              </Button>
              <Button variant="outline" onClick={() => setIsAddTodoOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Todo Dialog */}
      <Dialog open={isEditTodoOpen} onOpenChange={setIsEditTodoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit To-Do</DialogTitle>
            <DialogDescription>Update to-do details and progress</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTodoTitle">To-Do Title</Label>
              <Input
                id="editTodoTitle"
                placeholder="e.g., Review project proposal"
                value={editTodo.title}
                onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="editTodoDescription">Description</Label>
              <Textarea
                id="editTodoDescription"
                placeholder="Add details about this to-do..."
                value={editTodo.description}
                onChange={(e) => setEditTodo({ ...editTodo, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editTodoStatus">Status</Label>
                <Select
                  value={editTodo.status}
                  onValueChange={(value: DailyTodo["status"]) => setEditTodo({ ...editTodo, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {todoStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editTodoPriority">Priority</Label>
                <Select
                  value={editTodo.priority}
                  onValueChange={(value: "low" | "medium" | "high") => setEditTodo({ ...editTodo, priority: value })}
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
              <div>
                <Label htmlFor="editTodoCategory">Category</Label>
                <Select
                  value={editTodo.category}
                  onValueChange={(value) => setEditTodo({ ...editTodo, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEditTodo} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditTodoOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
