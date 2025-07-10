"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  FolderOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Users,
  Edit,
  Trash2,
  Target,
  BarChart3,
  FileText,
  Pause,
  X,
  ArrowRight,
} from "lucide-react"
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

interface Project {
  id: string
  name: string
  description: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  priority: "low" | "medium" | "high"
  startDate: string
  endDate?: string
  progress: number
  todos: Todo[]
  notes: string
  createdAt: string
  completedAt?: string
}

interface Todo {
  id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "carried-over" | "cancelled" | "on-hold" | "completed"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string
  createdAt: string
  completedAt?: string
}

const projectStatuses = [
  { value: "planning", label: "Planning", color: "bg-gray-500" },
  { value: "in-progress", label: "In Progress", color: "bg-blue-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "on-hold", label: "On Hold", color: "bg-yellow-500" },
]

const todoStatuses = [
  { value: "not-started", label: "Not Started", color: "bg-gray-100 text-gray-800", icon: Circle },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-800", icon: Clock },
  { value: "carried-over", label: "Carried Over", color: "bg-orange-100 text-orange-800", icon: ArrowRight },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800", icon: X },
  { value: "on-hold", label: "On Hold", color: "bg-yellow-100 text-yellow-800", icon: Pause },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
]

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false)
  const [isAddTodoOpen, setIsAddTodoOpen] = useState(false)
  const [isEditTodoOpen, setIsEditTodoOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [activeView, setActiveView] = useState<"overview" | "project">("overview")

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "planning" as const,
    priority: "medium" as const,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  })

  const [editProject, setEditProject] = useState({
    name: "",
    description: "",
    status: "planning" as const,
    priority: "medium" as const,
    startDate: "",
    endDate: "",
    notes: "",
  })

  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    status: "not-started" as const,
    priority: "medium" as const,
    assignee: "",
    dueDate: "",
  })

  const [editTodo, setEditTodo] = useState({
    title: "",
    description: "",
    status: "not-started" as const,
    priority: "medium" as const,
    assignee: "",
    dueDate: "",
  })

  // Load projects from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem("projectManagement")
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }, [])

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem("projectManagement", JSON.stringify(projects))
  }, [projects])

  const addProject = () => {
    if (!newProject.name.trim()) return

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      priority: newProject.priority,
      startDate: newProject.startDate,
      endDate: newProject.endDate || undefined,
      progress: 0,
      todos: [],
      notes: newProject.notes,
      createdAt: new Date().toISOString(),
    }

    setProjects([...projects, project])
    setNewProject({
      name: "",
      description: "",
      status: "planning",
      priority: "medium",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      notes: "",
    })
    setIsAddProjectOpen(false)
  }

  const startEditProject = (project: Project) => {
    setEditProject({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      startDate: project.startDate,
      endDate: project.endDate || "",
      notes: project.notes,
    })
    setIsEditProjectOpen(true)
  }

  const saveEditProject = () => {
    if (!selectedProject || !editProject.name.trim()) return

    const updatedProject = {
      ...selectedProject,
      name: editProject.name,
      description: editProject.description,
      status: editProject.status,
      priority: editProject.priority,
      startDate: editProject.startDate,
      endDate: editProject.endDate || undefined,
      notes: editProject.notes,
      completedAt:
        editProject.status === "completed" && selectedProject.status !== "completed"
          ? new Date().toISOString()
          : selectedProject.completedAt,
    }

    setProjects(projects.map((p) => (p.id === selectedProject.id ? updatedProject : p)))
    setSelectedProject(updatedProject)
    setIsEditProjectOpen(false)
  }

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId))
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
      setActiveView("overview")
    }
  }

  const addTodo = () => {
    if (!selectedProject || !newTodo.title.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      status: newTodo.status,
      priority: newTodo.priority,
      assignee: newTodo.assignee || undefined,
      dueDate: newTodo.dueDate || undefined,
      createdAt: new Date().toISOString(),
    }

    const updatedProject = {
      ...selectedProject,
      todos: [...selectedProject.todos, todo],
    }

    setProjects(projects.map((p) => (p.id === selectedProject.id ? updatedProject : p)))
    setSelectedProject(updatedProject)
    setNewTodo({
      title: "",
      description: "",
      status: "not-started",
      priority: "medium",
      assignee: "",
      dueDate: "",
    })
    setIsAddTodoOpen(false)
  }

  const startEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setEditTodo({
      title: todo.title,
      description: todo.description,
      status: todo.status,
      priority: todo.priority,
      assignee: todo.assignee || "",
      dueDate: todo.dueDate || "",
    })
    setIsEditTodoOpen(true)
  }

  const saveEditTodo = () => {
    if (!selectedProject || !editingTodo || !editTodo.title.trim()) return

    const updatedTodos = selectedProject.todos.map((todo) =>
      todo.id === editingTodo.id
        ? {
            ...todo,
            title: editTodo.title,
            description: editTodo.description,
            status: editTodo.status,
            priority: editTodo.priority,
            assignee: editTodo.assignee || undefined,
            dueDate: editTodo.dueDate || undefined,
            completedAt:
              editTodo.status === "completed" && todo.status !== "completed"
                ? new Date().toISOString()
                : todo.completedAt,
          }
        : todo,
    )

    const updatedProject = { ...selectedProject, todos: updatedTodos }
    setProjects(projects.map((p) => (p.id === selectedProject.id ? updatedProject : p)))
    setSelectedProject(updatedProject)
    setEditingTodo(null)
    setIsEditTodoOpen(false)
  }

  const deleteTodo = (todoId: string) => {
    if (!selectedProject) return

    const updatedProject = {
      ...selectedProject,
      todos: selectedProject.todos.filter((t) => t.id !== todoId),
    }

    setProjects(projects.map((p) => (p.id === selectedProject.id ? updatedProject : p)))
    setSelectedProject(updatedProject)
  }

  const updateTodoStatus = (todoId: string, newStatus: Todo["status"]) => {
    if (!selectedProject) return

    const updatedTodos = selectedProject.todos.map((todo) => {
      if (todo.id === todoId) {
        return {
          ...todo,
          status: newStatus,
          completedAt: newStatus === "completed" ? new Date().toISOString() : undefined,
        }
      }
      return todo
    })

    const updatedProject = { ...selectedProject, todos: updatedTodos }
    setProjects(projects.map((p) => (p.id === selectedProject.id ? updatedProject : p)))
    setSelectedProject(updatedProject)
  }

  const calculateProjectProgress = (project: Project) => {
    if (project.todos.length === 0) return 0
    const completedTodos = project.todos.filter((t) => t.status === "completed").length
    return Math.round((completedTodos / project.todos.length) * 100)
  }

  const getProjectStats = () => {
    const total = projects.length
    const completed = projects.filter((p) => p.status === "completed").length
    const inProgress = projects.filter((p) => p.status === "in-progress").length
    const planning = projects.filter((p) => p.status === "planning").length
    const onHold = projects.filter((p) => p.status === "on-hold").length

    const totalTodos = projects.reduce((sum, p) => sum + p.todos.length, 0)
    const completedTodos = projects.reduce((sum, p) => sum + p.todos.filter((t) => t.status === "completed").length, 0)

    return { total, completed, inProgress, planning, onHold, totalTodos, completedTodos }
  }

  const getStatusInfo = (status: string) => {
    return projectStatuses.find((s) => s.value === status) || projectStatuses[0]
  }

  const getTodoStatusInfo = (status: string) => {
    return todoStatuses.find((s) => s.value === status) || todoStatuses[0]
  }

  const stats = getProjectStats()

  if (activeView === "project" && selectedProject) {
    const projectProgress = calculateProjectProgress(selectedProject)
    const statusInfo = getStatusInfo(selectedProject.status)

    return (
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setActiveView("overview")}>
            ← Back to Projects
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => startEditProject(selectedProject)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
            <Button onClick={() => setIsAddTodoOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add To-Do
            </Button>
          </div>
        </div>

        {/* Project Details */}
        <Card className={`border-l-4 ${statusInfo.color.replace("bg-", "border-")}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
                <CardDescription className="mt-2">{selectedProject.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className={`${statusInfo.color} text-white`}>
                  {statusInfo.label}
                </Badge>
                <Badge variant="secondary" className={priorityColors[selectedProject.priority]}>
                  {selectedProject.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="font-medium">{new Date(selectedProject.startDate).toLocaleDateString()}</p>
              </div>
              {selectedProject.endDate && (
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">{new Date(selectedProject.endDate).toLocaleDateString()}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">To-Dos</p>
                <p className="font-medium">
                  {selectedProject.todos.filter((t) => t.status === "completed").length} /{" "}
                  {selectedProject.todos.length} completed
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Project Progress</span>
                <span className="text-sm font-medium">{projectProgress}%</span>
              </div>
              <Progress value={projectProgress} className="h-2" />
            </div>
            {selectedProject.notes && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Project Notes
                </h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedProject.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* To-Dos */}
        <Card>
          <CardHeader>
            <CardTitle>To-Dos ({selectedProject.todos.length})</CardTitle>
            <CardDescription>Manage and track individual to-dos for this project</CardDescription>
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
                    {selectedProject.todos
                      .filter((todo) => filter === "all" || todo.status === filter)
                      .map((todo) => {
                        const isOverdue =
                          todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== "completed"
                        const statusInfo = getTodoStatusInfo(todo.status)
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
                                    {todo.description && (
                                      <p className="text-sm text-gray-600 mt-1">{todo.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="secondary" className={statusInfo.color}>
                                        {statusInfo.label}
                                      </Badge>
                                      <Badge variant="secondary" className={priorityColors[todo.priority]}>
                                        {todo.priority}
                                      </Badge>
                                      {todo.assignee && (
                                        <Badge variant="outline">
                                          <Users className="h-3 w-3 mr-1" />
                                          {todo.assignee}
                                        </Badge>
                                      )}
                                      {todo.dueDate && (
                                        <Badge
                                          variant="outline"
                                          className={isOverdue ? "border-red-500 text-red-600" : ""}
                                        >
                                          <Calendar className="h-3 w-3 mr-1" />
                                          {new Date(todo.dueDate).toLocaleDateString()}
                                          {isOverdue && " (Overdue)"}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-1 mt-2">
                                      <Select
                                        value={todo.status}
                                        onValueChange={(value: Todo["status"]) => updateTodoStatus(todo.id, value)}
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

                    {selectedProject.todos.filter((todo) => filter === "all" || todo.status === filter).length ===
                      0 && (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No {filter === "all" ? "" : filter.replace("-", " ")} to-dos
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {filter === "all"
                            ? "Add your first to-do to get started!"
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
              <DialogTitle>Add New To-Do</DialogTitle>
              <DialogDescription>Create a new to-do for {selectedProject.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="todoTitle">To-Do Title</Label>
                <Input
                  id="todoTitle"
                  placeholder="e.g., Design user interface"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="todoDescription">Description</Label>
                <Textarea
                  id="todoDescription"
                  placeholder="Describe the to-do in detail..."
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="todoStatus">Status</Label>
                  <Select
                    value={newTodo.status}
                    onValueChange={(value: Todo["status"]) => setNewTodo({ ...newTodo, status: value })}
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="todoAssignee">Assignee (Optional)</Label>
                  <Input
                    id="todoAssignee"
                    placeholder="Who's responsible?"
                    value={newTodo.assignee}
                    onChange={(e) => setNewTodo({ ...newTodo, assignee: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="todoDueDate">Due Date (Optional)</Label>
                  <Input
                    id="todoDueDate"
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  />
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
                  placeholder="e.g., Design user interface"
                  value={editTodo.title}
                  onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editTodoDescription">Description</Label>
                <Textarea
                  id="editTodoDescription"
                  placeholder="Describe the to-do in detail..."
                  value={editTodo.description}
                  onChange={(e) => setEditTodo({ ...editTodo, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTodoStatus">Status</Label>
                  <Select
                    value={editTodo.status}
                    onValueChange={(value: Todo["status"]) => setEditTodo({ ...editTodo, status: value })}
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTodoAssignee">Assignee (Optional)</Label>
                  <Input
                    id="editTodoAssignee"
                    placeholder="Who's responsible?"
                    value={editTodo.assignee}
                    onChange={(e) => setEditTodo({ ...editTodo, assignee: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editTodoDueDate">Due Date (Optional)</Label>
                  <Input
                    id="editTodoDueDate"
                    type="date"
                    value={editTodo.dueDate}
                    onChange={(e) => setEditTodo({ ...editTodo, dueDate: e.target.value })}
                  />
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

        {/* Edit Project Dialog */}
        <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update project details and settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editProjectName">Project Name</Label>
                <Input
                  id="editProjectName"
                  placeholder="e.g., Website Redesign"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editProjectDescription">Description</Label>
                <Textarea
                  id="editProjectDescription"
                  placeholder="Describe your project..."
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editProjectNotes">Project Notes</Label>
                <Textarea
                  id="editProjectNotes"
                  placeholder="Add notes, requirements, or important information..."
                  value={editProject.notes}
                  onChange={(e) => setEditProject({ ...editProject, notes: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editProjectStatus">Status</Label>
                  <Select
                    value={editProject.status}
                    onValueChange={(value: "planning" | "in-progress" | "completed" | "on-hold") =>
                      setEditProject({ ...editProject, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editProjectPriority">Priority</Label>
                  <Select
                    value={editProject.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setEditProject({ ...editProject, priority: value })
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editProjectStartDate">Start Date</Label>
                  <Input
                    id="editProjectStartDate"
                    type="date"
                    value={editProject.startDate}
                    onChange={(e) => setEditProject({ ...editProject, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editProjectEndDate">End Date (Optional)</Label>
                  <Input
                    id="editProjectEndDate"
                    type="date"
                    value={editProject.endDate}
                    onChange={(e) => setEditProject({ ...editProject, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEditProject} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
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
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Planning</p>
                <p className="text-2xl font-bold text-gray-600">{stats.planning}</p>
              </div>
              <Target className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Hold</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.onHold}</p>
              </div>
              <Circle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total To-Dos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.completedTodos}/{stats.totalTodos}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Project Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Projects</h2>
        <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Start a new project and track its progress</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="e.g., Website Redesign, Mobile App Development"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="Describe your project goals and objectives..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="projectNotes">Project Notes</Label>
                <Textarea
                  id="projectNotes"
                  placeholder="Add notes, requirements, or important information..."
                  value={newProject.notes}
                  onChange={(e) => setNewProject({ ...newProject, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectStatus">Status</Label>
                  <Select
                    value={newProject.status}
                    onValueChange={(value: "planning" | "in-progress" | "completed" | "on-hold") =>
                      setNewProject({ ...newProject, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="projectPriority">Priority</Label>
                  <Select
                    value={newProject.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setNewProject({ ...newProject, priority: value })
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectStartDate">Start Date</Label>
                  <Input
                    id="projectStartDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="projectEndDate">End Date (Optional)</Label>
                  <Input
                    id="projectEndDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addProject} className="flex-1">
                  Create Project
                </Button>
                <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const progress = calculateProjectProgress(project)
          const statusInfo = getStatusInfo(project.status)
          const isOverdue = project.endDate && new Date(project.endDate) < new Date() && project.status !== "completed"

          return (
            <Card
              key={project.id}
              className={`transition-all hover:shadow-lg cursor-pointer border-l-4 ${statusInfo.color.replace(
                "bg-",
                "border-",
              )} ${project.status === "completed" ? "ring-2 ring-green-200" : ""}`}
              onClick={() => {
                setSelectedProject(project)
                setActiveView("project")
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle
                      className={`text-lg ${project.status === "completed" ? "line-through text-gray-500" : ""}`}
                    >
                      {project.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={`${statusInfo.color} text-white text-xs`}>
                        {statusInfo.label}
                      </Badge>
                      <Badge variant="secondary" className={`${priorityColors[project.priority]} text-xs`}>
                        {project.priority}
                      </Badge>
                      {project.status === "completed" && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          ✓ Done
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {project.description && <CardDescription className="mt-2">{project.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{project.todos.length} to-dos</span>
                    <span>{project.todos.filter((t) => t.status === "completed").length} completed</span>
                  </div>

                  {project.notes && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FileText className="h-3 w-3" />
                      <span>Has notes</span>
                    </div>
                  )}

                  {project.endDate && (
                    <div className={`text-xs flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(project.endDate).toLocaleDateString()}
                      {isOverdue && <span className="font-medium">(Overdue)</span>}
                    </div>
                  )}

                  {project.completedAt && (
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed: {new Date(project.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first project to start tracking progress and managing to-dos.
          </p>
          <Button onClick={() => setIsAddProjectOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      )}
    </div>
  )
}
