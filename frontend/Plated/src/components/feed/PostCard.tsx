import type { FeedPost } from '../../types';

interface Props {
  post: FeedPost;
}

export default function PostCard({ post }: Props) {
  return (
    <article style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
      <h3 style={{ margin: 0 }}>{post.title}</h3>
      {post.image_url && (
        <img src={post.image_url} alt={post.title} style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
      )}
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        ❤️ {post.likes} · 💬 {post.comments_count}
      </div>
    </article>
  );
}


