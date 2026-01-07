// webapp/src/components/chat/chatBox.tsx
import { useState, useEffect } from "react";
import { getSocket } from "../../socket";
import UserList from "./UserList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import ProfileModal from "./profileModal"; // только если файл ТОЧНО так называется
import "../../style/chat/chatBox.css";

export default function ChatBox({ myUserId }: { myUserId: number }) {
  const socket = getSocket();

  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  const [blockedByMe, setBlockedByMe] = useState<number[]>([]);
  const [blockedMe, setBlockedMe] = useState<number[]>([]);

  useEffect(() => {
    socket.emit("blocks:list");

    const onBlocksList = (data: any) => {
      setBlockedByMe(data?.blockedByMe ?? []);
      setBlockedMe(data?.blockedMe ?? []);
    };

    socket.on("blocks:list", onBlocksList);
    return () => socket.off("blocks:list", onBlocksList);
  }, [socket]);

  const isBlockedByMe =
    activeUserId !== null && blockedByMe.includes(activeUserId);
  const isBlockedByThem =
    activeUserId !== null && blockedMe.includes(activeUserId);

  return (
    <div className="chat-box">
      <UserList
        myUserId={myUserId} // 🆕
        selectedUserId={activeUserId}
        onSelectUser={(id) => {
          setActiveUserId(id);
          setShowProfile(false); // ✅ закрываем профиль при смене чата
        }}
      />

      <div className="chat-right">
        {activeUserId !== null ? (
          <>
            <ChatHeader
              userId={activeUserId}
              onOpenProfile={() => setShowProfile(true)}
            />

            <MessageList
              activeUserId={activeUserId}
              myUserId={myUserId}
            />

            <MessageInput
              activeUserId={activeUserId}
              isBlockedByMe={isBlockedByMe}
              isBlockedByThem={isBlockedByThem}
              onBlock={() =>
                socket.emit("user:block", { targetId: activeUserId })
              }
            />

            {showProfile && (
              <ProfileModal
                userId={activeUserId}
                onClose={() => setShowProfile(false)}
              />
            )}
          </>
        ) : (
          <div className="chat-placeholder">Выбери пользователя 👈</div>
        )}
      </div>
    </div>
  );
}
