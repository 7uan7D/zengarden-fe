import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GetUserXpLogsByUserId } from "@/services/apiServices/userService";
import parseJwt from "@/services/parseJwt";
const UserXPLogDialog = ({ open, onOpenChange }) => {
  const [userXpLogs, setUserXpLogs] = useState([]);

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = parseJwt(token);
        const userId = decoded.sub;

        GetUserXpLogsByUserId(userId)
          .then(setUserXpLogs)
          .catch((err) => console.error("Failed to fetch User XP Logs:", err));
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User XP Logs</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {userXpLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No XP logs found.</p>
          ) : (
            userXpLogs.map((log) => (
              <div
                key={log.logId}
                className="border p-4 rounded-lg shadow-sm bg-gray-50"
              >
                <p className="font-semibold">XP Amount: {log.xpAmount}</p>
                <p className="text-sm text-gray-700">Source: {log.xpSource}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserXPLogDialog;
