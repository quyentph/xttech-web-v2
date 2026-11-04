-- ==============================================================================
-- DATABASE SCHEMA: HỆ THỐNG TIN TỨC & NỘI DUNG (NEWS & CMS)
-- HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU: PostgreSQL (Phiên bản 14+)
-- DỰ ÁN: XTTech Portal & CMS
-- ==============================================================================

-- 1. BẢNG VAI TRÒ NGƯỜI DÙNG (ROLES)
-- Định nghĩa quyền hạn trong hệ thống: admin, editor, author, reader
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,          -- Tên mã vai trò (admin, editor, author, reader)
    display_name VARCHAR(100) NOT NULL,        -- Tên hiển thị (Quản trị viên, Biên tập viên, Tác giả, Độc giả)
    description TEXT,                          -- Mô tả quyền hạn của vai trò
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE roles IS 'Bảng định nghĩa vai trò và phân quyền người dùng trong CMS';
COMMENT ON COLUMN roles.name IS 'Mã định danh vai trò (admin: toàn quyền; editor: duyệt bài/xuất bản; author: viết bài của mình)';

-- 2. BẢNG TÀI KHOẢN NGƯỜI DÙNG (USERS)
-- Người dùng hệ thống: tác giả, biên tập viên, quản trị viên và độc giả
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,        -- Tên bút danh hiển thị trên bài viết
    avatar_url VARCHAR(500),                   -- Đường dẫn ảnh đại diện
    bio TEXT,                                  -- Tiểu sử ngắn của tác giả
    is_active BOOLEAN DEFAULT TRUE NOT NULL,   -- Trạng thái hoạt động tài khoản
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE users IS 'Bảng tài khoản người dùng quản trị và tác giả bài viết';
COMMENT ON COLUMN users.display_name IS 'Bút danh hiển thị công khai tới độc giả';

-- 3. BẢNG CHUYÊN MỤC BÀI VIẾT (CATEGORIES)
-- Chuyên mục phân cấp cha - con (cây chuyên mục)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL, -- Tự tham chiếu để tạo phân cấp cha - con
    name VARCHAR(100) NOT NULL,                                  -- Tên chuyên mục (Thời sự, Công nghệ...)
    slug VARCHAR(120) NOT NULL UNIQUE,                           -- Định danh URL thân thiện
    description TEXT,                                           -- Tóm tắt giới thiệu chuyên mục
    sort_order INT DEFAULT 0 NOT NULL,                          -- Thứ tự hiển thị trên menu/giao diện
    is_active BOOLEAN DEFAULT TRUE NOT NULL,                    -- Bật/tắt hiển thị chuyên mục
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE categories IS 'Bảng chuyên mục bài viết có quan hệ cha - con đệ quy';
COMMENT ON COLUMN categories.parent_id IS 'Khóa ngoại trỏ đến chính bảng categories để xác định chuyên mục cấp trên';

-- 4. BẢNG THẺ BÀI VIẾT (TAGS)
-- Từ khóa gắn thẻ bài viết để phân loại chéo và SEO
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE tags IS 'Bảng danh sách từ khóa (thẻ/hashtags) gắn cho các bài viết';

-- 5. BẢNG BÀI VIẾT CHÍNH (ARTICLES)
-- Chứa thông tin bài viết, trạng thái duyệt và số liệu thống kê
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    author_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(300) NOT NULL,                               -- Tiêu đề bài viết (tối đa 300 ký tự)
    slug VARCHAR(350) NOT NULL UNIQUE,                         -- Slug duy nhất cho đường dẫn /new/:slug
    summary TEXT,                                              -- Đoạn sapo / trích dẫn tóm tắt bài viết
    content TEXT NOT NULL,                                     -- Nội dung đầy đủ (HTML định dạng giàu)
    thumbnail_url VARCHAR(500),                                -- Ảnh đại diện (thumbnail)
    thumbnail_alt VARCHAR(255),                                -- Văn bản thay thế cho ảnh (hỗ trợ SEO & Accessibility)
    status VARCHAR(20) DEFAULT 'draft' NOT NULL                -- Trạng thái vòng đời bài viết
        CHECK (status IN ('draft', 'pending', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,                -- Đánh dấu bài viết nổi bật (Hero/Top)
    is_breaking BOOLEAN DEFAULT FALSE NOT NULL,                -- Đánh dấu tin nóng khẩn cấp (Breaking bar)
    view_count INT DEFAULT 0 NOT NULL,                         -- Tổng lượt xem tích lũy
    comment_count INT DEFAULT 0 NOT NULL,                      -- Tổng số bình luận đã duyệt
    reading_minutes INT DEFAULT 1 NOT NULL,                    -- Thời gian ước tính đọc xong bài (phút)
    seo_title VARCHAR(255),                                    -- Tiêu đề tối ưu thẻ meta SEO
    seo_description TEXT,                                      -- Mô tả tối ưu thẻ meta SEO
    published_at TIMESTAMPTZ,                                  -- Thời điểm bài viết được chính thức xuất bản
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE articles IS 'Bảng bài viết tin tức trung tâm của hệ thống';
COMMENT ON COLUMN articles.status IS 'Trạng thái: draft (nháp), pending (chờ duyệt), published (đã xuất bản), archived (đã lưu trữ/gỡ)';
COMMENT ON COLUMN articles.is_featured IS 'True nếu bài viết được chọn hiển thị khối Hero hoặc Tin hot';
COMMENT ON COLUMN articles.is_breaking IS 'True nếu bài viết được ghim vào thanh chạy tin nóng trên cùng';

-- 6. BẢNG NỐI BÀI VIẾT - THẺ (ARTICLE_TAGS)
-- Quan hệ nhiều - nhiều giữa bài viết và thẻ
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (article_id, tag_id)
);

COMMENT ON TABLE article_tags IS 'Bảng trung gian liên kết n - n giữa bài viết và thẻ tag';

-- 7. BẢNG BÌNH LUẬN (COMMENTS)
-- Bình luận đa cấp (hỗ trợ trả lời lồng nhau parent_id)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,       -- NULL nếu người dùng bình luận ẩn danh
    parent_id INT REFERENCES comments(id) ON DELETE CASCADE,   -- Khóa ngoại tự tham chiếu để hỗ trợ reply lồng nhau
    author_name VARCHAR(100) NOT NULL,                         -- Tên người bình luận
    author_email VARCHAR(255),                                 -- Email liên hệ của người bình luận
    content TEXT NOT NULL,                                     -- Nội dung bình luận
    status VARCHAR(20) DEFAULT 'approved' NOT NULL             -- Kiểm duyệt bình luận
        CHECK (status IN ('pending', 'approved', 'spam', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE comments IS 'Bảng bình luận bài viết có cấu trúc trả lời dạng cây (nested replies)';

-- 8. BẢNG LỊCH SỬ LƯỢT XEM BÀI VIẾT (ARTICLE_VIEWS)
-- Ghi nhận chi tiết từng lượt xem phục vụ phân tích và chống spam view
CREATE TABLE IF NOT EXISTS article_views (
    id BIGSERIAL PRIMARY KEY,
    article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),                                    -- Địa chỉ IP (hỗ trợ cả IPv4 và IPv6)
    user_agent TEXT,                                           -- Trình duyệt & thiết bị
    viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

COMMENT ON TABLE article_views IS 'Nhật ký truy vết lượt đọc bài viết theo thời gian';

-- 9. BẢNG BÀI VIẾT ĐÃ LƯU (SAVED_ARTICLES)
-- Độc giả lưu bài viết để đọc lại sau
CREATE TABLE IF NOT EXISTS saved_articles (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id INT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_saved_article UNIQUE (user_id, article_id)
);

COMMENT ON TABLE saved_articles IS 'Danh sách bài viết được đánh dấu / lưu trữ cá nhân của độc giả';

-- 10. BẢNG ĐĂNG KÝ BẢN TIN (NEWSLETTER_SUBSCRIBERS)
-- Lưu email độc giả đăng ký nhận tin tức định kỳ
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,                   -- Trạng thái đang nhận tin hay đã hủy đăng ký
    subscribed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    unsubscribed_at TIMESTAMPTZ
);

COMMENT ON TABLE newsletter_subscribers IS 'Danh sách email đăng ký nhận bản tin định kỳ';

-- ==============================================================================
-- TỐI ƯU HÓA CHỈ MỤC TRUY VẤN (INDEXES)
-- ==============================================================================

-- Index phục vụ truy vấn danh sách bài viết công khai theo trạng thái và thời gian xuất bản
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at
    ON articles (status, published_at DESC)
    WHERE status = 'published';

-- Index phục vụ lọc bài viết theo chuyên mục
CREATE INDEX IF NOT EXISTS idx_articles_category_status
    ON articles (category_id, status, published_at DESC);

-- Index phục vụ lọc bài viết của tác giả trong CMS
CREATE INDEX IF NOT EXISTS idx_articles_author_status
    ON articles (author_id, status);

-- Index tra cứu nhanh bài viết theo slug
CREATE INDEX IF NOT EXISTS idx_articles_slug
    ON articles (slug);

-- Index phục vụ khối tin nóng (Breaking News)
CREATE INDEX IF NOT EXISTS idx_articles_breaking
    ON articles (is_breaking, published_at DESC)
    WHERE is_breaking = TRUE AND status = 'published';

-- Index phục vụ khối tin nổi bật (Hero / Featured)
CREATE INDEX IF NOT EXISTS idx_articles_featured
    ON articles (is_featured, published_at DESC)
    WHERE is_featured = TRUE AND status = 'published';

-- Index phục vụ danh sách đọc nhiều nhất (Trending / Most Read)
CREATE INDEX IF NOT EXISTS idx_articles_trending
    ON articles (view_count DESC, published_at DESC)
    WHERE status = 'published';

-- Index hỗ trợ tìm kiếm theo tiêu đề (B-tree chuẩn, có thể dùng pg_trgm nếu cần fuzzy search)
CREATE INDEX IF NOT EXISTS idx_articles_title
    ON articles (title);

-- Index phục vụ danh mục cha - con
CREATE INDEX IF NOT EXISTS idx_categories_parent
    ON categories (parent_id);

-- Index phục vụ lấy bình luận của bài viết theo cấp cha - con
CREATE INDEX IF NOT EXISTS idx_comments_article_parent
    ON comments (article_id, parent_id, created_at ASC);

-- Index phục vụ tra cứu bài đã lưu của người dùng
CREATE INDEX IF NOT EXISTS idx_saved_articles_user
    ON saved_articles (user_id, created_at DESC);

-- Index kiểm tra email nhận bản tin
CREATE INDEX IF NOT EXISTS idx_newsletter_email
    ON newsletter_subscribers (email);

-- ==============================================================================
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA CHO CATEGORIES, TAGS, ROLES, USERS)
-- ==============================================================================

-- 1. Chèn vai trò người dùng
INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'admin', 'Quản trị viên', 'Toàn quyền quản trị hệ thống, quản lý tài khoản và cấu hình.'),
(2, 'editor', 'Biên tập viên', 'Có quyền duyệt bài, xuất bản bài, gỡ bài và chỉnh sửa nội dung.'),
(3, 'author', 'Tác giả', 'Chỉ có quyền tạo, sửa và quản lý bài viết do chính mình viết.'),
(4, 'reader', 'Độc giả', 'Đọc bài, bình luận và lưu các bài viết yêu thích.')
ON CONFLICT (id) DO NOTHING;

-- 2. Chèn 7 chuyên mục cốt lõi (có chuyên mục cha - con)
INSERT INTO categories (id, parent_id, name, slug, description, sort_order) VALUES
(1, NULL, 'Thời sự', 'thoi-su', 'Tin tức sự kiện thời sự, chính sách và tiêu chuẩn ngành', 1),
(2, NULL, 'Thế giới', 'the-gioi', 'Tin tức thị trường quốc tế, xu hướng kiến trúc toàn cầu', 2),
(3, NULL, 'Kinh doanh', 'kinh-doanh', 'Thị trường vật liệu, giá nhôm kính, dự toán và đầu tư', 3),
(4, NULL, 'Công nghệ', 'cong-nghe', 'Công nghệ sản xuất, máy móc CNC, phần mềm chuyển đổi số XTTech', 4),
(5, NULL, 'Thể thao', 'the-thao', 'Hoạt động thể thao, phong trào giao lưu văn hóa doanh nghiệp', 5),
(6, NULL, 'Giải trí', 'giai-tri', 'Không gian sống đẹp, thiết kế showroom sáng tạo và giải trí', 6),
(7, NULL, 'Đời sống', 'doi-song', 'Đời sống công nhân xưởng, cẩm nang nhà đẹp, an toàn lao động', 7),
(8, 4, 'Công nghệ sản xuất', 'cong-nghe-san-xuat', 'Quy trình đùn ép, máy cắt laser, bóc tách kỹ thuật tự động', 8),
(9, 3, 'Vật liệu xây dựng', 'vat-lieu', 'Kính an toàn, profile nhôm định hình, phụ kiện rãnh C', 9)
ON CONFLICT (id) DO NOTHING;

-- 3. Chèn các thẻ (tags) phổ biến
INSERT INTO tags (id, name, slug, description) VALUES
(1, 'Nhôm Xingfa', 'nhom-xingfa', 'Các thông tin và kỹ thuật liên quan đến nhôm Xingfa hệ 55, 93'),
(2, 'Kính Low-E', 'kinh-low-e', 'Kính cản nhiệt tiết kiệm năng lượng cho tòa nhà cao tầng'),
(3, 'Bóc tách tự động', 'boc-tach-tu-dong', 'Giải pháp bóc tách khối lượng và dự toán nhôm kính trên XTTech'),
(4, 'Tối ưu cắt nhôm', 'toi-uu-cat-nhom', 'Thuật toán sắp xếp thanh nhôm giảm hao hụt dưới 2%'),
(5, 'Curtain Wall', 'curtain-wall', 'Hệ mặt dựng nhôm kính tòa nhà văn phòng và trung tâm thương mại'),
(6, 'Phụ kiện rãnh C', 'phu-kien-ranh-c', 'Hệ phụ kiện tiêu chuẩn Châu Âu Sobinco, Cmech, Sigico'),
(7, 'Chuyển đổi số', 'chuyen-doi-so', 'Ứng dụng phần mềm trong quản trị xưởng và thi công công trình'),
(8, 'An toàn lao động', 'an-toan-lao-dong', 'Quy chuẩn an toàn khi lắp dựng kính và thi công trên cao')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence khóa chính PostgreSQL
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));

