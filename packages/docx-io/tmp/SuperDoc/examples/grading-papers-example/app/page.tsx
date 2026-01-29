"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Home, Book, Users, Settings, Bell, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function NeedsGradingPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleAssignmentClick = (id: string) => {
    router.push(`/grading/${id}`)
  }

  const assignments = [
    {
      id: "assign-1",
      title: "Midterm Essay",
      course: "ENG101: Introduction to Composition",
      student: "Alex Johnson",
      submitted: "May 14, 2025 11:23 AM",
      dueDate: "May 12, 2025",
      attemptNumber: 1,
      status: "Late",
    },
    {
      id: "assign-2",
      title: "Research Proposal",
      course: "BIO220: Molecular Biology",
      student: "Jamie Smith",
      submitted: "May 13, 2025 9:45 AM",
      dueDate: "May 15, 2025",
      attemptNumber: 1,
      status: "On Time",
    },
    {
      id: "assign-3",
      title: "Problem Set 4",
      course: "MATH301: Differential Equations",
      student: "Taylor Wong",
      submitted: "May 12, 2025 4:30 PM",
      dueDate: "May 12, 2025",
      attemptNumber: 2,
      status: "On Time",
    },
    {
      id: "assign-4",
      title: "Case Study Analysis",
      course: "BUS250: Business Management",
      student: "Jordan Patel",
      submitted: "May 10, 2025 10:15 AM",
      dueDate: "May 9, 2025",
      attemptNumber: 1,
      status: "Late",
    },
    {
      id: "assign-5",
      title: "Final Project Draft",
      course: "CS400: Software Engineering",
      student: "Morgan Lee",
      submitted: "May 15, 2025 8:55 AM",
      dueDate: "May 20, 2025",
      attemptNumber: 1,
      status: "On Time",
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white mr-2 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Grading papers with SuperDoc</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>IN</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`bg-gray-800 text-white w-64 flex-shrink-0 ${sidebarOpen ? "block" : "hidden"} md:block`}>
          <nav className="p-4">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700">
                <Book className="mr-2 h-5 w-5" />
                Courses
              </Button>
              <div className="pl-7 space-y-1">
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 text-sm">
                  ENG101
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 text-sm">
                  BIO220
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 text-sm">
                  MATH301
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 text-sm">
                  BUS250
                </Button>
                <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 text-sm">
                  CS400
                </Button>
              </div>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700">
                <Users className="mr-2 h-5 w-5" />
                Students
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Needs Grading</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-1">
                  Filter <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="flex items-center gap-1">
                  Sort <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="font-medium">Items to Grade: {assignments.length}</h3>
              </div>
              <div className="divide-y">
                {assignments.map((assignment) => (
                  <Card
                    key={assignment.id}
                    className="rounded-none border-0 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAssignmentClick(assignment.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.course}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {assignment.student
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{assignment.student}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Submitted: {assignment.submitted} | Due: {assignment.dueDate} | Attempt:{" "}
                            {assignment.attemptNumber}
                          </div>
                        </div>
                        <Badge variant={assignment.status === "Late" ? "destructive" : "default"}>
                          {assignment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
