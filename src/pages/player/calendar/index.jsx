import React, { useEffect, useState } from "react";
import Fullcalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import parseJwt from "@/services/parseJwt";
import { GetTaskByUserId } from "@/services/apiServices/taskService";
import {
  Checkin,
  GetCheckinHistory,
} from "@/services/apiServices/streakService";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Map màu cho từng loại task
const taskTypeColors = {
  Daily: "#3b82f6",
  Simple: "#22c55e",
  Complex: "#f90303",
  Challenge: "#f59e0b",
};
import "@/pages/player/calendar/index.css";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [checkedInDays, setCheckedInDays] = useState([]);
  const [today, setToday] = useState(dayjs().startOf("day"));
  const [streakMessage, setStreakMessage] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = parseJwt(token);
      const userId = decoded.sub;

      const tasks = await GetTaskByUserId(userId);
      const taskEvents = tasks.map((task) => ({
        id: task.taskId.toString(),
        title: task.taskName,
        start: dayjs(task.startDate).add(7, "hour").toISOString(),
        end: dayjs(task.endDate).add(7, "hour").toISOString(),
        color: taskTypeColors[task.taskTypeName] || "#6b7280",
      }));

      const history = await GetCheckinHistory(today.month() + 1, today.year());
      const formattedHistory = history
        .map((d) => dayjs(d).startOf("day"))
        .sort((a, b) => a.unix() - b.unix());

      // Tính streaks
      let streaks = [];
      let currentStreak = [];
      let currentStreakCandidateLength = 0;

      for (let i = 0; i < formattedHistory.length; i++) {
        if (
          currentStreak.length === 0 ||
          formattedHistory[i].diff(
            currentStreak[currentStreak.length - 1],
            "day"
          ) === 1
        ) {
          currentStreak.push(formattedHistory[i]);
        } else {
          if (currentStreak.length >= 3) {
            streaks.push([...currentStreak]);
          }
          currentStreak = [formattedHistory[i]];
        }
      }
      // Push cái cuối cùng
      if (currentStreak.length >= 3) {
        streaks.push([...currentStreak]);
      } else {
        currentStreakCandidateLength = currentStreak.length;
      }
      if (currentStreakCandidateLength >= 3) {
        setStreakMessage("🔥 Bạn đang giữ streak!");
      } else if (currentStreakCandidateLength > 0) {
        const need = 3 - currentStreakCandidateLength;
        setStreakMessage(
          `🔁 Rebuilding streak... ${need} days left to start streak.`
        );
      } else {
        setStreakMessage(
          "❌ You have lost your streak. Check-in 3 days in a row to start over."
        );
      }

      const streakEvents = streaks.flatMap((streak, streakIndex) =>
        streak.map((date, i) => ({
          id: `streak-${streakIndex}-${i}`,
          title: "🔥 Streak",
          start: date.add(7, "hour").toISOString(),
          end: date.add(7, "hour").endOf("day").toISOString(),
          color: "#f97316", // cam cháy
        }))
      );

      const checkinEvents = formattedHistory.map((date, i) => ({
        id: `checkin-${i}`,
        title: "✅ Checked in",
        start: date.add(7, "hour").startOf("day").toISOString(),
        end: date.add(7, "hour").endOf("day").toISOString(),
        color: "#22c55e",
      }));

      const checkedInToday = formattedHistory.some(
        (d) => d.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD")
      );

      localStorage.setItem("calendarHasUpdate", (!checkedInToday).toString());

      setCheckedInDays(formattedHistory.map((d) => d.format("YYYY-MM-DD")));
      setEvents([...taskEvents, ...checkinEvents, ...streakEvents]);
    } catch (error) {
      console.error("Lỗi khi load dữ liệu", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [today]);

  const handleDateClick = async (arg) => {
    const clickedDate = dayjs(arg.date).format("YYYY-MM-DD");
    const todayStr = today.format("YYYY-MM-DD");
    if (clickedDate !== todayStr) return;
    if (checkedInDays.includes(todayStr)) return;

    try {
      await Checkin();
      alert("✅ Check-in thành công!");
      await fetchData(); // 🔄 Gọi lại fetchData thay vì cập nhật thủ công
      localStorage.setItem("calendarHasUpdate", "false");
    } catch (err) {
      console.error("Check-in thất bại", err);
    }
  };

  const dayCellClassNames = (arg) => {
    const dateStr = dayjs(arg.date).format("YYYY-MM-DD");
    const todayStr = today.format("YYYY-MM-DD");
    if (dateStr === todayStr && !checkedInDays.includes(todayStr)) {
      return ["checkin-available"];
    }
    return [];
  };

  return (
    <div className="mt-20">
      <Fullcalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        events={events}
        dateClick={handleDateClick}
        dayCellClassNames={dayCellClassNames}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height={"90vh"}
      />
    </div>
  );
}

export default Calendar;
