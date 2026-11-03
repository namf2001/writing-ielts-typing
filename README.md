# ✍️ IELTS TypeMaster - IELTS Speed Typing & AI Writing Coach

Ứng dụng web luyện viết và gõ tốc độ IELTS Writing (Task 1 & Task 2) kết hợp hệ thống AI chấm điểm và phân tích chi tiết thời gian thực **100% Miễn phí & Siêu nhanh** qua **Groq AI (Qwen 3.8 / GPT-OSS)** kế thừa từ dự án `rac-vl`.

---

## 🌟 Những cải tiến nổi bật so với bản gốc

1. **Thay thế hoàn toàn Gemini bằng Groq Cloud Inference (Miễn phí & Cực nhanh)**:
   - Sử dụng model `qwen/qwen3.8-27b` và cascade fallback tự động (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`), phản hồi chỉ trong **0.5 - 2 giây** thay vì 10-15 giây.
   - Không lo lỗi quota hay chi phí Gemini API.
   - Hỗ trợ nhập và kiểm tra trực tiếp Groq API Key trong modal Cài đặt mà không cần sửa code.
2. **Sửa lỗi phân tích chi tiết bài viết (Detailed Annotations)**:
   - Bản gốc không truyền `essay` và `prompt` vào modal chấm điểm khiến tab phân tích lỗi không bao giờ kích hoạt được.
   - Bản mới đã khắc phục hoàn toàn: highlight chính xác từng lỗi chính tả, ngữ pháp, từ vựng học thuật, kèm giải thích tiếng Việt và nút sao chép cách sửa 1-click.
3. **Âm thanh gõ phím cơ học đa dạng (Mechanical Switch Profiles)**:
   - Mô phỏng âm thanh 4 loại switch: 🔵 Blue Clicky, 🟤 Brown Thock, 🔴 Red Linear, ⌨️ Typewriter cổ điển qua Web Audio API.
   - Tích hợp thanh trượt âm lượng và nút nghe thử ngay trong cài đặt.
4. **Chế độ Flashcard học từ vựng thông minh**:
   - Chuyển đổi giữa chế độ Danh sách và Lật thẻ Flashcard (Front/Back) có phát âm giọng chuẩn bản xứ.
   - Đánh dấu trạng thái "Đã thuộc" và "Cần ôn lại".
   - Thêm nhanh từ vựng mới tự động dịch sang tiếng Việt.
5. **Đồng hồ đếm ngược phòng thi (Exam Mode)**:
   - Luyện tập với áp lực phòng thi thật (20 phút Task 1, 40 phút Task 2) với cảnh báo đổi màu khi sắp hết giờ.
6. **Sao lưu & phục hồi dữ liệu 1-click**:
   - Xuất toàn bộ tiến trình, lịch sử làm bài, từ vựng ra file JSON để đồng bộ giữa các thiết bị.

---

## 🚀 Khởi chạy dự án

### 1. Cài đặt dependencies

```bash
pnpm install
```

### 2. Cấu hình môi trường (.env.local)

File `.env.local` đã được cấu hình sẵn Groq API Key miễn phí từ `rac-vl`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```

### 3. Chạy môi trường phát triển (Development)

```bash
pnpm dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

### 4. Build sản phẩm (Production)

```bash
pnpm build
pnpm start
```

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 16 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Radix UI, Lucide Icons, Next Themes (Light/Dark mode)
- **AI Core**: Groq SDK (`qwen/qwen3.8-27b`, `openai/gpt-oss-120b`)
- **Web Audio API**: Bộ tổng hợp âm phím cơ học thời gian thực
- **Lưu trữ**: LocalStorage với hệ thống Backup & Restore JSON
