import { User } from "lucide-react"
import SettingSection from "./SettingSection"
import { useEffect, useState } from "react";
import { GetUserInfo } from "@/services/apiServices/userService";
import parseJwt from "@/services/parseJwt";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const Profile = () => {
    const [user, setUser] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('https://github.com/shadcn.png');
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = parseJwt(token);
        const userId = decoded?.sub;
        if (!userId) return;
        GetUserInfo(userId)
            .then((data) => {
                setUser(data);
            })
            .catch((error) => console.log('Failed to load user:', error));
    }, []);

    return (
        <SettingSection icon={User} title={'Profile'}>
            <div className='flex flex-col sm:flex-row items-center mb-6'>
                <Avatar className='cursor-pointer rounded-full w-20 h-20 object-cover mr-4' >
                    <AvatarImage src={avatarUrl} alt='User Avatar' />
                    <AvatarFallback>
                        {user?.userName
                            ? user.userName.charAt(0).toUpperCase()
                            : 'U'}
                    </AvatarFallback>
                </Avatar>

                <div>
                    <h3 className='text-lg font-semibold text-gray-100'>{user?.userName || ''}</h3>
                    <p className='text-gray-400'>{user?.email || user?.phone}</p>
                </div>
            </div>

            {/* <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'>
                Edit Profile
            </button> */}
        </SettingSection>
    )
}

export default Profile