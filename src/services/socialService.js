// Social Feed Service — Firestore Backend
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    updateDoc,
    doc,
    increment,
    serverTimestamp,
    getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

const POSTS_COLLECTION = 'socialPosts';
const CHALLENGES_COLLECTION = 'challenges';

/**
 * Subscribe to real-time social posts
 */
export const subscribeToPosts = (callback, maxPosts = 50) => {
    const q = query(
        collection(db, POSTS_COLLECTION),
        orderBy('createdAt', 'desc'),
        limit(maxPosts)
    );

    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        callback(posts);
    }, (error) => {
        console.error('Error subscribing to posts:', error);
        callback([]);
    });
};

/**
 * Create a new social post
 */
export const createPost = async (user, content, type = 'general', badge = null) => {
    try {
        const post = {
            user: {
                name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                avatar: getAvatarEmoji(user.displayName || ''),
                uid: user.uid
            },
            content,
            type,
            badge,
            likes: 0,
            likedBy: [],
            comments: [],
            commentCount: 0,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, POSTS_COLLECTION), post);
        return { id: docRef.id, error: null };
    } catch (error) {
        console.error('Error creating post:', error);
        return { id: null, error: error.message };
    }
};

/**
 * Like a post (toggle)
 */
export const toggleLikePost = async (postId, userId) => {
    try {
        const postRef = doc(db, POSTS_COLLECTION, postId);

        // We need to get the current likedBy array
        const { getDoc: getDocFn } = await import('firebase/firestore');
        const postSnap = await getDocFn(postRef);

        if (!postSnap.exists()) return;

        const postData = postSnap.data();
        const likedBy = postData.likedBy || [];
        const hasLiked = likedBy.includes(userId);

        if (hasLiked) {
            // Unlike
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: likedBy.filter(id => id !== userId)
            });
        } else {
            // Like
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: [...likedBy, userId]
            });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId, user, text) => {
    try {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        const { getDoc: getDocFn, arrayUnion } = await import('firebase/firestore');
        const postSnap = await getDocFn(postRef);

        if (!postSnap.exists()) return;

        const comment = {
            id: `comment-${Date.now()}`,
            user: {
                name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
                uid: user.uid
            },
            text,
            createdAt: new Date().toISOString()
        };

        await updateDoc(postRef, {
            comments: arrayUnion(comment),
            commentCount: increment(1)
        });
    } catch (error) {
        console.error('Error adding comment:', error);
    }
};

/**
 * Subscribe to challenges
 */
export const subscribeToChallenges = (callback) => {
    const q = query(collection(db, CHALLENGES_COLLECTION), orderBy('participants', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const challenges = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(challenges);
    }, (error) => {
        console.error('Error subscribing to challenges:', error);
        // Provide default challenges if Firestore isn't set up yet
        callback(getDefaultChallenges());
    });
};

/**
 * Join a challenge
 */
export const joinChallenge = async (challengeId) => {
    try {
        const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
        await updateDoc(challengeRef, {
            participants: increment(1)
        });
    } catch (error) {
        console.error('Error joining challenge:', error);
    }
};

/**
 * Seed default challenges if none exist
 */
export const seedChallenges = async () => {
    try {
        const snapshot = await getDocs(collection(db, CHALLENGES_COLLECTION));
        if (snapshot.empty) {
            const defaults = getDefaultChallenges();
            for (const challenge of defaults) {
                await addDoc(collection(db, CHALLENGES_COLLECTION), challenge);
            }
        }
    } catch (error) {
        console.error('Error seeding challenges:', error);
    }
};

const getDefaultChallenges = () => [
    { name: '7-Day Protein Challenge', emoji: '💪', participants: 0, desc: 'Hit your protein goal 7 days straight' },
    { name: 'No Sugar Week', emoji: '🚫', participants: 0, desc: 'Avoid added sugar for 7 days' },
    { name: 'Hydration Hero', emoji: '💧', participants: 0, desc: 'Drink 8 glasses of water daily' },
    { name: '1000 Active Calories', emoji: '🔥', participants: 0, desc: 'Burn 1000 exercise calories this week' },
];

/**
 * Get time ago string from date
 */
export const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
};

/**
 * Get avatar emoji from name
 */
const getAvatarEmoji = (name) => {
    const emojis = ['👩‍🦰', '👨‍🦱', '👩', '👨', '🧑', '👩‍🦳', '👨‍🦲', '🏃‍♀️', '🏃', '🧘‍♀️'];
    const index = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % emojis.length;
    return emojis[index];
};
