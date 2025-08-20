"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { usePlayers } from "../utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  QrCode,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

const AdminJoinLinks = () => {
  const navigate = useNavigate();
  const { data: players, loading } = usePlayers();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  // Ref for the QR code section
  const qrCodeSectionRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    navigate("/admin");
  };

  const handlePlayerSelect = (playerId: string) => {
    const isNewSelection = selectedPlayerId !== playerId;
    setSelectedPlayerId(selectedPlayerId === playerId ? null : playerId);
    setCopied(false);

    // If selecting a new player, scroll to QR code section
    if (isNewSelection) {
      // Small delay to ensure the content is rendered
      setTimeout(() => {
        qrCodeSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Add highlight animation
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 1500);
      }, 100);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("連結已複製到剪貼簿");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("複製連結失敗");
      console.error("Failed to copy link:", err);
    }
  };

  const getPlayerJoinLink = (playerId: string) => {
    return `${window.location.origin}/player/${playerId}`;
  };

  // Reset highlight when component unmounts or selectedPlayerId changes
  useEffect(() => {
    if (!selectedPlayerId) {
      setIsHighlighted(false);
    }
  }, [selectedPlayerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">載入玩家資料中...</p>
        </div>
      </div>
    );
  }

  const playerList = players ? Object.values(players) : [];
  const sortedPlayers = playerList.sort((a, b) => a.number - b.number);
  const selectedPlayer = selectedPlayerId ? players?.[selectedPlayerId] : null;
  const selectedPlayerLink = selectedPlayerId
    ? getPlayerJoinLink(selectedPlayerId)
    : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">玩家加入連結</h1>
              <p className="text-sm text-muted-foreground">
                為玩家生成專屬的加入連結和 QR 碼
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Player List */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                選擇玩家 ({sortedPlayers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedPlayers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>尚無玩家資料</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-2">
                  <div className="space-y-2">
                    {sortedPlayers.map((player) => (
                      <Button
                        key={player.id}
                        onClick={() => handlePlayerSelect(player.id)}
                        variant="outline"
                        className={`w-full justify-start p-4 h-auto text-left transition-all duration-200 ${
                          selectedPlayerId === player.id
                            ? "ring-2 ring-primary bg-primary/10 border-primary/20 shadow-md"
                            : "hover:bg-muted/50 dark:hover:bg-muted/50 hover:shadow-sm"
                        } ${player.isDead ? "opacity-60 bg-gray-50 dark:bg-gray-800" : ""}`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                              player.isDead
                                ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                : selectedPlayerId === player.id
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-primary text-primary-foreground"
                            }`}
                          >
                            {player.number}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold text-base transition-colors ${
                                player.isDead
                                  ? "text-gray-500 dark:text-gray-400 line-through"
                                  : ""
                              }`}
                            >
                              {player.nickname}
                            </div>
                            <div
                              className={`text-sm text-muted-foreground ${
                                player.isDead
                                  ? "text-gray-400 dark:text-gray-500"
                                  : ""
                              }`}
                            >
                              玩家 {player.number}
                              {player.isDead && " • 已死亡"}
                            </div>
                          </div>
                          {selectedPlayerId === player.id && (
                            <ExternalLink className="h-4 w-4 text-primary animate-in fade-in-0 slide-in-from-left-2 duration-200" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* QR Code and Link Display */}
          <Card
            ref={qrCodeSectionRef}
            className={`transition-all duration-500 ${
              isHighlighted
                ? "ring-2 ring-primary/50 shadow-lg bg-primary/5 dark:bg-primary/10"
                : ""
            }`}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                加入連結與 QR 碼
                {selectedPlayer && (
                  <div className="ml-auto animate-in fade-in-0 slide-in-from-right-2 duration-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPlayer ? (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                  {/* Player Info */}
                  <div className="bg-muted/30 p-4 rounded-lg border transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold shadow-sm">
                        {selectedPlayer.number}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {selectedPlayer.nickname}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          玩家 {selectedPlayer.number}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Join Link */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium">加入連結</div>
                    <div className="flex gap-2">
                      <Input
                        value={selectedPlayerLink}
                        readOnly
                        className="font-mono text-sm transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        onClick={() => handleCopyLink(selectedPlayerLink)}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0 bg-transparent transition-all hover:bg-primary/10"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600 animate-in zoom-in-50 duration-200" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium">QR 碼</div>
                    <div className="flex justify-center">
                      <div
                        className={`bg-white p-4 rounded-lg shadow-sm border transition-all duration-300 ${
                          isHighlighted ? "shadow-md scale-105" : ""
                        }`}
                      >
                        <QRCode
                          value={selectedPlayerLink}
                          size={200}
                          style={{
                            height: "auto",
                            maxWidth: "100%",
                            width: "100%",
                          }}
                          viewBox="0 0 256 256"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      掃描此 QR 碼可直接進入玩家頁面
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors">
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <div className="font-medium mb-2">使用說明：</div>
                      <ul className="space-y-1 text-xs">
                        <li>• 將連結或 QR 碼分享給對應玩家</li>
                        <li>• 玩家可直接進入個人遊戲頁面</li>
                        <li>• 適用於玩家意外關閉瀏覽器後重新加入</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <QrCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">請選擇一位玩家</p>
                  <p className="text-xs mt-1">點擊左側玩家列表中的任一玩家</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminJoinLinks;
