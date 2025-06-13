import { useState } from "react";
import {
  createDummyPlayers,
  createGame,
  useGame,
  usePlayers,
  useStartGame,
} from "../utils";
import {
  GAME_STATUS,
  PLAYER_COUNT,
  GAME_STAGE_TYPE,
  GAME_STAGES,
} from "../constants";
import { Button } from "@/components/ui/button";
import { AdminCombatSelector } from "@/components/AdminCombatSelector";
import { AdminStageController } from "@/components/AdminStageController";
import { AdminHpController } from "@/components/AdminHpController";
import { AdminTraitAssignment } from "@/components/AdminTraitAssignment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLogViewer } from "@/components/AdminLogViewer";
import { AdminMenu } from "@/components/AdminMenu";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Activity,
  Heart,
  Clock,
  FileText,
  Plus,
  Play,
  Zap,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("combat");
  const { data: game, loading: gameLoading } = useGame();
  const { data: players, loading: playersLoading } = usePlayers();
  const startGame = useStartGame();

  const playerCount = Object.values(players || {}).length;
  const hasEnoughPlayers = playerCount >= PLAYER_COUNT.MIN;
  const hasReachedMaxPlayers = playerCount >= PLAYER_COUNT.MAX;
  // const isGameInProgress = game?.status === GAME_STATUS.IN_PROGRESS;

  // Check if current stage is evolution
  const currentStageIndex = game?.stageIndex ?? -1;
  const currentStage = GAME_STAGES[currentStageIndex] ?? -1;
  const isEvolutionStage = currentStage.type === GAME_STAGE_TYPE.EVOLUTION;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Fixed on mobile */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          {/* Title and Menu Row */}
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
              管理員控制台
            </h1>
            <div className="ml-auto">
              <AdminMenu />
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2">
            {(!game || game?.status === GAME_STATUS.ENDED) && (
              <Button
                onClick={createGame}
                size="sm"
                className="flex-1 sm:flex-none min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-sm">創建新遊戲</span>
              </Button>
            )}
            {game?.status === GAME_STATUS.JOINING && (
              <>
                <Button
                  disabled={!hasEnoughPlayers}
                  onClick={startGame}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none min-h-[44px]"
                >
                  <Play className="h-4 w-4 mr-1" />
                  <span className="text-sm">開始遊戲</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={hasReachedMaxPlayers}
                  onClick={() => createDummyPlayers(1, playerCount)}
                  className="flex-1 sm:flex-none min-h-[44px]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="text-sm">測試玩家</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {gameLoading || playersLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-base sm:text-lg">載入中...</p>
          </div>
        ) : !game ? (
          <Alert className="mx-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-base">未找到遊戲</AlertTitle>
            <AlertDescription className="text-sm">
              請點擊「創建新遊戲」按鈕開始一個新的遊戲。
            </AlertDescription>
          </Alert>
        ) : game.status === GAME_STATUS.JOINING ? (
          <GameSetupStatus
            playerCount={playerCount}
            minPlayers={PLAYER_COUNT.MIN}
            maxPlayers={PLAYER_COUNT.MAX}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Sticky Tab Bar for Mobile */}
            <div className="sticky top-[89px] sm:top-[97px] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-4 -mx-4 px-4 py-2">
              <TabsList
                className={`grid w-full h-12 sm:h-10 ${isEvolutionStage ? "grid-cols-5" : "grid-cols-4"}`}
              >
                <TabsTrigger
                  value="combat"
                  className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
                >
                  <Activity className="h-4 w-4" />
                  <span>戰鬥</span>
                </TabsTrigger>
                <TabsTrigger
                  value="hp"
                  className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
                >
                  <Heart className="h-4 w-4" />
                  <span>血量</span>
                </TabsTrigger>
                <TabsTrigger
                  value="stage"
                  className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
                >
                  <Clock className="h-4 w-4" />
                  <span>階段</span>
                </TabsTrigger>
                {isEvolutionStage && (
                  <TabsTrigger
                    value="traits"
                    className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
                  >
                    <Zap className="h-4 w-4" />
                    <span>特性</span>
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="log"
                  className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
                >
                  <FileText className="h-4 w-4" />
                  <span>日誌</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="combat" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">戰鬥控制</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {players && game && (
                    <AdminCombatSelector
                      players={Object.values(players)}
                      game={game}
                      allPlayers={players}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hp" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">血量控制</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {players && <AdminHpController players={players} />}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stage" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">階段控制</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AdminStageController />
                </CardContent>
              </Card>
            </TabsContent>

            {isEvolutionStage && (
              <TabsContent value="traits" className="mt-0">
                {players && game && (
                  <AdminTraitAssignment
                    players={players}
                    currentRound={game.round || 1}
                  />
                )}
              </TabsContent>
            )}

            <TabsContent value="log" className="mt-0">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl">遊戲日誌</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <AdminLogViewer />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

type GameSetupStatusProps = {
  playerCount: number;
  minPlayers: number;
  maxPlayers: number;
};

const GameSetupStatus = ({
  playerCount,
  minPlayers,
  maxPlayers,
}: GameSetupStatusProps) => (
  <Card className="mx-2">
    <CardHeader className="pb-4">
      <CardTitle className="text-lg sm:text-xl">遊戲設置</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">當前玩家</div>
            <div className="text-2xl font-bold">{playerCount}</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">最少需要</div>
            <div className="text-2xl font-bold">{minPlayers}</div>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground">最大人數</div>
            <div className="text-2xl font-bold">{maxPlayers}</div>
          </div>
        </div>
        <Separator />
        <div className="text-center">
          {playerCount < minPlayers ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-base">玩家不足</AlertTitle>
              <AlertDescription className="text-sm">
                需要至少 {minPlayers} 名玩家才能開始遊戲。
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
              <AlertTitle className="text-green-800 dark:text-green-300 text-base">
                準備就緒
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-400 text-sm">
                已有足夠玩家，可以開始遊戲。
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Admin;
