import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Leaf } from "lucide-react";
import "../home/index.css";

// Dữ liệu mẫu cho danh sách cây
const treeData = {
  common: [
    { id: 1, name: "Oak", image: "/tree-1.png", level: 2, xp: 600, maxXp: 1000, description: "A sturdy tree commonly found in forests." },
    { id: 2, name: "Birch", image: "/tree-2.png", level: 1, xp: 80, maxXp: 100, description: "Known for its white bark and elegant shape." },
    { id: 3, name: "Maple", image: "/tree-3.png", level: 3, xp: 1500, maxXp: 2000, description: "Famous for its vibrant autumn leaves." },
    { id: 4, name: "Pine", image: "/tree-4.png", level: 2, xp: 400, maxXp: 1000, description: "An evergreen tree with strong wood." },
    { id: 5, name: "Willow", image: "/tree-5.png", level: 1, xp: 50, maxXp: 100, description: "Graceful branches that sway in the wind." },
    { id: 6, name: "Cedar", image: "/tree-6.png", level: 3, xp: 1800, maxXp: 2000, description: "Aromatic wood used in crafting." },
    { id: 7, name: "Ash", image: "/tree-7.png", level: 2, xp: 700, maxXp: 1000, description: "Resilient and flexible wood." },
    { id: 8, name: "Elm", image: "/tree-8.png", level: 1, xp: 90, maxXp: 100, description: "Tall and sturdy with broad leaves." },
  ],
  rare: [
    { id: 9, name: "Bamboo", image: "/tree-9.png", level: 2, xp: 800, maxXp: 1000, description: "Fast-growing and versatile plant." },
    { id: 10, name: "Cypress", image: "/tree-10.png", level: 3, xp: 1600, maxXp: 2000, description: "Tall and slender, often near water." },
    { id: 11, name: "Yew", image: "/tree-11.png", level: 1, xp: 70, maxXp: 100, description: "Dark green needles with red berries." },
    { id: 12, name: "Sycamore", image: "/tree-12.png", level: 2, xp: 500, maxXp: 1000, description: "Wide canopy with mottled bark." },
    { id: 13, name: "Holly", image: "/tree-13.png", level: 1, xp: 60, maxXp: 100, description: "Shiny leaves and bright red berries." },
    { id: 14, name: "Juniper", image: "/tree-14.png", level: 3, xp: 1900, maxXp: 2000, description: "Fragrant berries used in spices." },
  ],
  epic: [
    { id: 15, name: "Baobab", image: "/tree-15.png", level: 4, xp: 0, maxXp: 0, description: "Massive trunk stores water for years." },
    { id: 16, name: "Sequoia", image: "/tree-16.png", level: 4, xp: 0, maxXp: 0, description: "One of the tallest trees in the world." },
    { id: 17, name: "Dragon Tree", image: "/tree-17.png", level: 3, xp: 1700, maxXp: 2000, description: "Exotic with red sap like blood." },
    { id: 18, name: "Ginkgo", image: "/tree-18.png", level: 2, xp: 900, maxXp: 1000, description: "Ancient tree with fan-shaped leaves." },
  ],
  legendary: [
    { id: 19, name: "Tree of Life", image: "/tree-19.png", level: 4, xp: 0, maxXp: 0, description: "A mythical tree of eternal vitality." },
    { id: 20, name: "Golden Apple", image: "/tree-20.png", level: 4, xp: 0, maxXp: 0, description: "Bears fruit of pure gold." },
  ],
};

const Tree = () => {
  const categoryStyles = {
    common: "text-gray-600",
    rare: "text-blue-600",
    epic: "text-purple-800",
    legendary: "text-orange-500",
  };

  return (
    <motion.div
      className="p-6 mt-20 max-w-full mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Leaf className="w-6 h-6 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-800">Your Trees</h1>
      </div>
      {/* Legendary Trees */}
      <div className="mb-8">
        <h2 className={`text-2xl font-semibold ${categoryStyles.legendary} mb-4`}>Legendary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {treeData.legendary.map((tree) => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      </div>
      {/* Epic Trees */}
      <div className="mb-8">
        <h2 className={`text-2xl font-semibold ${categoryStyles.epic} mb-4`}>Epic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {treeData.epic.map((tree) => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      </div>
      {/* Rare Trees */}
      <div className="mb-8">
        <h2 className={`text-2xl font-semibold ${categoryStyles.rare} mb-4`}>Rare</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {treeData.rare.map((tree) => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      </div>
      {/* Common Trees */}
      <div className="mb-8">
        <h2 className={`text-2xl font-semibold ${categoryStyles.common} mb-4`}>Common</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {treeData.common.map((tree) => (
            <TreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Component TreeCard để tái sử dụng
const TreeCard = ({ tree }) => {
  const progress = tree.level === 4 ? 100 : (tree.xp / tree.maxXp) * 100;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Card className="p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="text-center">
              <img src={tree.image} alt={tree.name} className="w-24 h-24 mb-2 mx-auto" />
              <p className="font-semibold text-gray-800">{tree.name}</p>
              <Progress value={progress} className="w-full mt-2" />
              <p className="text-sm text-gray-500 mt-1">
                {tree.level === 4 ? "Level 4" : `Level ${tree.level}, ${tree.xp}/${tree.maxXp} XP`}
              </p>
            </CardContent>
          </Card>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col items-center gap-4">
            <img src={tree.image} alt={tree.name} className="w-32 h-32" />
            <h3 className="text-lg font-semibold text-gray-800">{tree.name}</h3>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">
              {tree.level === 4 ? "Level 4" : `Level ${tree.level}, ${tree.xp}/${tree.maxXp} XP`}
            </p>
            <p className="text-sm text-gray-500 text-center">{tree.description}</p>
          </div>
        </PopoverContent>
      </Popover>
    </motion.div>
  );
};

export default Tree;