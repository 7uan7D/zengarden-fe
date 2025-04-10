import React, { useEffect, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { Bell, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formatDateFromMessage = (message) => {
  const dateMatch = message.match(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/
  );
  if (!dateMatch) return "";
  const date = new Date(dateMatch[0]);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [connection, setConnection] = useState(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://zengarden-be.onrender.com/hubs/notification", {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to notification hub");
          connection.on("ReceiveNotification", (title, message) => {
            setNotifications((prev) => [...prev, { title, message }]);
            setShake(true);
            setTimeout(() => setShake(false), 500);
          });
        })
        .catch((err) => console.error("SignalR Connection Error: ", err));
    }
  }, [connection]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className={cn("w-6 h-6", shake ? "animate-shake" : "")} />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-xl border-b pb-1 w-full">
            Notifications
          </h4>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="ml-4"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground">
              You have no notifications.
            </p>
          ) : (
            notifications
              .slice()
              .reverse()
              .map((item, index) => (
                <Card
                  key={index}
                  className="mb-3 border border-muted shadow-md rounded-2xl hover:bg-muted/50 transition"
                >
                  <CardContent className="p-4 flex flex-col gap-1 relative">
                    <span className="font-semibold text-primary text-base">
                      {item.title}
                    </span>
                    {formatDateFromMessage(item.message) && (
                      <span className="text-sm text-muted-foreground">
                        {formatDateFromMessage(item.message)}
                      </span>
                    )}
                    <span className="text-foreground text-sm">
                      {item.message.replace(
                        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/,
                        ""
                      )}
                    </span>
                    <CheckCircle
                      className="text-green-500 w-5 h-5 absolute bottom-3 right-3"
                      strokeWidth={2}
                    />
                  </CardContent>
                </Card>
              ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
