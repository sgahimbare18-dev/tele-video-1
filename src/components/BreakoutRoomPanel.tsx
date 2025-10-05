import React, { useState } from 'react';
import { useVideo } from '../contexts/VideoContext';

const BreakoutRoomPanel: React.FC = () => {
  const {
    breakoutRooms,
    currentBreakoutRoom,
    currentUserRole,
    createBreakoutRooms,
    joinBreakoutRoom,
    leaveBreakoutRoom,
    deleteBreakoutRoom
  } = useVideo();

  const [showPanel, setShowPanel] = useState(false);

  if (currentUserRole !== 'admin') {
    return null;
  }

  return (
    <div className="breakout-room-panel">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        {showPanel ? 'Hide' : 'Show'} Breakout Rooms
      </button>

      {showPanel && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Breakout Room Management</h3>

          <div className="mb-4">
            <button
              onClick={createBreakoutRooms}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2"
            >
              Create Breakout Rooms
            </button>
          </div>

          {breakoutRooms.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Active Breakout Rooms:</h4>
              {breakoutRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                  <div>
                    <span className="font-medium">{room.name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({room.participants.size} participants)
                    </span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => joinBreakoutRoom(room.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      disabled={currentBreakoutRoom === room.id}
                    >
                      {currentBreakoutRoom === room.id ? 'Joined' : 'Join'}
                    </button>
                    <button
                      onClick={() => deleteBreakoutRoom(room.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentBreakoutRoom && (
            <div className="mt-4">
              <button
                onClick={leaveBreakoutRoom}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Leave Breakout Room
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BreakoutRoomPanel;
