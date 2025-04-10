import { createContext, useContext, useState } from "react";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import parseJwt from "@/services/parseJwt";

const TreeExperienceContext = createContext();

export const TreeExperienceProvider = ({ children }) => {
  const [treeExp, setTreeExp] = useState(null);

  const refreshTreeExp = async (userTreeId) => {
    if (!userTreeId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const userId = parseJwt(token).sub;
      const userTrees = await GetUserTreeByUserId(userId);

      const treeData = userTrees.find((t) => t.userTreeId === userTreeId);
      if (treeData) {
        setTreeExp({
          totalXp: treeData.totalXp,
          levelId: treeData.levelId,
          xpToNextLevel: treeData.xpToNextLevel,
        });
      } else {
        console.error("Tree not found for given userTreeId");
      }
    } catch (err) {
      console.error("Error refreshing tree XP", err);
    }
  };

  return (
    <TreeExperienceContext.Provider
      value={{ treeExp, setTreeExp, refreshTreeExp }}
    >
      {children}
    </TreeExperienceContext.Provider>
  );
};

export const useTreeExperience = () => useContext(TreeExperienceContext);
