import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Leaf, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "../home/index.css";

// Dữ liệu mẫu cho danh sách cây
const treeData = {
  legendary: [
    { id: 19, name: "Tree of Life", image: "/tree-19.png", level: 4, xp: 0, maxXp: 0, description: "A mythical tree of eternal vitality.", owned: true },
    { id: 20, name: "Golden Apple", image: "/tree-20.png", level: 1, xp: 0, maxXp: 100, description: "Bears fruit of pure gold.", owned: false },
  ],
  epic: [
    { id: 15, name: "Baobab", image: "/tree-15.png", level: 1, xp: 0, maxXp: 100, description: "Massive trunk stores water for years.", owned: false },
    { id: 16, name: "Sequoia", image: "/tree-16.png", level: 1, xp: 0, maxXp: 100, description: "One of the tallest trees in the world.", owned: false },
    { id: 17, name: "Dragon Tree", image: "/tree-17.png", level: 3, xp: 1700, maxXp: 2000, description: "Exotic with red sap like blood.", owned: true },
    { id: 18, name: "Ginkgo", image: "/tree-18.png", level: 1, xp: 0, maxXp: 100, description: "Ancient tree with fan-shaped leaves.", owned: false },
  ],
  rare: [
    { id: 9, name: "Bamboo", image: "/tree-9.png", level: 2, xp: 800, maxXp: 1000, description: "Fast-growing and versatile plant.", owned: true },
    { id: 10, name: "Cypress", image: "/tree-10.png", level: 1, xp: 0, maxXp: 100, description: "Tall and slender, often near water.", owned: false },
    { id: 11, name: "Yew", image: "/tree-11.png", level: 1, xp: 0, maxXp: 100, description: "Dark green needles with red berries.", owned: false },
    { id: 12, name: "Sycamore", image: "/tree-12.png", level: 1, xp: 0, maxXp: 100, description: "Wide canopy with mottled bark.", owned: false },
    { id: 13, name: "Holly", image: "/tree-13.png", level: 1, xp: 0, maxXp: 100, description: "Shiny leaves and bright red berries.", owned: false },
    { id: 14, name: "Juniper", image: "/tree-14.png", level: 1, xp: 0, maxXp: 100, description: "Fragrant berries used in spices.", owned: false },
  ],
  common: [
    { id: 1, name: "Oak", image: "/tree-1.png", level: 1, xp: 0, maxXp: 100, description: "A sturdy tree commonly found in forests.", owned: false },
    { id: 2, name: "Birch", image: "/tree-2.png", level: 1, xp: 80, maxXp: 100, description: "Known for its white bark and elegant shape.", owned: true },
    { id: 3, name: "Maple", image: "/tree-3.png", level: 1, xp: 0, maxXp: 100, description: "Famous for its vibrant autumn leaves.", owned: false },
    { id: 4, name: "Pine", image: "/tree-4.png", level: 1, xp: 0, maxXp: 100, description: "An evergreen tree with strong wood.", owned: false },
    { id: 5, name: "Willow", image: "/tree-5.png", level: 1, xp: 0, maxXp: 100, description: "Graceful branches that sway in the wind.", owned: false },
    { id: 6, name: "Cedar", image: "/tree-6.png", level: 1, xp: 0, maxXp: 100, description: "Aromatic wood used in crafting.", owned: false },
    { id: 7, name: "Ash", image: "/tree-7.png", level: 1, xp: 0, maxXp: 100, description: "Resilient and flexible wood.", owned: false },
    { id: 8, name: "Elm", image: "/tree-8.png", level: 1, xp: 0, maxXp: 100, description: "Tall and sturdy with broad leaves.", owned: false },
  ],
};

const Tree = () => {
  const categoryStyles = {
    common: "text-gray-600",
    rare: "text-blue-600",
    epic: "text-purple-800",
    legendary: "text-orange-500",
  };

  const [openCategories, setOpenCategories] = useState({
    legendary: true,
    epic: true,
    rare: true,
    common: true,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Hàm lọc cây dựa trên search và filter
  const filterTrees = (trees, category) => {
    return trees.filter((tree) => {
      const matchesSearch = tree.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || category === filter;
      return matchesSearch && matchesFilter;
    });
  };

  // Danh sách category theo thứ tự mặc định
  const defaultOrder = ["legendary", "epic", "rare", "common"];

  // Sắp xếp lại thứ tự category dựa trên filter
  const getOrderedCategories = () => {
    if (filter === "all") return defaultOrder;
    return [filter, ...defaultOrder.filter((cat) => cat !== filter)];
  };

  // Render category
  const renderCategory = (category) => {
    const filteredTrees = filterTrees(treeData[category], category);
    if (filteredTrees.length === 0) return null; // Không hiển thị category nếu không có cây nào phù hợp

    return (
      <Collapsible
        key={category}
        open={openCategories[category]}
        onOpenChange={() => toggleCategory(category)}
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between mb-4 cursor-pointer">
            <h2 className={`text-2xl font-semibold ${categoryStyles[category]}`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h2>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${openCategories[category] ? "rotate-180" : ""}`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTrees.map((tree) => (
              <TreeCard key={tree.id} tree={tree} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <motion.div
      className="p-6 mt-20 max-w-full mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header và Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="w-6 h-6 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">Your Trees</h1>
        </div>
        <div className="flex gap-4">
          <Input
            placeholder="Search trees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hiển thị các category theo thứ tự đã sắp xếp */}
      {getOrderedCategories().map((category) => renderCategory(category))}
    </motion.div>
  );
};

// Component TreeCard (giữ nguyên)
const TreeCard = ({ tree }) => {
  const [isOpen, setIsOpen] = useState(false);
  const progress = tree.level === 4 ? 100 : (tree.xp / tree.maxXp) * 100;
  const progressText = tree.level === 4 ? "Max XP" : `${tree.xp}/${tree.maxXp} XP`;

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
              tree.owned ? "" : "opacity-50"
            }`}
          >
            <CardContent className="text-center">
              <img src={tree.image} alt={tree.name} className="w-24 h-24 mb-2 mx-auto" />
              <p className={`font-semibold ${tree.owned ? "text-gray-800" : "text-gray-500"}`}>
                {tree.name}
              </p>
              <div className="relative w-full mt-2">
                <Progress value={progress} className="w-full h-6" />
                {/*Hiển thị màu chữ của xp ngoài và màu thanh tiến độ*/}
                <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-800 font-medium bg-white bg-opacity-50">
                  {progressText}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {tree.level === 4 ? "Level 4" : `Level ${tree.level}`}
              </p>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="w-96">
          <div className="flex flex-col items-center gap-4">
            <img
              src={tree.image}
              alt={tree.name}
              className={`w-32 h-32 ${tree.owned ? "" : "opacity-50"}`}
            />
            <h3 className={`text-lg font-semibold ${tree.owned ? "text-gray-800" : "text-gray-500"}`}>
              {tree.name}
            </h3>
            <div className="relative w-full">
                {/* Tăng kích cỡ thanh process */}
              <Progress value={progress} className="w-full h-6" />
              <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-800 font-medium bg-white bg-opacity-50">
                {progressText}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {tree.level === 4 ? "Level 4" : `Level ${tree.level}`}
            </p>
            <p className="text-sm text-gray-500 text-center">{tree.description}</p>
            {!tree.owned && (
              <p className="text-sm text-red-500 font-semibold">Not Owned</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Tree;