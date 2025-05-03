import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { GetUserTreeByOwnerId } from "@/services/apiServices/userTreesService";
import { AcceptTrade } from "@/services/apiServices/treesService";
import { GetUserInfo } from "@/services/apiServices/userService";

import parseJwt from "@/services/parseJwt";

export default function TradeDialog({ open, onClose, tradeItem }) {
  const [userTrees, setUserTrees] = useState([]);
  const [matchingTree, setMatchingTree] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token not found!");
    return;
  }
  const userId = parseJwt(token)?.sub;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!tradeItem || !userId) return;

      try {
        const [trees, userInfo] = await Promise.all([
          GetUserTreeByOwnerId(userId),
          GetUserInfo(userId),
        ]);

        setUserTrees(trees);
        setWalletBalance(userInfo.wallet?.balance ?? 0);

        const match = trees.find(
          (tree) => tree.finalTree?.treeId === tradeItem.desiredTreeAID
        );
        setMatchingTree(match);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchUserData();
  }, [tradeItem, userId]);

  const handleAcceptTrade = async () => {
    try {
      await AcceptTrade({
        tradeId: tradeItem.tradeId,
        userId,
        userTreeId: matchingTree.userTreeId,
      });
      alert("Trade accepted!");
      onClose();
    } catch (err) {
      alert("Trade failed!");
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

  const desiredTree =
    tradeItem?.desiredTreeA ||
    userTrees.find(
      (tree) => tree.finalTree?.treeId === tradeItem?.desiredTreeAID
    );

  const tradeCost = getTradeCoin(desiredTree?.finalTree?.rarity);

  const notEnoughCoins = walletBalance !== null && walletBalance < tradeCost;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>Confirm Trade</DialogHeader>
        {matchingTree ? (
          <div className="text-center">
            <img
              src={matchingTree.finalTree.imageUrl}
              alt={matchingTree.finalTree.name}
              className="w-32 h-32 mx-auto mb-2"
            />
            <p className="font-semibold">{matchingTree.finalTree.name}</p>
            <p className="mt-2 flex justify-center items-center gap-1">
              Required:
              <img
                src="/images/coin.png"
                alt="coin"
                className="w-4 h-4 inline-block"
              />
              {tradeCost}
            </p>
            <p className="flex justify-center items-center gap-1">
              Your balance:
              <img
                src="/images/coin.png"
                alt="coin"
                className="w-4 h-4 inline-block"
              />
              {walletBalance}
            </p>

            {notEnoughCoins ? (
              <p className="text-red-500 mt-2">Not enough coins to trade!</p>
            ) : (
              <button
                className={`px-4 py-2 mt-4 rounded ${
                  notEnoughCoins
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
                disabled={notEnoughCoins}
                onClick={handleAcceptTrade}
              >
                {notEnoughCoins
                  ? "Insufficient Coins"
                  : `Confirm Trade (${tradeCost} coins)`}
              </button>
            )}
          </div>
        ) : (
          <p className="text-center text-red-500">
            You don't have the tree they want 😢
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
