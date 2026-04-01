import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Heart, MessageCircle, Share2, Trophy, TrendingUp, Plus, X, Send, Loader, ShieldAlert } from 'lucide-react';
import { subscribeToPosts, createPost, toggleLikePost, addComment, subscribeToChallenges, joinChallenge, seedChallenges, getTimeAgo, createWarRoomRequest } from '../services/socialService';
import { getDailyBread, containsUrgentCrisis } from '../services/aiSpiritualService';
import { auth } from '../firebase';
import PageScripture from './PageScripture';
import './SocialFeed.css';

const SocialFeed = () => {
    const { state } = useApp();
    const [posts, setPosts] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [activeTab, setActiveTab] = useState('feed');
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostType, setNewPostType] = useState('general');
    const [isPrivatePrayer, setIsPrivatePrayer] = useState(false);
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

    // Create new post or war room request
    const handleNewPost = async () => {
        if (!newPostContent.trim() || !currentUser) return;

        setIsPosting(true);
        setPostError('');

        if (isPrivatePrayer) {
            // WAR ROOM
            const { error } = await createWarRoomRequest(currentUser, newPostContent.trim());
            if (error) {
                setPostError(error);
            } else {
                setNewPostContent('');
                setShowNewPost(false);
                alert("Your prayer request has been sent securely to Pastor Mel's War Room.");
            }
        } else {
            // PUBLIC POST
            
            // Phase 6: AI Auto-Triage - Scan for crisis keywords before posting to Altar
            if (newPostType === 'prayer') {
                const isCrisis = containsUrgentCrisis(newPostContent.trim());
                if (isCrisis) {
                    // Route a silent duplicate to Pastor Mel's War Room immediately
                    console.warn("CRITICAL: AI Auto-Triage detected pastoral crisis in public prayer string. Escalating heavily to PastorDashboard Inbox...");
                    await createWarRoomRequest(currentUser, `[SYSTEM AUTO-FLAGGED]: ${newPostContent.trim()}`);
                }
            }

            const { id, error } = await createPost(currentUser, newPostContent.trim(), newPostType);
            if (error) {
                setPostError(error);
            } else {
                // Determine if it was a prayer request to trigger AI Shepherd Response
                if (newPostType === 'prayer') {
                    setTimeout(async () => {
                        // AI Shepherd generating a prayer response instantly
                        const response = await getDailyBread(currentUser, { foodLogs: [], exerciseLogs: [] }, 5);
                        await addComment(id, { uid: 'shepherd-ai', displayName: 'Pastor Mel (AI Shepherd)' }, "🙏 " + response.message + "\n\n" + response.scripture);
                    }, 1500); // slight delay for realism
                }
                
                setNewPostContent('');
                setShowNewPost(false);
            }
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
                    <h2><Users size={24} /> Small Group Sanctuary</h2>
                </div>
                <div className="card" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                    <p style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🔒</p>
                    <h3>Sign in to join the Sanctuary</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Create an account to post, encourage, and connect in faith with others.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="social-feed animate-fadeIn">
            <PageScripture 
                verse="Therefore encourage one another and build each other up, just as in fact you are doing."
                reference="1 Thessalonians 5:11"
            />
            <div className="social-header">
                <h2><Users size={24} /> Small Group Sanctuary</h2>
                <button className="btn btn-primary btn-sm" onClick={() => {
                    setNewPostType(activeTab === 'altar' ? 'prayer' : 'general');
                    setIsPrivatePrayer(false);
                    setShowNewPost(true);
                }}>
                    <Plus size={18} /> Post
                </button>
            </div>

            {/* Tabs */}
            <div className="social-tabs">
                <button
                    className={`social-tab ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feed')}
                >
                    <TrendingUp size={18} /> Sanctuary Feed
                </button>
                <button
                    className={`social-tab ${activeTab === 'altar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('altar')}
                >
                    <Heart size={18} /> The Altar (Prayers)
                </button>
                <button
                    className={`social-tab ${activeTab === 'challenges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('challenges')}
                >
                    <Trophy size={18} /> Faith & Goals
                </button>
            </div>

            {/* New Post Modal */}
            {showNewPost && (
                <div className="card social-new-post" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                        <h3 style={{ margin: 0 }}>Share with your small group</h3>
                        <button className="btn btn-icon btn-sm" onClick={() => setShowNewPost(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="post-type-selector" style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
                        {[
                            { value: 'general', label: '💬 Encouragement' },
                            { value: 'prayer', label: '🙏 Prayer Request' },
                            { value: 'scripture', label: '✨ Scripture Share' },
                            { value: 'milestone', label: '🏆 Milestone' },
                            { value: 'progress', label: '📈 Progress' },
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

                    {newPostType === 'prayer' && (
                        <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-sm)', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input 
                                    type="checkbox" 
                                    checked={isPrivatePrayer} 
                                    onChange={(e) => setIsPrivatePrayer(e.target.checked)} 
                                    style={{ accentColor: 'var(--primary-600)' }}
                                />
                                <ShieldAlert size={16} color="var(--primary-600)" />
                                <strong>Keep Private (War Room)</strong>
                            </label>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                                {isPrivatePrayer ? 'Request will bypass the feed and go directly to Pastor Mel.' : 'Request will be posted publicly to The Altar.'}
                            </p>
                        </div>
                    )}

                    <textarea
                        className="form-input"
                        rows={3}
                        placeholder={isPrivatePrayer ? "Share your private burden safely..." : "Share a prayer request, scripture, or progress update..."}
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

            {/* Feed or Altar */}
            {(activeTab === 'feed' || activeTab === 'altar') && (
                <div className="social-posts">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                            <Loader size={32} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
                            <p style={{ marginTop: 'var(--space-md)', color: 'var(--text-secondary)' }}>Loading posts...</p>
                        </div>
                    ) : (
                        (() => {
                            const displayPosts = activeTab === 'altar' ? posts.filter(p => p.type === 'prayer') : posts;
                            
                            if (displayPosts.length === 0) {
                                return (
                                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                                        <p style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🕊️</p>
                                        <h3>Be the first to share</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>
                                            {activeTab === 'altar' ? 'Drop a prayer request here so the community can lift you up.' : 'Share your journey, a prayer, or a verse with your small group.'}
                                        </p>
                                    </div>
                                );
                            }

                            return displayPosts.map(post => (
                                <div key={post.id} className="social-post card" style={post.type === 'prayer' ? { borderLeft: '4px solid var(--primary-500)' } : {}}>
                                    <div className="post-header">
                                        <div className="post-user">
                                            <span className="post-avatar">{post.user?.avatar || '👤'}</span>
                                            <div>
                                                <span className="post-name">{post.user?.name || 'Anonymous'}</span>
                                                <span className="post-time">{getTimeAgo(post.createdAt)}</span>
                                            </div>
                                        </div>
                                        {post.type === 'prayer' && <span className="post-badge" style={{background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-600)'}}>🙏 Prayer Request</span>}
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
                                    </div>

                                    {/* Comments section */}
                                    {expandedComments[post.id] && (
                                        <div className="post-comments">
                                            {post.comments?.map(comment => (
                                                <div key={comment.id} className="comment" style={comment.user?.uid === 'shepherd-ai' ? { background: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid var(--primary-500)' } : {}}>
                                                    <span className="comment-user" style={comment.user?.uid === 'shepherd-ai' ? { color: 'var(--primary-600)' } : {}}>{comment.user?.name}</span>
                                                    <span className="comment-text" style={{ whiteSpace: 'pre-wrap' }}>{comment.text}</span>
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
                            ));
                        })()
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
