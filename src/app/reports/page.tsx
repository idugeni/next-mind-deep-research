"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/reports")

        if (!response.ok) {
          throw new Error("Failed to fetch reports")
        }

        const data = await response.json()
        setReports(data.reports)
      } catch (error) {
        console.error("Error fetching reports:", error)
        toast({
          title: "Error",
          description: "Failed to load reports. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [toast])

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Research Reports</h1>
        <Link href="/">
          <Button>New Research</Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-xl font-medium mb-4">No reports yet</h2>
          <p className="text-muted-foreground mb-8">
            Start by searching for a topic and generating your first research report.
          </p>
          <Link href="/">
            <Button>Start Researching</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2">{report.title}</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">{report.summary}</p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Link href={`/reports/${report.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Report
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
