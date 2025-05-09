import { Lock } from "lucide-react"
import SettingSection from "./SettingSection"
import ToggleSwitch from "./ToggleSwitch"
import { useState } from "react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

const Security = () => {
    const [twoFactor, setTwoFactor] = useState(false)
    const navigate = useNavigate();


    const handleLogout = () => {
        localStorage.removeItem("token");
        toast.success("Signed out!");
        navigate("/");
        window.location.reload();
    };

    return (
        <SettingSection icon={Lock} title={'Security'}>
            {/* <ToggleSwitch
                label={'Two-Factor Authentication'}
                isOn={twoFactor}
                onToggle={() => setTwoFactor(!twoFactor)}
            /> */}
            <div className='mt-4'>
                <button 
                    className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200'
                    onClick={handleLogout}>
                    Log out
                </button>
            </div>
        </SettingSection>
    )
}

export default Security