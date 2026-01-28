"use client"

import '@harbour-enterprises/superdoc/style.css'
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Save, Send, Download, Printer, Menu, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SuperDoc } from "@harbour-enterprises/superdoc"
import { use } from 'react';
import { docMap } from './_doc-links';

export default function GradingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [grade, setGrade] = useState(85)
  const [feedback, setFeedback] = useState("")

  const asyncParams = use(params)

  // Mock data for the selected assignment
  const assignment = {
    id: asyncParams.id,
    title:
      asyncParams.id === "assign-1"
        ? "Midterm Essay"
        : asyncParams.id === "assign-2"
          ? "Research Proposal"
          : asyncParams.id === "assign-3"
            ? "Problem Set 4"
            : asyncParams.id === "assign-4"
              ? "Case Study Analysis"
              : "Final Project Draft",
    course:
      asyncParams.id === "assign-1"
        ? "ENG101: Introduction to Composition"
        : asyncParams.id === "assign-2"
          ? "BIO220: Molecular Biology"
          : asyncParams.id === "assign-3"
            ? "MATH301: Differential Equations"
            : asyncParams.id === "assign-4"
              ? "BUS250: Business Management"
              : "CS400: Software Engineering",
    student:
      asyncParams.id === "assign-1"
        ? "Alex Johnson"
        : asyncParams.id === "assign-2"
          ? "Jamie Smith"
          : asyncParams.id === "assign-3"
            ? "Taylor Wong"
            : asyncParams.id === "assign-4"
              ? "Jordan Patel"
              : "Morgan Lee",
    submitted:
      asyncParams.id === "assign-1"
        ? "May 14, 2025 11:23 AM"
        : asyncParams.id === "assign-2"
          ? "May 13, 2025 9:45 AM"
          : asyncParams.id === "assign-3"
            ? "May 12, 2025 4:30 PM"
            : asyncParams.id === "assign-4"
              ? "May 10, 2025 10:15 AM"
              : "May 15, 2025 8:55 AM",
    dueDate:
      asyncParams.id === "assign-1"
        ? "May 12, 2025"
        : asyncParams.id === "assign-2"
          ? "May 15, 2025"
          : asyncParams.id === "assign-3"
            ? "May 12, 2025"
            : asyncParams.id === "assign-4"
              ? "May 9, 2025"
              : "May 20, 2025",
    status: asyncParams.id === "assign-1" || asyncParams.id === "assign-4" ? "Late" : "On Time",
    maxPoints: 100,
    rubric: [
      { id: "r1", criteria: "Content & Analysis", points: 40, description: "Depth of analysis and quality of content" },
      { id: "r2", criteria: "Organization & Structure", points: 25, description: "Logical flow and clear structure" },
      { id: "r3", criteria: "Evidence & Citations", points: 20, description: "Use of evidence and proper citations" },
      {
        id: "r4",
        criteria: "Grammar & Mechanics",
        points: 15,
        description: "Spelling, grammar, and writing mechanics",
      },
    ],
  }

  const handleDownload = () => {
   superDocRef.current.export({ commentsType: 'internal' });
   console.debug('SuperDoc export complete');
  };

  const handleBack = () => {
    router.push("/")
  }

  const handleSave = () => {
    // Save grading logic would go here
    alert("Grading saved as draft")
  }

  const handleSubmit = () => {
    // Submit grading logic would go here
    alert("Grading submitted successfully")
    router.push("/")
  }

  const superDocRef = useRef(null)

  const onReady = () => {
    console.debug('SuperDoc is ready!');
  };

  const initSuperDoc = async (fileToLoad = null) => {
    const { SuperDoc } = await import('@harbour-enterprises/superdoc');
  
    superDocRef.current = new SuperDoc({
      selector: '#superdoc',
      pagination: true,
      document: docMap[asyncParams.id],
      user: {
        name: 'Grading user',
        email: 'grader@school.com'
      },
      modules: {
        comments: {},
        toolbar:
        {
          selector: '#toolbar', 
          groups: {
            center: ['fontFamily', 'fontSize', 'bold', 'italic', 'color', 'highlight'],
            right: ['documentMode']
          }
        },
        
      },
      onReady,
    });
  };

  useEffect(() => {
    initSuperDoc();
  }, []);

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
        {/* Sidebar - only shown on mobile when toggled */}
        <aside
          className={`bg-gray-800 text-white w-64 flex-shrink-0 fixed inset-y-0 z-50 mt-14 transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
        >
          <nav className="p-4">{/* Sidebar content - same as main page */}</nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Button variant="ghost" onClick={handleBack} className="mb-2 hover:bg-gray-100">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Needs Grading
              </Button>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{assignment.title}</h2>
                  <p className="text-gray-600">{assignment.course}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {assignment.student
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{assignment.student}</span>
                    <Badge variant={assignment.status === "Late" ? "destructive" : "default"}>
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid-columns">
              {/* Document Viewer */}
              <div className="lg:col-span-2 left-col">
                <Card>
                  <CardHeader className="bg-gray-100 py-3">
                    <CardTitle className="text-base">Student Submission</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="superdoc-container">
                      <div id="toolbar"></div>
                      <div id="superdoc"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Grading Panel */}
              <div className="lg:col-span-1">
                <Tabs defaultValue="rubric">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rubric">Rubric</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    <TabsTrigger value="grade">Grade</TabsTrigger>
                  </TabsList>

                  <TabsContent value="rubric" className="mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {assignment.rubric.map((item) => (
                            <div key={item.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">{item.criteria}</h4>
                                  <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                                <span className="text-sm font-medium">{item.points} pts</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>0</span>
                                  <span>{item.points}</span>
                                </div>
                                <Slider defaultValue={[Math.floor(item.points * 0.8)]} max={item.points} step={1} />
                                <Input
                                  type="number"
                                  className="w-20 h-8 text-sm"
                                  defaultValue={Math.floor(item.points * 0.8)}
                                  min={0}
                                  max={item.points}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="feedback" className="mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="feedback" className="block text-sm font-medium mb-1">
                              Feedback to Student
                            </label>
                            <Textarea
                              id="feedback"
                              placeholder="Enter your feedback here..."
                              className="min-h-[200px]"
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor="private-notes" className="block text-sm font-medium mb-1">
                              Private Notes (not visible to student)
                            </label>
                            <Textarea
                              id="private-notes"
                              placeholder="Enter private notes here..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="grade" className="mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="grade" className="block text-sm font-medium mb-1">
                              Grade (out of {assignment.maxPoints})
                            </label>
                            <div className="flex items-center gap-4">
                              <Input
                                id="grade"
                                type="number"
                                className="w-24"
                                value={grade}
                                onChange={(e) => setGrade(Number(e.target.value))}
                                min={0}
                                max={assignment.maxPoints}
                              />
                              <span className="text-lg font-medium">{grade}%</span>
                            </div>
                          </div>

                          <div className="pt-4">
                            <h4 className="text-sm font-medium mb-2">Grade Summary</h4>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between py-1 text-sm">
                                <span>Content & Analysis:</span>
                                <span className="font-medium">32/40</span>
                              </div>
                              <div className="flex justify-between py-1 text-sm">
                                <span>Organization & Structure:</span>
                                <span className="font-medium">20/25</span>
                              </div>
                              <div className="flex justify-between py-1 text-sm">
                                <span>Evidence & Citations:</span>
                                <span className="font-medium">18/20</span>
                              </div>
                              <div className="flex justify-between py-1 text-sm">
                                <span>Grammar & Mechanics:</span>
                                <span className="font-medium">15/15</span>
                              </div>
                              <div className="flex justify-between py-1 mt-2 border-t text-sm font-medium">
                                <span>Total:</span>
                                <span>{grade}/100</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Grade
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
