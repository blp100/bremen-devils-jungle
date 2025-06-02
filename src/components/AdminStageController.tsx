import { Button } from "@/components/ui/button"
import { DB_PATH, GAME_STAGES } from "@/constants"
import { useGame } from "@/utils"
import { updateData } from "@/services/firebaseHelpers"
import { ChevronRight, RotateCcw, Clock, Swords, Zap } from "lucide-react"

export const AdminStageController = () => {
  const { data: game } = useGame()

  const currentStageIndex = game?.stageIndex ?? -1
  const currentStage = GAME_STAGES[currentStageIndex]
  const nextStage = GAME_STAGES[currentStageIndex + 1]
  const isLastStage = currentStageIndex >= GAME_STAGES.length - 1

  const handleNextStage = async () => {
    if (game && !isLastStage) {
      await updateData(DB_PATH.GAME, {
        stageIndex: currentStageIndex + 1,
      })
    }
  }

  const handleResetStage = async () => {
    if (game) {
      await updateData(DB_PATH.GAME, {
        stageIndex: 0,
      })
    }
  }

  const getStageIcon = (stageType: string) => {
    switch (stageType) {
      case "discussion":
        return <Clock className="h-5 w-5" />
      case "combat":
        return <Swords className="h-5 w-5" />
      case "evolution":
        return <Zap className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStageTypeText = (stageType: string) => {
    switch (stageType) {
      case "discussion":
        return "討論階段"
      case "combat":
        return "戰鬥階段"
      case "evolution":
        return "進化階段"
      default:
        return "未知階段"
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Stage Info */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            {currentStage && getStageIcon(currentStage.type)}
            <span>{currentStage ? getStageTypeText(currentStage.type) : "遊戲尚未開始"}</span>
          </div>
          {currentStage && (
            <>
              <div className="text-sm text-muted-foreground">第 {currentStage.round} 回合</div>
              {currentStage.type === "combat" && (
                <div className="text-sm">
                  傷害值：<span className="font-bold text-red-600">{currentStage.damage}</span>
                </div>
              )}
              {currentStage.type === "discussion" && (
                <div className="text-sm">
                  時間：<span className="font-bold text-blue-600">{currentStage.duration} 分鐘</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Next Stage Preview */}
      {nextStage && (
        <div className="border border-dashed border-muted-foreground/30 p-4 rounded-lg">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">下一階段</div>
            <div className="flex items-center justify-center gap-2">
              {getStageIcon(nextStage.type)}
              <span className="font-medium">{getStageTypeText(nextStage.type)}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              第 {nextStage.round} 回合
              {nextStage.type === "combat" && ` • 傷害 ${nextStage.damage}`}
              {nextStage.type === "discussion" && ` • ${nextStage.duration} 分鐘`}
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-col gap-3">
        <Button onClick={handleNextStage} disabled={isLastStage} className="min-h-[48px] text-base" size="lg">
          <ChevronRight className="h-5 w-5 mr-2" />
          {isLastStage ? "遊戲已結束" : "進入下一階段"}
        </Button>

        <Button variant="outline" onClick={handleResetStage} className="min-h-[48px] text-base" size="lg">
          <RotateCcw className="h-5 w-5 mr-2" />
          回到第一階段
        </Button>
      </div>

      {/* Stage Progress */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground text-center">階段進度</div>
        <div className="flex justify-center">
          <div className="text-sm bg-muted px-3 py-1 rounded-full">
            {currentStageIndex + 1} / {GAME_STAGES.length}
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStageIndex + 1) / GAME_STAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
