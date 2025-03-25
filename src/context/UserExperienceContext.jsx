import { createContext, useContext, useState, useEffect } from "react";
import parseJwt from "@/services/parseJwt";
import { GetUserExperiencesInfo } from "@/services/apiServices/userExperienceService";

const UserExperienceContext = createContext();

export const UserExperienceProvider = ({ children }) => {
  const [totalXp, setTotalXp] = useState(0);
  const [levelId, setLevelId] = useState(null);

  const loadExperience = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      const userId = decoded?.sub;
      if (userId) {
        try {
          const { totalXp, levelId } = await GetUserExperiencesInfo(userId);
          setTotalXp(totalXp);
          setLevelId(levelId);
        } catch (error) {
          console.error("Error loading XP:", error);
        }
      }
    }
  };

  useEffect(() => {
    loadExperience();
  }, []);

  return (
    <UserExperienceContext.Provider
      value={{ totalXp, levelId, refreshXp: loadExperience }}
    >
      {children}
    </UserExperienceContext.Provider>
  );
};

export const useUserExperience = () => useContext(UserExperienceContext);
