const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/assets/images/profile_icon.png';
    if (/^https?:\/\//i.test(avatarPath)) return avatarPath;
    if (avatarPath.startsWith('/avatars/')) return `${API_BASE}${avatarPath}`;
    if (avatarPath.startsWith('avatars/')) return `${API_BASE}/${avatarPath}`;
    return avatarPath;
};

export default getAvatarUrl;

