'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Shield,
  Zap,
  BookOpen,
  Wheat,
  RotateCcw,
  Check
} from 'lucide-react';
import { useRoadmapStore } from '@/hooks/useRoadmapStore';
import { seasonTasksList } from '@/data/progression/seasonTasks';
import { hyperboostTasksList } from '@/data/progression/hyperboostTasks';
import { olviaCombatTasksList } from '@/data/progression/olviaCombatTasks';
import { olviaLifeTasksList } from '@/data/progression/olviaLifeTasks';
import { masterCheckpointsList } from '@/data/progression/checkpoints';
import { CheckpointStatus } from '@/types/profile';
import { cn } from '@/lib/utils';

interface AccountSetupWizardProps {
  store: ReturnType<typeof useRoadmapStore>;
  onComplete: () => void;
}

export const AccountSetupWizard: React.FC<AccountSetupWizardProps> = ({ store, onComplete }) => {
  const {
    profile,
    updateStats,
    setSeasonTaskStatus,
    setHyperboostClaim,
    setOlviaCombatTaskStatus,
    setOlviaLifeTaskStatus,
    setSetupCompleted
  } = store;

  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;

  // Local stats state for Step 1
  const [apInput, setApInput] = useState<string>(profile.stats.ap ? String(profile.stats.ap) : '');
  const [aapInput, setAapInput] = useState<string>(profile.stats.aap ? String(profile.stats.aap) : '');
  const [dpInput, setDpInput] = useState<string>(profile.stats.dp ? String(profile.stats.dp) : '');
  const [isUnknownGS, setIsUnknownGS] = useState<boolean>(Boolean(profile.stats.isUnknownStats));
  const [charClass, setCharClass] = useState<string>(profile.stats.characterClass || 'Witch');

  const calculatedGS = () => {
    if (isUnknownGS) return 'ยังไม่ทราบ';
    const numAP = parseInt(apInput, 10) || 0;
    const numAAP = parseInt(aapInput, 10) || numAP;
    const numDP = parseInt(dpInput, 10) || 0;
    if (numAP === 0 && numDP === 0) return 'ยังไม่ทราบ';
    return Math.max(numAP, numAAP) + numDP;
  };

  const handleSaveStats = () => {
    if (isUnknownGS) {
      updateStats({
        ap: null,
        aap: null,
        dp: null,
        gearScore: null,
        characterClass: charClass,
        isUnknownStats: true
      });
    } else {
      const numAP = parseInt(apInput, 10) || 0;
      const numAAP = parseInt(aapInput, 10) || numAP;
      const numDP = parseInt(dpInput, 10) || 0;
      updateStats({
        ap: numAP > 0 ? numAP : null,
        aap: numAAP > 0 ? numAAP : null,
        dp: numDP > 0 ? numDP : null,
        characterClass: charClass,
        isUnknownStats: false
      });
    }
  };

  const handleFinishWizard = () => {
    handleSaveStats();
    setSetupCompleted(true);
    onComplete();
  };

  const handleNext = () => {
    if (step === 1) {
      handleSaveStats();
    }
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleFinishWizard();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 pb-20">
      
      {/* Wizard Top Progress Banner */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
              Account Setup Wizard
            </span>
            <h1 className="text-lg md:text-xl font-heading font-bold text-text-primary mt-1">
              ตั้งค่าความคืบหน้าบัญชีเริ่มต้น (Step {step} จาก {totalSteps})
            </h1>
          </div>
          <span className="text-xs font-mono text-brand-gold font-bold self-start sm:self-auto">
            ความคืบหน้า: {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-bg-surface-3 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-primary h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-bg-surface-1 border border-border-subtle rounded-xl p-5 md:p-6 shadow-lg space-y-5">
        
        {/* STEP 1: ข้อมูลตัวละคร & Gear Score */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 1: ข้อมูลตัวละคร & ค่าสเตตัส Gear Score
              </h2>
              <p className="text-xs text-text-secondary">
                กรอกค่าพลังโจมตี (AP), พลังโจมตีตื่นพลัง (AAP) และพลังป้องกัน (DP) ในปัจจุบัน ระบบจะคำนวณ Gear Score (GS) ให้อัตโนมัติ
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-text-muted block mb-1">
                  อาชีพหลัก (Main Class):
                </label>
                <select
                  value={charClass}
                  onChange={(e) => setCharClass(e.target.value)}
                  className="w-full bg-bg-surface-3 border border-border-subtle text-text-primary px-3 py-2 rounded-lg text-xs font-mono outline-none"
                >
                  <option value="Witch">Witch (Awakening / Succession)</option>
                  <option value="Wizard">Wizard (Awakening / Succession)</option>
                  <option value="Nova">Nova (Awakening / Succession)</option>
                  <option value="Scholar">Scholar (นักวิชาการ)</option>
                  <option value="Warrior">Warrior (นักรบ)</option>
                  <option value="Sorceress">Sorceress (ซอเซอร์เรส)</option>
                  <option value="Berserker">Berserker (เบอร์เซิร์กเกอร์)</option>
                  <option value="Other">อาชีพอื่นๆ (Other Classes)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-text-muted block mb-1">
                  การระบุสเตตัส (Status Option):
                </label>
                <button
                  type="button"
                  onClick={() => setIsUnknownGS(!isUnknownGS)}
                  className={cn(
                    "w-full py-2 px-3 rounded-lg text-xs font-mono font-medium border transition-colors flex items-center justify-center gap-2",
                    isUnknownGS
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : "bg-bg-surface-3 text-text-secondary border-border-subtle"
                  )}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isUnknownGS ? "เลือก: [ยังไม่ทราบค่าสเตตัส]" : "เลือก: [ต้องการกรอก AP/DP]"}</span>
                </button>
              </div>
            </div>

            {!isUnknownGS ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1">
                  <label className="text-[11px] font-mono text-amber-400 block font-bold">AP (พลังโจมตีหลัก)</label>
                  <input
                    type="number"
                    placeholder="เช่น 280"
                    value={apInput}
                    onChange={(e) => setApInput(e.target.value)}
                    className="w-full bg-bg-surface-3 border border-border-subtle rounded px-2.5 py-1.5 text-sm font-mono text-text-primary outline-none"
                  />
                </div>

                <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1">
                  <label className="text-[11px] font-mono text-purple-400 block font-bold">AAP (พลังโจมตีตื่นพลัง)</label>
                  <input
                    type="number"
                    placeholder="เช่น 282"
                    value={aapInput}
                    onChange={(e) => setAapInput(e.target.value)}
                    className="w-full bg-bg-surface-3 border border-border-subtle rounded px-2.5 py-1.5 text-sm font-mono text-text-primary outline-none"
                  />
                </div>

                <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1">
                  <label className="text-[11px] font-mono text-emerald-400 block font-bold">DP (พลังป้องกัน)</label>
                  <input
                    type="number"
                    placeholder="เช่น 350"
                    value={dpInput}
                    onChange={(e) => setDpInput(e.target.value)}
                    className="w-full bg-bg-surface-3 border border-border-subtle rounded px-2.5 py-1.5 text-sm font-mono text-text-primary outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-bg-surface-3 border border-border-subtle text-xs text-text-muted font-mono">
                ℹ️ คุณเลือก [ยังไม่ทราบค่าสเตตัส] ระบบจะเริ่มติดตามจากศูนย์ และคุณสามารถกลับมาแก้ไขสเตตัสที่แถบคำสั่งด้านบนได้ตลอดเวลา
              </div>
            )}

            <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Gear Score (GS) ที่คำนวณได้:</span>
              <span className="text-sm font-bold text-brand-gold">
                {typeof calculatedGS() === 'number' ? `${calculatedGS()} GS` : calculatedGS()}
              </span>
            </div>
          </div>
        )}

        {/* STEP 2: Season Progression Checklist */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 2: ตรวจสอบความคืบหน้าซีซั่น (Season Progression)
              </h2>
              <p className="text-xs text-text-secondary">
                ติ๊กเลือกภารกิจซีซั่นที่คุณทำเสร็จแล้วจริง (หากยังไม่ได้ทำหรือไม่แน่ใจให้เว้นว่างไว้)
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {seasonTasksList.map((task) => {
                const currentStatus = profile.seasonTasks[task.id] || 'UNKNOWN';
                const isDone = currentStatus === 'COMPLETED';

                return (
                  <div
                    key={task.id}
                    onClick={() => setSeasonTaskStatus(task.id, isDone ? 'NOT_STARTED' : 'COMPLETED')}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3",
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-bg-surface-2 border-border-subtle hover:border-border-active"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                        isDone
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-border-subtle bg-bg-surface-3"
                      )}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-text-primary flex items-center gap-2">
                        <span>{task.title}</span>
                        {isDone && <span className="text-[10px] font-mono text-emerald-400">[เสร็จแล้ว]</span>}
                      </div>
                      <p className="text-[11px] text-text-secondary">{task.description}</p>
                      <div className="text-[10px] font-mono text-amber-300/90 pt-0.5">
                        รางวัล: {task.reward}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Hyperboost & Blackstar Claims */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 3: ตรวจสอบอาวุธดวงดาวรัตติกาล PEN & ไฮเปอร์บูสต์
              </h2>
              <p className="text-xs text-text-secondary">
                ระบุว่าคุณได้กดรับกล่องอาวุธ PEN Blackstar และนำไปใช้งานแล้วหรือไม่ (แยกสถานะชัดเจน)
              </p>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {hyperboostTasksList.map((task) => {
                const claimState = profile.hyperboostClaims[task.id] || { claimed: false, used: false, status: 'UNKNOWN' };

                return (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-text-primary text-xs">{task.title}</span>
                        <div className="text-[10px] font-mono text-text-muted">{task.sourceType}</div>
                      </div>
                      {task.safetyTag === 'DO_NOT_OPEN_YET' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                          [อย่าเพิ่งเปิดกล่อง]
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setHyperboostClaim(task.id, 'claimed', !claimState.claimed)}
                        className={cn(
                          "py-1.5 px-2 rounded text-[11px] font-mono transition-colors border flex items-center justify-center gap-1.5",
                          claimState.claimed
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/40 font-bold"
                            : "bg-bg-surface-3 text-text-muted border-border-subtle"
                        )}
                      >
                        <Check className={cn("w-3 h-3", claimState.claimed ? "opacity-100" : "opacity-0")} />
                        <span>{claimState.claimed ? "กดรับรางวัลแล้ว" : "ยังไม่ได้รับของ"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setHyperboostClaim(task.id, 'used', !claimState.used)}
                        className={cn(
                          "py-1.5 px-2 rounded text-[11px] font-mono transition-colors border flex items-center justify-center gap-1.5",
                          claimState.used
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold"
                            : "bg-bg-surface-3 text-text-muted border-border-subtle"
                        )}
                      >
                        <Check className={cn("w-3 h-3", claimState.used ? "opacity-100" : "opacity-0")} />
                        <span>{claimState.used ? "ใช้งาน/หลอมแล้ว" : "ยังไม่ได้ใช้งาน"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Olvia Combat Academy */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 4: สถาบันฝึกฝนการต่อสู้ Olvia Academy (Combat)
              </h2>
              <p className="text-xs text-text-secondary">
                ติ๊กเลือกภารกิจสายต่อสู้ที่คุณเคลียร์เสร็จแล้ว (เช่น อัญมณีกิริน, หัวใจของกามอส, วิหารไกฟิน)
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {olviaCombatTasksList.map((task) => {
                const isDone = profile.olviaCombatTasks[task.id] === 'COMPLETED';

                return (
                  <div
                    key={task.id}
                    onClick={() => setOlviaCombatTaskStatus(task.id, isDone ? 'NOT_STARTED' : 'COMPLETED')}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3",
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-bg-surface-2 border-border-subtle hover:border-border-active"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                        isDone
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-border-subtle bg-bg-surface-3"
                      )}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-text-primary flex items-center gap-2">
                        <span>{task.title}</span>
                        {task.isImportantReward && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            [รางวัลสำคัญ]
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary">{task.objective}</p>
                      <div className="text-[10px] font-mono text-emerald-400 pt-0.5">
                        รางวัล: {task.reward}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: Olvia Life Skill Academy */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 5: สถาบันสายอาชีพ Olvia Academy (Life Skill)
              </h2>
              <p className="text-xs text-text-secondary">
                ติ๊กเลือกภารกิจสาย Life Skill ที่คุณทำสำเร็จแล้ว (เช่น การทำอาหาร, ส่งราชสำนัก, เก็บเกี่ยว)
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {olviaLifeTasksList.map((task) => {
                const isDone = profile.olviaLifeTasks[task.id] === 'COMPLETED';

                return (
                  <div
                    key={task.id}
                    onClick={() => setOlviaLifeTaskStatus(task.id, isDone ? 'NOT_STARTED' : 'COMPLETED')}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3",
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-bg-surface-2 border-border-subtle hover:border-border-active"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                        isDone
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-border-subtle bg-bg-surface-3"
                      )}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="font-bold text-text-primary flex items-center gap-2">
                        <span className="text-emerald-400 font-mono">[{task.skillName.split(' ')[0]}]</span>
                        <span>{task.title}</span>
                      </div>
                      <p className="text-[11px] text-text-secondary">{task.objective}</p>
                      <div className="text-[10px] font-mono text-amber-300/90 pt-0.5">
                        รางวัล: {task.reward}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: Journals & Permanent Stats */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 6: บันทึกการผจญภัย & สเตตัสถาวรประจำตระกูล
              </h2>
              <p className="text-xs text-text-secondary">
                ติ๊กเลือกสมุดบันทึกการผจญภัยที่คุณเคลียร์เสร็จแล้ว (รับ AP/DP ถาวร)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'bartali_1', name: 'บันทึกอีกอร์ บาร์ทัลลี่ (Igor Bartali)', bonus: 'AP +4, DP +2, HP +90' },
                { id: 'deve_1', name: 'บันทึกสารานุกรมเดฟ (Deve Encyclopedia)', bonus: 'AP +1' },
                { id: 'dorin_1', name: 'บันทึกลับโดริน มอร์กริม (Dorin Morgrim)', bonus: 'AP +1, DP +1' },
                { id: 'herald_1', name: 'บันทึกนักข่าวรูบิน (Herald Journal)', bonus: 'Stamina +100, Max Weight' },
                { id: 'pavino_1', name: 'บันทึกพาวิโน เกรโก (Pavino Greko)', bonus: 'Max HP +600' },
                { id: 'barrier_1', name: 'เควสปราการแห่งการต่อสู้ (Barrier of Infestation)', bonus: 'AP +1, DP +1' },
                { id: 'loml_1', name: 'ศาลาราชันประเทศแห่งรุ่งอรุณ (LoML Boss Blitz)', bonus: 'AP +1, DP +1' }
              ].map((j) => {
                const isDone = profile.journalChapters[j.id] === 'COMPLETED';

                return (
                  <div
                    key={j.id}
                    onClick={() => store.setJournalChapterStatus(j.id, isDone ? 'NOT_STARTED' : 'COMPLETED')}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5",
                      isDone
                        ? "bg-emerald-500/10 border-emerald-500/40"
                        : "bg-bg-surface-2 border-border-subtle hover:border-border-active"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                        isDone
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "border-border-subtle bg-bg-surface-3"
                      )}
                    >
                      {isDone && <Check className="w-3 h-3" />}
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-text-primary">{j.name}</div>
                      <div className="text-[10px] font-mono text-emerald-400">{j.bonus}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Treasures & Infrastructure */}
        {step === 7 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 7: สมบัติโบราณ & โครงสร้างพื้นฐานบัญชี
              </h2>
              <p className="text-xs text-text-secondary">
                ติ๊กเลือกสมบัติโบราณและสิ่งอำนวยความสะดวกที่คุณครอบครองแล้ว
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'panacea', name: 'น้ำยาเลือดโอเนท (Ornette Infinite HP)', type: 'TREASURE' },
                { id: 'markthanan_gland', name: 'น้ำยามานาโอโดเร (Odore Infinite MP)', type: 'TREASURE' },
                { id: 'map_piece_1', name: 'แผนที่นักโบราณคดี (Archaeologist Map)', type: 'TREASURE' },
                { id: 'compass_vodkhan', name: 'เข็มทิศดัดแปลง (Upgraded Compass)', type: 'TREASURE' },
                { id: 'telescope_tungrad', name: 'กล้องส่องทางไกล (Upgraded Telescope)', type: 'TREASURE' },
                { id: 'krogdalo_arduanatt', name: 'รังของโครกดาโล (Krogdalo Sanctuary)', type: 'TREASURE' }
              ].map((tr) => {
                const isDone = Boolean(profile.treasurePieces[tr.id]);

                return (
                  <div
                    key={tr.id}
                    onClick={() => store.toggleTreasurePiece(tr.id)}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5",
                      isDone
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-bg-surface-2 border-border-subtle hover:border-border-active"
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors",
                        isDone
                          ? "bg-brand-gold text-white border-brand-gold"
                          : "border-border-subtle bg-bg-surface-3"
                      )}
                    >
                      {isDone && <Check className="w-3 h-3" />}
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-bold text-text-primary">{tr.name}</div>
                      <span className="text-[10px] font-mono text-text-muted">[{tr.type}]</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 8: Summary & Start Dashboard */}
        {step === 8 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-heading font-bold text-text-primary">
                ขั้นตอนที่ 8: ตรวจสอบและเริ่มต้นเข้าสู่หน้าแดชบอร์ด
              </h2>
              <p className="text-xs text-text-secondary">
                ระบบได้รวบรวมข้อมูลที่คุณติ๊กเลือก และพร้อมคำนวณเป้าหมายถัดไปที่คุณควรทำใน Black Desert Online
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">Gear Score</span>
                <span className="text-base font-bold text-brand-gold">
                  {profile.stats.isUnknownStats ? 'ยังไม่ระบุ' : `${profile.stats.gearScore || 0} GS`}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">ภารกิจซีซั่น</span>
                <span className="text-base font-bold text-emerald-400">
                  {store.progressStats.season.completed} / {store.progressStats.season.total}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">Olvia สายต่อสู้</span>
                <span className="text-base font-bold text-blue-400">
                  {store.progressStats.olviaCombat.completed} / {store.progressStats.olviaCombat.total}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-bg-surface-2 border border-border-subtle text-center">
                <span className="text-[10px] text-text-muted block">Olvia สาย Life</span>
                <span className="text-base font-bold text-purple-400">
                  {store.progressStats.olviaLife.completed} / {store.progressStats.olviaLife.total}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-bg-surface-2/80 border border-brand-primary/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-brand-primary font-bold">
                <Zap className="w-4 h-4" />
                <span>ผลการประเมินขั้นปัจจุบัน (Current Phase):</span>
              </div>
              <div className="font-heading font-bold text-text-primary text-sm">
                {store.currentPhase.name}
              </div>
              <p className="text-text-secondary text-xs">
                {store.currentPhase.desc}
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-surface-2 hover:bg-bg-surface-3 border border-border-subtle text-xs font-mono font-medium text-text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ย้อนกลับ (Back)</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {step < totalSteps && (
            <button
              type="button"
              onClick={() => setStep(totalSteps)}
              className="px-3 py-2 rounded-lg text-xs font-mono text-text-muted hover:text-text-secondary transition-colors"
            >
              ข้ามไปขั้นตอนสุดท้าย
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary hover:bg-purple-600 text-xs font-mono font-bold text-white shadow-md transition-colors"
          >
            <span>{step === totalSteps ? 'บันทึกและเข้าสู่แดชบอร์ด' : 'ขั้นตอนถัดไป (Next)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
