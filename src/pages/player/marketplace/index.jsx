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

const categories = ["Items", "Avatar", "Background", "Music", "Trade", "Package"];

// Dữ liệu cứng cho các gói nạp
const packageData = [
  { price: "20.000đ", coins: 200, image: "/images/coin.png" },
  { price: "50.000đ", coins: 500, image: "/images/bunch_coin_1.png" },
  { price: "100.000đ", coins: 1000, image: "/images/bunch_coin_2.png" },
  { price: "200.000đ", coins: 2000, image: "/images/bag_coin.png" },
  { price: "500.000đ", coins: 5000, image: "/images/chest_coin.png" },
];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState(categories[0]); // Thêm state để điều khiển tab
  const location = useLocation();

  // Xử lý query parameter để chọn tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && categories.includes(tab)) {
      setActiveTab(tab);
      setFilter(tab.toLowerCase());
    }
  }, [location]);

  // Hàm xử lý khi chọn filter
  const handleFilterChange = (value) => {
    setFilter(value);
    // Nếu value khớp với một category, chuyển sang tab đó
    const matchedCategory = categories.find(
      (cat) => cat.toLowerCase() === value.toLowerCase()
    );
    if (matchedCategory) {
      setActiveTab(matchedCategory);
    }
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

          {/* Popover giống Tree */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left"
              >
                {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-1">
              <div className="flex flex-col gap-1">
                {/* Categories */}
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

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat}>
                {cat === "Package" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {packageData.map((pkg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        {/* Card của Package */}
                        <Card className="relative overflow-hidden">
                          <CardContent className="flex flex-col items-center p-4">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-semibold">{pkg.coins}</span>
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
                                e.target.src = "/images/default-package.png"; // Hình ảnh mặc định nếu không tải được
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
                ) : (
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
                                  {cat === "Avatar" ? (
                                    <Avatar className="h-20 w-20 mb-2" />
                                  ) : cat === "Background" ? (
                                    <div className="h-32 w-full bg-gray-300 rounded-lg mb-2" />
                                  ) : cat === "Music" ? (
                                    <Button
                                      variant="outline"
                                      className="mb-2 bg-white"
                                    >
                                      <Play className="h-6 w-6" /> Play Preview
                                    </Button>
                                  ) : (
                                    <div className="h-20 w-20 bg-gray-300 rounded-lg mb-2" />
                                  )}
                                  <p className="font-semibold">
                                    {cat} Item {i + 1}
                                  </p>
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
                              <p className="font-semibold">
                                {cat} Item {i + 1}
                              </p>
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
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}