# HỢP ĐỒNG VÀ TÀI LIỆU CHI TIẾT API PHÂN HỆ TIN TỨC & CMS

Tài liệu này quy định chi tiết cách sử dụng các API, tham số đầu vào (Request) và **ý nghĩa toàn bộ các trường dữ liệu trả về (Response Data Fields)** của từng API trong phân hệ Tin tức & Quản trị CMS.

* **Base URL:** `/api/v1`
* **Định dạng dữ liệu:** `application/json`
* **Quy ước đặt tên trường JSON:** `camelCase` cho API Frontend (Backend ánh xạ từ `snake_case` trong cơ sở dữ liệu PostgreSQL).
* **Mã phản hồi HTTP chuẩn:**
  * `200 OK`: Thành công (GET, PUT, DELETE, Action)
  * `201 Created`: Tạo mới bản ghi thành công (POST)
  * `400 Bad Request`: Lỗi dữ liệu không hợp lệ `{ "code": "VALIDATION_ERROR", "message": "..." }`
  * `404 Not Found`: Không tìm thấy bài viết hoặc chuyên mục `{ "code": "NOT_FOUND", "message": "..." }`
  * `500 Internal Server Error`: Lỗi máy chủ

---

## MỤC LỤC
1. [Nhóm 1: API Người đọc (Public)](#1-nhóm-api-công-khai-cho-người-đọc-public)
   - 1.1. [Trang chủ tin tức `GET /home`](#11-lấy-dữ-liệu-trang-chủ-tin-tức-get-home)
   - 1.2. [Danh sách bài viết có lọc & phân trang `GET /articles`](#12-danh-sách-bài-viết-có-lọc--phân-trang-get-articles)
   - 1.3. [Chi tiết bài viết theo Slug `GET /articles/{slug}`](#13-chi-tiết-bài-viết-theo-slug-get-articlesslug)
   - 1.4. [Bài viết liên quan `GET /articles/{slug}/related`](#14-bài-viết-liên-quan-cùng-chuyên-mục-get-articlesslugrelated)
   - 1.5. [Danh sách bình luận đa cấp `GET /articles/{slug}/comments`](#15-danh-sách-bình-luận-đa-cấp-get-articlesslugcomments)
   - 1.6. [Gửi bình luận mới `POST /articles/{slug}/comments`](#16-gửi-bình-luận-mới-post-articlesslugcomments)
   - 1.7. [Tăng lượt xem bài viết `POST /articles/{slug}/view`](#17-ghi-nhận-lượt-xem-bài-viết-post-articlesslugview)
   - 1.8. [Tìm kiếm gợi ý nhanh `GET /search/suggest`](#18-tìm-kiếm-gợi-ý-nhanh-get-searchsuggest)
   - 1.9. [Danh mục & Thẻ bài viết `GET /categories`, `GET /tags`](#19-danh-mục--thẻ-bài-viết-get-categories-get-tags)
   - 1.10. [Đăng ký nhận bản tin email `POST /newsletter/subscribe`](#110-đăng-ký-nhận-bản-tin-email-post-newslettersubscribe)
2. [Nhóm 2: API Quản trị CMS (Admin)](#2-nhóm-api-quản-trị-cms-admin)
   - 2.1. [Danh sách bài viết quản trị `GET /admin/articles`](#21-danh-sách-bài-viết-quản-trị-get-adminarticles)
   - 2.2. [Tạo bài viết mới `POST /admin/articles`](#22-tạo-bài-viết-mới-post-adminarticles)
   - 2.3. [Cập nhật bài viết `PUT /admin/articles/{id}`](#23-cập-nhật-bài-viết-put-adminarticlesid)
   - 2.4. [Xóa bài viết `DELETE /admin/articles/{id}`](#24-xóa-bài-viết-delete-adminarticlesid)
   - 2.5. [Đổi nhanh trạng thái `POST /admin/articles/{id}/publish | archive`](#25-đổi-nhanh-trạng-thái-xuất-bảngỡ-bài)

---

## 1. NHÓM API CÔNG KHAI CHO NGƯỜI ĐỌC (PUBLIC)

### 1.1. Lấy dữ liệu trang chủ tin tức: `GET /home`
* **Mục đích:** Cung cấp toàn bộ dữ liệu cấu trúc cho trang chủ `/new` chỉ trong 1 lần gọi (tránh waterfall request).
* **Hook Frontend tương ứng:** `useHomeNews()` trong `@/hooks/use-news-public`.
* **Tham số (Params):** Không có.

#### Cấu trúc phản hồi (`200 OK`):
```json
{
  "data": {
    "hero": {
      "id": 1,
      "title": "Dây chuyền ép đùn nhôm thế hệ mới giảm 18% phế phẩm",
      "slug": "day-chuyen-ep-dun-nhom-the-he-moi-giam-18-phe-pham",
      "summary": "Hệ thống giám sát nhiệt độ phôi theo thời gian thực giúp thanh nhôm định hình đồng đều hơn.",
      "thumbnailUrl": "https://images.unsplash.com/photo-...",
      "category": { "id": 1, "name": "Công nghệ sản xuất", "slug": "cong-nghe-san-xuat" },
      "author": { "id": 1, "displayName": "Minh Anh", "avatarUrl": null },
      "readingMinutes": 5,
      "publishedAt": "2026-11-02T08:30:00Z"
    },
    "featured": [ /* 3 bài nổi bật phụ bên cạnh hero */ ],
    "hot": [ /* 4 bài xu hướng/lượt xem cao hiển thị dạng thẻ ngang */ ],
    "latest": [ /* 10 bài mới nhất có thời gian tương đối */ ],
    "trending": [
      {
        "id": 5,
        "rank": 1,
        "title": "5 lỗi thường gặp khi lắp cửa nhôm kính và cách tránh",
        "slug": "5-loi-thuong-gap-khi-lap-cua-nhom-kinh-va-cach-tranh",
        "viewCount": 6120,
        "category": { "id": 5, "name": "Hướng dẫn kỹ thuật", "slug": "huong-dan-ky-thuat" }
      }
    ],
    "breaking": [
      {
        "id": 1,
        "title": "Dây chuyền ép đùn nhôm thế hệ mới giảm 18% phế phẩm",
        "slug": "day-chuyen-ep-dun-nhom-the-he-moi-giam-18-phe-pham"
      }
    ],
    "sections": [
      {
        "category": { "id": 1, "name": "Công nghệ sản xuất", "slug": "cong-nghe-san-xuat" },
        "articles": [ /* 2-4 bài trong chuyên mục */ ]
      }
    ]
  }
}
```

#### Bảng ý nghĩa các trường dữ liệu trả về:
| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả ý nghĩa |
| :--- | :--- | :--- | :--- |
| `hero` | `Object` | Có | Bài viết nổi bật số 1 lớn nhất trên cùng trang chủ. |
| `hero.id` | `Number` | Có | ID duy nhất của bài viết. |
| `hero.title` | `String` | Có | Tiêu đề chính của bài viết. |
| `hero.slug` | `String` | Có | Đường dẫn thân thiện SEO (dùng để điều hướng sang `/new/{slug}`). |
| `hero.summary` | `String` | Có | Đoạn mô tả tóm tắt (Sapo). |
| `hero.thumbnailUrl` | `String \| null` | Không | Đường dẫn ảnh đại diện. Nếu `null`, Frontend tự render dải màu chuyên mục. |
| `hero.category` | `Object` | Có | Chuyên mục của bài (`id`, `name`, `slug`). |
| `hero.author` | `Object` | Có | Thông tin tác giả (`id`, `displayName`, `avatarUrl`). |
| `hero.readingMinutes` | `Number` | Có | Ước lượng thời gian đọc bài (phút). |
| `hero.publishedAt` | `String (ISO)` | Có | Thời điểm xuất bản bài viết theo chuẩn ISO 8601. |
| `featured` | `Array<Article>` | Có | Mảng 3 bài viết nổi bật phụ đặt bên cạnh Hero. |
| `hot` | `Array<Article>` | Có | Mảng 4 bài viết Hot (có view cao hoặc cờ `isFeatured = true`), vuốt ngang trên Mobile. |
| `latest` | `Array<Article>` | Có | Mảng danh sách bài viết mới xuất bản gần đây nhất. |
| `trending` | `Array<Object>` | Có | Top 5 bài viết được đọc nhiều nhất, gồm `rank` (thứ tự 1-5) và `viewCount`. |
| `breaking` | `Array<Object>` | Có | Danh sách bài có cờ `isBreaking = true` chạy chữ trên thanh Tin Nóng màu đỏ/cam. |
| `sections` | `Array<Object>` | Có | Các khối tin được gom nhóm theo từng chuyên mục tiêu điểm. |

---

### 1.2. Danh sách bài viết có lọc & phân trang: `GET /articles`
* **Mục đích:** Tìm kiếm từ khóa, lọc theo chuyên mục và phân trang khi xem danh sách.
* **Hook Frontend tương ứng:** `useArticles(params)` trong `@/hooks/use-news-public`.
* **Query Parameters:**
  * `q` *(String, optional)*: Từ khóa tìm kiếm trong tiêu đề hoặc tóm tắt.
  * `category` *(Number | String, optional)*: ID hoặc slug của chuyên mục.
  * `tag` *(Number | String, optional)*: ID hoặc slug của thẻ tag.
  * `sort` *(String, optional)*: Kiểu sắp xếp: `latest` (mới nhất), `views` (lượt đọc cao nhất). Mặc định `latest`.
  * `page` *(Number, optional)*: Số thứ tự trang hiện tại (bắt đầu từ 1, mặc định: 1).
  * `limit` *(Number, optional)*: Số bài viết trên mỗi trang (mặc định: 10).

#### Cấu trúc phản hồi (`200 OK`):
```json
{
  "data": [
    {
      "id": 1,
      "title": "Dây chuyền ép đùn nhôm thế hệ mới...",
      "slug": "day-chuyen-ep-dun-nhom-the-he-moi-giam-18-phe-pham",
      "summary": "Hệ thống giám sát nhiệt độ phôi...",
      "thumbnailUrl": "https://...",
      "category": { "id": 1, "name": "Công nghệ sản xuất", "slug": "cong-nghe-san-xuat" },
      "author": { "id": 1, "displayName": "Minh Anh" },
      "viewCount": 5420,
      "commentCount": 24,
      "readingMinutes": 5,
      "publishedAt": "2026-11-02T08:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Bảng ý nghĩa các trường dữ liệu trả về:
| Trường | Kiểu dữ liệu | Mô tả ý nghĩa |
| :--- | :--- | :--- |
| `data` | `Array<Article>` | Danh sách các bài viết thỏa mãn điều kiện lọc. |
| `meta.page` | `Number` | Trang hiện tại. |
| `meta.limit` | `Number` | Số bài trên 1 trang. |
| `meta.total` | `Number` | Tổng số lượng bài viết tìm thấy. |
| `meta.totalPages` | `Number` | Tổng số trang hiển thị = `ceil(total / limit)`. |

---

### 1.3. Chi tiết bài viết theo Slug: `GET /articles/{slug}`
* **Mục đích:** Hiển thị bài viết chi tiết, nội dung bài, tác giả, thẻ tags trên trang `/new/[slug]`.
* **Hook Frontend tương ứng:** `useArticleDetail(slug)` trong `@/hooks/use-news-public`.
* **Path Variable:** `slug` *(String, required)* - Chuỗi slug nhận dạng bài viết (ví dụ: `nhom-xingfa-chinh-hang`).

#### Cấu trúc phản hồi (`200 OK`):
```json
{
  "data": {
    "id": 1,
    "title": "Dây chuyền ép đùn nhôm thế hệ mới giảm 18% phế phẩm",
    "slug": "day-chuyen-ep-dun-nhom-the-he-moi-giam-18-phe-pham",
    "summary": "Hệ thống giám sát nhiệt độ phôi theo thời gian thực...",
    "content": "<p>Nội dung chi tiết định dạng HTML...</p><p>Đoạn văn tiếp theo...</p>",
    "thumbnailUrl": "https://...",
    "thumbnailAlt": "Dây chuyền ép đùn nhôm hiện đại",
    "status": "published",
    "isFeatured": true,
    "isBreaking": true,
    "viewCount": 5420,
    "commentCount": 24,
    "readingMinutes": 5,
    "publishedAt": "2026-11-02T08:30:00Z",
    "createdAt": "2026-11-01T04:15:00Z",
    "updatedAt": "2026-11-02T08:30:00Z",
    "category": {
      "id": 1,
      "name": "Công nghệ sản xuất",
      "slug": "cong-nghe-san-xuat"
    },
    "author": {
      "id": 1,
      "displayName": "Minh Anh",
      "avatarUrl": "https://...",
      "bio": "Kỹ sư vật liệu nhôm kính hơn 10 năm kinh nghiệm"
    },
    "tags": [
      { "id": 1, "name": "Ép đùn nhôm", "slug": "ep-dun-nhom" },
      { "id": 2, "name": "Công nghệ sản xuất", "slug": "cong-nghe-san-xuat" }
    ]
  }
}
```

#### Bảng ý nghĩa các trường dữ liệu trả về:
| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả ý nghĩa |
| :--- | :--- | :--- | :--- |
| `content` | `String (HTML)` | Có | Nội dung đầy đủ của bài viết (hỗ trợ thẻ HTML `p, h2, h3, img, ul, table`). |
| `thumbnailAlt` | `String \| null` | Không | Thuộc tính alt cho ảnh để hỗ trợ SEO và độc giả khiếm thị. |
| `viewCount` | `Number` | Có | Tổng số lượt đọc bài viết tính đến hiện tại. |
| `commentCount` | `Number` | Có | Tổng số lượt bình luận đã được duyệt. |
| `readingMinutes` | `Number` | Có | Số phút ước tính để đọc xong bài viết. |
| `isBreaking` | `Boolean` | Có | `true` nếu là tin nóng (hiển thị nhãn cam đỏ "Tin nóng"). |
| `tags` | `Array<Tag>` | Có | Danh sách các nhãn tag đính kèm ở chân bài viết. |
| `author.bio` | `String \| null` | Không | Tiểu sử ngắn của tác giả bài viết. |

---

### 1.4. Bài viết liên quan cùng chuyên mục: `GET /articles/{slug}/related`
* **Mục đích:** Hiển thị danh sách 4 bài viết gợi ý dưới chân trang đọc bài.
* **Hook Frontend tương ứng:** `useRelatedArticles(slug)` trong `@/hooks/use-news-public`.
* **Response `200 OK`:** Mảng `Array<Article>` (loại trừ chính bài đang đọc).

---

### 1.5. Danh sách bình luận đa cấp: `GET /articles/{slug}/comments`
* **Mục đích:** Tải toàn bộ bình luận của bài viết, có phân cấp trả lời lồng nhau (`nested replies`).
* **Hook Frontend tương ứng:** `useComments(slug)` trong `@/hooks/use-news-public`.

#### Cấu trúc phản hồi (`200 OK`):
```json
{
  "data": [
    {
      "id": 1,
      "articleId": 1,
      "parentId": null,
      "authorName": "Trần Văn Minh",
      "authorEmail": "minh.tv@example.com",
      "content": "Bài viết rất hữu ích cho các xưởng nhôm kính.",
      "status": "approved",
      "createdAt": "2026-11-03T10:15:00Z",
      "replies": [
        {
          "id": 2,
          "articleId": 1,
          "parentId": 1,
          "authorName": "XTTech Admin",
          "content": "Cảm ơn anh Minh đã quan tâm!",
          "status": "approved",
          "createdAt": "2026-11-03T11:00:00Z"
        }
      ]
    }
  ]
}
```

#### Bảng ý nghĩa các trường dữ liệu trả về:
| Trường | Kiểu dữ liệu | Mô tả ý nghĩa |
| :--- | :--- | :--- |
| `id` | `Number` | Mã định danh duy nhất của bình luận. |
| `parentId` | `Number \| null` | `null` nếu là bình luận gốc; bằng `id` của bình luận cha nếu là câu trả lời (`reply`). |
| `authorName` | `String` | Tên người bình luận hiển thị trên giao diện. |
| `content` | `String` | Nội dung văn bản của bình luận. |
| `status` | `String` | Trạng thái kiểm duyệt: `pending` (chờ duyệt), `approved` (đã duyệt), `spam`. |
| `replies` | `Array<Comment>`| Danh sách các câu trả lời con trực tiếp cho bình luận này. |

---

### 1.6. Gửi bình luận mới: `POST /articles/{slug}/comments`
* **Mục đích:** Cho phép độc giả gửi bình luận hoặc trả lời một bình luận trước đó.
* **Hook Frontend tương ứng:** `useAddComment(slug)` trong `@/hooks/use-news-public`.
* **Request Body:**
```json
{
  "authorName": "Nguyễn Hoàng Nam",
  "authorEmail": "nam.nh@gmail.com",
  "content": "Giá nhôm quý tới dự kiến biến động bao nhiêu phần trăm vậy tác giả?",
  "parentId": 1
}
```
* **Bảng giải thích tham số gửi lên:**
  * `authorName` *(String, required)*: Họ tên độc giả.
  * `authorEmail` *(String, optional)*: Email (không hiển thị công khai).
  * `content` *(String, required)*: Nội dung phản hồi.
  * `parentId` *(Number, optional)*: Bằng `null` nếu bình luận mới, hoặc bằng ID bình luận cha nếu là trả lời.
* **Response `201 Created`:** Trả về đối tượng Comment vừa được tạo thành công.

---

### 1.7. Ghi nhận lượt xem bài viết: `POST /articles/{slug}/view`
* **Mục đích:** Tự động tăng lượt đọc bài viết sau khi độc giả ở lại trang bài viết tối thiểu 4 giây (chống bot spam).
* **Hook Frontend tương ứng:** `useRecordView()` trong `@/hooks/use-news-public`.
* **Response `200 OK`:**
```json
{
  "success": true,
  "viewCount": 5421
}
```

---

### 1.8. Tìm kiếm gợi ý nhanh: `GET /search/suggest`
* **Mục đích:** Trả về danh sách gợi ý tiêu đề bài viết ngay khi người dùng gõ vào thanh Search Header (từ 2 ký tự trở lên).
* **Query Parameters:** `q` *(String, required)* - Chuỗi tìm kiếm.
* **Response `200 OK`:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Dây chuyền ép đùn nhôm thế hệ mới...",
      "slug": "day-chuyen-ep-dun-nhom-the-he-moi-giam-18-phe-pham"
    }
  ]
}
```

---

### 1.9. Danh mục & Thẻ bài viết: `GET /categories`, `GET /tags`
* **Mục đích:** Cung cấp danh sách chuyên mục cho thanh lọc và menu điều hướng.
* **Response `200 OK` (`GET /categories`):**
```json
{
  "data": [
    {
      "id": 1,
      "parentId": null,
      "name": "Công nghệ sản xuất",
      "slug": "cong-nghe-san-xuat",
      "sortOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 1.10. Đăng ký nhận bản tin email: `POST /newsletter/subscribe`
* **Mục đích:** Thu thập email của người dùng từ form đăng ký ở thanh Sidebar hoặc chân trang.
* **Request Body:** `{ "email": "khachhang@gmail.com" }`
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đăng ký nhận bản tin thành công!"
}
```

---

## 2. NHÓM API QUẢN TRỊ CMS (ADMIN)

Toàn bộ các endpoint quản trị đều yêu cầu quyền truy cập của người dùng (`admin` hoặc `editor`).

### 2.1. Danh sách bài viết quản trị: `GET /admin/articles`
* **Mục đích:** Cung cấp dữ liệu trực tiếp cho component bảng dùng chung `TableData` tại trang `/news`.
* **Hỗ trợ phân trang chuẩn:** Nhận cả `page/limit` hoặc `offset/limit`.
* **Query Parameters:**
  * `offset` *(Number, optional)*: Vị trí bắt đầu lấy bản ghi (mặc định: `0`).
  * `limit` *(Number, optional)*: Số lượng bản ghi cần lấy (mặc định: `10`).
  * `status` *(String, optional)*: Lọc theo trạng thái (`all`, `draft`, `pending`, `published`, `archived`).
  * `category` *(Number | String, optional)*: Lọc theo chuyên mục.
  * `q` *(String, optional)*: Tìm kiếm theo tiêu đề hoặc slug.

#### Cấu trúc phản hồi (`200 OK`):
```json
{
  "items": [
    {
      "id": 1,
      "title": "Dây chuyền ép đùn nhôm thế hệ mới giảm 18% phế phẩm",
      "slug": "day-chuyen-ep-dun-nhom-the-he-moi-giam-18-phe-pham",
      "summary": "Hệ thống giám sát nhiệt độ phôi...",
      "thumbnailUrl": null,
      "status": "published",
      "isFeatured": true,
      "isBreaking": true,
      "viewCount": 5420,
      "commentCount": 24,
      "readingMinutes": 5,
      "publishedAt": "2026-11-02T08:30:00Z",
      "createdAt": "2026-11-01T04:15:00Z",
      "category": { "id": 1, "name": "Công nghệ sản xuất", "slug": "cong-nghe-san-xuat" },
      "author": { "id": 1, "displayName": "Ban Biên Tập", "role": "admin" }
    }
  ],
  "meta": {
    "total": 25,
    "offset": 0,
    "limit": 10,
    "next": true
  }
}
```

#### Bảng ý nghĩa các trường dữ liệu trả về:
| Trường | Kiểu dữ liệu | Mô tả ý nghĩa |
| :--- | :--- | :--- |
| `items` | `Array<Article>` | Danh sách các bài viết cho bảng Table. |
| `status` | `String` | Một trong 4 trạng thái: `draft` (Nháp), `pending` (Chờ duyệt), `published` (Đã xuất bản), `archived` (Đã gỡ/lưu trữ). |
| `meta.total` | `Number` | Tổng số lượng bài viết trong hệ thống ứng với bộ lọc. |
| `meta.offset` | `Number` | Vị trí offset hiện tại. |
| `meta.limit` | `Number` | Số bản ghi trên 1 trang do người dùng chọn (10, 20, 50). |
| `meta.next` | `Boolean` | `true` nếu còn dữ liệu ở trang tiếp theo (phục vụ Infinite scroll trên Mobile). |

---

### 2.2. Tạo bài viết mới: `POST /admin/articles`
* **Mục đích:** Thêm bài viết mới từ Modal thêm bài.
* **Hook Frontend tương ứng:** `useCreateArticle()` trong `@/hooks/use-news-admin`.
* **Request Body:**
```json
{
  "title": "Mẫu cửa nhôm Slim kính màu trà được yêu thích năm 2026",
  "slug": "mau-cua-nhom-slim-kinh-mau-tra-duoc-yeu-thich-nam-2026",
  "categoryId": 3,
  "summary": "Tổng hợp các thiết kế cửa nhôm hệ Slim thanh mảnh...",
  "content": "<p>Nội dung chi tiết của bài viết...</p>",
  "thumbnailUrl": null,
  "thumbnailAlt": "Cửa nhôm Slim kính màu trà",
  "isFeatured": true,
  "isBreaking": false,
  "status": "published",
  "tagIds": [1, 5],
  "readingMinutes": 5,
  "seoTitle": "Mẫu cửa nhôm Slim đẹp nhất 2026 | XTTech",
  "seoDescription": "Khám phá các thiết kế cửa nhôm Slim thanh mảnh cao cấp..."
}
```
* **Bảng giải thích tham số gửi lên:**
  * `title` *(String, required)*: Tiêu đề bài viết.
  * `slug` *(String, optional)*: Slug thân thiện SEO. Nếu không gửi, Backend tự động sinh từ `title`.
  * `categoryId` *(Number, required)*: ID chuyên mục trực thuộc.
  * `summary` *(String, required)*: Đoạn sapo tóm tắt.
  * `content` *(String, required)*: Toàn văn bài viết định dạng HTML.
  * `status` *(String, required)*: `draft` hoặc `published`.
  * `tagIds` *(Array<Number>, optional)*: Mảng chứa các ID của tag liên kết.
  * `isFeatured` *(Boolean, optional)*: Đánh dấu bài nổi bật (`true`/`false`).
  * `isBreaking` *(Boolean, optional)*: Đánh dấu tin khẩn cấp/tin nóng (`true`/`false`).
* **Response `201 Created`:** Trả về toàn bộ bản ghi Article vừa được tạo.

---

### 2.3. Cập nhật bài viết: `PUT /admin/articles/{id}`
* **Mục đích:** Sửa đổi thông tin bài viết đã có.
* **Hook Frontend tương ứng:** `useUpdateArticle()` trong `@/hooks/use-news-admin`.
* **Request Body:** Gửi các trường cần cập nhật (tương tự như API Tạo bài viết).
* **Response `200 OK`:** Bản ghi Article sau khi được cập nhật thành công.

---

### 2.4. Xóa bài viết: `DELETE /admin/articles/{id}`
* **Mục đích:** Xóa bài viết vĩnh viễn khỏi cơ sở dữ liệu (tự động xóa các liên kết trong `article_tags`, `comments`, `article_views` theo thiết lập `ON DELETE CASCADE`).
* **Hook Frontend tương ứng:** `useDeleteArticle()` trong `@/hooks/use-news-admin`.
* **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Đã xoá bài viết thành công"
}
```

---

### 2.5. Đổi nhanh trạng thái (Xuất bản / Gỡ bài)
* **Xuất bản bài viết:** `POST /admin/articles/{id}/publish`
  * Đổi `status` thành `published`.
  * Ghi nhận `published_at = CURRENT_TIMESTAMP`.
* **Gỡ bài viết:** `POST /admin/articles/{id}/archive`
  * Đổi `status` thành `archived` (bài viết không còn hiển thị ở trang công khai `/new`).
* **Hook Frontend tương ứng:** `useChangeArticleStatus()` trong `@/hooks/use-news-admin`.
* **Response `200 OK`:** Bản ghi Article với trạng thái mới.

---

## 3. TỔNG KẾT BẢNG ÁNH XẠ THỰC THỂ (DTO MAPPING)

Khi Backend viết câu lệnh SQL để trả dữ liệu cho Frontend, hãy sử dụng bảng ánh xạ sau để khớp đúng 100% kiểu dữ liệu:

| Cột cơ sở dữ liệu (`schema.sql`) | Tên trường JSON API Frontend | Kiểu dữ liệu | Ghi chú |
| :--- | :--- | :--- | :--- |
| `articles.id` | `id` | `number` | Khóa chính |
| `articles.title` | `title` | `string` | Tiêu đề bài |
| `articles.slug` | `slug` | `string` | Slug đường dẫn |
| `articles.summary` | `summary` | `string` | Tóm tắt sapo |
| `articles.content` | `content` | `string (HTML)` | Nội dung đầy đủ |
| `articles.thumbnail_url` | `thumbnailUrl` | `string \| null` | Link ảnh đại diện |
| `articles.thumbnail_alt` | `thumbnailAlt` | `string \| null` | Alt ảnh |
| `articles.status` | `status` | `string` | draft, pending, published, archived |
| `articles.is_featured` | `isFeatured` | `boolean` | Bài nổi bật |
| `articles.is_breaking` | `isBreaking` | `boolean` | Tin nóng chạy chữ |
| `articles.view_count` | `viewCount` | `number` | Số lượt xem |
| `articles.comment_count` | `commentCount` | `number` | Số bình luận |
| `articles.reading_minutes` | `readingMinutes` | `number` | Số phút đọc ước tính |
| `articles.published_at` | `publishedAt` | `string (ISO)` | Thời điểm đăng bài |
| `articles.created_at` | `createdAt` | `string (ISO)` | Thời điểm tạo |
| `categories.name` | `category.name` | `string` | Tên chuyên mục (JOIN) |
| `categories.slug` | `category.slug` | `string` | Slug chuyên mục (JOIN) |
| `users.display_name` | `author.displayName`| `string` | Tên hiển thị tác giả (JOIN) |
| `tags (mảng nối)` | `tags` | `Array<{id, name, slug}>` | Thẻ đính kèm (JOIN qua `article_tags`) |
