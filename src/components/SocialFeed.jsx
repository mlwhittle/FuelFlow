import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Heart, MessageCircle, Share2, Trophy, TrendingUp, Plus, X, Send } from 'lucide-react';
import './SocialFeed.css';

// Demo community posts
const demoPosts = [
    {
        id: 1,
        user: { name: 'Sarah M.', avatar: '👩‍🦰', level: 'Gold' },
        type: 'milestone',
        content: 'Just hit my 30-day streak of logging every meal! 🔥 Consistency is everything.',
        likes: 45,
        comments: 8,
        timeAgo: '2h ago'
    },
    {
        id: 2,
        user: { name: 'James K.', avatar: '🧔', level: 'Silver' },
        type: 'achievement',
        content: 'Lost 10 lbs this month by tracking macros with FuelFlow! The AI coach suggestions really helped.',
        likes: 92,
        comments: 15,
        timeAgo: '4h ago',
        badge: '🏆 10 lbs lost'
    },
    {
        id: 3,
        user: { name: 'Priya S.', avatar: '👩', level: 'Platinum' },
        type: 'recipe',
        content: 'My go-to high-protein meal prep: Greek yogurt bowl with granola, berries, and honey. 380 cal, 25g protein!',
        likes: 67,
        comments: 22,
        timeAgo: '6h ago'
    },
    {
        id: 4,
        user: { name: 'Mike T.', avatar: '💪', level: 'Gold' },
        type: 'fasting',
        content: 'Completed my first 20:4 fast! The fasting timer made it so easy to track.',
        likes: 34,
        comments: 5,
        timeAgo: '8h ago',
        badge: '⏱️ 20hr fast'
    },
    {
        id: 5,
        user: { name: 'Lisa W.', avatar: '🏃‍♀️', level: 'Bronze' },
        type: 'progress',
        content: 'Week 2 of my weight loss journey! Down 3 lbs and feeling great. The barcode scanner saves me so much time.',
        likes: 56,
        comments: 11,
        timeAgo: '12h ago'
    }
];

const challenges = [
    { id: 1, name: '7-Day Protein Challenge', emoji: '💪', participants: 234, desc: 'Hit your protein goal 7 days straight', progress: 3 },
    { id: 2, name: 'Hydration Hero', emoji: '💧', participants: 189, desc: 'Drink 8 glasses of water daily for a week', progress: 5 },
    { id: 3, name: '16:8 Fasting Week', emoji: '⏱️', participants: 156, desc: 'Complete 7 consecutive 16:8 fasts', progress: 0 },
    { id: 4, name: '1000 Active Calories', emoji: '🔥', participants: 312, desc: 'Burn 1000 exercise calories this week', progress: 0 }
];

const SocialFeed = () => {
    const { user } = useApp();
    const [posts, setPosts] = useState(demoPosts);
    const [likedPosts, setLikedPosts] = useState(new Set());
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [activeTab, setActiveTab] = useState('feed');

    const handleLike = (postId) => {
        setLikedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) {
                next.delete(postId);
            } else {
                next.add(postId);
            }
            return next;
        });
        setPosts(prev =>
            prev.map(p => p.id === postId
                ? { ...p, likes: likedPosts.has(postId) ? p.likes - 1 : p.likes + 1 }
                : p
            )
        );
    };

    const handleNewPost = () => {
        if (!newPostContent.trim()) return;
        const newPost = {
            id: Date.now(),
            user: { name: user.name || 'You', avatar: '😊', level: 'Bronze' },
            type: 'post',
            content: newPostContent,
            likes: 0,
            comments: 0,
            timeAgo: 'Just now'
        };
        setPosts([newPost, ...posts]);
        setNewPostContent('');
        setShowNewPost(false);
    };

    return (
        <div className="social-feed animate-fadeIn">
            <div className="social-header">
                <div>
                    <h1>Community 🌐</h1>
                    <p>Connect with fellow FuelFlow users</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowNewPost(!showNewPost)}>
                    {showNewPost ? <X size={18} /> : <Plus size={18} />}
                    {showNewPost ? 'Cancel' : 'Post'}
                </button>
            </div>

            {/* Tabs */}
            <div className="social-tabs">
                <button
                    className={`social-tab ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feed')}
                >
                    <Users size={16} /> Feed
                </button>
                <button
                    className={`social-tab ${activeTab === 'challenges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('challenges')}
                >
                    <Trophy size={16} /> Challenges
                </button>
                <button
                    className={`social-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('leaderboard')}
                >
                    <TrendingUp size={16} /> Leaderboard
                </button>
            </div>

            {/* New Post */}
            {showNewPost && (
                <div className="new-post card">
                    <textarea
                        className="form-input"
                        placeholder="Share your progress, tips, or achievements..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={3}
                    />
                    <div className="new-post-actions">
                        <button className="btn btn-primary" onClick={handleNewPost} disabled={!newPostContent.trim()}>
                            <Send size={16} /> Share
                        </button>
                    </div>
                </div>
            )}

            {/* Feed */}
            {activeTab === 'feed' && (
                <div className="posts-list">
                    {posts.map(post => (
                        <div key={post.id} className="post-card card">
                            <div className="post-header">
                                <div className="post-user">
                                    <span className="user-avatar">{post.user.avatar}</span>
                                    <div>
                                        <span className="user-name">{post.user.name}</span>
                                        <span className="user-level">{post.user.level}</span>
                                    </div>
                                </div>
                                <span className="post-time">{post.timeAgo}</span>
                            </div>

                            <p className="post-content">{post.content}</p>

                            {post.badge && (
                                <div className="post-badge">{post.badge}</div>
                            )}

                            <div className="post-actions">
                                <button
                                    className={`post-action ${likedPosts.has(post.id) ? 'liked' : ''}`}
                                    onClick={() => handleLike(post.id)}
                                >
                                    <Heart size={18} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                                    {post.likes}
                                </button>
                                <button className="post-action">
                                    <MessageCircle size={18} />
                                    {post.comments}
                                </button>
                                <button className="post-action">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Challenges */}
            {activeTab === 'challenges' && (
                <div className="challenges-list">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="challenge-card card">
                            <div className="challenge-header">
                                <span className="challenge-emoji">{challenge.emoji}</span>
                                <div>
                                    <h4>{challenge.name}</h4>
                                    <p>{challenge.desc}</p>
                                </div>
                            </div>
                            <div className="challenge-stats">
                                <span className="challenge-participants">
                                    <Users size={14} /> {challenge.participants} joined
                                </span>
                                {challenge.progress > 0 ? (
                                    <div className="challenge-progress">
                                        <div className="challenge-bar">
                                            <div className="challenge-fill" style={{ width: `${(challenge.progress / 7) * 100}%` }} />
                                        </div>
                                        <span>{challenge.progress}/7 days</span>
                                    </div>
                                ) : (
                                    <button className="btn btn-outline btn-sm">Join</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Leaderboard */}
            {activeTab === 'leaderboard' && (
                <div className="leaderboard card">
                    <h3>🏆 This Week's Top Loggers</h3>
                    <div className="leaderboard-list">
                        {[
                            { rank: 1, name: 'Sarah M.', avatar: '👩‍🦰', streak: 45, points: 1250 },
                            { rank: 2, name: 'Priya S.', avatar: '👩', streak: 38, points: 1180 },
                            { rank: 3, name: 'James K.', avatar: '🧔', streak: 30, points: 1050 },
                            { rank: 4, name: user.name || 'You', avatar: '😊', streak: 7, points: 350 },
                            { rank: 5, name: 'Mike T.', avatar: '💪', streak: 15, points: 280 },
                        ].map(entry => (
                            <div key={entry.rank} className={`lb-entry ${entry.rank <= 3 ? 'top-3' : ''} ${entry.name === (user.name || 'You') ? 'you' : ''}`}>
                                <span className="lb-rank">
                                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                                </span>
                                <span className="lb-avatar">{entry.avatar}</span>
                                <div className="lb-info">
                                    <span className="lb-name">{entry.name}</span>
                                    <span className="lb-streak">🔥 {entry.streak} day streak</span>
                                </div>
                                <span className="lb-points">{entry.points} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialFeed;
