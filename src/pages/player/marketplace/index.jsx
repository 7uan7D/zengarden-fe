import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ShoppingCart, Play, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { GetTradeByStatus } from "@/services/apiServices/treesService";
import { GetAllTrees } from "@/services/apiServices/treesService";
import TradeDialog from "./TradeDialog";

// Danh sách các danh mục, bao gồm "Wallet"
const categories = [
  "Items",
  "Avatar",
  "Background",
  "Music",
  "Trade",
  "Package",
  "Wallet",
];

// Dữ liệu cứng cho các gói nạp
const packageData = [
  { price: "20.000đ", coins: 200, image: "/images/coin.png" },
  { price: "50.000đ", coins: 500, image: "/images/bunch_coin_1.png" },
  { price: "100.000đ", coins: 1000, image: "/images/bunch_coin_2.png" },
  { price: "200.000đ", coins: 2000, image: "/images/bag_coin.png" },
  { price: "500.000đ", coins: 5000, image: "/images/chest_coin.png" },
];

// Dữ liệu giả lập cho Transaction History
const transactionHistory = [
  { id: 1, date: "2025-04-01", description: "Purchased Oak Seed", amount: -10, status: "Completed" },
  { id: 2, date: "2025-04-03", description: "Reward for Task Completion", amount: 5, status: "Completed" },
  { id: 3, date: "2025-04-05", description: "Purchased Watering Can", amount: -15, status: "Completed" },
  { id: 4, date: "2025-04-07", description: "Daily Login Bonus", amount: 2, status: "Completed" },
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(categories[0]);
  const location = useLocation();
  const [tradeItems, setTradeItems] = useState([]);
  const [allTrees, setAllTrees] = useState([]);
  const [selectedTrade, setSelectedTrade] = useState(null);

  useEffect(() => {
    if (activeTab === "Trade") {
      const fetchTrades = async () => {
        try {
          const trades = await GetTradeByStatus(0);
          setTradeItems(trades);
        } catch (error) {
          console.error("Failed to fetch trade items:", error);
        }
      };
      fetchTrades();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchTrees = async () => {
      try {
        const trees = await GetAllTrees();
        setAllTrees(trees);
      } catch (error) {
        console.error("Failed to fetch all trees:", error);
      }
    };
    fetchTrees();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && categories.includes(tab)) {
      setActiveTab(tab);
      setFilter(tab.toLowerCase());
    }
  }, [location]);

  const handleFilterChange = (value) => {
    setFilter(value);
    const matchedCategory = categories.find(
      (cat) => cat.toLowerCase() === value.toLowerCase()
    );
    if (matchedCategory) {
      setActiveTab(matchedCategory);
    }
  };

  const getTradeCoin = (rarity) => {
    switch (rarity?.toLowerCase()) {
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

  const rarityColorMap = {
    common: "text-gray-600",
    rare: "text-blue-600",
    epic: "text-purple-800",
    legendary: "text-orange-500",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 pt-[80px]">
        <div
          className="w-64 p-4 bg-gray-50 dark:bg-gray-800 sticky top-[80px] 
              h-[calc(100vh-80px)] overflow-auto rounded-br-2xl rounded-tr-2xl shadow-lg 
              border border-gray-300 dark:border-gray-700 my-4"
        >
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <Input
            placeholder="Search items..."
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
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant="ghost"
                    className="justify-start hover:bg-gray-100 bg-white"
                    onClick={() => handleFilterChange(cat.toLowerCase())}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Marketplace</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Items */}
            <TabsContent value="Items">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <Popover open={isOpen}>
                        <PopoverTrigger
                          asChild
                          onMouseEnter={() => setIsOpen(true)}
                          onMouseLeave={() => setIsOpen(false)}
                        >
                          <Card className="relative overflow-hidden">
                            {i === 0 && (
                              <span
                                className="absolute top-1 left-[1px] bg-yellow-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Best Seller
                              </span>
                            )}
                            {i === 1 && (
                              <span
                                className="absolute top-0.5 left-[2px] bg-green-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Seasonal
                              </span>
                            )}
                            <CardContent className="flex flex-col items-center p-4 cursor-pointer">
                              <div className="h-20 w-20 bg-gray-300 rounded-lg mb-2" />
                              <p className="font-semibold">Items Item {i + 1}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <img
                                  src="/src/assets/images/coin.png"
                                  alt="Coin"
                                  className="w-5 h-5 mr-1"
                                />
                                100
                              </p>
                              <Button className="mt-2" variant="outline">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                              </Button>
                            </CardContent>
                          </Card>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 text-sm"
                          side="top"
                          align="center"
                        >
                          <p className="font-semibold">Items Item {i + 1}</p>
                          <p className="text-gray-500">
                            This is a description of the item. It provides
                            details about what this item does and why it’s
                            useful.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab Avatar */}
            <TabsContent value="Avatar">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <Popover open={isOpen}>
                        <PopoverTrigger
                          asChild
                          onMouseEnter={() => setIsOpen(true)}
                          onMouseLeave={() => setIsOpen(false)}
                        >
                          <Card className="relative overflow-hidden">
                            {i === 0 && (
                              <span
                                className="absolute top-1 left-[1px] bg-yellow-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Best Seller
                              </span>
                            )}
                            {i === 1 && (
                              <span
                                className="absolute top-0.5 left-[2px] bg-green-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Seasonal
                              </span>
                            )}
                            <CardContent className="flex flex-col items-center p-4 cursor-pointer">
                              <Avatar className="h-20 w-20 mb-2" />
                              <p className="font-semibold">Avatar Item {i + 1}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <img
                                  src="/src/assets/images/coin.png"
                                  alt="Coin"
                                  className="w-5 h-5 mr-1"
                                />
                                100
                              </p>
                              <Button className="mt-2" variant="outline">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                              </Button>
                            </CardContent>
                          </Card>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 text-sm"
                          side="top"
                          align="center"
                        >
                          <p className="font-semibold">Avatar Item {i + 1}</p>
                          <p className="text-gray-500">
                            This is a description of the item. It provides
                            details about what this item does and why it’s
                            useful.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab Background */}
            <TabsContent value="Background">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <Popover open={isOpen}>
                        <PopoverTrigger
                          asChild
                          onMouseEnter={() => setIsOpen(true)}
                          onMouseLeave={() => setIsOpen(false)}
                        >
                          <Card className="relative overflow-hidden">
                            {i === 0 && (
                              <span
                                className="absolute top-1 left-[1px] bg-yellow-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Best Seller
                              </span>
                            )}
                            {i === 1 && (
                              <span
                                className="absolute top-0.5 left-[2px] bg-green-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Seasonal
                              </span>
                            )}
                            <CardContent className="flex flex-col items-center p-4 cursor-pointer">
                              <div className="h-32 w-full bg-gray-300 rounded-lg mb-2" />
                              <p className="font-semibold">Background Item {i + 1}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <img
                                  src="/src/assets/images/coin.png"
                                  alt="Coin"
                                  className="w-5 h-5 mr-1"
                                />
                                100
                              </p>
                              <Button className="mt-2" variant="outline">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                              </Button>
                            </CardContent>
                          </Card>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 text-sm"
                          side="top"
                          align="center"
                        >
                          <p className="font-semibold">Background Item {i + 1}</p>
                          <p className="text-gray-500">
                            This is a description of the item. It provides
                            details about what this item does and why it’s
                            useful.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab Music */}
            <TabsContent value="Music">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <Popover open={isOpen}>
                        <PopoverTrigger
                          asChild
                          onMouseEnter={() => setIsOpen(true)}
                          onMouseLeave={() => setIsOpen(false)}
                        >
                          <Card className="relative overflow-hidden">
                            {i === 0 && (
                              <span
                                className="absolute top-1 left-[1px] bg-yellow-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Best Seller
                              </span>
                            )}
                            {i === 1 && (
                              <span
                                className="absolute top-0.5 left-[2px] bg-green-500 text-white text-xs font-bold px-5 py-1 
                                transform -rotate-45 -translate-x-6 translate-y-3 z-10 shadow"
                              >
                                Seasonal
                              </span>
                            )}
                            <CardContent className="flex flex-col items-center p-4 cursor-pointer">
                              <Button
                                variant="outline"
                                className="mb-2 bg-white"
                              >
                                <Play className="h-6 w-6" /> Play Preview
                              </Button>
                              <p className="font-semibold">Music Item {i + 1}</p>
                              <p className="text-sm text-gray-500 flex items-center">
                                <img
                                  src="/src/assets/images/coin.png"
                                  alt="Coin"
                                  className="w-5 h-5 mr-1"
                                />
                                100
                              </p>
                              <Button className="mt-2" variant="outline">
                                <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                              </Button>
                            </CardContent>
                          </Card>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-64 text-sm"
                          side="top"
                          align="center"
                        >
                          <p className="font-semibold">Music Item {i + 1}</p>
                          <p className="text-gray-500">
                            This is a description of the item. It provides
                            details about what this item does and why it’s
                            useful.
                          </p>
                        </PopoverContent>
                      </Popover>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Tab Trade */}
            <TabsContent value="Trade">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tradeItems.length > 0 ? (
                  tradeItems.map((item, i) => {
                    const treeInfo = allTrees.find(
                      (tree) => tree.treeId === item.treeAid
                    );
                    const desiredTree = allTrees.find(
                      (tree) => tree.treeId === item.desiredTreeAID
                    );
                    const rarityClass =
                      rarityColorMap[treeInfo?.rarity?.toLowerCase()] ||
                      "text-gray-400";
                    const coin = getTradeCoin(treeInfo?.rarity);

                    return (
                      <motion.div
                        key={item.id || i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                      >
                        <Card className="relative overflow-hidden">
                          <CardContent className="flex flex-col items-center p-4">
                            <img
                              src={
                                treeInfo?.imageUrl || "/images/default-tree.png"
                              }
                              alt={treeInfo?.name || "Tree"}
                              className="h-20 w-20 object-cover rounded-lg mb-2"
                            />
                            <p className={`font-semibold mb-1 ${rarityClass}`}>
                              {treeInfo?.rarity || "Unknown Rarity"}
                            </p>
                            <p className="font-semibold">
                              {treeInfo?.name || `Trade Item ${i + 1}`}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center space-x-2">
                              <span className="flex items-center">
                                <img
                                  src="/images/coin.png"
                                  alt="Coin"
                                  className="w-5 h-5 mr-1"
                                />
                                {coin}
                              </span>
                              {desiredTree && (
                                <img
                                  src={desiredTree.imageUrl}
                                  alt={desiredTree.name}
                                  className="w-8 h-8 rounded object-cover border border-gray-300"
                                />
                              )}
                            </p>
                            <Button
                              className="mt-2"
                              variant="outline"
                              onClick={() => setSelectedTrade(item)}
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" /> Trade
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })
                ) : (
                  <p>No trade items available.</p>
                )}
              </div>
              <TradeDialog
                open={!!selectedTrade}
                tradeItem={selectedTrade}
                onClose={() => setSelectedTrade(null)}
              />
            </TabsContent>

            {/* Tab Package */}
            <TabsContent value="Package">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {packageData.map((pkg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden">
                      <CardContent className="flex flex-col items-center p-4">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-semibold">
                            {pkg.coins}
                          </span>
                          <img
                            src="/images/coin.png"
                            alt="Coin"
                            className="w-5 h-5 ml-1"
                          />
                        </div>
                        <img
                          src={pkg.image}
                          alt={`Package ${pkg.price}`}
                          className="w-20 h-20 object-cover rounded-lg mb-2"
                          onError={(e) => {
                            e.target.src = "/images/default-package.png";
                          }}
                        />
                        <p className="font-semibold text-lg mb-2">{pkg.price}</p>
                        <Button className="mt-2" variant="outline">
                          <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Tab Wallet */}
            <TabsContent value="Wallet">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
                  <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {transactionHistory.map((transaction) => (
                      <li
                        key={transaction.id}
                        className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`font-medium ${
                              transaction.amount > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.amount > 0 ? "+" : ""}{transaction.amount} Coins
                          </span>
                          <span className="text-sm text-gray-600">{transaction.status}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}