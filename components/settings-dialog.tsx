"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sparkles,
  Volume2,
  Sliders,
  Database,
  Check,
  AlertCircle,
  Loader2,
  Play,
  Download,
  Upload,
  KeyRound,
  Eye,
  EyeOff,
  Type,
  BookOpen,
  FileText,
  PenTool,
  Baseline,
} from "lucide-react"
import {
  getSettings,
  updateSettings,
  exportAllData,
  importAllData,
  type UserSettings,
} from "@/lib/storage"
import { AVAILABLE_GROQ_MODELS, DEFAULT_GROQ_MODEL } from "@/lib/ai"
import { useSound, type SoundTheme } from "@/hooks/use-sound"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [settings, setSettings] = useState<UserSettings>(getSettings())
  const [showKey, setShowKey] = useState(false)
  const [testStatus, setTestStatus] = useState<{
    loading: boolean
    ok?: boolean
    message?: string
  }>({ loading: false })
  const [importStatus, setImportStatus] = useState<string | null>(null)

  const { playKeySound } = useSound()

  useEffect(() => {
    if (open) {
      setSettings(getSettings())
      setTestStatus({ loading: false })
    }
  }, [open])

  const handleUpdate = (updates: Partial<UserSettings>) => {
    const updated = updateSettings(updates)
    setSettings(updated)
  }

  const handleTestAi = async () => {
    setTestStatus({ loading: true })
    try {
      const res = await fetch("/api/ai-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: settings.groqApiKey || undefined,
          model: settings.groqModel || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setTestStatus({
          loading: false,
          ok: true,
          message: `${data.message} (Model: ${data.model})`,
        })
      } else {
        setTestStatus({
          loading: false,
          ok: false,
          message: data.error || "Kết nối thất bại. Vui lòng kiểm tra lại API Key.",
        })
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        ok: false,
        message: err?.message || "Lỗi mạng khi kiểm tra kết nối.",
      })
    }
  }

  const handleExport = () => {
    const json = exportAllData()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ielts-writing-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        const success = importAllData(content)
        if (success) {
          setImportStatus("Nhập dữ liệu thành công! Đang làm mới...")
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          setImportStatus("Dữ liệu không hợp lệ. Vui lòng thử lại.")
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sliders className="w-5 h-5 text-primary" />
            Cài đặt hệ thống
          </DialogTitle>
          <DialogDescription>
            Tùy chỉnh AI Groq miễn phí, âm thanh gõ phím cơ học, giao diện và sao lưu dữ liệu.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" className="mt-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="ai" className="gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Miễn phí
            </TabsTrigger>
            <TabsTrigger value="sound" className="gap-1.5 text-xs sm:text-sm">
              <Volume2 className="w-4 h-4 text-emerald-500" />
              Bàn phím & Âm
            </TabsTrigger>
            <TabsTrigger value="writing" className="gap-1.5 text-xs sm:text-sm">
              <Sliders className="w-4 h-4 text-blue-500" />
              Luyện thi
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-1.5 text-xs sm:text-sm">
              <Database className="w-4 h-4 text-purple-500" />
              Dữ liệu
            </TabsTrigger>
          </TabsList>

          {/* AI TAB */}
          <TabsContent value="ai" className="space-y-4 pt-4">
            <div className="rounded-lg border bg-secondary/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    Groq Cloud Inference (Tối ưu tốc độ cao & 100% Miễn phí)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sử dụng model Qwen 3.8 / GPT-OSS cực nhanh từ workspace rac-vl, không tốn phí Gemini.
                  </p>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  Free Tier Ready
                </Badge>
              </div>

              {/* API KEY */}
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-medium flex items-center justify-between">
                  <span>Groq API Key (Tùy chọn ghi đè)</span>
                  <span className="text-[11px] text-muted-foreground">
                    Để trống sẽ dùng key mặc định từ hệ thống
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="gsk_..."
                    value={settings.groqApiKey}
                    onChange={(e) => handleUpdate({ groqApiKey: e.target.value })}
                    className="pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* MODEL SELECT */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Model AI chấm & phân tích bài</Label>
                <Select
                  value={settings.groqModel || DEFAULT_GROQ_MODEL}
                  onValueChange={(val) => handleUpdate({ groqModel: val })}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Chọn model AI" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_GROQ_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-xs">
                        <span className="font-medium">{m.name}</span>{" "}
                        <span className="text-muted-foreground">({m.id})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TEST CONNECTION */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestAi}
                  disabled={testStatus.loading}
                  className="gap-2"
                >
                  {testStatus.loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  Kiểm tra kết nối AI
                </Button>

                {testStatus.message && (
                  <div
                    className={`text-xs flex items-center gap-1.5 font-medium ${
                      testStatus.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                    }`}
                  >
                    {testStatus.ok ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{testStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SOUND & KEYBOARD TAB */}
          <TabsContent value="sound" className="space-y-4 pt-4">
            <div className="rounded-lg border bg-secondary/30 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Âm thanh gõ phím cơ học</h4>
                  <p className="text-xs text-muted-foreground">
                    Mô phỏng âm gõ switch phím cơ học mượt mà qua Web Audio API (không tốn dung lượng).
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => handleUpdate({ soundEnabled: checked })}
                />
              </div>

              {settings.soundEnabled && (
                <>
                  {/* SOUND PROFILE */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Loại Switch âm thanh</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "clicky", name: "🔵 Blue Clicky", desc: "Đanh giòn" },
                        { id: "tactile", name: "🟤 Brown Thock", desc: "Trầm ấm" },
                        { id: "soft", name: "🔴 Red Linear", desc: "Êm ái" },
                        { id: "typewriter", name: "⌨️ Typewriter", desc: "Cổ điển" },
                      ].map((sw) => (
                        <div
                          key={sw.id}
                          onClick={() => {
                            handleUpdate({ soundTheme: sw.id as SoundTheme })
                            playKeySound(sw.id as SoundTheme)
                          }}
                          className={`cursor-pointer border rounded-lg p-2.5 text-center transition-all ${
                            settings.soundTheme === sw.id
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="font-medium text-xs">{sw.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{sw.desc}</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-full mt-1.5 text-[10px] gap-1 px-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              playKeySound(sw.id as SoundTheme)
                            }}
                          >
                            <Play className="w-2.5 h-2.5" /> Thử
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VOLUME SLIDER */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <Label>Âm lượng bàn phím</Label>
                      <span className="font-mono text-muted-foreground">
                        {Math.round((settings.soundVolume ?? 0.15) * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[(settings.soundVolume ?? 0.15) * 100]}
                      min={5}
                      max={60}
                      step={5}
                      onValueChange={([val]) => {
                        handleUpdate({ soundVolume: val / 100 })
                        playKeySound()
                      }}
                    />
                  </div>
                </>
              )}

              {/* VIRTUAL KEYBOARD TOGGLE */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <h4 className="font-semibold text-sm">Bàn phím ảo trực quan</h4>
                  <p className="text-xs text-muted-foreground">
                    Hiển thị phím đang gõ và phím tiếp theo ở chân trang màn hình luyện tập.
                  </p>
                </div>
                <Switch
                  checked={settings.showKeyboard}
                  onCheckedChange={(checked) => handleUpdate({ showKeyboard: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* WRITING TAB */}
          <TabsContent value="writing" className="space-y-4 pt-4">
            <div className="rounded-lg border bg-secondary/30 p-4 space-y-5">
              {/* NOTEBOOK FONT FAMILY */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-500" />
                  Font chữ soạn thảo & Notebook
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "mono", name: "Typewriter", sub: "JetBrains Mono", preview: "The quick brown fox", fontStyle: 'var(--font-mono-jb), "JetBrains Mono", monospace' },
                    { id: "serif", name: "Academic", sub: "Merriweather", preview: "The quick brown fox", fontStyle: 'var(--font-merriweather), "Merriweather", Georgia, serif' },
                    { id: "sans", name: "Modern", sub: "Inter Sans", preview: "The quick brown fox", fontStyle: 'var(--font-inter), "Inter", sans-serif' },
                    { id: "handwriting", name: "Notebook", sub: "Caveat Script", preview: "The quick brown fox", fontStyle: 'var(--font-caveat), "Caveat", cursive' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleUpdate({ fontFamily: f.id as any })}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        (settings.fontFamily || "mono") === f.id
                          ? "bg-[#FFC93C] text-[#141414] border-[#141414] shadow-[2px_2px_0_#141414] font-bold"
                          : "bg-white dark:bg-[#181C26] border-[#141414]/30 dark:border-[#384259] hover:border-[#141414]"
                      }`}
                    >
                      <div className="text-xs font-black">{f.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{f.sub}</div>
                      <div
                        className="mt-1.5 text-xs font-bold opacity-90 truncate"
                        style={{
                          fontFamily: f.fontStyle,
                          fontSize: f.id === "handwriting" ? "15px" : "13px",
                        }}
                      >
                        {f.preview}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTEBOOK PAPER STYLE */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" />
                  Kiểu trang vở (Notebook Paper Style)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "ruled", label: "Dòng kẻ ngang", desc: "Kẻ li vở + lề đỏ" },
                    { id: "grid", label: "Ô li Caro", desc: "Lưới 24px học sinh" },
                    { id: "dot", label: "Chấm Bullet", desc: "Bullet journal dots" },
                    { id: "blank", label: "Giấy trơn", desc: "Warm clean paper" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleUpdate({ notebookPaperStyle: p.id as any })}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        (settings.notebookPaperStyle || "ruled") === p.id
                          ? "bg-[#FFC93C] text-[#141414] border-[#141414] shadow-[2px_2px_0_#141414] font-bold"
                          : "bg-white dark:bg-[#181C26] border-[#141414]/30 dark:border-[#384259] hover:border-[#141414]"
                      }`}
                    >
                      <div className="text-xs font-black">{p.label}</div>
                      <div className="text-[10px] text-muted-foreground">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* UNTYPED TEXT COLOR */}
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-blue-500" />
                  Màu chữ mẫu chuẩn bị gõ (Dễ phân biệt)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "blue", name: "Mực xanh", desc: "Xanh dương học sinh", colorClass: "text-[#2563EB] dark:text-[#93C5FD]" },
                    { id: "purple", name: "Mực tím", desc: "Mực tím hoa cà", colorClass: "text-[#7C3AED] dark:text-[#C4B5FD]" },
                    { id: "teal", name: "Mực ngọc", desc: "Xanh ngọc học thuật", colorClass: "text-[#0D9488] dark:text-[#5EEAD4]" },
                    { id: "slate", name: "Xám khói", desc: "Đậm nét tương phản", colorClass: "text-[#475569] dark:text-[#94A3B8]" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleUpdate({ untypedTextColor: c.id as any })}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        (settings.untypedTextColor || "blue") === c.id
                          ? "bg-[#FFC93C] text-[#141414] border-[#141414] shadow-[2px_2px_0_#141414] font-bold"
                          : "bg-white dark:bg-[#181C26] border-[#141414]/30 dark:border-[#384259] hover:border-[#141414]"
                      }`}
                    >
                      <div className={`text-xs font-black ${c.colorClass}`}>{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* FONT SIZE & LINE HEIGHT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                {/* FONT SIZE */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <Label className="text-xs font-bold uppercase">Cỡ chữ soạn thảo</Label>
                    <span className="font-mono text-[#FF9F0A] dark:text-[#FFC93C]">{settings.fontSize || 18}px</span>
                  </div>
                  <Slider
                    value={[settings.fontSize || 18]}
                    min={14}
                    max={24}
                    step={1}
                    onValueChange={([val]) => handleUpdate({ fontSize: val })}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>14px (Nhỏ)</span>
                    <span>18px (Chuẩn)</span>
                    <span>24px (Lớn)</span>
                  </div>
                </div>

                {/* LINE HEIGHT */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Giãn dòng trang vở</Label>
                  <Select
                    value={settings.lineHeight || "normal"}
                    onValueChange={(val: any) => handleUpdate({ lineHeight: val })}
                    className="w-full"
                  >
                    <SelectTrigger className="text-xs font-bold">
                      <SelectValue placeholder="Chọn giãn dòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Thu gọn (Gọn gàng)</SelectItem>
                      <SelectItem value="normal">Tiêu chuẩn (Chuẩn vở viết)</SelectItem>
                      <SelectItem value="relaxed">Rộng rãi (Thoáng mắt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CARET STYLE & INK ANIMATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                {/* CARET STYLE */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase">Kiểu con trỏ phím (Caret)</Label>
                  <Select
                    value={settings.caretStyle || "bar"}
                    onValueChange={(val: any) => handleUpdate({ caretStyle: val })}
                    className="w-full"
                  >
                    <SelectTrigger className="text-xs font-bold">
                      <SelectValue placeholder="Kiểu con trỏ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">| Thanh đứng phát sáng (Smooth Bar)</SelectItem>
                      <SelectItem value="block">█ Khối cơ học cổ điển (Classic Block)</SelectItem>
                      <SelectItem value="underline">_ Gạch chân viết mực (Underline)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* INK POP ANIMATION */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border-2 border-[#141414]/20 bg-white dark:bg-[#181C26] dark:border-[#384259]">
                  <div>
                    <h4 className="font-bold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF9F0A]" />
                      Hiệu ứng chữ nảy (Ink Pop)
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Hoạt họa mực nảy nhẹ vi mô khi gõ
                    </p>
                  </div>
                  <Switch
                    checked={settings.textAnimation ?? true}
                    onCheckedChange={(checked) => handleUpdate({ textAnimation: checked })}
                  />
                </div>
              </div>

              {/* EXAM COUNTDOWN */}
              <div className="space-y-1.5 pt-2 border-t">
                <Label className="text-xs font-bold uppercase tracking-wider">Đồng hồ đếm ngược phòng thi (Exam Mode)</Label>
                <Select
                  value={String(settings.examTimerMinutes || 0)}
                  onValueChange={(val) => handleUpdate({ examTimerMinutes: Number(val) })}
                  className="w-full"
                >
                  <SelectTrigger className="text-xs font-bold">
                    <SelectValue placeholder="Chọn thời gian thi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Không giới hạn thời gian (Tự do luyện tập)</SelectItem>
                    <SelectItem value="20">20 phút chuẩn (IELTS Task 1)</SelectItem>
                    <SelectItem value="40">40 phút chuẩn (IELTS Task 2)</SelectItem>
                    <SelectItem value="60">60 phút chuẩn (Full Writing Test)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AUTO SAVE */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <h4 className="font-bold text-xs">Tự động lưu bài viết (Auto-Save)</h4>
                  <p className="text-[10px] text-muted-foreground">
                    Tự động lưu bản nháp mỗi khi gõ phím để không bị mất bài khi tải lại trang.
                  </p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleUpdate({ autoSave: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* DATA TAB */}
          <TabsContent value="data" className="space-y-4 pt-4">
            <div className="rounded-lg border bg-secondary/30 p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Sao lưu & Phục hồi dữ liệu</h4>
                <p className="text-xs text-muted-foreground">
                  Dữ liệu được lưu trữ an toàn trên trình duyệt của bạn (Local Storage). Bạn có thể sao lưu ra file JSON để chuyển sang máy khác.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Button variant="outline" onClick={handleExport} className="gap-2 text-xs">
                  <Download className="w-4 h-4" />
                  Xuất dữ liệu dự phòng (JSON)
                </Button>

                <div className="relative">
                  <Button variant="outline" className="w-full gap-2 text-xs">
                    <Upload className="w-4 h-4" />
                    Nhập dữ liệu từ file JSON
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {importStatus && (
                <p className="text-xs font-medium text-primary text-center">{importStatus}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
