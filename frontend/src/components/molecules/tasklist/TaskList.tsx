import { useMemo } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Task, ITaskList } from './Task'
import { useChatData } from '@chainlit/react-client';


interface HeaderProps {
  status: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const Header = ({ status }: HeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="font-semibold">Tasks</div>
      <Badge variant="secondary">{status || '?'}</Badge>
    </CardHeader>
  )
}

interface TaskListProps {
  isMobile: boolean
}

const TaskList = ({ isMobile }: TaskListProps) => {
  const { tasklists } = useChatData()
  const tasklist = tasklists[tasklists.length - 1]

  // We remove the base URL since the useApi hook is already set with a base URL.
  // This ensures we only pass the relative path and search parameters to the hook.
  const url = useMemo(() => {
    if (!tasklist?.url) return null
    const parsedUrl = new URL(tasklist.url)
    return parsedUrl.pathname + parsedUrl.search
  }, [tasklist?.url])

  const { error, data, isLoading } = useSWR<ITaskList>(url, fetcher, {
    keepPreviousData: true
  })

  if (!url) return null

  if (isLoading && !data) {
    return <div>Loading tasks...</div>
  }

  if (error) {
    return <div>Error loading tasks</div>
  }

  const content = data as ITaskList
  if (!content) return null

  const tasks = content.tasks

  if (isMobile) {
    // Get the first running or ready task, or the latest task
    let highlightedTaskIndex = tasks.length - 1
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].status === 'running' || tasks[i].status === 'ready') {
        highlightedTaskIndex = i
        break
      }
    }
    const highlightedTask = tasks?.[highlightedTaskIndex]

    return (
      <aside className="w-full p-4 md:hidden">
        <Card>
          <Header status={content.status} />
          {highlightedTask && (
            <CardContent>
              <Task index={highlightedTaskIndex + 1} task={highlightedTask} />
            </CardContent>
          )}
        </Card>
      </aside>
    )
  }

  return (
    <aside className="hidden w-96 shrink-0 md:block">
      <Card>
        <Header status={content?.status} />
        <CardContent>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {tasks?.map((task, index) => (
              <Task key={index} index={index + 1} task={task} />
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  )
}

export { TaskList }