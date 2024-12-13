export const BASIC_TAGS = [
    { id: 1, name: 'food', label: 'Cooking' },
    { id: 2, name: 'travel', label: 'Travel' },
    { id: 3, name: 'tech', label: 'Technology' },
    { id: 4, name: 'art', label: 'Art' },
    { id: 5, name: 'music', label: 'Music' },
    { id: 6, name: 'gaming', label: 'Games' },
    { id: 7, name: 'nature', label: 'Nature' },
    { id: 8, name: 'books', label: 'Books' },
    { id: 9, name: 'fitness', label: 'Fitness' },
    { id: 10, name: 'pets', label: 'Pets' }
];


export const isValidTag = (tag) => {
    return tag.length <= 30 && /^[a-zA-Z0-9_]+$/.test(tag);
};

export const formatTag = (tag) => {
    return tag.toLowerCase().replace(/\s+/g, '_');
};