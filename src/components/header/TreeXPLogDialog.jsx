import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import parseJwt from "@/services/parseJwt";
import { GetTreeXpLogsByUserId } from "@/services/apiServices/treeXPLogService";

export default function TreeXPLogDialog({ open, onOpenChange }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (open) {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = parseJwt(token);
        const userId = decoded.sub;
        GetTreeXpLogsByUserId(userId)
          .then((data) => setLogs(data))
          .catch((err) => console.error("Failed to fetch XP Logs", err));
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tree XP Logs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs found.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.logId}
                className="p-4 bg-gray-100 rounded-lg shadow-sm"
              >
                <p className="font-semibold text-sm">
                  XP Gained:{" "}
                  <span className="text-green-600">{log.xpAmount}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Task: {log.tasks?.taskName || "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  At: {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
