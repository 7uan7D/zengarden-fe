import { useState, useEffect } from "react"
import { GetAllTransaction } from "@/services/apiServices/transactionService"

const useTransactionData = () => {
    const [transactionData, setTransactionData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllTransaction()
                data.sort((a, b) => a.transactionId - b.transactionId)
                setTransactionData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { transactionData, isLoading, error }
}

export default useTransactionData