"use client";

import { Button } from "@/components/ui/button";
import { DB_PATH, GAME_STAGES } from "@/constants";
import { useGame } from "@/utils";
import { updateData } from "@/services/firebaseHelpers";

export const AdminStageController = () => {
  const { data: game } = useGame();

  const currentStageIndex = game?.stageIndex ?? -1;
  const currentStage = GAME_STAGES[currentStageIndex];
  const isLastStage = currentStageIndex >= GAME_STAGES.length - 1;

  const handleNextStage = async () => {
    if (game && !isLastStage) {
      await updateData(DB_PATH.GAME, {
        stageIndex: currentStageIndex + 1,
      });
    }
  };

  const handleResetStage = async () => {
    if (game) {
      await updateData(DB_PATH.GAME, {
        stageIndex: 0,
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground text-center">
        當前階段：{currentStage?.type ?? "尚未開始"}（Round{" "}
        {currentStage?.round ?? "?"}）
        <br />
        傷害值：{currentStage?.type === "combat" ? currentStage.damage : "—"}
      </div>

      <div className="flex justify-center gap-2">
        <Button onClick={handleNextStage} disabled={isLastStage}>
          ➡️ 下一個階段
        </Button>
        <Button variant="ghost" onClick={handleResetStage}>
          🔄 回到第一階段
        </Button>
      </div>
    </div>
  );
};
