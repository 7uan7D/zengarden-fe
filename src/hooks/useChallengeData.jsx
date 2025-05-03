import { useState, useEffect } from "react"
import { GetAllChallenges } from "@/services/apiServices/challengeService"

const useChallengeData = () => {
    const [challengeData, setChallengeData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllChallenges()
                data.sort((a, b) => a.challengeId - b.challengeId)
                setChallengeData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { challengeData, isLoading, error }
}

export default useChallengeData