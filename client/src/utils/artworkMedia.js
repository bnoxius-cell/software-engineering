export const getArtworkMediaType = (artwork) => {
  if (artwork?.mediaType === 'video') {
    return 'video';
  }

  const source = artwork?.image || '';
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(source) ? 'video' : 'image';
};

export const isVideoArtwork = (artwork) => getArtworkMediaType(artwork) === 'video';
