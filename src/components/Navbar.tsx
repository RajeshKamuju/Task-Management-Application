import { useNavigate } from "react-router-dom";
import { LogOut, User, CheckCircle2, ClipboardList, Info } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  userName: string;
  userEmail: string;
  totalCount: number;
  completedCount: number;
}

export default function Navbar({ userName, userEmail, totalCount, completedCount }: NavbarProps) {
  const navigate = useNavigate();
  const [showWebsocketInfo, setShowWebsocketInfo] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-secondary bg-opacity-95 shadow border-bottom border-secondary border-opacity-30 py-3 mb-4 rounded-3" id="app-navigation-bar">
        <div className="container-fluid px-3 d-flex align-items-center justify-content-between">
          
          {/* Brand Panel */}
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary p-2 rounded-3 text-white d-flex align-items-center justify-content-center shadow-sm">
              <ClipboardList size={20} />
            </div>
            <div>
              <span className="navbar-brand fw-bold mb-0 text-white tracking-tight" style={{ fontSize: "1.1rem" }}>TaskCore</span>
              <span className="badge bg-primary bg-opacity-20 text-primary small border border-primary border-opacity-30" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>v1.0.0</span>
            </div>
          </div>

          {/* User Section & Info Toggle */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Real-time Websocket Info badge */}
            <button 
              id="websocket-info-button"
              className="btn btn-outline-info btn-sm d-flex align-items-center gap-1.5 py-1 px-2.5 rounded-pill" 
              onClick={() => setShowWebsocketInfo(!showWebsocketInfo)}
              style={{ fontSize: "0.75rem" }}
            >
              <Info size={14} />
              <span>WebSocket Guide</span>
            </button>

            {/* User credentials panel */}
            <div className="d-none d-md-flex flex-column text-end">
              <span className="text-white fw-semibold small lh-1">{userName}</span>
              <span className="text-secondary small" style={{ fontSize: "0.72rem" }}>{userEmail}</span>
            </div>

            {/* Avatar block */}
            <div className="d-flex align-items-center justify-content-center bg-dark bg-opacity-30 rounded-circle text-white p-2.5 shadow-inner" style={{ width: "38px", height: "38px" }}>
              <User size={16} />
            </div>

            {/* Logout trigger */}
            <button
              id="logout-button"
              className="btn btn-danger btn-sm p-2 d-flex align-items-center justify-content-center rounded-3 shadow-sm border-0"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
            
          </div>

        </div>
      </nav>

      {/* Dynamic Modal / Overlay explaining Websocket implementation */}
      {showWebsocketInfo && (
        <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex={-1} style={{ zIndex: 1050 }} id="websocket-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-secondary border-bottom border-light border-opacity-10 text-white py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <ClipboardList className="text-info animate-pulse" size={20} />
                  WebSocket Architecture Guide
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowWebsocketInfo(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4 text-start small">
                <p className="fw-semibold text-secondary mb-2">Optional Implementation for Real-Time Synchronization:</p>
                <div className="bg-light p-3 rounded-3 font-monospace mb-3 border text-xs" style={{ whiteSpace: "pre-wrap", fontSize: "11px" }}>
{`// 1. springboot config - WebSocketBrokerConfigurer
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry r) {
        r.addEndpoint("/ws").setAllowedOrigins("*").withSockJS();
    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry r) {
        r.enableSimpleBroker("/topic");
        r.setApplicationDestinationPrefixes("/app");
    }
}`}
                </div>
                <p className="text-muted text-xs mb-3">
                  This class enables STOMP message protocols. When any user updates a task via typical REST endpoints, the backend triggers event broadcasts to `/topic/tasks/{"{userId}"}`.
                </p>
                <p className="fw-semibold text-secondary mb-2">Client Connection Hook:</p>
                <div className="bg-light p-3 rounded-3 font-monospace text-xs mb-0 border" style={{ whiteSpace: "pre-wrap", fontSize: "11px" }}>
{`// 2. React integration utilizing stompjs
import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: 'ws://localhost:8080/ws',
  onConnect: () => {
    client.subscribe('/topic/tasks/' + userId, message => {
      const updatedTask = JSON.parse(message.body);
      // dynamically append or modify active task arrays
    });
  }
});
client.activate();`}
                </div>
              </div>
              <div className="modal-footer bg-light py-2 px-3 border-top">
                <button type="button" className="btn btn-secondary btn-sm rounded-3 px-3" onClick={() => setShowWebsocketInfo(false)}>Understood</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
