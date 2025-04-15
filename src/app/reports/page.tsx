"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"
import type { Report } from "@/types/report"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingReports, setDeletingReports] = useState<Map<string, boolean>>(new Map())

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
        toast.error("Error", {
          description: "Failed to load reports. Please try again."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [])

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
            <Card key={report.id} className="flex flex-col hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-xl">{report.title}</CardTitle>
                <CardDescription className="text-sm opacity-75">
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">{report.summary}</p>
              </CardContent>
              <CardFooter className="mt-auto pt-4 flex flex-row justify-between gap-2">
                <Link href={`/reports/${report.id}`} className="flex-1">
                  <Button variant="outline" className="w-full hover:bg-primary hover:text-secondary-foreground transition-colors">
                    View Report
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-10 h-10 p-0" disabled={deletingReports.get(report.id)}>
                      {deletingReports.get(report.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Report</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus report ini? Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            setDeletingReports(new Map(deletingReports.set(report.id, true)))
                            const response = await fetch(`/api/reports/${report.id}`, {
                              method: 'DELETE',
                            })

                            if (!response.ok) {
                              throw new Error('Gagal menghapus report')
                            }

                            setReports((prevReports) =>
                              prevReports.filter((r) => r.id !== report.id)
                            )
                            toast.success('Report berhasil dihapus')
                          } catch (error) {
                            toast.error('Error', {
                              description: 'Gagal menghapus report. Silakan coba lagi.',
                            })
                          } finally {
                            setDeletingReports(new Map(deletingReports.delete(report.id) ? deletingReports : deletingReports))
                          }
                        }}
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
