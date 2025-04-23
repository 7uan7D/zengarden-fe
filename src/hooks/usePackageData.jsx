import { useState, useEffect } from "react"
import { GetAllPackages } from "@/services/apiServices/packageService"

const usePackageData = () => {
    const [packageData, setPackageData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const data = await GetAllPackages()
                data.sort((a, b) => a.packageId - b.packageId)
                setPackageData(data)
                setIsLoading(false)
            } catch (err) {
                setError(err)
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    return { packageData, isLoading, error }
}

export default usePackageData