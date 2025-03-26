import { useState, useEffect } from "react"
import { GetAllTasks } from "@/services/apiServices/taskService"

const useTaskData = () => {
    const [taskData, setTaskData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllTasks()
                setTaskData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { taskData, isLoading, error }
}

export default useTaskData