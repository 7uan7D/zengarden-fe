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
import { GetTaskXPInfoById } from "@/services/apiServices/taskService";
import { GetBagItemsByUserId } from "@/services/apiServices/itemService";

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

  const currentTask = JSON.parse(localStorage.getItem("currentTask"));
  const taskId = currentTask?.taskId;
  const [taskXpInfo, setTaskXpInfo] = useState(null);

  useEffect(() => {
    const currentTask = JSON.parse(localStorage.getItem("currentTask"));
    const taskId = currentTask?.taskId;

    if (taskId) {
      GetTaskXPInfoById(taskId)
        .then((res) => setTaskXpInfo(res))
        .catch((err) => console.error("Error fetching XP info:", err));
    }
  }, []);

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
      const userId = payload?.sub;

      if (!userId) return;

      try {
        const items = await GetBagItemsByUserId(userId);
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

        // ✅ Lưu userTreeId của cây mới vào localStorage
        localStorage.setItem("selectedTreeId", result.userTreeId);

        // ✅ Cập nhật danh sách cây người dùng
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
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-green-50 text-black p-6 rounded-xl shadow-lg w-full max-w-3xl mx-auto transition hover:shadow-xl">
          {/* Ảnh cây */}
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
            <div className="w-40 h-40 rounded-full border-4 border-green-300 shadow flex items-center justify-center bg-white hover:scale-105 transition-transform">
              <img
                src={userTrees.length > 0 ? treeImageSrc : addIcon}
                alt="Tree"
                className={`object-contain ${
                  userTrees.length > 0 && (treeLevel === 1 || treeLevel === 2)
                    ? "w-12 h-12"
                    : "w-24 h-24"
                }`}
              />
            </div>
          </div>

          {/* Thông tin cây */}
          <div className="flex-1 w-full">
            {selectedTree ? (
              <div className="flex flex-col gap-3 bg-white/90 p-4 rounded-lg shadow-md backdrop-blur-md">
                {/* Tên cây + Level */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-green-700 flex items-center gap-1">
                    🌳 {selectedTree.name}
                  </h2>
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full shadow">
                    Level {selectedTree.levelId}
                  </span>
                </div>

                {/* Thanh XP */}
                {treeExp && (
                  <div className="flex flex-col gap-1">
                    <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                      {/* XP hiện tại (xanh dương đậm) */}
                      <div
                        style={{
                          width: `${
                            (treeExp.totalXp /
                              (treeExp.totalXp + treeExp.xpToNextLevel)) *
                            100
                          }%`,
                        }}
                        className="absolute left-0 top-0 h-full bg-blue-600 transition-all duration-300"
                      ></div>

                      {/* XP preview từ task (cam) */}
                      {taskXpInfo && (
                        <div
                          style={{
                            width: `${
                              (Math.min(
                                treeExp.totalXp + taskXpInfo.totalXp,
                                treeExp.totalXp + treeExp.xpToNextLevel
                              ) /
                                (treeExp.totalXp + treeExp.xpToNextLevel)) *
                              100
                            }%`,
                          }}
                          className="absolute left-0 top-0 h-full bg-orange-400 opacity-90 transition-all duration-300"
                        ></div>
                      )}
                    </div>

                    {/* Text tổng số XP */}
                    <span className="text-xs font-medium text-gray-700 text-center">
                      {selectedTree.levelId === 4
                        ? "Level Max"
                        : `${treeExp.totalXp} / ${
                            treeExp.totalXp + treeExp.xpToNextLevel
                          } XP`}
                    </span>

                    {/* XP sắp được nhận */}
                    {taskXpInfo && (
                      <span className="text-xs text-center text-orange-600 font-semibold">
                        +{taskXpInfo.totalXp.toFixed(2)} XP is about to be
                        received from the task
                        {taskXpInfo.bonusItemName &&
                          ` (included ${taskXpInfo.bonusItemName})`}
                      </span>
                    )}
                  </div>
                )}

                {/* Equipped Items */}
                <div className="flex flex-wrap gap-2 items-center mt-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Equipped Items:
                  </span>
                  {equippedItems.length > 0 ? (
                    equippedItems.map((item) => {
                      const { bagItemId, item: itemData } = item;
                      const { name, type, itemDetail } = itemData || {};
                      const mediaUrl = itemDetail?.mediaUrl;

                      return (
                        <span
                          key={bagItemId}
                          className="flex items-center gap-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full shadow hover:bg-green-600 transition"
                        >
                          {type !== 4 && mediaUrl && (
                            <img
                              src={mediaUrl}
                              alt={name}
                              className="w-4 h-4 object-contain"
                            />
                          )}
                          {name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs italic text-gray-500">
                      No items equipped
                    </span>
                  )}
                </div>
              </div>
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
