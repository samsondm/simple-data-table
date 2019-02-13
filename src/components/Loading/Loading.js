import React from 'react';
import './Loading.scss';

const Loading = ({ isLoading, isError, hasLoaded, children }) => {
  return !isLoading && !isError && !hasLoaded ? null : (
    <div className="loading">
      {isLoading ? 'Loading...' : isError ? 'Loading error!' : children}
    </div>
  );
};

export default Loading;
