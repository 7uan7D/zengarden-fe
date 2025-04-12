// task_tree.jsx
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TreeSelectorDialog({
  isOpen,
  onOpenChange,
  userTrees,
  trees,
  setCurrentTree,
  setIsCreateTreeDialogOpen,
  addIcon,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-full flex gap-4 justify-center p-6 flex-wrap">
        <DialogTitle className="text-center w-full">
          Choose your tree
        </DialogTitle>
        {userTrees
          .filter(
            (tree) => tree.treeStatus === 0 || tree.treeStatus === 1
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
                className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  setCurrentTree(tree.userTreeId);
                  localStorage.setItem("selectedTreeId", tree.userTreeId);
                  onOpenChange(false);
                }}
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
          (tree) => tree.treeStatus === 1 || tree.treeStatus === 2
        ).length < 2 && (
          <div
            className="p-4 bg-white rounded-lg shadow-lg w-48 text-center cursor-pointer transition-transform hover:scale-105 flex flex-col items-center justify-center"
            onClick={() => {
              onOpenChange(false);
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
  );
}

export function CreateTreeDialog({
  isOpen,
  onOpenChange,
  newTreeName,
  setNewTreeName,
  isCreating,
  handleCreateTree,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
}

export function TreeInfoHeader({
  userTrees,
  currentTree,
  trees,
  treeExp,
  equippedItems,
  setIsTreeDialogOpen,
  setIsCreateTreeDialogOpen,
  addIcon,
  handleOpen, // Thêm props handleOpen
}) {
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

  return (
    <div className="bg-[#CCFFCC] text-black p-6 rounded-lg shadow-md mb-6 flex items-center gap-6 relative mt-6">
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
        <div className="w-32 h-32 mx-auto rounded-full border-4 border-green-300 shadow-md flex items-center justify-center hover:scale-110 transition-transform">
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
      <div className="flex-1 relative">
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
                const mediaUrl = itemDetail?.mediaUrl;

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
        {/* Thêm DropdownMenu */}
        <div className="absolute right-0 top-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-black text-white hover:bg-gray-800">
                Create Task
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpen("Simple Task", 2)}>
                Simple Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpen("Complex Task", 3)}>
                Complex Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}