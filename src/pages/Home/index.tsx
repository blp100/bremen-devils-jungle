import { useGame } from "../../utils";
import { GAME_STATUS } from "../../constants";
import { Skull, Gamepad2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Join from "./Join";

const Home = () => {
  const { data: game } = useGame();

  return (
    <>
      {game?.status === GAME_STATUS.JOINING ? (
        <Join />
      ) : (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl bg-gradient-to-br from-card via-card to-muted/20">
            <CardContent className="p-8 text-center space-y-6">
              {/* Icon Section */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 rounded-full flex items-center justify-center shadow-lg">
                    <Skull className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 dark:bg-orange-400 rounded-full flex items-center justify-center">
                    <Gamepad2 className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 dark:from-yellow-400 dark:via-yellow-500 dark:to-amber-500 bg-clip-text text-transparent">
                  魔鬼的邀請
                </h1>

                {/* Decorative Line */}
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent to-yellow-500 dark:to-yellow-400"></div>
                  <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                  <div className="w-8 h-px bg-gradient-to-l from-transparent to-yellow-500 dark:to-yellow-400"></div>
                </div>
              </div>

              {/* Subtitle Section */}
              <div className="space-y-4">
                <p className="text-lg font-medium text-muted-foreground">
                  您的靈魂將無法返還
                </p>

                {/* Status Message */}
                <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-4 border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    遊戲正在進行中
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    請等待當前遊戲結束
                  </p>
                </div>
              </div>

              {/* Bottom Accent */}
              <div className="pt-4">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default Home;
