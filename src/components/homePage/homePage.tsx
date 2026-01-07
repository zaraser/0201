// webapp/src/components/homePage/homePage.tsx
import { useEffect, useState } from 'react';
import "../../style/homePage/homepage.css";
import LinkButton from '../homePage/linkButton';
import "../../style/homePage/settings.css";
import SettingsModal from './settingsModal';
import { useNavigate } from "react-router-dom";
import ChatBox from "../chat/chatBox";
import { useGameInvites } from '../../hooks/useGameInvites';
import { useNotifications } from "../../hooks/useNotifications";



type User = {
  id: number;
  login: string;
  email: string;
  image?: string;
  displayName?: string;
  is2faEnabled: boolean;
  twofaPassed: boolean;
} | null;


export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const { invite, accept, reject } = useGameInvites();
  const { notification, clear } = useNotifications();
 
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://localhost:8443/auth/session', {
          credentials: 'include',
        });
        const defaultAvatar = "../../../avatar.png";

        if (res.ok) {
          const { user } = await res.json();
          if (!user.image)
            user.image = defaultAvatar;
            // 🔐 ВОТ ЗДЕСЬ ПРОВЕРКА 2FA
            if (user.is2faEnabled && !user.twofaPassed) {
            setLoading(false);
            navigate("/2fa");
            return;
          }
          setUser(user);
        } else {
          setUser(null);
        }

      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]); 

  const logout = async () => {
    await fetch('https://localhost:8443/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    window.location.href = '/';
  };

  if (loading) return <div>Chargement…</div>;
  if (!user) return <div>Accès refusé. <a href="/">Connecte-toi</a>.</div>;

return (
  <div className="homepage">




        {notification?.type === "tournament" && (
          <div className="tournament-popup">
            <p>
              Следующий матч против{" "}
              <strong>{notification.opponent?.login}</strong>
            </p>

            <button
              onClick={() =>
                navigate(`/pong/${notification.matchId}`)
              }
            >
              Перейти к матчу
            </button>

            <button onClick={clear}>Закрыть</button>
          </div>
        )}


        {/* 🎮 GAME INVITE POPUP */}
        {invite && (
        <div className="invite-popup">
          <p>
            <strong>{invite.from.login}</strong> приглашает вас в Pong
          </p>

          <div className="invite-actions">
            <button onClick={accept}>Принять</button>
            <button onClick={reject}>Отклонить</button>
          </div>
        </div>
      )}


    {showSettings && user && (
      <SettingsModal
        user={{
          id: user.id,
          login: user.login,
          email: user.email || '',
          image: user.image,
          displayName: user.displayName,
          is2faEnabled: user.is2faEnabled,
        }}
        onClose={() => setShowSettings(false)}
      />
    )}

    <div className="title-container">
      <h3>Transcendance</h3>
      <h4>Bienvenue, {user.login}</h4>
    </div>

    <div className="gameBox">
      <div className="play">
        <LinkButton 
          text="Play" 
          href="https://localhost:8443/play" 
        />
      </div>
    </div>

    <ChatBox myUserId={user.id} />


    <div className="settingsBox">
      <div className="avatarHomePage">
        <img src={user.image} alt="Avatar" />
      </div>
    </div>

    <div className="loginHomePage">{user.login}</div>

    <button 
      className="settingsHome" 
      type="button" 
      onClick={() => setShowSettings(true)}
    >
      Settings
    </button>

    <button 
      className="logoutHome" 
      type="button" 
      onClick={logout}
    >
      Déconnexion
    </button>

  </div>
);
}