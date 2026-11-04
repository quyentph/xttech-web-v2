import homeData from './home.json';
import articlesData from './articles.json';

export const CATEGORIES = [
  { id: 'all', name: 'Tất cả', slug: 'tat-ca' },
  { id: 'thi-truong', name: 'Thị trường', slug: 'thi-truong' },
  { id: 'cong-nghe-san-xuat', name: 'Công nghệ sản xuất', slug: 'cong-nghe-san-xuat' },
  { id: 'vat-lieu', name: 'Vật liệu', slug: 'vat-lieu' },
  { id: 'du-an', name: 'Dự án', slug: 'du-an' },
  { id: 'huong-dan-ky-thuat', name: 'Hướng dẫn kỹ thuật', slug: 'huong-dan-ky-thuat' },
];

export const mockArticles = articlesData.data;

export const mockTrendingArticles = homeData.data.trending.map((item, idx) => ({
  rank: item.rank || idx + 1,
  id: String(item.id),
  title: item.title,
  slug: item.slug,
}));

export const mockHomeData = homeData;

export default homeData;
