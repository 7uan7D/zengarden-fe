import { useState, useEffect } from "react"
import { GetAllTrees } from "@/services/apiServices/treesService"

const useTreeData = () => {
    const [treeData, setTreeData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllTrees()
                data.sort((a, b) => a.treeId - b.treeId)
                setTreeData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { treeData, isLoading, error }
}

export default useTreeData