import { useState, useEffect } from "react"
import { GetAllUsers } from "@/services/apiServices/userService"

const useUserData = () => {
    const [userData, setUserData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllUsers()
                setUserData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { userData, isLoading, error }
}

export default useUserData