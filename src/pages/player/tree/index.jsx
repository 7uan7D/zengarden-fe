import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Leaf, ChevronDown, Grid, List } from "lucide-react"; // Thêm icon Grid và List
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import "../home/index.css";
import { GetAllTrees } from "@/services/apiServices/treesService";
import { GetUserTreeByOwnerId } from "@/services/apiServices/userTreesService";
import parseJwt from "@/services/parseJwt";
import { TradeTree } from "@/services/apiServices/treesService";
import { GetUserInfo } from "@/services/apiServices/userService";

const getTradeCoin = (rarity) => {
  switch (rarity) {
    case "legendary":
      return 300;
    case "epic":
      return 200;
    case "rare":
      return 100;
    case "common":
      return 50;
    default:
      return 0;
  }
};

const Tree = () => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userTrees, setUserTrees] = useState([]);
  const [balance, setBalance] = useState(0);
  const [openTreeDialog, setOpenTreeDialog] = useState(false);
  const [openTradeDialog, setOpenTradeDialog] = useState(false);
  const [selectedDesiredTreeId, setSelectedDesiredTreeId] = useState(null);
  const [requesterTreeId, setRequesterTreeId] = useState("");
  const [selectedTree, setSelectedTree] = useState(null);
  const [userTreeId, setUserTreeId] = useState("");

  const handleOpenTreeDialog = (tree) => {
    setSelectedTree(tree);
    setOpenTreeDialog(true);
  };

  const handleOpenTradeDialog = (treeId) => {
    setSelectedDesiredTreeId(treeId);
    setOpenTradeDialog(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const payload = parseJwt(token);
        const ownerId = payload?.sub;
        const [allTrees, ownedTrees, userInfo] = await Promise.all([
          GetAllTrees(),
          GetUserTreeByOwnerId(ownerId),
          GetUserInfo(ownerId),
        ]);

        setUserTrees(ownedTrees);
        setTrees(allTrees);
        setBalance(userInfo?.wallet?.balance || 0); // Giả sử balance nằm trong wallet
        console.log("Balance fetched:", userInfo?.wallet?.balance); // ✅ In ra giá trị đúng
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const res = await GetAllTrees();
        setTrees(res || []);
      } catch (error) {
        console.error("Failed to fetch trees", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrees();
  }, []);

  const treeData = {
    legendary: [],
    epic: [],
    rare: [],
    common: [],
  };

  trees.forEach((tree) => {
    const rarity = tree.rarity?.toLowerCase();

    // Tìm cây người dùng sở hữu trùng với treeId
    const ownedInstances = userTrees.filter(
      (ut) => ut.finalTreeId === tree.treeId
    );

    if (treeData[rarity]) {
      treeData[rarity].push({
        ...tree,
        id: tree.treeId,
        rarity: rarity,
        owned: ownedInstances.length > 0,
        image: tree.imageUrl, // map sang prop cần
        quantity: ownedInstances.length, // số lượng cây sở hữu
        description: tree.description ?? "No description available.",
      });
    }
  });
  const categoryStyles = {
    common: "text-gray-600",
    rare: "text-blue-600",
    epic: "text-purple-800",
    legendary: "text-orange-500",
  };

  const borderStyles = {
    common: "border-gray-600",
    rare: "border-blue-600",
    epic: "border-purple-800",
    legendary: "border-orange-500",
  };

  const [openCategories, setOpenCategories] = useState({
    legendary: true,
    epic: true,
    rare: true,
    common: true,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // Thêm state để chuyển đổi chế độ xem

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleTradeClick = async () => {
    if (!userTreeId) {
      alert("Bạn chưa chọn cây!");
      return;
    }

    const token = localStorage.getItem("token");
    const payload = parseJwt(token);
    const requesterId = payload?.sub;

    try {
      const result = await TradeTree({
        requesterId,
        requesterTreeId: parseInt(userTreeId), // NOTE: truyền userTreeId dưới tên requesterTreeId
        requestDesiredTreeId: selectedDesiredTreeId,
      });

      alert("Yêu cầu trade đã được gửi!");
      setOpenTradeDialog(false);
      setUserTreeId("");
      setSelectedDesiredTreeId(null);
    } catch (error) {
      console.error("Trade thất bại:", error);
      alert("Giao dịch thất bại. Vui lòng thử lại.");
    }
  };

  // Hàm lọc cây
  const filterTrees = (trees, category) => {
    return trees.filter((tree) => {
      const matchesSearch = tree.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesFilter = filter === "all" || category === filter;
      return matchesSearch && matchesFilter;
    });
  };

  const defaultOrder = ["legendary", "epic", "rare", "common"];

  const getOrderedCategories = () => {
    if (filter === "all") return defaultOrder;
    return [filter, ...defaultOrder.filter((cat) => cat !== filter)];
  };

  // Render danh sách cây theo chế độ List
  const renderListView = (category) => {
    const filteredTrees = filterTrees(treeData[category], category);
    if (filteredTrees.length === 0) return null;

    return (
      <Collapsible
        key={category}
        open={openCategories[category]}
        onOpenChange={() => toggleCategory(category)}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between mb-4 cursor-pointer">
            <h2
              className={`text-2xl font-semibold ${categoryStyles[category]}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${
                openCategories[category] ? "rotate-180" : ""
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTrees.map((tree) => (
              <TreeCard
                key={tree.id}
                tree={tree}
                balance={balance}
                onCardClick={() => handleOpenTreeDialog(tree)}
                onTradeClick={() => handleOpenTradeDialog(tree.id)}
                openTreeDialog={openTreeDialog}
                setOpenTreeDialog={setOpenTreeDialog}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Render danh sách cây theo chế độ Grid
  const renderGridView = () => {
    const allTrees = defaultOrder.flatMap((category) =>
      filterTrees(treeData[category], category)
    );
    /*.sort((a, b) => a.id - b.id); // Sắp xếp theo ID nếu muốn */

    if (allTrees.length === 0)
      return <p className="text-gray-500">No trees found.</p>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {allTrees.map((tree) => (
          <TreeCard
            key={tree.id}
            tree={tree}
            borderStyle={
              borderStyles[
                defaultOrder.find((cat) =>
                  treeData[cat].some((t) => t.id === tree.id)
                )
              ]
            }
            balance={balance}
            onCardClick={() => handleOpenTreeDialog(tree)}
            onTradeClick={() => handleOpenTradeDialog(tree.id)}
          />
        ))}
      </div>
    );
  };

  const desiredTree = trees.find((t) => t.treeId === selectedDesiredTreeId);
  const desiredRarity = desiredTree?.rarity?.toLowerCase();

  const ownedTradeableTrees = userTrees
    .filter((ut) => ut.finalTreeId) // chỉ lấy cây đã mint
    .map((ut) => {
      const baseTree = trees.find((t) => t.treeId === ut.finalTreeId);
      return {
        userTreeId: ut.userTreeId,
        finalTreeId: ut.finalTreeId,
        name: baseTree?.name || "Unknown",
        imageUrl: baseTree?.imageUrl || "/placeholder.png",
        rarity: baseTree?.rarity?.toLowerCase() || "unknown",
      };
    })
    .filter((tree) => tree.rarity === desiredRarity); // lọc theo độ hiếm

  return (
    <motion.div
      className="min-h-screen flex flex-col mt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-1">
        {/* Sidebar Filters */}
        <div
          className="w-64 p-4 bg-gray-50 dark:bg-gray-800 sticky top-[80px] 
              h-[calc(100vh-80px)] overflow-auto rounded-br-2xl rounded-tr-2xl shadow-lg 
              border border-gray-300 dark:border-gray-700 my-6"
        >
          <Dialog open={openTradeDialog} onOpenChange={setOpenTradeDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request for tree trade</DialogTitle>
                <DialogDescription>
                  Choose a tree of the same rarity to trade for the tree you
                  want.
                </DialogDescription>
              </DialogHeader>

              {ownedTradeableTrees.length === 0 ? (
                <p className="text-sm text-red-500 text-center mt-2">
                  You don't have any tree of the same rarity to trade.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto mt-2">
                  {ownedTradeableTrees.map((tree) => (
                    <div
                      key={tree.userTreeId}
                      className={`border rounded-lg p-2 cursor-pointer flex flex-col items-center transition hover:shadow ${
                        userTreeId === tree.userTreeId
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : ""
                      }`}
                      onClick={() => setUserTreeId(tree.userTreeId)}
                    >
                      <img
                        src={tree.imageUrl || "/fallback.png"}
                        alt={tree.name}
                        className="w-16 h-16 mb-1"
                      />
                      <p className="text-sm font-medium text-center">
                        {tree.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setOpenTradeDialog(false)}
                >
                  Huỷ
                </Button>
                <Button disabled={!userTreeId} onClick={handleTradeClick}>
                  Trade
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <Input
            placeholder="Search trees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left"
              >
                {filter === "all"
                  ? "All"
                  : filter.charAt(0).toUpperCase() + filter.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-gray-100 bg-white"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-gray-100 bg-white"
                  onClick={() => setFilter("common")}
                >
                  Common
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-gray-100 bg-white"
                  onClick={() => setFilter("rare")}
                >
                  Rare
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-gray-100 bg-white"
                  onClick={() => setFilter("epic")}
                >
                  Epic
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start hover:bg-gray-100 bg-white"
                  onClick={() => setFilter("legendary")}
                >
                  Legendary
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-800">Your Trees</h1>
            </div>
            {/* Nút chuyển đổi chế độ xem */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4 mr-2" /> List
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4 mr-2" /> Grid
              </Button>
            </div>
          </div>

          {/* Render theo chế độ xem */}
          {viewMode === "list" &&
            getOrderedCategories().map((category) => renderListView(category))}
          {viewMode === "grid" && renderGridView()}
        </div>
      </div>
    </motion.div>
  );
};

// Component TreeCard (đã thêm borderStyle prop)
const TreeCard = ({ tree, borderStyle, balance, onTradeClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const tradeCoin = getTradeCoin(tree.rarity);
  const canAfford = balance >= tradeCoin;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Card
            className={`p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow ${
              tree.owned ? "" : "grayscale brightness-75"
            } ${borderStyle ? `border-2 ${borderStyle}` : ""}`}
          >
            <CardContent className="text-center pb-0 relative w-full">
              {tree.owned && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                  {tree.quantity}
                </span>
              )}
              <img
                src={tree.image}
                alt={tree.name}
                className="w-24 h-24 mb-2 mx-auto"
              />
              <p
                className={`font-semibold ${
                  tree.owned ? "text-gray-800" : "text-gray-500"
                }`}
              >
                {tree.name}
              </p>

              {!tree.owned && (
                <Button
                  variant="outline"
                  className="mt-2 w-full text-xs bg-yellow-100 border-yellow-400 text-yellow-800 flex items-center justify-center gap-1"
                  disabled={!canAfford}
                  onClick={(e) => {
                    e.stopPropagation(); // Ngăn click lan ra card
                    onTradeClick(tree.id);
                  }}
                >
                  {canAfford ? "Looking for trade" : "Not enough coin"}
                  <img
                    src="/images/coin.png"
                    alt="coin"
                    className="w-4 h-4 align-middle"
                  />
                  {tradeCoin} coins
                </Button>
              )}
              <div className="relative w-full mt-2"></div>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="w-96">
          <DialogHeader>
            <DialogTitle className="sr-only">{tree.name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <img
              src={tree.image}
              alt={tree.name}
              className={`w-32 h-32 ${tree.owned ? "" : "opacity-50"}`}
            />
            <h3
              className={`text-lg font-semibold ${
                tree.owned ? "text-gray-800" : "text-gray-500"
              }`}
            >
              {tree.name}
            </h3>

            <p className="text-sm text-gray-500 text-center">
              {tree.description}
            </p>

            {tree.owned ? (
              <p className="text-sm text-green-600 font-semibold">
                Quantity: {tree.quantity}
              </p>
            ) : (
              <p className="text-sm text-red-500 font-semibold">Not Owned</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Tree;
