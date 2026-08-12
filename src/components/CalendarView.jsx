import React, { useMemo } from "react";
import { useSelector,useDispatch } from "react-redux";
import { updatePost } from "../features/posts/postSlice";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarView.css";

function CalendarView({ onPostSelect }) {

    const role = localStorage.getItem("role");

  const posts = useSelector((state) => state.posts.posts);
  const scheduledPosts = posts.filter(
  (post) => post.scheduleTime
);

const upcomingPosts = scheduledPosts.filter(
  (post) => new Date(post.scheduleTime) >= new Date()
);

const totalPosts = posts.length;
  const dispatch = useDispatch();

const events = useMemo(() => {
  return posts
    .filter((post) => post.scheduleTime)
    .map((post) => ({
      id: post.id,
      title: post.text,
      start: post.scheduleTime,
    }));
}, [posts]);

const handleEventClick = (info) => {
  const post = posts.find(
    (post) => post.id === info.event.id
  );

  if (!post) return;

  onPostSelect(post);
};


const handleEventDrop = (info) => {

  if (role !== "ADMIN") {
    info.revert();
    return;
  }

  const post = posts.find(
    (post) => post.id === info.event.id
  );

  if (!post) return;

  const newScheduleTime =
    info.event.start.toISOString();

  dispatch(
    updatePost({
      ...post,
      scheduleTime: newScheduleTime,
      updatedAt: new Date().toLocaleString(),
    })
  );

  alert("Post rescheduled successfully!");
};
  return (
  <section className="calendar-section">

    <div className="calendar-header">
      <h2>📅 Content Calendar</h2>

      <p>
        Manage and schedule your social media posts
      </p>
    </div>

    <div className="calendar-stats">

      <div className="calendar-stat">
        <strong>{totalPosts}</strong>
        <span>Total Posts</span>
      </div>

      <div className="calendar-stat">
        <strong>{scheduledPosts.length}</strong>
        <span>Scheduled Posts</span>
      </div>

      <div className="calendar-stat">
        <strong>{upcomingPosts.length}</strong>
        <span>Upcoming Posts</span>
      </div>

    </div>

    <div className="calendar-wrapper">

      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin
        ]}

        initialView="dayGridMonth"

        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}

        events={events}

        editable={role === "ADMIN"}

        eventClick={handleEventClick}

        eventDrop={handleEventDrop}

        height="auto"
      />

    </div>

  </section>
);
}

export default React.memo(CalendarView);