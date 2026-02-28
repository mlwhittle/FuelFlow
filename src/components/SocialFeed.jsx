import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Heart, MessageCircle, Share2, Trophy, TrendingUp, Plus, X, Send, Loader } from 'lucide-react';
import { subscribeToPosts, createPost, toggleLikePost, addComment, subscribeToChallenges, joinChallenge, seedChallenges, getTimeAgo } from '../services/socialService';
import { auth } from '../firebase';
import './SocialFeed.css';

const SocialFeed = () => {
    const { state } = useApp();
    const [posts, setPosts] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState('feed');
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState('general');
    const [isPosting, setIsPosting] = useState(false);
    const [postError, setPostError] = useState('');
    const [commentInputs, setCommentInputs] = useState({});
    const [expandedComments, setExpandedComments] = useState({});
    const [loading, setLoading] = useState(true);

    const currentUser = auth.currentUser;

    // Subscribe to real-time posts and challenges
    useEffect(() => {
        const unsubPosts = subscribeToPosts((newPosts) => {
            setPosts(newPosts);
            setLoading(false);
        });

        const unsubChallenges = subscribeToChallenges((newChallenges) => {
            setChallenges(newChallenges);
        });

        // Seed challenges if none exist
        seedChallenges();

        return () => {
            unsubPosts();
            unsubChallenges();
        };
    }, []);

    // Create new post
    const handleNewPost = async () => {
        if (!newPostContent.trim() || !currentUser) return;

        setIsPosting(true);
        setPostError('');

        const { error } = await createPost(currentUser, newPostContent.trim(), newPostType);

        if (error) {
            setPostError(error);
        } else {
            setNewPostContent('');
            setShowNewPost(false);
        }
        setIsPosting(false);
    };

    // Toggle like
    const handleLike = async (postId) => {
        if (!currentUser) return;
        await toggleLikePost(postId, currentUser.uid);
    };

    // Submit comment
    const handleComment = async (postId) => {
        const text = commentInputs[postId]?.trim();
        if (!text || !currentUser) return;

        await addComment(postId, currentUser, text);
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    };

    // Join challenge
    const handleJoinChallenge = async (challengeId) => {
        await joinChallenge(challengeId);
    };

    const hasLiked = (post) => {
        return currentUser && post.likedBy?.includes(currentUser.uid);
    };

    if (!currentUser) {
        return (
            <div className="social-feed animate-fadeIn">
                <div className="social-header">
                    <h2><Users size={24} /> Community</h2>
                </div>
                <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                    <p style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔒</p>
                    <h3>Sign in to join the community</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Create an account to post, like, and connect with other FuelFlow users.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="social-feed animate-fadeIn">
            <div className="social-header">
                <h2><Users size={24} /> Community</h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowNewPost(true)}>
                    <Plus size={18} /> Post
                </button>
            </div>

            {/* Tabs */}
            <div className="social-tabs">
                <button
                    className={`social-tab ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feed')}
                >
                    <TrendingUp size={18} /> Feed
                </button>
                <button
                    className={`social-tab ${activeTab === 'challenges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('challenges')}
                >
                    <Trophy size={18} /> Challenges
                </button>
            </div>

            {/* New Post Modal */}
            {showNewPost && (
                <div className="card social-new-post" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                        <h3 style={{ margin: 0 }}>Share with the community</h3>
                        <button className="btn btn-icon btn-sm" onClick={() => setShowNewPost(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="post-type-selector" style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                        {[
                            { value: 'general', label: '💬 Update' },
                            { value: 'milestone', label: '🏆 Milestone' },
                            { value: 'progress', label: '📈 Progress' },
                            { value: 'recipe', label: '🍽️ Recipe' },
                            { value: 'fasting', label: '⏱️ Fasting' },
                        ].map(type => (
                            <button
                                key={type.value}
                                className={`btn btn-sm ${newPostType === type.value ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setNewPostType(type.value)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="form-input"
                        rows={3}
                        placeholder="What's on your mind? Share a win, recipe, or progress update..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        style={{ resize: 'vertical', marginBottom: 'var(--space-md)' }}
                    />

                    {postError && (
                        <p style={{ color: 'var(--error)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-sm)' }}>
                            {postError}
                        </p>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleNewPost}
                        disabled={!newPostContent.trim() || isPosting}
                    >
                        {isPosting ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            )}

            {/* Feed */}
            {activeTab === 'feed' && (
                <div className="social-posts">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                            <Loader size={32} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
                            <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)' }}>Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                            <p style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🌟</p>
                            <h3>Be the first to post!</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Share your nutrition journey with the community.</p>
                            <button className="btn btn-primary" onClick={() => setShowNewPost(true)} style={{ marginTop: 'var(--space-md)' }}>
                                <Plus size={18} /> Create First Post
                            </button>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="social-post card">
                                <div className="post-header">
                                    <div className="post-user">
                                        <span className="post-avatar">{post.user?.avatar || '👤'}</span>
                                        <div>
                                            <span className="post-name">{post.user?.name || 'Anonymous'}</span>
                                            <span className="post-time">{getTimeAgo(post.createdAt)}</span>
                                        </div>
                                    </div>
                                    {post.badge && <span className="post-badge">{post.badge}</span>}
                                </div>

                                <p className="post-content">{post.content}</p>

                                <div className="post-actions">
                                    <button
                                        className={`post-action ${hasLiked(post) ? 'liked' : ''}`}
                                        onClick={() => handleLike(post.id)}
                                    >
                                        <Heart size={18} fill={hasLiked(post) ? 'currentColor' : 'none'} />
                                        {post.likes || 0}
                                    </button>
                                    <button
                                        className="post-action"
                                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                    >
                                        <MessageCircle size={18} />
                                        {post.commentCount || 0}
                                    </button>
                                    <button className="post-action" onClick={() => {
                                        navigator.clipboard?.writeText(post.content);
                                    }}>
                                        <Share2 size={18} />
                                    </button>
                                </div>

                                {/* Comments section */}
                                {expandedComments[post.id] && (
                                    <div className="post-comments">
                                        {post.comments?.map(comment => (
                                            <div key={comment.id} className="comment">
                                                <span className="comment-user">{comment.user?.name}</span>
                                                <span className="comment-text">{comment.text}</span>
                                            </div>
                                        ))}
                                        <div className="comment-input-row">
                                            <input
                                                className="form-input"
                                                placeholder="Write a comment..."
                                                value={commentInputs[post.id] || ''}
                                                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                            />
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleComment(post.id)}
                                                disabled={!commentInputs[post.id]?.trim()}
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Challenges */}
            {activeTab === 'challenges' && (
                <div className="social-challenges">
                    {challenges.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                            <Loader size={24} className="animate-spin" />
                            <p>Loading challenges...</p>
                        </div>
                    ) : (
                        challenges.map(challenge => (
                            <div key={challenge.id} className="challenge-card card">
                                <div className="challenge-header">
                                    <span className="challenge-emoji">{challenge.emoji}</span>
                                    <div>
                                        <h4 className="challenge-name">{challenge.name}</h4>
                                        <p className="challenge-desc">{challenge.desc}</p>
                                    </div>
                                </div>
                                <div className="challenge-footer">
                                    <span className="challenge-participants">
                                        <Users size={14} /> {challenge.participants} joined
                                    </span>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleJoinChallenge(challenge.id)}
                                    >
                                        Join
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SocialFeed;
