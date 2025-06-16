"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { IPlayer } from "@/interfaces";
import { EVOLUTION_TRAITS } from "@/constants";
import { updateData } from "@/services/firebaseHelpers";
import {
  Check,
  Zap,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Heart,
  ArrowRight,
  Crown,
  Bug,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminTraitAssignmentProps {
  players: { [key: string]: IPlayer };
  currentRound: number;
}

// Chinese trait name mapping
const TRAIT_LABELS: Record<string, string> = {
  [EVOLUTION_TRAITS.GENE_MUTATION]: "基因突變",
  [EVOLUTION_TRAITS.DEADLY_POISON]: "劇毒",
  [EVOLUTION_TRAITS.BLOODTHIRSTY]: "嗜血",
  [EVOLUTION_TRAITS.SHARP_SPIKES]: "尖刺",
  [EVOLUTION_TRAITS.HORUS_EYE]: "赫魯斯之眼",
  [EVOLUTION_TRAITS.AMPHIBIOUS]: "兩棲",
  [EVOLUTION_TRAITS.PARASITIC]: "寄生",
  [EVOLUTION_TRAITS.FOREST_SCEPTER]: "森林權杖",
  [EVOLUTION_TRAITS.TAIL_REGROWTH]: "斷尾",
  [EVOLUTION_TRAITS.SPECIES_EXTINCTION]: "物種消亡",
  [EVOLUTION_TRAITS.LION_KING]: "獅子王",
  [EVOLUTION_TRAITS.FIERCE_GAZE]: "兇狠目光",
  [EVOLUTION_TRAITS.HIBERNATION]: "冬眠",
  [EVOLUTION_TRAITS.SCAVENGER]: "食腐",
};

// Player type Chinese labels
const PLAYER_TYPE_LABELS: Record<string, string> = {
  fire: "火",
  water: "水",
  wood: "木",
  electric: "電",
};

export const AdminTraitAssignment = ({
  players,
  currentRound,
}: AdminTraitAssignmentProps) => {
  const [selectedTraits, setSelectedTraits] = useState<{
    [playerId: string]: string;
  }>({});
  const [hpDeductions, setHpDeductions] = useState<{
    [playerId: string]: number;
  }>({});
  const [assigningTraits, setAssigningTraits] = useState<{
    [playerId: string]: boolean;
  }>({});
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [targetPlayers, setTargetPlayers] = useState<{
    [playerId: string]: string;
  }>({});

  // Get available traits based on current round
  const getAvailableTraits = (round: number) => {
    switch (round) {
      case 1:
        return [
          EVOLUTION_TRAITS.GENE_MUTATION,
          EVOLUTION_TRAITS.DEADLY_POISON,
          EVOLUTION_TRAITS.BLOODTHIRSTY,
          EVOLUTION_TRAITS.SHARP_SPIKES,
          EVOLUTION_TRAITS.HORUS_EYE,
        ];
      case 2:
        return [
          EVOLUTION_TRAITS.AMPHIBIOUS,
          EVOLUTION_TRAITS.PARASITIC,
          EVOLUTION_TRAITS.FOREST_SCEPTER,
          EVOLUTION_TRAITS.TAIL_REGROWTH,
          EVOLUTION_TRAITS.SPECIES_EXTINCTION,
        ];
      case 3:
        return [
          EVOLUTION_TRAITS.LION_KING,
          EVOLUTION_TRAITS.FIERCE_GAZE,
          EVOLUTION_TRAITS.HIBERNATION,
          EVOLUTION_TRAITS.SCAVENGER,
        ];
      default:
        return [];
    }
  };

  const availableTraits = getAvailableTraits(currentRound);

  const getPlayerTypeLabel = (type: string) => {
    return PLAYER_TYPE_LABELS[type] || type;
  };

  // Create a map of which traits are already assigned to which players
  const assignedTraitsMap = useMemo(() => {
    const traitMap: { [trait: string]: string } = {};

    Object.values(players).forEach((player) => {
      if (player.evolutionCards && player.evolutionCards.length > 0) {
        player.evolutionCards.forEach((trait) => {
          if (availableTraits.includes(trait as EVOLUTION_TRAITS)) {
            traitMap[trait] = player.id;
          }
        });
      }
    });

    return traitMap;
  }, [players, availableTraits]);

  // Check if a trait is already assigned to any player
  const isTraitAssignedToAnyPlayer = (
    trait: string,
    currentPlayerId: string,
  ) => {
    return (
      assignedTraitsMap[trait] !== undefined &&
      assignedTraitsMap[trait] !== currentPlayerId
    );
  };

  // Get the player who has a specific trait
  const getPlayerWithTrait = (trait: string) => {
    const playerId = assignedTraitsMap[trait];
    return playerId ? players[playerId] : null;
  };

  // Check if a trait requires a target player
  const traitRequiresTarget = (trait: string): boolean => {
    return (
      trait === EVOLUTION_TRAITS.LION_KING ||
      trait === EVOLUTION_TRAITS.PARASITIC
    );
  };

  const handlePlayerClick = (playerId: string) => {
    if (expandedPlayer === playerId) {
      setExpandedPlayer(null);
    } else {
      setExpandedPlayer(playerId);
      // Clear any selected trait, HP deduction, and target player when switching players
      if (selectedTraits[playerId]) {
        setSelectedTraits((prev) => {
          const updated = { ...prev };
          delete updated[playerId];
          return updated;
        });
      }
      if (hpDeductions[playerId] !== undefined) {
        setHpDeductions((prev) => {
          const updated = { ...prev };
          delete updated[playerId];
          return updated;
        });
      }
      if (targetPlayers[playerId] !== undefined) {
        setTargetPlayers((prev) => {
          const updated = { ...prev };
          delete updated[playerId];
          return updated;
        });
      }
    }
  };

  const handleTraitSelect = (playerId: string, trait: string) => {
    setSelectedTraits((prev) => ({
      ...prev,
      [playerId]: trait,
    }));
    // Reset HP deduction when trait changes
    setHpDeductions((prev) => ({
      ...prev,
      [playerId]: 0,
    }));
    // Reset target player when trait changes
    setTargetPlayers((prev) => {
      const updated = { ...prev };
      delete updated[playerId];
      return updated;
    });
  };

  const handleTargetPlayerSelect = (
    playerId: string,
    targetPlayerId: string,
  ) => {
    setTargetPlayers((prev) => ({
      ...prev,
      [playerId]: targetPlayerId,
    }));
  };

  const handleHpDeductionChange = (playerId: string, value: number) => {
    const player = players[playerId];
    if (!player) return;

    // Ensure HP deduction doesn't exceed current HP or go below 0
    const clampedValue = Math.max(0, Math.min(value, player.hp));
    setHpDeductions((prev) => ({
      ...prev,
      [playerId]: clampedValue,
    }));
  };

  const handleAssignTrait = async (playerId: string) => {
    const selectedTrait = selectedTraits[playerId];
    const hpDeduction = hpDeductions[playerId] || 0;
    const targetPlayerId = targetPlayers[playerId];

    if (!selectedTrait) {
      toast.error("請先選擇一個性狀");
      return;
    }

    const player = players[playerId];
    if (!player) {
      toast.error("找不到玩家");
      return;
    }

    // Check if player already has this trait
    if (player.evolutionCards?.includes(selectedTrait)) {
      toast.error(
        `${player.nickname} 已經擁有 ${TRAIT_LABELS[selectedTrait]} 性狀`,
      );
      return;
    }

    // Check if trait is already assigned to another player
    if (isTraitAssignedToAnyPlayer(selectedTrait, playerId)) {
      const assignedPlayer = getPlayerWithTrait(selectedTrait);
      toast.error(
        `${TRAIT_LABELS[selectedTrait]} 性狀已分配給 ${assignedPlayer?.nickname}`,
      );
      return;
    }

    // Check if target player is required but not selected
    if (traitRequiresTarget(selectedTrait) && !targetPlayerId) {
      toast.error(`${TRAIT_LABELS[selectedTrait]} 性狀需要選擇目標玩家`);
      return;
    }

    // Apply GENETIC_MUTATION effect if player already has it and there's HP deduction
    let finalHpDeduction = hpDeduction;
    let geneticMutationReduction = 0;

    if (
      hpDeduction > 0 &&
      player.evolutionCards?.includes(EVOLUTION_TRAITS.GENE_MUTATION)
    ) {
      geneticMutationReduction = Math.min(3, hpDeduction);
      finalHpDeduction = Math.max(0, hpDeduction - 3);
    }

    setAssigningTraits((prev) => ({ ...prev, [playerId]: true }));

    try {
      const currentTraits = player.evolutionCards || [];
      const updatedTraits = [...currentTraits, selectedTrait];
      const newHp = Math.max(0, player.hp - finalHpDeduction);

      // Prepare update data
      const updatePayload: Partial<IPlayer> = {
        evolutionCards: updatedTraits,
        hp: newHp,
      };

      // Add target player ID for special traits
      if (selectedTrait === EVOLUTION_TRAITS.LION_KING) {
        updatePayload.minionId = targetPlayerId;
      } else if (selectedTrait === EVOLUTION_TRAITS.PARASITIC) {
        updatePayload.parasiticTargetId = targetPlayerId;
      }

      await updateData(`players/${playerId}`, updatePayload);

      // Create success message
      let message = `已為 ${player.nickname} 分配 ${TRAIT_LABELS[selectedTrait]} 性狀`;

      if (finalHpDeduction > 0) {
        message += ` 並扣除 ${finalHpDeduction} 點血量`;
      }

      if (geneticMutationReduction > 0) {
        message += `（基因突變減少 ${geneticMutationReduction} 點傷害）`;
      }

      if (targetPlayerId) {
        message += ` 目標為 ${players[targetPlayerId].nickname}`;
      }

      toast.success(message);

      // Clear the selected trait, HP deduction, target player and collapse the player
      setSelectedTraits((prev) => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
      setHpDeductions((prev) => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
      setTargetPlayers((prev) => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });
      setExpandedPlayer(null);
    } catch (error) {
      toast.error("分配性狀失敗");
      console.error("Error assigning trait:", error);
    } finally {
      setAssigningTraits((prev) => ({ ...prev, [playerId]: false }));
    }
  };

  const getTraitDescription = (trait: string) => {
    const descriptions: Record<EVOLUTION_TRAITS, string> = {
      [EVOLUTION_TRAITS.GENE_MUTATION]: "進化階段消耗減少3點血量",
      [EVOLUTION_TRAITS.DEADLY_POISON]: "死亡時攻擊者也會死亡",
      [EVOLUTION_TRAITS.BLOODTHIRSTY]:
        "戰鬥時勝者額外獲得2血量，敗者額外失去2血量",
      [EVOLUTION_TRAITS.SHARP_SPIKES]: "被攻擊時攻擊者先失去2血量",
      [EVOLUTION_TRAITS.HORUS_EYE]: "討論階段可查看其他玩家血量",
      [EVOLUTION_TRAITS.AMPHIBIOUS]: "可攻擊同元素玩家",
      [EVOLUTION_TRAITS.PARASITIC]: "寄生目標獲得血量時自己也獲得相同血量",
      [EVOLUTION_TRAITS.FOREST_SCEPTER]: "可決定攻擊順序",
      [EVOLUTION_TRAITS.TAIL_REGROWTH]: "可棄2張攻擊卡保留血量",
      [EVOLUTION_TRAITS.SPECIES_EXTINCTION]:
        "可移除特定元素所有玩家5血量（限一次）",
      [EVOLUTION_TRAITS.LION_KING]: "可指定一名手下，攻擊時手下也會攻擊",
      [EVOLUTION_TRAITS.FIERCE_GAZE]: "可不使用攻擊卡進行攻擊",
      [EVOLUTION_TRAITS.HIBERNATION]: "攻擊成功後本階段無法被攻擊",
      [EVOLUTION_TRAITS.SCAVENGER]: "任何玩家死亡時獲得4血量",
    };
    return descriptions[trait as EVOLUTION_TRAITS] || "";
  };

  const getTraitLabel = (trait: string) => {
    return TRAIT_LABELS[trait] || trait;
  };

  const getTraitIcon = (trait: string) => {
    switch (trait) {
      case EVOLUTION_TRAITS.LION_KING:
        return <Crown className="h-4 w-4 mr-1" />;
      case EVOLUTION_TRAITS.PARASITIC:
        return <Bug className="h-4 w-4 mr-1" />;
      default:
        return <Zap className="h-4 w-4 mr-1" />;
    }
  };

  const playerList = Object.values(players).sort((a, b) => a.number - b.number);

  if (availableTraits.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Zap className="h-5 w-5" />
            性狀分配
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>當前回合沒有可分配的性狀</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <Zap className="h-5 w-5" />
            性狀分配 - 第 {currentRound} 回合
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[500px] pr-2">
            <div className="space-y-3">
              {playerList.map((player) => {
                const isExpanded = expandedPlayer === player.id;
                const isAssigning = assigningTraits[player.id];
                const selectedTrait = selectedTraits[player.id];
                const hpDeduction = hpDeductions[player.id] || 0;
                const needsTarget =
                  !!selectedTrait && traitRequiresTarget(selectedTrait);
                const targetPlayerId = targetPlayers[player.id];
                const targetPlayer = targetPlayerId
                  ? players[targetPlayerId]
                  : null;

                // Calculate final HP deduction with GENETIC_MUTATION effect
                let finalHpDeduction = hpDeduction;
                let geneticMutationReduction = 0;
                const hasGeneticMutation = player.evolutionCards?.includes(
                  EVOLUTION_TRAITS.GENE_MUTATION,
                );

                if (hpDeduction > 0 && hasGeneticMutation) {
                  geneticMutationReduction = Math.min(3, hpDeduction);
                  finalHpDeduction = Math.max(0, hpDeduction - 3);
                }

                const resultingHp = player.hp - finalHpDeduction;

                return (
                  <div
                    key={player.id}
                    className="border rounded-lg overflow-hidden transition-all duration-200"
                  >
                    {/* Player Header - Always Visible */}
                    <div
                      className={`p-4 cursor-pointer transition-colors ${
                        isExpanded
                          ? "bg-blue-50 dark:bg-blue-900/20 border-b"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                      onClick={() => handlePlayerClick(player.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-base">
                              {player.number} {player.nickname}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getPlayerTypeLabel(player.type)} • HP: {player.hp}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Trait count indicator */}
                          {player.evolutionCards &&
                            player.evolutionCards.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {player.evolutionCards.length} 性狀
                              </Badge>
                            )}
                          {/* Expand/Collapse Icon */}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Current Traits - Always Visible */}
                      {player.evolutionCards &&
                        player.evolutionCards.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm text-muted-foreground mb-2">
                              已擁有性狀：
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {player.evolutionCards.map((trait, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {getTraitLabel(trait)}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Special Trait Targets - Always Visible */}
                      <div className="mt-3 space-y-1">
                        {player.minionId && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Crown className="h-3 w-3" />
                            <span>
                              手下：
                              {players[player.minionId]?.nickname || "未知玩家"}
                            </span>
                          </div>
                        )}
                        {player.parasiticTargetId && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Bug className="h-3 w-3" />
                            <span>
                              寄生目標：
                              {players[player.parasiticTargetId]?.nickname ||
                                "未知玩家"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Content - Trait Assignment */}
                    {isExpanded && (
                      <div className="p-4 bg-background border-t">
                        <div className="space-y-4">
                          {/* Trait Selection */}
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-muted-foreground">
                              選擇要分配的性狀：
                            </div>

                            <Select
                              value={selectedTraits[player.id] || ""}
                              onValueChange={(value) =>
                                handleTraitSelect(player.id, value)
                              }
                            >
                              <SelectTrigger className="min-h-[44px]">
                                <SelectValue placeholder="選擇性狀..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTraits.map((trait) => {
                                  const isAssignedToOther =
                                    isTraitAssignedToAnyPlayer(
                                      trait,
                                      player.id,
                                    );
                                  const isAssignedToSelf =
                                    player.evolutionCards?.includes(trait);
                                  const isDisabled =
                                    isAssignedToOther || isAssignedToSelf;
                                  const assignedPlayer = isAssignedToOther
                                    ? getPlayerWithTrait(trait)
                                    : null;

                                  return (
                                    <SelectItem
                                      key={trait}
                                      value={trait}
                                      disabled={isDisabled}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col">
                                          <div className="flex items-center">
                                            {getTraitIcon(trait)}
                                            <span className="font-medium">
                                              {getTraitLabel(trait)}
                                            </span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {getTraitDescription(trait)}
                                          </span>
                                        </div>

                                        {isAssignedToOther && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="ml-2 flex items-center">
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                              <p>
                                                已分配給{" "}
                                                {assignedPlayer?.nickname}
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}

                                        {isAssignedToSelf && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="ml-2 flex items-center">
                                                <Check className="h-4 w-4 text-green-500" />
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                              <p>已擁有此性狀</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>

                            {/* Target Player Selection - Only for LION_KING and PARASITIC */}
                            {needsTarget && (
                              <div className="space-y-3 mt-4">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                  {selectedTrait ===
                                  EVOLUTION_TRAITS.LION_KING ? (
                                    <>
                                      <Crown className="h-4 w-4" />
                                      選擇手下：
                                    </>
                                  ) : (
                                    <>
                                      <Bug className="h-4 w-4" />
                                      選擇寄生目標：
                                    </>
                                  )}
                                </div>

                                <Select
                                  value={targetPlayers[player.id] || ""}
                                  onValueChange={(value) =>
                                    handleTargetPlayerSelect(player.id, value)
                                  }
                                >
                                  <SelectTrigger className="min-h-[44px]">
                                    <SelectValue placeholder="選擇目標玩家..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {playerList
                                      .filter(
                                        (p) => p.id !== player.id && p.hp > 0,
                                      )
                                      .map((targetPlayer) => (
                                        <SelectItem
                                          key={targetPlayer.id}
                                          value={targetPlayer.id}
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                              {targetPlayer.number}{" "}
                                              {targetPlayer.nickname}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              (
                                              {getPlayerTypeLabel(
                                                targetPlayer.type,
                                              )}{" "}
                                              • HP: {targetPlayer.hp})
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>

                                {targetPlayer && (
                                  <div className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2">
                                      {selectedTrait ===
                                      EVOLUTION_TRAITS.LION_KING ? (
                                        <Crown className="h-4 w-4 text-amber-500" />
                                      ) : (
                                        <Bug className="h-4 w-4 text-green-600" />
                                      )}
                                      <span className="font-medium">
                                        已選擇：{targetPlayer.number}{" "}
                                        {targetPlayer.nickname}
                                      </span>
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {selectedTrait ===
                                      EVOLUTION_TRAITS.LION_KING
                                        ? "此玩家將成為你的手下，你攻擊時他也會攻擊同一目標"
                                        : "當此玩家獲得血量時，你也會獲得相同血量"}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* HP Deduction Input - Only show when trait is selected */}
                            {selectedTrait && (
                              <div className="space-y-3 mt-4">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                  <Heart className="h-4 w-4" />
                                  血量扣除：
                                </div>

                                {/* Mobile-friendly HP control panel */}
                                <div className="flex items-center justify-between bg-muted/30 rounded-lg p-1 border">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-10 w-10 rounded-md flex items-center justify-center"
                                    onClick={() =>
                                      handleHpDeductionChange(
                                        player.id,
                                        Math.max(
                                          0,
                                          (hpDeductions[player.id] || 0) - 1,
                                        ),
                                      )
                                    }
                                    disabled={hpDeduction <= 0}
                                  >
                                    <span className="text-lg font-bold">-</span>
                                  </Button>

                                  <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold">
                                      {hpDeduction}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      扣除血量
                                    </span>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-10 w-10 rounded-md flex items-center justify-center"
                                    onClick={() =>
                                      handleHpDeductionChange(
                                        player.id,
                                        Math.min(
                                          player.hp,
                                          (hpDeductions[player.id] || 0) + 1,
                                        ),
                                      )
                                    }
                                    disabled={hpDeduction >= player.hp}
                                  >
                                    <span className="text-lg font-bold">+</span>
                                  </Button>
                                </div>

                                {/* HP Preview with GENETIC_MUTATION effect */}
                                <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded border">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  <span className="font-medium">
                                    血量變化：
                                  </span>
                                  <span className="font-mono">{player.hp}</span>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  <span
                                    className={`font-mono font-bold ${
                                      resultingHp === 0
                                        ? "text-red-600"
                                        : resultingHp < player.hp
                                          ? "text-orange-600"
                                          : "text-foreground"
                                    }`}
                                  >
                                    {resultingHp}
                                  </span>
                                  {finalHpDeduction > 0 && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      (-{finalHpDeduction})
                                    </span>
                                  )}
                                </div>

                                {/* GENETIC_MUTATION effect indicator */}
                                {hasGeneticMutation && hpDeduction > 0 && (
                                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                                      <Zap className="h-4 w-4" />
                                      <span className="text-sm font-medium">
                                        基因突變效果
                                      </span>
                                    </div>
                                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                      性狀分配時傷害減少{" "}
                                      {geneticMutationReduction} 點 （原本{" "}
                                      {hpDeduction} → 實際 {finalHpDeduction}）
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Assign Button */}
                            <Button
                              onClick={() => handleAssignTrait(player.id)}
                              disabled={
                                !selectedTraits[player.id] ||
                                isAssigning ||
                                (needsTarget && !targetPlayers[player.id])
                              }
                              className="w-full min-h-[44px] mt-4"
                              size="lg"
                            >
                              {isAssigning ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>分配中...</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  <span>
                                    確認分配性狀
                                    {selectedTrait &&
                                      finalHpDeduction > 0 &&
                                      ` (扣除 ${finalHpDeduction} HP)`}
                                    {targetPlayer &&
                                      ` (目標: ${targetPlayer.nickname})`}
                                  </span>
                                </div>
                              )}
                            </Button>
                          </div>

                          {/* Trait Description */}
                          {selectedTraits[player.id] && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded border">
                              <strong>
                                {getTraitLabel(selectedTraits[player.id])}：
                              </strong>
                              {getTraitDescription(selectedTraits[player.id])}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Round Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <strong>第 {currentRound} 回合可用性狀：</strong>
              <div className="mt-1 flex flex-wrap gap-1">
                {availableTraits.map((trait) => {
                  const isAssigned = assignedTraitsMap[trait] !== undefined;
                  return (
                    <Badge
                      key={trait}
                      variant={isAssigned ? "secondary" : "outline"}
                      className={`text-xs ${isAssigned ? "opacity-60" : ""}`}
                    >
                      {getTraitLabel(trait)}
                      {isAssigned && " ✓"}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
