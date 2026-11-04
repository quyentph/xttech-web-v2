# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU - PHÂN HỆ TIN TỨC (NEWS & CMS)

- **Hệ quản trị CSDL:** PostgreSQL 14+ (tập tin SQL thực thi: `database/schema.sql`)
- **Mục tiêu:** Cung cấp đầy đủ cấu trúc bảng, chỉ mục và ràng buộc toàn vẹn cho phân hệ quản lý bài viết (CMS `/news`) và trang tin tức công khai (`/new`).

---

## 1. SƠ ĐỒ MỐI QUAN HỆ BẢNG (TEXT-BASED ERD)

```text
+-------------------+        1 : n        +-------------------+
|      roles        | ------------------> |       users       |
+-------------------+                     +-------------------+
                                                    | 1
                                                    |
                                                    | n
+-------------------+        1 : n        +-------------------+        1 : n        +--------------------+
|    categories     | ------------------> |     articles      | ------------------> |      comments      |
|  (parent - child) |                     +-------------------+                     |  (parent - child)  |
+-------------------+                       | 1           | 1                       +--------------------+
          ^                                 |             |                                   ^
          | (parent_id)                     | n           | n                                 | (parent_id)
          +---------------------------------+             |                                   +------------------+
                                                          |
                                      +-------------------+-------------------+
                                      |                   |                   |
                                      v n                 v n                 v n
                              +----------------+  +----------------+  +-----------------+
                              |  article_tags  |  | article_views  |  | saved_articles  |
                              +----------------+  +----------------+  +-----------------+
                                      ^
                                      | n
                              +----------------+
                              |      tags      |
                              +----------------+

+----------------------------+
|   newsletter_subscribers   |  (Độc lập - Thu thập email tiếp thị bản tin)
+----------------------------+
```

### Chi tiết các liên kết khóa ngoại (Foreign Keys):
1. `users.role_id` $\rightarrow$ `roles.id`: Xác định quyền hạn (admin, editor, author, reader).
2. `categories.parent_id` $\rightarrow$ `categories.id` (Tự tham chiếu): Tạo cấu trúc chuyên mục đa cấp (Cha - Con).
3. `articles.category_id` $\rightarrow$ `categories.id`: Mỗi bài viết thuộc về một chuyên mục chính.
4. `articles.author_id` $\rightarrow$ `users.id`: Mỗi bài viết gắn liền với một tác giả.
5. `article_tags.article_id` $\rightarrow$ `articles.id` (CASCADE): Liên kết bài viết với thẻ.
6. `article_tags.tag_id` $\rightarrow$ `tags.id` (CASCADE): Liên kết thẻ với bài viết.
7. `comments.article_id` $\rightarrow$ `articles.id` (CASCADE): Bài viết bị xoá thì toàn bộ bình luận liên quan bị xoá theo.
8. `comments.user_id` $\rightarrow$ `users.id` (SET NULL): Người dùng bị xoá thì bình luận vẫn lưu ẩn danh.
9. `comments.parent_id` $\rightarrow$ `comments.id` (CASCADE): Bình luận cha bị xoá thì các câu trả lời lồng nhau bị xoá theo.
10. `article_views.article_id` $\rightarrow$ `articles.id` (CASCADE): Thống kê lượt xem theo bài viết.
11. `saved_articles.user_id` $\rightarrow$ `users.id` (CASCADE) & `saved_articles.article_id` $\rightarrow$ `articles.id` (CASCADE): Danh sách bài viết được đánh dấu bởi người dùng (ràng buộc duy nhất `UNIQUE(user_id, article_id)`).

---

## 2. DANH SÁCH & MỤC ĐÍCH TỪNG BẢNG

| Tên bảng (Table) | Mục đích sử dụng | Ràng buộc & Đặc điểm chính |
| :--- | :--- | :--- |
| **`roles`** | Quản lý vai trò người dùng trong hệ thống CMS | Gồm: `admin`, `editor`, `author`, `reader`. |
| **`users`** | Danh sách tài khoản tác giả, biên tập viên, quản trị | `username`, `email` là UNIQUE; lưu thông tin bút danh `display_name` và `avatar_url`. |
| **`categories`** | Danh mục phân loại bài viết | Hỗ trợ chuyên mục lồng nhau (`parent_id`); `slug` là UNIQUE; có `sort_order` sắp xếp. |
| **`tags`** | Danh sách từ khóa (hashtag) bài viết | Dùng cho tìm kiếm bài liên quan, bộ lọc SEO; `slug` là UNIQUE. |
| **`articles`** | Bảng cốt lõi chứa toàn bộ bài viết tin tức | Hỗ trợ 4 trạng thái: `draft`, `pending`, `published`, `archived`; cờ `is_featured`, `is_breaking`; lưu `view_count`, `reading_minutes`, `seo_title`, `published_at`. |
| **`article_tags`** | Bảng nối quan hệ Nhiều - Nhiều ($N-N$) giữa bài viết và thẻ | Khóa chính phức hợp `(article_id, tag_id)` kết hợp `ON DELETE CASCADE`. |
| **`comments`** | Quản lý bình luận của độc giả và phản hồi | Hỗ trợ trả lời lồng nhau đa cấp qua `parent_id`; trạng thái kiểm duyệt `approved`, `pending`, `spam`. |
| **`article_views`** | Ghi nhận chi tiết từng lượt đọc bài viết | Lưu `ip_address`, `user_agent`, `viewed_at` phục vụ chống spam view và phân tích dữ liệu. |
| **`saved_articles`** | Quản lý bài viết đã lưu (Bookmark) của độc giả | Khóa phức hợp duy nhất `UNIQUE(user_id, article_id)`. |
| **`newsletter_subscribers`** | Danh sách email đăng ký nhận bản tin định kỳ | `email` là UNIQUE, có cờ `is_active` bật/tắt nhận thông báo. |

---

## 3. CÁC TRUY VẤN VÀ CHỈ MỤC (INDEXES) QUAN TRỌNG

1. **Truy vấn trang chủ tin tức (`/new`):**
   - Lấy tin nóng: `WHERE is_breaking = TRUE AND status = 'published' ORDER BY published_at DESC` $\rightarrow$ Sử dụng Partial Index `idx_articles_breaking`.
   - Lấy bài nổi bật Hero: `WHERE is_featured = TRUE AND status = 'published' ORDER BY published_at DESC` $\rightarrow$ Sử dụng Partial Index `idx_articles_featured`.
   - Lấy tin đọc nhiều (Trending): `WHERE status = 'published' ORDER BY view_count DESC` $\rightarrow$ Sử dụng Partial Index `idx_articles_trending`.
   - Lấy tin theo thời gian xuất bản: `WHERE status = 'published' ORDER BY published_at DESC` $\rightarrow$ Sử dụng Partial Index `idx_articles_status_published_at`.

2. **Truy vấn trang chi tiết bài viết (`/new/:slug`):**
   - Tìm bài viết theo slug: `WHERE slug = :slug` $\rightarrow$ Sử dụng Unique Index `idx_articles_slug`.
   - Tăng lượt xem bài viết: Chèn bản ghi vào `article_views` và cập nhật `articles.view_count = articles.view_count + 1`.
   - Lấy danh sách bình luận đã duyệt: `WHERE article_id = :article_id AND status = 'approved' ORDER BY parent_id NULLS FIRST, created_at ASC` $\rightarrow$ Sử dụng Index `idx_comments_article_parent`.

3. **Truy vấn trang quản trị tin tức (`/news`):**
   - Lọc bài viết theo tác giả và trạng thái kiểm duyệt: `WHERE author_id = :user_id AND status = :status` $\rightarrow$ Sử dụng Index `idx_articles_author_status`.

