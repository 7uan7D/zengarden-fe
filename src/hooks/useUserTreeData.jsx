import { useState, useEffect } from "react"
import { GetAllUserTrees } from "@/services/apiServices/userTreesService"

const useUserTreeData = () => {
    const [userTreeData, setUserTreeData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllUserTrees()
                data.sort((a, b) => a.userTreeId - b.userTreeId)
                setUserTreeData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { userTreeData, isLoading, error }
}

export default useUserTreeData