import QRCode from "react-qr-code";
import { GameLobby } from "@/components/GameLobby";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayers } from "../../utils";
import { QrCode } from "lucide-react";

const Join = () => {
  const { data } = usePlayers();
  const players = data ? Object.values(data) : [];
  const joinUrl = window.location.origin + "/join";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first layout with responsive design */}
      <div className="flex flex-col lg:flex-row lg:gap-6 lg:p-6">
        {/* QR Code Section - Top on mobile, Left sidebar on desktop */}
        <div className="lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-0 lg:top-6">
            <Card className="border-0 shadow-lg mx-4 mt-4 lg:mx-0 lg:mt-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 justify-center lg:justify-start">
                  <QrCode className="h-5 w-5" />
                  掃描加入遊戲
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QRCode
                      value={joinUrl}
                      size={160}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      viewBox="0 0 256 256"
                    />
                  </div>
                </div>

                {/* Join URL */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-center lg:text-left">
                    或使用連結
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2 text-xs font-mono text-center break-all">
                    {joinUrl}
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-xs text-muted-foreground text-center lg:text-left space-y-1">
                  <p>• 使用手機掃描 QR 碼</p>
                  <p>• 或複製連結分享給其他玩家</p>
                  <p>• 每位玩家需要輸入暱稱加入</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Lobby Section - Bottom on mobile, Right content on desktop */}
        <div className="flex-1 lg:min-w-0">
          <GameLobby
            players={players}
            minPlayers={10}
            maxPlayers={14}
            joinUrl={joinUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default Join;
