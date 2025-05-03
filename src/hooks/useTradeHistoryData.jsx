import { useState, useEffect } from "react"
import { GetAllTradeHistory } from "@/services/apiServices/tradeHistoryService"

const useTradeHistoryData = () => {
    const [tradeHistoryData, setTradeHistoryData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllTradeHistory()
                data.sort((a, b) => a.tradeId - b.tradeId)
                setTradeHistoryData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { tradeHistoryData, isLoading, error }
}

export default useTradeHistoryData