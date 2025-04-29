import React from 'react';
import './Timeline.css';

const Timeline = ({ events }) => {
    if (!events || events.length === 0) {
        return <div className="timeline-empty">暂无发展历程数据</div>;
    }
    return (
        <div className="timeline">
            {events.map((event, index) => (
                <div key={index} className="timeline-event">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                        <div className="timeline-date">{event.date}</div>
                        <h4 className="timeline-title">{event.title}</h4>
                        <p className="timeline-description">{event.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Timeline;