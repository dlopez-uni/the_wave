export const AVATARS = [
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'astronaut', emoji: '🧑‍🚀', label: 'Astronauta' },
  { id: 'dolphin', emoji: '🐬', label: 'Delfin' },
  { id: 'fox', emoji: '🦊', label: 'Zorro' },
  { id: 'octopus', emoji: '🐙', label: 'Pulpo' },
  { id: 'rocket', emoji: '🚀', label: 'Cohete' },
  { id: 'wave', emoji: '🌊', label: 'Ola' },
  { id: 'star', emoji: '⭐', label: 'Estrella' },
];

export const getAvatarById = (avatarId) =>
  AVATARS.find((avatar) => avatar.id === avatarId) || AVATARS[0];
