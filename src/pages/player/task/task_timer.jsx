//hiển thị thanh tiến độ work/break trong TaskItem
export function ProgressBar({ workProgress, breakProgress }) {
    return (
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="work-progress bg-blue-500"
            style={{
              width: `${Math.min(workProgress, 100)}%`,
            }}
          />
          <div
            className="break-progress bg-yellow-500"
            style={{
              width: `${Math.min(breakProgress, 100)}%`,
            }}
          />
        </div>
      </div>
    );
  }