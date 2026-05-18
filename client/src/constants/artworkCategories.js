export const ARTWORK_CATEGORIES = [
  { value: 'digital_2d', label: 'Digital 2D Illustration' },
  { value: '3d_model', label: '3D Modeling & Render' },
  { value: 'traditional', label: 'Traditional Art' },
  { value: 'animation', label: 'Animation / Motion Graphics' },
  { value: 'ui_ux', label: 'UI/UX & Web Design' },
  { value: 'photography', label: 'Photography' },
  { value: 'film', label: 'Film / Short Film' },
  { value: 'music_video', label: 'Music Video' },
  { value: 'video_editing', label: 'Video Editing' },
  { value: 'visual_effects', label: 'Visual Effects' },
  { value: 'game_art', label: 'Game Art' },
  { value: 'concept_art', label: 'Concept Art' },
];

const normalizeKey = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .replace(/[_/-]+/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const CATEGORY_LOOKUP = ARTWORK_CATEGORIES.reduce((acc, category) => {
  acc[category.value] = category.label;
  acc[normalizeKey(category.value)] = category.label;
  acc[normalizeKey(category.label)] = category.label;
  return acc;
}, {});

export const getArtworkCategoryLabel = (value) => {
  if (!value) return 'Uncategorized';
  const rawValue = value.toString();
  return CATEGORY_LOOKUP[rawValue] || CATEGORY_LOOKUP[normalizeKey(rawValue)] || rawValue.replace(/_/g, ' ');
};

export const parseArtworkTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map(tag => tag?.toString().trim()).filter(Boolean);
  }

  return (tags || '')
    .toString()
    .split(/[,#]/)
    .map(tag => tag.trim())
    .filter(Boolean);
};

export const getArtworkCategoryValue = (value) => {
  const normalized = normalizeKey(value);
  const match = ARTWORK_CATEGORIES.find(category =>
    normalizeKey(category.value) === normalized || normalizeKey(category.label) === normalized
  );

  return match?.value || '';
};
