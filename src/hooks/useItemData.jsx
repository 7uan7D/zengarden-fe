import { useState, useEffect } from "react"
import { GetAllItems } from "@/services/apiServices/itemService"

const useItemData = () => {
    const [itemData, setItemData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllItems()
                data.sort((a, b) => a.itemId - b.itemId)
                setItemData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { itemData, isLoading, error }
}

export default useItemData