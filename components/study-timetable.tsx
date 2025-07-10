"use client"

import { useState, useEffect } from "react"
import { Plus, Clock, BookOpen, Trash2, CheckCircle2, Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Checkbox } from "@/components/ui/checkbox"

interface Course {
  id: string
  name: string
  color: string
  description?: string
}

interface StudySession {
  id: string
  courseId: string
  day: string
  startTime: string
  endTime: string
  topics: Topic[]
  notes?: string
  date: string
}

interface Topic {
  id: string
  name: string
  completed: boolean
  notes?: string
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const courseColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-cyan-500",
]

export default function StudyTimetable() {
  const [courses, setCourses] = useState<Course[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false)
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false)
  const [isEditSessionOpen, setIsEditSessionOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<StudySession | null>(null)
  const [editForm, setEditForm] = useState({
    courseId: "",
    day: "Monday",
    startTime: "",
    endTime: "",
    topics: [] as Topic[],
    notes: "",
    date: "",
  })
  const [editTopic, setEditTopic] = useState("")

  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    color: courseColors[0],
  })

  const [newSession, setNewSession] = useState({
    courseId: "",
    day: "Monday",
    startTime: "",
    endTime: "",
    topics: [] as Topic[],
    notes: "",
    date: new Date().toISOString().split("T")[0],
  })

  const [newTopic, setNewTopic] = useState("")

  // Load data from localStorage
  useEffect(() => {
    const savedCourses = localStorage.getItem("studyCourses")
    const savedSessions = localStorage.getItem("studySessions")

    if (savedCourses) {
      setCourses(JSON.parse(savedCourses))
    }
    if (savedSessions) {
      setStudySessions(JSON.parse(savedSessions))
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("studyCourses", JSON.stringify(courses))
  }, [courses])

  useEffect(() => {
    localStorage.setItem("studySessions", JSON.stringify(studySessions))
  }, [studySessions])

  const addCourse = () => {
    if (!newCourse.name.trim()) return

    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name,
      description: newCourse.description,
      color: newCourse.color,
    }

    setCourses([...courses, course])
    setNewCourse({
      name: "",
      description: "",
      color: courseColors[0],
    })
    setIsAddCourseOpen(false)
  }

  const addTopicToNewSession = () => {
    if (!newTopic.trim()) return

    const topic: Topic = {
      id: Date.now().toString(),
      name: newTopic,
      completed: false,
    }

    setNewSession({
      ...newSession,
      topics: [...newSession.topics, topic],
    })
    setNewTopic("")
  }

  const removeTopicFromNewSession = (topicId: string) => {
    setNewSession({
      ...newSession,
      topics: newSession.topics.filter((t) => t.id !== topicId),
    })
  }

  const addStudySession = () => {
    if (!newSession.courseId || !newSession.startTime || !newSession.endTime) return

    const session: StudySession = {
      id: Date.now().toString(),
      courseId: newSession.courseId,
      day: newSession.day,
      startTime: newSession.startTime,
      endTime: newSession.endTime,
      topics: newSession.topics,
      notes: newSession.notes,
      date: newSession.date,
    }

    setStudySessions([...studySessions, session])
    setNewSession({
      courseId: "",
      day: "Monday",
      startTime: "",
      endTime: "",
      topics: [],
      notes: "",
      date: new Date().toISOString().split("T")[0],
    })
    setIsAddSessionOpen(false)
  }

  const toggleTopicCompletion = (sessionId: string, topicId: string) => {
    setStudySessions(
      studySessions.map((session) => {
        if (session.id === sessionId) {
          return {
            ...session,
            topics: session.topics.map((topic) =>
              topic.id === topicId ? { ...topic, completed: !topic.completed } : topic,
            ),
          }
        }
        return session
      }),
    )
  }

  const deleteSession = (sessionId: string) => {
    setStudySessions(studySessions.filter((s) => s.id !== sessionId))
  }

  const deleteCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId))
    setStudySessions(studySessions.filter((s) => s.courseId !== courseId))
  }

  const getCourse = (courseId: string) => {
    return courses.find((c) => c.id === courseId)
  }

  const getSessionsForDay = (day: string) => {
    return studySessions.filter((s) => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getTodaysSessions = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
    return getSessionsForDay(today)
  }

  const getWeeklyStats = () => {
    const totalSessions = studySessions.length
    const completedTopics = studySessions.reduce(
      (sum, session) => sum + session.topics.filter((t) => t.completed).length,
      0,
    )
    const totalTopics = studySessions.reduce((sum, session) => sum + session.topics.length, 0)

    return {
      totalSessions,
      completedTopics,
      totalTopics,
      completionRate: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
    }
  }

  const startEditSession = (session: StudySession) => {
    setEditingSession(session)
    setEditForm({
      courseId: session.courseId,
      day: session.day,
      startTime: session.startTime,
      endTime: session.endTime,
      topics: [...session.topics],
      notes: session.notes || "",
      date: session.date,
    })
    setIsEditSessionOpen(true)
  }

  const addTopicToEditSession = () => {
    if (!editTopic.trim()) return

    const topic: Topic = {
      id: Date.now().toString(),
      name: editTopic,
      completed: false,
    }

    setEditForm({
      ...editForm,
      topics: [...editForm.topics, topic],
    })
    setEditTopic("")
  }

  const removeTopicFromEditSession = (topicId: string) => {
    setEditForm({
      ...editForm,
      topics: editForm.topics.filter((t) => t.id !== topicId),
    })
  }

  const saveEditSession = () => {
    if (!editingSession || !editForm.courseId || !editForm.startTime || !editForm.endTime) return

    setStudySessions(
      studySessions.map((session) =>
        session.id === editingSession.id
          ? {
              ...session,
              courseId: editForm.courseId,
              day: editForm.day,
              startTime: editForm.startTime,
              endTime: editForm.endTime,
              topics: editForm.topics,
              notes: editForm.notes,
              date: editForm.date,
            }
          : session,
      ),
    )

    setEditingSession(null)
    setIsEditSessionOpen(false)
    setEditForm({
      courseId: "",
      day: "Monday",
      startTime: "",
      endTime: "",
      topics: [],
      notes: "",
      date: "",
    })
  }

  const cancelEditSession = () => {
    setEditingSession(null)
    setIsEditSessionOpen(false)
    setEditForm({
      courseId: "",
      day: "Monday",
      startTime: "",
      endTime: "",
      topics: [],
      notes: "",
      date: "",
    })
  }

  const stats = getWeeklyStats()

  return (
    <div className="space-y-6">
      {/* Study Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Topics Completed</p>
                <p className="text-2xl font-bold">
                  {stats.completedTopics}/{stats.totalTopics}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>Create a new course to add to your study schedule.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input
                  id="courseName"
                  placeholder="e.g., Mathematics, Physics, History"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="courseDescription">Description (Optional)</Label>
                <Textarea
                  id="courseDescription"
                  placeholder="Brief description of the course..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Course Color</Label>
                <div className="flex gap-2 mt-2">
                  {courseColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${color} ${
                        newCourse.color === color ? "ring-2 ring-gray-400" : ""
                      }`}
                      onClick={() => setNewCourse({ ...newCourse, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={addCourse} className="flex-1">
                  Add Course
                </Button>
                <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Study Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Study Session</DialogTitle>
              <DialogDescription>Schedule a new study session with topics to cover.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionCourse">Course</Label>
                  <Select
                    value={newSession.courseId}
                    onValueChange={(value) => setNewSession({ ...newSession, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sessionDay">Day</Label>
                  <Select
                    value={newSession.day}
                    onValueChange={(value) => setNewSession({ ...newSession, day: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sessionDate">Date</Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Topics to Cover</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a topic..."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTopicToNewSession()}
                  />
                  <Button type="button" onClick={addTopicToNewSession}>
                    Add
                  </Button>
                </div>
                {/* Make this section scrollable with max height */}
                <div className="mt-2 max-h-40 overflow-y-auto space-y-2 border rounded-md p-2 bg-gray-50">
                  {newSession.topics.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No topics added yet</p>
                  ) : (
                    newSession.topics.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm">{topic.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeTopicFromNewSession(topic.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="sessionNotes">Notes (Optional)</Label>
                <Textarea
                  id="sessionNotes"
                  placeholder="Additional notes for this session..."
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addStudySession} className="flex-1">
                  Add Session
                </Button>
                <Button variant="outline" onClick={() => setIsAddSessionOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditSessionOpen} onOpenChange={setIsEditSessionOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Study Session</DialogTitle>
              <DialogDescription>Update your study session details and topics.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editSessionCourse">Course</Label>
                  <Select
                    value={editForm.courseId}
                    onValueChange={(value) => setEditForm({ ...editForm, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editSessionDay">Day</Label>
                  <Select value={editForm.day} onValueChange={(value) => setEditForm({ ...editForm, day: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editStartTime">Start Time</Label>
                  <Input
                    id="editStartTime"
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editEndTime">End Time</Label>
                  <Input
                    id="editEndTime"
                    type="time"
                    value={editForm.endTime}
                    onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editSessionDate">Date</Label>
                  <Input
                    id="editSessionDate"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Topics to Cover</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add a topic..."
                    value={editTopic}
                    onChange={(e) => setEditTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTopicToEditSession()}
                  />
                  <Button type="button" onClick={addTopicToEditSession}>
                    Add
                  </Button>
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto space-y-2 border rounded-md p-2 bg-gray-50">
                  {editForm.topics.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No topics added yet</p>
                  ) : (
                    editForm.topics.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-sm">{topic.name}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeTopicFromEditSession(topic.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="editSessionNotes">Notes (Optional)</Label>
                <Textarea
                  id="editSessionNotes"
                  placeholder="Additional notes for this session..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEditSession} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={cancelEditSession}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {daysOfWeek.map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Courses Overview */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>Manage your courses and their schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${course.color}`} />
                    <div>
                      <p className="font-medium">{course.name}</p>
                      {course.description && <p className="text-sm text-gray-500">{course.description}</p>}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteCourse(course.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Sessions for Selected Day */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedDay} Schedule</CardTitle>
          <CardDescription>Your study sessions for {selectedDay}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getSessionsForDay(selectedDay).map((session) => {
              const course = getCourse(session.courseId)
              if (!course) return null

              const completedTopics = session.topics.filter((t) => t.completed).length
              const totalTopics = session.topics.length
              const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

              return (
                <Card
                  key={session.id}
                  className="border-l-4"
                  style={{ borderLeftColor: course.color.replace("bg-", "#") }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <CardDescription>
                          {session.startTime} - {session.endTime} • {new Date(session.date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {completedTopics}/{totalTopics} topics ({completionPercentage}%)
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => startEditSession(session)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSession(session.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.topics.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Topics to Cover:</h4>
                          <div className="space-y-2">
                            {session.topics.map((topic) => (
                              <div key={topic.id} className="flex items-center gap-3">
                                <Checkbox
                                  checked={topic.completed}
                                  onCheckedChange={() => toggleTopicCompletion(session.id, topic.id)}
                                />
                                <span className={topic.completed ? "line-through text-gray-500" : ""}>
                                  {topic.name}
                                </span>
                                {topic.completed && (
                                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                    ✓ Done
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {session.notes && (
                        <div>
                          <h4 className="font-medium mb-1">Notes:</h4>
                          <p className="text-sm text-gray-600">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {getSessionsForDay(selectedDay).length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions scheduled</h3>
                <p className="text-gray-500 mb-4">Add a study session for {selectedDay} to get started.</p>
                <Button onClick={() => setIsAddSessionOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Study Session
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
