import styles from './Message.module.css';

interface Post {
    id: string;
    user_name: string;
    content: string;
    likes_count: number;
    is_owner?: boolean;
    user_liked?: boolean;
}

interface MessageProps {
    post: Post;
    showDetailButton?: boolean;
    onLike: (postId: string) => void;
    onDelete: (postId: string) => void;
    onDetail: (postId: string) => void;
}

export default function Message({
    post,
    showDetailButton = true,
    onLike,
    onDelete,
    onDetail
}: MessageProps) {
    const handleLike = () => {
        onLike(post.id);
    };

    const handleDelete = () => {
        onDelete(post.id);
    };

    const handleDetail = () => {
        onDetail(post.id);
    };

    return (
        <div className={styles.post}>
            <div className={styles.postHeader}>
                <span className={styles.postUser}>{post.user_name}</span>
                <div className={styles.postActions}>
                    <span 
                        className={`${styles.likeBtn} ${post.user_liked ? styles.liked : ''}`}
                        onClick={handleLike}
                    >
                        <img src="/images/heart.png" alt="いいね" className={styles.actionIcon} />
                        {post.likes_count || 0}
                    </span>
                    {post.is_owner && (
                        <span className={styles.crossBtn} onClick={handleDelete}>
                            <img src="/images/cross.png" alt="削除" className={styles.actionIcon} />
                        </span>
                    )}
                    {showDetailButton && (
                        <span className={styles.detailBtn} onClick={handleDetail}>
                            <img src="/images/detail.png" alt="詳細" className={styles.actionIcon} />
                        </span>
                    )}
                </div>
            </div>
            <p className={styles.postContent}>{post.content}</p>
        </div>
    );
}