// src/components/TreeInfo.jsx
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUserExperience } from "@/context/UserExperienceContext";
import { useTreeExperience } from "@/context/TreeExperienceContext";
import parseJwt from "@/services/parseJwt";
import { GetAllTrees } from "@/services/apiServices/treesService";
import { GetBagItems } from "@/services/apiServices/itemService";
import addIcon from "/images/add.png";
import { GetUserTreeByUserId } from "@/services/apiServices/userTreesService";
import { CreateUserTree } from "@/services/apiServices/userTreesService";

const TreeInfo = ({ onTreeSelect }) => {
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [currentTree, setCurrentTree] = useState(0);
  const [userTrees, setUserTrees] = useState([]);
  const [trees, setTrees] = useState([]);
  const [isCreateTreeDialogOpen, setIsCreateTreeDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");
  const { refreshXp } = useUserExperience();
  const { treeExp, refreshTreeExp } = useTreeExperience();
  const [equippedItems, setEquippedItems] = useState([]);

  const selectedTree = userTrees.find(
    (tree) => tree.userTreeId === currentTree
  );
  const treeLevel = selectedTree?.levelId;
  const finalTreeId = selectedTree?.finalTreeId;
  const selectedFinalTree = trees.find((t) => t.treeId === finalTreeId);
  const treeImageSrc =
    treeLevel && treeLevel < 4
      ? `/images/lv${treeLevel}.png`
      : selectedFinalTree?.imageUrl || "/images/default.png";
  const progress = treeExp
    ? (treeExp.totalXp / (treeExp.totalXp + treeExp.xpToNextLevel)) * 100
    : 0;

  // Fetch trees
  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const allTrees = await GetAllTrees();
        setTrees(allTrees);
      } catch (error) {
        console.error("Error fetching trees:", error);
      }
    };
    fetchTrees();
  }, []);

  // Fetch user trees
  useEffect(() => {
    const fetchUserTrees = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const userId = parseJwt(token).sub;
        const responseData = await GetUserTreeByUserId(userId);
        if (responseData) {
          setUserTrees(responseData);
        }
      }
    };
    fetchUserTrees();
  }, []);

  // Set current tree
  useEffect(() => {
    if (userTrees.length > 0) {
      const savedTreeId = localStorage.getItem("selectedTreeId");
      const found = userTrees.find(
        (tree) => tree.userTreeId === parseInt(savedTreeId)
      );
      if (found) {
        setCurrentTree(found.userTreeId);
      } else {
        setCurrentTree(userTrees[0].userTreeId);
        localStorage.setItem("selectedTreeId", userTrees[0].userTreeId);
      }
    }
  }, [userTrees]);

  // Refresh tree experience
  useEffect(() => {
    console.log("Refreshing tree experience with currentTree:", currentTree);
    if (currentTree) {
      refreshTreeExp(currentTree);
    }
  }, [currentTree]);

  // Fetch equipped items
  useEffect(() => {
    const fetchEquippedItems = async () => {
      const token = localStorage.getItem("token");
      const payload = parseJwt(token);
      const bagId = payload?.sub;

      if (!bagId) return;

      try {
        const items = await GetBagItems(bagId);
        const filtered = items.filter((item) => item.isEquipped);
        setEquippedItems(filtered);
      } catch (err) {
        console.error("Failed to fetch bag items:", err);
      }
    };

    fetchEquippedItems();
  }, []);

  // Handle tree creation
  const handleCreateTree = async () => {
    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You are not logged in!");
        return;
      }
      const userId = parseJwt(token).sub;
      const result = await CreateUserTree(userId, newTreeName);
      if (result) {
        toast.success("Tree created successfully!");
        setIsCreateTreeDialogOpen(false);
        setNewTreeName("");
        const updatedUserTrees = await GetUserTreeByUserId(userId);
        setUserTrees(updatedUserTrees);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the tree!");
    } finally {
      setIsCreating(false);
      refreshXp();
      refreshTreeExp(currentTree);
    }
  };

  // Handle tree selection
  const handleTreeSelect = (userTreeId) => {
    setCurrentTree(userTreeId);
    localStorage.setItem("selectedTreeId", userTreeId);
    setIsTreeDialogOpen(false);
    if (onTreeSelect) {
      onTreeSelect(userTreeId);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border-2 border-green-300 shadow-lg h-[493px]">
      <CardContent className="p-6 h-full flex items-center justify-center">
        <div className="bg-[#CCFFCC] text-black p-6 rounded-lg shadow-md inline items-center gap-6 w-full h-full">
          <div
            className="relative cursor-pointer"
            onClick={() => {
              if (userTrees.length === 0) {
                setIsTreeDialogOpen(false);
                setIsCreateTreeDialogOpen(true);
              } else {
                setIsTreeDialogOpen(true);
              }
            }}
          >
            <div className="w-40 h-40 mx-auto rounded-full border-4 border-green-300 shadow-md flex items-center justify-center hover:scale-105 transition-transform">
              <img
                src={userTrees.length > 0 ? treeImageSrc : addIcon}
                className={`object-contain ${
                  userTrees.length > 0 && (treeLevel === 1 || treeLevel === 2)
                    ? "w-10 h-10"
                    : "w-30 h-30"
                }`}
              />
            </div>
          </div>

          <div className="flex-1">
            {selectedTree ? (
              <>
                <h2 className="text-3xl font-bold text-[#609994] tracking-wide flex items-center gap-3">
                  {selectedTree.name}
                  <span className="text-base font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shadow-inner">
                    Level {selectedTree.levelId}
                  </span>
                </h2>
                {treeExp && (
                  <div className="relative w-full mt-3 h-4 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-gradient-to-r from-[#a1d99b] via-[#f9d976] to-[#f49a8c] rounded-full"
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 drop-shadow-sm">
                      {selectedTree.levelId === 4
                        ? "Level Max"
                        : `${treeExp.totalXp} / ${
                            treeExp.totalXp + treeExp.xpToNextLevel
                          } XP`}
                    </span>
                  </div>
                )}
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">
                    Equipped Items:
                  </span>
                  {equippedItems.map((item) => {
                    const { bagItemId, item: itemData } = item;
                    const { name, type, itemDetail } = itemData || {};
                    const mediaUrl = itemData.itemDetail?.mediaUrl;

                    return (
                      <span
                        key={bagItemId}
                        className="text-xs bg-[#83aa6c] text-white px-3 py-1 rounded-full shadow hover:opacity-90 transition flex items-center"
                      >
                        {type !== 4 && mediaUrl && (
                          <img
                            src={mediaUrl}
                            alt={name}
                            className="w-5 h-5 mr-2 object-contain"
                          />
                        )}
                        {name}
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm italic text-gray-500">
                Haven't chosen any tree yet
              </p>
            )}
          </div>
        </div>

        {/* Tree Selection Dialog */}
        <Dialog open={isTreeDialogOpen} onOpenChange={setIsTreeDialogOpen}>
          <DialogContent className="max-w-xl w-full flex gap-4 justify-center p-6 flex-wrap">
            <DialogTitle className="text-center w-full">
              Choose your tree
            </DialogTitle>
            {userTrees
              .filter(
                (tree) =>
                  tree.treeStatus === 0 ||
                  tree.treeStatus === 1 ||
                  tree.treeStatus === 2
              )
              .map((tree) => {
                const totalNeeded = tree.totalXp + tree.xpToNextLevel;
                const progress =
                  totalNeeded > 0 ? (tree.totalXp / totalNeeded) * 100 : 0;
                const finalTree = trees.find(
                  (t) => t.treeId === tree.finalTreeId
                );
                const treeImageSrc =
                  tree.levelId < 4
                    ? `/images/lv${tree.levelId}.png`
                    : finalTree?.imageUrl || "/images/default.png";

                return (
                  <div
                    key={tree.userTreeId}
                    className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105 superb"
                    onClick={() => handleTreeSelect(tree.userTreeId)}
                  >
                    <div className="w-20 h-20 mx-auto rounded-full border-2 border-green-300 shadow-sm flex items-center justify-center">
                      <img
                        src={treeImageSrc}
                        alt={`${tree.name}`}
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <h3 className="font-bold mt-2">{tree.name}</h3>
                    <p>Level: {tree.levelId}</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-sm mt-1">
                      XP: {tree.totalXp} / {totalNeeded}
                    </p>
                  </div>
                );
              })}
            {userTrees.filter(
              (tree) =>
                tree.treeStatus === 1 ||
                tree.treeStatus === 2 ||
                tree.treeStatus === 0
            ).length < 2 && (
              <div
                className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  setIsTreeDialogOpen(false);
                  setIsCreateTreeDialogOpen(true);
                }}
              >
                <img
                  src={addIcon}
                  alt="Add New Tree"
                  className="w-20 h-20 mx-auto opacity-80 hover:opacity-100"
                />
                <h3 className="font-bold mt-2 text-green-600">
                  Create New Tree
                </h3>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Tree Dialog */}
        <Dialog
          open={isCreateTreeDialogOpen}
          onOpenChange={setIsCreateTreeDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new tree</DialogTitle>
              <DialogDescription>Fill in the tree details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="treeName">Tree Name</Label>
              <Input
                id="treeName"
                placeholder="Enter tree name"
                value={newTreeName}
                onChange={(e) => setNewTreeName(e.target.value)}
              />
              <Button
                onClick={handleCreateTree}
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TreeInfo;
