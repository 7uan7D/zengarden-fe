import { useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ShoppingCart, Play } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { motion } from "framer-motion";

const categories = ["Items", "Avatar", "Background", "Music", "Trade"];

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md">
        <Header />
      </div>

      <div className="flex flex-1 pt-[80px]">
        <div
          className="w-64 p-6 bg-gray-50 dark:bg-gray-800 sticky top-[80px] 
              h-[calc(100vh-80px)] overflow-auto rounded-tr-2xl shadow-lg 
              border border-gray-300 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold mb-4">Filters</h2>

          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Marketplace</h1>

          <Tabs defaultValue={categories[0]}>
            <TabsList className="mb-4">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat}>
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
                            <Card className="relative">
                              {i === 0 && (
                                <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
                                  Best Seller
                                </span>
                              )}
                              {i === 1 && (
                                <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow">
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
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
